package com.pb.employee.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {

    @NotNull(message = "{productId.notnull.message}")
    private String productId;

    @NotNull(message = "{hsnNo.notnull.message}")
    private String hsnNo;

    @NotNull(message = "{purchaseDate.notnull.message}")
    private String purchaseDate;

    @NotNull(message = "{quantity.notnull.message}")
    private Integer quantity;
}
