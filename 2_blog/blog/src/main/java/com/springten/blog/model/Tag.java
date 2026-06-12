package com.springten.blog.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

@Entity
@Table(name = "tags")
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tag name cannot be blank")
    @Size(max = 30, message = "Tag name cannot exceed 30 characters")
    @Column(unique = true, nullable = false)
    private String name;

    @Column(length = 7)
    private String color;

    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    private List<Post> posts;

    public Tag() {}

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getColor() { return color; }
    public List<Post> getPosts() { return posts; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setColor(String color) { this.color = color; }
    public void setPosts(List<Post> posts) { this.posts = posts; }
}
