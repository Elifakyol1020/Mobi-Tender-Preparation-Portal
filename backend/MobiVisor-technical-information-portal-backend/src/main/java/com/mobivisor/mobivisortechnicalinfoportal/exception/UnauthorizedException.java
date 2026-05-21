package com.mobivisor.mobivisortechnicalinfoportal.exception;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String message, String cause) {
        super(message + " | Neden: " + cause);
    }
}
