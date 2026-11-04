package org.miniteam.pms.task.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import lombok.Getter;

/**
 * 修改任务，没传的字段不变。负责人、计划开始、截止日期这三项可以清空，所以要区分“没传”和“传了 null”：
 * 传了 null 就是清空。改了计划开始或工期、又没传截止日期时，截止日期按工作日重新算。
 */
@Getter
public class TaskUpdate {

    @Size(min = 1, max = 128, message = "任务标题为 1 到 128 个字")
    private String title;

    @Size(max = 2000, message = "描述不能超过 2000 个字")
    private String description;

    private Long assigneeId;
    private boolean assigneeIdSet;

    @Min(value = 1, message = "重要度为 1 到 5")
    @Max(value = 5, message = "重要度为 1 到 5")
    private Integer importance;

    @Min(value = 1, message = "紧急度为 1 到 5")
    @Max(value = 5, message = "紧急度为 1 到 5")
    private Integer urgency;

    @Min(value = 1, message = "计划工期至少 1 天")
    @Max(value = 365, message = "计划工期不能超过 365 天")
    private Integer planDays;

    @DecimalMin(value = "0", message = "预估工时不能为负")
    @DecimalMax(value = "9999", message = "预估工时过大")
    private Double estHours;

    @Size(max = 20, message = "所需技能最多 20 个")
    private List<@Size(max = 32, message = "技能标签不能超过 32 个字") String> requiredSkills;

    private LocalDate planStart;
    private boolean planStartSet;
    private LocalDate dueDate;
    private boolean dueDateSet;
    private Long parentId;
    private boolean parentIdSet;

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
        this.assigneeIdSet = true;
    }

    public void setImportance(Integer importance) {
        this.importance = importance;
    }

    public void setUrgency(Integer urgency) {
        this.urgency = urgency;
    }

    public void setPlanDays(Integer planDays) {
        this.planDays = planDays;
    }

    public void setEstHours(Double estHours) {
        this.estHours = estHours;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public void setPlanStart(LocalDate planStart) {
        this.planStart = planStart;
        this.planStartSet = true;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
        this.dueDateSet = true;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
        this.parentIdSet = true;
    }

    @JsonIgnore
    public boolean isAssigneeIdSet() {
        return assigneeIdSet;
    }

    @JsonIgnore
    public boolean isPlanStartSet() {
        return planStartSet;
    }

    @JsonIgnore
    public boolean isDueDateSet() {
        return dueDateSet;
    }

    @JsonIgnore
    public boolean isParentIdSet() {
        return parentIdSet;
    }
}
