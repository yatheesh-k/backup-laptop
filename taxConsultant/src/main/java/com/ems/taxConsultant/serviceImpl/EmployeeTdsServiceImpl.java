package com.ems.taxConsultant.serviceImpl;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.dao.EmployeeAccountDao;
import com.ems.taxConsultant.persistance.*;
import com.ems.taxConsultant.request.EmployeeTDSRequest;
import com.ems.taxConsultant.service.EmployeePFService;
import com.ems.taxConsultant.service.EmployeeTdsService;
import com.ems.taxConsultant.utils.EmployeeUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.stereotype.Service;
import com.ems.taxConsultant.elasticSearch.OpenSearchOperations;
import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.utils.Constants;
import com.ems.taxConsultant.utils.ResourceIdUtils;
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
import java.util.stream.Collectors;

@Slf4j
@Service
public class EmployeeTdsServiceImpl implements EmployeeTdsService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private EmployeeAccountDao accountDao;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmployeePFService pfService;

    @Override
    public ResponseEntity<?> employeeTDSComparing(String companyName, String month, String year, MultipartFile file) throws TaxConsultantException, IOException {
        Map<String, Object> responseBody;
        try {
            CompanyEntity companyEntity = validatingCompanyAndFile(companyName, file);
            log.info("Processing employee PT accounts for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
            responseBody = parseExcelSheetForTDSComparing(companyEntity, month, year, file, indexName);
        } catch (TaxConsultantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred: {}", e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_TDS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(responseBody), HttpStatus.CREATED);
    }

    private CompanyEntity validatingCompanyAndFile(String companyName, MultipartFile file) throws TaxConsultantException {
        CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
        if (companyEntity == null) {
            log.error("Company not found: {}", companyName);
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
        }
        if (file.isEmpty()) {
            log.error("Uploaded file is empty for company: {}", companyName);
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPTY_FILE), HttpStatus.BAD_REQUEST);
        }
        if (!file.getContentType().equals(Constants.EXCEL_TYPE)) {
            log.error("Invalid file type: {}", file.getContentType());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.INVALID_FILE_TYPE), HttpStatus.BAD_REQUEST);
        }
        return companyEntity;
    }

    @Override
    public ResponseEntity<?> registerEmployeeForTDS(String companyName, String month, String year, MultipartFile file) throws TaxConsultantException, IOException {
        try {
            CompanyEntity companyEntity = validatingCompanyAndFile(companyName, file);
            log.info("Processing employee accounts for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
            List<EmployeeAccountEntity> employees = parseExcelSheetForTDS(companyEntity, month, year, file, indexName);
            for (EmployeeAccountEntity employee :employees) {
                openSearchOperations.saveEntity(employee, employee.getId(), indexName);
            }

        }catch (TaxConsultantException e) {
            log.error("Exception while fetching company details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred while fetching company details: {}", e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_TDS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);

    }

    public List<EmployeeAccountEntity> parseExcelSheetForTDS(CompanyEntity company, String month, String year, MultipartFile file, String index) throws IOException, TaxConsultantException {

        List<EmployeeAccountEntity> employees = new ArrayList<>();
        List<String> alreadyRegisteredTds = new ArrayList<>();
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
                            new TaxConsultantException("Employee not found for PAN: " + panPlain, HttpStatus.NOT_FOUND));

            Collection<EmployeeAccountEntity> existingAccounts = accountDao.getEmployeeAccountByPanMonthYear(
                    panEncoded, company.getId(), month, year, company.getShortName(), matchedEmployee.getId(), null);

            if (existingAccounts != null && !existingAccounts.isEmpty() &&existingAccounts.stream()
                    .anyMatch(acc -> acc.getTds() != null && !acc.getTds().isEmpty())) {
                alreadyRegisteredTds.add(panPlain);
                continue;
            }


            EmployeeAccountEntity employee = new EmployeeAccountEntity();
            String resourceId = ResourceIdUtils.generateEmployeeAccountResourceId(panPlain, month, year);

            Optional<EmployeeAccountEntity> existingAccount = accountDao.get(resourceId, company.getShortName());
            if (existingAccount.isPresent() && existingAccount.get().getTds()!=null && !existingAccount.get().getTds().isEmpty()) {
                log.error("Employee account already exists for ID: {}", resourceId);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_TDS_ALREADY_EXISTS), HttpStatus.BAD_REQUEST);
            }else if (existingAccount.isEmpty()) {
                employee.setId(resourceId);
                employee.setEmployeeName(employeeName);
                employee.setEmployeeId(matchedEmployee.getId());
                employee.setPanNo(panEncoded);
                employee.setMonth(month);
                employee.setYear(year);
                employee.setCompanyId(company.getId());
                employee.setTds(base64Encode(tdsAmount));
                employee.setType(Constants.EMPLOYEE_ACCOUNT);
            }else{
                employee = existingAccount.get();
                employee.setTds(base64Encode(tdsAmount));
            }
            employees.add(employee);

        }

        workbook.close();
        if (!alreadyRegisteredTds.isEmpty()) {
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.TDS_ALREADY_EXISTS_PANS) + String.join(", ", alreadyRegisteredTds), HttpStatus.CONFLICT);
        }
        return employees;
    }

    private String base64Encode(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private Map<String, Object> parseExcelSheetForTDSComparing(
            CompanyEntity company, String month, String year, MultipartFile file, String indexName
    ) throws IOException, TaxConsultantException {

        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        List<Object> missedCompanyEmployees = new ArrayList<>();
        List<Object> notCompanyEmployees = new ArrayList<>();
        List<Object> tdsMismatchEmployees = new ArrayList<>();
        List<Object> tdsAlreadyUpdatedEmployees = new ArrayList<>();

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put(Constants.MISSED_COMPANY_EMPLOYEES, missedCompanyEmployees);
        responseBody.put(Constants.NOT_COMPANY_EMPLOYEES, notCompanyEmployees);
        responseBody.put(Constants.TDS_MISMATCH_EMPLOYEES, tdsMismatchEmployees);
        responseBody.put(Constants.TDS_ALREADY_UPDATED, tdsAlreadyUpdatedEmployees);



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
    public ResponseEntity<?> updateEmployeeForTDS(String companyName, String employeeId, String accountId, EmployeeTDSRequest request) throws TaxConsultantException, IOException {
        try {
            //  Validate company
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for name: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            log.info("Processing TDS update for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());

            //  Validate employee existence
            Object employeeEntity = openSearchOperations.getById(employeeId, null, indexName);
            if (employeeEntity == null) {
                log.error("Employee not found for ID: {}", employeeId);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            //  Get employee account record for that month/year
            EmployeeAccountEntity employees = pfService.getEmployeeAccountDetails(companyName, employeeId, accountId, null,  null)
                    .stream()
                    .findFirst()
                    .orElse(null);

            if (employees == null) {
                log.error("Employee account not found for ID: {}", accountId);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_TDS_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            //  Convert request to source object
            EmployeeAccountEntity entitySrc = objectMapper.convertValue(request, EmployeeAccountEntity.class);
            EmployeeAccountEntity entityTgt = objectMapper.convertValue(employees, EmployeeAccountEntity.class);
            //  Copy non-null properties and set TDS
            BeanUtils.copyProperties(entitySrc, entityTgt, getNullPropertyNames(entitySrc));
            entityTgt.setTds(base64Encode(request.getTds()));

            //  Save
            openSearchOperations.saveEntity(entityTgt, entityTgt.getId(), indexName);
            log.info("Updated TDS for employee: {} for month: {}, year: {}", employeeId);

        } catch (TaxConsultantException e) {
            log.error("Exception while updating TDS: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error occurred while updating TDS: {}", e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_TDS), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS),
                HttpStatus.CREATED
        );
    }

    @Override
    public ResponseEntity<?> addSingleEmployeeForTDS(String companyName, EmployeeTDSRequest request) throws TaxConsultantException {
        EmployeeAccountEntity employee = null;

        try {

            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for ID: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            if (request.getPanNo() == null || request.getPanNo().isBlank()) {
                log.warn("PAN is blank, Pan Is required for TDS");
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.PAN_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            String resourceId = ResourceIdUtils.generateEmployeeAccountResourceId(request.getPanNo(), request.getMonth(), request.getYear());
            EmployeeEntity employeeEntity = openSearchOperations.getEmployeeByPanNo(companyEntity.getShortName(), base64Encode(request.getPanNo()));
            if (employeeEntity == null) {
                log.error("Employee not found for PAN: {}", request.getPanNo());
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }


            Collection<EmployeeAccountEntity> employees = pfService.getEmployeeAccountDetails(companyName, employeeEntity.getId(), resourceId, request.getMonth(), request.getYear());
            if (employees != null && !employees.isEmpty() && employees.stream().anyMatch(emp -> emp.getTds() != null && !emp.getTds().isEmpty())) {
                log.error("Employee account already exists for ID: {}", resourceId);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_TDS_ALREADY_EXISTS), HttpStatus.BAD_REQUEST);
            }else if (employees == null || employees.isEmpty()) {
                employee = objectMapper.convertValue(request, EmployeeAccountEntity.class);
                employee.setId(resourceId);
                employee.setCompanyId(companyEntity.getId());
                employee.setType(Constants.EMPLOYEE_ACCOUNT);
                employee.setPanNo(base64Encode(request.getPanNo()));
                employee.setTds(base64Encode(request.getTds()));
                employee.setEmployeeId(employeeEntity.getId());

            }else {
                employee=employees.iterator().next();
                employee.setTds(base64Encode(request.getTds()));
                if (employee.getPanNo()!=null && !employee.getPanNo().isEmpty()) {
                    employee.setPanNo(base64Encode(employee.getPanNo()));
                }
                if (employee.getUanNo()!=null && !employee.getUanNo().isEmpty()) {
                    employee.setUanNo(base64Encode(employee.getUanNo()));
                }
                if (employee.getProfessionalTax()!=null && !employee.getProfessionalTax().isEmpty()) {
                    employee.setProfessionalTax(base64Encode(employee.getProfessionalTax()));
                }
                if (employee.getProvidentFund()!=null && !employee.getProvidentFund().isEmpty()) {
                    employee.setProvidentFund(base64Encode(employee.getProvidentFund()));
                }
            }
            accountDao.save(employee, companyName);

        }catch (TaxConsultantException e) {
            log.error("Exception while Adding Employee TDS: {}", e.getMessage());
            throw e;
        }
        catch (Exception e) {
            log.error("Error while storing TDS for employee", e);
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_EMPLOYEE_TDS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);

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

    public ResponseEntity<?> employeeTDSComparingDB(String companyName, String month, String year) throws TaxConsultantException {
        Map<String, Object> responseBody;
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found with name: {}", companyName);
                throw new TaxConsultantException("Company not found", HttpStatus.NOT_FOUND);
            }
            log.info("Processing TDS comparison for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyName);

            List<EmployeeResponse> employeeAccountsResponse = getEmployeeAccountDetailsForTDS(companyName);
            if (employeeAccountsResponse == null || employeeAccountsResponse.isEmpty()) {
                log.warn("No employee TDS data found for company: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            responseBody = forComparingTDS(companyEntity, month, year, indexName, employeeAccountsResponse );

        } catch (TaxConsultantException e) {
            log.error("Error in TDS comparison: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error in TDS comparison: {}", e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_GET_EMPLOYEES), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(responseBody), HttpStatus.CREATED);
    }



    private List<EmployeeResponse> getEmployeeAccountDetailsForTDS(String companyName) throws TaxConsultantException {
        List<EmployeeEntity> employeeEntities;
        List<EmployeeResponse> employeeResponses = new ArrayList<>();
        try {
            employeeEntities = openSearchOperations.getCompanyEmployees(companyName);

            for (EmployeeEntity employee : employeeEntities) {
                if (employee.getStatus().equalsIgnoreCase(Constants.ACTIVE) && !employee.getEmployeeType().equalsIgnoreCase(Constants.ADMIN)) {
                    EmployeeUtils.unmaskEmployeeProperties(employee);
                    List<EmployeeSalaryEntity> salaries = openSearchOperations.getEmployeeSalaries(companyName, employee.getId(), Constants.ACTIVE);
                    if (salaries != null && !salaries.isEmpty()) {
                        EmployeeSalaryEntity activeSalary = salaries.get(0);
                        EmployeeResponse response = EmployeeUtils.unMaskEmployeeAccountProperties(activeSalary, employee);
                        employeeResponses.add(response);
                    }
                }
            }
        } catch (Exception ex) {
            log.error("Error fetching employee TDS details for {}: {}", companyName, ex.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_GET_EMPLOYEES), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return employeeResponses;
    }

    private Map<String, Object> forComparingTDS(CompanyEntity companyEntity, String month, String year,
                                                String indexName, List<EmployeeResponse> employeeAccountsResponse) throws TaxConsultantException {

        List<Object> previousMonthMissed = new ArrayList<>();
        List<Object> currentMonthAdded = new ArrayList<>();
        List<Object> tdsMismatchEmployees = new ArrayList<>();

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put(Constants.PREVIOUS_MONTH_MISSED_EMP, previousMonthMissed);
        responseBody.put(Constants.CURRENT_MONTH_ADDED_EMP, currentMonthAdded);
        responseBody.put(Constants.TDS_MISMATCH_EMPLOYEES, tdsMismatchEmployees);

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
                // TDS mismatch check
                EmployeeAccountEntity prevEntity = previousEmpMap.get(empId);
                String decodedTds = new String(Base64.getDecoder().decode(prevEntity.getTds()));
                if (!currentEmp.getTds().equalsIgnoreCase(decodedTds)) {
                    tdsMismatchEmployees.add(
                            String.format("%s %s (Previous TDS: %s, Current TDS: %s)",
                                    currentEmp.getFirstName(), currentEmp.getLastName(),
                                    decodedTds,
                                    currentEmp.getTds())
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


    public ResponseEntity<?> registerEmployeeForTDSDB(String companyName, String month, String year) throws TaxConsultantException {
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found with name: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.info("Registering employee TDS for company: {}", companyName);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());

            List<EmployeeAccountEntity> employees = getEmployeeAccountDetailsForTDS(companyName).stream()
                    .filter(emp -> emp.getTds() != null && !emp.getTds().isEmpty()
                            && emp.getPanNo() != null && !emp.getPanNo().isEmpty())
                    .map(emp -> {
                        EmployeeAccountEntity account = new EmployeeAccountEntity();
                        account.setId(ResourceIdUtils.generateEmployeeAccountResourceId(emp.getPanNo(), month, year));
                        account.setEmployeeId(emp.getId());
                        account.setEmployeeName(emp.getFirstName() + " " + emp.getLastName());
                        account.setCompanyId(companyEntity.getId());
                        account.setPanNo(base64Encode(emp.getPanNo()));
                        account.setMonth(month);
                        account.setYear(year);
                        account.setTds(base64Encode(emp.getTds()));
                        account.setType(Constants.EMPLOYEE_ACCOUNT);
                        return account;
                    })
                    .collect(Collectors.toList());

            for (EmployeeAccountEntity employee : employees) {
                openSearchOperations.saveEntity(employee, employee.getId(), indexName);
            }

        } catch (TaxConsultantException e) {
            log.error("Error registering TDS: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error registering TDS: {}", e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }



}