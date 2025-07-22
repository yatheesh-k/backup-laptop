package com.ems.taxConsultant.persistance;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
public class CredentialsPayload {

    @Schema(example = "credentialsName")
    @Pattern(regexp = "^(?!\\s)(?=.*[A-Za-z])[A-Za-z0-9.,:;'#&*()^/\\s-]*[^\\s]$", message = "{credentialsName.pattern.message}")
    @Size(max = 100, min = 2, message = "{credentialsName.size.message}")
    private String credentialsName;

    @Schema(example = "username")
    @Pattern(regexp = "^(?!\\s)(?=.*[A-Za-z])[A-Za-z0-9.,:;'#&*()^/\\s-]*[^\\s]$", message = "{pt.userName.pattern.message}")
    @Size(max = 100, min = 2, message = "{userName.size.message}")
    private String userName;

    @Schema(example = "password")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[_\\W])(?!.* ).{6,16}$"
            , message = "{Password.format}")
    private String password;

    @Schema(example = "https://example.com")
    private String portalUrl;
}
