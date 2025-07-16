package com.ems.accountant.request;

import com.ems.accountant.validation.MonthValidation;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GSTReceiptRequest {

    @MonthValidation
    private String month;

    @Schema(example = "2024")
    @Size(min = 4, max = 4, message = "{year.size.message}")
    @Pattern(regexp = "^(19|20)\\d{2}$", message = "{year.message}")
    private String year;

    @Schema(example = "1800")
    @Pattern(regexp = "^[0-9]+(\\.[0-9]{1,2})?$", message = "{gstTotalAmount.message}")
    private String gstTotalAmount;

    @Schema(example = "100456789012")
    @Pattern(regexp = "^\\d{1,30}$", message = "{gstReceiptNumber.message}")
    private String gstReceiptNumber;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{gstReceiptDate.format}")
    @NotBlank(message = "{gstReceiptDate.notnull.message}")
    private String gstReceiptDate;

    private MultipartFile file;

}
