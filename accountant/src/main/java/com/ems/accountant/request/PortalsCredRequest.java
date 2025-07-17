package com.ems.accountant.request;

import com.ems.accountant.persistance.CredentialsPayload;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PortalsCredRequest {

    private List<@Valid CredentialsPayload> credPayload ;

}
