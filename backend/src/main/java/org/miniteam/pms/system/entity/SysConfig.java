package org.miniteam.pms.system.entity;

import java.time.LocalDateTime;
import lombok.Data;

/** 对应 sys_config。 */
@Data
public class SysConfig {

    private Long id;
    private String configKey;
    private String configValue;
    private String name;
    private String remark;
    private LocalDateTime updatedAt;
}
