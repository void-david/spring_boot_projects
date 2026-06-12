package com.springten.blog.dto.response;

import com.springten.blog.model.PostStatus;
import java.time.LocalDateTime;
import java.util.List;

public class PostResponse {
    private Long id;
    private String slug;
    private String title;
    private String content;
    private String excerpt;
    private String coverImageUrl;
    private CategoryResponse category;
    private List<TagResponse> tags;
    private List<CommentResponse> comments;
    private PostStatus status;
    private int viewCount;
    private int likeCount;
    private boolean featured;
    private int readingTimeMinutes;
    private UserResponse author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PostResponse(Long id, String slug, String title, String content, String excerpt,
                        String coverImageUrl, CategoryResponse category, List<TagResponse> tags,
                        List<CommentResponse> comments, PostStatus status,
                        int viewCount, int likeCount, boolean featured,
                        int readingTimeMinutes, UserResponse author,
                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id; this.slug = slug; this.title = title; this.content = content;
        this.excerpt = excerpt; this.coverImageUrl = coverImageUrl; this.category = category;
        this.tags = tags; this.comments = comments; this.status = status;
        this.viewCount = viewCount; this.likeCount = likeCount; this.featured = featured;
        this.readingTimeMinutes = readingTimeMinutes; this.author = author;
        this.createdAt = createdAt; this.updatedAt = updatedAt;
    }

    public Long getId()             { return id; }
    public String getSlug()         { return slug; }
    public String getTitle()        { return title; }
    public String getContent()      { return content; }
    public String getExcerpt()      { return excerpt; }
    public String getCoverImageUrl(){ return coverImageUrl; }
    public CategoryResponse getCategory()   { return category; }
    public List<TagResponse> getTags()      { return tags; }
    public List<CommentResponse> getComments() { return comments; }
    public PostStatus getStatus()   { return status; }
    public int getViewCount()       { return viewCount; }
    public int getLikeCount()       { return likeCount; }
    public boolean isFeatured()     { return featured; }
    public int getReadingTimeMinutes() { return readingTimeMinutes; }
    public UserResponse getAuthor() { return author; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public LocalDateTime getUpdatedAt()  { return updatedAt; }
}
