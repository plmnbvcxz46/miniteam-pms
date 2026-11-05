package org.miniteam.pms.collab;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.miniteam.pms.collab.service.NotificationService;
import org.miniteam.pms.collab.service.OverdueNoticeJob;
import org.miniteam.pms.project.entity.Project;
import org.miniteam.pms.project.mapper.ProjectMapper;
import org.miniteam.pms.task.entity.Task;
import org.miniteam.pms.task.mapper.TaskMapper;

class OverdueNoticeJobTest {

    private static Task task(long id, Long assignee, String due, String status) {
        Task t = new Task();
        t.setId(id);
        t.setTaskNo((int) id);
        t.setTitle("任务" + id);
        t.setAssigneeId(assignee);
        t.setDueDate(due == null ? null : LocalDate.parse(due));
        t.setStatus(status);
        return t;
    }

    @Test
    void oneSummaryPerAssigneeForOverdueUnfinishedTasks() {
        Project project = new Project();
        project.setId(1L);
        project.setName("演示");
        TaskMapper taskMapper = mock(TaskMapper.class);
        when(taskMapper.listByProject(1L))
                .thenReturn(List.of(
                        task(1, 7L, "2026-10-20", "DOING"),
                        task(2, 7L, "2026-10-21", "TODO"),
                        task(3, 7L, "2026-10-20", "DONE"),
                        task(4, 8L, "2026-11-30", "DOING"),
                        task(5, null, "2026-10-20", "TODO"),
                        task(6, 9L, "2026-10-20", "BLOCKED")));
        NotificationService notices = mock(NotificationService.class);
        when(notices.sentToday(9L, 1L, NotificationService.DELAY)).thenReturn(true);

        new OverdueNoticeJob(mock(ProjectMapper.class), taskMapper, notices)
                .notifyProject(project, LocalDate.parse("2026-11-05"));

        verify(notices)
                .send(
                        eq(7L),
                        eq(1L),
                        eq(NotificationService.DELAY),
                        eq("你有 2 个任务已逾期"),
                        eq("「演示」：T-1 任务1、T-2 任务2"),
                        eq("/board"));
        // 没逾期的、没负责人的、今天已经通知过的都不发
        verify(notices, never()).send(eq(8L), any(), any(), any(), any(), any());
        verify(notices, never()).send(eq(9L), any(), any(), any(), any(), any());
    }
}
