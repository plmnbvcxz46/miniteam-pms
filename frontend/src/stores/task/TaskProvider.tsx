import { useEffect, useMemo, useState, type ReactNode } from "react";
import { activityApi } from "../../services/projects";
import { taskApi } from "../../services/task";
import type { Activity } from "../../shared/types/global";
import type { TaskDetail } from "../../shared/types/task";
import { useAccess } from "../access/useAccess";
import { useDocumentStore } from "../document/documentStore";
import { useIssue } from "../issue/useIssue";
import { ProviderError } from "../ProviderError";
import { TaskStoreContext, type TaskStore } from "./taskStore";
import { useTaskMutations, type LoadedTaskData } from "./useTaskMutations";

const ACTIVITY_LIMIT = 100;
const NO_TASKS: Record<number, TaskDetail> = {};
const NO_ACTIVITIES: Record<number, Activity[]> = {};

async function load(projectId: number): Promise<LoadedTaskData> {
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

export default function TaskProvider({ children }: { children: ReactNode }) {
  const { version: documentVersion } = useDocumentStore();
  const { currentProject, canEditTask, canDeleteTask, canMoveTask } = useAccess();
  const { isPast, snapshot } = useIssue();
  const projectId = currentProject?.id ?? null;

  const [loaded, setLoadedState] = useState<LoadedTaskData | null>(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [taskForm, setTaskForm] = useState<TaskStore["taskForm"]>(null);

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

  const reload = async () => {
    if (projectId === null) return;
    setLoadedState(await load(projectId));
    setVersion((n) => n + 1);
  };

  const taskMap = useMemo(
    () =>
      isPast
        ? Object.fromEntries((snapshot?.tasks ?? []).map((task) => [task.id, task]))
        : (loaded?.tasks ?? NO_TASKS),
    [loaded, isPast, snapshot],
  );

  const mutations = useTaskMutations({
    projectId,
    isPast,
    canEditTask,
    canDeleteTask,
    canMoveTask,
    loaded,
    setLoadedState,
    taskMap,
    reload,
    taskForm,
    setTaskForm,
  });

  if (error) {
    return (
      <ProviderError
        description={error}
        onRetry={() => {
          setError("");
          setAttempt((n) => n + 1);
        }}
      />
    );
  }
  if (projectId !== null && loaded === null) return null;

  return (
    <TaskStoreContext.Provider
      value={{
        taskMap,
        activityMap: loaded?.activities ?? NO_ACTIVITIES,
        version,
        reload: () => reload().catch(() => undefined),
        ...mutations,
        taskForm,
        openTaskForm: (taskId) => {
          if (canEditTask && !isPast) setTaskForm({ taskId: taskId ?? null });
        },
        closeTaskForm: () => setTaskForm(null),
      }}
    >
      {children}
    </TaskStoreContext.Provider>
  );
}
