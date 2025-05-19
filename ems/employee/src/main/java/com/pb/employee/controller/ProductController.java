package com.pb.employee.controller;

import com.pb.employee.request.ProductRequest;
import com.pb.employee.service.ProductService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("company/{companyId}/product")
    @Operation(security = {@SecurityRequirement(name = Constants.AUTH_KEY)}, summary = "${api.createProduct.tag}",description="${api.createProduct.description}")
    @ApiResponse(responseCode = "200", description = "CREATED")
    public ResponseEntity<?> createProduct(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @Parameter(required = true, description = "${api.createCompanyPayload.description}")
                                           @PathVariable String companyId,
                                           @RequestBody @Valid ProductRequest request) {
        return productService.createProduct(authToken,companyId, request);
    }

    @GetMapping("company/{companyId}/product/{productId}")
    @Operation(security = {@SecurityRequirement(name = Constants.AUTH_KEY)}, summary = "${api.getProduct.tag}",description="${api.getProduct.description}")
    @ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getProductById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @Parameter(required = true, description = "${api.getCompanyPayload.description}")
                                            @PathVariable String companyId,
                                            @Parameter(required = true, description = "${api.getProductPayload.description}")
                                            @PathVariable String productId) {
        return productService.getProductById(authToken,companyId,productId);
    }

    @GetMapping("company/{companyId}/product/all")
    @Operation(security = {@SecurityRequirement(name = Constants.AUTH_KEY)}, summary = "${api.getAllProducts.tag}",description="${api.getAllProducts.description}")
    @ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getAllProductsByCompanyId(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                       @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                       @Parameter(required = true, description = "${api.getAllCompanyPayload.description}")
                                                       @PathVariable String companyId) {
        return productService.getAllProductsByCompanyId(authToken,companyId);
    }

    @PatchMapping("company/{companyId}/product/{productId}")
    @Operation(security = {@SecurityRequirement(name = Constants.AUTH_KEY)}, summary = "${api.updateProduct.tag}",description="${api.updateProduct.description}")
    @ApiResponse(responseCode = "200", description = "ACCEPTED")
    public ResponseEntity<?> updateProduct(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @Parameter(required = true, description = "${api.updateCompanyPayload.description}")
                                           @PathVariable String companyId,
                                           @Parameter(required = true, description = "${api.updateProductPayload.description}")
                                           @PathVariable String productId,
                                           @RequestBody @Valid ProductRequest productRequest) {
        return productService.updateProduct(authToken,companyId,productId,productRequest);
    }

    @DeleteMapping("company/{companyId}/product/{productId}")
    @Operation(security = {@SecurityRequirement(name = Constants.AUTH_KEY)}, summary = "${api.deleteProduct.tag}",description="${api.deleteProduct.description}")
    @ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deleteProduct(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @Parameter(required = true, description = "${api.deleteCompanyPayload.description}")
                                           @PathVariable String companyId,
                                           @Parameter(required = true, description = "${api.deleteProductPayload.description}")
                                           @PathVariable String productId) {
        return productService.deleteProduct(authToken,companyId,productId);
    }
}
