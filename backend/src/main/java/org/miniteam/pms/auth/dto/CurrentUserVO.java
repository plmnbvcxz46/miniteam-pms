package org.miniteam.pms.auth.dto;

import java.util.List;
import org.miniteam.pms.user.dto.UserVO;
import org.miniteam.pms.user.entity.SysUser;

/** 接口里的 CurrentUser：用户 + 系统权限编码。 */
public record CurrentUserVO(UserVO user, List<String> permissions) {

    public static CurrentUserVO of(SysUser u) {
        return new CurrentUserVO(UserVO.of(u), u.getRolePermissions() == null ? List.of() : u.getRolePermissions());
    }
}
