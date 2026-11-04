package org.miniteam.pms.task;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 关键路径法（CPM）：正推最早时间，倒推最迟时间，总时差 = 最迟开始 − 最早开始，时差为 0 即在关键路径上。
 * 工期取任务的计划工期（工作日），和前端 pages/timeline/utils.ts 的 computeCpm 一致。
 * 之后的甘特图、关键路径面板、预测完工复用这个类。
 */
public final class CriticalPath {

    private CriticalPath() {}

    /** 一个节点：任务 id、计划工期、前置任务 id */
    public record Node(long id, int duration, List<Long> predecessors) {}

    /** 一行结果，从项目第 0 天算起 */
    public record Row(int es, int ef, int ls, int lf, int slack) {
        public boolean critical() {
            return slack == 0;
        }
    }

    public record Result(Map<Long, Row> rows, int total) {}

    public static Result compute(List<Node> nodes) {
        Map<Long, Node> byId = new HashMap<>();
        nodes.forEach(n -> byId.put(n.id(), n));
        // 只认还在这批任务里的前置，已删除或不在范围内的忽略
        Map<Long, List<Long>> preds = new HashMap<>();
        Map<Long, List<Long>> succs = new HashMap<>();
        for (Node n : nodes) {
            List<Long> kept =
                    n.predecessors().stream().filter(byId::containsKey).toList();
            preds.put(n.id(), kept);
            kept.forEach(p -> succs.computeIfAbsent(p, k -> new ArrayList<>()).add(n.id()));
        }

        Map<Long, Integer> es = new HashMap<>();
        for (Node n : nodes) {
            earliestStart(n.id(), byId, preds, es, new HashSet<>());
        }
        int total = 0;
        for (Node n : nodes) {
            total = Math.max(total, es.get(n.id()) + n.duration());
        }

        Map<Long, Integer> lf = new HashMap<>();
        Map<Long, Row> rows = new HashMap<>();
        for (Node n : nodes) {
            int start = es.get(n.id());
            int finish = latestFinish(n.id(), total, byId, succs, lf, new HashSet<>());
            rows.put(
                    n.id(),
                    new Row(start, start + n.duration(), finish - n.duration(), finish, finish - n.duration() - start));
        }
        return new Result(rows, total);
    }

    private static int earliestStart(
            long id, Map<Long, Node> byId, Map<Long, List<Long>> preds, Map<Long, Integer> es, Set<Long> trail) {
        Integer known = es.get(id);
        if (known != null) {
            return known;
        }
        // 依赖成环时不再往下走，避免死循环（写入时已经拒绝成环）
        if (!trail.add(id)) {
            return 0;
        }
        int start = 0;
        for (long p : preds.get(id)) {
            start = Math.max(
                    start,
                    earliestStart(p, byId, preds, es, trail) + byId.get(p).duration());
        }
        trail.remove(id);
        es.put(id, start);
        return start;
    }

    private static int latestFinish(
            long id,
            int total,
            Map<Long, Node> byId,
            Map<Long, List<Long>> succs,
            Map<Long, Integer> lf,
            Set<Long> trail) {
        Integer known = lf.get(id);
        if (known != null) {
            return known;
        }
        if (!trail.add(id)) {
            return total;
        }
        int finish = total;
        for (long s : succs.getOrDefault(id, List.of())) {
            finish = Math.min(
                    finish,
                    latestFinish(s, total, byId, succs, lf, trail) - byId.get(s).duration());
        }
        trail.remove(id);
        lf.put(id, finish);
        return finish;
    }
}
