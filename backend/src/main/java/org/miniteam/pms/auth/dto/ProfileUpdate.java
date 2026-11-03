package org.miniteam.pms.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.util.List;

/** 只改传了的字段：没传（null）的保持原值，email 传空串表示清空。 */
public record ProfileUpdate(
        @Size(min = 1, max = 32) String realName,
        @Email @Size(max = 128) String email,
        @Size(max = 20) List<@Size(max = 32) String> skillTags) {}
