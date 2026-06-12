package com.springten.blog.service;

import com.springten.blog.dto.request.PostRequest;
import com.springten.blog.dto.response.*;
import com.springten.blog.model.*;
import com.springten.blog.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, CategoryRepository categoryRepository,
                       TagRepository tagRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
    }

    private int readingTime(String content) {
        if (content == null || content.isBlank()) return 1;
        return Math.max(1, (int) Math.round(content.split("\\s+").length / 200.0));
    }

    private String generateSlug(String title, Long excludeId) {
        String base = title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        String candidate = base;
        int suffix = 1;
        while (true) {
            Optional<Post> existing = postRepository.findBySlug(candidate);
            if (existing.isEmpty() || existing.get().getId().equals(excludeId)) return candidate;
            candidate = base + "-" + (++suffix);
        }
    }

    private TagResponse toTagResponse(Tag tag) {
        return new TagResponse(tag.getId(), tag.getName(), tag.getColor());
    }

    private PostResponse toPostResponse(Post post) {
        CategoryResponse cat = post.getCategory() != null
                ? new CategoryResponse(post.getCategory().getId(), post.getCategory().getName())
                : null;
        List<TagResponse> tags = post.getTags() != null
                ? post.getTags().stream().map(this::toTagResponse).toList()
                : List.of();
        List<CommentResponse> comments = post.getComments() != null
                ? post.getComments().stream()
                    .map(c -> new CommentResponse(c.getId(), c.getAuthor(), c.getContent(), c.getCreatedAt()))
                    .toList()
                : List.of();
        UserResponse author = post.getAuthor() != null ? new UserResponse(post.getAuthor()) : null;
        return new PostResponse(
                post.getId(), post.getSlug(), post.getTitle(), post.getContent(), post.getExcerpt(),
                post.getCoverImageUrl(), cat, tags, comments, post.getStatus(),
                post.getViewCount(), post.getLikeCount(), post.isFeatured(),
                readingTime(post.getContent()), author, post.getCreatedAt(), post.getUpdatedAt()
        );
    }

    private PostSummaryResponse toSummaryResponse(Post post) {
        CategoryResponse cat = post.getCategory() != null
                ? new CategoryResponse(post.getCategory().getId(), post.getCategory().getName())
                : null;
        List<TagResponse> tags = post.getTags() != null
                ? post.getTags().stream().map(this::toTagResponse).toList()
                : List.of();
        UserResponse author = post.getAuthor() != null ? new UserResponse(post.getAuthor()) : null;
        return new PostSummaryResponse(
                post.getId(), post.getSlug(), post.getTitle(), post.getExcerpt(),
                post.getCoverImageUrl(), cat, tags, post.getStatus(),
                post.getViewCount(), post.getLikeCount(), post.isFeatured(),
                readingTime(post.getContent()), author, post.getCreatedAt()
        );
    }

    public Page<PostSummaryResponse> getAllPosts(int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postRepository.findAll(p).map(this::toSummaryResponse);
    }

    public Optional<PostResponse> getPostById(Long id) {
        return postRepository.findById(id).map(this::toPostResponse);
    }

    public Optional<PostResponse> getPostBySlug(String slug) {
        return postRepository.findBySlug(slug).map(this::toPostResponse);
    }

    public Page<PostSummaryResponse> getPostsByCategory(Long categoryId, int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postRepository.findByCategoryId(categoryId, p).map(this::toSummaryResponse);
    }

    public Page<PostSummaryResponse> getPostsByTag(Long tagId, int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postRepository.findByTagsId(tagId, p).map(this::toSummaryResponse);
    }

    public Page<PostSummaryResponse> searchPosts(String query, int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postRepository.search(query, p).map(this::toSummaryResponse);
    }

    public List<PostSummaryResponse> getFeaturedPosts() {
        return postRepository.findByFeaturedTrueOrderByCreatedAtDesc()
                .stream().map(this::toSummaryResponse).toList();
    }

    public PostResponse createPost(PostRequest request, String authorEmail) {
        Post post = new Post();
        populatePost(post, request);
        post.setSlug(generateSlug(request.getTitle(), null));
        if (authorEmail != null) {
            userRepository.findByEmail(authorEmail).ifPresent(post::setAuthor);
        }
        return toPostResponse(postRepository.save(post));
    }

    public Optional<PostResponse> updatePost(Long id, PostRequest request) {
        return postRepository.findById(id).map(existing -> {
            populatePost(existing, request);
            existing.setSlug(generateSlug(request.getTitle(), id));
            return toPostResponse(postRepository.save(existing));
        });
    }

    private void populatePost(Post post, PostRequest req) {
        post.setTitle(req.getTitle());
        post.setContent(req.getContent());
        post.setExcerpt(req.getExcerpt());
        post.setCoverImageUrl(req.getCoverImageUrl());
        post.setStatus(req.getStatus() != null ? req.getStatus() : PostStatus.PUBLISHED);
        post.setFeatured(req.isFeatured());
        if (req.getCategoryId() != null) {
            categoryRepository.findById(req.getCategoryId()).ifPresent(post::setCategory);
        } else {
            post.setCategory(null);
        }
        post.setTags(req.getTagIds() != null ? tagRepository.findAllById(req.getTagIds()) : List.of());
    }

    public boolean deletePost(Long id) {
        if (!postRepository.existsById(id)) return false;
        postRepository.deleteById(id);
        return true;
    }

    @Transactional
    public void recordView(Long id) {
        postRepository.incrementViewCount(id);
    }

    @Transactional
    public void recordLike(Long id) {
        postRepository.incrementLikeCount(id);
    }

    public Map<String, Long> getStats() {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("totalPosts", postRepository.count());
        stats.put("totalViews", Optional.ofNullable(postRepository.sumViewCount()).orElse(0L));
        stats.put("totalLikes", Optional.ofNullable(postRepository.sumLikeCount()).orElse(0L));
        return stats;
    }
}
