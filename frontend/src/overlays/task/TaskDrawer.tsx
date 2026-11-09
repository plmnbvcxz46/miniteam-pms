import { useEffect, useId, useState, type FormEvent } from "react";
import { useAccess } from "../../state/access/useAccess";
import { workloadApi } from "../../api/task";
import Drawer from "../../components/Drawer";
import { useIssue } from "../../state/issue/useIssue";
import { getPredecessorOptions } from "../../state/task/utils";
import type {
  AssigneeCandidate,
  TaskDetail,
  TaskFormValues,
} from "../../types/task";
import AssigneePicker from "./AssigneePicker";

interface TaskDrawerProps {
  /** 为空是新建，否则编辑这个任务 */
  taskId: number | null;
  tasks: Record<number, TaskDetail>;
  onClose: () => void;
  /** 保存失败时抛错，message 显示在表单里 */
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

export default function TaskDrawer({
  taskId,
  tasks,
  onClose,
  onSubmit,
}: TaskDrawerProps) {
  const task = taskId === null ? null : tasks[taskId];
  const assigneeLabelId = useId();
  const { currentProject } = useAccess();
  const { today } = useIssue();
  const projectId = currentProject?.id ?? null;

  // 候选人只来自当前项目成员，负载取 workload 的 loadHours（未完成任务预估工时之和）
  const [candidates, setCandidates] = useState<AssigneeCandidate[]>([]);
  useEffect(() => {
    if (projectId === null) return;
    let alive = true;
    workloadApi
      .get(projectId)
      .then(
        (data) =>
          alive &&
          setCandidates(
            data.members.map((item) => ({
              user: item.user,
              skillTags: item.skillTags ?? [],
              load: item.loadHours,
              capacity: item.capacity,
            })),
          ),
      )
      // 取不到负载时选择器是空的，提交时由接口校验负责人；这里不打断填表
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [projectId]);

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
  const [titleError, setTitleError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const togglePredecessor = (id: number) => {
    setPredecessorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError("填写任务名称后才能保存");
      return;
    }
    if (title.trim().length > 128) {
      setTitleError("任务名称不能超过 128 个字");
      return;
    }
    const days = parseInt(planDays, 10);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      setSubmitError("做几个工作日要填 1 到 365 的整数");
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
        planDays: days,
        predecessorIds,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "保存失败，请稍后再试");
      setSubmitting(false);
    }
  };

  return (
    <Drawer className="ov fx" labelledBy="fx-title" onClose={onClose}>
      <div className="fx-head">
        <h2 className="fx-title t-overlay-title" id="fx-title">
          {task ? "编辑任务" : "新建任务"}
        </h2>
        <button className="ov-close" type="button" onClick={onClose}>
          关闭<span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="double">
        <i />
        <i />
      </div>
      <form className="fx-body" noValidate onSubmit={handleSubmit}>
        <div className="fr">
          <span className="lb t-label">
            任务名称<b>*</b>
          </span>
          <div>
            <input
              className="u"
              autoFocus
              value={title}
              placeholder="例如 菜单接口"
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError("");
              }}
            />
          </div>
          {titleError && <div className="err t-error">{titleError}</div>}
        </div>

        <div className="fr">
          <span className="lb t-label" id={assigneeLabelId}>
            负责人
          </span>
          <AssigneePicker
            candidates={candidates}
            value={assigneeId}
            labelId={assigneeLabelId}
            onChange={setAssigneeId}
          />
        </div>

        <div className="fr">
          <span className="lb t-label">
            排期<b>*</b>
          </span>
          <div>
            <div className="inl">
              从
              <input
                className="u n"
                type="date"
                style={{ width: "150px" }}
                value={planStart}
                onChange={(e) => setPlanStart(e.target.value)}
              />
              开始，做
              <input
                className="u n"
                inputMode="numeric"
                value={planDays}
                onChange={(e) => setPlanDays(e.target.value)}
              />
              个工作日
            </div>
          </div>
        </div>

        <div className="fr top">
          <span className="lb t-label">前置任务</span>
          <div className="chips">
            {getPredecessorOptions(tasks, task).map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={predecessorIds.includes(item.id)}
                onClick={() => togglePredecessor(item.id)}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        <div className="fr top">
          <span className="lb t-label">说明</span>
          <div>
            <textarea
              className="u"
              value={description}
              placeholder="验收标准、注意事项"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {submitError && (
          <div className="err t-error" role="alert">
            {submitError}
          </div>
        )}

        <div className="fx-acts">
          <button className="btn primary" type="submit" disabled={submitting}>
            {task ? "保存" : "创建任务"}
          </button>
          <button className="btn" type="button" onClick={onClose}>
            取消
          </button>
        </div>
      </form>
    </Drawer>
  );
}
