package com.springten.blog.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    public enum Role { ADMIN, USER }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 100)
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    // --- UserDetails ---
    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    @Override public boolean isAccountNonExpired()    { return true; }
    @Override public boolean isAccountNonLocked()     { return true; }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled()              { return true; }

    // --- Getters / Setters ---
    public Long getId()           { return id; }
    public String getUsername()   { return username; }
    public String getEmail()      { return email; }
    public String getPassword()   { return password; }
    public String getDisplayName(){ return displayName; }
    public String getBio()        { return bio; }
    public String getAvatarUrl()  { return avatarUrl; }
    public Role getRole()         { return role; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id)           { this.id = id; }
    public void setUsername(String u)    { this.username = u; }
    public void setEmail(String e)       { this.email = e; }
    public void setPassword(String p)    { this.password = p; }
    public void setDisplayName(String d) { this.displayName = d; }
    public void setBio(String b)         { this.bio = b; }
    public void setAvatarUrl(String a)   { this.avatarUrl = a; }
    public void setRole(Role r)          { this.role = r; }
}
