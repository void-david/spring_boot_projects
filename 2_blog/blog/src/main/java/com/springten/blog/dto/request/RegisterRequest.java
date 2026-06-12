package com.springten.blog.dto.request;

import jakarta.validation.constraints.*;

public class RegisterRequest {
    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 50, message = "Username must be 3-50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscores")
    private String username;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Must be a valid email address")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Size(max = 100)
    private String displayName;

    public String getUsername()    { return username; }
    public String getEmail()       { return email; }
    public String getPassword()    { return password; }
    public String getDisplayName() { return displayName; }
    public void setUsername(String u)    { this.username = u; }
    public void setEmail(String e)       { this.email = e; }
    public void setPassword(String p)    { this.password = p; }
    public void setDisplayName(String d) { this.displayName = d; }
}
