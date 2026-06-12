package com.springten.blog.dto.request;

import com.springten.blog.model.PostStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class PostRequest {

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 200, message = "Title cannot be > 200 chars")
    private String title;

    @NotBlank(message = "Content cannot be blank")
    private String content;

    @Size(max = 500, message = "Excerpt cannot exceed 500 characters")
    private String excerpt;

    private String coverImageUrl;

    private Long categoryId;
    private List<Long> tagIds;
    private PostStatus status = PostStatus.PUBLISHED;
    private boolean featured = false;

    public String getTitle()        { return title; }
    public String getContent()      { return content; }
    public String getExcerpt()      { return excerpt; }
    public String getCoverImageUrl(){ return coverImageUrl; }
    public Long getCategoryId()     { return categoryId; }
    public List<Long> getTagIds()   { return tagIds; }
    public PostStatus getStatus()   { return status; }
    public boolean isFeatured()     { return featured; }

    public void setTitle(String t)         { this.title = t; }
    public void setContent(String c)       { this.content = c; }
    public void setExcerpt(String e)       { this.excerpt = e; }
    public void setCoverImageUrl(String u) { this.coverImageUrl = u; }
    public void setCategoryId(Long id)     { this.categoryId = id; }
    public void setTagIds(List<Long> ids)  { this.tagIds = ids; }
    public void setStatus(PostStatus s)    { this.status = s; }
    public void setFeatured(boolean f)     { this.featured = f; }
}
