package org.miniteam.pms.system.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import org.miniteam.pms.system.entity.SysConfig;

/** 接口里的 ConfigItem。 */
public record ConfigItemVO(
        String key,
        String value,
        String name,
        String remark,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime updatedAt) {

    public static ConfigItemVO of(SysConfig c) {
        return new ConfigItemVO(c.getConfigKey(), c.getConfigValue(), c.getName(), c.getRemark(), c.getUpdatedAt());
    }
}
