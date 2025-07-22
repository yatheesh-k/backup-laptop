package com.ems.taxConsultant.request;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DueDatesRequest {

    @Schema(example = "01")
    @Pattern(regexp = "^((0[1-9]|[12][0-9]|3[01])|null)$", message = "{pfDay.message}")
    private String pfDay;

    @Schema(example = "01")
    @Pattern(regexp = "^((0[1-9]|[12][0-9]|3[01])|null)$", message = "{gstDay.message}")
    private String gstDay;

    @Schema(example = "01")
    @Pattern(regexp = "^((0[1-9]|[12][0-9]|3[01])|null)$", message = "{ptDay.message}")
    private String ptDay;

    @Schema(example = "01")
    @Pattern(regexp = "^(0[1-9]|[12][0-9]|3[01])$", message = "{tdsDay.message}")
    private String tdsDay;

}
