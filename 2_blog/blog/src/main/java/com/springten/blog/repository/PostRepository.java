package com.springten.blog.repository;

import com.springten.blog.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findAll(Pageable pageable);
    Page<Post> findByCategoryId(Long categoryId, Pageable pageable);
    Page<Post> findByTagsId(Long tagId, Pageable pageable);
    Optional<Post> findBySlug(String slug);
    List<Post> findByFeaturedTrueOrderByCreatedAtDesc();

    @Query("SELECT p FROM Post p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%',:q,'%'))")
    Page<Post> search(@Param("q") String query, Pageable pageable);

    @Modifying
    @Query("UPDATE Post p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Post p SET p.likeCount = p.likeCount + 1 WHERE p.id = :id")
    void incrementLikeCount(@Param("id") Long id);

    @Query("SELECT SUM(p.viewCount) FROM Post p")
    Long sumViewCount();

    @Query("SELECT SUM(p.likeCount) FROM Post p")
    Long sumLikeCount();
}
