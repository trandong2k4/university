package com.coding.university_management.University.Management.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    USER_EXISTED(409, "Tài khoản đã tồn tại", HttpStatus.CONFLICT),
    USER_NOT_EXISTED(404, "Tài khoản không tồn tại", HttpStatus.NOT_FOUND),
    UNCATEGORIZED_EXCEPTION(500, "Lỗi không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    VALIDATION_EXCEPTION(400, "Lỗi dữ liệu đầu vào", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(401, "Lỗi xác thực thông tin truy cập", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(401, "Bạn không có quyền truy cập", HttpStatus.UNAUTHORIZED),
    INVALID_DOB(400, "Ngày sinh không hợp lệ", HttpStatus.BAD_REQUEST),
    // Thêm các giá trị này vào trong enum ErrorCode của bạn
    NGANH_HOC_EXISTED(1010, "Ngành học đã tồn tại", HttpStatus.BAD_REQUEST),
    NGANH_HOC_NOT_FOUND(1011, "Không tìm thấy ngành học", HttpStatus.NOT_FOUND),
    ;

    ErrorCode(int code, String message, HttpStatus statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private int code;
    private String message;
    private HttpStatus statusCode;

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public HttpStatus getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(HttpStatus statusCode) {
        this.statusCode = statusCode;
    }
}
