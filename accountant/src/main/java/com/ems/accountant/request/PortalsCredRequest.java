package com.ems.accountant.request;

import com.ems.accountant.persistance.GSTPortalCredentials;
import com.ems.accountant.persistance.PFPortalCredentials;
import com.ems.accountant.persistance.PTPortalCredentials;
import com.ems.accountant.persistance.TDSPortalCredentials;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import lombok.*;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PortalsCredRequest {


    private List<@Valid PFPortalCredentials> pfCredentials;
    private List<@Valid PTPortalCredentials> ptCredentials;
    private List<@Valid GSTPortalCredentials> gstCredentials;
    private List<@Valid TDSPortalCredentials> tdsCredentials;
}
