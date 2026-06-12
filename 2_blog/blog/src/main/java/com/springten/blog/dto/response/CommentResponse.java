package com.springten.blog.dto.response;

import java.time.LocalDateTime;;

public class CommentResponse {
    private Long id;
    private String author;
    private String content;
    private LocalDateTime createdAt;

    public CommentResponse(Long id, String author, String content, LocalDateTime createdAt){
        this.id = id;
        this.author = author;
        this.content = content;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getAuthor() { return author; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
