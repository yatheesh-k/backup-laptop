package com.invoice.exception;

import com.invoice.common.ResponseBuilder;
import com.invoice.common.ResponseErrorObject;
import com.invoice.common.ResponseObject;
import com.invoice.util.Constants;
import feign.FeignException;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.ValidationException;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.http.client.HttpResponseException;
import org.apache.http.conn.HttpHostConnectException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.webjars.NotFoundException;
import javax.ws.rs.WebApplicationException;
import java.net.ConnectException;
import java.util.ArrayList;
import java.util.List;

@ControllerAdvice
public class ExceptionInterceptor extends ResponseEntityExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(ExceptionInterceptor.class);

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        ResponseErrorObject responseErrorObject;
        if (exception.getBindingResult().getAllErrors().size() > 1) {
            List<String> errorMessages = new ArrayList<>();
            exception.getBindingResult().getAllErrors().forEach(error -> errorMessages.add(error.getDefaultMessage()));
            responseErrorObject = ResponseErrorObject.builder().messages(errorMessages).build();
        } else {
            String errorMessage = exception.getBindingResult().getAllErrors().get(0).getDefaultMessage();
            responseErrorObject = ResponseErrorObject.builder().message(errorMessage).build();
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createFailureResponse(responseErrorObject),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpResponseException.class)
    public final ResponseEntity<Object> handleHttpResponseException(
            HttpResponseException exception) {
        logger.error("Trace", exception);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createFailureResponse(exception),
                HttpStatus.valueOf(exception.getStatusCode()));
    }

    @ExceptionHandler(WebApplicationException.class)
    public final ResponseEntity<Object> handleWebApplicationException(
            WebApplicationException exception) {
        logger.debug("Trace", exception);
        String errorMessage = exception.getMessage();
        if (ObjectUtils.isNotEmpty(exception.getResponse())) {
            errorMessage = resolveHttpStatusErrorMessageFrom(exception.getResponse().getStatus());
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createFailureResponse(exception, errorMessage),
                HttpStatus.valueOf(exception.getResponse().getStatus()));
    }

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    public final ResponseEntity<ResponseObject> handleNotFoundException(NotFoundException exception) {
        logger.debug("Trace", exception);
        ResponseErrorObject responseErrorObject = ResponseErrorObject.builder().message(exception.getMessage()).build();
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createFailureResponse(responseErrorObject),
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ConnectException.class)
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public final ResponseEntity<ResponseObject> handleConnectException(ConnectException exception) {
        logger.debug("Trace", exception);
        String errorMessage = Constants.REMOTE_SERVICE_UNAVAILABLE;
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createFailureResponse(exception, errorMessage),
                HttpStatus.SERVICE_UNAVAILABLE);
    }

    @ExceptionHandler(HttpHostConnectException.class)
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public final ResponseEntity<Object> handleHttpHostConnectException(
            HttpHostConnectException exception) {
        logger.debug("Trace", exception);
        String errorMessage = Constants.REMOTE_SERVICE_UNAVAILABLE;
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createFailureResponse(exception, errorMessage),
                HttpStatus.SERVICE_UNAVAILABLE);
    }

    public String resolveHttpStatusErrorMessageFrom(int httpStatus) {
        String errorMessage = "";
        switch (httpStatus) {
            case 400:
                errorMessage = Constants.REQUEST_PAYLOAD_INVALID;
                break;
            case 401:
                errorMessage = Constants.REQUEST_UNAUTHORIZED;
                break;
            case 409:
                errorMessage = Constants.REQUEST_RESOURCE_DUPLICATE;
                break;
            case 404:
                errorMessage = Constants.REQUEST_RESOURCE_NOT_FOUND;
                break;
            case 403:
                errorMessage = Constants.REQUEST_OPERATION_INVALID;
                break;
            case 500:
                errorMessage = Constants.REQUEST_UNABLE_TO_PROCESS;
                break;
            default:
                break;
        }
        return errorMessage;
    }

    @ExceptionHandler(FeignException.class)
    public final ResponseEntity<Object> handleFeignException(
            FeignException exception) {
        logger.debug("Trace", exception);
        String errorMessage = exception.getMessage();
        if (ObjectUtils.isNotEmpty(exception.request())) {
            errorMessage = resolveHttpStatusErrorMessageFrom(exception.status());
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createFailureResponse(exception, errorMessage),
                HttpStatus.valueOf(exception.status()));
    }

    @ExceptionHandler(ValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public final ResponseEntity<ResponseObject> handleValidationException(
            ValidationException exception) {
        logger.debug("Trace", exception);
        ResponseErrorObject responseErrorObject = ResponseErrorObject.builder().message(exception.getMessage()).build();
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createFailureResponse(responseErrorObject),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public final ResponseEntity<ResponseObject> handleConstraintViolationExceptions(
            ConstraintViolationException exception) {
        ResponseErrorObject responseErrorObject;
        if (exception.getConstraintViolations().size() > 1) {
            List<String> errorMessages = new ArrayList<>();
            exception.getConstraintViolations().forEach(violation -> errorMessages.add(violation.getMessage()));
            responseErrorObject = ResponseErrorObject.builder().messages(errorMessages).build();
        } else {
            String errorMessage = exception.getConstraintViolations().iterator().next().getMessage();
            responseErrorObject = ResponseErrorObject.builder().message(errorMessage).build();
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createFailureResponse(responseErrorObject),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ResponseObject> handleGenericExceptions(InvoiceException exception) {
        logger.error("Exception occurred", exception);
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (exception.getHttpStatus() != null) {
            status = exception.getHttpStatus();
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createFailureResponse(
                ResponseErrorObject.builder().message(exception.getMessage()).build()), status);
    }

    @ExceptionHandler(InvoiceException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    ResponseEntity<ResponseObject> handleInvoiceExceptions(InvoiceException exception) {
        logger.error("Exception occurred", exception);
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (exception.getHttpStatus() != null) {
            status = exception.getHttpStatus();
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createFailureResponse(
                ResponseErrorObject.builder().message(exception.getMessage()).build()), status);
    }
}
