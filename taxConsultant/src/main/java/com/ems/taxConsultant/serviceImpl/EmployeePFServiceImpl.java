package com.ems.taxConsultant.serviceImpl;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.dao.EmployeeAccountDao;
import com.ems.taxConsultant.elasticSearch.OpenSearchOperations;
import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.*;
import com.ems.taxConsultant.request.EmployeePFRequest;
import com.ems.taxConsultant.request.EmployeePFUpdate;
import com.ems.taxConsultant.service.EmployeePFService;
import com.ems.taxConsultant.utils.Constants;
import com.ems.taxConsultant.utils.EmployeeUtils;
import com.ems.taxConsultant.utils.ResourceIdUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Month;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class EmployeePFServiceImpl implements EmployeePFService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmployeeAccountDao accountDao;


    @Override
    public ResponseEntity<?> employeePFComparing(String companyName, String month, String year, MultipartFile file) throws TaxConsultantException, IOException {
        Map<String, Object> responseBody;
        try {
            CompanyEntity companyEntity = validatingCompany(companyName);
            if (file.isEmpty()) {
                log.error("File is empty for company: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPTY_FILE), HttpStatus.BAD_REQUEST);
            }
            if (!file.getContentType().equals(Constants.EXCEL_TYPE)) {
                log.error("Invalid file type: {}", file.getContentType());
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.INVALID_FILE_TYPE), HttpStatus.BAD_REQUEST);
            }
            log.info("Processing employee accounts for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
            responseBody = parseExcelSheetForComparing(companyEntity, month, year, file, indexName);

        } catch (TaxConsultantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred while fetching company details: {}", e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_PF), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(responseBody), HttpStatus.CREATED);

    }


    private CompanyEntity validatingCompany(String companyName) throws TaxConsultantException {
        CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);

        if (companyEntity == null) {
            log.error("Company not found for ID: {}", companyName);
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
        }
        return companyEntity;

    }


    @Override
    public ResponseEntity<?> registerEmployeeForPF(String companyName, String month, String year, MultipartFile file) throws TaxConsultantException, IOException {

        try {
            CompanyEntity companyEntity = validatingCompany(companyName);
            log.info("Processing employee accounts for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
            if (file.isEmpty()) {
                log.error("File is empty for company: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPTY_FILE), HttpStatus.BAD_REQUEST);
            }
            if (!file.getContentType().equals(Constants.EXCEL_TYPE)) {
                log.error("Invalid file type: {}", file.getContentType());
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.INVALID_FILE_TYPE), HttpStatus.BAD_REQUEST);
            }
            List<EmployeeAccountEntity> employees = parseExcelSheet(companyEntity, month, year, file, indexName);
            for (EmployeeAccountEntity employee : employees) {
                openSearchOperations.saveEntity(employee, employee.getId(), indexName);
            }

        } catch (TaxConsultantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred while fetching company details: {}", e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_PF), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);

    }

    public List<EmployeeAccountEntity> parseExcelSheet(CompanyEntity company, String month, String year, MultipartFile file, String index)
            throws IOException, TaxConsultantException {

        List<EmployeeAccountEntity> employees = new ArrayList<>();
        List<String> alreadyRegisteredUans = new ArrayList<>();
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        List<EmployeeEntity> companyEmployees = openSearchOperations.getCompanyEmployees(company.getShortName());

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            // Get data from sheet
            String employeeName = getStringCellValue(row.getCell(0));
            String panNo = getStringCellValue(row.getCell(1));
            String uanPlain = getStringCellValue(row.getCell(2));
            String pfAmount = getStringCellValue(row.getCell(3));

            if (uanPlain == null || uanPlain.isBlank()) continue;
            String uanEncoded = base64Encode(uanPlain);

            EmployeeEntity matchedEmployee = companyEmployees.stream()
                    .filter(emp -> emp.getUanNo() != null && emp.getUanNo().equals(uanEncoded))
                    .findFirst()
                    .orElseThrow(() -> new TaxConsultantException("Employee not found for UAN: " + uanPlain, HttpStatus.NOT_FOUND));

            Collection<EmployeeAccountEntity> existingAccounts = accountDao.getEmployeeAccountByUanMonthYear(
                    uanEncoded, company.getId(), month, year, company.getShortName(), matchedEmployee.getId(), null);

            if (existingAccounts != null && !existingAccounts.isEmpty() && existingAccounts.stream().anyMatch(acc -> acc.getProfessionalTax() != null && !acc.getProfessionalTax().isEmpty())) {
                alreadyRegisteredUans.add(uanPlain);
                continue;
            }

            EmployeeAccountEntity employee = new EmployeeAccountEntity();
            String resourceId = ResourceIdUtils.generateEmployeeAccountResourceId(panNo, month, year);
            Optional<EmployeeAccountEntity> existingAccount = accountDao.get(resourceId, company.getShortName());
            if (existingAccount.isPresent() && existingAccount.get().getProvidentFund() != null && !existingAccount.get().getProvidentFund().isEmpty()) {
                log.error("Employee account already exists for ID: {}", resourceId);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_PF_ALREADY_EXISTS), HttpStatus.BAD_REQUEST);
            } else if (existingAccount.isEmpty()) {
                employee.setId(resourceId);
                employee.setEmployeeName(employeeName);
                employee.setEmployeeId(matchedEmployee.getId());
                employee.setPanNo(base64Encode(panNo));
                employee.setUanNo(uanEncoded);
                employee.setMonth(month);
                employee.setYear(year);
                employee.setCompanyId(company.getId());
                employee.setProvidentFund(base64Encode(pfAmount));
                employee.setType(Constants.EMPLOYEE_ACCOUNT);
            } else {
                employee = existingAccount.get();
                employee.setProvidentFund(base64Encode(pfAmount));
                employee.setUanNo(uanEncoded);
            }
            employees.add(employee);
        }

        workbook.close();

        if (!alreadyRegisteredUans.isEmpty()) {
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.PT_ALREADY_EXISTS_UANS) + String.join(", ", alreadyRegisteredUans), HttpStatus.CONFLICT);
        }

        return employees;
    }

    private String base64Encode(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        byte[] encodedBytes = Base64.getEncoder().encode(value.getBytes(StandardCharsets.UTF_8));
        return new String(encodedBytes, StandardCharsets.UTF_8);
    }


    private Map<String, Object> parseExcelSheetForComparing(
            CompanyEntity company, String month, String year, MultipartFile file, String indexName
    ) throws IOException, TaxConsultantException {

        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);
        List<Object> missedCompanyEmployees = new ArrayList<>();
        List<Object> notCompanyEmployees = new ArrayList<>();
        List<Object> pfMismatchEmployees = new ArrayList<>();


        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put(Constants.MISSED_COMPANY_EMPLOYEES, missedCompanyEmployees);
        responseBody.put(Constants.NOT_COMPANY_EMPLOYEES, notCompanyEmployees);
        responseBody.put(Constants.PF_MISMATCH_EMPLOYEES, pfMismatchEmployees);


        YearMonth current = YearMonth.of(Integer.parseInt(year), Month.valueOf(month.toUpperCase()));
        YearMonth previous = current.minusMonths(1);
        String prevMonth = previous.getMonth().toString();  // e.g., JUNE
        String prevYear = String.valueOf(previous.getYear());

        // Get active employees from DB
        List<EmployeeEntity> companyEmployees = openSearchOperations.getCompanyEmployees(company.getShortName());
        List<EmployeeEntity> activeEmployees = companyEmployees.stream()
                .filter(emp -> emp.getStatus() != null && emp.getStatus().equalsIgnoreCase(Constants.ACTIVE))
                .toList();

        for (EmployeeEntity emp : activeEmployees) {
            if (emp.getUanNo() != null && !emp.getUanNo().isEmpty()) {
                String uanDecoded = new String(Base64.getDecoder().decode(emp.getUanNo()));
                boolean foundInSheet = false;
                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    Row row = sheet.getRow(i);
                    String excelUan = getStringCellValue(row.getCell(2));
                    if (uanDecoded.equalsIgnoreCase(excelUan)) {
                        foundInSheet = true;
                        break;
                    }
                }
                if (!foundInSheet) {
                    missedCompanyEmployees.add(String.format(
                            "%s %s (UAN: %s)",
                            emp.getFirstName(),
                            emp.getLastName(),
                            uanDecoded
                    ));
                }
            }
        }

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            String employeeName = getStringCellValue(row.getCell(0)); // Name from Excel
            String excelUan = getStringCellValue(row.getCell(2));     // UAN from Excel
            String pfAmount = getStringCellValue(row.getCell(3));     // PF amount from Excel

            if (excelUan == null || excelUan.isBlank()) continue;

            String uanEncoded = base64Encode(excelUan);

            boolean existsInCompany = activeEmployees.stream().anyMatch(emp -> {
                String encodedUan = emp.getUanNo();
                if (encodedUan == null || encodedUan.isBlank()) return false;

                String decodedUan = new String(Base64.getDecoder().decode(encodedUan));
                return decodedUan.equalsIgnoreCase(excelUan);
            });

            Collection<EmployeeAccountEntity> previousAccount = accountDao.getEmployeeAccountByUanMonthYear(
                    uanEncoded, company.getId(), prevMonth, prevYear, company.getShortName(), null, null);

            if (previousAccount != null && !previousAccount.isEmpty()) {
                EmployeeAccountEntity prevEntity = previousAccount.iterator().next();
                String decodedPfAmount = new String(Base64.getDecoder().decode(prevEntity.getProvidentFund()));
                if (!pfAmount.equalsIgnoreCase(decodedPfAmount)) {
                    pfMismatchEmployees.add(
                            String.format("%s (Previous PF: %s, Current: %s)",
                                    employeeName,
                                    prevEntity.getProvidentFund(),
                                    pfAmount)
                    );
                }
            }
            if (!existsInCompany) {
                notCompanyEmployees.add(String.format(
                        "%s (UAN: %s)",
                        employeeName,
                        excelUan
                ));
            }
        }

        workbook.close();
        return responseBody;
    }

    private String getStringCellValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                // Prevent scientific notation, preserve full number
                return BigDecimal.valueOf(cell.getNumericCellValue())
                        .toPlainString()
                        .replace(".0", ""); // Clean trailing .0
            default:
                return new DataFormatter().formatCellValue(cell).trim();
        }
    }

    private boolean isRowEmpty(Row row) {
        for (Cell cell : row) {
            if (cell != null && cell.getCellType() != CellType.BLANK &&
                    !getStringCellValue(cell).isBlank()) {
                return false;
            }
        }
        return true;
    }


    @Override
    public ResponseEntity<?> addSingleEmployeeForPF(String companyName, EmployeePFRequest request) throws TaxConsultantException, IOException {
        EmployeeAccountEntity employee = null;
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for ID: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.info("Processing employee accounts for company: {}", companyName);
            String resourceId = ResourceIdUtils.generateEmployeeAccountResourceId(request.getPanNo(), request.getMonth(), request.getYear());
            EmployeeEntity employeeEntity = openSearchOperations.getEmployeeByUanNo(companyEntity.getShortName(), base64Encode(request.getUanNo()));
            if (employeeEntity == null) {
                log.error("Employee not found for UAN: {}", request.getUanNo());
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            Collection<EmployeeAccountEntity> employees = this.getEmployeeAccountDetails(companyName, employeeEntity.getId(), resourceId, request.getMonth(), request.getYear());
            if (employees != null && !employees.isEmpty() && employees.stream().anyMatch(emp -> emp.getProvidentFund() != null && !emp.getProvidentFund().isEmpty())) {
                log.error("Employee account already exists for ID: {}", resourceId);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_PF_ALREADY_EXISTS), HttpStatus.BAD_REQUEST);
            } else if (employees == null || employees.isEmpty()) {
                employee = objectMapper.convertValue(request, EmployeeAccountEntity.class);
                employee.setId(resourceId);
                employee.setCompanyId(companyEntity.getId());
                employee.setType(Constants.EMPLOYEE_ACCOUNT);
                employee.setPanNo(base64Encode(request.getPanNo()));
                employee.setUanNo(base64Encode(request.getUanNo()));
                employee.setProvidentFund(base64Encode(request.getProvidentFund()));
                employee.setEmployeeId(employeeEntity.getId());

            } else {
                employee = employees.iterator().next();
                employee.setProvidentFund(base64Encode(request.getProvidentFund()));
                employee.setUanNo(base64Encode(request.getUanNo()));
                if (employee.getPanNo() != null && !employee.getPanNo().isEmpty()) {
                    employee.setPanNo(base64Encode(employee.getPanNo()));
                }
                if (employee.getProfessionalTax() != null && !employee.getProfessionalTax().isEmpty()) {
                    employee.setProfessionalTax(base64Encode(employee.getProfessionalTax()));
                }
                if (employee.getTds() != null && !employee.getTds().isEmpty()) {
                    employee.setTds(base64Encode(employee.getTds()));
                }
            }

            accountDao.save(employee, companyName);

        } catch (TaxConsultantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred while fetching company details: {}", e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_PF), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);

    }

    @Override
    public Collection<EmployeeAccountEntity> getEmployeeAccountDetails(String companyName, String employeeId, String accountId, String month, String year) {
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Exception while fetching company details: Company not found for name: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Getting employee accounts for company: {}, employeeId: {}, month: {}, year: {}",
                    companyName, accountId, month, year);
            Collection<EmployeeAccountEntity> employeeAccountEntities = accountDao.getEmployeeAccountByUanMonthYear(null, companyEntity.getId(), month, year, companyEntity.getShortName(), employeeId, accountId);
            for (EmployeeAccountEntity entity : employeeAccountEntities) {
                entity.setUanNo(base64getDecode(entity.getUanNo()));
                entity.setProvidentFund(base64getDecode(entity.getProvidentFund()));
                entity.setPanNo(base64getDecode(entity.getPanNo()));
                entity.setTds(base64getDecode(entity.getTds()));
                entity.setProfessionalTax(base64getDecode(entity.getProfessionalTax()));
            }
            return employeeAccountEntities;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<?> updateEmployeeForPf(String companyName, String employeeId, String accountId, EmployeePFUpdate request) throws TaxConsultantException {

        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for ID: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.info("Processing employee accounts for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
            Object employeeEntity = openSearchOperations.getById(employeeId, null, indexName);
            if (employeeEntity == null) {
                log.error("Employee not found for ID: {}", employeeId);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            EmployeeAccountEntity employees = this.getEmployeeAccountDetails(companyName, employeeId, accountId, null, null)
                    .stream()
                    .findFirst()
                    .orElse(null);
            if (employees == null) {
                log.error("Employee account not found for ID: {}", accountId);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_PF_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            EmployeeAccountEntity entitySrc = objectMapper.convertValue(request, EmployeeAccountEntity.class);
            EmployeeAccountEntity entityTgt = objectMapper.convertValue(employees, EmployeeAccountEntity.class);

            BeanUtils.copyProperties(entitySrc, entityTgt, getNullPropertyNames(entitySrc));
            entityTgt.setProvidentFund(base64Encode(request.getProvidentFund()));

        } catch (TaxConsultantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred while fetching company details: {}", e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_PF), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);

    }

    @Override
    public void deleteEmployeeAccountDetails(String companyName, String employeeId, String accountId) {
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Exception while fetching company details: Company not found for name: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Deleting employee accounts for company: {}, employeeId: {}, accountId: {}",
                    companyName, employeeId, accountId);
            Collection<EmployeeAccountEntity> employeeAccountEntities = this.getEmployeeAccountDetails(companyName, employeeId, accountId, null, null);
            if (employeeAccountEntities == null || employeeAccountEntities.isEmpty()) {
                log.error("Employee account not found for ID: {}", accountId);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_PF_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            EmployeeAccountEntity employeeAccountEntity = accountDao.get(employeeAccountEntities.stream().findFirst().get().getId(), companyName).orElseThrow();
            accountDao.delete(employeeAccountEntity.getId(), companyName);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
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

    private String base64getDecode(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        byte[] decodedBytes = Base64.getDecoder().decode(value);
        return new String(decodedBytes, StandardCharsets.UTF_8);

    }

    @Override
    public ResponseEntity<?> employeesPFComparing(String companyName, String month, String year) throws TaxConsultantException {
        Map<String, Object> responseBody;
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found with name: {}", companyName);
                throw new TaxConsultantException("Company not found", HttpStatus.NOT_FOUND);
            }
            log.info("Processing employee accounts for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
            List<EmployeeResponse> employeeAccountsResponse = this.getEmployeesAccountsDetails(companyName)
                    .stream()
                    .filter(emp -> emp.getPfAmount() != null && !emp.getPfAmount().isEmpty()
                            && emp.getPanNo() != null && !emp.getPanNo().isEmpty()
                            && emp.getUanNumber() != null && !emp.getUanNumber().isEmpty())
                    .collect(Collectors.toList());

            if (employeeAccountsResponse == null || employeeAccountsResponse.isEmpty()) {
                log.warn("No employee accounts found for company: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            responseBody = forComparing(companyEntity, month, year, indexName, employeeAccountsResponse);

        } catch (TaxConsultantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred while fetching company details: {}", e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_PF), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(responseBody), HttpStatus.CREATED);

    }

    private Map<String, Object> forComparing(CompanyEntity companyEntity, String month, String year, String indexName, List<EmployeeResponse> employeeAccountsResponse) throws TaxConsultantException {
        List<Object> previousMonthMissed = new ArrayList<>();
        List<Object> currentMonthAdded = new ArrayList<>();
        List<Object> pfMismatchEmployees = new ArrayList<>();

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put(Constants.PREVIOUS_MONTH_MISSED_EMP, previousMonthMissed);
        responseBody.put(Constants.CURRENT_MONTH_ADDED_EMP, currentMonthAdded);
        responseBody.put(Constants.PF_MISMATCH_EMPLOYEES, pfMismatchEmployees);

        YearMonth current = YearMonth.of(Integer.parseInt(year), Month.valueOf(month.toUpperCase()));
        YearMonth previous = current.minusMonths(1);
        String prevMonth = previous.getMonth().toString();  // e.g., JUNE
        String prevYear = String.valueOf(previous.getYear());

        Set<String> currentMonthEmpIds = employeeAccountsResponse.stream()
                .map(EmployeeResponse::getId)
                .collect(Collectors.toSet());

        Collection<EmployeeAccountEntity> previousMonthAccounts = accountDao.getEmployeeAccountByUanMonthYear(null,
                companyEntity.getId(), prevMonth, prevYear, companyEntity.getShortName(), null, null);

        Set<String> previousMonthEmpIds = new HashSet<>();
        Map<String, EmployeeAccountEntity> previousEmpMap = new HashMap<>();
        if (previousMonthAccounts != null) {
            for (EmployeeAccountEntity prevEmp : previousMonthAccounts) {
                previousMonthEmpIds.add(prevEmp.getEmployeeId());
                previousEmpMap.put(prevEmp.getEmployeeId(), prevEmp);
            }
        }

        for (EmployeeResponse currentEmp : employeeAccountsResponse) {
            String empId = currentEmp.getId();
            if (!previousMonthEmpIds.contains(empId)) {
                currentMonthAdded.add(currentEmp.getFirstName() + " " + currentEmp.getLastName());
            } else {
                // PF mismatch check
                EmployeeAccountEntity prevEntity = previousEmpMap.get(empId);
                String decodedPf = new String(Base64.getDecoder().decode(prevEntity.getProvidentFund()));
                if (!currentEmp.getPfAmount().equalsIgnoreCase(decodedPf)) {
                    pfMismatchEmployees.add(
                            String.format("%s %s (Previous PF: %s, Current PF: %s)",
                                    currentEmp.getFirstName(), currentEmp.getLastName(),
                                    decodedPf,
                                    currentEmp.getPfAmount())
                    );
                }
            }
        }

        for (EmployeeAccountEntity prevEmp : previousMonthAccounts) {
            String empId = prevEmp.getEmployeeId();
            if (!currentMonthEmpIds.contains(empId)) {
                previousMonthMissed.add(prevEmp.getEmployeeName());
            }
        }

        return responseBody;
    }


    @Override
    public ResponseEntity<?> registerEmployeeForPF(String companyName, String month, String year) throws TaxConsultantException {

        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found with name: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.info("Processing employee accounts for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());

            List<EmployeeAccountEntity> employees = this.getEmployeesAccountsDetails(companyName)
                    .stream()
                    .filter(emp -> emp.getPfAmount() != null && !emp.getPfAmount().isEmpty()
                            && emp.getPanNo() != null && !emp.getPanNo().isEmpty()
                            && emp.getUanNumber() != null && !emp.getUanNumber().isEmpty())
                    .map(emp -> {
                        EmployeeAccountEntity employeeAccount = new EmployeeAccountEntity();
                        employeeAccount.setId(ResourceIdUtils.generateEmployeeAccountResourceId(emp.getPanNo(), month, year));
                        employeeAccount.setEmployeeId(emp.getId());
                        employeeAccount.setEmployeeName(emp.getFirstName() + " " + emp.getLastName());
                        employeeAccount.setCompanyId(companyEntity.getId());
                        employeeAccount.setPanNo(base64Encode(emp.getPanNo()));
                        employeeAccount.setUanNo(base64Encode(emp.getUanNumber()));
                        employeeAccount.setMonth(month);
                        employeeAccount.setYear(year);
                        employeeAccount.setProvidentFund(base64Encode(emp.getPfAmount()));
                        employeeAccount.setType(Constants.EMPLOYEE_ACCOUNT);
                        return employeeAccount;
                    })
                    .collect(Collectors.toList());

            for (EmployeeAccountEntity employee : employees) {
                openSearchOperations.saveEntity(employee, employee.getId(), indexName);
            }

        } catch (TaxConsultantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred while fetching company details: {}", e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_PF), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);

    }

    public List<EmployeeResponse> getEmployeesAccountsDetails(String companyName) throws TaxConsultantException {
        List<EmployeeEntity> employeeEntities;
        List<EmployeeResponse> employeeResponses = new ArrayList<>();
        try {
            employeeEntities = openSearchOperations.getCompanyEmployees(companyName);

            for (EmployeeEntity employee : employeeEntities) {
                if (employee.getStatus().equalsIgnoreCase(Constants.ACTIVE) && !employee.getEmployeeType().equalsIgnoreCase(Constants.ADMIN)) {
                    EmployeeUtils.unmaskEmployeeProperties(employee);
                    List<EmployeeSalaryEntity> employeeSalaryEntity = openSearchOperations.getEmployeeSalaries(companyName, employee.getId(), Constants.ACTIVE);
                    if (employeeSalaryEntity != null && !employeeSalaryEntity.isEmpty()) {
                        EmployeeSalaryEntity activeSalary = employeeSalaryEntity.get(0);
                        EmployeeResponse employeeResponse = EmployeeUtils.unMaskEmployeeAccountProperties(activeSalary, employee);
                        employeeResponses.add(employeeResponse);
                    }
                }

            }
        } catch (Exception ex) {
            log.error("Exception while fetching employees for company {}: {}", companyName, ex.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return employeeResponses;
    }

}
