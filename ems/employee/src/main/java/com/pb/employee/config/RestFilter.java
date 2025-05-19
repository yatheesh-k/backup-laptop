package com.pb.employee.config;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseErrorObject;
import com.pb.employee.common.ResponseObject;
import com.pb.employee.request.ValidateLoginRequest;
import com.pb.employee.util.Constants;
import feign.FeignException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.Key;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
public class RestFilter implements Filter {
    private static final Logger logger = LoggerFactory.getLogger(RestFilter.class);

    // Use the same key generated in JwtTokenUtil for signing/validation (HS256)
    private static final Key key = JwtConfig.key;
    private static final List<String> REQUIRED_ROLES = Arrays.asList(Constants.COMPANY_ADMIN, Constants.EMPLOYEE, Constants.EMS_ADMIN, Constants.ACCOUNTANT,Constants.HR,Constants.ASSOCIATE);

    private static Set<String> SWAGGER_URLS_TO_BYPASS_AUTH = Set.of(
            "/ems/api-docs",
            "/ems/swagger-ui/index.html",
            "/ems/api-docs/swagger-config");

    private static Set<String> EXCLUDE_API_LIST = Set.of(
            "/ems/health",
            "/ems/health/livez",
            "/ems/health/readyz",
            "/emsadmin/login",
            "/token/validate",
            "/company/login",
            "/validate",
            "/forgot/password",
            "/ems/swagger-ui/index.html",
            "/ems/api-docs/swagger-config");

    private Jws<Claims> parsedToken = null;

    @Autowired
    IRestIdentity iRestIdentity;

    @Autowired
    private Environment environment;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        String token = req.getHeader(Constants.AUTH_KEY);
        String uri = req.getRequestURI();

        // Check if the URI starts with "/ems/ui/public/assets/img/"
        if (uri.startsWith("/ems/var/www/ems/assets/img/") || uri.startsWith("/ems/var/www/ems-testing/assets/img/")|| uri.startsWith("/ems/var/www/ems-prod/assets/img/")) {
            logger.debug("Ignoring authentication check for image file: {}", uri);
            chain.doFilter(request, response); // Proceed without authentication check
            return;
        }

        // Check if the URI is in the exclude list or Swagger URLs
        if (EXCLUDE_API_LIST.contains(uri) || isInSwaggerUiWhiteList(uri)) {
            logger.debug("Token validation is not required for url {}", req.getRequestURI());
        } else {
            if (StringUtils.isNotBlank(token)) {
                if (!StringUtils.containsIgnoreCase(token, "Bearer ")) {
                    logger.debug("Bearer prefix is missing");
                    buildResponseObject(req, res, "Token is not valid.", "Unauthorized Access", HttpStatus.UNAUTHORIZED);
                    return;
                }

                token = StringUtils.removeStartIgnoreCase(token, "Bearer ");

                // Parse the token and validate using the same key used for signing
                try {
                    // Corrected parsing using parserBuilder
                    parsedToken = Jwts.parserBuilder()
                            .setSigningKey(key) // Use the same key for validation
                            .build()
                            .parseClaimsJws(token); // Parse the JWT token

                    // Now you can access the claims from parsedToken.getBody()
                    Claims claims = parsedToken.getBody();

                    // Check for roles in the parsed token
                    if (hasNoRoles()) {
                        logger.debug("No role assigned to the User.");
                        buildResponseObject(req, res, "No roles assigned to the User.", "Unauthorized Access", HttpStatus.UNAUTHORIZED);
                        return;
                    }

                } catch (Exception e) {
                    logger.debug("Invalid JWT signature or token parsing failed.");
                    buildResponseObject(req, res, "Token is not valid.", "Unauthorized Access", HttpStatus.UNAUTHORIZED);
                    return;
                }

                try {
                    ValidateLoginRequest validateLoginRequest = ValidateLoginRequest.builder().token(token).build();
                    ResponseEntity<Object> result = iRestIdentity.validateToken(validateLoginRequest);
                    if (result != null && result.getBody() != null) {
                        logger.info(result.getBody().toString());
                    }
                } catch (FeignException.FeignClientException feignClientException) {
                    if (HttpStatus.UNAUTHORIZED.value() == feignClientException.status()) {
                        logger.debug("Token is not valid");
                        buildResponseObject(req, res, "Token is not valid.", "Unauthorized Access", HttpStatus.UNAUTHORIZED);
                        return;
                    }
                } catch (Exception e) {
                    logger.error("Exception ", e);
                    throw e;
                }
            } else {
                logger.debug("Token is not valid");
                buildResponseObject(req, res, "Token is not valid.", "Unauthorized Access", HttpStatus.UNAUTHORIZED);
                return;
            }

            // If the user doesn't have the required roles, deny access
            if (!hasRequiredRoles()) {
                logger.debug("User does not have the required roles.");
                buildResponseObject(req, res, "User does not have the required roles.", "Forbidden Access", HttpStatus.FORBIDDEN);
                return;
            }
        }

        String requestId = UUID.randomUUID().toString();
        MDC.put("requestId", requestId);

        chain.doFilter(request, response);

        MDC.clear();
    }

    private void buildResponseObject(HttpServletRequest req, HttpServletResponse res, String errorMessage, String msg, HttpStatus status) throws IOException {
        res.setStatus(status.value());
        ResponseObject responseObject = new ResponseObject();
        ResponseErrorObject errorResponse = new ResponseErrorObject();
        errorResponse.setMessage(errorMessage);
        responseObject.setError(errorResponse);
        responseObject.setMessage(msg);
        responseObject.setPath(req.getRequestURI());
        String strErrorResponse = new ObjectMapper().writeValueAsString(responseObject);
        res.getOutputStream().write(strErrorResponse.getBytes());
    }

    private boolean hasNoRoles() {
        // Check if the 'roles' field is null or empty in the parsed token
        if (parsedToken != null && parsedToken.getBody().get("roles") != null) {
            Object roles = parsedToken.getBody().get("roles");
            return !(roles instanceof List) || ((List<?>) roles).isEmpty();
        }
        return true;
    }

    private boolean hasRequiredRoles() {
        // Check if the user has either "company_admin" or "employee" role
        if (parsedToken != null && parsedToken.getBody().get("roles") != null) {
            Object roles = parsedToken.getBody().get("roles");
            if (roles instanceof List) {
                List<?> rolesList = (List<?>) roles;
                return rolesList.stream().anyMatch(REQUIRED_ROLES::contains);
            }
        }
        return false;
    }

    private boolean isInSwaggerUiWhiteList(String uri) {
        if (StringUtils.isNotBlank(uri)) {
            String prefix_swagger_ui_resources = "/ems/swagger-ui/";
            return SWAGGER_URLS_TO_BYPASS_AUTH.contains(uri) || uri.startsWith(prefix_swagger_ui_resources);
        }
        return false;
    }
}



