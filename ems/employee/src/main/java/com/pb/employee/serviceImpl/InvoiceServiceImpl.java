package com.pb.employee.serviceImpl;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.InvoiceRequest;
import com.pb.employee.service.InvoiceService;
import com.pb.employee.util.Constants;
import com.pb.employee.util.EntityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Service
public class InvoiceServiceImpl implements InvoiceService {

    private final WebClient webClient;

    @Autowired
    private EntityUtils entityUtils;

    public InvoiceServiceImpl(WebClient.Builder webClientBuilder, @Value("${invoice.service.baseUrl}") String baseUrl) {
        log.info("Base URL: {}", baseUrl);
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    @Override
    public ResponseEntity<?> generateInvoice(String authToken,String companyId,String customerId,InvoiceRequest request) throws EmployeeException {
        return entityUtils.sendPostRequest(authToken,request, Constants.COMPANY_ADD+companyId+Constants.CUSTOMER_GET+customerId+Constants.INVOICE);
    }

    @Override
    public ResponseEntity<?> getInvoiceById(String authToken,String companyId, String customerId, String invoiceId) throws EmployeeException {
        return entityUtils.getRequest(authToken,Constants.COMPANY_ADD+companyId+Constants.CUSTOMER_GET+customerId+Constants.INVOICE_GET+invoiceId);
    }

    @Override
    public ResponseEntity<?> getCompanyAllInvoices(String authToken, String companyId, String customerId) throws EmployeeException {
        return entityUtils.getRequest(authToken,Constants.COMPANY_ADD+companyId+Constants.INVOICE);
    }

    @Override
    public ResponseEntity<?> downloadInvoice(String authToken, String companyId, String customerId, String invoiceId, HttpServletRequest request) throws EmployeeException {
        return entityUtils.getPdfRequest(authToken, Constants.COMPANY_ADD + companyId  + Constants.CUSTOMER_GET + customerId + Constants.INVOICE_DOWNLOAD + invoiceId);
    }
}
