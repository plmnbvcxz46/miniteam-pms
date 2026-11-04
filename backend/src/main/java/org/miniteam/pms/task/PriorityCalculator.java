package org.miniteam.pms.task;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 任务优先级评分（开题报告 4. 算法设计，式 3.1 到 3.3），已完成的任务不参与：
 * 时间紧迫度 u = 预估工期 / 剩余天数，已到期或逾期取 1，没有截止日取 0，超过 1 按 1；
 * 阻塞影响度 b = 被依赖的未完成任务数 + α × 关键路径指示，再除以所有未完成任务里最大的值；
 * 综合得分 S = (w1·重要度 + w2·紧急度 + w3·u + w4·b) / (w1+w2+w3+w4) × 100，重要度和紧急度 1 到 5 映射到 0 到 1。
 * 和前端 pages/board/priority.ts 的算法一致。
 */
public final class PriorityCalculator {

    private PriorityCalculator() {}

    /** 评分用的系统参数 */
    public record Config(double importance, double urgency, double time, double block, double alpha) {

        public static final Config DEFAULT = new Config(0.3, 0.3, 0.25, 0.15, 0.5);

        /** 从系统参数（key → 字符串）读，缺了或不是数字时用种子里的默认值 */
        public static Config from(Map<String, String> values) {
            return new Config(
                    read(values, "priority.weight.importance", DEFAULT.importance),
                    read(values, "priority.weight.urgency", DEFAULT.urgency),
                    read(values, "priority.weight.time", DEFAULT.time),
                    read(values, "priority.weight.block", DEFAULT.block),
                    read(values, "priority.alpha", DEFAULT.alpha));
        }

        private static double read(Map<String, String> values, String key, double fallback) {
            String raw = values.get(key);
            if (raw == null || raw.isBlank()) {
                return fallback;
            }
            try {
                double v = Double.parseDouble(raw.trim());
                return Double.isFinite(v) ? v : fallback;
            } catch (NumberFormatException e) {
                return fallback;
            }
        }
    }

    /** 一个任务参与评分的字段；openSuccessors 是未完成的后续任务数 */
    public record Input(
            long id,
            boolean done,
            int importance,
            int urgency,
            int planDays,
            LocalDate dueDate,
            int openSuccessors,
            boolean critical) {}

    public record Priority(String label, int score) {}

    public static String label(int score) {
        if (score >= 70) return "高";
        if (score >= 40) return "中";
        return "低";
    }

    private static double clamp01(double n) {
        return Math.min(1, Math.max(0, n));
    }

    /** 已完成的任务没有得分，也不出现在结果里 */
    public static Map<Long, Priority> calculate(List<Input> tasks, LocalDate today, Config config) {
        List<Input> open = tasks.stream().filter(t -> !t.done()).toList();
        double maxBlock = 0;
        for (Input t : open) {
            maxBlock = Math.max(maxBlock, rawBlock(t, config));
        }
        double weightSum = config.importance() + config.urgency() + config.time() + config.block();

        Map<Long, Priority> result = new HashMap<>();
        for (Input t : open) {
            double u;
            if (t.dueDate() == null) {
                u = 0;
            } else {
                long remaining = ChronoUnit.DAYS.between(today, t.dueDate());
                u = remaining <= 0 ? 1 : clamp01((double) t.planDays() / remaining);
            }
            double b = maxBlock > 0 ? clamp01(rawBlock(t, config) / maxBlock) : 0;
            double weighted = config.importance() * clamp01((t.importance() - 1) / 4.0)
                    + config.urgency() * clamp01((t.urgency() - 1) / 4.0)
                    + config.time() * u
                    + config.block() * b;
            int score = weightSum > 0 ? (int) Math.round(weighted / weightSum * 100) : 0;
            result.put(t.id(), new Priority(label(score), score));
        }
        return result;
    }

    private static double rawBlock(Input t, Config config) {
        return t.openSuccessors() + (t.critical() ? config.alpha() : 0);
    }
}
