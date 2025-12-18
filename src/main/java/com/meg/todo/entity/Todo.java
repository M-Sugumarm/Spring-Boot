package com.meg.todo.entity;

import java.time.LocalDateTime;

public class Todo {
    private Long id;
    private String title;
    private String description;
    private boolean done;
    private String priority; // HIGH, MEDIUM, LOW
    private LocalDateTime createdAt;

    public Todo() {}

    public Todo(Long id, String title, String description, String priority) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.done = false;
        this.createdAt = LocalDateTime.now();
    }

    // ===== getters & setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isDone() { return done; }
    public void setDone(boolean done) { this.done = done; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
