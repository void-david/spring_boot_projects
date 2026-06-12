package com.springten.todolist.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
public class Todo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "title cannot be blank")
    @Size(min = 1, max = 100, message = "title must be 1-100 characters")
    @Column(nullable = false)
    private String title;

    @Size(max = 255, message = "Description cannot be more than 255 characters")
    private String description;

    private boolean completed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.MEDIUM;

    @Column(length = 20)
    private String noteColor = "yellow";

    @Column(updatable = false)
    private String createdAt;

    public Todo() {}

    @PrePersist
    private void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public boolean isCompleted() { return completed; }
    public Priority getPriority() { return priority; }
    public String getNoteColor() { return noteColor; }
    public String getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public void setNoteColor(String noteColor) { this.noteColor = noteColor; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
