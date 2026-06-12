package com.springten.blog.dto.response;

import com.springten.blog.model.User;
import java.time.LocalDateTime;

public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String bio;
    private String avatarUrl;
    private String role;
    private LocalDateTime createdAt;

    public UserResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.displayName = user.getDisplayName() != null ? user.getDisplayName() : user.getUsername();
        this.bio = user.getBio();
        this.avatarUrl = user.getAvatarUrl();
        this.role = user.getRole().name();
        this.createdAt = user.getCreatedAt();
    }

    public Long getId()                   { return id; }
    public String getUsername()           { return username; }
    public String getEmail()              { return email; }
    public String getDisplayName()        { return displayName; }
    public String getBio()                { return bio; }
    public String getAvatarUrl()          { return avatarUrl; }
    public String getRole()               { return role; }
    public LocalDateTime getCreatedAt()   { return createdAt; }
}
