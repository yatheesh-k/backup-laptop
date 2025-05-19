package com.pb.employee.serviceImpl;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.*;
import com.pb.employee.service.ExperienceLetterService;
import com.pb.employee.util.*;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;
import org.xhtmlrenderer.pdf.ITextRenderer;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.awt.image.BufferedImageOp;
import java.awt.image.ConvolveOp;
import java.awt.image.Kernel;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;

@Service
@Slf4j
public class ExperienceLetterServiceImpl implements ExperienceLetterService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private Configuration freeMarkerConfig;

    @Override
    public ResponseEntity<byte[]> downloadServiceLetter(HttpServletRequest request, ExperienceLetterFieldsRequest experienceLetterFieldsRequest) {
        List<CompanyEntity> companyEntity = null;
        EmployeeEntity employee = null;
        TemplateEntity templateNo ;
        String index = ResourceIdUtils.generateCompanyIndex(experienceLetterFieldsRequest.getCompanyName());

        try {
            templateNo=openSearchOperations.getCompanyTemplates(experienceLetterFieldsRequest.getCompanyName());
            if (templateNo ==null){
                log.error("company templates are not exist ");
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_GET_TEMPLATE), experienceLetterFieldsRequest.getCompanyName()),
                        HttpStatus.NOT_FOUND);
            }
            // Fetch employee details
            SSLUtil.disableSSLVerification();
            employee = openSearchOperations.getEmployeeById(experienceLetterFieldsRequest.getEmployeeId(), null, index);
            if (employee == null) {
                log.error("Employee does not exist with this Id: {}", experienceLetterFieldsRequest.getEmployeeId());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), experienceLetterFieldsRequest.getEmployeeId()), HttpStatus.NOT_FOUND);
            }

            // Normalize both dates to ignore time components
            String experienceDate = experienceLetterFieldsRequest.getDate();
            String hiringDate = employee.getDateOfHiring();

            // Parse the strings to LocalDate (assuming the format is "yyyy-MM-dd")
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd"); // Adjust format if necessary
            LocalDate experienceLocalDate = LocalDate.parse(experienceDate, formatter);
            LocalDate hiringLocalDate = LocalDate.parse(hiringDate, formatter);

            if (experienceLocalDate.isBefore(hiringLocalDate)) {
                log.error("Cannot give the experience before the hiring date for employeeId {}", experienceLetterFieldsRequest.getEmployeeId());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EXPERIENCE_DATE_NOT_VALID), experienceLetterFieldsRequest.getEmployeeId()), HttpStatus.NOT_FOUND);
            }

            DepartmentEntity departmentEntity =null;
            DesignationEntity designationEntity = null;
            if (employee.getDepartment() !=null && employee.getDesignation() !=null) {
                departmentEntity = openSearchOperations.getDepartmentById(employee.getDepartment(), null, index);
                designationEntity = openSearchOperations.getDesignationById(employee.getDesignation(), null, index);
                EmployeeUtils.unmaskEmployeeProperties(employee, departmentEntity, designationEntity);

            }
            // Fetch company details
            companyEntity = openSearchOperations.getCompanyByData(null, Constants.COMPANY, experienceLetterFieldsRequest.getCompanyName());
            if (companyEntity.isEmpty()) {
                log.error("Company not found: {}", experienceLetterFieldsRequest.getCompanyName());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), experienceLetterFieldsRequest.getCompanyName()), HttpStatus.NOT_FOUND);
            }
            CompanyUtils.unmaskCompanyProperties(companyEntity.getFirst(), request);


            // Load the company image from a URL

            Map<String, Object> model = new HashMap<>();
            model.put(Constants.EMPLOYEE, employee);
            model.put(Constants.COMPANY, companyEntity);
            model.put(Constants.REQUEST, experienceLetterFieldsRequest);

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
            String templateName = switch (Integer.parseInt(templateNo.getExperienceTemplateNo())) {
                case 1 -> Constants.EXPERIENCE_LETTER;
                case 2 -> Constants.EXPERIENCE_LETTER_TWO;
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
            headers.setContentDisposition(ContentDisposition.builder(Constants.ATTACHMENT).filename(Constants.EXPERIENCE_LETTER_PDF).build());

            // Return response with PDF content
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Error generating service letter: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<byte[]> uploadExperienceLetter(ExperienceLetterRequest request) {
        try {
            // Generate HTML from the FreeMarker template
            String htmlContent = generateHtmlFromTemplate(request);

            // Convert HTML to PDF
            byte[] pdfBytes = generatePdfFromHtml(htmlContent);

            // Set HTTP headers for PDF download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(
                    ContentDisposition.builder("attachment")
                            .filename("experience_letter.pdf")
                            .build()
            );

            // Return the PDF as a response
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            // Log the error
            e.printStackTrace(); // Replace with a proper logging framework
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String generateHtmlFromTemplate(ExperienceLetterRequest request) throws Exception {
        Template template = freeMarkerConfig.getTemplate("dynamicExpLetter.ftl");
        return FreeMarkerTemplateUtils.processTemplateIntoString(template, request);
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