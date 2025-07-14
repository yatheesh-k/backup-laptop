package com.invoice.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoice.common.ResponseBuilder;
import com.invoice.config.Config;
import com.invoice.exception.InvoiceErrorMessageHandler;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.model.*;
import com.invoice.opensearch.OpenSearchOperations;
import com.invoice.repository.CustomerRepository;
import com.invoice.request.InvoiceRequest;
import com.invoice.request.InvoiceUpdateRequest;
import com.invoice.response.InvoiceResponse;
import com.invoice.service.InvoiceService;
import com.invoice.util.*;
import com.itextpdf.text.DocumentException;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import io.swagger.models.auth.In;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;


@Service
@Slf4j
public class InvoiceServiceImpl implements InvoiceService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private Configuration freeMarkerConfig;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private Config config;

    @Override
    public ResponseEntity<?> generateInvoice(String companyId, String customerId, InvoiceRequest request) throws InvoiceException, IOException {
        CompanyEntity companyEntity;
        BankEntity bankEntity;
        List<InvoiceModel> purchaseOrderNo;

        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (companyEntity == null) {
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND), HttpStatus.NOT_FOUND);
        }

        // Validate Invoice Date
        validateInvoiceDate(request.getInvoiceDate());
        String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());

        CustomerModel customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new InvoiceException(
                        InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND), HttpStatus.BAD_REQUEST));
        // Check if the customer belongs to the provided companyId
        if (!customer.getCompanyId().equals(companyId)) {
            log.error("Customer ID {} does not belong to company ID {}", customer.getCustomerId(), companyId);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_ASSOCIATED_WITH_COMPANY), HttpStatus.BAD_REQUEST);
        }
        bankEntity = openSearchOperations.getBankById(index, null, request.getBankId());
        if (bankEntity == null) {
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.BANK_DETAILS_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        purchaseOrderNo = openSearchOperations.getPurchaseOrderNo(index,request.getPurchaseOrder());
        if(!purchaseOrderNo.isEmpty()){
            log.error("Purchase order number already exist ");
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.PURCHASE_ORDER_ALREADY_EXISTS), HttpStatus.CONFLICT);
        }

        try {
            InvoiceModel invoiceModel;
            // Generate a timestamped invoiceId
            LocalDateTime currentDateTime = LocalDateTime.now();
            String timestamp = currentDateTime.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String invoiceId = ResourceIdUtils.generateInvoiceResourceId(companyId, customerId, timestamp);
            String invoiceNo = InvoiceUtils.generateNextInvoiceNumber(invoiceId,companyEntity.getShortName(),openSearchOperations); // Assuming this method increments invoice numbers correctly
            Entity invoiceEntity = InvoiceUtils.maskInvoiceProperties(request, invoiceId, invoiceNo, companyEntity, customer, bankEntity);
            openSearchOperations.saveEntity(invoiceEntity, invoiceId, index);

            log.info("Invoice created successfully for customer: {}", customerId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.CREATE_SUCCESS), HttpStatus.CREATED);
        } catch (InvoiceException e) {
            log.error("Error occurred: {}", e.getMessage(), e);
            throw new InvoiceException(e.getMessage(), e.getMessage()); // Preserve original error message
        } catch (Exception e) {
            log.error("Unexpected error: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.UNEXPECTED_ERROR), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public void validateInvoiceDate(String invoiceDate) throws InvoiceException {
        if (!DateValidator.isPastOrPresent(invoiceDate)) {
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVALID_INVOICE_DATE),HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<?> getCompanyAllInvoices(String companyId, String customerId,String year,String month,HttpServletRequest request) throws InvoiceException {
        List<InvoiceModel> invoiceEntities;
        InvoiceResponse invoiceResponse = null;

        try {
            // Fetch company by ID
            CompanyEntity companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company with ID {} not found", companyId);
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            // Generate index specific to the company's short name
            String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());

            // Fetch invoices based on the presence of customerId
            invoiceEntities = StringUtils.hasText(customerId)
                    ? openSearchOperations.getInvoicesByCustomerId(companyId, customerId, index)
                    : openSearchOperations.getInvoicesByCompanyId(companyId, index);

            // If no invoices are found
            if (invoiceEntities == null || invoiceEntities.isEmpty()) {
                log.error("Invoice not found for companyId: {} and customerId: {}", companyId, customerId);
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVOICE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            // Unmask sensitive properties and build a list of InvoiceResponse objects
            List<InvoiceResponse> invoiceResponses = new ArrayList<>();
            CompanyEntity unmaskedCompany = InvoiceUtils.unMaskCompanyProperties(companyEntity, request); // Company details are generally consistent per company

//            // Cache to avoid repeated unmasking of the same customer
             Map<String, CustomerModel> customerCache = new HashMap<>();

            // Unmask sensitive properties in each invoice
            for (InvoiceModel invoice : invoiceEntities) {

                InvoiceUtils.unMaskInvoiceProperties(invoice);
                // Filter by year and/or month (based on parameters)
                boolean include = true;
                try {
                    log.info("Filtering invoice with ID: {} for year: {}, month: {}", invoice.getInvoiceId(), year, month);
                    LocalDate invoiceDate = LocalDate.parse(invoice.getInvoiceDate()); // decoded already

                    if (StringUtils.hasText(year)) {
                        include = include && invoiceDate.getYear() == Integer.parseInt(year);
                    }
                    if (StringUtils.hasText(month)) {
                        include = include && invoiceDate.getMonthValue() == Integer.parseInt(month);
                    }
                } catch (Exception e) {
                    log.info("Skipping invoice due to invalid date format: {}", invoice.getInvoiceId());
                    continue;
                }

                if (!include) continue; // skip non-matching invoices

                // Fetch and unmask customer (with caching)
                String custId = invoice.getCustomerId();
                CustomerModel unmaskedCustomer = customerCache.get(custId);
                if (unmaskedCustomer == null) {

                    CustomerModel customerModel=customerRepository.findById(custId)
                            .orElseThrow(() -> {
                                log.error("Customer with ID {} not found", customerId);
                                return new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND), HttpStatus.NOT_FOUND);
                            });
                    unmaskedCustomer = InvoiceUtils.unMaskCustomerProperties(customerModel);
                    customerCache.put(custId, unmaskedCustomer); // Store in cache
                }
                BankEntity bankEntity = openSearchOperations.getBankById(index, null, invoice.getBankId());
                if (bankEntity == null) {
                    log.error("Bank details not found for invoice ID: {}", invoice.getBankId());
                    throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.BANK_DETAILS_NOT_FOUND), HttpStatus.NOT_FOUND);
                }
                BankEntity unmaskedBank = InvoiceUtils.unMaskBankProperties(bankEntity); // assuming you have this
                InvoiceResponse response = InvoiceResponse.builder().company(unmaskedCompany).customer(unmaskedCustomer).bank(unmaskedBank).build();
                InvoiceUtils.calculateGrandTotal(invoice, response);
                response.setInvoice(invoice);
                invoiceResponses.add(response);
            }
            // Return success response with the list of invoices
            log.info("Successfully fetched invoices for companyId: {} and customerId: {}", companyId, customerId);
            return ResponseEntity.ok(ResponseBuilder.builder().build().createSuccessResponse(invoiceResponses));
        } catch (InvoiceException invoiceException) {
            log.error("InvoiceException while fetching invoices for company {} and customer {}: {}", companyId, customerId, invoiceException.getMessage());
            throw invoiceException; // Preserve original exception

        } catch (Exception ex) {
            log.error("Exception while fetching invoices for company {} and customer {}: {}", companyId, customerId, ex.getMessage());
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.UNEXPECTED_ERROR), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> getInvoiceById(String companyId, String customerId, String invoiceId, HttpServletRequest request) throws InvoiceException {
        log.info("Fetching Invoice with ID: {}", invoiceId);

        try {
            // Fetch Company Entity
            CompanyEntity companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company with ID {} not found", companyId);
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            // Generate index specific to the company's short name
            String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());

            // Fetch Customer Model
            CustomerModel customer=customerRepository.findById(customerId)
                    .orElseThrow(() -> {
                        log.error("Customer with ID {} not found", customerId);
                        return new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND), HttpStatus.NOT_FOUND);
                    });
            // Check if the customer belongs to the provided companyId
            if (!customer.getCompanyId().equals(companyId)) {
                log.error("Customer ID {} does not belong to company ID {}", customer.getCustomerId(), companyId);
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_ASSOCIATED_WITH_COMPANY), HttpStatus.BAD_REQUEST);
            }
            // Fetch Invoice Entity
            InvoiceModel invoiceEntity = openSearchOperations.getInvoiceById(index,null,invoiceId);
            if (invoiceEntity == null) {
                log.error("Invoice with ID {} not found", invoiceId);
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVOICE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            BankEntity bankEntity = openSearchOperations.getBankById(index, null, invoiceEntity.getBankId());
            if (bankEntity == null) {
                log.error("Bank details not found for invoice ID: {}", invoiceEntity.getBankId());
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.BANK_DETAILS_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            // Unmask sensitive properties in the invoice itself
            InvoiceUtils.unMaskInvoiceProperties(invoiceEntity);
            InvoiceResponse invoiceResponse = InvoiceResponse.builder().company(InvoiceUtils.unMaskCompanyProperties(companyEntity, request)).customer(InvoiceUtils.unMaskCustomerProperties(customer)).bank(InvoiceUtils.unMaskBankProperties(bankEntity)).build();
            InvoiceUtils.calculateGrandTotal(invoiceEntity, invoiceResponse);
            invoiceResponse.setInvoice(invoiceEntity);

            // Return success response
            log.info("Successfully fetched invoice with ID: {}", invoiceId);
            return ResponseEntity.ok(ResponseBuilder.builder().build().createSuccessResponse(invoiceResponse));
        } catch (InvoiceException invoiceException) {
            log.error("InvoiceException while fetching invoice with ID {}: {}", invoiceId, invoiceException.getMessage());
            throw invoiceException; // Preserve original exception
        } catch (Exception ex) {
            log.error("Exception while fetching invoice with ID {}: {}", invoiceId, ex.getMessage());
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.UNEXPECTED_ERROR), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> downloadInvoice(String companyId, String customerId, String invoiceId, HttpServletRequest request) throws Exception {
        log.info("Download Invoice with ID: {}", invoiceId);

        // Fetch Company Entity
        CompanyEntity companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (companyEntity == null) {
            log.error("Company with ID {} not found", companyId);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        String companyIndex = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
        SSLUtil.disableSSLVerification();
        InvoiceModel invoiceEntity = openSearchOperations.getInvoiceById(companyIndex,null,invoiceId);
        if (invoiceEntity == null) {
            log.error("Invoice with ID {} not found", invoiceId);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVOICE_NOT_FOUND), HttpStatus.NOT_FOUND);
        }

        if (invoiceEntity.getInvoiceTemplateNo() ==null) {
            log.error("company templates are not exist ");
            throw new InvoiceException(String.format(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.UNABLE_TO_GET_TEMPLATE), companyEntity.getShortName()),
                    HttpStatus.NOT_FOUND);
        }
        // Fetch Customer Model
        CustomerModel customerModel=customerRepository.findById(customerId)
                .orElseThrow(() -> {
                    log.error("Customer with ID {} not found", customerId);
                    return new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND), HttpStatus.NOT_FOUND);
                });
        BankEntity bankEntity = openSearchOperations.getBankById(companyIndex, null, invoiceEntity.getBankId());
        if (bankEntity == null) {
            log.error("Bank details not found for invoice ID: {}", invoiceEntity.getBankId());
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.BANK_DETAILS_NOT_FOUND), HttpStatus.NOT_FOUND);
        }

        try {
            InvoiceUtils.unMaskInvoiceProperties(invoiceEntity);
            InvoiceResponse invoiceResponse = InvoiceResponse.builder()
                    .company(InvoiceUtils.unMaskCompanyProperties(companyEntity, request))
                    .customer(InvoiceUtils.unMaskCustomerProperties(customerModel))
                    .bank(InvoiceUtils.unMaskBankProperties(bankEntity))
                    .build();
            // Calculate Grand Total and update InvoiceModel
            InvoiceUtils.calculateGrandTotal(invoiceEntity, invoiceResponse);
            invoiceResponse.setInvoice(invoiceEntity);

            // Generate HTML from FreeMarker template
            Map<String, Object> model = new HashMap<>();
            model.put(Constants.INVOICE, invoiceResponse.getInvoice());
            model.put(Constants.SHIPPED_TO, invoiceResponse.getInvoice().getShippedPayload());
            model.put(Constants.COMPANY, invoiceResponse.getCompany());
            model.put(Constants.CUSTOMER, invoiceResponse.getCustomer());
            model.put(Constants.BANK_1, invoiceResponse.getBank());
            model.put(Constants.IGST,invoiceResponse.getInvoice().getIGst());
            model.put(Constants.SGST,invoiceResponse.getInvoice().getSGst());
            model.put(Constants.CGST,invoiceResponse.getInvoice().getCGst());

            // Choose the template based on the template number
            String templateName = switch (Integer.parseInt(invoiceEntity.getInvoiceTemplateNo())) {
                case 1 -> Constants.INVOICE_ONE;
                case 2 -> Constants.INVOICE_TWO;
                default -> throw new IllegalArgumentException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVALID_TEMPLATE_NUMBER));
            };
            Template template = freeMarkerConfig.getTemplate(templateName);

            StringWriter stringWriter = new StringWriter();
            try {
                template.process(model, stringWriter);
            } catch (TemplateException e) {
                log.error("Error processing FreeMarker template: {}", e.getMessage());
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVALID_COMPANY), HttpStatus.NOT_FOUND);
            }
            String htmlContent = stringWriter.toString();

            // Generate PDF
            byte[] pdfContent = generatePdfFromHtml(htmlContent);

            // Return PDF as response
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder(Constants.ATTACHMENT)
                    .filename(Constants.INVOICE_ + invoiceId + Constants.PDF)
                    .build());

            log.info("Invoice with ID: {} generated successfully", invoiceId);
            return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
        } catch (InvoiceException invoiceException) {
            log.error("InvoiceException while fetching or generating invoice: {}", invoiceException.getMessage(), invoiceException);
            throw invoiceException; // Preserve original exception
        } catch (Exception e) {
            log.error("An error occurred while fetching or generating invoice: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVALID_INVOICE_ID_FORMAT), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<?> updateInvoice(String companyId, String customerId, String invoiceId, InvoiceUpdateRequest updateRequest, HttpServletRequest request) throws InvoiceException,IOException {
        log.info("Updating Gst with ID: {}", invoiceId);

        CompanyEntity companyEntity;
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (companyEntity == null) {
            log.error("company is not exist with companyId {}", companyId);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }

        String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
        try {
            CustomerModel customer=customerRepository.findById(customerId)
                    .orElseThrow(() -> {
                        log.error("Customer with ID {} not found", customerId);
                        return new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND), HttpStatus.NOT_FOUND);
                    });
            // Check if the customer belongs to the provided companyId
            if (!customer.getCompanyId().equals(companyId)) {
                log.error("Customer ID {} does not belong to company ID {}", customer.getCustomerId(), companyId);
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_ASSOCIATED_WITH_COMPANY), HttpStatus.BAD_REQUEST);
            }

            InvoiceModel invoiceEntity = openSearchOperations.getInvoiceById(index,null,invoiceId);
            if (invoiceEntity == null) {
                log.error("Invoice with ID {} not found", invoiceId);
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVOICE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            BeanUtils.copyProperties(updateRequest, invoiceEntity, getNullPropertyNames(updateRequest));

            InvoiceModel invoiceModelTgt = objectMapper.convertValue(updateRequest, InvoiceModel.class);
            BeanUtils.copyProperties(invoiceModelTgt, invoiceEntity, getNullPropertyNames(invoiceModelTgt));
            
                 openSearchOperations.saveEntity(invoiceEntity, invoiceId, index);

            log.info("Invoice Gst values updated successfully with ID: {}", customerId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.UPDATE_SUCCESS), HttpStatus.OK);

        }catch (InvoiceException invoiceException){
            log.error("Exception while updating the GST Value");
            throw invoiceException;
        } catch (Exception e) {
            log.error("Unexpected error while updating invoice Gst values: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.UNABLE_TO_UPDATE_CUSTOMER.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    private byte[] generatePdfFromHtml(String html) throws IOException {
        html = html.replaceAll("&(?![a-zA-Z]{2,6};|#\\d{1,5};)", "&amp;");
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(baos);
            return baos.toByteArray();
        } catch (DocumentException e) {
            throw new IOException(e.getMessage());
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

