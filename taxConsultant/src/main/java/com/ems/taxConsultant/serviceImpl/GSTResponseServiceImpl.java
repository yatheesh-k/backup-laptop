package com.ems.taxConsultant.serviceImpl;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.dao.GSTResponseDao;
import com.ems.taxConsultant.elasticSearch.OpenSearchOperations;
import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.CompanyEntity;
import com.ems.taxConsultant.persistance.GSTResponseEntity;
import com.ems.taxConsultant.request.GSTResponseRequest;
import com.ems.taxConsultant.request.GSTResponseUpdateRequest;
import com.ems.taxConsultant.service.GSTResponseService;
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
public class GSTResponseServiceImpl implements GSTResponseService {


    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GSTResponseDao responseDao;

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> addGSTResponse(String companyName, GSTResponseRequest responseRequest) throws TaxConsultantException {
        log.debug("validating company existence for companyName {}", companyName);
        String resourceId = ResourceIdUtils.generateGSTResponseResourceId(companyName, responseRequest.getMonth(), responseRequest.getYear());
        CompanyEntity companyEntity;
        GSTResponseEntity responseEntity;
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
                log.error("GST Response already exists for month {} and year {} for company {}", responseRequest.getMonth(), responseRequest.getYear(), companyName);
                throw new TaxConsultantException(String.format(ErrorMessageHandler.getMessage(ErrorMessageKey.GST_RESPONSE_ALREADY_EXISTS), responseRequest.getMonth(), responseRequest.getYear(), companyName), HttpStatus.CONFLICT);
            }
            GSTResponseEntity response = objectMapper.convertValue(responseRequest, GSTResponseEntity.class);
            response.setId(resourceId);
            response.setCompanyId(companyEntity.getId());
            response.setType(Constants.GST_RESPONSE);
            responseDao.save(response, companyName);
        } catch (TaxConsultantException taxConsultantException) {
            log.error("Error while saving GST response for month {} and year {}: {}", responseRequest.getMonth(), responseRequest.getYear(), taxConsultantException.getMessage());
            throw taxConsultantException;
        } catch (Exception e) {
            log.error("Unable to save GST Response for month {} and year {} for company {} due to {}", responseRequest.getMonth(), responseRequest.getYear(), companyName, e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_GST_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public Collection<GSTResponseEntity> getGSTResponse(String companyName, String tdsId, String month, String year){
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching company details for companyName: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Getting TDS response for company {} with ID {} for month {} and year {}", companyName, tdsId, month, year);
            Collection<GSTResponseEntity> gstResponseEntities = responseDao.getGSTResponse(companyName, companyEntity.getId(), tdsId, month, year);
            return gstResponseEntities;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<?> updateGSTResponse(String companyName, String tdsId, GSTResponseUpdateRequest updateRequest) throws TaxConsultantException {
        GSTResponseEntity response;
        log.debug("Validating company existence for companyName {}", companyName);
        try {
            response = this.getGSTResponse(companyName, tdsId, null, null)
                    .stream()
                    .findFirst()
                    .orElse(null);
            if (response == null) {
                log.error("GST Response not found with ID {} for company {}", tdsId, companyName);
                throw new TaxConsultantException(String.format(ErrorMessageHandler.getMessage(ErrorMessageKey.GST_RESPONSE_NOT_FOUND), companyName), HttpStatus.NOT_FOUND);
            }
        } catch (TaxConsultantException e) {
            log.error("Unable to fetch GST Response with ID {} for company {} due to {}", tdsId, companyName, e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_FETCH_GST_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try {
            if ((updateRequest.getIgnoredCustomer() .equals(response.getIgnoredCustomer()))
                    && (updateRequest.getMismatchCustomer().equals(response.getMismatchCustomer()))) {
                log.warn("No changes detected in GST Response with ID {} for company {}", tdsId, companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.NO_CHANGES_DETECTED), HttpStatus.NOT_MODIFIED);
            }

            GSTResponseEntity updatedData = objectMapper.convertValue(updateRequest, GSTResponseEntity.class);
            BeanUtils.copyProperties(updatedData, response, getNullPropertyNames(updatedData));
            responseDao.save(response, companyName);
        } catch (TaxConsultantException ex) {
            log.error("Unable to update GST Response with ID {} for company {} due to {}", tdsId, companyName, ex.getMessage());
            throw ex;
        } catch (Exception e) {
            log.error("Unable to update GST Response with ID {} for company {} due to {}", tdsId, companyName, e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_UPDATE_GST_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }


    @Override
    public void deleteGSTResponseById(String companyName, String responseId) throws TaxConsultantException, IOException {
        try {
            GSTResponseEntity response = this.getGSTResponse(companyName, responseId, null, null)
                    .stream()
                    .findFirst()
                    .orElse(null);
            responseDao.delete(responseId, companyName);
            log.info("Successfully deleted GST Response with ID {} for company {}", responseId, companyName);
        } catch (TaxConsultantException taxConsultantException) {
            log.error("Error while deleting GST Response with ID {} for company {}: {}", responseId, companyName, taxConsultantException.getMessage());
            throw taxConsultantException;
        } catch (Exception exception) {
            log.error("Unexpected error while deleting GST Response with ID {} for company {}: {}", responseId, companyName, exception.getMessage());
            throw new TaxConsultantException(
                    ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_DELETE_GST_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR
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
