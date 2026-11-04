package org.miniteam.pms.project.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.miniteam.pms.project.ProjectRole;

/** 没传的字段保持不变；岗位传空字符串表示清空。 */
public record MemberUpdate(
        @Pattern(regexp = ProjectRole.PATTERN) String projectRole, @Size(max = 32) String position) {}
