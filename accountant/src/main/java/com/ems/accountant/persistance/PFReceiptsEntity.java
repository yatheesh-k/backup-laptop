package com.ems.accountant.persistance;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PFReceiptsEntity extends AbstractEntity{

    private String companyId;
    private String month;
    private String year;
    private String pfTotalAmount;
    private String pfReceiptNumber;
    private String pfReceiptDate;
    private String pfReceiptFileName;
}
