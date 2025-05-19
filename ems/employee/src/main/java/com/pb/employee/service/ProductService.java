package com.pb.employee.service;

import com.pb.employee.request.ProductRequest;
import org.springframework.http.ResponseEntity;

public interface ProductService {

    ResponseEntity<?> createProduct(String authToken,String companyId, ProductRequest request);

    ResponseEntity<?> getProductById(String authToken,String companyId,String productId);

    ResponseEntity<?> getAllProductsByCompanyId(String authToken,String companyId);

    ResponseEntity<?> updateProduct(String authToken,String companyId,String productId, ProductRequest productRequest);

    ResponseEntity<?> deleteProduct(String authToken,String companyId,String productId);
}
