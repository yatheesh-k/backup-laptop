package com.ems.taxConsultant.serviceImpl;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.dao.PortalsCredDao;
import com.ems.taxConsultant.elasticSearch.OpenSearchOperations;
import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.CompanyEntity;
import com.ems.taxConsultant.persistance.PortalsCredEntity;
import com.ems.taxConsultant.request.PortalsCredRequest;
import com.ems.taxConsultant.service.PortalCredService;
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
public class PortalsCredServiceImpl implements PortalCredService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PortalsCredDao dao;

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> addPortalDetails(String companyName, PortalsCredRequest request) throws TaxConsultantException {
        log.debug("validating company existence for companyName {}", companyName);
        String resourceId ;
        CompanyEntity companyEntity;
        PortalsCredEntity credEntity;
        try {
            companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found with name {}", companyName);
                throw new TaxConsultantException("Company not found", HttpStatus.NOT_FOUND);
            }
            resourceId = ResourceIdUtils.generatePortalCredResourceId(companyEntity.getId());

        } catch (TaxConsultantException taxConsultantException) {
            log.error("Error while fetching company details: {}", taxConsultantException.getMessage());
            throw taxConsultantException;
        }
        try {
            credEntity = dao.get(resourceId, companyName).orElse(null);
            if (credEntity != null) {
                log.error("Portal credentials already exist for company {} with resourceId {}", companyName, resourceId);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.PORTAL_CREDENTIALS_ALREADY_EXIST), HttpStatus.CONFLICT);
            }
            PortalsCredEntity portalsCredEntity = objectMapper.convertValue(request, PortalsCredEntity.class);
            portalsCredEntity.setId(resourceId);
            portalsCredEntity.setCompanyId(companyEntity.getId());
            portalsCredEntity.setType(Constants.PORTAL_CREDENTIALS);
            dao.save(portalsCredEntity, companyName);
        } catch (TaxConsultantException taxConsultantException) {
            log.error("Error while saving portal credentials for company {}: {}", companyName, taxConsultantException.getMessage());
            throw taxConsultantException;
        } catch (Exception e) {
            log.error("Unable to save portal credentials for company {} due to {}", companyName, e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_PORTAL_CREDENTIALS), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public Collection<PortalsCredEntity> getPortalCred(String companyName, String id){
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching company details for companyName: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Getting TDS response for company {} with ID {}", companyName, id);
            Collection<PortalsCredEntity> portalsCredEntities = dao.getPortalDetails(companyName, companyEntity.getId(), id);
            return portalsCredEntities;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<?> updatePortalsCred(String companyName, String tdsId, PortalsCredRequest updateRequest) throws TaxConsultantException {
        PortalsCredEntity response;
        log.debug("Validating company existence for companyName {}", companyName);
        try {
            response = this.getPortalCred(companyName, tdsId)
                    .stream()
                    .findFirst()
                    .orElse(null);
            if (response == null) {
                log.error("TDS Response with ID {} not found for company {}", tdsId, companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.PORTALS_CREDENTIALS_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
        } catch (TaxConsultantException e) {
            log.error("Unable to fetch portal credentials for company {} with ID {} due to {}", companyName, tdsId, e.getMessage());
            throw e;
        }
        try {
            PortalsCredEntity updatedData = objectMapper.convertValue(updateRequest, PortalsCredEntity.class);
            BeanUtils.copyProperties(updatedData, response, getNullPropertyNames(updatedData));
            dao.save(response, companyName);
        } catch (TaxConsultantException ex) {
            log.error("Unable to update TDS Response with ID {} for company {} due to {}", tdsId, companyName, ex.getMessage());
            throw ex;
        } catch (Exception e) {
            log.error("Unable to update TDS Response with ID {} for company {} due to {}", tdsId, companyName, e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_UPDATE_PORTAL_CREDENTIALS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }


    @Override
    public void deletePortalCredById(String companyName, String id) throws TaxConsultantException, IOException {
        try {
            PortalsCredEntity portalsCredEntity = this.getPortalCred(companyName, id)
                    .stream()
                    .findFirst()
                    .orElse(null);
            dao.delete(id, companyName);
            log.info("Successfully deleted portal credentials with ID {} for company {}", id, companyName);
        } catch (TaxConsultantException taxConsultantException) {
            log.error("Error while deleting portal credentials with ID {} for company {}: {}", id, companyName, taxConsultantException.getMessage());
            throw taxConsultantException;
        } catch (Exception exception) {
            log.error("Unexpected error while deleting portal credentials with ID {} for company {}: {}", id, companyName, exception.getMessage());
            throw new TaxConsultantException(
                    ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_DELETE_PORTAL_CREDENTIALS),HttpStatus.INTERNAL_SERVER_ERROR);
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
