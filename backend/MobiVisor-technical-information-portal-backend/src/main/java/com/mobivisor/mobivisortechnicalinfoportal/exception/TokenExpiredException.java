package com.mobivisor.mobivisortechnicalinfoportal.exception;

public class TokenExpiredException extends RuntimeException {
    public TokenExpiredException(String message) {
        super(message);
    }

    public TokenExpiredException(String message, String cause) {
        super(message + " | Neden: " + cause);
    }
}
