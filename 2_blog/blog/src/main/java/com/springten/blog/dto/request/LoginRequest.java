package com.springten.blog.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Must be a valid email address")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    private String password;

    public String getEmail()    { return email; }
    public String getPassword() { return password; }
    public void setEmail(String e)    { this.email = e; }
    public void setPassword(String p) { this.password = p; }
}
