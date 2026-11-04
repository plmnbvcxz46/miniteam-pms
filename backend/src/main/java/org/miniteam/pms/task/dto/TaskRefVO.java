package org.miniteam.pms.task.dto;

import org.miniteam.pms.task.entity.Task;

/** 接口里的 TaskRef。 */
public record TaskRefVO(Long id, Integer taskNo, String title) {

    public static TaskRefVO of(Task t) {
        return t == null ? null : new TaskRefVO(t.getId(), t.getTaskNo(), t.getTitle());
    }
}
