package org.miniteam.pms.user.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.miniteam.pms.common.result.PageResult;
import org.miniteam.pms.common.result.Result;
import org.miniteam.pms.user.dto.ResetPasswordResult;
import org.miniteam.pms.user.dto.UserBriefVO;
import org.miniteam.pms.user.dto.UserCreate;
import org.miniteam.pms.user.dto.UserStatusChange;
import org.miniteam.pms.user.dto.UserUpdate;
import org.miniteam.pms.user.dto.UserVO;
import org.miniteam.pms.user.service.UserService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public Result<PageResult<UserVO>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String dept,
            @RequestParam(required = false) Long roleId,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.ok(userService.list(keyword, dept, roleId, status, page, size));
    }

    @PostMapping
    public Result<UserVO> create(@Valid @RequestBody UserCreate request) {
        return Result.ok(userService.create(request));
    }

    @GetMapping("/search")
    public Result<List<UserBriefVO>> search(
            @RequestParam String keyword, @RequestParam(defaultValue = "10") int limit) {
        return Result.ok(userService.search(keyword, limit));
    }

    @PutMapping("/{userId}")
    public Result<UserVO> update(@PathVariable Long userId, @Valid @RequestBody UserUpdate request) {
        return Result.ok(userService.update(userId, request));
    }

    @DeleteMapping("/{userId}")
    public Result<Void> delete(@PathVariable Long userId) {
        userService.delete(userId);
        return Result.ok();
    }

    @PutMapping("/{userId}/status")
    public Result<Void> setStatus(@PathVariable Long userId, @Valid @RequestBody UserStatusChange request) {
        userService.setStatus(userId, request.status());
        return Result.ok();
    }

    @PostMapping("/{userId}/reset-password")
    public Result<ResetPasswordResult> resetPassword(@PathVariable Long userId) {
        return Result.ok(userService.resetPassword(userId));
    }
}
