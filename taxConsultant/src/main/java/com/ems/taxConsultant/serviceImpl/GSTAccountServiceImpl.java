package com.ems.taxConsultant.serviceImpl;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.dao.GSTAccountDao;
import com.ems.taxConsultant.elasticSearch.OpenSearchOperations;
import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.*;
import com.ems.taxConsultant.repository.CustomerRepository;
import com.ems.taxConsultant.request.GSTAccountRequest;
import com.ems.taxConsultant.service.GSTAccountService;
import com.ems.taxConsultant.utils.Constants;
import com.ems.taxConsultant.utils.GSTAccountUtils;
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
import java.util.*;
import java.util.stream.Collectors;

import static com.ems.taxConsultant.utils.GSTAccountUtils.maskUpdatedGSTAccountEntity;

@Slf4j
@Service
public class GSTAccountServiceImpl implements GSTAccountService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    private GSTAccountDao gstAccountDao;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public ResponseEntity<?> gstComparing(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException {

        Map<String, Object> responseBody;
        try{
            CompanyEntity companyEntity = validatingCompanyAndFile(companyName, file);
            log.info("Company entity validated successfully: {}", companyEntity);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
            responseBody = parseExcelSheetForComparing(companyEntity, month, year, file);
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
                String resourceId = ResourceIdUtils.generateGSTAccountResourceId(entity.getInvoiceNumber());

                entity.setId(resourceId);
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

    @Override
    public ResponseEntity<?> addSingleGSTAccount(String companyName,GSTAccountRequest gstAccountRequest) throws AccountantException {

        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for name: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
           String resourceId = ResourceIdUtils.generateGSTAccountResourceId(gstAccountRequest.getInvoiceNumber());
           Collection<GSTAccountEntity> existingAccounts = gstAccountDao.findByCompanyIdAndMonthAndYear(companyName, companyEntity.getId(), gstAccountRequest.getYear(),gstAccountRequest.getMonth(), resourceId);
            if (existingAccounts != null && !existingAccounts.isEmpty()) {
                log.error("GST accounts already exist for company: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.GST_ACCOUNT_ALREADY_EXIST), HttpStatus.BAD_REQUEST);
            }
            GSTAccountEntity gstAccountEntity = GSTAccountUtils.maskGSTAccountEntity(gstAccountRequest,companyEntity.getId(),resourceId);
           log.info("Saving GST account entity: {}", gstAccountEntity);
            // Save the entity to OpenSearch
            gstAccountDao.save(gstAccountEntity, companyName);

        } catch (AccountantException e) {
            log.error("Error adding single GST account: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while adding single GST account: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public Collection<GSTAccountEntity> getGSTAccount(String companyName, String month, String year, String Id) throws AccountantException {
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for name: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            Collection<GSTAccountEntity> gstAccounts = gstAccountDao.findByCompanyIdAndMonthAndYear(companyEntity.getShortName(),companyEntity.getId(),year, month,Id);

            Collection<GSTAccountEntity> unmaskedAccounts = gstAccounts.stream()
                    .map(GSTAccountUtils::ummaskGSTAccountEntity)
                    .collect(Collectors.toList());

            return unmaskedAccounts;
        } catch (AccountantException e) {
            log.error("Error retrieving GST accounts: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while retrieving GST accounts: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_FETCH_GST_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> updateGSTAccount(String companyName, String Id, GSTAccountRequest gstAccountRequest) throws AccountantException {

        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for name: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            Collection<GSTAccountEntity> existingAccounts = this.getGSTAccount(companyName, null,null, Id);
            GSTAccountEntity accountEntity = existingAccounts.iterator().next();
            if (existingAccounts == null ) {
                log.error("GST accounts already exist for company: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.GST_ACCOUNT_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            GSTAccountEntity entity = objectMapper.convertValue(gstAccountRequest, GSTAccountEntity.class);
            GSTAccountEntity existingAccount = objectMapper.convertValue(accountEntity, GSTAccountEntity.class);
            BeanUtils.copyProperties(entity, existingAccount, getNullPropertyNames(entity));
            existingAccount = maskUpdatedGSTAccountEntity(existingAccount);
            gstAccountDao.update(existingAccount, companyName);
        } catch (AccountantException e) {
            log.error("Error updating GST account: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error updating GST account: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> deleteGSTAccount(String companyName, String Id) throws AccountantException {

        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for name: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            Collection<GSTAccountEntity> existingAccounts = this.getGSTAccount(companyName, null, null, Id);
            if (existingAccounts.isEmpty()) {
                log.error("GST account not found for ID: {}", Id);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.GST_ACCOUNT_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            GSTAccountEntity accountEntity = existingAccounts.iterator().next();
            gstAccountDao.delete(accountEntity.getId(), companyName);

        } catch (AccountantException e) {
            log.error("Error deleting GST account: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error deleting GST account: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_DELETE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
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
            String subTotal = getStringCellValue(row.getCell(5));
            String iGst = getStringCellValue(row.getCell(6));
            String cGst = getStringCellValue(row.getCell(7));
            String sGst = getStringCellValue(row.getCell(8));


            GSTAccountEntity entity = new GSTAccountEntity();

            entity.setCompanyId(company.getId());
            entity.setMonth(month);
            entity.setYear(year);
            entity.setCustomerGstNo(base64Encode(customerGstNo));
            entity.setCustomerName(customerName);
            entity.setInvoiceNumber(invoiceNumber);
            entity.setInvoiceDate(base64Encode(invoiceDate));
            entity.setTotalAmount(base64Encode(totalAmount));
            entity.setSubTotal(base64Encode(subTotal));
            entity.setCGst(base64Encode(cGst));
            entity.setSGst(base64Encode(sGst));
            entity.setIGst(base64Encode(iGst));
            entity.setStatus(Constants.FILED);
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

    private Map<String, Object> parseExcelSheetForComparing(CompanyEntity company, String month, String year, MultipartFile file) throws IOException, AccountantException {

        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        List<Object> missedCompanyCustomers = new ArrayList<>();
        List<Object> notCompanyCustomers = new ArrayList<>();
        List<Object> gstMismatch = new ArrayList<>();

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put(Constants.MISSED_COMPANY_CUSTOMER, missedCompanyCustomers);
        responseBody.put(Constants.NOT_COMPANY_CUSTOMERS, notCompanyCustomers);
        responseBody.put(Constants.GST_MISS_MATCH_CUSTOMERS, gstMismatch);

        List<CustomerModel> dbCustomers = customerRepository.findByCompanyId(company.getId());
        Map<String, CustomerModel> dbCustomerGstMap = dbCustomers.stream()
                .filter(c -> c.getCustomerGstNo() != null)
                .collect(Collectors.toMap(CustomerModel::getCustomerGstNo, c -> c));

        Map<String, List<GSTAccountEntity>> excelGstData = new HashMap<>();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            String customerName = getStringCellValue(row.getCell(0));
            String customerGstNo = getStringCellValue(row.getCell(1));
            String invoiceNumber = getStringCellValue(row.getCell(2));
            String invoiceDate = getStringCellValue(row.getCell(3));
            String totalAmount = getStringCellValue(row.getCell(4));
            String subTotal = getStringCellValue(row.getCell(5));
            String iGst = getStringCellValue(row.getCell(6));
            String cGst = getStringCellValue(row.getCell(7));
            String sGst = getStringCellValue(row.getCell(8));


            if (customerGstNo == null || customerGstNo.isBlank()) continue;

            GSTAccountEntity entity = GSTAccountEntity.builder()
                    .companyId(company.getId())
                    .month(month)
                    .year(year)
                    .customerGstNo(customerGstNo)
                    .customerName(customerName)
                    .invoiceNumber(invoiceNumber)
                    .invoiceDate(invoiceDate)
                    .totalAmount(totalAmount)
                    .subTotal(subTotal)
                    .cGst(cGst)
                    .sGst(sGst)
                    .iGst(iGst)
                    .build();

            excelGstData.computeIfAbsent(customerGstNo, k -> new ArrayList<>()).add(entity);
        }

        // collect DB GSTs missing in Excel
        for (String dbGst : dbCustomerGstMap.keySet()) {
            if (!excelGstData.containsKey(dbGst)) {
                CustomerModel customer = dbCustomerGstMap.get(dbGst);
                Map<String, String> missedCustomer = new LinkedHashMap<>();
                missedCustomer.put(Constants.CUSTOMER_GST, base64Decode(dbGst));
                missedCustomer.put(Constants.CUSTOMER_NAME, base64Decode(customer.getCustomerName()));
                missedCompanyCustomers.add(missedCustomer);
            }
        }

        // collect Excel GSTs missing in DB
        for (String excelGst : excelGstData.keySet()) {
            if (!dbCustomerGstMap.containsKey(excelGst)) {
                List<GSTAccountEntity> gstEntities = excelGstData.get(excelGst);
                if (gstEntities != null && !gstEntities.isEmpty()) {
                    GSTAccountEntity firstEntry = gstEntities.get(0);
                    Map<String, String> notCompany = new LinkedHashMap<>();
                    notCompany.put(Constants.CUSTOMER_GST, (excelGst));
                    notCompany.put(Constants.CUSTOMER_NAME, firstEntry.getCustomerName());
                    notCompanyCustomers.add(notCompany);
                }
            }
        }

        // Step 5: Fetch existing GST data from OpenSearch (not from DB)
        Collection<GSTAccountEntity> dbGstAccounts = gstAccountDao.findByCompanyIdAndMonthAndYear(company.getShortName(), company.getId(),year, month,  null);

        // Step 6: Create a map of existing GST accounts by customer GST number and invoice number
        List<GSTAccountEntity> dbGstList = new ArrayList<>();
        for (GSTAccountEntity entity : dbGstAccounts) {
            if (entity.getCustomerGstNo() != null && entity.getInvoiceNumber() != null) {
                dbGstList.add(entity);
            }
        }

        List<GSTAccountEntity> allExcelInvoices = new ArrayList<>();
        for (List<GSTAccountEntity> list : excelGstData.values()) {
            allExcelInvoices.addAll(list);
        }

        // Loop through each Excel invoice entry
        for (GSTAccountEntity excelEntity : allExcelInvoices) {
            String gstNo = excelEntity.getCustomerGstNo();
            String invoiceNo = excelEntity.getInvoiceNumber();

            // Find matching OpenSearch entity from dbGstList
            GSTAccountEntity dbEntity = null;
            for (GSTAccountEntity e : dbGstList) {
                if (gstNo.equals(e.getCustomerGstNo()) && invoiceNo.equals(e.getInvoiceNumber())) {
                    dbEntity = e;
                    break;
                }
            }

            if (dbEntity == null) continue;

            Map<String, String> diffs = new LinkedHashMap<>();

            // Compare each GST-related field
            if (!Objects.equals(excelEntity.getTotalAmount(), dbEntity.getTotalAmount()))
                diffs.put(Constants.TOTAL_AMOUNT,Constants.EXCEL + excelEntity.getTotalAmount() +Constants.DB + dbEntity.getTotalAmount());

            if (!Objects.equals(excelEntity.getSubTotal(), dbEntity.getSubTotal()))
                diffs.put(Constants.SUB_TOTAL, Constants.EXCEL + excelEntity.getSubTotal() + Constants.DB+ dbEntity.getSubTotal());

            if (!Objects.equals(excelEntity.getCGst(), dbEntity.getCGst()))
                diffs.put(Constants.C_GST, Constants.EXCEL + excelEntity.getCGst() + Constants.DB+ dbEntity.getCGst());

            if (!Objects.equals(excelEntity.getSGst(), dbEntity.getSGst()))
                diffs.put(Constants.S_GST, Constants.EXCEL + excelEntity.getSGst() +Constants.DB + dbEntity.getSGst());

            if (!Objects.equals(excelEntity.getIGst(), dbEntity.getIGst()))
                diffs.put(Constants.I_GST, Constants.EXCEL + excelEntity.getIGst() + Constants.DB + dbEntity.getIGst());
            // Add mismatch result if any field is different
            if (!diffs.isEmpty()) {
                Map<String, Object> mismatch = new LinkedHashMap<>();
                mismatch.put(Constants.CUSTOMER_GST, base64Decode(gstNo));
                mismatch.put(Constants.INVOICE_NUMBER, invoiceNo);
                mismatch.put(Constants.CUSTOMER_NAME, excelEntity.getCustomerName());
                mismatch.put(Constants.DIFFERENCES, diffs);
                gstMismatch.add(mismatch);
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

    private String base64Decode(String value) {
        return new String(Base64.getDecoder().decode(value), StandardCharsets.UTF_8);
    }
}
