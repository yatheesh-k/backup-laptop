package com.ems.taxConsultant.request;

import com.ems.taxConsultant.validation.MonthValidation;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.micrometer.common.lang.Nullable;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GSTAccountRequest {


    @NotBlank(message = "{customerName.notnull.message}")
    @Size(min = 2, max = 100, message = "{customerName.size.message}")
    private String customerName;

    @Nullable
    @Pattern(regexp = "^$|[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$", message = "{customerGstNo.invalid}")
    private String customerGstNo;

    @MonthValidation
    private String month;

    @Schema(example = "2024")
    @Size(min = 4, max = 4, message = "{year.size.message}")
    @Pattern(regexp = "^(19|20)\\d{2}$", message = "{year.message}")
    private String year;

    @NotBlank(message = "{invoiceNumber.notnull.message}")
    @Size(min = 1, max = 50, message = "{invoiceNumber.size.message}")
    private String invoiceNumber;

    @NotBlank(message = "{invoiceDate.notnull.message}")
    @Size(max = 10, message = "{invoiceDate.size.message}")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "{invoiceDate.format.message}")
    private String invoiceDate;

    @NotBlank(message = "{totalAmount.notnull.message}")
    @Size(max = 15, message = "{totalAmount.size.message}")
    private String totalAmount;

    @NotBlank(message = "{taxableValue.notnull.message}")
    @Size(max = 15, message = "{taxableValue.size.message}")
    private String subTotal;

    @NotBlank(message = "{cGst.notnull.message}")
    @Size(max = 15, message = "{cGst.size.message}")
    private String cGst;

    @NotBlank(message = "{sGst.notnull.message}")
    @Size(max = 15, message = "{sGst.size.message}")
    private String sGst;

    @NotBlank(message = "{iGst.notnull.message}")
    @Size(max = 15, message = "{iGst.size.message}")
    private String iGst;

}