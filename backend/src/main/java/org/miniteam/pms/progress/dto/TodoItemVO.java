package org.miniteam.pms.progress.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import org.miniteam.pms.task.dto.TaskRefVO;

/** 接口里的 TodoItem。dueTag：逾期 / 今天 / 周几 / 下周几。 */
public record TodoItemVO(
        TaskRefVO task,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate dueDate,
        int score,
        String dueTag,
        int overdueDays) {}
