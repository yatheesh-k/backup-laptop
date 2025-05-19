package com.invoice.serviceImpl;

import com.invoice.common.ResponseBuilder;
import com.invoice.config.Config;
import com.invoice.exception.InvoiceErrorMessageHandler;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.model.*;
import com.invoice.opensearch.OpenSearchOperations;
import com.invoice.repository.CustomerRepository;
import com.invoice.request.InvoiceRequest;
import com.invoice.service.InvoiceService;
import com.invoice.util.*;
import com.itextpdf.text.DocumentException;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
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
    private Config config;

    @Override
    public ResponseEntity<?> generateInvoice(String companyId, String customerId, InvoiceRequest request) throws InvoiceException, IOException {
        CompanyEntity companyEntity;
        BankEntity bankEntity;

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

        try {
            InvoiceModel invoiceModel;
            // Generate a timestamped invoiceId
            LocalDateTime currentDateTime = LocalDateTime.now();
            String timestamp = currentDateTime.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

            String invoiceId = ResourceIdUtils.generateInvoiceResourceId(companyId, customerId, timestamp);

            String invoiceNo = InvoiceUtils.generateNextInvoiceNumber(invoiceId,companyEntity.getShortName(),openSearchOperations); // Assuming this method increments invoice numbers correctly
            // Create invoice entity
            Entity invoiceEntity = InvoiceUtils.maskInvoiceProperties(request, invoiceId, invoiceNo, companyEntity, customer, bankEntity);
            // Save to OpenSearch
            openSearchOperations.saveEntity(invoiceEntity, invoiceId, index);

            log.info("Invoice created successfully for customer: {}", customerId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.CREATE_SUCCESS), HttpStatus.CREATED);
        } catch (InvoiceException e) {
            log.error("Error occurred: {}", e.getMessage(), e);
            throw new InvoiceException(e.getMessage(), e.getMessage()); // Preserve original error message
        } catch (Exception e) {
            log.error("Unexpected error: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.UNEXPECTED_ERROR.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public void validateInvoiceDate(String invoiceDate) throws InvoiceException {
        if (!DateValidator.isPastOrPresent(invoiceDate)) {
            throw new InvoiceException(InvoiceErrorMessageKey.INVALID_INVOICE_DATE.getMessage(),HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<?> getCompanyAllInvoices(String companyId, String customerId,HttpServletRequest request) throws InvoiceException {
        List<InvoiceModel> invoiceEntities;

        try {
            // Fetch company by ID
            CompanyEntity companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
            if (companyEntity == null) {
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
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVOICE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            // Unmask sensitive properties in each invoice
            for (InvoiceModel invoice : invoiceEntities) {
                InvoiceUtils.unMaskInvoiceProperties(invoice, request);
            }

            // Return success response with the list of invoices
            return ResponseEntity.ok(ResponseBuilder.builder().build().createSuccessResponse(invoiceEntities));

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

            // Fetch Customer Entity
            CustomerModel customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new InvoiceException(
                            InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND), HttpStatus.BAD_REQUEST));

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
            // Unmask sensitive properties in the invoice
            InvoiceUtils.unMaskInvoiceProperties(invoiceEntity,request);

            // Return success response
            return ResponseEntity.ok(ResponseBuilder.builder().build().createSuccessResponse(invoiceEntity));
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
        // Fetch Customer Model
        customerRepository.findById(customerId)
                .orElseThrow(() -> {
                    log.error("Customer with ID {} not found", customerId);
                    return new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND), HttpStatus.NOT_FOUND);
                });

        try {
            InvoiceUtils.unMaskInvoiceProperties(invoiceEntity,request);
            // Generate HTML from FreeMarker template
            Map<String, Object> model = new HashMap<>();
            model.put(Constants.INVOICE, invoiceEntity);
            model.put(Constants.IGST,invoiceEntity.getIGst());
            model.put(Constants.SGST,invoiceEntity.getSGst());
            model.put(Constants.CGST,invoiceEntity.getCGst());
            Template template = freeMarkerConfig.getTemplate(Constants.TEMPLATE);
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
        } catch (Exception e) {
            log.error("An error occurred while fetching or generating invoice: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVALID_INVOICE_ID_FORMAT), HttpStatus.BAD_REQUEST);
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

}

