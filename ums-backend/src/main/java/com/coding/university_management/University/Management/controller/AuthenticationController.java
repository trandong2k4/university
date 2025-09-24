package com.coding.university_management.University.Management.controller;

import com.coding.university_management.University.Management.dto.request.AuthenticationRequest;
import com.coding.university_management.University.Management.dto.request.IntrospectRequest;
import com.coding.university_management.University.Management.dto.request.LogoutRequest;
import com.coding.university_management.University.Management.dto.request.RefreshRequest;
import com.coding.university_management.University.Management.dto.response.ApiResponse;
import com.coding.university_management.University.Management.dto.response.AuthenticationResponse;
import com.coding.university_management.University.Management.dto.response.IntrospectResponse;
import com.coding.university_management.University.Management.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;

    @PostMapping("/log-in")
    ResponseEntity<ApiResponse<AuthenticationResponse>> authenticate
            (@RequestBody AuthenticationRequest request)
    {
        AuthenticationResponse authenticationResponse =
                this.authenticationService.authenticate(request);
        ApiResponse<AuthenticationResponse> response = new ApiResponse<>(
                HttpStatus.OK.value(), "Đăng nhập thành công", authenticationResponse
        );

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/introspect")
    ResponseEntity<ApiResponse<IntrospectResponse>> authenticate
            (@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        IntrospectResponse authenticationResponse =
                this.authenticationService.introspect(request);
        ApiResponse<IntrospectResponse> response = new ApiResponse<>(
                HttpStatus.OK.value(), "Kiểm tra token hợp lệ thành công", authenticationResponse
        );

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/refresh")
    ResponseEntity<ApiResponse<AuthenticationResponse>> authenticate
            (@RequestBody RefreshRequest request) throws ParseException, JOSEException {
        AuthenticationResponse result = authenticationService.refreshToken(request);
        ApiResponse<AuthenticationResponse> response = new ApiResponse<>(
                HttpStatus.OK.value(), "Refresh token thành công", result
        );

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/logout")
    ResponseEntity<ApiResponse<Void>> logout
            (@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        this.authenticationService.logout(request);
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(), "Logout thành công"
        );

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

}
