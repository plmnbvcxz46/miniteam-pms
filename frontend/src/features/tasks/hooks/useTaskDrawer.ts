import { useEffect, useState, type FormEvent } from "react";
import { workloadApi } from "../../../services/task";
import type {
  AssigneeCandidate,
  TaskDetail,
  TaskFormValues,
} from "../../../shared/types/task";
import { useAccess } from "../../../stores/access/useAccess";
import { useIssue } from "../../../stores/issue/useIssue";
import { getPredecessorOptions } from "../../../stores/task/utils";

interface UseTaskDrawerParams {
  taskId: number | null;
  tasks: Record<number, TaskDetail>;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

function useWorkloadCandidates(projectId: number | null): AssigneeCandidate[] {
  const [candidates, setCandidates] = useState<AssigneeCandidate[]>([]);
  useEffect(() => {
    if (projectId === null) return;
    let alive = true;
    workloadApi
      .get(projectId)
      .then((data) => {
        if (!alive) return;
        setCandidates(
          data.members.map((item) => ({
            user: item.user,
            skillTags: item.skillTags ?? [],
            load: item.loadHours,
            capacity: item.capacity,
          })),
        );
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [projectId]);
  return candidates;
}

function validateTaskForm(input: {
  title: string;
  planDays: string;
}): { title: string; schedule: string } {
  const trimmedTitle = input.title.trim();
  let title = "";
  if (!trimmedTitle) title = "填写任务名称后才能保存";
  else if (trimmedTitle.length > 128) title = "任务名称不能超过 128 个字";

  const days = parseInt(input.planDays, 10);
  const schedule =
    !Number.isInteger(days) || days < 1 || days > 365
      ? "做几个工作日要填 1 到 365 的整数"
      : "";

  return { title, schedule };
}

export function useTaskDrawer({
  taskId,
  tasks,
  onSubmit,
}: UseTaskDrawerParams) {
  const task = taskId === null ? null : tasks[taskId];
  const { currentProject } = useAccess();
  const { today } = useIssue();
  const candidates = useWorkloadCandidates(currentProject?.id ?? null);

  const [title, setTitle] = useState(task?.title ?? "");
  const [assigneeId, setAssigneeId] = useState<number | null>(
    task?.assignee?.id ?? null,
  );
  const [planStart, setPlanStart] = useState(task?.planStart ?? today);
  const [planDays, setPlanDays] = useState(String(task?.planDays ?? 2));
  const [predecessorIds, setPredecessorIds] = useState<number[]>(
    task?.predecessors.map((dep) => dep.task.id) ?? [],
  );
  const [description, setDescription] = useState(task?.description ?? "");
  const [errors, setErrors] = useState({ title: "", schedule: "" });
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validateTaskForm({ title, planDays });
    if (nextErrors.title || nextErrors.schedule) {
      setErrors(nextErrors);
      return;
    }

    setSubmitError("");
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        assigneeId,
        planStart: planStart || today,
        planDays: parseInt(planDays, 10),
        predecessorIds,
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "保存失败，请稍后再试",
      );
      setSubmitting(false);
    }
  };

  return {
    isEdit: Boolean(task),
    candidates,
    predecessorOptions: getPredecessorOptions(tasks, task),
    title,
    assigneeId,
    planStart,
    planDays,
    predecessorIds,
    description,
    titleError: errors.title,
    scheduleError: errors.schedule,
    submitError,
    submitting,
    handleTitleChange: (next: string) => {
      setTitle(next);
      setErrors((prev) => ({ ...prev, title: "" }));
    },
    setAssigneeId,
    handlePlanStartChange: (next: string) => {
      setPlanStart(next);
      setErrors((prev) => ({ ...prev, schedule: "" }));
    },
    handlePlanDaysChange: (next: string) => {
      setPlanDays(next);
      setErrors((prev) => ({ ...prev, schedule: "" }));
    },
    setPredecessorIds,
    setDescription,
    handleSubmit,
  };
}
