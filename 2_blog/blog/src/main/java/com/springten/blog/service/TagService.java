package com.springten.blog.service;

import com.springten.blog.dto.request.TagRequest;
import com.springten.blog.dto.response.TagResponse;
import com.springten.blog.model.Tag;
import com.springten.blog.repository.TagRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    private TagResponse toTagResponse(Tag tag) {
        return new TagResponse(tag.getId(), tag.getName(), tag.getColor());
    }

    public List<TagResponse> getAllTags() {
        return tagRepository.findAll().stream().map(this::toTagResponse).toList();
    }

    public Optional<TagResponse> getTagById(Long id) {
        return tagRepository.findById(id).map(this::toTagResponse);
    }

    public TagResponse createTag(TagRequest request) {
        Tag tag = new Tag();
        tag.setName(request.getName());
        tag.setColor(request.getColor());
        return toTagResponse(tagRepository.save(tag));
    }

    public Optional<TagResponse> updateTag(Long id, TagRequest request) {
        return tagRepository.findById(id).map(t -> {
            t.setName(request.getName());
            t.setColor(request.getColor());
            return toTagResponse(tagRepository.save(t));
        });
    }

    public boolean deleteTag(Long id) {
        if (!tagRepository.existsById(id)) return false;
        tagRepository.deleteById(id);
        return true;
    }
}
