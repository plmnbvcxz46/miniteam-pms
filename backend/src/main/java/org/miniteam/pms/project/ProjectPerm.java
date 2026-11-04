package org.miniteam.pms.project;

/** 项目成员的四项权限，对应 project_member 的 can_* 字段。 */
public enum ProjectPerm {
    EDIT_TASK("编辑任务"),
    EDIT_SCHEDULE("调整排期"),
    EDIT_DOC("编辑文档"),
    MANAGE_MEMBER("管理成员");

    private final String label;

    ProjectPerm(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
