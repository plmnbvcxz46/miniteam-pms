package org.miniteam.pms.progress.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.util.List;
import org.miniteam.pms.task.dto.TaskRefVO;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 Overview：项目今天（或某一期那天）的总览。 */
public record OverviewVO(
        int issueNo,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate date,
        Stats stats,
        Headline headline,
        Schedule schedule,
        List<TodoItemVO> todo,
        int todoTotal,
        Progress progress,
        Path criticalPath) {

    public record Stats(
            int done,
            int total,
            int remaining,
            int criticalRemaining,
            int overdue,
            int remainingDays,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate planEnd) {}

    /** 接口里的 HeadlineBlock。 */
    public record Headline(
            String title,
            boolean risk,
            int delayDays,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate plannedEnd,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate predictedEnd,
            List<TaskRefVO> blockedTasks,
            Long targetTaskId) {}

    public record Schedule(
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate from,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate to,
            List<Row> rows) {}

    public record Row(UserBriefVO user, List<Bar> bars) {}

    public record Bar(
            Long taskId,
            String title,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate start,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate end,
            String status) {}

    public record Progress(int percent, int done, int remaining, int total) {}

    public record Path(
            List<Node> nodes,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate plannedEnd,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate predictedEnd) {}

    /** 接口里的 CriticalNode。 */
    public record Node(Long taskId, String label, String title, String status, int overrunDays) {}
}
