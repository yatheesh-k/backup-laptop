package com.ems.accountant.persistance;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TDSPortalCredentials {

    @Schema(example = "username")
    @Pattern(regexp = "^(?!\\s)(?=.*[A-Za-z])[A-Za-z0-9.,:;'#&*()^/\\s-]*[^\\s]$", message = "{tds.userName.pattern.message}")
    @Size(max = 100, min = 2, message = "{tds.userName.size.message}")
    private String userName;

    @Schema(example = "password")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[_\\W])(?!.* ).{6,16}$"
            , message = "{tds.Password.format}")
    private String password;

    @Schema(example = "https://example.com")
    private String portalUrl;

}
