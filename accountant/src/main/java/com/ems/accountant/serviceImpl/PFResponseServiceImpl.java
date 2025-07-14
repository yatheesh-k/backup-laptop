package com.ems.accountant.serviceImpl;

import com.ems.accountant.common.ResponseBuilder;
import com.ems.accountant.dao.PFResponseDao;
import com.ems.accountant.elasticSearch.OpenSearchOperations;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.exception.ErrorMessageHandler;
import com.ems.accountant.exception.ErrorMessageKey;
import com.ems.accountant.persistance.CompanyEntity;
import com.ems.accountant.persistance.PFResponseEntity;
import com.ems.accountant.request.PFResponseRequest;
import com.ems.accountant.request.PFResponseUpdateRequest;
import com.ems.accountant.service.PFResponseService;
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
public class PFResponseServiceImpl implements PFResponseService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PFResponseDao pfResponseDao;

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> addPFResponse(String companyName, PFResponseRequest responseRequest) throws AccountantException {
        log.debug("validating company existence for companyName {}", companyName);
        String resourceId = ResourceIdUtils.generatePFResponseResourceId(companyName, responseRequest.getMonth(), responseRequest.getYear());
        CompanyEntity companyEntity;
        PFResponseEntity pfResponseEntity;
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
            pfResponseEntity = pfResponseDao.get(resourceId, companyName).orElse(null);
            if (pfResponseEntity != null) {
                log.error("PF Response for month {} and year {} already exists for company {}", responseRequest.getMonth(), responseRequest.getYear(), companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.PF_RESPONSE_ALREADY_EXISTS),
                        HttpStatus.CONFLICT);
            }
            PFResponseEntity pfResponse = objectMapper.convertValue(responseRequest, PFResponseEntity.class);
            pfResponse.setId(resourceId);
            pfResponse.setCompanyId(companyEntity.getId());
            pfResponse.setType(Constants.PF_RESPONSE);
            pfResponseDao.save(pfResponse, companyName);
        } catch (AccountantException accountantException) {
            log.error("Error while saving PF response: {}", accountantException.getMessage());
            throw accountantException;
        } catch (Exception e) {
            log.error("Unable to save PF response for month {} and year {} due to {}", responseRequest.getMonth(), responseRequest.getYear(), e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_PF_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public Collection<PFResponseEntity> getPFResponse(String companyName, String pfResponseId, String month, String year){
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching company details for companyName: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Getting PF response for company {} with ID {} for month {} and year {}", companyName, pfResponseId, month, year);
            Collection<PFResponseEntity> candidateEntities = pfResponseDao.getPFResponse(companyName, companyEntity.getId(), pfResponseId, month, year);
            return candidateEntities;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<?> updatePFResponse(String companyName, String pfResponseId, PFResponseUpdateRequest updateRequest) throws AccountantException {
        PFResponseEntity pfResponseEntity;
        log.debug("Validating company existence for companyName {}", companyName);
        try {
            pfResponseEntity = this.pfResponseDao.get(pfResponseId, companyName).orElse(null);
            if (pfResponseEntity == null) {
                log.error("PF Response with ID {} not found for company {}", pfResponseId, companyName);
                throw new AccountantException(String.format(ErrorMessageHandler.getMessage(ErrorMessageKey.PF_RESPONSE_NOT_FOUND), companyName), HttpStatus.NOT_FOUND);
            }
        } catch (AccountantException e) {
            log.error("Unable to fetch PF Response with ID {} for company {} due to {}", pfResponseId, companyName, e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_FETCH_PF_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try {
            if ((updateRequest.getInvalidPFAmounts() .equals(pfResponseEntity.getInvalidPFAmounts()))
                    && (updateRequest.getIgnoredCompanyEmployees().equals(pfResponseEntity.getIgnoredCompanyEmployees()))) {
                log.warn("No changes detected in PF Response with ID {} for company {}", pfResponseId, companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.NO_CHANGES_DETECTED), HttpStatus.NOT_MODIFIED);
            }

            PFResponseEntity updatedData = objectMapper.convertValue(updateRequest, PFResponseEntity.class);
            BeanUtils.copyProperties(updatedData, pfResponseEntity, getNullPropertyNames(updatedData));
            pfResponseDao.save(pfResponseEntity, companyName);
        } catch (AccountantException ex) {
            log.error("Unable to update PF Response with ID {} for company {} due to {}", pfResponseId, companyName, ex.getMessage());
            throw ex;
        } catch (Exception e) {
            log.error("Unable to update PF Response with ID {} for company {} due to {}", pfResponseId, companyName, e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_UPDATE_PF_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }


    @Override
    public void deletePFResponseById(String companyName, String responseId) throws AccountantException, IOException {
        try {
            PFResponseEntity pfResponseEntity = this.getPFResponse(companyName, responseId, null, null)
                    .stream()
                    .findFirst()
                    .orElse(null);
            pfResponseDao.delete(responseId, companyName);
            log.info("Successfully deleted PF Response with ID {} for company {}", responseId, companyName);
        } catch (AccountantException accountantException) {
            log.error("Error while deleting PF Response with ID {} for company {}: {}", responseId, companyName, accountantException.getMessage());
            throw accountantException;
        } catch (Exception exception) {
            log.error("Unexpected error while deleting PF Response with ID {} for company {}: {}", responseId, companyName, exception.getMessage());
            throw new AccountantException(
                    ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_DELETE_PF_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR
            );
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
