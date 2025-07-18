package com.ems.accountant.serviceImpl;

import com.ems.accountant.common.ResponseBuilder;
import com.ems.accountant.dao.DueDatesDao;
import com.ems.accountant.elasticSearch.OpenSearchOperations;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.exception.ErrorMessageHandler;
import com.ems.accountant.exception.ErrorMessageKey;
import com.ems.accountant.persistance.CompanyEntity;
import com.ems.accountant.persistance.DueDatesEntity;
import com.ems.accountant.request.DueDatesRequest;
import com.ems.accountant.service.DueDatesService;
import com.ems.accountant.utils.Constants;
import com.ems.accountant.utils.ResourceIdUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.beans.PropertyDescriptor;
import java.io.IOException;
import java.util.Collection;
import java.util.stream.Stream;

@Service
@Slf4j
public class DueDatesServiceImpl implements DueDatesService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DueDatesDao dao;

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> addDueDates(String companyName, DueDatesRequest request) throws AccountantException {
        log.debug("validating company existence for companyName {}", companyName);
        CompanyEntity companyEntity;
        DueDatesEntity datesEntity;
        try {
            companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found with name {}", companyName);
                throw new AccountantException("Company not found", HttpStatus.NOT_FOUND);
            }
        } catch (AccountantException accountantException) {
            log.error("Error while fetching company details: {}", accountantException.getMessage());
            throw accountantException;
        }
        try {
            String resourceId = ResourceIdUtils.generateDueDatesResourceId(companyEntity.getId());

            datesEntity = dao.get(resourceId, companyName).orElse(null);
            if (datesEntity != null) {
                log.error("Due dates already exist for company {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.DUE_DATES_ALREADY_EXIST), HttpStatus.CONFLICT);
            }
            DueDatesEntity dueDates = objectMapper.convertValue(request, DueDatesEntity.class);
            dueDates.setId(resourceId);
            dueDates.setCompanyId(companyEntity.getId());
            dueDates.setType(Constants.DUE_DATES);
            dao.save(dueDates, companyName);
        } catch (AccountantException accountantException) {
            log.error("Error while saving due dates for company {}: {}", companyName, accountantException.getMessage());
            throw accountantException;
        } catch (Exception e) {
            log.error("Unable to save due dates for company {} due to {}", companyName, e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_DUE_DATES), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public Collection<DueDatesEntity> getDueDates(String companyName, String id){
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching company details for companyName: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Getting due dates for companyName: {}, companyId: {}, id: {}", companyName, companyEntity.getId(), id);
            return dao.getDueDate(companyName, companyEntity.getId(), id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<?> updateDueDates(String companyName, String id, DueDatesRequest updateRequest) throws AccountantException {
        DueDatesEntity datesEntity;
        log.debug("Validating company existence for companyName {}", companyName);
        try {
            datesEntity = this.getDueDates(companyName, id)
                    .stream()
                    .findFirst()
                    .orElse(null);
            if (datesEntity == null) {
                log.error("Due dates not found for company {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.DUE_DATES_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
        } catch (AccountantException e) {
            log.error("Unable to fetch due dates for company {} due to {}", companyName, e.getMessage());
            throw e;
        }
        try {
            if ((updateRequest.getGstDay() .equals(datesEntity.getGstDay()))
                    && (updateRequest.getPtDay().equals(datesEntity.getPtDay()))
                    &&(updateRequest.getPfDay().equals(datesEntity.getPfDay()))
                    &&(updateRequest.getTdsDay().equals(datesEntity.getTdsDay()))) {
                log.warn("No changes detected in the update request for due dates for company {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.NO_CHANGES_DETECTED), HttpStatus.NOT_MODIFIED);
            }

            DueDatesEntity updatedData = objectMapper.convertValue(updateRequest, DueDatesEntity.class);
            BeanUtils.copyProperties(updatedData, datesEntity, getNullPropertyNames(updatedData));
            dao.save(datesEntity, companyName);
        } catch (AccountantException ex) {
            log.error("Unable to update due dates for company {} due to {}", companyName, ex.getMessage());
            throw ex;
        } catch (Exception e) {
            log.error("Unable to update due dates for company {} due to {}", companyName, e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_UPDATE_DUE_DATES), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }


    @Override
    public void deleteDueDatesById(String companyName, String id) throws AccountantException, IOException {
        try {
            DueDatesEntity dueDatesEntity = this.getDueDates(companyName, id)
                    .stream()
                    .findFirst()
                    .orElse(null);
            dao.delete(id, companyName);
            log.info("Successfully deleted Due Dates with ID {} for company {}", id, companyName);
        } catch (AccountantException accountantException) {
            log.error("Error while deleting Due Dates with ID {} for company {}: {}", id, companyName, accountantException.getMessage());
            throw accountantException;
        } catch (Exception exception) {
            log.error("Unexpected error while deleting Due Dates with ID {} for company {}: {}", id, companyName, exception.getMessage());
            throw new AccountantException(
                    ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_DELETE_DUE_DATES), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    public String[] getNullPropertyNames(Object source) {
        BeanWrapper src = new BeanWrapperImpl(source);
        return Stream.of(src.getPropertyDescriptors())
                .map(PropertyDescriptor::getName)
                .filter(name -> src.getPropertyValue(name) == null)
                .toArray(String[]::new);
    }


}
