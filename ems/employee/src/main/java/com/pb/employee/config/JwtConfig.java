package com.pb.employee.config;

import io.jsonwebtoken.security.Keys;
import java.security.Key;

public class JwtConfig {

    // Secret key definition (ensure this is the same for both classes)
    private static final String SECRET_KEY = "22ba0f64f69a9f1f10bbbc7d5949486aa0199f44c6d071201d7df7b5c5bae5da";  // Secret key

    // Static Key generation for HS256
    public static final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
}

