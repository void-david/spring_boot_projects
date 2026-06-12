package com.springten.blog.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private CategoryResponse category;
    private List<CommentResponse> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    public PostResponse(Long id, String title, String content,
                        CategoryResponse category, List<CommentResponse> comments,
                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.category = category;
        this.comments = comments;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public CategoryResponse getCategory() { return category; }
    public List<CommentResponse> getComments() { return comments; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    
}
