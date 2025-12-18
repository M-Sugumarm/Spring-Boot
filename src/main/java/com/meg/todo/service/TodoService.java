package com.meg.todo.service;

import com.meg.todo.entity.Todo;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class TodoService {
    private final Map<Long, Todo> store = new LinkedHashMap<>();
    private final AtomicLong seq = new AtomicLong(1);

    public TodoService() {
        // seed demo data
        add(new Todo(null, "Complete project documentation", "Focus on API documentation and examples", "HIGH"));
        add(new Todo(null, "Buy groceries", "Milk, Eggs, Vegetables", "MEDIUM"));
        add(new Todo(null, "Call mom", "Weekly call", "LOW"));
    }

    public List<Todo> findAll() {
        return new ArrayList<>(store.values());
    }

    public Todo add(Todo t) {
        Long id = seq.getAndIncrement();
        t.setId(id);
        t.setCreatedAt(java.time.LocalDateTime.now());
        store.put(id, t);
        return t;
    }

    public Optional<Todo> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    public boolean delete(Long id) {
        return store.remove(id) != null;
    }

    public Todo toggleDone(Long id) {
        Todo t = store.get(id);
        if (t != null) {
            t.setDone(!t.isDone());
        }
        return t;
    }

    public List<Todo> search(String q) {
        if (q == null || q.isBlank()) return findAll();
        String lower = q.toLowerCase();
        return store.values().stream()
                .filter(t -> t.getTitle().toLowerCase().contains(lower) ||
                        (t.getDescription() != null &&
                                t.getDescription().toLowerCase().contains(lower)))
                .collect(Collectors.toList());
    }
}
