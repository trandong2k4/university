package com.coding.university_management.University.Management.service;

import com.coding.university_management.University.Management.dto.request.AuthenticationRequest;
import com.coding.university_management.University.Management.dto.request.IntrospectRequest;
import com.coding.university_management.University.Management.dto.request.LogoutRequest;
import com.coding.university_management.University.Management.dto.request.RefreshRequest;
import com.coding.university_management.University.Management.dto.response.AuthenticationResponse;
import com.coding.university_management.University.Management.dto.response.IntrospectResponse;
import com.coding.university_management.University.Management.entity.InvalidatedToken;
import com.coding.university_management.University.Management.entity.User;
import com.coding.university_management.University.Management.exception.AppException;
import com.coding.university_management.University.Management.exception.ErrorCode;
import com.coding.university_management.University.Management.repository.InvalidatedTokenRepository;
import com.coding.university_management.University.Management.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {

    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    public IntrospectResponse introspect(IntrospectRequest request)
            throws JOSEException, ParseException
    {
        String token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token);
        } catch (AppException e) {
            isValid = false;
        }

        return IntrospectResponse.builder().isValid(isValid).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest) {
        User user = this.userRepository.findByUsername(authenticationRequest.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        boolean authenticated = passwordEncoder
                .matches(authenticationRequest.getPassword(), user.getPassword());
        if(!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String token = this.generateToken(user);

        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true).build();
    }

    /**
     * Vô hiệu hóa JWT (JSON Web Token) của người dùng khi đăng xuất.
     * <p>
     * Phương thức này hoạt động bằng cách thêm mã định danh duy nhất (JTI - JWT ID) của token
     * vào một danh sách từ chối (denylist/blocklist) phía máy chủ. Điều này đảm bảo rằng token
     * không thể được tái sử dụng để xác thực, ngay cả khi nó chưa hết hạn.
     * <p>
     * Nếu token được cung cấp trong yêu cầu đã hết hạn hoặc không hợp lệ, phương thức sẽ
     * ghi nhận thông tin và bỏ qua vì token đó vốn đã không thể sử dụng được.
     *
     * @param request Đối tượng yêu cầu đăng xuất, phải chứa JWT của người dùng cần được vô hiệu hóa.
     * @throws RuntimeException nếu có lỗi nghiêm trọng xảy ra trong quá trình xử lý token
     */
    public void logout(LogoutRequest request) {
        try {
            var signToken = verifyToken(request.getToken());

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken =
                    InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

            invalidatedTokenRepository.save(invalidatedToken);
        } catch (AppException | ParseException exception) {
            log.info("Token already expired");
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Làm mới JWT cho người dùng.
     * <p>
     * Phương thức này sẽ vô hiệu hóa token hiện tại bằng cách lưu JTI và
     *  thời gian hết hạn vào kho lưu trữ token đã bị vô hiệu hóa,
     * sau đó tạo ra một token mới cho người dùng nếu token cung cấp hợp lệ và chưa hết hạn.
     * </p>
     *
     * @param request Yêu cầu làm mới token, chứa JWT cần làm mới
     * @return {@link AuthenticationResponse} chứa token mới và trạng thái xác thực
     * @throws ParseException nếu không thể phân tích cú pháp token
     * @throws JOSEException nếu có lỗi xác thực hoặc ký token
     */
    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        var signedJWT = verifyToken(request.getToken());

        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken =
                InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

        this.invalidatedTokenRepository.save(invalidatedToken);

        var username = signedJWT.getJWTClaimsSet().getSubject();

        var user =
                userRepository.findByUsername(username).orElseThrow(
                        () -> new AppException(ErrorCode.UNAUTHENTICATED));

        var token = generateToken(user);

        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    private SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        boolean verified = signedJWT.verify(verifier);

        if (!(verified && expirationTime.after(new Date())))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        if (this.invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return  signedJWT;
    }

    /**
     * Tạo 1 jwt với expiration time là 1 tiếng
     * @param user object
     * @return 1 string jwt
     */
    private String generateToken(User user) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("anhnt.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", this.buildScope(user))
                .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        log.info(this.buildScope(user));
        log.info(user.toString());

        JWSObject jwsObject = new JWSObject(jwsHeader, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_" + role.getName());
                if (!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getName()));
            });

        return stringJoiner.toString();
    }

}
