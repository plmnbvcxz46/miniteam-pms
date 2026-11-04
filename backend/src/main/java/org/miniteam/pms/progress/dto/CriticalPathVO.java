package org.miniteam.pms.progress.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.util.List;
import org.miniteam.pms.task.dto.TaskRefVO;

/** 接口里的 CriticalPath。 */
public record CriticalPathVO(
        String unit,
        List<Row> rows,
        List<Long> path,
        List<String> pathLabels,
        int totalDuration,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate plannedEnd,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate predictedEnd,
        int delayDays,
        TaskRefVO delayCause) {

    /** 接口里的 CpmRow。 */
    public record Row(
            Long taskId,
            String label,
            String title,
            int duration,
            int es,
            int ef,
            int ls,
            int lf,
            int totalFloat,
            boolean critical) {}
}
