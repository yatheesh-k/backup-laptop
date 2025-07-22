package com.ems.taxConsultant.serviceImpl;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.dao.EmployeeAccountDao;
import com.ems.taxConsultant.elasticSearch.OpenSearchOperations;
import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.CompanyEntity;
import com.ems.taxConsultant.persistance.EmployeeAccountEntity;
import com.ems.taxConsultant.persistance.EmployeeEntity;
import com.ems.taxConsultant.request.EmployeePTRequest;
import com.ems.taxConsultant.request.EmployeePTUpdate;
import com.ems.taxConsultant.service.EmployeePTService;
import com.ems.taxConsultant.utils.Constants;
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

@Slf4j
@Service
public class EmployeePTServiceImpl implements EmployeePTService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmployeeAccountDao accountDao;

    @Override
    public ResponseEntity<?> employeePTComparing(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException {
        Map<String, Object> responseBody;
        try {
            CompanyEntity companyEntity = validatingCompanyAndFile(companyName, file);
            log.info("Processing employee PT accounts for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
            responseBody = parseExcelSheetForPTComparing(companyEntity, month, year, file, indexName);
        } catch (AccountantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_PT), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(responseBody), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> registerEmployeeForPT(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException {
        try {
            CompanyEntity companyEntity = validatingCompanyAndFile(companyName, file);
            log.info("Processing PT accounts for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
            List<EmployeeAccountEntity> employees = parseExcelSheetForPT(companyEntity, month, year, file, indexName);

            for (EmployeeAccountEntity employee :employees) {
                openSearchOperations.saveEntity(employee, employee.getId(), indexName);
            }

        } catch (AccountantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred while saving PT: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_PT), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> updateEmployeeForPT(String companyName, String employeeId, String accountId, EmployeePTUpdate request) throws AccountantException {

        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for ID: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            log.info("Processing PT update for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());

            Object employeeEntity = openSearchOperations.getById(employeeId, null, indexName);
            if (employeeEntity == null) {
                log.error("Employee not found for ID: {}", employeeId);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            Collection<EmployeeAccountEntity> employees = this.getEmployeeAccountDetails(companyName, employeeId, accountId, null,null);
            if (employees == null || employees.isEmpty()) {
                log.error("Employee account not found for ID: {}", accountId);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_PT_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            double salary = Double.parseDouble(request.getSalaryAmount());

            int ptAmount;
            if (salary <= 15000) {
                ptAmount = 0;
            } else if (salary <= 20000) {
                ptAmount = 150;
            } else {
                ptAmount = 200;
            }

            EmployeeAccountEntity entitySrc = objectMapper.convertValue(request, EmployeeAccountEntity.class);
            EmployeeAccountEntity entityTgt = objectMapper.convertValue(employees.iterator().next(), EmployeeAccountEntity.class);

            BeanUtils.copyProperties(entitySrc, entityTgt, getNullPropertyNames(entitySrc));

            entityTgt.setProfessionalTax(base64Encode(String.valueOf(ptAmount)));
            openSearchOperations.saveEntity(entityTgt, entityTgt.getId(), indexName);

        } catch (AccountantException e) {
            log.error("Exception while updating PT: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error occurred while updating PT: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_PT), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> addSingleEmployeeForPT(String companyName, EmployeePTRequest request) throws AccountantException, IOException {
        EmployeeAccountEntity employee = null;
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for ID: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.info("Processing employee accounts for company: {}", companyName);
            String resourceId = ResourceIdUtils.generateEmployeeAccountResourceId(request.getPanNo(), request.getMonth(), request.getYear());
            EmployeeEntity employeeEntity = openSearchOperations.getEmployeeByPanNo(companyEntity.getShortName(), base64Encode(request.getPanNo()));
            if (employeeEntity == null) {
                log.error("Employee not found for PAN: {}", request.getPanNo());
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            double salary = Double.parseDouble(request.getSalaryAmount());
            int ptAmount;
            if (salary <= 15000) {
                ptAmount = 0;
            } else if (salary <= 20000) {
                ptAmount = 150;
            } else {
                ptAmount = 200;
            }

            Collection<EmployeeAccountEntity> employees = this.getEmployeeAccountDetails(companyName, employeeEntity.getId(), resourceId, request.getMonth(), request.getYear());
            if (employees != null && !employees.isEmpty() && employees.stream().anyMatch(emp -> emp.getProfessionalTax() != null && !emp.getProfessionalTax().isEmpty())) {
                log.error("Employee account already exists for ID: {}", resourceId);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_PT_ALREADY_EXISTS), HttpStatus.BAD_REQUEST);
            }else if (employees == null || employees.isEmpty()) {
                employee = objectMapper.convertValue(request, EmployeeAccountEntity.class);
                employee.setId(resourceId);
                employee.setCompanyId(companyEntity.getId());
                employee.setType(Constants.EMPLOYEE_ACCOUNT);
                employee.setPanNo(base64Encode(request.getPanNo()));
                employee.setProfessionalTax(base64Encode(String.valueOf(ptAmount)));
                employee.setEmployeeId(employeeEntity.getId());
            }else {
                employee=employees.iterator().next();
                employee.setProfessionalTax(base64Encode(String.valueOf(ptAmount)));
            }

            accountDao.save(employee, companyName);

        }catch (AccountantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred while fetching company details: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_PT), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);

    }

    private Map<String, Object> parseExcelSheetForPTComparing(
            CompanyEntity company, String month, String year, MultipartFile file, String indexName) throws IOException, AccountantException {

        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        List<Object> missedCompanyEmployees = new ArrayList<>();
        List<Object> notCompanyEmployees = new ArrayList<>();
        List<Object> ptMismatchEmployees = new ArrayList<>();
        List<Object> ptMissingForPfEmployees = new ArrayList<>();
        List<Object> ptEmployeesWithoutPf = new ArrayList<>();


        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put(Constants.MISSED_COMPANY_EMPLOYEES, missedCompanyEmployees);
        responseBody.put(Constants.NOT_COMPANY_EMPLOYEES, notCompanyEmployees);
        responseBody.put(Constants.PT_MISMATCH_EMPLOYEES, ptMismatchEmployees);
        responseBody.put(Constants.PT_MISSING_FOR_PF_EMPLOYEES, ptMissingForPfEmployees);
        responseBody.put(Constants.PT_EMPLOYEES_WITHOUT_PF, ptEmployeesWithoutPf);



        YearMonth current = YearMonth.of(Integer.parseInt(year), Month.valueOf(month.toUpperCase()));
        YearMonth previous = current.minusMonths(1);
        String prevMonth = previous.getMonth().toString();
        String prevYear = String.valueOf(previous.getYear());

        List<EmployeeEntity> companyEmployees = openSearchOperations.getCompanyEmployees(company.getShortName());
        List<EmployeeEntity> activeEmployees = companyEmployees.stream()
                .filter(emp -> Constants.ACTIVE.equalsIgnoreCase(emp.getStatus()))
                .toList();

        for (EmployeeEntity emp : activeEmployees) {
            if (emp.getPanNo() != null && !emp.getPanNo().isEmpty()) {
                String panDecoded = new String(Base64.getDecoder().decode(emp.getPanNo()));
                boolean foundInSheet = false;
                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    Row row = sheet.getRow(i);
                    String excelPan = getStringCellValue(row.getCell(1));
                    if (panDecoded.equalsIgnoreCase(excelPan)) {
                        foundInSheet = true;
                        break;
                    }
                }
                if (!foundInSheet) {
                    missedCompanyEmployees.add(String.format(
                            "%s %s (PAN: %s)",
                            emp.getFirstName(), emp.getLastName(), panDecoded
                    ));
                }
                if (emp.getUanNo() != null && !emp.getUanNo().isBlank()) {
                    String decodedUan = new String(Base64.getDecoder().decode(emp.getUanNo()));
                    if (!foundInSheet) {
                        ptMissingForPfEmployees.add(String.format(
                                "%s %s (PAN: %s, UAN: %s) ",
                                emp.getFirstName(), emp.getLastName(), panDecoded, decodedUan
                        ));
                    }
                }
            }
        }

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            String employeeName = getStringCellValue(row.getCell(0)); // Name column
            String excelPan = getStringCellValue(row.getCell(1));     // PAN column
            String ptAmount = getStringCellValue(row.getCell(2));     // PT Amount column

            if (excelPan == null || excelPan.isBlank()) continue;
            String panEncoded = base64Encode(excelPan);

            boolean existsInCompany = activeEmployees.stream().anyMatch(emp -> {
                String encodedPan = emp.getPanNo();
                if (encodedPan == null || encodedPan.isBlank()) return false;
                String decodedPan = new String(Base64.getDecoder().decode(encodedPan));
                return decodedPan.equalsIgnoreCase(excelPan);
            });

            if (existsInCompany) {
                EmployeeEntity emp = activeEmployees.stream()
                        .filter(e -> {
                            String decodedPan = new String(Base64.getDecoder().decode(e.getPanNo()));
                            return decodedPan.equalsIgnoreCase(excelPan);
                        }).findFirst().orElse(null);

                if (emp != null && (emp.getUanNo() == null || emp.getUanNo().isBlank())) {
                    ptEmployeesWithoutPf.add(String.format("%s (PAN: %s) has no PF (UAN)", employeeName, excelPan));
                }
            }

            Collection<EmployeeAccountEntity> previousAccount = accountDao.getEmployeeAccountByPanMonthYear(
                    panEncoded, company.getId(), prevMonth, prevYear, company.getShortName(), null, null);

            if (previousAccount != null && !previousAccount.isEmpty()) {
                EmployeeAccountEntity prevEntity = previousAccount.iterator().next();
                String decodedPtAmount = new String(Base64.getDecoder().decode(prevEntity.getProfessionalTax()));
                if (!ptAmount.equalsIgnoreCase(decodedPtAmount)) {
                    ptMismatchEmployees.add(
                            String.format("%s (Previous PT: %s, Current: %s)", employeeName, decodedPtAmount, ptAmount)
                    );
                }
            }

            if (!existsInCompany) {
                notCompanyEmployees.add(String.format("%s (PAN: %s)", employeeName, excelPan));
            }
        }

        workbook.close();
        return responseBody;
    }


    private CompanyEntity validatingCompanyAndFile(String companyName, MultipartFile file) throws AccountantException {
        CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
        if (companyEntity == null) {
            log.error("Company not found for ID: {}", companyName);
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
        }
        if (file.isEmpty()) {
            log.error("File is empty for company: {}", companyName);
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPTY_FILE), HttpStatus.BAD_REQUEST);
        }
        if (!file.getContentType().equals(Constants.EXCEL_TYPE)) {
            log.error("Invalid file type: {}", file.getContentType());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.INVALID_FILE_TYPE), HttpStatus.BAD_REQUEST);
        }
        return companyEntity;

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


    private String base64Encode(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }


    public List<EmployeeAccountEntity> parseExcelSheetForPT(CompanyEntity company, String month, String year, MultipartFile file, String index)
            throws IOException, AccountantException {

        List<EmployeeAccountEntity> employees = new ArrayList<>();
        List<String> alreadyRegisteredPans = new ArrayList<>();
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        List<EmployeeEntity> companyEmployees = openSearchOperations.getCompanyEmployees(company.getShortName());

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;


            String employeeName = getStringCellValue(row.getCell(0));
            String panPlain = getStringCellValue(row.getCell(1));
            String salaryCell = getStringCellValue(row.getCell(2));

            if (panPlain == null || panPlain.isBlank()||salaryCell== null||salaryCell.isBlank()) continue;

            double salary;
            try {
                salary = Double.parseDouble(salaryCell);
            } catch (NumberFormatException e) {
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.INVALID_SALARY_FORMAT), HttpStatus.BAD_REQUEST);
            }

            int ptAmount;
            if (salary <= 15000) {
                ptAmount = 0;
            } else if (salary <= 20000) {
                ptAmount = 150;
            } else {
                ptAmount = 200;
            }

            String panEncoded = base64Encode(panPlain);

            EmployeeEntity matchedEmployee = companyEmployees.stream()
                    .filter(emp -> emp.getPanNo() != null && emp.getPanNo().equals(panEncoded))
                    .findFirst()
                    .orElseThrow(() -> new AccountantException("Employee not found for PAN: " + panPlain, HttpStatus.NOT_FOUND));

            Collection<EmployeeAccountEntity> existingAccounts = accountDao.getEmployeeAccountByPanMonthYear(
                    panEncoded, company.getId(), month, year, company.getShortName(), matchedEmployee.getId(), null);

            if (existingAccounts != null && !existingAccounts.isEmpty() && existingAccounts.stream()
                    .anyMatch(acc -> acc.getProfessionalTax() != null && !acc.getProfessionalTax().isEmpty())) {
                alreadyRegisteredPans.add(panPlain);
                continue;
            }


            EmployeeAccountEntity employee = new EmployeeAccountEntity();
            String resourceId = ResourceIdUtils.generateEmployeeAccountResourceId(panPlain, month, year);

            Optional<EmployeeAccountEntity> existingAccount = accountDao.get(resourceId, company.getShortName());
            if (existingAccount.isPresent() && existingAccount.get().getProfessionalTax()!=null &&!existingAccount.get().getProfessionalTax().isEmpty()) {
                log.error("Employee account already exists for ID: {}", resourceId);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_PT_ALREADY_EXISTS), HttpStatus.BAD_REQUEST);
            }else if (existingAccount.isEmpty()) {
                employee.setId(resourceId);
                employee.setEmployeeName(employeeName);
                employee.setEmployeeId(matchedEmployee.getId());
                employee.setPanNo(panEncoded);
                employee.setMonth(month);
                employee.setYear(year);
                employee.setCompanyId(company.getId());
                employee.setProfessionalTax(base64Encode(String.valueOf(ptAmount)));
                employee.setType(Constants.EMPLOYEE_ACCOUNT);
            }else{
                employee = existingAccount.get();
                employee.setProfessionalTax(base64Encode(String.valueOf(ptAmount)));
            }
            employees.add(employee);
        }

        workbook.close();

        if (!alreadyRegisteredPans.isEmpty()) {
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.PT_ALREADY_EXISTS_PANS) + String.join(", ", alreadyRegisteredPans), HttpStatus.CONFLICT);
        }

        return employees;
    }


    public Collection<EmployeeAccountEntity> getEmployeeAccountDetails(String companyName, String employeeId, String accountId, String month, String year) {
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Exception while fetching company details: Company not found for name: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Getting employee accounts for company: {}, employeeId: {}, month: {}, year: {}",
                    companyName, accountId, month, year);
            Collection<EmployeeAccountEntity> employeeAccountEntities = accountDao.getEmployeeAccountByUanMonthYear(null, companyEntity.getId(), month, year, companyEntity.getShortName(), employeeId, accountId);
            return employeeAccountEntities;
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

}
