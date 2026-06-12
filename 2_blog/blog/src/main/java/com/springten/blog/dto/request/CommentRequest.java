package com.springten.blog.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CommentRequest {
    @NotBlank(message = "Author cannot be blank")
    @Size(max = 100, message = "Author name cannot exceed 100 characters")
    private String author;

    @NotBlank(message = "Content cannot be blank")
    @Size(max = 1000, message = "Comment cannot exceed 1000 characters")
    private String content;

    public String getAuthor() { return author; }
    public String getContent() { return content; }

    public void setAuthor(String author) { this.author = author; }
    public void setContent(String content) { this.content = content; }
    
}
