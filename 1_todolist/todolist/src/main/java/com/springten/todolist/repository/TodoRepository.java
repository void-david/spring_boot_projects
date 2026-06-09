package com.springten.todolist.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.springten.todolist.model.Todo;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long>{
    List<Todo> findByCompleted(boolean completed);
}