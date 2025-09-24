package com.coding.university_management.University.Management.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final String[] PUBLIC_ENDPOINTS = {
            "/auth/log-in", "/auth/introspect", "/users",
            "/auth/logout", "/auth/refresh"
    };

    private CustomJwtDecoder customJwtDecoder;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(
                request -> request.requestMatchers(HttpMethod.POST, this.PUBLIC_ENDPOINTS).permitAll()
                        // authorities chính là các scope hoặc roles được trích xuất
                        // từ JWT sau khi decode - tùy vào claims khi generateToken
                        .requestMatchers(HttpMethod.GET, "/api/users")
                        .hasAuthority("ROLE_ADMIN")
                        // Chỉ cho phép người dùng có quyền ROLE_ADMIN gọi các API thay đổi NganhHoc
                        .requestMatchers(HttpMethod.POST, "/api/nganh-hoc")
                        .hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/nganh-hoc")
                        .hasAuthority("ROLE_ADMIN")
                        .anyRequest().authenticated());

        // config mọi request tới phải mang Bearer token hợp lệ ở Headers.Authorization
        httpSecurity.oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwtConfigurer ->
                                jwtConfigurer.decoder(this.customJwtDecoder)
                        // Spring dùng jwtAuthenticationConverter() để:
                        // --> Trích xuất scope, roles từ token
                        // --> Gán thành GrantedAuthority
                        .jwtAuthenticationConverter(this.jwtAuthenticationConverter()))
                        // Xử lý lỗi khi xác thực thất bại (vd: không có token, token sai).
                        // Trả về lỗi 401 Unauthorized dạng JSON thay vì trang đăng nhập mặc định.
                        .authenticationEntryPoint(new JwtAuthenticationEntryPoint()));

        httpSecurity.csrf(httpSecurityCsrfConfigurer -> httpSecurityCsrfConfigurer.disable());

        return httpSecurity.build();
    }

    // VD: Nếu JWT có "scope": "ADMIN USER" --> [ "ROLE_ADMIN", "ROLE_USER" ]
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }

//    private JwtDecoder jwtDecoder() {
//        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
//
//        return NimbusJwtDecoder.withSecretKey(secretKeySpec)
//                .macAlgorithm(MacAlgorithm.HS512)
//                .build();
//    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        return passwordEncoder;
    }


}
