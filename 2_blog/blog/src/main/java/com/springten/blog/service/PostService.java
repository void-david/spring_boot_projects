package com.springten.blog.service;

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

    public Page<Post> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postRepository.findAll(pageable);
    }

    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    public Page<Post> getPostsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postRepository.findByCategoryId(categoryId, pageable);
    }

     public Page<Post> getPostsByTag(Long tagId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postRepository.findByTagsId(tagId, pageable);
    }

    public Optional<Post> createPost(Long categoryId, List<Long> tagIds, Post post) {
        return categoryRepository.findById(categoryId).map(category -> {
            post.setCategory(category);
            post.setTags(tagIds!= null ? tagRepository.findAllById(tagIds) : List.of());
            return postRepository.save(post);
        });
    }

    public Optional<Post> updatePost(Long id, Long categoryId, List<Long> tagIds, Post updated) {
        return postRepository.findById(id).map(existing -> {
            existing.setTitle(updated.getTitle());
            existing.setContent(updated.getContent());
            categoryRepository.findById(categoryId).ifPresent(existing::setCategory);
            existing.setTags(tagIds != null ? tagRepository.findAllById(tagIds) : List.of());
            return postRepository.save(existing);
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
