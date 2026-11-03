package org.miniteam.pms.user.controller;

import java.util.List;
import org.miniteam.pms.common.result.Result;
import org.miniteam.pms.user.dto.RoleVO;
import org.miniteam.pms.user.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/roles")
public class RoleController {

    private final UserService userService;

    public RoleController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public Result<List<RoleVO>> list() {
        return Result.ok(userService.listRoles());
    }
}
