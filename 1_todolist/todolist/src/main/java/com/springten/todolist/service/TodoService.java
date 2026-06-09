package com.springten.todolist.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.springten.todolist.model.Todo;
import com.springten.todolist.repository.TodoRepository;

@Service
public class TodoService {
    private final TodoRepository todoRepository;

    public TodoService(TodoRepository todoRepository){
        this.todoRepository = todoRepository;
    }

    public List<Todo> getAllTodos() {
        return todoRepository.findAll();
    }

    public Optional<Todo> getTodoById(long id){
        return todoRepository.findById(id);
    }

    public Todo createTodo(Todo todo){
        return todoRepository.save(todo);
    }

    public Optional<Todo> updateTodo(Long id, Todo updatedTodo){
        return todoRepository.findById(id).map(existing -> {
            existing.setTitle(updatedTodo.getTitle());
            existing.setDescription(updatedTodo.getDescription());
            existing.setCompleted(updatedTodo.isCompleted());
            return todoRepository.save(existing);
        });
    }


    public boolean deleteTodo(Long id){
        if(todoRepository.existsById(id)){
            todoRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Todo> getTodosByStatus(boolean completed) {
        return todoRepository.findByCompleted(completed);
    }


}
