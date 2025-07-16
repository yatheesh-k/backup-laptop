package com.ems.accountant.persistance;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PortalsCredEntity extends AbstractEntity{

    private String companyId;
    private List<PFPortalCredentials> pfCredentials;
    private List<PTPortalCredentials> ptCredentials;
    private List<GSTPortalCredentials> gstCredentials;
    private List<TDSPortalCredentials> tdsCredentials;


}
