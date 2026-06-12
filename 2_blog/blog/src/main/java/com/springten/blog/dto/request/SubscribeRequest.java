package com.springten.blog.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class SubscribeRequest {
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Must be a valid email address")
    private String email;

    public String getEmail()       { return email; }
    public void setEmail(String e) { this.email = e; }
}
