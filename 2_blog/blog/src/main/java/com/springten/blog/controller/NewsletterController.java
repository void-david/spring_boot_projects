package com.springten.blog.controller;

import com.springten.blog.dto.request.SubscribeRequest;
import com.springten.blog.model.Subscriber;
import com.springten.blog.repository.SubscriberRepository;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    private final SubscriberRepository subscriberRepository;

    public NewsletterController(SubscriberRepository subscriberRepository) {
        this.subscriberRepository = subscriberRepository;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(@Valid @RequestBody SubscribeRequest request) {
        if (subscriberRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.ok(Map.of("message", "Already subscribed!"));
        }
        Subscriber sub = new Subscriber();
        sub.setEmail(request.getEmail());
        subscriberRepository.save(sub);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Subscribed successfully!"));
    }
}
