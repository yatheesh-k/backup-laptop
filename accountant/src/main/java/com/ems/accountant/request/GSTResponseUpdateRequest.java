package com.ems.accountant.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GSTResponseUpdateRequest {


    private String mismatchCustomer;
    private String ignoredCustomer;
}
