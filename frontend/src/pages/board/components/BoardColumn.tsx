import { Fragment, type PointerEvent, type ReactNode } from "react";
import { taskStatusLabel } from "../../../shared/constants/task";
import type { TaskStatus } from "../../../shared/types/global";
import type { TaskDetail } from "../../../shared/types/task";
import type { CardDrag, DropTarget } from "../useCardDrag";
import TaskCard from "./TaskCard";

interface BoardColumnProps {
  status: TaskStatus;
  tasks: TaskDetail[];
  drag: CardDrag | null;
  isDimmed: (task: TaskDetail) => boolean;
  /** 没有权限改状态的卡片不能拖，只能点开看 */
  canMove: (task: TaskDetail) => boolean;
  freshTaskId: number | null;
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
  canMove,
  freshTaskId,
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
    // 列的样式类就是状态的小写：todo / doing / blocked / done
    <div className={`col ${status.toLowerCase()}`}>
      <header>
        <div>
          <span className="k t-kicker">// {status}</span>
          <h3 className="t-section-title">{taskStatusLabel[status]}</h3>
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
              className={`${isDimmed(task) ? "dimmed" : ""} ${task.id === freshTaskId ? "fresh" : ""} ${canMove(task) ? "" : "locked"}`.trim()}
              onPointerDown={
                canMove(task)
                  ? (e) => onPressCard(e, task.id, { status, index })
                  : undefined
              }
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
