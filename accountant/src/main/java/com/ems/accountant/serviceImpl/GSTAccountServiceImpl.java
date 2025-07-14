package com.ems.accountant.serviceImpl;

import com.ems.accountant.common.ResponseBuilder;
import com.ems.accountant.dao.GSTAccountDao;
import com.ems.accountant.elasticSearch.OpenSearchOperations;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.exception.ErrorMessageHandler;
import com.ems.accountant.exception.ErrorMessageKey;
import com.ems.accountant.persistance.*;
import com.ems.accountant.repository.CustomerRepository;
import com.ems.accountant.service.GSTAccountService;
import com.ems.accountant.utils.Constants;
import com.ems.accountant.utils.ResourceIdUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Service
public class GSTAccountServiceImpl implements GSTAccountService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    private GSTAccountDao gstAccountDao;

    private EmployeePFServiceImpl employeePFService;

    @Override
    public ResponseEntity<?> gstComparing(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException {

        Map<String, Object> responseBody;
        try{
            CompanyEntity companyEntity = validatingCompanyAndFile(companyName, file);
            log.info("Company entity validated successfully: {}", companyEntity);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
            responseBody = parseExcelSheetForComparing(companyEntity, month, year, file, indexName);
            log.info("Parsed Excel sheet for comparing GST accounts: {}", responseBody);
        } catch (AccountantException e) {
            log.error("Error validating company or file: {}", e.getMessage());
            throw e;
        } catch (IOException e) {
            log.error("Error reading Excel file: {}", e.getMessage());
            throw new AccountantException("Failed to read the Excel file", e);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(responseBody), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> registerGSTAccount(String companyName, String month, String year,MultipartFile file) throws AccountantException {
        try {
            CompanyEntity companyEntity = validatingCompanyAndFile(companyName, file);
            log.info("Company entity validated successfully: {}", companyEntity);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
            List<GSTAccountEntity> entities = parseGSTExcelSheet(companyEntity, month, year, file);
            for (GSTAccountEntity entity : entities) {
                openSearchOperations.saveEntity(entity, entity.getId(), indexName);
            }

        } catch (AccountantException accountantException) {
            log.error("Error validating company or file: {}", accountantException.getMessage());
            throw accountantException;
        } catch (Exception exception) {
            log.error("Error reading Excel file: {}", exception.getMessage());
            throw new AccountantException("Failed to read the Excel file", exception);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

        public List<GSTAccountEntity> parseGSTExcelSheet(CompanyEntity company, String month, String year, MultipartFile file)
            throws IOException, AccountantException {

        List<GSTAccountEntity> gstAccounts = new ArrayList<>();
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String customerName = getStringCellValue(row.getCell(0));
            String customerGstNo = getStringCellValue(row.getCell(1));
            String invoiceNumber = getStringCellValue(row.getCell(2));
            String invoiceDate = getStringCellValue(row.getCell(3));
            String totalAmount = getStringCellValue(row.getCell(4));
            String taxableValue = getStringCellValue(row.getCell(5));
            String cGst = getStringCellValue(row.getCell(6));
            String sGst = getStringCellValue(row.getCell(7));
            String iGst = getStringCellValue(row.getCell(8));

            if (customerGstNo == null || customerGstNo.isBlank()) continue;
            String customerEncode = base64Encode(customerGstNo);

            CustomerModel customerModel = customerRepository.findByCompanyId(company.getId())
                    .stream()
                    .filter(customer -> customer.getCustomerGstNo().equalsIgnoreCase(customerEncode))
                    .findFirst()
                    .orElseThrow(() -> new AccountantException(
                            ErrorMessageHandler.getMessage(ErrorMessageKey.CUSTOMER_GST_NOT_FOUND, customerEncode),
                            HttpStatus.NOT_FOUND));

            GSTAccountEntity entity = new GSTAccountEntity();
            String resourceId = ResourceIdUtils.generateGSTAccountResourceId(entity.getCustomerGstNo());

            entity.setId(resourceId);
            entity.setCompanyId(company.getId());
            entity.setCustomerId(customerModel.getCustomerId());
            entity.setMonth(month);
            entity.setYear(year);
            entity.setCustomerGstNo(base64Encode(customerGstNo));
            entity.setCustomerName(customerName);
            entity.setInvoiceNumber(invoiceNumber);
            entity.setInvoiceDate(base64Encode(invoiceDate));
            entity.setTotalAmount(base64Encode(totalAmount));
            entity.setTaxableValue(base64Encode(taxableValue));
            entity.setCGst(base64Encode(cGst));
            entity.setSGst(base64Encode(sGst));
            entity.setIGst(base64Encode(iGst));
            entity.setStatus(Constants.ACTIVE);
            entity.setType(Constants.GST_ACCOUNT);

            gstAccounts.add(entity);
        }

        workbook.close();
        return gstAccounts;
    }

    private String base64Encode(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
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

    private Map<String, Object> parseExcelSheetForComparing(
            CompanyEntity company, String month, String year, MultipartFile file, String indexName
    ) throws IOException, AccountantException {

        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        List<Map<String, Object>> mismatches = new ArrayList<>();
        List<Map<String, Object>> missingInDB = new ArrayList<>();

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("mismatches", mismatches);
        responseBody.put("missingInDB", missingInDB);

        // Step 1: Read Excel data: Map<customerGstNo, Map<invoiceNumber, GSTAccountEntity>>
        Map<String, Map<String, GSTAccountEntity>> excelDataMap = new HashMap<>();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            GSTAccountEntity entity = GSTAccountEntity.builder()
                    .companyId(company.getId())
                    .customerId(getStringCellValue(row.getCell(0)))
                    .month(month)
                    .year(year)
                    .customerGstNo(getStringCellValue(row.getCell(1)))
                    .customerName(getStringCellValue(row.getCell(2)))
                    .invoiceNumber(getStringCellValue(row.getCell(3)))
                    .invoiceDate(getStringCellValue(row.getCell(4)))
                    .totalAmount(getStringCellValue(row.getCell(5)))
                    .taxableValue(getStringCellValue(row.getCell(6)))
                    .cGst(getStringCellValue(row.getCell(7)))
                    .sGst(getStringCellValue(row.getCell(8)))
                    .iGst(getStringCellValue(row.getCell(9)))
                    .status(getStringCellValue(row.getCell(10)))
                    .build();

            if (entity.getCustomerGstNo() == null || entity.getInvoiceNumber() == null) continue;

            excelDataMap
                    .computeIfAbsent(entity.getCustomerGstNo(), k -> new HashMap<>())
                    .put(entity.getInvoiceNumber(), entity);
        }

        // Step 2: Fetch DB data using gstAccountDao
        Collection<GSTAccountEntity> dbDataList = gstAccountDao.findByCompanyIdAndMonthAndYear(
                company.getId(), null, year, month, null
        );

        Map<String, Map<String, GSTAccountEntity>> dbDataMap = new HashMap<>();
        for (GSTAccountEntity entity : dbDataList) {
            if (entity.getCustomerGstNo() == null || entity.getInvoiceNumber() == null) continue;

            dbDataMap
                    .computeIfAbsent(entity.getCustomerGstNo(), k -> new HashMap<>())
                    .put(entity.getInvoiceNumber(), entity);
        }

        // Step 3: Compare Excel vs DB based on customerGstNo + invoiceNumber
        for (Map.Entry<String, Map<String, GSTAccountEntity>> gstEntry : excelDataMap.entrySet()) {
            String gstNo = gstEntry.getKey();
            Map<String, GSTAccountEntity> excelInvoices = gstEntry.getValue();
            Map<String, GSTAccountEntity> dbInvoices = dbDataMap.getOrDefault(gstNo, Collections.emptyMap());

            for (Map.Entry<String, GSTAccountEntity> invoiceEntry : excelInvoices.entrySet()) {
                String invoiceNo = invoiceEntry.getKey();
                GSTAccountEntity excelEntity = invoiceEntry.getValue();

                if (!dbInvoices.containsKey(invoiceNo)) {
                    Map<String, Object> missing = new HashMap<>();
                    missing.put("customerGstNo", gstNo);
                    missing.put("invoiceNumber", invoiceNo);
                    missingInDB.add(missing);
                    continue;
                }

                GSTAccountEntity dbEntity = dbInvoices.get(invoiceNo);
                Map<String, String> fieldDiffs = new LinkedHashMap<>();

                if (!Objects.equals(excelEntity.getTotalAmount(), dbEntity.getTotalAmount()))
                    fieldDiffs.put("totalAmount", "Excel: " + excelEntity.getTotalAmount() + ", DB: " + dbEntity.getTotalAmount());

                if (!Objects.equals(excelEntity.getTaxableValue(), dbEntity.getTaxableValue()))
                    fieldDiffs.put("taxableValue", "Excel: " + excelEntity.getTaxableValue() + ", DB: " + dbEntity.getTaxableValue());

                if (!Objects.equals(excelEntity.getCGst(), dbEntity.getCGst()))
                    fieldDiffs.put("cGst", "Excel: " + excelEntity.getCGst() + ", DB: " + dbEntity.getCGst());

                if (!Objects.equals(excelEntity.getSGst(), dbEntity.getSGst()))
                    fieldDiffs.put("sGst", "Excel: " + excelEntity.getSGst() + ", DB: " + dbEntity.getSGst());

                if (!Objects.equals(excelEntity.getIGst(), dbEntity.getIGst()))
                    fieldDiffs.put("iGst", "Excel: " + excelEntity.getIGst() + ", DB: " + dbEntity.getIGst());

                if (!fieldDiffs.isEmpty()) {
                    Map<String, Object> mismatchInfo = new LinkedHashMap<>();
                    mismatchInfo.put("customerGstNo", gstNo);
                    mismatchInfo.put("invoiceNumber", invoiceNo);
                    mismatchInfo.put("customerName", excelEntity.getCustomerName());
                    mismatchInfo.put("differences", fieldDiffs);
                    mismatches.add(mismatchInfo);
                }
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

}
