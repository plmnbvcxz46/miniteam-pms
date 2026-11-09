package org.miniteam.pms.task.service;

import java.time.LocalDate;
import org.miniteam.pms.project.IssueCalendar;
import org.miniteam.pms.project.entity.Project;
import org.miniteam.pms.project.mapper.ProjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * 每天零点 5 分（零点的往期快照存完之后），把所有还在进行的项目里到了计划开始日的任务自动开始，
 * 见 {@link TaskService#autoStart}。启动时也补跑一次，排在补存快照之后。
 */
@Service
public class TaskAutoStartJob {

    private static final Logger log = LoggerFactory.getLogger(TaskAutoStartJob.class);

    private final ProjectMapper projectMapper;
    private final TaskService taskService;

    public TaskAutoStartJob(ProjectMapper projectMapper, TaskService taskService) {
        this.projectMapper = projectMapper;
        this.taskService = taskService;
    }

    @Scheduled(cron = "0 5 0 * * *", zone = "Asia/Shanghai")
    public void run() {
        LocalDate today = IssueCalendar.today();
        for (Project project : projectMapper.listForSnapshot(today)) {
            try {
                int n = taskService.autoStart(project.getId(), today);
                if (n > 0) {
                    log.info("项目 {} 自动开始了 {} 个任务", project.getId(), n);
                }
            } catch (RuntimeException e) {
                log.error("任务自动开始失败：项目 {}", project.getId(), e);
            }
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    @Order(2)
    public void catchUp() {
        try {
            run();
        } catch (RuntimeException e) {
            log.error("启动时补跑任务自动开始失败", e);
        }
    }
}
