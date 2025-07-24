package com.ems.taxConsultant.serviceImpl;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.dao.GSTAccountDao;
import com.ems.taxConsultant.elasticSearch.OpenSearchOperations;
import com.ems.taxConsultant.exception.TaxConsultantException;
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
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

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
    public ResponseEntity<?> gstComparing(String companyName, String month, String year, MultipartFile file) throws TaxConsultantException, IOException {

        Map<String, Object> responseBody;
        try{
            CompanyEntity companyEntity = validatingCompanyAndFile(companyName, file);
            log.info("Company entity validated successfully: {}", companyEntity);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
            responseBody = parseExcelSheetForComparing(companyEntity, month, year, file);
            log.info("Parsed Excel sheet for comparing GST accounts: {}", responseBody);
        } catch (TaxConsultantException e) {
            log.error("Error validating company or file: {}", e.getMessage());
            throw e;
        } catch (IOException e) {
            log.error("Error reading Excel file: {}", e.getMessage());
            throw new TaxConsultantException("Failed to read the Excel file", e);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(responseBody), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> registerGSTAccount(String companyName, String month, String year,MultipartFile file) throws TaxConsultantException {
        try {
            CompanyEntity companyEntity = validatingCompanyAndFile(companyName, file);
            log.info("Company entity validated successfully: {}", companyEntity);
            String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
            List<GSTAccountEntity> entities = parseGSTExcelSheet(companyEntity, month, year, file);
            for (GSTAccountEntity entity : entities) {
                String resourceId = ResourceIdUtils.generateGSTAccountResourceId(entity.getCustomerGstNo(),month, year);

                entity.setId(resourceId);
                               openSearchOperations.saveEntity(entity, entity.getId(), indexName);
            }

        } catch (TaxConsultantException taxConsultantException) {
            log.error("Error validating company or file: {}", taxConsultantException.getMessage());
            throw taxConsultantException;
        } catch (Exception exception) {
            log.error("Error reading Excel file: {}", exception.getMessage());
            throw new TaxConsultantException("Failed to read the Excel file", exception);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> addSingleGSTAccount(String companyName,GSTAccountRequest gstAccountRequest) throws TaxConsultantException {

        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for name: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
           String resourceId = ResourceIdUtils.generateGSTAccountResourceId(gstAccountRequest.getCustomerGstNo(), gstAccountRequest.getMonth(), gstAccountRequest.getYear());
            log.info("Generated resource ID for GST account: {}", resourceId);

            // Check if the GST account already exists for the given company, month, and year
            log.info("Checking for existing GST accounts for company: {}, month: {}, year: {}", companyName, gstAccountRequest.getMonth(), gstAccountRequest.getYear());
           Collection<GSTAccountEntity> existingAccounts = gstAccountDao.findByCompanyIdAndMonthAndYear(companyName, companyEntity.getId(), gstAccountRequest.getYear(),gstAccountRequest.getMonth(), resourceId);
            if (existingAccounts != null && !existingAccounts.isEmpty()) {
                log.error("GST accounts already exist for company: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.GST_ACCOUNT_ALREADY_EXIST), HttpStatus.BAD_REQUEST);
            }
            GSTAccountEntity gstAccountEntity = GSTAccountUtils.maskGSTAccountEntity(gstAccountRequest,companyEntity.getId(),resourceId);
           log.info("Saving GST account entity: {}", gstAccountEntity);
            // Save the entity to OpenSearch
            gstAccountDao.save(gstAccountEntity, companyName);

        } catch (TaxConsultantException e) {
            log.error("Error adding single GST account: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while adding single GST account: {}", e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public Collection<GSTAccountEntity> getGSTAccount(String companyName, String month, String year, String Id) throws TaxConsultantException {
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for name: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            Collection<GSTAccountEntity> gstAccounts = gstAccountDao.findByCompanyIdAndMonthAndYear(companyEntity.getShortName(),companyEntity.getId(),year, month,Id);

            Collection<GSTAccountEntity> unmaskedAccounts = gstAccounts.stream()
                    .map(GSTAccountUtils::ummaskGSTAccountEntity)
                    .collect(Collectors.toList());

            return unmaskedAccounts;
        } catch (TaxConsultantException e) {
            log.error("Error retrieving GST accounts: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while retrieving GST accounts: {}", e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_FETCH_GST_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> updateGSTAccount(String companyName, String Id, GSTAccountRequest gstAccountRequest) throws TaxConsultantException {

        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for name: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            Collection<GSTAccountEntity> existingAccounts = this.getGSTAccount(companyName, null,null, Id);
            GSTAccountEntity accountEntity = existingAccounts.iterator().next();
            if (existingAccounts == null ) {
                log.error("GST accounts already exist for company: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.GST_ACCOUNT_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            GSTAccountEntity entity = objectMapper.convertValue(gstAccountRequest, GSTAccountEntity.class);
            GSTAccountEntity existingAccount = objectMapper.convertValue(accountEntity, GSTAccountEntity.class);
            BeanUtils.copyProperties(entity, existingAccount, getNullPropertyNames(entity));
            existingAccount = maskUpdatedGSTAccountEntity(existingAccount);
            gstAccountDao.update(existingAccount, companyName);
        } catch (TaxConsultantException e) {
            log.error("Error updating GST account: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error updating GST account: {}", e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> deleteGSTAccount(String companyName, String Id) throws TaxConsultantException {

        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for name: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            Collection<GSTAccountEntity> existingAccounts = this.getGSTAccount(companyName, null, null, Id);
            if (existingAccounts.isEmpty()) {
                log.error("GST account not found for ID: {}", Id);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.GST_ACCOUNT_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            GSTAccountEntity accountEntity = existingAccounts.iterator().next();
            gstAccountDao.delete(accountEntity.getId(), companyName);

        } catch (TaxConsultantException e) {
            log.error("Error deleting GST account: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error deleting GST account: {}", e.getMessage());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_DELETE), HttpStatus.INTERNAL_SERVER_ERROR);
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
            throws IOException, TaxConsultantException {

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


    private CompanyEntity validatingCompanyAndFile(String companyName, MultipartFile file) throws TaxConsultantException {
        CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
        if (companyEntity == null) {
            log.error("Company not found for ID: {}", companyName);
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
        }
        if (file.isEmpty()) {
            log.error("File is empty for company: {}", companyName);
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EMPTY_FILE), HttpStatus.BAD_REQUEST);
        }
        if (!file.getContentType().equals(Constants.EXCEL_TYPE)) {
            log.error("Invalid file type: {}", file.getContentType());
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.INVALID_FILE_TYPE), HttpStatus.BAD_REQUEST);
        }
        return companyEntity;

    }

    private Map<String, Object> parseExcelSheetForComparing(CompanyEntity company, String month, String year, MultipartFile file)
            throws IOException, TaxConsultantException {
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        List<Object> missedCompanyCustomers = new ArrayList<>();
        List<Object> notCompanyCustomers = new ArrayList<>();

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put(Constants.MISSED_COMPANY_CUSTOMER, missedCompanyCustomers);
        responseBody.put(Constants.EXTRA_COMPANY_CUSTOMERS, notCompanyCustomers);

        // Step 1: Parse Excel data
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

        // Step 2: Fetch GST data from OpenSearch (Elastic only)
        Collection<GSTAccountEntity> dbGstAccounts = gstAccountDao.findByCompanyIdAndMonthAndYear(
                company.getShortName(), company.getId(), year, month, null);

        Map<String, List<GSTAccountEntity>> dbGstMap = new HashMap<>();
        for (GSTAccountEntity entity : dbGstAccounts) {
            if (entity.getCustomerGstNo() != null) {
                dbGstMap.computeIfAbsent(entity.getCustomerGstNo(), k -> new ArrayList<>()).add(entity);
            }
        }

        // Step 3: Identify GSTs in OpenSearch but missing in Excel
        for (String dbGstNo : dbGstMap.keySet()) {
            if (!excelGstData.containsKey(dbGstNo)) {
                GSTAccountEntity entity = dbGstMap.get(dbGstNo).get(0);
                Map<String, String> missing = new LinkedHashMap<>();
                missing.put(Constants.CUSTOMER_GST, base64Decode(dbGstNo));
                missing.put(Constants.CUSTOMER_NAME, entity.getCustomerName());
                missedCompanyCustomers.add(missing);
            }
        }

        // Step 4: Identify GSTs in Excel but not in OpenSearch
        for (String excelGst : excelGstData.keySet()) {
            if (!dbGstMap.containsKey(excelGst)) {
                GSTAccountEntity firstEntry = excelGstData.get(excelGst).get(0);
                Map<String, String> notCompany = new LinkedHashMap<>();
                notCompany.put(Constants.CUSTOMER_GST, excelGst);
                notCompany.put(Constants.CUSTOMER_NAME, firstEntry.getCustomerName());
                notCompanyCustomers.add(notCompany);
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

    @Override
    public ResponseEntity<?> getGstAccountComparing(String companyName, String month, String year) throws TaxConsultantException {
        log.info("Starting GST comparison for company: {}, month: {}, year: {}", companyName, month, year);
        CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
        if (companyEntity == null) {
            log.error("Company not found for name: {}", companyName);
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
        }

        String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());

        try {
            List<InvoiceModel> invoiceModels = openSearchOperations.getInvoicesByCompanyId(companyEntity.getId(), index);
            if (invoiceModels == null || invoiceModels.isEmpty()) {
                log.error("Invoice data not found for company: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.INVOICE_DATA_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            List<CustomerModel> customerModels = customerRepository.findByCompanyId(companyEntity.getId());
            if (customerModels == null || customerModels.isEmpty()) {
                log.error("Customer data not found for company: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.CUSTOMER_DATA_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            customerModels.forEach(GSTAccountUtils::unmaskCustomerProperties);
            invoiceModels.forEach(GSTAccountUtils::unMaskInvoiceProperties);

            Map<String, CustomerModel> customerIdMap = customerModels.stream()
                    .filter(c -> c.getCustomerId() != null)
                    .collect(Collectors.toMap(CustomerModel::getCustomerId, c -> c));

            // Collect GST numbers and names from Invoices
            Map<String, String> invoiceGstNameMap = new HashMap<>();
            for (InvoiceModel invoice : invoiceModels) {
                CustomerModel customer = customerIdMap.get(invoice.getCustomerId());
                if (customer != null && customer.getCustomerGstNo() != null) {
                    invoiceGstNameMap.put(customer.getCustomerGstNo(), customer.getCustomerName());
                }
            }

            // GST Accounts from OpenSearch
            Collection<GSTAccountEntity> gstAccounts = gstAccountDao.findByCompanyIdAndMonthAndYear(
                    companyEntity.getShortName(), companyEntity.getId(), year, month, null);

            Map<String, String> gstDbNameMap = gstAccounts.stream()
                    .filter(acc -> acc.getCustomerGstNo() != null)
                    .collect(Collectors.toMap(
                            GSTAccountEntity::getCustomerGstNo,
                            GSTAccountEntity::getCustomerName,
                            (existing, replacement) -> existing // resolve duplicates
                    ));

            Set<String> invoiceGstSet = invoiceGstNameMap.keySet();
            Set<String> gstDbSet = gstDbNameMap.keySet();

            // Comparison maps with names
            List<Map<String, String>> missedCompanyCustomers = new ArrayList<>();
            for (String gst : invoiceGstSet) {
                if (!gstDbSet.contains(gst)) {
                    Map<String, String> data = new LinkedHashMap<>();
                    data.put(Constants.CUSTOMER_GST, gst);
                    data.put(Constants.CUSTOMER_NAME, invoiceGstNameMap.get(gst));
                    missedCompanyCustomers.add(data);
                }
            }

            List<Map<String, String>> notCompanyCustomers = new ArrayList<>();
            for (String gst : gstDbSet) {
                if (!invoiceGstSet.contains(gst)) {
                    Map<String, String> data = new LinkedHashMap<>();
                    data.put(Constants.CUSTOMER_GST, gst);
                    data.put(Constants.CUSTOMER_NAME, gstDbNameMap.get(gst));
                    notCompanyCustomers.add(data);
                }
            }

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put(Constants.MISSED_COMPANY_CUSTOMER, missedCompanyCustomers);
            responseBody.put(Constants.EXTRA_COMPANY_CUSTOMERS, notCompanyCustomers);

            log.info("GST comparison completed successfully for company: {}", companyName);
            return ResponseEntity.ok(responseBody);

        } catch (TaxConsultantException ae) {
            log.error("AccountantException occurred while comparing GST data", ae);
            throw ae;
        } catch (Exception e) {
            log.error("Error comparing GST data", e);
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_FETCH_GST_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> GstAccountRegister(String companyName, String month, String year) throws TaxConsultantException {
        log.info("Starting GST account registration for company: {}, month: {}, year: {}", companyName, month, year);

        CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
        if (companyEntity == null) {
            log.error("Company not found for name: {}", companyName);
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
        }

        String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
        try {
            List<InvoiceModel> invoiceModels = openSearchOperations.getInvoicesByCompanyId(companyEntity.getId(), index);
            if (invoiceModels == null || invoiceModels.isEmpty()) {
                log.error("Invoice data not found for company: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.INVOICE_DATA_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            List<CustomerModel> customerModels = customerRepository.findByCompanyId(companyEntity.getId());
            if (customerModels == null || customerModels.isEmpty()) {
                log.error("Customer data not found for company: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.CUSTOMER_DATA_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            customerModels.forEach(GSTAccountUtils::unmaskCustomerProperties);
            invoiceModels.forEach(GSTAccountUtils::unMaskInvoiceProperties);

            Map<String, CustomerModel> customerIdMap = customerModels.stream()
                    .filter(c -> c.getCustomerId() != null)
                    .collect(Collectors.toMap(CustomerModel::getCustomerId, c -> c));

            List<GSTAccountEntity> gstAccounts = new ArrayList<>();

            for (InvoiceModel invoice : invoiceModels) {
                CustomerModel customer = customerIdMap.get(invoice.getCustomerId());
                GSTAccountUtils.calculateGrandTotal(invoice);
                if (customer != null && customer.getCustomerGstNo() != null) {
                    GSTAccountEntity entity = new GSTAccountEntity();
                    entity.setCompanyId(companyEntity.getId());
                    entity.setMonth(month);
                    entity.setYear(year);
                    entity.setCustomerGstNo(base64Encode(customer.getCustomerGstNo()));
                    entity.setCustomerName(customer.getCustomerName());
                    entity.setInvoiceNumber((invoice.getInvoiceNo()));
                    entity.setInvoiceDate(invoice.getInvoiceDate());
                    entity.setTotalAmount(base64Encode(invoice.getGrandTotal()));
                    entity.setSubTotal(base64Encode(invoice.getSubTotal()));
                    entity.setIGst(base64Encode(invoice.getIGst()));
                    entity.setCGst(base64Encode(invoice.getCGst()));
                    entity.setSGst(base64Encode(invoice.getIGst()));
                    entity.setStatus(Constants.FILED);
                    entity.setType(Constants.GST_ACCOUNT);

                    String resourceId = ResourceIdUtils.generateGSTAccountResourceId(customer.getCustomerGstNo(),month, year);
                    entity.setId(resourceId);
                    gstAccounts.add(entity);
                }
            }
            for (GSTAccountEntity account : gstAccounts) {
                openSearchOperations.saveEntity(account, account.getId(), index);
            }
            log.info("GST account registration completed successfully for company: {}", companyName);
            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS),
                    HttpStatus.CREATED);

        } catch (TaxConsultantException ae) {
            log.error("AccountantException occurred while registering GST accounts", ae);
            throw ae;
        } catch (Exception e) {
            log.error("Error registering GST accounts", e);
            throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
