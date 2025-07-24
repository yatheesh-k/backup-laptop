package com.ems.taxConsultant.serviceImpl;


import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.dao.PTResponseDao;
import com.ems.taxConsultant.elasticSearch.OpenSearchOperations;
import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.CompanyEntity;
import com.ems.taxConsultant.persistance.PTResponseEntity;
import com.ems.taxConsultant.request.PTResponseRequest;
import com.ems.taxConsultant.request.PTResponseUpdateRequest;
import com.ems.taxConsultant.service.PTResponseService;
import com.ems.taxConsultant.utils.Constants;
import com.ems.taxConsultant.utils.ResourceIdUtils;
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
import java.util.Collection;
import java.util.stream.Stream;

@Service
@Slf4j
public class PTResponseServiceImpl implements PTResponseService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PTResponseDao ptResponseDao;

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> addPTResponse(String companyName, PTResponseRequest responseRequest) throws TaxConsultantException {

        log.debug("validating company existence for companyName {}", companyName);
        String resourceId = ResourceIdUtils.generatePTResponseResourceId(companyName, responseRequest.getMonth(), responseRequest.getYear());
        CompanyEntity companyEntity;
        PTResponseEntity ptResponseEntity;
        try {
            companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found with name {}", companyName);
                throw new TaxConsultantException("Company not found", HttpStatus.NOT_FOUND);
            }
        } catch (TaxConsultantException taxConsultantException) {
            log.error("Error while fetching company details: {}", taxConsultantException.getMessage());
            throw taxConsultantException;
        }
        try {
            ptResponseEntity = ptResponseDao.get(resourceId, companyName).orElse(null);
            if (ptResponseEntity != null) {
                log.error("PT Response for month {} and year {} already exists for company {}", responseRequest.getMonth(), responseRequest.getYear(), companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.PT_RESPONSE_ALREADY_EXISTS),
                        HttpStatus.CONFLICT);
            }
            PTResponseEntity ptResponse = objectMapper.convertValue(responseRequest, PTResponseEntity.class);
            ptResponse.setId(resourceId);
            ptResponse.setCompanyId(companyEntity.getId());
            ptResponse.setType(Constants.PT_RESPONSE);
            ptResponseDao.save(ptResponse, companyName);
        } catch (TaxConsultantException taxConsultantException) {
            log.error("Error while saving PT response: {}", taxConsultantException.getMessage());
            throw taxConsultantException;
        } catch (Exception e) {
            log.error("Unable to save PT response for month {} and year {} due to {}", responseRequest.getMonth(), responseRequest.getYear(), e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_PT_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public Collection<PTResponseEntity> getPTResponse(String companyName, String ptResponseId, String month, String year) {
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching company details for companyName: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Getting PT response for company {} with ID {} for month {} and year {}", companyName, ptResponseId, month, year);
            Collection<PTResponseEntity> candidateEntities = ptResponseDao.getPTResponse(companyName, companyEntity.getId(), ptResponseId, month, year);
            return candidateEntities;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }

    @Override
    public ResponseEntity<?> updatePTResponse(String companyName, String ptResponseId, PTResponseUpdateRequest updateRequest) throws TaxConsultantException {
        PTResponseEntity ptResponseEntity;
        log.debug("Validating company existence for companyName {}", companyName);
        try {
            ptResponseEntity = this.ptResponseDao.get(ptResponseId, companyName).orElse(null);
            if (ptResponseEntity == null) {
                log.error("PT Response with ID {} not found for company {}", ptResponseId, companyName);
                throw new TaxConsultantException(String.format(ErrorMessageHandler.getMessage(ErrorMessageKey.PT_RESPONSE_NOT_FOUND), companyName), HttpStatus.NOT_FOUND);
            }
        } catch (TaxConsultantException e) {
            log.error("Unable to fetch PT Response with ID {} for company {} due to {}", ptResponseId, companyName, e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_FETCH_PT_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try {
            if ((updateRequest.getInvalidPTAmounts() .equals(ptResponseEntity.getInvalidPTAmounts()))
                    && (updateRequest.getIgnoredCompanyEmployees().equals(ptResponseEntity.getIgnoredCompanyEmployees()))) {
                log.warn("No changes detected in PT Response with ID {} for company {}", ptResponseId, companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.NO_CHANGES_DETECTED), HttpStatus.NOT_MODIFIED);
            }

            PTResponseEntity updatedData = objectMapper.convertValue(updateRequest, PTResponseEntity.class);
            BeanUtils.copyProperties(updatedData, ptResponseEntity, getNullPropertyNames(updatedData));
            ptResponseDao.save(ptResponseEntity, companyName);
        } catch (TaxConsultantException ex) {
            log.error("Unable to update PT Response with ID {} for company {} due to {}", ptResponseId, companyName, ex.getMessage());
            throw ex;
        } catch (Exception e) {
            log.error("Unable to update PT Response with ID {} for company {} due to {}", ptResponseId, companyName, e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_UPDATE_PT_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public void deletePTResponseById(String companyName, String responseId) throws TaxConsultantException {
        try {
            PTResponseEntity ptResponseEntity = this.getPTResponse(companyName, responseId, null, null)
                    .stream()
                    .findFirst()
                    .orElse(null);
            ptResponseDao.delete(responseId, companyName);
            log.info("Successfully deleted PT Response with ID {} for company {}", responseId, companyName);
        } catch (TaxConsultantException taxConsultantException) {
            log.error("Error while deleting PT Response with ID {} for company {}: {}", responseId, companyName, taxConsultantException.getMessage());
            throw taxConsultantException;
        } catch (Exception exception) {
            log.error("Unexpected error while deleting PT Response with ID {} for company {}: {}", responseId, companyName, exception.getMessage());
            throw new TaxConsultantException(
                    ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_DELETE_PT_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR
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
