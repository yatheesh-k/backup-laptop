package com.pb.employee.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Slf4j
public class JwtTokenUtil {
   // Hex Key:	22ba0f64f69a9f1f10bbbc7d5949486aa0199f44c6d071201d7df7b5c5bae5da
    //Plain text key:	LAC RITE SELL TOLD LAMB GREG ED SKIN JAG LORD HATE PUB JACK RAVE RODE GOAL BET GREW IKE TRIM TONE GILL LIEN TONE
   // Reverse:	22ba0f64f69a9f1f10bbbc7d5949486aa0199f44c6d071201d7df7b5c5bae5da
   private static final String SECRET_KEY = "22ba0f64f69a9f1f10bbbc7d5949486aa0199f44c6d071201d7df7b5c5bae5da"; // Or load from a secure place
    private static final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    public static Claims validateToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            log.error("Invalid JWT token");
            return null;
        }
    }

   /* public static Claims validateToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            System.out.println("Invalid JWT token");
            return null;
        }
    }*/
}
