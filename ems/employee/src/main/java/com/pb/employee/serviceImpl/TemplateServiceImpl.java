package com.pb.employee.serviceImpl;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.TemplateRequest;
import com.pb.employee.service.TemplateService;
import com.pb.employee.util.CompanyUtils;
import com.pb.employee.util.Constants;
import com.pb.employee.util.ResourceIdUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Slf4j
public class TemplateServiceImpl implements TemplateService {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> addTemplate(TemplateRequest templateRequest, HttpServletRequest request) throws EmployeeException,IOException{

        CompanyEntity companyEntity;
        String resourceId = ResourceIdUtils.generateTemplateResourceId(templateRequest.getCompanyId());

        log.debug("Validating template existence for companyId: {}", templateRequest.getCompanyId());
        companyEntity = openSearchOperations.getCompanyById(templateRequest.getCompanyId(), null, Constants.INDEX_EMS);

        if (companyEntity == null) {
            log.error("CompanyId not exists : {} ", templateRequest.getCompanyId());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST),
                    HttpStatus.NOT_FOUND);
        }
        if (companyEntity.getImageFile()==null){
            log.error("Image doesn't exists for the {} ", companyEntity.getId());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPTY_LOGO),
                    HttpStatus.NOT_FOUND);
        }
        CompanyUtils.unmaskCompanyProperties(companyEntity,request);
        String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
        TemplateEntity existingTemplateEntity = openSearchOperations.getTemplateById(resourceId,null,index);

        // Update template properties with retention of existing fields
        TemplateEntity templateEntity = CompanyUtils.addTemplateProperties(existingTemplateEntity, templateRequest, resourceId, companyEntity.getId());
        try {
            // Use the generated index for saving the entity
            openSearchOperations.saveEntity(templateEntity, resourceId, index);

            log.info("Successfully saved template for companyId: {}", templateRequest.getCompanyId());
            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS),
                    HttpStatus.CREATED);

        } catch (Exception exception) {
            log.error("Unable to save the template details for companyId {}: {}", templateRequest.getCompanyId(), exception.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_TEMPLATE),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> getTemplateNo(String companyName) throws EmployeeException {
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        TemplateEntity templateEntities;
        try {
            templateEntities = openSearchOperations.getCompanyTemplates(companyName);

        } catch (Exception ex) {
            log.error("Exception while fetching employees for company {}: {}", companyName, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_GET_TEMPLATE),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(templateEntities), HttpStatus.OK);
    }
}