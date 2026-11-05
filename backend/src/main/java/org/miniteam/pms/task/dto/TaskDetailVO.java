package org.miniteam.pms.task.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.miniteam.pms.collab.dto.DiscussionBriefVO;
import org.miniteam.pms.document.dto.DocumentBriefVO;
import org.miniteam.pms.user.dto.UserBriefVO;

/**
 * 接口里的 TaskDetail（TaskCard 的字段加详情字段，同一层）。
 * milestone 固定为 null。
 */
public record TaskDetailVO(
        Long id,
        Integer taskNo,
        String title,
        String status,
        UserBriefVO assignee,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate dueDate,
        int progress,
        PriorityVO priority,
        boolean critical,
        int overdueDays,
        int sortOrder,
        Long parentId,
        Long milestoneId,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate actualEnd,
        Long projectId,
        String description,
        UserBriefVO creator,
        int importance,
        int urgency,
        int planDays,
        int usedDays,
        double estHours,
        List<String> requiredSkills,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate planStart,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate actualStart,
        TaskRefVO parent,
        Object milestone,
        List<DependencyTaskVO> predecessors,
        List<DependencyTaskVO> successors,
        List<TaskCardVO> subtasks,
        List<DocumentBriefVO> documents,
        List<DiscussionBriefVO> discussions,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime updatedAt) {}
