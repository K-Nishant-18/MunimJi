package com.munimji.exception;

import org.springframework.http.HttpStatus;

/**
 * Base class for all errors that should be shown to the user as-is.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
