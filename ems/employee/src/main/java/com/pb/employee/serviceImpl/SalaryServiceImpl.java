package com.pb.employee.serviceImpl;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.DocumentException;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.*;
import com.pb.employee.service.SalaryService;
import com.pb.employee.util.*;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class SalaryServiceImpl implements SalaryService {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private  OpenSearchOperations openSearchOperations;
    @Autowired
    private EmployeeServiceImpl employeeService;
    @Autowired
    private Configuration freemarkerConfig;

    @Override
    public ResponseEntity<?> addSalary(EmployeeSalaryRequest employeeSalaryRequest, String employeeId) throws EmployeeException {
        LocalDateTime currentDateTime = LocalDateTime.now();
        String timestamp = currentDateTime.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String salaryId = ResourceIdUtils.generateSalaryResourceId(employeeId, timestamp);
        EmployeeEntity entity;
        List<EmployeeSalaryEntity> salary;
        String index = ResourceIdUtils.generateCompanyIndex(employeeSalaryRequest.getCompanyName());
        EmployeeSalaryEntity employeesSalaryProperties = null;
        List<SalaryConfigurationEntity> salaryConfigurationEntity = null;

        try {
            entity = openSearchOperations.getEmployeeById(employeeId, null, index);
            if (entity.getStatus().equals(EmployeeStatus.INACTIVE.getStatus())){
                log.error("employee is inActive {}", employeeId);
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().
                                createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                        .getMessage(EmployeeErrorMessageKey.EMPLOYEE_INACTIVE)))),
                        HttpStatus.CONFLICT);
            }
            if (entity != null) {
                salary = openSearchOperations.getEmployeeSalaries(employeeSalaryRequest.getCompanyName(), employeeId);
                if (salary != null && !salary.isEmpty()) {
                    for (EmployeeSalaryEntity employeeSalaryEntity : salary) {
                        String gross = new String(Base64.getDecoder().decode(employeeSalaryEntity.getGrossAmount()));
                        if (gross.equals(employeeSalaryRequest.getGrossAmount())) {
                            return new ResponseEntity<>(ResponseBuilder.builder().build().createFailureResponse(
                                    new Exception(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.SALARY_ALREADY_EXIST))),
                                    HttpStatus.CONFLICT
                            );
                        }
                        employeeSalaryEntity.setStatus(EmployeeStatus.INACTIVE.getStatus());
                        openSearchOperations.saveEntity(employeeSalaryEntity, employeeSalaryEntity.getSalaryId(), index);
                    }
                }

                salaryConfigurationEntity = openSearchOperations.getSalaryStructureByCompanyDate(employeeSalaryRequest.getCompanyName());
                log.debug("Fetched Salary Configurations: {}", salaryConfigurationEntity);

                if (salaryConfigurationEntity == null){
                    return new ResponseEntity<>(
                            ResponseBuilder.builder().build().
                                    createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                            .getMessage(EmployeeErrorMessageKey.COMPANY_SALARY_NOT_FOUND)))),
                            HttpStatus.FORBIDDEN);
                }
                for (SalaryConfigurationEntity salaryConfiguration : salaryConfigurationEntity) {
                    if (salaryConfiguration.getStatus().equals(EmployeeStatus.ACTIVE.getStatus())) {
                        employeesSalaryProperties = CompanyUtils.maskEmployeesSalaryProperties(employeeSalaryRequest, salaryId, employeeId, salaryConfiguration);
                    }
                }

                if (employeesSalaryProperties != null) {
                    log.debug("Prepared salary entity: {}", employeesSalaryProperties);
                    Entity result = openSearchOperations.saveEntity(employeesSalaryProperties, salaryId, index);
                }
            } else {
                log.error("Employee not found");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_EMPLOYEE), HttpStatus.NOT_FOUND);
            }
        } catch (EmployeeException exception) {
            log.error("Employee Exception: {}", exception.getMessage(), exception);
            throw exception; // Maintain original exception
        } catch (IOException exception) {
            log.error("IOException while saving salary details: {}", exception.getMessage(), exception);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SAVE_SALARY), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> getEmployeeSalaryById(String companyName, String employeeId,String salaryId) throws EmployeeException, IOException {
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        EmployeeEntity employee = openSearchOperations.getEmployeeById(employeeId, null, index);
        if (employee==null){
            log.error("Exception while fetching employee for salary {}", employeeId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        EmployeeSalaryEntity entity = null;
        try {

            entity = openSearchOperations.getSalaryById(salaryId, null, index);
            if (entity == null || !(entity instanceof EmployeeSalaryEntity)) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            if (!entity.getEmployeeId().equals(employeeId)) {
                log.error("Employee ID mismatch for salary {}: expected {}, found {}", salaryId, employeeId, entity.getEmployeeId());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            entity= EmployeeUtils.unMaskEmployeeSalaryProperties(entity);


        }
        catch (Exception ex) {
            log.error("Exception while fetching salaries for employees {}: {}", employeeId, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(entity), HttpStatus.OK);

    }

    @Override
    public ResponseEntity<?> getEmployeeSalary(String companyName, String employeeId) throws EmployeeException {
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        List<EmployeeSalaryEntity> salaryEntities = null;
        Object entity = null;
        List<EmployeeSalaryEntity> salaryEntityList;
        try {
            salaryEntities = openSearchOperations.getEmployeeSalaries(companyName, employeeId);
            salaryEntityList = new ArrayList<>();
            for (EmployeeSalaryEntity salaryEntity : salaryEntities) {
                EmployeeSalaryEntity salary = EmployeeUtils.unMaskEmployeeSalaryProperties(salaryEntity);
                salaryEntityList.add(salary);
                entity = openSearchOperations.getById(salary.getEmployeeId(), null, index);
                if (entity == null){
                    log.error("Employee ID mismatch for salary {}: expected {}, found {}", salary.getSalaryId(), employeeId, salary.getEmployeeId());
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                            HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        } catch (Exception ex) {
            log.error("Exception while fetching salaries for employees {}: {}", employeeId, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(salaryEntityList), HttpStatus.OK);
    }
    @Override
    public ResponseEntity<?> deleteEmployeeSalaryById(String companyName, String employeeId,String salaryId) throws EmployeeException{
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        EmployeeSalaryEntity entity = null;
        try {
            entity = openSearchOperations.getSalaryById(salaryId, null, index);
            if (entity==null){
                log.error("Exception while fetching employee for salary {}", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            if (!entity.getEmployeeId().equals(employeeId)) {
                log.error("Employee ID mismatch for salary {}: expected {}, found", salaryId, employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            openSearchOperations.deleteEntity(salaryId, index);
        }
        catch (Exception ex) {
            log.error("Exception while deleting salaries for employees {}: {}", salaryId, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED), HttpStatus.OK);

    }

    public ResponseEntity<?> updateEmployeeSalaryById(String employeeId, SalaryUpdateRequest salaryUpdateRequest, String salaryId) throws EmployeeException {
        String index = ResourceIdUtils.generateCompanyIndex(salaryUpdateRequest.getCompanyName());
        EmployeeEntity employee = null;
        EmployeeSalaryEntity entity = null;
        try {
            entity = openSearchOperations.getSalaryById(salaryId, null, index);
            if (entity==null){
                log.error("Exception while fetching employee for salary {}", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            employee = openSearchOperations.getEmployeeById(employeeId, null, index);
            if (employee !=null && entity.getStatus().equals(EmployeeStatus.INACTIVE.getStatus())){
                log.error("employee is inActive {}", employeeId);
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().
                                createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                        .getMessage(EmployeeErrorMessageKey.EMPLOYEE_INACTIVE)))),
                        HttpStatus.CONFLICT);
            }
            int noOfChanges = EmployeeUtils.duplicateSalaryProperties(entity, salaryUpdateRequest);
            if (noOfChanges==0){
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.SALARY_ALREADY_EXIST)))),
                        HttpStatus.CONFLICT);
            }
            if (!entity.getEmployeeId().equals(employeeId)) {
                log.error("Employee ID mismatch for salary {}: expected {}, found", salaryId, employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception ex) {
            log.error("Exception while fetching user {}:", employeeId, ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        Entity employeeSalaryProperties = CompanyUtils.maskUpdateSalary(salaryUpdateRequest, entity);
        openSearchOperations.saveEntity(employeeSalaryProperties, salaryId, index);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }


    @Override
    public ResponseEntity<byte[]> downloadEmployeesSalaries(String companyId, String format, HttpServletRequest request) throws Exception {
        byte[] fileBytes = null;
        HttpHeaders headers = new HttpHeaders();
        try {

            CompanyEntity companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Company is not found");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            SSLUtil.disableSSLVerification();
            CompanyUtils.unmaskCompanyProperties(companyEntity, request);
            List<EmployeeSalaryResPayload> employeeSalaryResPayloads = validateEmployeesSalaries(companyEntity);


            if (Constants.EXCEL_TYPE.equalsIgnoreCase(format)) {
                fileBytes = generateExcelFromEmployeesSalaries(employeeSalaryResPayloads);
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM); // For Excel download
                headers.setContentDisposition(ContentDisposition.builder("attachment")
                        .filename("EmployeesSalaries.xlsx")
                        .build());
            } else if (Constants.PDF_TYPE.equalsIgnoreCase(format)) {
                fileBytes = generateEmployeesSalariesPdf(employeeSalaryResPayloads, companyEntity);
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDisposition(ContentDisposition.builder("attachment").filename("employeeBankDetails.pdf").build());
            }

        } catch (EmployeeException e) {
            log.error("Exception while downloading the Employee details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while processing the employee details: {}", e.getMessage());
            throw new IOException("Error generating certificate", e);
        }

        return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
    }


    private byte[] generateExcelFromEmployeesSalaries(List<EmployeeSalaryResPayload> salaryResPayloads) throws IOException {

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Employees");
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Name", "EmployeeId", "Gross Amount", "Income Tax", "Net Salary"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                CellStyle headerCellStyle = workbook.createCellStyle();
                headerCellStyle.setFont(headerFont);
                cell.setCellStyle(headerCellStyle);
            }
            int rowNum = 1;
            for (EmployeeSalaryResPayload salaryResPayload : salaryResPayloads) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(salaryResPayload.getEmployeeName());
                row.createCell(1).setCellValue(salaryResPayload.getEmployeeCreatedId());
                row.createCell(2).setCellValue(salaryResPayload.getGrossAmount());
                row.createCell(3).setCellValue(salaryResPayload.getIncomeTax());
                row.createCell(5).setCellValue(salaryResPayload.getNetSalary());
            }
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) * 2); // Adjust the multiplier as needed
            }

            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    private List<EmployeeSalaryResPayload> validateEmployeesSalaries(CompanyEntity companyEntity) throws EmployeeException {
        try {
            List<EmployeeSalaryResPayload> employeeSalaryResPayloads = new ArrayList<>();
            List<EmployeeSalaryEntity> salaryEntities = openSearchOperations.getEmployeeSalaries(companyEntity.getShortName(), null);
            if (salaryEntities == null || salaryEntities.isEmpty()) {
                log.error("Employees salaries do not exist in the company");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY), HttpStatus.NOT_FOUND);
            }
            String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
            for (EmployeeSalaryEntity salaryEntity : salaryEntities) {
                if (salaryEntity.getStatus().equalsIgnoreCase(Constants.ACTIVE)) {
                    EmployeeUtils.unMaskEmployeeSalaryProperties(salaryEntity);
                    EmployeeEntity employee = openSearchOperations.getEmployeeById(salaryEntity.getEmployeeId(), null, index);
                    EmployeeSalaryResPayload employeeSalaryResPayload = objectMapper.convertValue(salaryEntity, EmployeeSalaryResPayload.class);
                    employeeSalaryResPayload.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
                    employeeSalaryResPayload.setEmployeeCreatedId(employee.getEmployeeId());
                    employeeSalaryResPayloads.add(employeeSalaryResPayload);
                }
            }
            return employeeSalaryResPayloads;

        }catch (EmployeeException e){
            log.error("Exception while fetching the employee details");
            throw e;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }


    private byte[] generatePdfFromHtml(String html) throws IOException {
        html = html.replaceAll("&(?![a-zA-Z]{2,6};|#\\d{1,5};)", "&amp;");  // Fix potential HTML issues

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(baos);
            return baos.toByteArray();
        } catch (DocumentException e) {
            throw new IOException(e.getMessage());
        }
    }

    private byte[] generateEmployeesSalariesPdf(List<EmployeeSalaryResPayload> employeeEntities, CompanyEntity companyEntity) throws IOException, DocumentException {
        try {
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream("templates/" + Constants.EMPLOYEE_DETAILS);
            if (inputStream == null) {
                throw new IOException("Template file not found: " + Constants.EMPLOYEE_DETAILS);
            }
            Template template = freemarkerConfig.getTemplate(Constants.EMPLOYEE_SALARIES_DETAILS);

            Map<String, Object> dataModel = new HashMap<>();
            dataModel.put("data", employeeEntities);
            dataModel.put("company", companyEntity);

            addWatermarkToDataModel(dataModel, companyEntity);

            StringWriter stringWriter = new StringWriter();
            template.process(dataModel, stringWriter);
            String htmlContent = stringWriter.toString();
            return generatePdfFromHtml(htmlContent); // Return the byte array from generatePdfFromHtml
        } catch (IOException | EmployeeException | TemplateException e) {
            log.error("Error generating PDF: {}", e.getMessage());
            throw new IOException("Error generating PDF", e); // Re-throw the exception
        }
    }

    private void addWatermarkToDataModel(Map<String, Object> dataModel, CompanyEntity companyEntity) throws IOException, EmployeeException {
        String imageUrl = companyEntity.getImageFile();
        BufferedImage originalImage = ImageIO.read(new URL(imageUrl));
        if (originalImage == null) {
            log.error("Failed to load image from URL: {}", imageUrl);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPTY_FILE), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        float opacity = 0.5f;
        double scaleFactor = 1.6d;
        BufferedImage watermarkedImage = CompanyUtils.applyOpacity(originalImage, opacity, scaleFactor, 30);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(watermarkedImage, "png", baos);
        String base64Image = Base64.getEncoder().encodeToString(baos.toByteArray());
        dataModel.put(Constants.BLURRED_IMAGE, Constants.DATA + base64Image);
    }

}