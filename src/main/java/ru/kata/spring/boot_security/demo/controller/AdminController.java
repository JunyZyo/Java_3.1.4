package ru.kata.spring.boot_security.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.RoleServiceImpl;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.security.Principal;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final RoleService roleService;

    public AdminController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    private User getCurrentUser(Principal principal) {
        String name = principal.getName();
        User user = userService.findByEmail(name);
        if (user == null) {
            user = userService.findByUsername(name);
        }
        return user;
    }

    @GetMapping("/users")
    public String showAllUsers(Model model, Principal principal) {
        model.addAttribute("users", userService.findAll());
        model.addAttribute("currentUser", getCurrentUser(principal));
        model.addAttribute("allRoles", roleService.findAll());
        model.addAttribute("newUser", new User());
        return "admin/admin";
    }

    @PostMapping("/users")
    public String createUser(@ModelAttribute("newUser") User user,
                             @RequestParam(required = false) Long[] roleIds) {
        if (roleIds != null && roleIds.length > 0) {
            user.setRoles(roleService.findByIds(roleIds));
        }
        userService.save(user);
        return "redirect:/admin/users";
    }

    @GetMapping("/users/{id}")
    public String viewUser(@PathVariable Long id, Model model, Principal principal) {
        User user = userService.getById(id);
        if (user == null) {
            return "redirect:/admin/users";
        }
        model.addAttribute("viewedUser", user);
        model.addAttribute("users", userService.findAll());
        model.addAttribute("currentUser", getCurrentUser(principal));
        model.addAttribute("allRoles", roleService.findAll());
        return "admin/userinfo";
    }

    @GetMapping("/users/{id}/edit")
    public String editUserForm(@PathVariable Long id, Model model, Principal principal) {
        User user = userService.getById(id);
        if (user == null) {
            return "redirect:/admin/users";
        }
        model.addAttribute("user", user);
        model.addAttribute("allRoles", roleService.findAll());
        model.addAttribute("currentUser", getCurrentUser(principal));
        return "admin/edituser";
    }

    @PostMapping("/users/{id}")
    public String updateUser(@PathVariable Long id,
                             @ModelAttribute User user,
                             @RequestParam(required = false) Long[] roleIds) {
        user.setId(id);
        if (roleIds != null && roleIds.length > 0) {
            user.setRoles(roleService.findByIds(roleIds));
        }
        userService.update(user);
        return "redirect:/admin/users";
    }

    @PostMapping("/users/{id}/delete")
    public String deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return "redirect:/admin/users";
    }
}