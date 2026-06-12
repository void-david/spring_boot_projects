package com.springten.blog.service;


import com.springten.blog.dto.request.CommentRequest;
import com.springten.blog.dto.response.CommentResponse;
import com.springten.blog.model.Comment;
import com.springten.blog.repository.CommentRepository;
import com.springten.blog.repository.PostRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    public CommentService(CommentRepository commentRepository, PostRepository postRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
    }

    private CommentResponse toCommentResponse(Comment comment){
        return new CommentResponse(comment.getId(), comment.getAuthor(), comment.getContent(), comment.getCreatedAt());
    }

    public List<CommentResponse> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostId(postId).stream()
                .map(this::toCommentResponse)
                .toList();
    }

    public Optional<CommentResponse> createComment(Long postId, CommentRequest request) {
        return postRepository.findById(postId).map(post -> {
            Comment comment = new Comment();
            comment.setAuthor(request.getAuthor());
            comment.setContent(request.getContent());
            comment.setPost(post);
            return toCommentResponse(commentRepository.save(comment));
        });
    }

    public boolean deleteComment(Long id) {
        if (commentRepository.existsById(id)) {
            commentRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
