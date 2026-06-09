package com.springten.todolist.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.persistence.Column;

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

    public Todo() {}

    public Long getId() { return id; }
    public String getTitle() {return title; }
    public String getDescription() {return description;}
    public boolean isCompleted() { return completed; }

    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) {this.description = description;}
    public void setCompleted(boolean completed) { this.completed = completed; }
}