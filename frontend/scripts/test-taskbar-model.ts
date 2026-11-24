import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildTaskBar } from "../src/components/patterns/TaskBar/taskBarModel.ts";
import type { Activity } from "../src/shared/types/global.ts";
import { dayEnd, toDay } from "../src/shared/utils/date.ts";

const TODAY = "2026-11-10";

describe("buildTaskBar", () => {
  it("1. DOING 正常进行：绘制计划框与实心 ink 已用段至今天 24:00", () => {
    const model = buildTaskBar(
      {
        status: "DOING",
        planStart: "2026-11-05",
        dueDate: "2026-11-15",
        actualStart: "2026-11-05",
        actualEnd: null,
      },
      [],
      TODAY,
    );
    assert.ok(model);
    assert.equal(model.frames.length, 1);
    assert.deepEqual(model.fills, [
      { from: toDay("2026-11-05"), to: dayEnd(TODAY), kind: "ink" },
    ]);
    assert.equal(model.unused, null);
    assert.equal(model.done, null);
  });

  it("2. BLOCKED 带系统自动阻塞动态：warn 斜纹从 actualStart 起算而非补跑日志日期", () => {
    const activities: Activity[] = [
      {
        id: 1,
        targetType: "TASK",
        targetId: 10,
        action: "STATUS",
        detail: "到了计划开始日，前置任务还没完成，任务自动移到阻塞",
        user: null,
        createdAt: "2026-11-08 09:30:00",
      },
    ];
    const model = buildTaskBar(
      {
        status: "BLOCKED",
        planStart: "2026-11-04",
        dueDate: "2026-11-14",
        actualStart: "2026-11-06",
        actualEnd: null,
      },
      activities,
      TODAY,
    );
    assert.ok(model);
    assert.deepEqual(model.fills, [
      { from: toDay("2026-11-04"), to: dayEnd(TODAY), kind: "ink" },
      { from: toDay("2026-11-06"), to: dayEnd(TODAY), kind: "warn" },
    ]);
  });

  it("3. BLOCKED 但缺少 STATUS 动态：兜底从 planStart 起绘制阻塞 warn 斜纹与逾期尾段", () => {
    const model = buildTaskBar(
      {
        status: "BLOCKED",
        planStart: "2026-11-03",
        dueDate: "2026-11-08",
        actualStart: "2026-11-03",
        actualEnd: null,
      },
      [],
      TODAY,
    );
    assert.ok(model);
    assert.equal(model.frames.length, 2);
    assert.deepEqual(model.frames[1], {
      from: dayEnd("2026-11-08"),
      to: dayEnd(TODAY),
      dashed: false,
      tail: true,
    });
    assert.deepEqual(model.fills, [
      { from: toDay("2026-11-03"), to: dayEnd("2026-11-08"), kind: "ink" },
      { from: toDay("2026-11-03"), to: dayEnd("2026-11-08"), kind: "warn" },
      { from: dayEnd("2026-11-08"), to: dayEnd(TODAY), kind: "warn" },
    ]);
  });

  it("4. TODO 已到计划开始日：存在未完成前置时兜底画 warn 斜纹，前置全部 DONE 时保持空白", () => {
    const blockedTodo = buildTaskBar(
      {
        status: "TODO",
        planStart: "2026-11-06",
        dueDate: "2026-11-12",
        actualStart: null,
        actualEnd: null,
        predecessors: [{ status: "DOING" }],
      },
      [],
      TODAY,
    );
    assert.ok(blockedTodo);
    assert.deepEqual(blockedTodo.fills, [
      { from: toDay("2026-11-06"), to: dayEnd(TODAY), kind: "warn" },
    ]);

    const readyTodo = buildTaskBar(
      {
        status: "TODO",
        planStart: "2026-11-06",
        dueDate: "2026-11-12",
        actualStart: null,
        actualEnd: null,
        predecessors: [{ status: "DONE" }],
      },
      [],
      TODAY,
    );
    assert.ok(readyTodo);
    assert.deepEqual(readyTodo.fills, []);
  });

  it("5. DONE 场景：逾期完成画虚线尾框与 past 斜纹，提前完成生成 unused 剩余段", () => {
    const overdueDone = buildTaskBar(
      {
        status: "DONE",
        planStart: "2026-11-01",
        dueDate: "2026-11-05",
        actualStart: "2026-11-01",
        actualEnd: "2026-11-08",
      },
      [],
      TODAY,
    );
    assert.ok(overdueDone);
    assert.equal(overdueDone.frames.length, 2);
    assert.deepEqual(overdueDone.frames[1], {
      from: dayEnd("2026-11-05"),
      to: dayEnd("2026-11-08"),
      dashed: true,
      tail: true,
    });
    assert.deepEqual(overdueDone.fills, [
      { from: dayEnd("2026-11-05"), to: dayEnd("2026-11-08"), kind: "past" },
    ]);

    const earlyDone = buildTaskBar(
      {
        status: "DONE",
        planStart: "2026-11-01",
        dueDate: "2026-11-09",
        actualStart: "2026-11-01",
        actualEnd: "2026-11-06",
      },
      [],
      TODAY,
    );
    assert.ok(earlyDone);
    assert.deepEqual(earlyDone.unused, {
      from: dayEnd("2026-11-06"),
      to: dayEnd("2026-11-09"),
    });
    assert.equal(earlyDone.done?.date, "2026-11-06");
  });
});
