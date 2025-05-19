package com.pb.employee.request;


import com.pb.employee.persistance.model.Entity;
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
public class DeductionRequest {


    @Schema(example = "pfEmployee")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{pfEmployee.format}")
    @Size(min = 3, max = 20, message = "{pfEmployee.size.message}")
    private String pfEmployee;

    @Schema(example = "pfEmployer")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{pfEmployer.format}")
    @Size(min = 3, max = 20, message = "{pfEmployer.size.message}")
    private String pfEmployer;

    private String lop;

    @Schema(example = "totalDeductions")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{totalDeductions.format}")
    @Size(min = 3, max = 20, message = "{totalDeductions.size.message}")
    private String totalDeductions;
//    private String pfTax;
//    private String totalTax;



}