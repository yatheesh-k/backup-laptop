package com.ems.taxConsultant.serviceImpl;


import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.dao.TDSResponseDao;
import com.ems.taxConsultant.elasticSearch.OpenSearchOperations;
import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.CompanyEntity;
import com.ems.taxConsultant.persistance.TDSResponseEntity;
import com.ems.taxConsultant.request.TDSResponseRequest;
import com.ems.taxConsultant.request.TDSResponseUpdateRequest;
import com.ems.taxConsultant.service.TDSResponseService;
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
import java.io.IOException;
import java.util.Collection;
import java.util.stream.Stream;

@Service
@Slf4j
public class TDSResponseServiceImpl implements TDSResponseService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TDSResponseDao responseDao;

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> addTDSResponse(String companyName, TDSResponseRequest responseRequest) throws TaxConsultantException {
        log.debug("validating company existence for companyName {}", companyName);
        String resourceId = ResourceIdUtils.generateTDSResponseResourceId(companyName, responseRequest.getMonth(), responseRequest.getYear());
        CompanyEntity companyEntity;
        TDSResponseEntity responseEntity;
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
            responseEntity = responseDao.get(resourceId, companyName).orElse(null);
            if (responseEntity != null) {
                log.error("TDS Response for month {} and year {} already exists for company {}", responseRequest.getMonth(), responseRequest.getYear(), companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.TDS_RESPONSE_ALREADY_EXISTS),
                        HttpStatus.CONFLICT);
            }
            TDSResponseEntity response = objectMapper.convertValue(responseRequest, TDSResponseEntity.class);
            response.setId(resourceId);
            response.setCompanyId(companyEntity.getId());
            response.setType(Constants.TDS_RESPONSE);
            responseDao.save(response, companyName);
        } catch (TaxConsultantException taxConsultantException) {
            log.error("Error while saving PF response: {}", taxConsultantException.getMessage());
            throw taxConsultantException;
        } catch (Exception e) {
            log.error("Unable to save TDS response for month {} and year {} due to {}", responseRequest.getMonth(), responseRequest.getYear(), e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_TDS_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public Collection<TDSResponseEntity> getTDSResponse(String companyName, String tdsId, String month, String year){
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching company details for companyName: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Getting TDS response for company {} with ID {} for month {} and year {}", companyName, tdsId, month, year);
            Collection<TDSResponseEntity> tdsResponseEntities = responseDao.getTDSResponse(companyName, companyEntity.getId(), tdsId, month, year);
            return tdsResponseEntities;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<?> updateTDSResponse(String companyName, String tdsId, TDSResponseUpdateRequest updateRequest) throws TaxConsultantException {
        TDSResponseEntity response;
        log.debug("Validating company existence for companyName {}", companyName);
        try {
            response = this.getTDSResponse(companyName, tdsId, null, null)
                    .stream()
                    .findFirst()
                    .orElse(null);
            if (response == null) {
                log.error("TDS Response with ID {} not found for company {}", tdsId, companyName);
                throw new TaxConsultantException(String.format(ErrorMessageHandler.getMessage(ErrorMessageKey.TDS_RESPONSE_NOT_FOUND), companyName), HttpStatus.NOT_FOUND);
            }
        } catch (TaxConsultantException e) {
            log.error("Unable to fetch TDS Response with ID {} for company {} due to {}", tdsId, companyName, e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_FETCH_TDS_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try {
            if ((updateRequest.getInvalidTDSAmounts().equals(response.getInvalidTDSAmounts()))
                    && (updateRequest.getIgnoredCompanyEmployees().equals(response.getIgnoredCompanyEmployees()))
                    && (updateRequest.getNewAddedEmployees().equals(response.getNewAddedEmployees()))
                    && (updateRequest.getPreviousMonthMissedEmp().equals(response.getPreviousMonthMissedEmp()))) {
                log.warn("No changes detected in PF Response with ID {} for company {}", tdsId, companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.NO_CHANGES_DETECTED), HttpStatus.NOT_MODIFIED);
            }

            TDSResponseEntity updatedData = objectMapper.convertValue(updateRequest, TDSResponseEntity.class);
            BeanUtils.copyProperties(updatedData, response, getNullPropertyNames(updatedData));
            responseDao.save(response, companyName);
        } catch (TaxConsultantException ex) {
            log.error("Unable to update TDS Response with ID {} for company {} due to {}", tdsId, companyName, ex.getMessage());
            throw ex;
        } catch (Exception e) {
            log.error("Unable to update TDS Response with ID {} for company {} due to {}", tdsId, companyName, e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_UPDATE_TDS_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }


    @Override
    public void deleteTDSResponseById(String companyName, String responseId) throws TaxConsultantException, IOException {
        try {
            TDSResponseEntity pfResponseEntity = this.getTDSResponse(companyName, responseId, null, null)
                    .stream()
                    .findFirst()
                    .orElse(null);
            responseDao.delete(responseId, companyName);
            log.info("Successfully deleted TDS Response with ID {} for company {}", responseId, companyName);
        } catch (TaxConsultantException taxConsultantException) {
            log.error("Error while deleting TDS Response with ID {} for company {}: {}", responseId, companyName, taxConsultantException.getMessage());
            throw taxConsultantException;
        } catch (Exception exception) {
            log.error("Unexpected error while deleting TDS Response with ID {} for company {}: {}", responseId, companyName, exception.getMessage());
            throw new TaxConsultantException(
                    ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_DELETE_TDS_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR
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
