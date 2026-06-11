package com.springten.blog.controller;

import com.springten.blog.model.Post;
import com.springten.blog.service.PostService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;

    public PostController( PostService postService ){
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<Page<Post>> getAllPosts(
        @RequestParam(defaultValue = "0") int page, 
        @RequestParam(defaultValue = "10") int size){
        
        return ResponseEntity.ok(postService.getAllPosts(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id){
        return postService.getPostById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<Post>> getPostsByCategory(
        @PathVariable Long categoryId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size){
        
        return ResponseEntity.ok(postService.getPostsByCategory(categoryId, page, size));
    }

    @GetMapping("/tag/{tagId}")
    public ResponseEntity<Page<Post>> getPostsbyTag(
        @PathVariable Long tagId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size){

        return ResponseEntity.ok(postService.getPostsByTag(tagId, page, size));
    }

    @PostMapping
    public ResponseEntity<Post> createPost(
        @RequestParam Long categoryId,
        @RequestParam(required = false) List<Long> tagIds,
        @Valid @RequestBody Post post){

        return postService.createPost(categoryId, tagIds, post)
                .map(p -> ResponseEntity.status(HttpStatus.CREATED).body(p))
                .orElse(ResponseEntity.notFound().build());
        
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(
        @PathVariable Long id, 
        @RequestParam Long categoryId,
        @RequestParam(required = false, defaultValue = "[]") List<Long> tagIds,
        @Valid @RequestBody Post post){

        return postService.updatePost(id, categoryId, tagIds, post)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id){
        if(postService.deletePost(id)){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    
}
