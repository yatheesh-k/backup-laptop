package com.pb.ems.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

/**
 * @author ghanshyam.sharma
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LogoutDTO {
    @NotEmpty(message = "{login.token.not.found}")
    @Schema(required = true,  description = "${logout.refreshToken.description}", example = "abcdef12-1234-1234-1234-abcdefabcdef")
    @JsonProperty("refreshToken")
    private String refreshToken;
}
