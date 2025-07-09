package com.pb.employee.serviceImpl;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.DocumentException;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.dao.CandidateDao;
import com.pb.employee.dao.EmployeeDocumentDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.*;
import com.pb.employee.response.EmployeeDownloadResponse;
import com.pb.employee.response.EmployeeResponse;
import com.pb.employee.service.AttendanceService;
import com.pb.employee.service.EmployeeService;
import com.pb.employee.service.SalaryService;
import com.pb.employee.util.*;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.xhtmlrenderer.pdf.ITextRenderer;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.URL;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    AttendanceService attendanceService;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private OpenSearchOperations openSearchOperations;
    @Autowired
    private EmailUtils emailUtils;

    @Value("${file.upload.path}")
    private  String folderPath;

    @Autowired
    private Configuration freemarkerConfig;

    @Autowired
    private CandidateDao candidateDao;

    @Autowired
    private SalaryServiceImpl salaryService;

    @Autowired
    private EmployeeDocumentDao employeeDocumentDao;

    @Override
    public ResponseEntity<?> registerEmployee(EmployeeRequest employeeRequest, HttpServletRequest request) throws EmployeeException{
        // Check if a company with the same short or company name already exists
        String defaultPassword;
        log.debug("validating name {} employee Id {} exsited ", employeeRequest.getLastName(), employeeRequest.getEmployeeId());
        String resourceId = ResourceIdUtils.generateEmployeeResourceId(employeeRequest.getEmailId());
        String employeeExperienceId = ResourceIdUtils.generateEmployeePersonnelId(resourceId);
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
        try {
            String companyFolderPath = folderPath + employeeRequest.getCompanyName();
            File companyFolder = new File(companyFolderPath);
            if (!companyFolder.exists()) {
                log.error("Company folder does not exist: {}", companyFolderPath);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_FOLDER_NOT_EXIST), companyFolderPath),
                        HttpStatus.NOT_FOUND);
            }
        }catch (EmployeeException exception){
             log.error("Company folder does not exist");
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_FOLDER_NOT_EXIST),
                    HttpStatus.NOT_FOUND);
        }

        try{
            DepartmentEntity departmentEntity =null;
            List<DesignationEntity> designationEntity = null;
            departmentEntity = openSearchOperations.getDepartmentById(employeeRequest.getDepartment(), null, index);
            if (departmentEntity == null){
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DEPARTMENT)))),
                        HttpStatus.CONFLICT);
            }
            designationEntity = openSearchOperations.getCompanyDesignationByDepartmentId(employeeRequest.getCompanyName(), employeeRequest.getDepartment(), employeeRequest.getDesignation());
            if (designationEntity == null && designationEntity.size() <= 0){
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DESIGNATION)))),
                        HttpStatus.CONFLICT);
            }
            List<CompanyEntity> shortNameEntity = openSearchOperations.getCompanyByData(null, Constants.COMPANY, employeeRequest.getCompanyName());

            defaultPassword = PasswordUtils.generateStrongPassword();
            Entity companyEntity = EmployeeUtils.maskEmployeeProperties(employeeRequest, resourceId, shortNameEntity.getFirst().getId(),defaultPassword,null);
            EmployeePersonnelEntity employeePersonnelEntity = objectMapper.convertValue(employeeRequest.getPersonnelEntity(), EmployeePersonnelEntity.class);
            employeePersonnelEntity.setEmployeeId(resourceId);
            employeePersonnelEntity.setId(employeeExperienceId);
            employeePersonnelEntity.setType(Constants.EMPLOYEE_PERSONNEL);
            openSearchOperations.saveEntity(employeePersonnelEntity, employeeExperienceId, index);
            Entity result = openSearchOperations.saveEntity(companyEntity, resourceId, index);

        } catch (Exception exception) {
            log.error("Unable to save the employee details {} {}", employeeRequest.getEmailId(),exception.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_EMPLOYEE),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // Send the email with company details
        CompletableFuture.runAsync(() -> {
            try {
                String companyUrl = EmailUtils.getBaseUrl(request)+employeeRequest.getCompanyName()+Constants.SLASH+Constants.LOGIN ;
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
    public ResponseEntity<?> getEmployees(String companyName, HttpServletRequest request) throws EmployeeException, IOException {
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        List<EmployeeEntity> employeeEntities = null;
        List<EmployeeResponse> employeeResponses = new ArrayList<>();
        EmployeePersonnelEntity employeePersonnelEntity = null;

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
                EmployeeUtils.unmaskEmployeeProperties(employee, entity, designationEntity);

                List<EmployeeSalaryEntity> employeeSalaryEntity =  openSearchOperations.getEmployeeSalaries(companyName, employee.getId(), Constants.ACTIVE);
                if (employeeSalaryEntity != null && !employeeSalaryEntity.isEmpty()) {
                    EmployeeSalaryEntity activeSalary = employeeSalaryEntity.get(0);
                    EmployeeUtils.unMaskEmployeeSalaryProperties(activeSalary);
                    employee.setCurrentGross(activeSalary.getGrossAmount());
                }

                RelievingEntity relievingDetails = openSearchOperations.getRelievingByEmployeeId(employee.getId(),null,companyName);
                // Set status only if relieving details are found
                if (relievingDetails != null) {
                    LocalDate startDate = LocalDate.parse(relievingDetails.getResignationDate());
                    LocalDate endDate = LocalDate.parse(relievingDetails.getRelievingDate());

                    if (startDate != null && endDate != null) {
                        String status = null;
                        if (currentDate.isEqual(endDate) || currentDate.isAfter(endDate)) {
                            status = Constants.RELIEVED;
                        }

                        if (status != null && !status.equals(employee.getStatus())) {
                            employee.setStatus(status);

                            // Perform partial update for status only
                            Map<String, Object> partialUpdate = new HashMap<>();
                            partialUpdate.put(Constants.STATUS, status);
                            List<EmployeeSalaryEntity> employeeSalaryEntities = openSearchOperations.getEmployeeSalaries(companyName, employee.getId(), null);
                            if (!employeeSalaryEntities.isEmpty() && employeeSalaryEntities.size() != 0) {
                                for (EmployeeSalaryEntity salaryEntity : employeeSalaryEntities) {
                                    salaryEntity.setStatus(Constants.IN_ACTIVE);
                                    openSearchOperations.saveEntity(salaryEntity, salaryEntity.getSalaryId(), index);
                                }
                            }
                            openSearchOperations.partialUpdate(employee.getId(), partialUpdate, index);
                        }
                    }
                }
                if (!isCompanyAdmin(employee)) {
                    employeePersonnelEntity = openSearchOperations.getEmployeePersonnelDetails(employee.getId(), index);

                }
                EmployeeResponse employeeResponse = objectMapper.convertValue(employee, EmployeeResponse.class);
                if (employee.getProfileImage()!= null && !employee.getProfileImage().isEmpty()) {
                    String baseUrl = getBaseUrl(request);
                    String image = baseUrl + "/var/www/ems/assets/img/" + employee.getProfileImage();
                    employeeResponse.setProfileImage(image);
                }
                employeeResponse.setPersonnelEntity(employeePersonnelEntity);
                employeeResponses.add(employeeResponse);
            }
        } catch (Exception ex) {
            log.error("Exception while fetching employees for company {}: {}", companyName, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(employeeResponses), HttpStatus.OK);
    }

    private boolean isCompanyAdmin(EmployeeEntity employee) {
        return Constants.ADMIN.equalsIgnoreCase(employee.getEmployeeType());
    }

    @Override
    public EmployeeResponse getEmployeeById(String companyName, String employeeId, HttpServletRequest request) throws EmployeeException {
        log.info("getting details of {}", employeeId);
        EmployeeEntity entity = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        EmployeeResponse employeeResponse = null;
        EmployeePersonnelEntity employeePersonnelEntity = null;
        try {
            entity = openSearchOperations.getEmployeeById(employeeId, null, index);
            DepartmentEntity departmentEntity =null;
            DesignationEntity designationEntity = null;
            if (entity.getDepartment() !=null && entity.getDesignation() !=null) {
                departmentEntity = openSearchOperations.getDepartmentById(entity.getDepartment(), null, index);
                designationEntity = openSearchOperations.getDesignationById(entity.getDesignation(), null, index);
                EmployeeUtils.unmaskEmployeeProperties(entity, departmentEntity, designationEntity);

            }
            if (!entity.getEmployeeType().equalsIgnoreCase(Constants.ADMIN)) {
                employeePersonnelEntity = openSearchOperations.getEmployeePersonnelDetails(employeeId, index);
            }
            employeeResponse = objectMapper.convertValue(entity, EmployeeResponse.class);
            if (entity.getProfileImage()!= null && !entity.getProfileImage().isEmpty() && request != null) {
                String baseUrl = getBaseUrl(request);
                String image = baseUrl + "/var/www/ems/assets/img/" + entity.getProfileImage();
                employeeResponse.setProfileImage(image);
            }
            employeeResponse.setPersonnelEntity(employeePersonnelEntity);

        } catch (Exception ex) {
            log.error("Exception while fetching company details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return employeeResponse;
    }

    @Override
    public ResponseEntity<?> updateEmployeeById(String employeeId, EmployeeUpdateRequest employeeUpdateRequest) throws IOException, EmployeeException {
          log.info("getting details of {}", employeeId);
        EmployeeEntity user;
        EmployeePersonnelEntity employeePersonnelEntity;
        List<EmployeeSalaryEntity> salaryEntities;

        String index = ResourceIdUtils.generateCompanyIndex(employeeUpdateRequest.getCompanyName());
        try {
            user = openSearchOperations.getEmployeeById(employeeId, null, index);

            employeePersonnelEntity = openSearchOperations.getEmployeePersonnelDetails(employeeId, index);
            if (employeePersonnelEntity == null){
                employeePersonnelEntity = new EmployeePersonnelEntity();
                String resourceId = ResourceIdUtils.generateEmployeePersonnelId(employeeId);
                employeePersonnelEntity.setId(resourceId);
                employeePersonnelEntity.setEmployeeId(employeeId);
                employeePersonnelEntity.setType(Constants.EMPLOYEE_PERSONNEL);

            }
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
            salaryEntities = openSearchOperations.getEmployeeSalaries(employeeUpdateRequest.getCompanyName(), employeeId, null);

        } catch (Exception ex) {
            log.error("Exception while fetching company details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        DepartmentEntity departmentEntity =null;
        List<DesignationEntity> designationEntity = null;
        departmentEntity = openSearchOperations.getDepartmentById(employeeUpdateRequest.getDepartment(), null, index);
        if (departmentEntity == null){
            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DEPARTMENT)))),
                    HttpStatus.CONFLICT);
        }
        designationEntity = openSearchOperations.getCompanyDesignationByDepartmentId(employeeUpdateRequest.getCompanyName(), employeeUpdateRequest.getDepartment(), employeeUpdateRequest.getDesignation());
        if (designationEntity == null && designationEntity.size() <= 0){
            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DESIGNATION)))),
                    HttpStatus.CONFLICT);
        }
        int noOfChanges = EmployeeUtils.duplicateEmployeeProperties(user, employeePersonnelEntity, employeeUpdateRequest);
        if (noOfChanges==0){
            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_DATA_EXIST)))),
                    HttpStatus.CONFLICT);
        }
        Entity entity = CompanyUtils.maskEmployeeUpdateProperties(user, employeeUpdateRequest);
        BeanUtils.copyProperties(employeeUpdateRequest.getPersonnelEntity(), employeePersonnelEntity, getNullPropertyNames(employeeUpdateRequest.getPersonnelEntity()));
        openSearchOperations.saveEntity(employeePersonnelEntity, employeePersonnelEntity.getId(), index);
        openSearchOperations.saveEntity(entity, employeeId, index);
        // Step 7: Deactivate Salaries if Employee is Made Relieved
        if (Constants.RELIEVED.equalsIgnoreCase(employeeUpdateRequest.getStatus()) && salaryEntities != null) {
            for (EmployeeSalaryEntity salaryEntity : salaryEntities) {
                salaryEntity.setStatus(Constants.IN_ACTIVE);
                openSearchOperations.saveEntity(salaryEntity, salaryEntity.getSalaryId(), index);
            }
            log.info("Salaries set to Relieved for employee: {}", employeeId);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> deleteEmployeeById(String companyName, String employeeId) throws EmployeeException {
        log.info("Attempting to delete employee with ID: {}", employeeId);
        EmployeeResponse entity = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            entity = this.getEmployeeById(companyName, employeeId, null);
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
            openSearchOperations.deleteEntity(entity.getPersonnelEntity().getId(), index);
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
    public ResponseEntity<byte[]> downloadEmployeeDetails(String companyName, String format, EmployeeDetailsDownloadRequest detailsRequest, HttpServletRequest request) throws Exception {
        byte[] fileBytes = null;
        HttpHeaders headers = new HttpHeaders();
        List<EmployeeSalaryEntity> resPayloads = null;
        List<EmployeeDownloadResponse> employeeDownloadResponses = new ArrayList<>();

        try {

            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Company is not found");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            SSLUtil.disableSSLVerification();
            CompanyUtils.unmaskCompanyProperties(companyEntity, request);
            List<EmployeeEntity> employeeEntities = validateEmployee(companyEntity);
            EmployeeDownloadResponse response = new EmployeeDownloadResponse();
            for (EmployeeEntity employee : employeeEntities){
                resPayloads = openSearchOperations.getEmployeeSalaries(companyName, employee.getId(),Constants.ACTIVE);
                if (resPayloads != null && !resPayloads.isEmpty()) {
                    for (EmployeeSalaryEntity salary : resPayloads) {
                        EmployeeUtils.unMaskEmployeeSalaryProperties(salary);
                        EmployeeSalaryEntity latestSalary = resPayloads.get(0); // assuming first is latest
                        response.setResPayload(latestSalary);
                    }
                }
                response.setEmployeeEntity(employee);
                employeeDownloadResponses.add(response);
                response = new EmployeeDownloadResponse(); // Reset for next employee
                response.setResPayload(new EmployeeSalaryEntity()); // Reset salary payload
            }

            List<String> allowedFields=List.of("Name", "EmployeeId", "Email Id", "Contact No", "Alternate No", "Department And Designation",
                    "Date Of Hiring", "Date Of Birth", "Marital Status", "Pan No", "Aadhaar No", "UAN No", "PF No", "Bank Account No", "IFSC Code", "Bank Name",
                    "Bank Branch", "Current Gross", "Location", "Temporary Address", "Permanent Address", "Fixed Amount", "Variable Amount","Gross Amount",
                    "Total Earnings", "Net Salary", "Loss Of Pay", "Total Deductions", "Pf Tax", "Income Tax","Total Tax");

            List<String> fields = ( detailsRequest.getSelectedFields() == null || detailsRequest.getSelectedFields().isEmpty())
                    ? allowedFields : detailsRequest.getSelectedFields();

            List<String> invalidFields = fields.stream()
                    .filter(f -> !allowedFields.contains(f))
                    .toList();

            if (!invalidFields.isEmpty()) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_FIELD),
                        HttpStatus.BAD_REQUEST);
            }

            if(Constants.PDF_TYPE.equalsIgnoreCase(format) && (fields.size() < 1 || fields.size() > 8)){
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_FIELD_SIZE),
                        HttpStatus.BAD_REQUEST);
            }

            if (Constants.EXCEL_TYPE.equalsIgnoreCase(format)) {
                fileBytes = generateExcelFromEmployees(employeeDownloadResponses,fields);
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM); // For Excel download
                headers.setContentDisposition(ContentDisposition.builder("attachment")
                        .filename("EmployeeDetails.xlsx")
                        .build());
            } else if (Constants.PDF_TYPE.equalsIgnoreCase(format)) {
                fileBytes = generateEmployeePdf(employeeDownloadResponses, companyEntity, fields);
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
    public ResponseEntity<?> getEmployeeWithoutAttendance(String companyName, String month, String year) throws IOException, EmployeeException {
        try {

            List<EmployeeEntity> employeeEntities = openSearchOperations.getCompanyEmployees(companyName);
            if (employeeEntities == null || employeeEntities.isEmpty()) {
                log.error("Employees not found for company: {}", companyName);
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createFailureResponse(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            List<AttendanceEntity> attendanceEntities = openSearchOperations.getAttendanceByMonthAndYear(companyName,null,month,year);

            List<EmployeeEntity> employeesWithoutAttendance = EmployeeUtils.filterEmployeesWithoutAttendance(employeeEntities, attendanceEntities, month, year);

            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createSuccessResponse(employeesWithoutAttendance), HttpStatus.OK);

        } catch (Exception e) {
            log.error("An unexpected error occurred: {}", e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private List<EmployeeEntity> validateEmployee(CompanyEntity companyEntity) throws EmployeeException {
        try {
            List<EmployeeEntity> employees = openSearchOperations.getCompanyEmployees(companyEntity.getShortName());
            if (employees == null && employees.isEmpty()) {
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

    private byte[] generateExcelFromEmployees(List<EmployeeDownloadResponse> employees, List<String> selectedFields) throws IOException {

        Map<String, Function<EmployeeDownloadResponse, String>> employeeMap = new HashMap<>();
        employeeMap.put("Name", e -> e.getEmployeeEntity().getFirstName() + " " + e.getEmployeeEntity().getLastName());
        employeeMap.put("EmployeeId", e -> e.getEmployeeEntity().getEmployeeId());
        employeeMap.put("Pan No", e -> e.getEmployeeEntity().getPanNo());
        employeeMap.put("Aadhaar No", e -> e.getEmployeeEntity().getAadhaarId());
        employeeMap.put("Bank Account No", e -> e.getEmployeeEntity().getAccountNo());
        employeeMap.put("Contact No", e -> e.getEmployeeEntity().getMobileNo());
        employeeMap.put("Date Of Birth", e -> e.getEmployeeEntity().getDateOfBirth());
        employeeMap.put("UAN No", e -> e.getEmployeeEntity().getUanNo());
        employeeMap.put("Department And Designation", e -> e.getEmployeeEntity().getDepartmentName() + ", " + e.getEmployeeEntity().getDesignationName());
        employeeMap.put("Email Id", e -> e.getEmployeeEntity().getEmailId());
        employeeMap.put("Alternate No", e -> e.getEmployeeEntity().getAlternateNo());
        employeeMap.put("Date Of Hiring", e -> e.getEmployeeEntity().getDateOfHiring());
        employeeMap.put("Marital Status", e -> e.getEmployeeEntity().getMaritalStatus());
        employeeMap.put("PF No", e -> e.getEmployeeEntity().getPfNo());
        employeeMap.put("IFSC Code", e -> e.getEmployeeEntity().getIfscCode());
        employeeMap.put("Bank Name", e -> e.getEmployeeEntity().getBankName());
        employeeMap.put("Bank Branch", e -> e.getEmployeeEntity().getBankBranch());
        employeeMap.put("Current Gross", e -> e.getEmployeeEntity().getCurrentGross());
        employeeMap.put("Location", e -> e.getEmployeeEntity().getLocation());
        employeeMap.put("Temporary Address", e -> e.getEmployeeEntity().getTempAddress());
        employeeMap.put("Permanent Address", e -> e.getEmployeeEntity().getPermanentAddress());
        employeeMap.put("Fixed Amount", e -> e.getResPayload().getFixedAmount());
        employeeMap.put("Variable Amount", e -> e.getResPayload().getVariableAmount());
        employeeMap.put("Gross Amount", e -> e.getResPayload().getGrossAmount());
        employeeMap.put("Total Earnings", e -> e.getResPayload().getTotalEarnings());
        employeeMap.put("Net Salary", e -> e.getResPayload().getNetSalary());
        employeeMap.put("Loss Of Pay", e -> e.getResPayload().getLop());
        employeeMap.put("Total Deductions", e -> e.getResPayload().getTotalDeductions());
        employeeMap.put("Pf Tax", e -> e.getResPayload().getPfTax());
        employeeMap.put("Income Tax", e -> e.getResPayload().getIncomeTax());
        employeeMap.put("Total Tax", e -> e.getResPayload().getTotalTax());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Employees");
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            for (int i=0;i<selectedFields.size();i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(selectedFields.get(i));
                cell.setCellStyle(headerCellStyle);
            }
            int rowNum = 1;
            for (EmployeeDownloadResponse employee : employees) {
                Row row = sheet.createRow(rowNum++);
                for (int i=0;i<selectedFields.size();i++) {
                    String field = selectedFields.get(i);
                    String value = employeeMap.getOrDefault(field,e->"").apply(employee);
                    row.createCell(i).setCellValue(value != null ? value : "");
                }
            }
            for (int i = 0; i < selectedFields.size(); i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    private byte[] generateEmployeePdf(List<EmployeeDownloadResponse> employeeEntities, CompanyEntity companyEntity,List<String> selectedFields) throws IOException, DocumentException {
        try {
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream("templates/" + Constants.EMPLOYEE_DETAILS);
            if (inputStream == null) {
                throw new IOException("Template file not found: " + Constants.EMPLOYEE_DETAILS);
            }
            Template template = null;
            template = freemarkerConfig.getTemplate(Constants.EMPLOYEE_DETAILS);
            Map<String, Object> dataModel = new HashMap<>();
            dataModel.put("data", employeeEntities);
            dataModel.put("company", companyEntity);
            dataModel.put("selectedFields",selectedFields);
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

        float opacity = 0.1f;
        double scaleFactor = 1.6d;
        BufferedImage watermarkedImage = CompanyUtils.applyOpacity(originalImage, opacity, scaleFactor, 30);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(watermarkedImage, "png", baos);
        String base64Image = Base64.getEncoder().encodeToString(baos.toByteArray());
        dataModel.put(Constants.BLURRED_IMAGE, Constants.DATA + base64Image);
    }

    private String[] getNullPropertyNames(Object source) {
        final BeanWrapper src = new BeanWrapperImpl(source);
        Set<String> emptyNames = new HashSet<>();
        for (var pd : src.getPropertyDescriptors()) {
            Object value = src.getPropertyValue(pd.getName());
            if (value == null) {
                emptyNames.add(pd.getName());
            }
        }
        return emptyNames.toArray(new String[0]);
    }

    @Override
    public ResponseEntity<?> getEmployeeId(String companyName, EmployeeIdRequest employeeIdRequest) throws IOException, EmployeeException {

        log.info("Getting employee ID for company: {}", companyName);
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found: {}", companyName);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            List<EmployeeEntity> employeeEntities = openSearchOperations.getCompanyEmployeeByData(companyName,employeeIdRequest.getEmployeeId(),null);

            if (employeeEntities !=null && employeeEntities.size() > 0)  {
                log.error("Employee ID already exist: {}", employeeIdRequest.getEmployeeId());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_ID_ALREADY_EXISTS),employeeIdRequest.getEmployeeId()), HttpStatus.NOT_FOUND);
            }
            log.info("Employee ID is null: {}", employeeIdRequest.getEmployeeId());
            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
        }catch (EmployeeException exception){
            log.error("Exception while fetching employee ID: {}", exception.getMessage());
            throw exception;
        } catch (Exception e) {
            log.error("An unexpected error occurred: {}", e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> registerEmployeeWithCandidate(EmployeeRequest request, String candidateId, HttpServletRequest httpRequest) throws EmployeeException {
        String defaultPassword;
        log.debug("Validating candidateId {} and email {}", candidateId, request.getEmailId());

        String resourceId = ResourceIdUtils.generateEmployeeResourceId(request.getEmailId());
        String employeeExperienceId = ResourceIdUtils.generateEmployeePersonnelId(resourceId);
        String index = ResourceIdUtils.generateCompanyIndex(request.getCompanyName());

        Object existingEmployee;
        Optional<EmployeeDocumentEntity> documentEntityOptional;
        Collection<CandidateEntity> candidates;
        try {
            CompanyEntity company = openSearchOperations.getCompanyByCompanyName(request.getCompanyName(), Constants.INDEX_EMS);
            if (company == null) {
                log.warn("Company not found with name: {}", request.getCompanyName());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            candidates= candidateDao.getCandidates(request.getCompanyName(), candidateId, company.getId());
            if (CollectionUtils.isEmpty(candidates)) {
                log.warn("Candidate not found for candidateId: {}, companyName: {}, companyId: {}", candidateId, request.getCompanyName(), company.getId());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            // Candidate exists, now check if they have uploaded documents
            documentEntityOptional = employeeDocumentDao.getByDocuments(candidateId, request.getCompanyName());
            if (documentEntityOptional.isEmpty()) {
                log.warn("Candidate {} has not uploaded any documents in company {}", candidateId, request.getCompanyName());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_NOT_UPLOADED_DOCUMENTS), HttpStatus.NOT_FOUND);
            }

            List<EmployeeEntity> employees = openSearchOperations.getCompanyEmployees(request.getCompanyName());
            boolean candidateAlreadyExists = employees.stream().anyMatch(emp -> candidateId.equals(emp.getCandidateId()));
            if (candidateAlreadyExists) {
                log.error("Candidate {} has already been converted to an employee. Cannot register again.", candidateId);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_ALREADY_EXISTS), candidateId), HttpStatus.CONFLICT);
            }

            existingEmployee = openSearchOperations.getById(resourceId, null, index);
            if (existingEmployee != null) {
                log.error("Employee already exists with email: {}", request.getEmailId());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_EMAILID_ALREADY_EXISTS), request.getEmailId()), HttpStatus.CONFLICT);
            }

            Map<String, Object> duplicateValues = EmployeeUtils.duplicateValues(request, employees);
            if (!duplicateValues.isEmpty()) {
                log.warn("Duplicate employee details found: {}", duplicateValues);
                return new ResponseEntity<>(ResponseBuilder.builder().build().failureResponse(duplicateValues), HttpStatus.CONFLICT);
            }
        } catch (IOException e) {
            log.error("Unable to get company details for {}", request.getCompanyName());
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_EMPLOYEE), request.getEmailId()), HttpStatus.BAD_REQUEST);
        }

        try {
            DepartmentEntity departmentEntity = openSearchOperations.getDepartmentById(request.getDepartment(), null, index);
            if (departmentEntity == null) {
                log.warn("Department not found with ID: {} in index: {}", request.getDepartment(), index);
                return new ResponseEntity<>(ResponseBuilder.builder().build().createFailureResponse(new Exception(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DEPARTMENT))), HttpStatus.CONFLICT);
            }

            List<DesignationEntity> designationEntity = openSearchOperations.getCompanyDesignationByDepartmentId(request.getCompanyName(), request.getDepartment(), request.getDesignation());
            if (designationEntity == null || designationEntity.isEmpty()) {
                log.warn("No designation found for company: {}, department: {}, designationId: {}", request.getCompanyName(), request.getDepartment(), request.getDesignation());
                return new ResponseEntity<>(ResponseBuilder.builder().build().createFailureResponse(new Exception(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DESIGNATION))), HttpStatus.CONFLICT);
            }

            List<CompanyEntity> shortNameEntity = openSearchOperations.getCompanyByData(null, Constants.COMPANY, request.getCompanyName());
            if (shortNameEntity.isEmpty()) {
                log.warn("Company not found with name: {}", request.getCompanyName());
                return new ResponseEntity<>(ResponseBuilder.builder().build().createFailureResponse(new Exception(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_COMPANY))), HttpStatus.CONFLICT);
            }
            defaultPassword = PasswordUtils.generateStrongPassword();
            log.info("Generated default password for employee");

            Entity companyEntity = EmployeeUtils.maskEmployeeProperties(request, resourceId, shortNameEntity.getFirst().getId(), defaultPassword, candidateId);
            EmployeePersonnelEntity employeePersonnelEntity = objectMapper.convertValue(request.getPersonnelEntity(), EmployeePersonnelEntity.class);
            employeePersonnelEntity.setEmployeeId(resourceId);
            employeePersonnelEntity.setId(employeeExperienceId);
            employeePersonnelEntity.setType(Constants.EMPLOYEE_PERSONNEL);

            openSearchOperations.saveEntity(employeePersonnelEntity, employeeExperienceId, index);
            log.info("Saved employee personnel entity with id {}", employeeExperienceId);
            openSearchOperations.saveEntity(companyEntity, resourceId, index);
            log.info("Saved employee company entity with id {}", resourceId);

            candidateDao.get(candidates.stream().findFirst().get().getId(), request.getCompanyName())
                    .ifPresent(candidate -> {
                        candidate.setStatus(Constants.CONVERTED);
                        try {
                            candidateDao.save(candidate, request.getCompanyName());
                        } catch (EmployeeException e) {
                            throw new RuntimeException(e);
                        }
                        log.info("Updated candidate status to CONVERTED for candidateId {}", candidate.getId());
                    });
            if (documentEntityOptional.isPresent()) {
                EmployeeDocumentEntity document = documentEntityOptional.get();
                document.setReferenceId(resourceId);
                log.info("Linking employeeRefId {} to existing candidate document {}", resourceId, document.getId());
                employeeDocumentDao.save(document, request.getCompanyName());
                log.info("Linked candidate document to employee {}", resourceId);
            }

        } catch (Exception e) {
            log.error("Unable to save employee details for email {}: {}", request.getEmailId(), e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_EMPLOYEE), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        CompletableFuture.runAsync(() -> {
            try {
                String companyUrl = EmailUtils.getBaseUrl(httpRequest) + request.getCompanyName() + Constants.SLASH + Constants.LOGIN;
                log.info("Sending registration email to: {}", request.getEmailId());
                emailUtils.sendRegistrationEmail(request.getEmailId(), companyUrl, Constants.EMPLOYEE, defaultPassword);
            } catch (Exception e) {
                log.error("Failed to send email to: {}", request.getEmailId());
                throw new RuntimeException(e);
            }
        });

        log.info("Employee {} registered successfully with candidateId {}", request.getEmailId(), candidateId);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> uploadEmployeeImage(String companyName, String employeeId, MultipartFile file) throws EmployeeException, IOException {
        log.info("Uploading employee image for company: {}, employeeId: {}", companyName, employeeId);
        String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
        CompanyEntity company = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
        if (company == null) {
            log.error("Company not found for name: {}", companyName);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
        }
        EmployeeEntity employee = openSearchOperations.getEmployeeById(employeeId, null, indexName);
        if (employee == null) {
            log.error("Employee not found for ID: {}", employeeId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        try {
            List<String> allowedFileTypes = Arrays.asList(Constants.IMAGE_JPG, Constants.IMAGE_PNG, Constants.IMAGE_SVG);
            if (!file.isEmpty()){
                // Validate file type
                String contentType = file.getContentType();
                if (!allowedFileTypes.contains(contentType)) {
                    // Return an error response if file type is invalid
                    log.error("Invalid file type: {}", contentType);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_IMAGE), HttpStatus.BAD_REQUEST);
                }
                multiPartFileStore(file, companyName, employee);
            }

            openSearchOperations.saveEntity(employee, employeeId, indexName);
            log.info("Employee document entity saved for employeeId: {}", employeeId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
        } catch (EmployeeException ex) {
            log.error("EmployeeException while uploading employee image for employeeId {}: {}", employeeId, ex.getMessage(), ex);
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error while uploading employee image for employeeId {}: {}", employeeId, ex.getMessage(), ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_UPLOAD_IMAGE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> getEmployeeImage(String companyName, String employeeId,HttpServletRequest request) throws EmployeeException, IOException {
        log.info("Fetching employee image for company: {}, employeeId: {}", companyName, employeeId);
        String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
        CompanyEntity company = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
        if (company == null) {
            log.error("Company not found for name: {}", companyName);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
        }
        EmployeeEntity employee = openSearchOperations.getEmployeeById(employeeId, null, indexName);
        if (employee == null) {
            log.error("Employee not found for ID: {}", employeeId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        try {

            if (employee.getProfileImage()!= null){
                String baseUrl = getBaseUrl(request);
                String image = baseUrl + "/var/www/ems/assets/img/" + employee.getProfileImage();
                employee.setProfileImage(image);
            }
            log.info("Fetched employee image for employeeId: {}", employeeId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(employee.getProfileImage()), HttpStatus.OK);
        } catch (Exception ex) {
            log.error("Unexpected error while fetching employee image for employeeId {}: {}", employeeId, ex.getMessage(), ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_IMAGE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void multiPartFileStore(MultipartFile file, String companyName, EmployeeEntity employee) throws IOException, EmployeeException {
        if(!file.isEmpty()){
            String companyFolderPath = folderPath + companyName+"/" + employee.getFirstName()+"_"+employee.getEmailId()+"/";
            File folder = new File(companyFolderPath);
            if (!folder.exists()) {
                folder.mkdirs();
            }
            String filename = companyFolderPath+companyName+"_"+file.getOriginalFilename();
            file.transferTo(new File(filename));
            employee.setProfileImage(companyName+"/" + employee.getFirstName()+"_"+employee.getEmailId()+"/"+companyName+"_"+file.getOriginalFilename());
            ResponseEntity.ok(filename);
        }
    }

    public static String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme(); // http or https
        String serverName = request.getServerName(); // localhost or IP address
        int serverPort = request.getServerPort(); // port number
        String contextPath = request.getContextPath(); // context path

        return scheme + "://" + serverName + ":" + serverPort + contextPath;
    }
}