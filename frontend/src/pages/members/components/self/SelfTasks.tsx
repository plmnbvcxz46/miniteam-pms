import { Link } from "react-router-dom";
import { taskStatusLabel, taskStatusOrder } from "../../../../data/global";
import { taskStatusKey } from "../../../../data/task";
import type { TaskStatus } from "../../../../types/global";
import type { TaskDetail } from "../../../../types/task";
import { formatMonthDay } from "../../../../utils/date";

interface SelfTasksProps {
  /** 我负责的所有任务 */
  tasks: TaskDetail[];
}

/** 未完成的任务：逾期最久的在前，其次关键路径上的，再按截止日 */
function sortOpenTasks(tasks: TaskDetail[]): TaskDetail[] {
  return tasks
    .filter((task) => task.status !== "DONE")
    .sort(
      (a, b) =>
        b.overdueDays - a.overdueDays ||
        Number(b.critical) - Number(a.critical) ||
        (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"),
    );
}

export default function SelfTasks({ tasks }: SelfTasksProps) {
  const counts = Object.fromEntries(
    taskStatusOrder.map((status) => [
      status,
      tasks.filter((task) => task.status === status).length,
    ]),
  ) as Record<TaskStatus, number>;
  const openTasks = sortOpenTasks(tasks);

  return (
    <section className="pnl span2 me-tasks" aria-labelledby="me-task-h">
      <div className="phd">
        <div>
          <span className="k">// TASKS</span>
          <h2 id="me-task-h">我负责的任务</h2>
        </div>
        <span className="n">{tasks.length}</span>
      </div>
      <ul className="me-stat" aria-label="按状态统计">
        {taskStatusOrder.map((status) => (
          <li key={status} className={counts[status] === 0 ? "zero" : undefined}>
            <span>
              <i className={`key ${taskStatusKey[status]}`} aria-hidden="true" />
              {taskStatusLabel[status]}
            </span>
            <b>{counts[status]}</b>
          </li>
        ))}
      </ul>
      {openTasks.length > 0 ? (
        <ul className="me-list" aria-label="未完成的任务">
          {openTasks.map((task) => (
            <li key={task.id}>
              <Link
                className={`me-task${task.overdueDays > 0 ? " late" : ""}`}
                to={`/board/task?id=${task.id}`}
              >
                <span className="no">T-{task.taskNo}</span>
                <span className="st">
                  <i
                    className={`key ${taskStatusKey[task.status]}`}
                    aria-hidden="true"
                  />
                  {taskStatusLabel[task.status]}
                </span>
                <span className="tt">{task.title}</span>
                {task.critical && <span className="chip">关键</span>}
                <span className="due">
                  {task.overdueDays > 0
                    ? `逾期 ${task.overdueDays} 天`
                    : task.dueDate
                      ? formatMonthDay(task.dueDate)
                      : "—"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="me-empty">
          {tasks.length === 0 ? "没有负责的任务" : "任务已全部完成"}
        </div>
      )}
    </section>
  );
}
