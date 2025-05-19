package com.pb.employee.serviceImpl;

import com.pb.employee.request.ProductRequest;
import com.pb.employee.service.ProductService;
import com.pb.employee.util.Constants;
import com.pb.employee.util.EntityUtils;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final WebClient webClient;

    @Autowired
    private EntityUtils entityUtils;

    public ProductServiceImpl(WebClient.Builder webClientBuilder, @Value("${invoice.service.baseUrl}") String baseUrl) {
        log.info("Base URL: {}", baseUrl);
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    @Override
    public ResponseEntity<?> createProduct(String authToken,String companyId, ProductRequest request) {
            return entityUtils.sendPostRequest(authToken,request,Constants.COMPANY_ADD+companyId+Constants.PRODUCT_ADD);
    }

    @Override
    public ResponseEntity<?> getProductById(String authToken,String companyId,String productId) {
      return entityUtils.getRequest(authToken,Constants.COMPANY_ADD+companyId+Constants.PRODUCT+productId);
    }

    @Override
    public ResponseEntity<?> getAllProductsByCompanyId(String authToken,String companyId) {
            return entityUtils.getRequest(authToken,Constants.COMPANY_ADD+companyId+Constants.PRODUCT + Constants.ALL);
    }

    @Override
    public ResponseEntity<?> updateProduct(String authToken,String companyId,String productId, ProductRequest productRequest) {
            return entityUtils.sendPatchRequest(authToken,productRequest,Constants.COMPANY_ADD+companyId+Constants.PRODUCT + productId);
    }

    @Override
    public ResponseEntity<?> deleteProduct(String authToken,String companyId,String productId) {
            return entityUtils.deleteRequest(authToken,Constants.COMPANY_ADD+companyId+Constants.PRODUCT + productId);
    }
}