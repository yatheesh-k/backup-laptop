package com.ems.taxConsultant.persistance;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GSTResponseEntity extends AbstractEntity {

    private String companyId;
    private String month;
    private String year;
    private String mismatchCustomer;
    private String ignoredCustomer;
}
