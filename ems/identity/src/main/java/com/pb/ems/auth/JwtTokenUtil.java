package com.pb.ems.auth;

import com.pb.ems.config.JwtConfig;
import com.pb.ems.exception.ErrorMessageHandler;
import com.pb.ems.exception.IdentityErrorMessageKey;
import com.pb.ems.exception.IdentityException;
import com.pb.ems.util.Constants;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@Slf4j
public class JwtTokenUtil {
   // Hex Key:	22ba0f64f69a9f1f10bbbc7d5949486aa0199f44c6d071201d7df7b5c5bae5da
    //Plain text key:	LAC RITE SELL TOLD LAMB GREG ED SKIN JAG LORD HATE PUB JACK RAVE RODE GOAL BET GREW IKE TRIM TONE GILL LIEN TONE
   // Reverse:	22ba0f64f69a9f1f10bbbc7d5949486aa0199f44c6d071201d7df7b5c5bae5da
    private static final String SECRET_KEY = "22ba0f64f69a9f1f10bbbc7d5949486aa0199f44c6d071201d7df7b5c5bae5da"; // Or load from a secure place
    private static final Key key = JwtConfig.key;

    @Value("${jwt.secret}")
    private static String secret;

    @Value("${jwt.expiration}")
    private static Long expiration;

    public static String generateToken(String username, List<String> roles) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .claim(Constants.ROLES, roles)
                .claim(Constants.EMPLOYEE, username)
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();

    }
    public static String generateEmployeeToken(String username, List<String> roles,String company,String employee) {
        String token= Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .claim(Constants.ROLES, roles)
                .claim(Constants.COMPANY, company)
                .claim(Constants.EMPLOYEE, employee)
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
        return  token;
    }
    public static Claims decodeToken(String token) {
        return Jwts.parser()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }


    public static Claims validateToken(String token) throws IdentityException{
        try {
             return Jwts.parser()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            log.error("Invalid JWT token");
            throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_TOKEN),
                    HttpStatus.UNAUTHORIZED);
        }
    }
}
