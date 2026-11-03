package org.miniteam.pms.auth;

import jakarta.validation.Valid;
import org.miniteam.pms.auth.dto.CurrentUserVO;
import org.miniteam.pms.auth.dto.LoginRequest;
import org.miniteam.pms.auth.dto.LoginResult;
import org.miniteam.pms.auth.dto.PasswordChange;
import org.miniteam.pms.auth.dto.ProfileUpdate;
import org.miniteam.pms.auth.dto.RegisterRequest;
import org.miniteam.pms.common.result.Result;
import org.miniteam.pms.user.dto.UserVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public Result<LoginResult> login(@Valid @RequestBody LoginRequest request) {
        return Result.ok(authService.login(request));
    }

    @PostMapping("/register")
    public Result<UserVO> register(@Valid @RequestBody RegisterRequest request) {
        return Result.ok(authService.register(request));
    }

    /** token 无状态，服务端没有会话可销毁，由前端丢弃 token；接口只用来确认身份有效 */
    @PostMapping("/logout")
    public Result<Void> logout() {
        AuthContext.require();
        return Result.ok();
    }

    @GetMapping("/me")
    public Result<CurrentUserVO> me() {
        return Result.ok(authService.me());
    }

    @PutMapping("/me")
    public Result<UserVO> updateMe(@Valid @RequestBody ProfileUpdate request) {
        return Result.ok(authService.updateMe(request));
    }

    @PutMapping("/password")
    public Result<Void> changePassword(@Valid @RequestBody PasswordChange request) {
        authService.changePassword(request);
        return Result.ok();
    }
}
