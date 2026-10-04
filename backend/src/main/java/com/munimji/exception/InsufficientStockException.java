package com.munimji.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when the cart asks for more stock than is available.
 * The whole invoice transaction is rolled back when this happens.
 */
public class InsufficientStockException extends ApiException {

    public InsufficientStockException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
