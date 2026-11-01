import { Fragment, type PointerEvent, type ReactNode } from "react";
import { taskStatusLabel } from "../../../../data/global";
import type { TaskStatus } from "../../../../types/global";
import type { TaskDetail } from "../../../../types/task";
import type { CardDrag, DropTarget } from "../../useCardDrag";
import TaskCard from "./TaskCard";

const COLUMN_CLASS: Record<TaskStatus, string> = {
  TODO: "todo",
  DOING: "doing",
  BLOCKED: "blocked",
  DONE: "done",
};

interface BoardColumnProps {
  status: TaskStatus;
  tasks: TaskDetail[];
  drag: CardDrag | null;
  isDimmed: (task: TaskDetail) => boolean;
  onPressCard: (
    e: PointerEvent<HTMLElement>,
    taskId: number,
    target: DropTarget,
  ) => void;
  onOpenTask: (taskId: number) => void;
  /** 列头下方的内容，例如“新建任务”按钮 */
  head?: ReactNode;
  /** 卡片列表下方的内容，例如“因此受阻” */
  children?: ReactNode;
}

export default function BoardColumn({
  status,
  tasks,
  drag,
  isDimmed,
  onPressCard,
  onOpenTask,
  head,
  children,
}: BoardColumnProps) {
  const visible = tasks.filter((task) => task.id !== drag?.taskId);
  const placeholderIndex =
    drag?.target.status === status ? drag.target.index : -1;
  const placeholder = drag && (
    <div className="ph" style={{ height: drag.height }} />
  );

  return (
    <div className={`col ${COLUMN_CLASS[status]}`}>
      <header>
        <div>
          <span className="k">// {status}</span>
          <h3>{taskStatusLabel[status]}</h3>
        </div>
        <span className="count">{tasks.length}</span>
      </header>
      {head}
      <div className="drop" data-status={status}>
        {visible.map((task, index) => (
          <Fragment key={task.id}>
            {index === placeholderIndex && placeholder}
            <TaskCard
              task={task}
              className={isDimmed(task) ? "dimmed" : ""}
              onPointerDown={(e) => onPressCard(e, task.id, { status, index })}
              onClick={() => onOpenTask(task.id)}
            />
          </Fragment>
        ))}
        {placeholderIndex >= visible.length && placeholder}
      </div>
      {children}
    </div>
  );
}
