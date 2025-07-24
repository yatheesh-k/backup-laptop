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
import java.time.Month;
import java.time.YearMonth;
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

    private Map<String, Object> parseExcelSheetForComparing(
            CompanyEntity company, String month, String year, MultipartFile file
    ) throws IOException, TaxConsultantException {

        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        List<Object> missingCustomers = new ArrayList<>();
        List<Object> newCustomers = new ArrayList<>();
        List<Object> duplicateGstCustomers = new ArrayList<>();

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put(Constants.THIS_MONTH_MISSING_GST_FILING, missingCustomers);
        responseBody.put(Constants.NEW_GST_FILING, newCustomers);
        responseBody.put(Constants.DUPLICATE_GST, duplicateGstCustomers);

        // Convert month & year
        YearMonth current = YearMonth.of(Integer.parseInt(year), Month.valueOf(month.toUpperCase()));
        YearMonth previous = current.minusMonths(1);
        String prevMonth = previous.getMonth().toString();
        String prevYear = String.valueOf(previous.getYear());

        // Step 1: Read Excel GST data
        Map<String, List<GSTAccountEntity>> excelGstMap = new HashMap<>();
        Map<String, Integer> gstCountMap = new HashMap<>();

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
                    .customerName(customerName)
                    .customerGstNo(customerGstNo)
                    .invoiceNumber(invoiceNumber)
                    .invoiceDate(invoiceDate)
                    .totalAmount(totalAmount)
                    .subTotal(subTotal)
                    .iGst(iGst)
                    .cGst(cGst)
                    .sGst(sGst)
                    .build();

            excelGstMap.computeIfAbsent(customerGstNo, k -> new ArrayList<>()).add(entity);
            gstCountMap.put(customerGstNo, gstCountMap.getOrDefault(customerGstNo, 0) + 1);
        }

        // Step 2: Collect duplicates from Excel GSTs
        for (Map.Entry<String, Integer> entry : gstCountMap.entrySet()) {
            if (entry.getValue() > 1) {
                String gst = entry.getKey();
                GSTAccountEntity example = excelGstMap.get(gst).get(0);
                duplicateGstCustomers.add(String.format("%s (GST: %s)", example.getCustomerName(), gst));
            }
        }

        // Step 3: Fetch previous month GST data from OpenSearch
        Collection<GSTAccountEntity> previousMonthData = gstAccountDao.findByCompanyIdAndMonthAndYear(
                company.getShortName(), company.getId(), prevYear, prevMonth, null
        );

        // Step 4: Prepare previous month GST map
        Map<String, GSTAccountEntity> dbGstMap = new HashMap<>();
        for (GSTAccountEntity entity : previousMonthData) {
            dbGstMap.put(entity.getCustomerGstNo(), entity);
        }

        // Step 5: Identify new customers in current month
        for (String excelGst : excelGstMap.keySet()) {
            if (!dbGstMap.containsKey(excelGst)) {
                GSTAccountEntity newEntry = excelGstMap.get(excelGst).get(0);
                newCustomers.add(String.format("%s (GST: %s)", newEntry.getCustomerName(), excelGst));
            }
        }

        // Step 6: Identify customers who were in previous month but missing this month
        for (String dbGst : dbGstMap.keySet()) {
            if (!excelGstMap.containsKey(dbGst)) {
                GSTAccountEntity missingEntry = dbGstMap.get(dbGst);
                missingCustomers.add(String.format("%s (GST: %s)", missingEntry.getCustomerName(), dbGst));
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
            throw new TaxConsultantException(
                    ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST),
                    HttpStatus.NOT_FOUND
            );
        }

        String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());

        try {
            // Determine previous month and year
            YearMonth current = YearMonth.of(Integer.parseInt(year), Month.valueOf(month.toUpperCase()));
            YearMonth previous = current.minusMonths(1);
            String prevMonth = previous.getMonth().toString();
            String prevYear = String.valueOf(previous.getYear());

            // Get all customers of the company
            List<CustomerModel> customerModels = customerRepository.findByCompanyId(companyEntity.getId());
            if (customerModels == null || customerModels.isEmpty()) {
                throw new TaxConsultantException(
                        ErrorMessageHandler.getMessage(ErrorMessageKey.CUSTOMER_DATA_NOT_FOUND),
                        HttpStatus.NOT_FOUND
                );
            }

            // Current month GST map and duplicate counter
            Map<String, String> currentGstMap = new HashMap<>();
            Map<String, Long> gstDuplicateMap = new HashMap<>();

            for (CustomerModel customer : customerModels) {
                if (customer.getCustomerId() == null || customer.getCustomerGstNo() == null) continue;

                GSTAccountUtils.unmaskCustomerProperties(customer);
                List<InvoiceModel> invoices = openSearchOperations.getInvoicesByCustomerId(customer.getCustomerId(), index);
                if (invoices == null || invoices.isEmpty()) continue;

                for (InvoiceModel invoice : invoices) {
                    GSTAccountUtils.unMaskInvoiceProperties(invoice);
                    String gstNo = customer.getCustomerGstNo();
                    String custName = customer.getCustomerName();

                    if (gstNo != null && !gstNo.isBlank()) {
                        currentGstMap.put(gstNo, custName);
                        gstDuplicateMap.put(gstNo, gstDuplicateMap.getOrDefault(gstNo, 0L) + 1);
                    }
                }
            }

            // Previous month GST data from OpenSearch
            Collection<GSTAccountEntity> lastMonthAccounts = gstAccountDao.findByCompanyIdAndMonthAndYear(
                    companyEntity.getShortName(), companyEntity.getId(), prevYear, prevMonth, null
            );

            Map<String, String> lastGstMap = new HashMap<>();
            for (GSTAccountEntity entity : lastMonthAccounts) {
                GSTAccountEntity gstAccountEntity = GSTAccountUtils.ummaskGSTAccountEntity(entity);
                if (gstAccountEntity.getCustomerGstNo() != null) {
                    lastGstMap.put(gstAccountEntity.getCustomerGstNo(), gstAccountEntity.getCustomerName());
                }
            }

            // Step 1: Identify this month missing GSTs
            List<Object> thisMonthMissing = lastGstMap.entrySet().stream()
                    .filter(entry -> !currentGstMap.containsKey(entry.getKey()))
                    .map(entry -> String.format("%s (GST: %s)", entry.getValue(), entry.getKey()))
                    .collect(Collectors.toList());

            // Step 2: Identify new GSTs this month
            List<Object> newGstFiling = currentGstMap.entrySet().stream()
                    .filter(entry -> !lastGstMap.containsKey(entry.getKey()))
                    .map(entry -> String.format("%s (GST: %s)", entry.getValue(), entry.getKey()))
                    .collect(Collectors.toList());

            // Step 3: Identify duplicate GSTs
            List<Object> duplicateGst = gstDuplicateMap.entrySet().stream()
                    .filter(entry -> entry.getValue() > 1)
                    .map(entry -> {
                        String customerName = currentGstMap.get(entry.getKey());
                        return String.format("%s (GST: %s, Count: %d)", customerName, entry.getKey(), entry.getValue());
                    })
                    .collect(Collectors.toList());

            // Step 4: Prepare final response
            Map<String, Object> responseBody = new LinkedHashMap<>();
            responseBody.put(Constants.NEW_GST_FILING, newGstFiling);
            responseBody.put(Constants.DUPLICATE_GST, duplicateGst);
            responseBody.put(Constants.THIS_MONTH_MISSING_GST_FILING, thisMonthMissing);

            log.info("GST invoice comparison completed for company: {}", companyName);
            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createSuccessResponse(responseBody),
                    HttpStatus.OK
            );

        } catch (TaxConsultantException e) {
            log.error("TaxConsultantException occurred while comparing GST accounts", e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while comparing GST accounts", e);
            throw new TaxConsultantException(
                    ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_FETCH_GST_RESPONSE),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
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
            List<CustomerModel> customerModels = customerRepository.findByCompanyId(companyEntity.getId());
            if (customerModels == null || customerModels.isEmpty()) {
                log.error("Customer data not found for company: {}", companyName);
                throw new TaxConsultantException(ErrorMessageHandler.getMessage(ErrorMessageKey.CUSTOMER_DATA_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            List<GSTAccountEntity> gstAccounts = new ArrayList<>();

            for (CustomerModel customer : customerModels) {
                if (customer.getCustomerId() == null || customer.getCustomerGstNo() == null) continue;

                GSTAccountUtils.unmaskCustomerProperties(customer);

                List<InvoiceModel> invoices = openSearchOperations.getInvoicesByCustomerId(customer.getCustomerId(), index);
                if (invoices == null || invoices.isEmpty()) continue;

                for (InvoiceModel invoice : invoices) {
                    GSTAccountUtils.unMaskInvoiceProperties(invoice);
                    GSTAccountUtils.calculateGrandTotal(invoice);
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

                    String resourceId = ResourceIdUtils.generateGSTAccountResourceId(customer.getCustomerGstNo(), month, year);
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
