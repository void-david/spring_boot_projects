package com.springten.blog.controller;

import com.springten.blog.repository.*;
import com.springten.blog.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final PostService postService;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final CommentRepository commentRepository;
    private final SubscriberRepository subscriberRepository;

    public StatsController(PostService postService,
                           CategoryRepository categoryRepository,
                           TagRepository tagRepository,
                           CommentRepository commentRepository,
                           SubscriberRepository subscriberRepository) {
        this.postService = postService;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.commentRepository = commentRepository;
        this.subscriberRepository = subscriberRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = postService.getStats();
        stats.put("totalComments", commentRepository.count());
        stats.put("totalCategories", categoryRepository.count());
        stats.put("totalTags", tagRepository.count());
        stats.put("totalSubscribers", subscriberRepository.count());
        return ResponseEntity.ok(stats);
    }
}
