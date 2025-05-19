package com.pb.ems.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@JsonIgnoreProperties(ignoreUnknown = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    @Schema(required = true,  description = "${administration.token.description}", example = "abcdef12-1234-1234-1234-abcdefabcdef")
    private String token;
    @Schema(required = true,  description = "${administration.refreshToken.description}", example = "abcdef12-1234-1234-1234-abcdefabcdef")
    private String refreshToken;

}