package com.pb.employee.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequest {

    private List<Map<
            @NotNull(message = "{invoice.key.notnull}") String,
            @NotNull(message = "{invoice.value.notnull}") String>> productData;

    @Valid
    @NotNull(message = "{invoice.productColumns.null}")
    @NotEmpty(message = "{invoice.productColumns.empty}")
    private List<ProductColumnsRequest> productColumns;

    private String vendorCode;
    private String purchaseOrder;
    private String invoiceDate;
    private String dueDate;
    private String subTotal;
    private String status;
    private String bankId;
}

