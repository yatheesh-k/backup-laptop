package com.ems.taxConsultant.persistance;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DueDatesEntity extends AbstractEntity{

    private String companyId;
    private String pfDay;
    private String gstDay;
    private String ptDay;
    private String tdsDay;


}
