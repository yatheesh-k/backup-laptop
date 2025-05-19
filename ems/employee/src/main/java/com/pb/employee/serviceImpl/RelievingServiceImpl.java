package com.pb.employee.serviceImpl;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.DepartmentUpdateRequest;
import com.pb.employee.request.ExperienceLetterFieldsRequest;
import com.pb.employee.request.RelievingRequest;
import com.pb.employee.service.RelievingService;
import com.pb.employee.util.*;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.opensearch.client.opensearch._types.analysis.IcuFoldingTokenFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URL;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class RelievingServiceImpl implements RelievingService {

    @Autowired
    private OpenSearchOperations openSearchOperations;
    @Autowired
    private Configuration freeMarkerConfig;

    public ResponseEntity<?> addRelievingForEmployee(String employeeId, String companyName, RelievingRequest request) throws EmployeeException {
        EmployeeEntity employeeEntity = null;
        CompanyEntity company = null;
        RelievingEntity relievingEntity = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            employeeEntity = openSearchOperations.getEmployeeById(employeeId, null, index);
            if (employeeEntity == null) {
                log.info("employee is not found with employeeId {}", employeeId);
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().
                                createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                        .getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND)))),
                        HttpStatus.NOT_FOUND);
            }
            String relievingId = ResourceIdUtils.generateRelievingId(employeeId, request.getRelievingDate(),request.getResignationDate());
            relievingEntity = openSearchOperations.getRelievingById(relievingId, null, index);
            if (relievingEntity != null) {
                log.error("The Relieving for the employee is already exist {}", employeeId);
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().
                                createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                        .getMessage(EmployeeErrorMessageKey.RELIEVING_ALREADY_EXIST)))),
                        HttpStatus.NOT_FOUND);
            }
           RelievingEntity entity = CompanyUtils.relievingProperties(request, relievingId,employeeId);
            openSearchOperations.saveEntity(entity, relievingId, index);

        } catch (Exception e) {
            log.error("Unable to add the Relieving for the Employee {}", employeeId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_EMPLOYEE),
                    HttpStatus.INTERNAL_SERVER_ERROR);


        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> getRelievingByEmployeeId(String companyName, String employeeId) throws EmployeeException {
        log.info("getting details of {}", employeeId);
        RelievingEntity entity = null;
        EmployeeEntity employee = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            employee = openSearchOperations.getEmployeeById(employeeId, null, index);

        }  catch (Exception ex) {
            log.error("Exception while fetching employee details: {}", ex.getMessage(), ex);
            throw new EmployeeException(
                    ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        try {
            entity = openSearchOperations.getRelievingByEmployeeId(employeeId, null, companyName);

        } catch (Exception ex) {
            log.error("Exception while fetching relieving details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_RELIEVING),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (entity == null){
            log.error("relieving for the employee id {} is not found", employeeId);
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.RELIEVING_NOT_EXIST), employee.getFirstName()),
                    HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(entity), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> updateEmployeeRelievingById(String relieveId, String companyName, String employeeId, RelievingRequest relievingRequest) throws EmployeeException {
        log.info("getting details of {}", relieveId);
        RelievingEntity relievingEntity;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {

            relievingEntity = openSearchOperations.getRelievingById(relieveId, null, index);
            if (relievingEntity == null) {
                log.error("unable to find the Relieving details of employee");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_RELIEVING),
                        HttpStatus.NOT_FOUND);
            }
            if (!employeeId.equals(relievingEntity.getEmployeeId())){
                log.error("Employee is not matching for the relieving; {}", employeeId);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_EMPLOYEE)),
                        HttpStatus.NOT_FOUND);
            }


        } catch (Exception ex) {

            log.error("Exception while fetching department details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DEPARTMENT),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        RelievingEntity entity = CompanyUtils.maskUpdateRelievingProperties(relievingRequest, relievingEntity );
        openSearchOperations.saveEntity(entity, relieveId, index);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> deleteRelieveDetails(String companyName, String employeeId, String relieveId) throws EmployeeException {
        log.info("getting details of {}", relieveId);
        RelievingEntity entity = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            entity = openSearchOperations.getRelievingById(relieveId, null, index);
            if (!employeeId.equals(entity.getEmployeeId())){
                log.error("unable to find relieving for employee");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_RELIVING),
                        HttpStatus.NOT_FOUND);
            }
            if (entity!=null) {
                openSearchOperations.deleteEntity(relieveId,index);
            } else {
                log.error("unable to find relieving for employee");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_RELIVING),
                        HttpStatus.NOT_FOUND);
            }


        } catch (Exception ex) {
            log.error("Exception while fetching company details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_DEPARTMENT),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED), HttpStatus.OK);

    }

    @Override
    public ResponseEntity<byte[]> downloadRelievingLetter(HttpServletRequest request, String companyName, String employeeId) {
        List<CompanyEntity> companyEntity = null;
        EmployeeEntity employee = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        RelievingEntity relievingEntity = null;
        TemplateEntity templateNo ;

        try {
            templateNo=openSearchOperations.getCompanyTemplates(companyName);
            if (templateNo ==null){
                log.error("company templates are not exist ");
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_GET_TEMPLATE), companyName),
                        HttpStatus.NOT_FOUND);
            }
        }catch (EmployeeException e) {
            throw new RuntimeException(e);
        }
        try {
            // Fetch employee details
            SSLUtil.disableSSLVerification();
            employee = openSearchOperations.getEmployeeById(employeeId, null, index);
            if (employee == null) {
                log.error("Employee does not exist with this Id: {}", employeeId);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), employeeId), HttpStatus.NOT_FOUND);
            }

            DepartmentEntity departmentEntity =null;
            DesignationEntity designationEntity = null;
            if (employee.getDepartment() !=null && employee.getDesignation() !=null) {
                departmentEntity = openSearchOperations.getDepartmentById(employee.getDepartment(), null, index);
                designationEntity = openSearchOperations.getDesignationById(employee.getDesignation(), null, index);
                EmployeeUtils.unmaskEmployeeProperties(employee, departmentEntity, designationEntity);

            }
            // Fetch company details
            companyEntity = openSearchOperations.getCompanyByData(null, Constants.COMPANY, companyName);
            if (companyEntity.isEmpty()) {
                log.error("Company not found: {}", companyName);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), companyName), HttpStatus.NOT_FOUND);
            }
            CompanyUtils.unmaskCompanyProperties(companyEntity.getFirst(), request);

            relievingEntity=openSearchOperations.getRelievingByEmployeeId(employeeId, null, companyName);

            if (relievingEntity ==null){
                log.error("Company not found: {}", companyName);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.RELIEVING_NOT_EXIST), companyName), HttpStatus.NOT_FOUND);
            }

            // Load the company image from a URL

            Map<String, Object> model = new HashMap<>();
            model.put(Constants.EMPLOYEE, employee);
            model.put(Constants.COMPANY, companyEntity);
            model.put(Constants.RELIEVING, relievingEntity);

            if (!companyEntity.getFirst().getImageFile().isEmpty()) {
                String imageUrl = companyEntity.getFirst().getImageFile();
                BufferedImage originalImage = ImageIO.read(new URL(imageUrl));
                if (originalImage == null) {
                    log.error("Failed to load image from URL: {}", imageUrl);
                    throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.IMAGE_NOT_LOADED), companyEntity.getFirst().getImageFile()), HttpStatus.NOT_FOUND);
                }

                // Apply the watermark effect
                float opacity = 0.7f;
                double scaleFactor = 1.6d;
                BufferedImage watermarkedImage = CompanyUtils.applyOpacity(originalImage, opacity, scaleFactor, 30);

                // Convert BufferedImage to Base64 string for HTML
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(watermarkedImage, "png", baos);
                String base64Image = Base64.getEncoder().encodeToString(baos.toByteArray());

                model.put(Constants.BLURRED_IMAGE, Constants.DATA + base64Image);
            }
            // Determine the template name
            String templateName = switch (Integer.parseInt(templateNo.getRelievingTemplateNo())) {
                case 1 -> Constants.RELIEVING_LETTER1;
                case 2 -> Constants.RELIEVING_LETTER2;
                case 3 -> Constants.RELIEVING_LETTER3;
                default -> throw new IllegalArgumentException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_TEMPLATE_NUMBER));
            };

            // Fetch FreeMarker template
            Template template = freeMarkerConfig.getTemplate(templateName);

            // Process template to generate HTML content
            StringWriter stringWriter = new StringWriter();
            try {
                template.process(model, stringWriter);
            } catch (TemplateException e) {
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_PROCESS)), HttpStatus.NOT_FOUND);
            }
            String htmlContent = stringWriter.toString();

            // Convert HTML to PDF
            byte[] pdfBytes = generatePdfFromHtml(htmlContent);

            // Set HTTP headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder(Constants.ATTACHMENT).filename(Constants.RELIEVING_LETTER_PDF).build());

            log.info("Relieving download successfully...");
            // Return response with PDF content
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Error generating service letter: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private byte[] generatePdfFromHtml(String html) throws IOException {
        // Escape unescaped ampersands
        html = html.replaceAll("&(?![a-zA-Z]{2,6};|#\\d{1,5};)", "&amp;");

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new IOException("Error generating PDF: " + e.getMessage(), e);
        }
    }
}

