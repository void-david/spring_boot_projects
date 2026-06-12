package com.springten.blog.config;

import com.springten.blog.model.*;
import com.springten.blog.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@Order(1)
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final PostRepository postRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UserRepository userRepository, CategoryRepository categoryRepository,
                      TagRepository tagRepository, PostRepository postRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.postRepository = postRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@lumen.blog");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setDisplayName("LUMEN Admin");
        admin.setBio("Founder of LUMEN. Writing about technology, design and the future.");
        admin.setRole(User.Role.ADMIN);
        userRepository.save(admin);

        // Categories
        Category tech = category("Technology");
        Category design = category("Design");
        Category programming = category("Programming");
        Category science = category("Science");
        Category culture = category("Culture");
        categoryRepository.saveAll(List.of(tech, design, programming, science, culture));

        // Tags
        Tag springTag = tag("Spring Boot", "#6DB33F");
        Tag angularTag = tag("Angular", "#DD0031");
        Tag javaTag = tag("Java", "#007396");
        Tag tsTag = tag("TypeScript", "#3178C6");
        Tag aiTag = tag("AI", "#7C3AED");
        Tag webTag = tag("Web Dev", "#F7DF1E");
        tagRepository.saveAll(List.of(springTag, angularTag, javaTag, tsTag, aiTag, webTag));

        // Sample posts
        Post p1 = new Post();
        p1.setTitle("Welcome to LUMEN: A Modern Blog Platform");
        p1.setSlug("welcome-to-lumen-a-modern-blog-platform");
        p1.setContent("LUMEN is a full-stack blog platform built with Spring Boot and Angular. This is the first post on the platform — a quick tour of what you can do.\n\nYou can create posts with rich content, assign them to categories and tags, mark them as featured, and manage everything through a beautiful dark-mode interface.\n\nThe backend is powered by Spring Boot 4, JWT authentication, and an H2 database (swap to PostgreSQL for production). The frontend uses Angular 19 with standalone components, signals, and a stunning glass-morphism design system.\n\nGet started by logging in with admin@lumen.blog / admin123 and exploring the admin features.");
        p1.setExcerpt("LUMEN is a full-stack blog platform built with Spring Boot and Angular. A quick tour of what you can create and manage.");
        p1.setCoverImageUrl("https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80");
        p1.setCategory(tech);
        p1.setTags(List.of(springTag, angularTag));
        p1.setStatus(PostStatus.PUBLISHED);
        p1.setFeatured(true);
        p1.setAuthor(admin);
        p1.setViewCount(142);
        p1.setLikeCount(38);
        postRepository.save(p1);

        Post p2 = new Post();
        p2.setTitle("Building Type-Safe APIs with Spring Boot and Jakarta Validation");
        p2.setSlug("building-type-safe-apis-with-spring-boot-and-jakarta-validation");
        p2.setContent("Input validation is one of the most critical aspects of any production API. Jakarta Bean Validation (formerly Hibernate Validator) gives you a declarative, annotation-driven way to enforce constraints without polluting your business logic.\n\nIn this post we'll walk through @NotBlank, @Size, @Email, @Pattern and custom validators. We'll also look at how Spring's @RestControllerAdvice can intercept MethodArgumentNotValidException and return structured error responses that your frontend can display inline next to the offending field.\n\nFinally, we'll cover nested object validation with @Valid and how to test it all with MockMvc.");
        p2.setExcerpt("A deep dive into Jakarta Bean Validation — from basic annotations to custom validators and structured error responses.");
        p2.setCoverImageUrl("https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80");
        p2.setCategory(programming);
        p2.setTags(List.of(springTag, javaTag));
        p2.setStatus(PostStatus.PUBLISHED);
        p2.setFeatured(false);
        p2.setAuthor(admin);
        p2.setViewCount(89);
        p2.setLikeCount(21);
        postRepository.save(p2);

        Post p3 = new Post();
        p3.setTitle("Angular Signals: Reactive State Without RxJS Complexity");
        p3.setSlug("angular-signals-reactive-state-without-rxjs-complexity");
        p3.setContent("Angular Signals arrived in v16 and became stable in v17, offering a simpler, more predictable model for reactive state management compared to BehaviorSubjects and the full weight of RxJS.\n\nThe core primitive is signal<T>(initialValue). You read it like a function call — value() — and write to it with value.set(newVal) or value.update(v => transform(v)). Derived state uses computed(), and side effects use effect().\n\nThis post shows how to migrate a classic component that uses Subject and async pipe to one that uses only signals and the new @for / @if control flow syntax. The result is less code, better performance (fine-grained change detection), and code that's much easier for new team members to understand.");
        p3.setExcerpt("Signals are Angular's answer to fine-grained reactivity. Here's how to replace BehaviorSubjects with cleaner, faster signal-based state.");
        p3.setCoverImageUrl("https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80");
        p3.setCategory(programming);
        p3.setTags(List.of(angularTag, tsTag));
        p3.setStatus(PostStatus.PUBLISHED);
        p3.setFeatured(false);
        p3.setAuthor(admin);
        p3.setViewCount(203);
        p3.setLikeCount(54);
        postRepository.save(p3);

        Post p4 = new Post();
        p4.setTitle("The Design Language of Trust: Why Your UI Colors Signal Credibility");
        p4.setSlug("the-design-language-of-trust");
        p4.setContent("Color is never neutral. Every shade on your interface carries cultural weight, contextual meaning, and emotional resonance. The muted indigo of a banking app isn't an accident — it's decades of visual language around stability and authority.\n\nIn this piece we explore how color psychology intersects with UI design decisions. We'll look at why dark mode feels premium (scarcity signaling), why warning states universally reach for amber (evolutionary threat detection), and why the best call-to-action buttons balance contrast ratio with brand personality.\n\nWe'll also dig into the WCAG 2.2 contrast requirements and show how you can achieve accessible, beautiful palettes without sacrificing your design vision.");
        p4.setExcerpt("Why the colors you choose on your interface carry cultural weight, emotional resonance, and real business impact.");
        p4.setCoverImageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80");
        p4.setCategory(design);
        p4.setTags(List.of(webTag));
        p4.setStatus(PostStatus.PUBLISHED);
        p4.setFeatured(false);
        p4.setAuthor(admin);
        p4.setViewCount(318);
        p4.setLikeCount(76);
        postRepository.save(p4);

        Post p5 = new Post();
        p5.setTitle("AI at the Inflection Point: What GPT-5 Changes for Developers");
        p5.setSlug("ai-at-the-inflection-point");
        p5.setContent("We are past the point of debating whether large language models will change software development. They already have. The question now is how deeply, and whether the changes will compound.\n\nThis post is a developer-focused analysis of what the GPT-5 class of models does differently and what it means for day-to-day work: code generation quality, reasoning about multi-file codebases, the reliability of structured output for tool-use, and the new economics of context windows measured in millions of tokens.\n\nI'll also share a framework I use to think about which tasks to delegate to AI versus which to keep human — not for philosophical reasons, but for quality and speed reasons.");
        p5.setExcerpt("A developer-focused analysis of GPT-5 class models: what changed, what it means for day-to-day work, and how to think about delegation.");
        p5.setCoverImageUrl("https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80");
        p5.setCategory(science);
        p5.setTags(List.of(aiTag));
        p5.setStatus(PostStatus.PUBLISHED);
        p5.setFeatured(false);
        p5.setAuthor(admin);
        p5.setViewCount(521);
        p5.setLikeCount(112);
        postRepository.save(p5);
    }

    private Category category(String name) {
        Category c = new Category();
        c.setName(name);
        return c;
    }

    private Tag tag(String name, String color) {
        Tag t = new Tag();
        t.setName(name);
        t.setColor(color);
        return t;
    }
}
