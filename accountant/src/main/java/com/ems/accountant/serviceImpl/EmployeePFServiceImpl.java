package com.ems.accountant.serviceImpl;

import com.ems.accountant.common.ResponseBuilder;
import com.ems.accountant.dao.EmployeeAccountDao;
import com.ems.accountant.elasticSearch.OpenSearchOperations;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.exception.ErrorMessageHandler;
import com.ems.accountant.exception.ErrorMessageKey;
import com.ems.accountant.persistance.CompanyEntity;
import com.ems.accountant.persistance.EmployeeAccountEntity;
import com.ems.accountant.persistance.EmployeeEntity;
import com.ems.accountant.request.EmployeePFRequest;
import com.ems.accountant.request.EmployeePFUpdate;
import com.ems.accountant.service.EmployeePFService;
import com.ems.accountant.utils.Constants;
import com.ems.accountant.utils.ResourceIdUtils;
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
public class EmployeePFServiceImpl implements EmployeePFService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmployeeAccountDao accountDao;


    @Override
    public ResponseEntity<?> employeePFComparing(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException {
        Map<String, Object> responseBody;
        try {
            CompanyEntity companyEntity = validatingCompanyAndFile(companyName, file);
            log.info("Processing employee accounts for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
            responseBody = parseExcelSheetForComparing(companyEntity, month, year, file, indexName);

        }catch (AccountantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred while fetching company details: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_PF), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(responseBody), HttpStatus.CREATED);

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


    @Override
    public ResponseEntity<?> registerEmployeeForPF(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException {

        try {
            CompanyEntity companyEntity = validatingCompanyAndFile(companyName, file);
            log.info("Processing employee accounts for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
            List<EmployeeAccountEntity> employees = parseExcelSheet(companyEntity, month, year, file, indexName);
            for (EmployeeAccountEntity employee :employees) {
                openSearchOperations.saveEntity(employee, employee.getId(), indexName);
            }

        }catch (AccountantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred while fetching company details: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_PF), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);

    }

    public List<EmployeeAccountEntity> parseExcelSheet(CompanyEntity company, String month, String year, MultipartFile file, String index)
            throws IOException, AccountantException {

        List<EmployeeAccountEntity> employees = new ArrayList<>();
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
                    .orElseThrow(() -> new AccountantException("Employee not found for UAN: " + uanPlain, HttpStatus.NOT_FOUND));

            EmployeeAccountEntity employee = new EmployeeAccountEntity();
            String resourceId = ResourceIdUtils.generateEmployeeAccountResourceId(uanEncoded, month, year);

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

            employees.add(employee);
        }

        workbook.close();
        return employees;
    }

    private String base64Encode(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }


    private Map<String, Object> parseExcelSheetForComparing(
            CompanyEntity company, String month, String year, MultipartFile file, String indexName
    ) throws IOException, AccountantException {

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
    public ResponseEntity<?> addSingleEmployeeForPF(String companyName, EmployeePFRequest request) throws AccountantException, IOException {

        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for ID: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.info("Processing employee accounts for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
            String resourceId = ResourceIdUtils.generateEmployeeAccountResourceId(request.getUanNo(), request.getMonth(), request.getYear());
            EmployeeEntity employeeEntity = openSearchOperations.getEmployeeByUanNo(companyEntity.getShortName(), request.getUanNo());
            if (employeeEntity == null) {
                log.error("Employee not found for UAN: {}", request.getUanNo());
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            Collection<EmployeeAccountEntity> employees = this.getEmployeeAccountDetails(companyName, employeeEntity.getEmployeeId(), resourceId, request.getMonth(), request.getYear());
            if (employees != null && !employees.isEmpty() && employees.stream().anyMatch(emp -> !emp.getProvidentFund().isEmpty())) {
                log.error("Employee account already exists for UAN: {}", request.getUanNo());
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_PF_ALREADY_EXISTS), HttpStatus.BAD_REQUEST);
            }
            EmployeeAccountEntity employee = objectMapper.convertValue(request, EmployeeAccountEntity.class);
            employee.setId(resourceId);
            employee.setCompanyId(companyEntity.getId());
            employee.setType(Constants.EMPLOYEE_ACCOUNT);
            employee.setPanNo(base64Encode(request.getPanNo()));
            employee.setUanNo(base64Encode(request.getUanNo()));
            employee.setProvidentFund(base64Encode(request.getProvidentFund()));
            employee.setEmployeeId(employeeEntity.getId());

            accountDao.save(employee, companyName);

        }catch (AccountantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred while fetching company details: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_PF), HttpStatus.INTERNAL_SERVER_ERROR);
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
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
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
    public ResponseEntity<?> updateEmployeeForPf(String companyName, String employeeId, String accountId, EmployeePFUpdate request) throws AccountantException {

        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for ID: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.info("Processing employee accounts for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
            Object employeeEntity = openSearchOperations.getById(employeeId, null, indexName);
            if (employeeEntity == null) {
                log.error("Employee not found for ID: {}", employeeId);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            EmployeeAccountEntity employees = this.getEmployeeAccountDetails(companyName, employeeId, accountId, null, null)
                    .stream()
                    .findFirst()
                    .orElse(null);
            if (employees == null) {
                log.error("Employee account not found for ID: {}", accountId);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_PF_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            EmployeeAccountEntity entitySrc = objectMapper.convertValue(request, EmployeeAccountEntity.class);
            EmployeeAccountEntity entityTgt = objectMapper.convertValue(employees, EmployeeAccountEntity.class);

            BeanUtils.copyProperties(entitySrc, entityTgt, getNullPropertyNames(entitySrc));
            entityTgt.setProvidentFund(base64Encode(request.getProvidentFund()));

        }catch (AccountantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred while fetching company details: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_PF), HttpStatus.INTERNAL_SERVER_ERROR);
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
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Deleting employee accounts for company: {}, employeeId: {}, accountId: {}",
                    companyName, employeeId, accountId);
            Collection<EmployeeAccountEntity> employeeAccountEntities = this.getEmployeeAccountDetails(companyName, employeeId, accountId, null, null);
            if (employeeAccountEntities == null || employeeAccountEntities.isEmpty()) {
                log.error("Employee account not found for ID: {}", accountId);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_PF_NOT_FOUND), HttpStatus.NOT_FOUND);
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

}
