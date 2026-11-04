package org.miniteam.pms.task;

import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;

/** 任务状态，也是看板的四列。 */
public enum TaskStatus {
    TODO,
    DOING,
    BLOCKED,
    DONE;

    public static TaskStatus parse(String value) {
        try {
            return valueOf(value);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "任务状态只能是 TODO、DOING、BLOCKED、DONE");
        }
    }
}
