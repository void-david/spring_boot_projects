package com.springten.blog.service;

import com.springten.blog.dto.request.PostRequest;
import com.springten.blog.dto.response.CategoryResponse;
import com.springten.blog.dto.response.CommentResponse;
import com.springten.blog.dto.response.PostResponse;
import com.springten.blog.dto.response.PostSummaryResponse;
import com.springten.blog.model.Post;
import com.springten.blog.repository.CategoryRepository;
import com.springten.blog.repository.PostRepository;
import com.springten.blog.repository.TagRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {
    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    public PostService(PostRepository postRepository,
                       CategoryRepository categoryRepository,
                       TagRepository tagRepository) {
        this.postRepository = postRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
    }


    private PostResponse toPostResponse(Post post){
        CategoryResponse categoryResponse = post.getCategory() != null
            ? new CategoryResponse(post.getCategory().getId(), post.getCategory().getName())
            : null;

        List<CommentResponse> commentResponses = post.getComments() != null
            ? post.getComments().stream()
                .map(c -> new CommentResponse(c.getId(), c.getAuthor(), c.getContent(), c.getCreatedAt()))
                .toList()
            : List.of();

        return new PostResponse(post.getId(), post.getTitle(), post.getContent(), categoryResponse, commentResponses, post.getCreatedAt(), post.getUpdatedAt());
    }

    private PostSummaryResponse toPostSummaryResponse(Post post){
        CategoryResponse categoryResponse = post.getCategory() != null
            ? new CategoryResponse(post.getCategory().getId(), post.getCategory().getName())
            : null;

        return new PostSummaryResponse(post.getId(), post.getTitle(), categoryResponse, post.getCreatedAt());
    }


    public Page<PostSummaryResponse> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postRepository.findAll(pageable).map(this::toPostSummaryResponse);
    }

    public Optional<PostResponse> getPostById(Long id) {
        return postRepository.findById(id).map(this::toPostResponse);
    }

    public Page<PostSummaryResponse> getPostsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postRepository.findByCategoryId(categoryId, pageable).map(this::toPostSummaryResponse);
    }

     public Page<PostSummaryResponse> getPostsByTag(Long tagId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postRepository.findByTagsId(tagId, pageable).map(this::toPostSummaryResponse);
    }

    public Optional<PostResponse> createPost(PostRequest request) {
        return categoryRepository.findById(request.getCategoryId()).map(category -> {
            Post post = new Post();
            post.setTitle(request.getTitle());
            post.setContent(request.getContent());
            post.setCategory(category);
            post.setTags(request.getTagIds() != null
                ? tagRepository.findAllById(request.getTagIds())
                : List.of());
            return toPostResponse(postRepository.save(post));
        });
    }

    public Optional<PostResponse> updatePost(Long id, PostRequest request) {
        return postRepository.findById(id).map(existing -> {
            existing.setTitle(request.getTitle());
            existing.setContent(request.getContent());
            categoryRepository.findById(request.getCategoryId())
                .ifPresent(existing::setCategory);
            existing.setTags(request.getTagIds() != null
                ? tagRepository.findAllById(request.getTagIds())
                : List.of());
            return toPostResponse(postRepository.save(existing));
        });
    }

    public boolean deletePost(Long id) {
        if (postRepository.existsById(id)) {
            postRepository.deleteById(id);
            return true;
        }
        return false;
    }

}
