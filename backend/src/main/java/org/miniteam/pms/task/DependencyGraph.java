package org.miniteam.pms.task;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** 依赖图的成环检查。next 是 前置任务 id → 它的后续任务 id 列表。 */
public final class DependencyGraph {

    private DependencyGraph() {}

    /** 从 from 顺着后续任务能不能走到 to（from 等于 to 也算） */
    public static boolean reaches(Map<Long, List<Long>> next, long from, long to) {
        Set<Long> seen = new HashSet<>();
        Deque<Long> stack = new ArrayDeque<>();
        stack.push(from);
        while (!stack.isEmpty()) {
            long current = stack.pop();
            if (current == to) {
                return true;
            }
            if (seen.add(current)) {
                next.getOrDefault(current, List.of()).forEach(stack::push);
            }
        }
        return false;
    }
}
