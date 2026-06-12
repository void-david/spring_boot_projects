package com.springten.blog.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class PostRequest {

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 200, message = "Title cannot be > 200 chars")
    private String title;

    @NotBlank(message = "Content cannot be blank")
    private String content;

    private Long categoryId;
    private List<Long> tagIds;

    public String getTitle() {return title;}
    public String getContent() {return content;}
    public Long getCategoryId() {return categoryId;}
    public List<Long> getTagIds() {return tagIds;}

    public void setTitle(String title) {this.title = title;}
    public void setContent(String content) {this.content = content;}
    public void setCategoryId(Long categoryId) {this.categoryId = categoryId;}
    public void setTagIds(List<Long> tagIds) {this.tagIds = tagIds;}

}
