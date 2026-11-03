package org.miniteam.pms.user.entity;

import java.util.List;
import lombok.Data;

/** 对应 sys_role。 */
@Data
public class SysRole {

    private Long id;
    private String code;
    private String name;
    private List<String> permissions;
    private Integer sort;

    /** 该角色的用户数，只在角色列表里有值 */
    private Integer userCount;
}
