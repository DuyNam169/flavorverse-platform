package com.flavorverse.controller;

import com.flavorverse.dto.CommonDtos;
import com.flavorverse.service.TagService;
import com.flavorverse.service.UserService;

import com.flavorverse.entity.Tag;
import com.flavorverse.entity.User;
import java.security.Principal;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;
    private final UserService userService;

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String q) {
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(
            tagService.search(q).stream().map(t -> Map.of(
                "id", t.getId(), "name", t.getName(),
                "slug", t.getSlug(), "type", t.getType(),
                "useCount", t.getUseCount()
            )).collect(Collectors.toList())));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<?> byType(@PathVariable String type) {
        return ResponseEntity.ok(CommonDtos.ApiResponse.ok(
            tagService.getByType(type).stream().map(t -> Map.of(
                "id", t.getId(), "name", t.getName(),
                "slug", t.getSlug(), "useCount", t.getUseCount()
            )).collect(Collectors.toList())));
    }

    @PostMapping("/find-or-create")
    public ResponseEntity<?> findOrCreate(@RequestBody Map<String, String> body,
    Principal principal) {
        try {
            String name = body.get("name");
            String type = body.getOrDefault("type", "ingredient");
            User user = userService.getById(UUID.fromString(principal.getName()));
            Tag tag = tagService.findOrCreate(name, type, user);
            return ResponseEntity.ok(CommonDtos.ApiResponse.ok(tagService.toDto(tag)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CommonDtos.ApiResponse.error(e.getMessage()));
        }
    }
}