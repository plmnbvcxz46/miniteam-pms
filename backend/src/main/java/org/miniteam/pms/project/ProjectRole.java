package org.miniteam.pms.project;

import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;

/** 项目内的角色，存在 project_member.project_role。系统角色只有 ADMIN 和 USER，与这里无关。 */
public enum ProjectRole {
    PM("项目经理"),
    MEMBER("普通成员"),
    TESTER("测试人员");

    public static final String PATTERN = "PM|MEMBER|TESTER";

    private final String label;

    ProjectRole(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static ProjectRole parse(String code) {
        try {
            return valueOf(code);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "项目角色不正确");
        }
    }
}
