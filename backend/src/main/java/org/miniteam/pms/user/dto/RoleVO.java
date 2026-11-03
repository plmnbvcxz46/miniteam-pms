package org.miniteam.pms.user.dto;

import java.util.List;
import org.miniteam.pms.user.entity.SysRole;

/** 接口里的 Role。 */
public record RoleVO(Long id, String code, String name, List<String> permissions, Integer sort, Integer userCount) {

    public static RoleVO of(SysRole r) {
        return new RoleVO(
                r.getId(),
                r.getCode(),
                r.getName(),
                r.getPermissions() == null ? List.of() : r.getPermissions(),
                r.getSort(),
                r.getUserCount() == null ? 0 : r.getUserCount());
    }
}
