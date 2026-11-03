import { useId, useState, type FormEvent } from "react";
import Drawer from "../../components/Drawer";
import { workload } from "../../data/reports";
import { systemUsers } from "../../data/settings";
import { milestones, taskTodayDate } from "../../data/task";
import { getPredecessorOptions } from "../../pages/board/utils";
import type {
  AssigneeCandidate,
  TaskDetail,
  TaskFormValues,
} from "../../types/task";
import AssigneePicker from "./AssigneePicker";

/**
 * 候选人只来自当前项目成员，负载取 workload 的 loadHours（未完成任务预估工时之和）。
 * Member 里没有技能标签，暂时按用户 id 从用户资料里取
 */
const assigneeCandidates: AssigneeCandidate[] = workload.members.map(
  (item) => ({
    user: item.user,
    skillTags: systemUsers.find((u) => u.id === item.user.id)?.skillTags ?? [],
    load: item.loadHours,
    capacity: item.capacity,
  }),
);
const milestoneOptions = Object.values(milestones);

interface TaskDrawerProps {
  /** 为空是新建，否则编辑这个任务 */
  taskId: number | null;
  tasks: Record<number, TaskDetail>;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
}

export default function TaskDrawer({
  taskId,
  tasks,
  onClose,
  onSubmit,
}: TaskDrawerProps) {
  const task = taskId === null ? null : tasks[taskId];
  const assigneeLabelId = useId();

  const [title, setTitle] = useState(task?.title ?? "");
  const [milestoneId, setMilestoneId] = useState<number | null>(
    task ? task.milestoneId : null,
  );
  const [assigneeId, setAssigneeId] = useState<number | null>(
    task?.assignee?.id ?? null,
  );
  const [planStart, setPlanStart] = useState(task?.planStart ?? taskTodayDate);
  const [planDays, setPlanDays] = useState(String(task?.planDays ?? 2));
  const [predecessorIds, setPredecessorIds] = useState<number[]>(
    task?.predecessors.map((dep) => dep.task.id) ?? [],
  );
  const [description, setDescription] = useState(task?.description ?? "");
  const [titleError, setTitleError] = useState("");

  const togglePredecessor = (id: number) => {
    setPredecessorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError("填写任务名称后才能保存");
      return;
    }
    onSubmit({
      title: title.trim(),
      description: description.trim() || "还没有说明。",
      milestoneId,
      assigneeId,
      planStart: planStart || taskTodayDate,
      planDays: Math.max(1, parseInt(planDays, 10) || 1),
      predecessorIds,
    });
  };

  return (
    <Drawer className="ov fx" labelledBy="fx-title" onClose={onClose}>
      <div className="fx-head">
        <h2 className="fx-title" id="fx-title">
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
          <span className="lb">
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
          {titleError && <div className="err">{titleError}</div>}
        </div>

        <div className="fr">
          <span className="lb">所属阶段</span>
          <div className="chips">
            {milestoneOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === milestoneId}
                onClick={() =>
                  setMilestoneId(item.id === milestoneId ? null : item.id)
                }
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="fr">
          <span className="lb" id={assigneeLabelId}>
            负责人
          </span>
          <AssigneePicker
            candidates={assigneeCandidates}
            value={assigneeId}
            labelId={assigneeLabelId}
            onChange={setAssigneeId}
          />
        </div>

        <div className="fr">
          <span className="lb">
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
          <span className="lb">前置任务</span>
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
          <span className="lb">说明</span>
          <div>
            <textarea
              className="u"
              value={description}
              placeholder="验收标准、注意事项"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="fx-acts">
          <button className="btn primary" type="submit">
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
