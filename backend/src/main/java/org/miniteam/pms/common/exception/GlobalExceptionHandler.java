package org.miniteam.pms.common.exception;

import jakarta.validation.ConstraintViolationException;
import org.miniteam.pms.common.result.Result;
import org.miniteam.pms.common.result.ResultCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/** 全局异常处理：HTTP 状态码与响应体 code 一致。 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Result<Void>> handleBusiness(BusinessException e) {
        return build(e.getResultCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Result<Void>> handleInvalid(MethodArgumentNotValidException e) {
        FieldError error = e.getBindingResult().getFieldError();
        String message = error != null
                ? error.getField() + " " + error.getDefaultMessage()
                : ResultCode.BAD_REQUEST.getMessage();
        return build(ResultCode.BAD_REQUEST, message);
    }

    @ExceptionHandler({
        ConstraintViolationException.class,
        HttpMessageNotReadableException.class,
        MissingServletRequestParameterException.class,
        MethodArgumentTypeMismatchException.class,
        HttpRequestMethodNotSupportedException.class
    })
    public ResponseEntity<Result<Void>> handleBadRequest(Exception e) {
        return build(ResultCode.BAD_REQUEST, ResultCode.BAD_REQUEST.getMessage());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Result<Void>> handleNotFound(NoResourceFoundException e) {
        return build(ResultCode.NOT_FOUND, ResultCode.NOT_FOUND.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<Void>> handleOther(Exception e) {
        log.error("未处理的异常", e);
        return build(ResultCode.SERVER_ERROR, ResultCode.SERVER_ERROR.getMessage());
    }

    private ResponseEntity<Result<Void>> build(ResultCode resultCode, String message) {
        return ResponseEntity.status(resultCode.getCode()).body(Result.fail(resultCode, message));
    }
}
