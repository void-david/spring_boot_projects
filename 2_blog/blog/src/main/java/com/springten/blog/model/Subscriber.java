package com.springten.blog.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscribers")
public class Subscriber {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(updatable = false)
    private LocalDateTime subscribedAt;

    @PrePersist protected void onCreate() { subscribedAt = LocalDateTime.now(); }

    public Subscriber() {}

    public Long getId()                   { return id; }
    public String getEmail()              { return email; }
    public LocalDateTime getSubscribedAt(){ return subscribedAt; }
    public void setEmail(String e)        { this.email = e; }
}
