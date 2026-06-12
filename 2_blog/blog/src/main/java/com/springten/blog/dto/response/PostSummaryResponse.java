package com.springten.blog.dto.response;

import java.time.LocalDateTime;

public class PostSummaryResponse {
    private Long id;
    private String title;
    private CategoryResponse category;
    private LocalDateTime createdAt;

    public PostSummaryResponse(Long id, String title, CategoryResponse category, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public CategoryResponse getCategory() { return category; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    
}
