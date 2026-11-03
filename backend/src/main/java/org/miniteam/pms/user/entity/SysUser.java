package org.miniteam.pms.user.entity;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

/** 对应 sys_user，查询时顺带带出所属系统角色的信息（role_*）。 */
@Data
public class SysUser {

    private Long id;
    private String username;
    private String passwordHash;
    private String realName;
    private String dept;
    private Long roleId;
    private String email;
    private List<String> skillTags;
    private Integer weeklyCapacity;
    private Integer status;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** 以下来自 sys_role 的联表 */
    private String roleCode;

    private String roleName;
    private List<String> rolePermissions;
}
