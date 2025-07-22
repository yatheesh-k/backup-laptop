package com.ems.taxConsultant.request;


import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateLoginRequest {

    private String userName;
    private String token;
}