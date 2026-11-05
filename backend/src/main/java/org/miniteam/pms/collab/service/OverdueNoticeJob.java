package org.miniteam.pms.collab.service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.miniteam.pms.project.IssueCalendar;
import org.miniteam.pms.project.entity.Project;
import org.miniteam.pms.project.mapper.ProjectMapper;
import org.miniteam.pms.task.TaskStatus;
import org.miniteam.pms.task.WorkdayCalendar;
import org.miniteam.pms.task.entity.Task;
import org.miniteam.pms.task.mapper.TaskMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/** 每天早上 9 点，把已经逾期的任务汇总成一条延期预警通知发给负责人（一个人一个项目一条）。 */
@Service
public class OverdueNoticeJob {

    private static final Logger log = LoggerFactory.getLogger(OverdueNoticeJob.class);
    private static final int SHOWN_TITLES = 3;

    private final ProjectMapper projectMapper;
    private final TaskMapper taskMapper;
    private final NotificationService notificationService;

    public OverdueNoticeJob(
            ProjectMapper projectMapper, TaskMapper taskMapper, NotificationService notificationService) {
        this.projectMapper = projectMapper;
        this.taskMapper = taskMapper;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Shanghai")
    public void run() {
        LocalDate today = IssueCalendar.today();
        for (Project project : projectMapper.listForSnapshot(today)) {
            try {
                notifyProject(project, today);
            } catch (RuntimeException e) {
                log.error("发送逾期通知失败：项目 {}", project.getId(), e);
            }
        }
    }

    public void notifyProject(Project project, LocalDate today) {
        Map<Long, List<Task>> overdueByUser = taskMapper.listByProject(project.getId()).stream()
                .filter(t -> t.getAssigneeId() != null)
                .filter(t -> WorkdayCalendar.overdueDays(
                                t.getDueDate(), today, TaskStatus.DONE.name().equals(t.getStatus()))
                        > 0)
                .collect(Collectors.groupingBy(Task::getAssigneeId, LinkedHashMap::new, Collectors.toList()));
        overdueByUser.forEach((userId, tasks) -> {
            if (notificationService.sentToday(userId, project.getId(), NotificationService.DELAY)) {
                return;
            }
            String titles = tasks.stream()
                    .limit(SHOWN_TITLES)
                    .map(t -> "T-" + t.getTaskNo() + " " + t.getTitle())
                    .collect(Collectors.joining("、"));
            String more = tasks.size() > SHOWN_TITLES ? " 等" + tasks.size() + "个任务" : "";
            notificationService.send(
                    userId,
                    project.getId(),
                    NotificationService.DELAY,
                    "你有 " + tasks.size() + " 个任务已逾期",
                    "「" + project.getName() + "」：" + titles + more,
                    "/board");
        });
    }
}
