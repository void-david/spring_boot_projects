package com.springten.blog.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;


@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Content cannot be blank")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(unique = true, length = 300)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status = PostStatus.PUBLISHED;

    @Column(nullable = false)
    private int viewCount = 0;

    @Column(nullable = false)
    private int likeCount = 0;

    @Column(nullable = false)
    private boolean featured = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "post_tags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<Tag> tags;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comment> comments;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Post() {}

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public String getSlug() { return slug; }
    public String getExcerpt() { return excerpt; }
    public String getCoverImageUrl() { return coverImageUrl; }
    public PostStatus getStatus() { return status; }
    public int getViewCount() { return viewCount; }
    public int getLikeCount() { return likeCount; }
    public boolean isFeatured() { return featured; }
    public User getAuthor() { return author; }
    public Category getCategory() { return category; }
    public List<Tag> getTags() { return tags; }
    public List<Comment> getComments() { return comments; }

    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setContent(String content) { this.content = content; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public void setSlug(String slug) { this.slug = slug; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
    public void setStatus(PostStatus status) { this.status = status; }
    public void setViewCount(int viewCount) { this.viewCount = viewCount; }
    public void setLikeCount(int likeCount) { this.likeCount = likeCount; }
    public void setFeatured(boolean featured) { this.featured = featured; }
    public void setAuthor(User author) { this.author = author; }
    public void setCategory(Category category) { this.category = category; }
    public void setTags(List<Tag> tags) { this.tags = tags; }
    public void setComments(List<Comment> comments) { this.comments = comments; }
}
