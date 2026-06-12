package com.springten.blog.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TagRequest {
    @NotBlank(message = "Tag name cannot be blank")
    @Size(max = 30, message = "Tag name cannot exceed 30 characters")
    private String name;

    @Size(max = 7)
    private String color;

    public String getName()  { return name; }
    public String getColor() { return color; }
    public void setName(String n)  { this.name = n; }
    public void setColor(String c) { this.color = c; }
}
