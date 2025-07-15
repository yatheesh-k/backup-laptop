package com.ems.accountant.serviceImpl;

import com.ems.accountant.common.ResponseBuilder;
import com.ems.accountant.dao.EmployeeAccountDao;
import com.ems.accountant.request.EmployeeTDSUpdate;
import com.ems.accountant.service.EmployeeTdsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.stereotype.Service;
import com.ems.accountant.elasticSearch.OpenSearchOperations;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.exception.ErrorMessageHandler;
import com.ems.accountant.exception.ErrorMessageKey;
import com.ems.accountant.persistance.CompanyEntity;
import com.ems.accountant.persistance.EmployeeAccountEntity;
import com.ems.accountant.persistance.EmployeeEntity;
import com.ems.accountant.utils.Constants;
import com.ems.accountant.utils.ResourceIdUtils;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Month;
import java.time.YearMonth;
import java.util.*;

@Slf4j
@Service
public class EmployeeTdsServiceImpl implements EmployeeTdsService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private EmployeeAccountDao accountDao;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public ResponseEntity<?> employeeTDSComparing(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException {
        Map<String, Object> responseBody;
        try {
            CompanyEntity companyEntity = validatingCompanyAndFile(companyName, file);
            log.info("Processing employee PT accounts for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
            responseBody = parseExcelSheetForTDSComparing(companyEntity, month, year, file, indexName);
        } catch (AccountantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_TDS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(responseBody), HttpStatus.CREATED);
    }

    private CompanyEntity validatingCompanyAndFile(String companyName, MultipartFile file) throws AccountantException {
        CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
        if (companyEntity == null) {
            log.error("Company not found: {}", companyName);
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
        }
        if (file.isEmpty()) {
            log.error("Uploaded file is empty for company: {}", companyName);
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPTY_FILE), HttpStatus.BAD_REQUEST);
        }
        if (!file.getContentType().equals(Constants.EXCEL_TYPE)) {
            log.error("Invalid file type: {}", file.getContentType());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.INVALID_FILE_TYPE), HttpStatus.BAD_REQUEST);
        }
        return companyEntity;
    }

    @Override
    public ResponseEntity<?> registerEmployeeForTDS(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException {
        try {
            CompanyEntity companyEntity = validatingCompanyAndFile(companyName, file);
            log.info("Processing TDS accounts for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
            List<EmployeeAccountEntity> employees = parseExcelSheetForTDS(companyEntity, month, year, file, indexName);

            for (EmployeeAccountEntity employee : employees) {
                // PAN-based lookup
                Collection<EmployeeAccountEntity> accounts = accountDao.getEmployeeAccountByPanMonthYear(
                        employee.getPanNo(), companyEntity.getId(), month, year, companyEntity.getShortName(), null, null
                );

                if (accounts != null && !accounts.isEmpty()) {
                    EmployeeAccountEntity existingAccount = accounts.iterator().next();

                    // If TDS already exists, throw conflict
                    if (existingAccount.getTds() != null && !existingAccount.getTds().isBlank()) {
                        log.error("TDS already exists for Employee ID: {} in month {}, year {}", existingAccount.getEmployeeId(), month, year);
                        throw new AccountantException(
                                String.format("TDS already updated for Employee ID: %s", existingAccount.getEmployeeId()),
                                HttpStatus.CONFLICT
                        );
                    }

                    // Update and save
                    existingAccount.setTds(employee.getTds());
                    openSearchOperations.saveEntity(existingAccount, existingAccount.getId(), indexName);
                    log.info("Updated TDS for Employee: {} for month: {}, year: {}", existingAccount.getEmployeeId(), month, year);
                } else {
                    log.warn("No employee account found for PAN: {} for month: {}, year: {}", employee.getPanNo(), month, year);
                }
            }

        } catch (AccountantException e) {
            log.error("Exception while saving TDS: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error occurred while saving TDS: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_TDS), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    public List<EmployeeAccountEntity> parseExcelSheetForTDS(CompanyEntity company, String month, String year, MultipartFile file, String index) throws IOException, AccountantException {

        List<EmployeeAccountEntity> employees = new ArrayList<>();
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        List<EmployeeEntity> companyEmployees = openSearchOperations.getCompanyEmployees(company.getShortName());

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            String employeeName = getStringCellValue(row.getCell(0)); // Name
            String panPlain = getStringCellValue(row.getCell(1));     // PAN
            String tdsAmount = getStringCellValue(row.getCell(2));    // TDS

            if (panPlain == null || panPlain.isBlank()) continue;

            String panEncoded = base64Encode(panPlain);

            EmployeeEntity matchedEmployee = companyEmployees.stream()
                    .filter(emp -> emp.getPanNo() != null && emp.getPanNo().equals(panEncoded))
                    .findFirst()
                    .orElseThrow(() ->
                            new AccountantException("Employee not found for PAN: " + panPlain, HttpStatus.NOT_FOUND));

            // Check if TDS already exists
            Collection<EmployeeAccountEntity> accounts = accountDao.getEmployeeAccountByPanMonthYear(
                    panEncoded, company.getId(), month, year, company.getShortName(), null, null);

            if (accounts != null && !accounts.isEmpty()) {
                EmployeeAccountEntity existingAccount = accounts.iterator().next();
                if (existingAccount.getTds() != null && !existingAccount.getTds().isBlank()) {
                    throw new AccountantException(
                            String.format("TDS already exists for employee ID: %s, month: %s, year: %s",
                                    existingAccount.getEmployeeId(), month, year),
                            HttpStatus.CONFLICT);
                }
            }

            EmployeeAccountEntity employee = new EmployeeAccountEntity();
            String resourceId = ResourceIdUtils.generateEmployeeAccountResourceId(panEncoded, month, year);

            employee.setId(resourceId);
            employee.setEmployeeName(employeeName);
            employee.setEmployeeId(matchedEmployee.getId());
            employee.setPanNo(panEncoded);
            employee.setMonth(month);
            employee.setYear(year);
            employee.setCompanyId(company.getId());
            employee.setTds(base64Encode(tdsAmount));
            employee.setType(Constants.EMPLOYEE_ACCOUNT);

            employees.add(employee);
        }

        workbook.close();
        return employees;
    }

    private String base64Encode(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private Map<String, Object> parseExcelSheetForTDSComparing(
            CompanyEntity company, String month, String year, MultipartFile file, String indexName
    ) throws IOException, AccountantException {

        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        List<Object> missedCompanyEmployees = new ArrayList<>();
        List<Object> notCompanyEmployees = new ArrayList<>();
        List<Object> tdsMismatchEmployees = new ArrayList<>();
        List<Object> tdsAlreadyUpdatedEmployees = new ArrayList<>();

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("Missed Company Employees", missedCompanyEmployees);
        responseBody.put("Not Company Employees", notCompanyEmployees);
        responseBody.put("TDS Mismatch Employees", tdsMismatchEmployees);
        responseBody.put("TDS Already Updated Employees", tdsAlreadyUpdatedEmployees);

        YearMonth current = YearMonth.of(Integer.parseInt(year), Month.valueOf(month.toUpperCase()));
        YearMonth previous = current.minusMonths(1);
        String prevMonth = previous.getMonth().toString();
        String prevYear = String.valueOf(previous.getYear());

        List<EmployeeEntity> companyEmployees = openSearchOperations.getCompanyEmployees(company.getShortName());
        List<EmployeeEntity> activeEmployees = companyEmployees.stream()
                .filter(emp -> Constants.ACTIVE.equalsIgnoreCase(emp.getStatus()))
                .toList();

        for (EmployeeEntity emp : activeEmployees) {
            if (emp.getPanNo() != null && !emp.getPanNo().isBlank()) {
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
            }
        }

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            String employeeName = getStringCellValue(row.getCell(0));
            String excelPan = getStringCellValue(row.getCell(1));
            String tdsAmount = getStringCellValue(row.getCell(2));

            if (excelPan == null || excelPan.isBlank()) continue;
            String panEncoded = base64Encode(excelPan);

            boolean existsInCompany = activeEmployees.stream().anyMatch(emp -> {
                String encodedPan = emp.getPanNo();
                if (encodedPan == null || encodedPan.isBlank()) return false;
                String decodedPan = new String(Base64.getDecoder().decode(encodedPan));
                return decodedPan.equalsIgnoreCase(excelPan);
            });

            if (!existsInCompany) {
                notCompanyEmployees.add(String.format("%s (PAN: %s)", employeeName, excelPan));
                continue;
            }

            EmployeeEntity matchedEmployee = activeEmployees.stream()
                    .filter(e -> {
                        String decodedPan = new String(Base64.getDecoder().decode(e.getPanNo()));
                        return decodedPan.equalsIgnoreCase(excelPan);
                    }).findFirst().orElse(null);

            if (matchedEmployee == null) continue;

            String uanDecoded = matchedEmployee.getUanNo() != null
                    ? new String(Base64.getDecoder().decode(matchedEmployee.getUanNo()))
                    : null;

            if (uanDecoded == null || uanDecoded.isBlank()) continue;

            Collection<EmployeeAccountEntity> previousAccount = accountDao.getEmployeeAccountByUanMonthYear(
                    uanDecoded, company.getId(), prevMonth, prevYear, company.getShortName(), matchedEmployee.getId(), null);

            if (previousAccount != null && !previousAccount.isEmpty()) {
                EmployeeAccountEntity prevEntity = previousAccount.iterator().next();
                if (prevEntity.getTds() != null && !prevEntity.getTds().isBlank()) {
                    String decodedTds = new String(Base64.getDecoder().decode(prevEntity.getTds()));
                    if (!tdsAmount.equalsIgnoreCase(decodedTds)) {
                        tdsMismatchEmployees.add(String.format(
                                "%s (Previous TDS: %s, Current: %s)", employeeName, decodedTds, tdsAmount
                        ));
                    } else {
                        tdsAlreadyUpdatedEmployees.add(String.format(
                                "%s (PAN: %s) already has matching TDS", employeeName, excelPan
                        ));
                    }
                }
            }
        }

        workbook.close();
        return responseBody;
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

    @Override
    public ResponseEntity<?> updateEmployeeForTDS(String companyName, String employeeId, String accountId, EmployeeTDSUpdate request) throws AccountantException, IOException {
        try {
            //  Validate company
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for name: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            log.info("Processing TDS update for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());

            //  Validate employee existence
            Object employeeEntity = openSearchOperations.getById(employeeId, null, indexName);
            if (employeeEntity == null) {
                log.error("Employee not found for ID: {}", employeeId);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            //  Get employee account record for that month/year
            Collection<EmployeeAccountEntity> employees = this.getEmployeeAccountDetails(companyName, employeeId, accountId, request.getMonth(), request.getYear());

            if (employees == null || employees.isEmpty()) {
                log.error("Employee account not found for ID: {}", accountId);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_TDS_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            //  Convert request to source object
            EmployeeAccountEntity entitySrc = objectMapper.convertValue(request, EmployeeAccountEntity.class);
            EmployeeAccountEntity entityTgt = objectMapper.convertValue(employees.iterator().next(), EmployeeAccountEntity.class);

            //  Copy non-null properties and set TDS
            BeanUtils.copyProperties(entitySrc, entityTgt, getNullPropertyNames(entitySrc));
            entityTgt.setTds(base64Encode(request.getTds()));

            //  Save
            openSearchOperations.saveEntity(entityTgt, entityTgt.getId(), indexName);
            log.info("Updated TDS for employee: {} for month: {}, year: {}", employeeId, request.getMonth(), request.getYear());

        } catch (AccountantException e) {
            log.error("Exception while updating TDS: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error occurred while updating TDS: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_TDS), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS),
                HttpStatus.CREATED
        );
    }


    public Collection<EmployeeAccountEntity> getEmployeeAccountDetails(String companyName, String employeeId, String accountId, String month, String year) throws AccountantException , IOException {
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Exception while fetching company details: Company not found for name: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Fetching TDS details for company: {}, employeeId: {}, month: {}, year: {}", companyName, employeeId, month, year);
            Collection<EmployeeAccountEntity> employeeAccountEntities =accountDao.getEmployeeAccountByPanMonthYear(
                    null, companyEntity.getId(), month, year, companyEntity.getShortName(), employeeId, accountId
            );
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