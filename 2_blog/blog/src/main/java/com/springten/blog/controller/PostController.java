package com.springten.blog.controller;

import com.springten.blog.dto.request.PostRequest;
import com.springten.blog.dto.response.PostResponse;
import com.springten.blog.dto.response.PostSummaryResponse;
import com.springten.blog.service.PostService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;

    public PostController( PostService postService ){
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<Page<PostSummaryResponse>> getAllPosts(
        @RequestParam(defaultValue = "0") int page, 
        @RequestParam(defaultValue = "10") int size){
        
        return ResponseEntity.ok(postService.getAllPosts(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id){
        return postService.getPostById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<PostSummaryResponse>> getPostsByCategory(
        @PathVariable Long categoryId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size){
        
        return ResponseEntity.ok(postService.getPostsByCategory(categoryId, page, size));
    }

    @GetMapping("/tag/{tagId}")
    public ResponseEntity<Page<PostSummaryResponse>> getPostsbyTag(
        @PathVariable Long tagId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size){

        return ResponseEntity.ok(postService.getPostsByTag(tagId, page, size));
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostRequest request) {
        return postService.createPost(request)
                .map(p -> ResponseEntity.status(HttpStatus.CREATED).body(p))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(@PathVariable Long id,
                                                    @Valid @RequestBody PostRequest request) {
        return postService.updatePost(id, request)
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
