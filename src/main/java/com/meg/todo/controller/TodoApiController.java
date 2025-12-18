package com.meg.todo.controller;

import com.meg.todo.entity.Todo;
import com.meg.todo.service.TodoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
public class TodoApiController {
    private final TodoService service;

    public TodoApiController(TodoService service) { 
        this.service = service; 
    }

    @GetMapping
    public List<Todo> list(@RequestParam(value="q", required=false) String q) {
        return service.search(q);
    }

    @PostMapping
    public Todo add(@RequestBody Todo t) {
        return service.add(t);
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<Todo> toggle(@PathVariable Long id) {
        Todo updated = service.toggleDone(id);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boolean ok = service.delete(id);
        return ok ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
