package org.miniteam.pms.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;
import org.miniteam.pms.user.entity.SysUser;
import org.miniteam.pms.user.mapper.UserMapper;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 校验 {@code Authorization: Bearer <token>}，通过后把身份放进 {@link AuthContext}。
 * 每次都查库：账号被停用、角色被改，下一个请求立即生效。
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    private static final String BEARER = "Bearer ";

    private final JwtService jwtService;
    private final UserMapper userMapper;

    public AuthInterceptor(JwtService jwtService, UserMapper userMapper) {
        this.jwtService = jwtService;
        this.userMapper = userMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith(BEARER)) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        Long userId = jwtService
                .parse(header.substring(BEARER.length()).trim())
                .orElseThrow(() -> new BusinessException(ResultCode.UNAUTHORIZED));
        SysUser user = userMapper.findById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        if (user.getStatus() == null || user.getStatus() != 1) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "账号已停用");
        }
        AuthContext.set(LoginUser.of(user));
        return true;
    }

    @Override
    public void afterCompletion(
            HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        AuthContext.clear();
    }
}
