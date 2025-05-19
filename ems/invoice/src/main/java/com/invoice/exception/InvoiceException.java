package com.invoice.exception;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class InvoiceException extends Exception {

    private static final long serialVersionUID = 1L;
    private String errorCode;
    private HttpStatus httpStatus;

    public InvoiceException(String message, HttpStatus httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public InvoiceException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public InvoiceException(String message, String errorCode, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public InvoiceException(String message, Throwable cause, String errorCode) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public InvoiceException(String message, Throwable cause, String errorCode, HttpStatus httpStatus) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public InvoiceException(String message, Exception cause) {
        super(message, cause);
    }

    public InvoiceException(InvoiceErrorMessageKey errorMessageKey, HttpStatus httpStatus) {
        super(errorMessageKey.getMessage());
        this.errorCode = errorMessageKey.name();
        this.httpStatus = httpStatus;
    }
}
