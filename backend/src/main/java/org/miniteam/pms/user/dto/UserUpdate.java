package org.miniteam.pms.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.util.List;

/** 只改传了的字段：没传（null）的保持原值，dept、email 传空串表示清空。 */
public record UserUpdate(
        @Size(min = 1, max = 32) String realName,
        @Size(max = 64) String dept,
        Long roleId,
        @Email @Size(max = 128) String email,
        @Size(max = 20) List<@Size(max = 32) String> skillTags,
        @Min(1) @Max(168) Integer weeklyCapacity) {}
