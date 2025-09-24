package com.coding.university_management.University.Management.dto.request;

import com.coding.university_management.University.Management.validator.DobConstraint;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {

    @Size(min = 2, max = 20, message = "Tên tài khoản chỉ được chứa từ 2 đến 20 ký tự")
    private String username;

    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    private String password;
    private String firstName;
    private String lastName;

    @DobConstraint(min = 18, message = "Bạn phải ít nhất từ 18 tuổi trở lên")
    private LocalDate dob;

    List<String> roles;

}
