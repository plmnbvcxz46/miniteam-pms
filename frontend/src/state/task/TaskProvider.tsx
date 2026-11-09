import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAccess } from "../access/useAccess";
import { activityApi } from "../../api/project";
import { taskApi } from "../../api/task";
import { useIssue } from "../issue/useIssue";
import type { Activity, TaskStatus } from "../../shared/types/global";
import type { TaskDetail, TaskFormValues } from "../../shared/types/task";
import { getLocalToday } from "../../shared/utils/date";
import { useDocumentStore } from "../document/documentStore";
import { TaskStoreContext, type TaskStore } from "./taskStore";
import { moveTaskTo } from "./utils";

/** 新建任务在看板上高亮的时长 */
const FRESH_MS = 2400;
/** 任务操作记录一次取多少条（接口单次上限），时间线用它推算阻塞区间 */
const ACTIVITY_LIMIT = 100;
const NO_TASKS: Record<number, TaskDetail> = {};
const NO_ACTIVITIES: Record<number, Activity[]> = {};

/** 一个项目的任务表和操作记录，两样一起取一起换 */
interface Loaded {
  tasks: Record<number, TaskDetail>;
  activities: Record<number, Activity[]>;
}

async function load(projectId: number): Promise<Loaded> {
  const [list, logs] = await Promise.all([
    taskApi.list(projectId),
    activityApi.list(projectId, { targetType: "TASK", limit: ACTIVITY_LIMIT }),
  ]);
  const activities: Record<number, Activity[]> = {};
  for (const log of logs) {
    if (log.targetId !== null) (activities[log.targetId] ??= []).push(log);
  }
  return { tasks: Object.fromEntries(list.map((task) => [task.id, task])), activities };
}

function messageOf(e: unknown): string {
  return e instanceof Error ? e.message : "操作失败，请稍后再试";
}

/**
 * 任务数据：来自 GET /projects/{projectId}/tasks?detail=true，优先级、关键路径标记、逾期天数由后端算。
 * 按项目 id 做 key，切换项目时整个重来。第一次加载完之前不显示页面。
 * 写操作失败时 moveTask / deleteTask 返回原因，saveTaskForm 抛 ApiError（message 是写给用户看的原因）
 */
export default function TaskProvider({ children }: { children: ReactNode }) {
  // 文档有写操作（传版本、定稿）后，任务详情里的文档状态也变了，要重新取任务表
  const { version: documentVersion } = useDocumentStore();
  const { currentProject, canEditTask, canDeleteTask, canMoveTask } = useAccess();
  const { isPast, snapshot } = useIssue();
  const projectId = currentProject?.id ?? null;

  const [loaded, setLoadedState] = useState<Loaded | null>(null);
  // 任务表每换一次加一，时间线、总览、报表据此重新取各自的接口
  const [version, setVersion] = useState(0);
  const setLoaded: typeof setLoadedState = (value) => {
    setLoadedState(value);
    setVersion((n) => n + 1);
  };
  const [error, setError] = useState("");
  // 加一就重新取一遍，失败后点“重试”用
  const [attempt, setAttempt] = useState(0);
  const [taskForm, setTaskForm] = useState<TaskStore["taskForm"]>(null);
  const [freshTaskId, setFreshTaskId] = useState<number | null>(null);
  const freshTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (projectId === null) return;
    let alive = true;
    load(projectId)
      .then((data) => {
        if (!alive) return;
        setLoadedState(data);
        setVersion((n) => n + 1);
      })
      .catch((e: unknown) => alive && setError(messageOf(e)));
    return () => {
      alive = false;
    };
  }, [projectId, attempt, documentVersion]);

  /** 写操作之后重新取一遍，让页面和后端一致 */
  const reload = async () => {
    if (projectId !== null) setLoaded(await load(projectId));
  };

  // 看过去的期时用那一期快照里的任务，取到之前是空的。任务详情里的文档由后端一起返回
  const taskMap = useMemo(
    () =>
      isPast
        ? Object.fromEntries((snapshot?.tasks ?? []).map((task) => [task.id, task]))
        : (loaded?.tasks ?? NO_TASKS),
    [loaded, isPast, snapshot],
  );

  // 移动任务（乐观更新，失败回滚）。关联的文档没定稿时后端不让完成任务（409），原因原样返回。没有移动时返回原因，成功返回 null
  const moveTask = async (taskId: number, status: TaskStatus, index: number) => {
    // 页面上没权限的人看不到入口，这里再挡一道，防止别处误调用
    if (isPast) return "过去的期只能查看";
    const task = taskMap[taskId];
    if (!task || !canMoveTask(task)) return "没有权限修改这个任务的状态";
    const before = loaded;
    setLoadedState(
      (prev) =>
        prev && {
          ...prev,
          tasks: moveTaskTo(prev.tasks, taskId, status, index, getLocalToday()),
        },
    );
    try {
      await taskApi.position(taskId, status, index);
      await reload();
      return null;
    } catch (e) {
      setLoadedState(before);
      return messageOf(e);
    }
  };

  const saveTaskForm = async (values: TaskFormValues) => {
    if (isPast) throw new Error("过去的期只能查看");
    if (!canEditTask || projectId === null) throw new Error("没有编辑任务的权限");
    const editingId = taskForm?.taskId ?? null;
    try {
      if (editingId !== null) {
        const old = taskMap[editingId];
        await taskApi.update(editingId, {
          title: values.title,
          description: values.description,
          assigneeId: values.assigneeId,
          planStart: values.planStart,
          planDays: values.planDays,
        });
        const before = old.predecessors.map((dep) => dep.task.id).sort();
        const after = [...values.predecessorIds].sort();
        if (before.join() !== after.join()) {
          await taskApi.setPredecessors(editingId, values.predecessorIds);
        }
      } else {
        const created = await taskApi.create(projectId, {
          title: values.title,
          description: values.description,
          assigneeId: values.assigneeId,
          planStart: values.planStart,
          planDays: values.planDays,
          predecessorIds: values.predecessorIds,
        });
        setFreshTaskId(created.id);
        window.clearTimeout(freshTimer.current);
        freshTimer.current = window.setTimeout(() => setFreshTaskId(null), FRESH_MS);
      }
    } finally {
      // 改到一半失败（例如前置任务成环）时，已经保存的部分也要在页面上反映出来
      await reload().catch(() => undefined);
    }
    setTaskForm(null);
  };

  const deleteTask = async (taskId: number) => {
    // 页面上没权限的人看不到入口，这里再挡一道，防止别处误调用
    if (isPast) return "过去的期只能查看";
    if (!canDeleteTask) return "只有项目经理和系统管理员能删除任务";
    try {
      await taskApi.remove(taskId);
      await reload();
      return null;
    } catch (e) {
      return messageOf(e);
    }
  };

  if (error) {
    return (
      <div className="msg err" role="alert" style={{ padding: 24 }}>
        {error}
        <button
          className="btn"
          type="button"
          style={{ marginLeft: 12 }}
          onClick={() => {
            setError("");
            setAttempt((n) => n + 1);
          }}
        >
          重试
        </button>
      </div>
    );
  }
  // 没有项目时没有任务可取；有项目时第一次取回来之前先不渲染
  if (projectId !== null && loaded === null) return null;

  return (
    <TaskStoreContext.Provider
      value={{
        taskMap,
        activityMap: loaded?.activities ?? NO_ACTIVITIES,
        version,
        reload: () => reload().catch(() => undefined),
        moveTask,
        taskForm,
        openTaskForm: (taskId) => {
          if (canEditTask && !isPast) setTaskForm({ taskId: taskId ?? null });
        },
        closeTaskForm: () => setTaskForm(null),
        saveTaskForm,
        deleteTask,
        freshTaskId,
      }}
    >
      {children}
    </TaskStoreContext.Provider>
  );
}
