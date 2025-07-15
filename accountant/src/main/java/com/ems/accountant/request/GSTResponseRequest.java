package com.ems.accountant.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GSTResponseRequest {

    private String month;
    private String year;
    private String mismatchCustomer;
    private String ignoredCustomer;
}
