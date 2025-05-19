package com.pb.ems.model;


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
