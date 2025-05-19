package com.invoice.util;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoice.config.NumberToWordsConverter;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.model.*;
import com.invoice.opensearch.OpenSearchOperations;
import com.invoice.request.CustomerRequest;
import com.invoice.request.InvoiceRequest;
import com.invoice.request.ProductColumnsRequest;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static org.bouncycastle.asn1.x500.style.RFC4519Style.c;


@Slf4j
public class InvoiceUtils {

    @Autowired
    private static OpenSearchOperations openSearchOperations;

    public static InvoiceModel maskInvoiceProperties(InvoiceRequest request, String invoiceId, String invoiceNo, CompanyEntity companyEntity, CustomerModel customerModel, BankEntity bankEntity) throws InvoiceException {
        ObjectMapper objectMapper = new ObjectMapper();

        // Convert the InvoiceRequest to InvoiceModel
        InvoiceModel entity = objectMapper.convertValue(request, InvoiceModel.class);

        // Validate product details
        if (request.getProductData() == null || request.getProductData().isEmpty()) {
            throw new InvoiceException(InvoiceErrorMessageKey.PRODUCT_NOT_FOUND.getMessage(), HttpStatus.BAD_REQUEST);
        }

        // ✅ Validate productColumns (Ensure no empty or null values)
        if (request.getProductColumns() == null || request.getProductColumns().isEmpty()) {
            throw new InvoiceException(InvoiceErrorMessageKey.PLEASE_ENTER_FIELD_NAME.getMessage(), HttpStatus.BAD_REQUEST);
        }

        for (ProductColumnsRequest column : request.getProductColumns()) {
            if (column.getKey() == null || column.getTitle().trim().isEmpty()) {
                throw new InvoiceException(InvoiceErrorMessageKey.PLEASE_ENTER_FIELD_NAME.getMessage(), HttpStatus.BAD_REQUEST);
            }
        }
        // Set the necessary fields
        entity.setInvoiceId(invoiceId);
        entity.setType(Constants.INVOICE);
        entity.setStatus(request.getStatus());
        entity.setCompanyId(companyEntity.getId());
        entity.setCustomerId(customerModel.getCustomerId());
        entity.setBank(bankEntity);
        entity.setCustomer(customerModel);
        entity.setCompany(companyEntity);
        entity.setInvoiceNo(invoiceNo);

        // Mask productData (List<Map<String, String>>)
        if (request.getProductData() != null) {
            List<Map<String, String>> maskedProductData = request.getProductData().stream()
                    .map(InvoiceUtils::maskMapValues) // Mask each map in the list
                    .collect(Collectors.toList());
            entity.setProductData(maskedProductData);
        }

        // Mask productColumns (List<ProductColumnsRequest>)
        if (request.getProductColumns() != null) {
            List<ProductColumnsRequest> maskedColumns = request.getProductColumns().stream()
                    .map(InvoiceUtils::maskProductColumn)
                    .collect(Collectors.toList());
            entity.setProductColumns(maskedColumns);
        }

        // Mask other string fields
        entity.setInvoiceDate(maskValue(request.getInvoiceDate()));
        entity.setDueDate(maskValue(request.getDueDate()));
        entity.setPurchaseOrder(maskValue(request.getPurchaseOrder()));
        entity.setVendorCode(maskValue(request.getVendorCode()));
        entity.setSubTotal(maskValue(request.getSubTotal()));

        return entity;
    }

    // Mask values in a Map<String, String>
    private static Map<String, String> maskMapValues(Map<String, String> data) {
        return data.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey, // Keep the key as is
                        entry -> maskValue(entry.getValue()) // Mask the value
                ));
    }

    // Mask ProductColumnsRequest fields
    private static ProductColumnsRequest maskProductColumn(ProductColumnsRequest column) {
        return ProductColumnsRequest.builder()
                .key(maskValue(column.getKey()))
                .title(maskValue(column.getTitle()))
                .type(maskValue(column.getType()))
                .build();
    }

    // Masking logic (Base64 encoding)
    private static String maskValue(String value) {
        if (value == null || value.isEmpty()) {
            return value;
        }
        return Base64.getEncoder().encodeToString(value.getBytes());
    }


    public static void unMaskInvoiceProperties(InvoiceModel invoiceEntity, HttpServletRequest request) {
        if (invoiceEntity != null) {
            log.debug("Unmasking invoice: {}", invoiceEntity);

            if (invoiceEntity.getInvoiceId() != null) {
                invoiceEntity.setInvoiceId(invoiceEntity.getInvoiceId());
            }

            invoiceEntity.setInvoiceDate(unMaskValue(invoiceEntity.getInvoiceDate()));
            invoiceEntity.setDueDate(unMaskValue(invoiceEntity.getDueDate()));
            invoiceEntity.setPurchaseOrder(unMaskValue(invoiceEntity.getPurchaseOrder()));
            invoiceEntity.setVendorCode(unMaskValue(invoiceEntity.getVendorCode()));
            invoiceEntity.setSubTotal(unMaskValue(invoiceEntity.getSubTotal()));
            invoiceEntity.setInvoiceNo(invoiceEntity.getInvoiceNo());


            // Unmask productData (List<Map<String, String>>)
            if (invoiceEntity.getProductData() != null) {
                List<Map<String, String>> unmaskedProductData = invoiceEntity.getProductData().stream()
                        .map(productMap -> {
                            Map<String, String> unmaskedMap = new HashMap<>();
                            for (Map.Entry<String, String> entry : productMap.entrySet()) {
                                unmaskedMap.put(entry.getKey(), unMaskValue(entry.getValue()));
                            }
                            return unmaskedMap;
                        })
                        .collect(Collectors.toList());
                invoiceEntity.setProductData(unmaskedProductData);
            }

            // Unmask productColumns (List<ProductColumnsRequest>)
            if (invoiceEntity.getProductColumns() != null) {
                List<ProductColumnsRequest> unmaskedColumns = invoiceEntity.getProductColumns().stream()
                        .map(InvoiceUtils::unMaskProductColumn)
                        .collect(Collectors.toList());
                invoiceEntity.setProductColumns(unmaskedColumns);
            }

            if (invoiceEntity.getCustomer() != null) {
                log.debug("Before unmasking customer: {}", invoiceEntity.getCustomer());
                invoiceEntity.getCustomer().setAddress(unMaskValue(invoiceEntity.getCustomer().getAddress()));
                invoiceEntity.getCustomer().setCity(unMaskValue(invoiceEntity.getCustomer().getCity()));
                invoiceEntity.getCustomer().setState(unMaskValue(invoiceEntity.getCustomer().getState()));
                invoiceEntity.getCustomer().setStateCode(unMaskValue(invoiceEntity.getCustomer().getStateCode()));
                invoiceEntity.getCustomer().setPinCode(unMaskValue(invoiceEntity.getCustomer().getPinCode()));
                invoiceEntity.getCustomer().setMobileNumber(unMaskValue(invoiceEntity.getCustomer().getMobileNumber()));
                invoiceEntity.getCustomer().setEmail(unMaskValue(invoiceEntity.getCustomer().getEmail()));
                invoiceEntity.getCustomer().setCustomerGstNo(unMaskValue(invoiceEntity.getCustomer().getCustomerGstNo()));
                invoiceEntity.getCustomer().setCustomerName(unMaskValue(invoiceEntity.getCustomer().getCustomerName()));
                log.debug("After unmasking customer: {}", invoiceEntity.getCustomer());
            }

            if (invoiceEntity.getBank() != null) {
                log.debug("Before unmasking bank: {}", invoiceEntity.getBank());
                invoiceEntity.getBank().setAccountNumber(unMaskValue(invoiceEntity.getBank().getAccountNumber()));
                invoiceEntity.getBank().setAccountType(unMaskValue(invoiceEntity.getBank().getAccountType()));
                invoiceEntity.getBank().setBankName(unMaskValue(invoiceEntity.getBank().getBankName()));
                invoiceEntity.getBank().setBranch(unMaskValue(invoiceEntity.getBank().getBranch()));
                invoiceEntity.getBank().setIfscCode(unMaskValue(invoiceEntity.getBank().getIfscCode()));
                invoiceEntity.getBank().setAddress(unMaskValue(invoiceEntity.getBank().getAddress()));
                log.debug("After unmasking bank: {}", invoiceEntity.getBank());
            }

            if (invoiceEntity.getCompany() != null) {
                log.debug("Before unmasking company: {}", invoiceEntity.getCompany());
                invoiceEntity.getCompany().setGstNo(unMaskValue(invoiceEntity.getCompany().getGstNo()));
                invoiceEntity.getCompany().setPanNo(unMaskValue(invoiceEntity.getCompany().getPanNo()));
                invoiceEntity.getCompany().setMobileNo(unMaskValue(invoiceEntity.getCompany().getMobileNo()));
                invoiceEntity.getCompany().setCinNo(unMaskValue(invoiceEntity.getCompany().getCinNo()));
                String baseUrl = getBaseUrl(request);
                String image = baseUrl + "var/www/ems/assets/img/" + invoiceEntity.getCompany().getImageFile();
                invoiceEntity.getCompany().setImageFile(image);
                String stampImage = baseUrl + "var/www/ems/assets/img/" + invoiceEntity.getCompany().getStampImage();
                invoiceEntity.getCompany().setStampImage(stampImage);
            }
            // Convert subTotal to a numeric value
            double subTotal = parseAmount(invoiceEntity.getSubTotal());
            double cGst = 0.0, sGst = 0.0, iGst = 0.0, grandTotal = subTotal;

            // Get GST numbers
            String companyGstNo = (invoiceEntity.getCompany() != null) ? invoiceEntity.getCompany().getGstNo() : null;
            String customerGstNo = (invoiceEntity.getCustomer() != null) ? invoiceEntity.getCustomer().getCustomerGstNo() : null;

            // Validate GST numbers
            if (customerGstNo != null && !customerGstNo.isEmpty() && !customerGstNo.matches("^0+$")) {
                if (companyGstNo != null && companyGstNo.length() >= 2 && customerGstNo.length() >= 2) {
                    // Compare first two digits
                    if (companyGstNo.substring(0, 2).equals(customerGstNo.substring(0, 2))) {
                        cGst = subTotal * 0.09; // 9% CGST
                        sGst = subTotal * 0.09; // 9% SGST
                        grandTotal += cGst + sGst;
                    } else {
                        iGst = subTotal * 0.18; // 18% IGST
                        grandTotal += iGst;
                    }
                }
            }
            // Set calculated values back to entity
            invoiceEntity.setCGst(formatAmount(cGst));
            invoiceEntity.setSGst(formatAmount(sGst));
            invoiceEntity.setIGst(formatAmount(iGst));
            invoiceEntity.setGrandTotal(formatAmount(grandTotal));

            // Convert grand total to words and set it in the entity
            BigDecimal grandTotalValue = new BigDecimal(grandTotal);
            String grandTotalInWords = NumberToWordsConverter.convert(grandTotalValue);
            invoiceEntity.setGrandTotalInWords(grandTotalInWords);

            log.debug("Updated Invoice - cGst: {}, sGst: {}, iGst: {}, grandTotal: {}",
                    invoiceEntity.getCGst(), invoiceEntity.getSGst(), invoiceEntity.getIGst(), invoiceEntity.getGrandTotal());
        }
    }

    /**
     * Formats a double value to two decimal places and converts it to a string.
     */
    private static String formatAmount(double amount) {
        return String.format("%.2f", amount);
    }

    public static String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme(); // http or https
        String serverName = request.getServerName(); // localhost or IP address
        int serverPort = request.getServerPort(); // port number
        String contextPath = "/" + request.getContextPath(); // context path

        return scheme + "://" + serverName + ":" + serverPort + contextPath + "/";
    }

    /**
     * Parses a string amount into a double, handling nulls and invalid values.
     */
    private static double parseAmount(String amount) {
        if (amount == null || amount.trim().isEmpty()) {
            return 0.0;
        }
        try {
            return Double.parseDouble(amount);
        } catch (NumberFormatException e) {
            log.error("Invalid amount format: {}", amount);
            return 0.0;

        }
    }

    /**
     * Method to unmask a ProductColumn.
     */
    private static ProductColumnsRequest unMaskProductColumn(ProductColumnsRequest column) {
        if (column != null) {
            column.setKey(unMaskValue(column.getKey()));
            column.setType(unMaskValue(column.getType()));
            column.setTitle(unMaskValue(column.getTitle()));
        }
        return column;
    }

    /**
     * Base64 decoding method to unmask values.
     */
    private static String unMaskValue(String value) {
        if (value == null || value.isEmpty()) {
            return value; // Return as is if null or empty
        }
        return new String(Base64.getDecoder().decode(value)); // Correctly decode without extra bytes conversion
    }

    public static String generateNextInvoiceNumber(String companyId, String shortName, OpenSearchOperations openSearchOperations) throws InvoiceException {
        // Fetch last invoice number from OpenSearch
        String lastInvoiceNo = openSearchOperations.findLastInvoiceNumber(companyId, shortName);

        // If no previous invoice exists, start with the first invoice of the financial year
        if (lastInvoiceNo == null || lastInvoiceNo.isEmpty()) {
            return generateFirstInvoiceNumber();
        }

        String[] parts = lastInvoiceNo.split("-");

        // Validate the format to avoid incorrect invoice numbers
        if (parts.length < 3) {
            log.error("Invalid invoice number format retrieved: {}", lastInvoiceNo);
            throw new InvoiceException(InvoiceErrorMessageKey.INVALID_INVOICE_ID_FORMAT.getMessage() + lastInvoiceNo, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        try {
            int nextNumber = Integer.parseInt(parts[2]) + 1;  // Increment last invoice number
            return parts[0] + "-" + parts[1] + "-" + String.format("%03d", nextNumber);
        } catch (NumberFormatException e) {
            log.error("Error parsing invoice number: {}", lastInvoiceNo, e);
            throw new InvoiceException("Error parsing invoice number: " + lastInvoiceNo, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public static String generateFirstInvoiceNumber() {
        LocalDate currentDate = LocalDate.now();
        int year = currentDate.getYear();
        int nextYear = (year + 1) % 100; // Get last two digits of next year
        int prevYear = year - 1;

        // Determine financial year (April - March cycle)
        String financialYear;
        if (currentDate.getMonthValue() < 4) { // If Jan, Feb, Mar → previous financial year
            financialYear = prevYear + "-" + String.format("%02d", year % 100);
        } else { // April onwards → current financial year
            financialYear = year + "-" + String.format("%02d", nextYear);
        }

        return financialYear + "-001"; // Example: 2024-25-001
    }
}
