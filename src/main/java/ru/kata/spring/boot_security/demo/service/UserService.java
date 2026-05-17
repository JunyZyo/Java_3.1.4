package ru.kata.spring.boot_security.demo.service;

import ru.kata.spring.boot_security.demo.model.User;

import java.util.List;

public interface UserService {
    User getById(Long id);

    User findByEmail(String email);

    List<User> findAll();

    User save(User user);

    void delete(Long id);

    void update(User user);
}