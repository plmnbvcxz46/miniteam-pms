package org.miniteam.pms.auth;

import java.util.List;
import org.miniteam.pms.user.entity.SysUser;

/** 当前请求的登录身份，由 {@link AuthInterceptor} 从 JWT 和数据库得出。 */
public record LoginUser(Long id, String username, String realName, String roleCode, List<String> permissions) {

    public static final String ADMIN_ROLE = "ADMIN";

    public static LoginUser of(SysUser u) {
        return new LoginUser(
                u.getId(),
                u.getUsername(),
                u.getRealName(),
                u.getRoleCode(),
                u.getRolePermissions() == null ? List.of() : u.getRolePermissions());
    }

    /** 系统管理员：所有项目都能进、所有权限都有 */
    public boolean isAdmin() {
        return ADMIN_ROLE.equals(roleCode);
    }
}
