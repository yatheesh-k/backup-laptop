package com.pb.employee.serviceImpl;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.DocumentException;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.EmployeeRequest;
import com.pb.employee.request.EmployeeUpdateRequest;
import com.pb.employee.service.EmployeeService;
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
import java.time.LocalDate;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private OpenSearchOperations openSearchOperations;
    @Autowired
    private EmailUtils emailUtils;

    @Autowired
    private Configuration freemarkerConfig;

    @Override
    public ResponseEntity<?> registerEmployee(EmployeeRequest employeeRequest, HttpServletRequest request) throws EmployeeException{
        // Check if a company with the same short or company name already exists
        log.debug("validating name {} employee Id {} exsited ", employeeRequest.getLastName(), employeeRequest.getEmployeeId());
        String resourceId = ResourceIdUtils.generateEmployeeResourceId(employeeRequest.getEmailId());
        Object entity = null;
        String index = ResourceIdUtils.generateCompanyIndex(employeeRequest.getCompanyName());
        try{
            entity = openSearchOperations.getById(resourceId, null, index);
            if(entity != null) {
                log.error("employee details existed{}", employeeRequest.getCompanyName());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_EMAILID_ALREADY_EXISTS), employeeRequest.getEmailId()),
                        HttpStatus.CONFLICT);
            }
            List<EmployeeEntity> employees = openSearchOperations.getCompanyEmployees(employeeRequest.getCompanyName());

            Map<String, Object> duplicateValues = EmployeeUtils.duplicateValues(employeeRequest, employees);
            if (!duplicateValues.isEmpty()) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().failureResponse(duplicateValues),
                        HttpStatus.CONFLICT
                );
            }
        } catch (IOException e) {
            log.error("Unable to get the company details {}", employeeRequest.getCompanyName());
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_EMPLOYEE), employeeRequest.getEmailId()),
                    HttpStatus.BAD_REQUEST);
        }
        List<EmployeeEntity> employeeByData = openSearchOperations.getCompanyEmployeeByData(employeeRequest.getCompanyName(), employeeRequest.getEmployeeId(),
                employeeRequest.getEmailId());
        if(employeeByData !=null && employeeByData.size() > 0) {
            log.error("Employee with emailId {} already existed", employeeRequest.getEmployeeId());
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_ID_ALREADY_EXISTS), employeeRequest.getEmployeeId()),
                    HttpStatus.CONFLICT);
        }
        try{
            DepartmentEntity departmentEntity =null;
            DesignationEntity designationEntity = null;
                departmentEntity = openSearchOperations.getDepartmentById(employeeRequest.getDepartment(), null, index);
                if (departmentEntity == null){

                }
                designationEntity = openSearchOperations.getDesignationById(employeeRequest.getDesignation(), null, index);
                if (designationEntity == null){
                    return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DESIGNATION)))),
                        HttpStatus.CONFLICT);
                }
            List<CompanyEntity> shortNameEntity = openSearchOperations.getCompanyByData(null, Constants.COMPANY, employeeRequest.getCompanyName());

            String defaultPassword = PasswordUtils.generateStrongPassword();
            Entity companyEntity = EmployeeUtils.maskEmployeeProperties(employeeRequest, resourceId, shortNameEntity.getFirst().getId(),defaultPassword);
            Entity result = openSearchOperations.saveEntity(companyEntity, resourceId, index);
        } catch (Exception exception) {
            log.error("Unable to save the employee details {} {}", employeeRequest.getEmailId(),exception.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_EMPLOYEE),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // Send the email with company details
        CompletableFuture.runAsync(() -> {
            try {
                String defaultPassword = PasswordUtils.generateStrongPassword();
                String companyUrl = EmailUtils.getBaseUrl(request)+employeeRequest.getCompanyName()+Constants.SLASH+Constants.CREATE_PASSWORD;
                log.info("The company url : "+companyUrl);// Example URL
                emailUtils.sendRegistrationEmail(employeeRequest.getEmailId(), companyUrl,Constants.EMPLOYEE,defaultPassword);
            } catch (Exception e) {
                log.error("Error sending email to employee: {}", employeeRequest.getEmailId());
                throw new RuntimeException(e);
            }
        });

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);

    }

    @Override
    public ResponseEntity<?> getEmployees(String companyName) throws EmployeeException, IOException {
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        List<EmployeeEntity> employeeEntities = null;

        try {
            LocalDate currentDate = LocalDate.now();
            employeeEntities = openSearchOperations.getCompanyEmployees(companyName);

            for (EmployeeEntity employee : employeeEntities) {
                DepartmentEntity entity = null;
                DesignationEntity designationEntity = null;

                if (employee.getDepartment() != null && employee.getDesignation() != null) {
                    entity = openSearchOperations.getDepartmentById(employee.getDepartment(), null, index);
                    designationEntity = openSearchOperations.getDesignationById(employee.getDesignation(), null, index);
                }
                // Unmask employee properties
                EmployeeUtils.unmaskEmployeeProperties(employee, entity, designationEntity);
                // Fetch relieving details for each employee

                List<EmployeeSalaryEntity> employeeSalaryEntity =  openSearchOperations.getEmployeeSalaries(companyName, employee.getEmployeeId());
                if (employeeSalaryEntity != null && employeeSalaryEntity.isEmpty()){
                    String grossAmounts = String.valueOf(employeeSalaryEntity.stream()
                            .filter(salary -> "Active".equalsIgnoreCase(salary.getStatus())) // Filter for active salaries
                            .map(EmployeeSalaryEntity::getGrossAmount) // Extract gross amounts
                            .findFirst());
                    employee.setGrossAmount(grossAmounts);
                }
                RelievingEntity relievingDetails = openSearchOperations.getRelievingByEmployeeId(employee.getId(),null,companyName);
                // Set status only if relieving details are found
                if (relievingDetails != null) {
                    LocalDate startDate = LocalDate.parse(relievingDetails.getResignationDate());
                    LocalDate endDate = LocalDate.parse(relievingDetails.getRelievingDate());

                    if (startDate != null && endDate != null) {
                        String status = null;
                        if ((currentDate.isEqual(startDate) || currentDate.isAfter(startDate)) && currentDate.isBefore(endDate)) {
                            status = Constants.NOTICE_PERIOD;
                        } else if (currentDate.isEqual(endDate) || currentDate.isAfter(endDate)) {
                            status = Constants.INACTIVE;
                        }

                        if (status != null && !status.equals(employee.getStatus())) {
                            employee.setStatus(status);

                            // Perform partial update for status only
                            Map<String, Object> partialUpdate = new HashMap<>();
                            partialUpdate.put(Constants.STATUS, status);
                            openSearchOperations.partialUpdate(employee.getId(), partialUpdate, index);
                        }
                    }
                }
            }
        } catch (Exception ex) {
            log.error("Exception while fetching employees for company {}: {}", companyName, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(employeeEntities), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> getEmployeeById(String companyName, String employeeId) throws EmployeeException {
        log.info("getting details of {}", employeeId);
        EmployeeEntity entity = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            entity = openSearchOperations.getEmployeeById(employeeId, null, index);
            DepartmentEntity departmentEntity =null;
            DesignationEntity designationEntity = null;
            if (entity.getDepartment() !=null && entity.getDesignation() !=null) {
                departmentEntity = openSearchOperations.getDepartmentById(entity.getDepartment(), null, index);
                designationEntity = openSearchOperations.getDesignationById(entity.getDesignation(), null, index);
                EmployeeUtils.unmaskEmployeeProperties(entity, departmentEntity, designationEntity);

            }
        } catch (Exception ex) {
            log.error("Exception while fetching company details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(entity), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> updateEmployeeById(String employeeId, EmployeeUpdateRequest employeeUpdateRequest) throws IOException, EmployeeException {
          log.info("getting details of {}", employeeId);
        EmployeeEntity user;
        List<EmployeeSalaryEntity> salaryEntities;

        String index = ResourceIdUtils.generateCompanyIndex(employeeUpdateRequest.getCompanyName());
        try {
            user = openSearchOperations.getEmployeeById(employeeId, null, index);
            List<EmployeeEntity> employees = openSearchOperations.getCompanyEmployees(employeeUpdateRequest.getCompanyName());
            employees.removeIf(employee -> employee.getId().equals(employeeId));
            Map<String, Object> duplicateValues = EmployeeUtils.duplicateUpdateValues(employeeUpdateRequest, employees);
            if (!duplicateValues.isEmpty()) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().failureResponse(duplicateValues),
                        HttpStatus.CONFLICT
                );
            }
            if (user == null) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_COMPANY),
                        HttpStatus.BAD_REQUEST);
            }
            salaryEntities = openSearchOperations.getEmployeeSalaries(employeeUpdateRequest.getCompanyName(), employeeId);

        } catch (Exception ex) {

            log.error("Exception while fetching company details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        DesignationEntity designationEntity = null;
        DepartmentEntity departmentEntity = null;
        departmentEntity = openSearchOperations.getDepartmentById(employeeUpdateRequest.getDepartment(), null, index);
        if (departmentEntity == null){
            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DEPARTMENT)))),
                    HttpStatus.CONFLICT);
        }
        designationEntity = openSearchOperations.getDesignationById(employeeUpdateRequest.getDesignation(), null, index);
        if (designationEntity == null){
            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DESIGNATION)))),
                    HttpStatus.CONFLICT);
        }
        int noOfChanges = EmployeeUtils.duplicateEmployeeProperties(user, employeeUpdateRequest);
        if (noOfChanges==0){
            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_DATA_EXIST)))),
                    HttpStatus.CONFLICT);
        }
        Entity entity = CompanyUtils.maskEmployeeUpdateProperties(user, employeeUpdateRequest);
        openSearchOperations.saveEntity(entity, employeeId, index);
        // Step 7: Deactivate Salaries if Employee is Made Inactive
        if (Constants.INACTIVE.equalsIgnoreCase(employeeUpdateRequest.getStatus()) && salaryEntities != null) {
            for (EmployeeSalaryEntity salaryEntity : salaryEntities) {
                salaryEntity.setStatus(Constants.INACTIVE);
                openSearchOperations.saveEntity(salaryEntity, salaryEntity.getSalaryId(), index);
            }
            log.info("Salaries set to inactive for employee: {}", employeeId);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> deleteEmployeeById(String companyName, String employeeId) throws EmployeeException {
        log.info("Attempting to delete employee with ID: {}", employeeId);
        EmployeeEntity entity = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            entity = openSearchOperations.getEmployeeById(employeeId, null, index);
        } catch (Exception ex) {
            log.error("Exception while fetching employee details: {}", ex.getMessage(), ex);
            throw new EmployeeException(
                    ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_EMPLOYEE),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        if (entity == null) {
            log.error("Employee not found in company: {}", companyName);
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), employeeId),
                    HttpStatus.NOT_FOUND
            );
        }
        try {
            openSearchOperations.deleteEntity(employeeId, index);
        } catch (Exception ex) {
            log.error("Exception while deleting employee: {}", ex.getMessage(), ex);
            throw new EmployeeException(
                    ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_EMPLOYEE),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED),
                HttpStatus.OK
        );
    }



    @Override
    public ResponseEntity<byte[]> downloadEmployeeDetails(String companyId, String format, HttpServletRequest request) throws Exception {
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
            List<EmployeeEntity> employeeEntities = validateEmployee(companyEntity);

            if (Constants.EXCEL_TYPE.equalsIgnoreCase(format)) {
                fileBytes = generateExcelFromEmployees(employeeEntities);
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM); // For Excel download
                headers.setContentDisposition(ContentDisposition.builder("attachment")
                        .filename("EmployeeDetails.xlsx")
                        .build());
            } else if (Constants.PDF_TYPE.equalsIgnoreCase(format)) {
                fileBytes = generateEmployeePdf(employeeEntities, companyEntity, "employee");
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDisposition(ContentDisposition.builder("attachment").filename("employeeDetails.pdf").build());
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

    @Override
    public ResponseEntity<byte[]> downloadEmployeeBankDetails(String companyId, String format, HttpServletRequest request) throws Exception {
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
            List<EmployeeEntity> employeeEntities = validateEmployee(companyEntity);

            if (Constants.EXCEL_TYPE.equalsIgnoreCase(format)) {
                fileBytes = generateExcelFromEmployeeBank(employeeEntities);
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM); // For Excel download
                headers.setContentDisposition(ContentDisposition.builder("attachment")
                        .filename("EmployeeBankDetails.xlsx")
                        .build());
            } else if (Constants.PDF_TYPE.equalsIgnoreCase(format)) {
                fileBytes = generateEmployeePdf(employeeEntities, companyEntity, "bank");
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

    private List<EmployeeEntity> validateEmployee(CompanyEntity companyEntity) throws EmployeeException {
        try {
            List<EmployeeEntity> employees = openSearchOperations.getCompanyEmployees(companyEntity.getShortName());
            if (employees == null || employees.isEmpty()) {
                log.error("Employees do not exist in the company");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES), HttpStatus.NOT_FOUND);
            }
            String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
            List<EmployeeEntity> filteredEmployees = employees.stream()
                    .filter(employee -> !"CompanyAdmin".equalsIgnoreCase(employee.getEmployeeType()))
                    .collect(Collectors.toList());

            if (filteredEmployees.isEmpty()) {
                log.warn("No employees available after filtering out company admins.");
                throw new EmployeeException("No employees available for download", HttpStatus.NO_CONTENT);
            }

            for (EmployeeEntity employee : filteredEmployees) {
                DesignationEntity designationEntity = openSearchOperations.getDesignationById(employee.getDesignation(), null, index);
                if (designationEntity == null) {
                    log.error("employee {} designation is not found", employee.getFirstName());
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_DESIGNATION), HttpStatus.NOT_FOUND);
                }
                DepartmentEntity departmentEntity = openSearchOperations.getDepartmentById(employee.getDepartment(), null, index);
                if (departmentEntity == null) {
                    log.error("employee {} department is not found", employee.getFirstName());
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_DEPARTMENT), HttpStatus.NOT_FOUND);
                }
                EmployeeUtils.unmaskEmployeeProperties(employee, departmentEntity, designationEntity);
            }
            return filteredEmployees;
        }catch (EmployeeException e){
            log.error("Exception while fetching the employee details");
            throw e;
        } catch (IOException e) {
            log.error("Exception while fetching the employee details of company {}", companyEntity.getCompanyName());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_EMPLOYEE), HttpStatus.FORBIDDEN);
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

    private byte[] generateExcelFromEmployeeBank(List<EmployeeEntity> employees) throws IOException {

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Employees");
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Name", "EmployeeId", "Bank Name", "Bank Account No", "Bank IFSCOde", "Pan No", "PF Number"};
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
            for (EmployeeEntity employee : employees) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(employee.getFirstName() + " " + employee.getLastName());
                row.createCell(1).setCellValue(employee.getEmployeeId());
                row.createCell(2).setCellValue(employee.getBankName());
                row.createCell(3).setCellValue(employee.getAccountNo());
                row.createCell(4).setCellValue(employee.getIfscCode());
                row.createCell(5).setCellValue(employee.getPanNo());
                row.createCell(6).setCellValue(employee.getPfNo());
            }
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) * 2); // Adjust the multiplier as needed
            }

            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    private byte[] generateExcelFromEmployees(List<EmployeeEntity> employees) throws IOException {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Employees");
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Name", "EmployeeId", "Pan No", "Aadhaar No", "Bank Account No", "Contact No", "Date Of Birth", "UAN No", "Department And Designation"};
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
            for (EmployeeEntity employee : employees) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(employee.getFirstName() + " " + employee.getLastName());
                row.createCell(1).setCellValue(employee.getEmployeeId());
                row.createCell(2).setCellValue(employee.getPanNo());
                row.createCell(3).setCellValue(employee.getAadhaarId());
                row.createCell(4).setCellValue(employee.getAccountNo());
                row.createCell(5).setCellValue(employee.getMobileNo());
                row.createCell(6).setCellValue(employee.getDateOfBirth());
                row.createCell(7).setCellValue(employee.getUanNo());
                row.createCell(8).setCellValue(employee.getDepartmentName() + ", " + employee.getDesignationName());
            }
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) * 2); // Adjust the multiplier as needed
            }

            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    private byte[] generateEmployeePdf(List<EmployeeEntity> employeeEntities, CompanyEntity companyEntity, String detailType) throws IOException, DocumentException {
        try {
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream("templates/" + Constants.EMPLOYEE_DETAILS);
            if (inputStream == null) {
                throw new IOException("Template file not found: " + Constants.EMPLOYEE_DETAILS);
            }
            Template template = null;
            if (detailType.equalsIgnoreCase("employee")){
                template = freemarkerConfig.getTemplate(Constants.EMPLOYEE_DETAILS);
            }else if (detailType.equalsIgnoreCase("bank")){
                template = freemarkerConfig.getTemplate(Constants.EMPLOYEE_BANK_DETAILS);
            }
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