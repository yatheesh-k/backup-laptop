package com.ems.taxConsultant.persistance;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PTReceiptEntity extends AbstractEntity{

    private String companyId;
    private String month;
    private String year;
    private String ptTotalAmount;
    private String ptReceiptNumber;
    private String ptReceiptDate;
    private String ptReceiptFileName;

}
