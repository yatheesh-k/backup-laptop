package com.pb.employee.request;


import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequest{

    @Schema(example = "company")
    @NotNull(message = "${companyname.message}")
    @Pattern(regexp = "^[a-z]+$", message = "${employee.shortname.message}")
    private String company;

    private String employeeId;

    @Schema(example = "month")
    @NotNull(message = "{month.notnull.message}")
    @Pattern(regexp = "^[A-Z][a-z]*$", message = "{invalid.month}")
    private String month;

    @Schema(example = "year")
    @NotNull(message = "{year.notnull.message}")
    @Pattern(regexp = "^\\d+$", message = "{invalid.year}")
    private String year;

    @Schema(example = "emailId")
    @NotNull(message = "{emailId.notnull.message}")
    @Pattern(regexp = "^[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\\.[a-z]{2,}$", message = "{invalid.emailId}")
    private String emailId;

    @Schema(example = "firstName")
    @Pattern(regexp = "^(?:[A-Z]{2,}(?:\\s[A-Z][a-z]+)*|[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*|[A-Z]+(?:\\s[A-Z]+)*)$", message = "{name.message}")
    private String firstName;

    @Schema(example = "lastName")
    @Pattern(regexp = "^(?:[A-Z]{2,}(?:\\s[A-Z][a-z]+)*|[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*|[A-Z]+(?:\\s[A-Z]+)*)$", message = "{name.message}")
    private String lastName;

    @Schema(example = "totalWorkingDays")
    @NotNull(message = "{totalWorkingDays.notnull.message}")
    @DecimalMax(value = "31", message = "{total.working.days}")
    @Digits(integer = 9, fraction = 0, message = "{total.working.days}")
    private String totalWorkingDays;

    @Schema(example = "noOfWorkingDays")
    @NotNull(message = "{noOfWorkingDays.notnull.message}")
    @DecimalMax(value = "31", message = "{no.of.working.days}")
    @Digits(integer = 9, fraction = 0, message = "{no.of.working.days}")
    private String noOfWorkingDays;

    private String type;



}