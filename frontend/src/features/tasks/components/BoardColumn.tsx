import { Fragment, type PointerEvent, type ReactNode } from "react";
import { taskStatusLabel } from "../../../shared/constants/task";
import type { Activity, TaskStatus } from "../../../shared/types/global";
import type { TaskDetail } from "../../../shared/types/task";
import type { CardDrag, DropTarget } from "../hooks/useCardDrag";
import styles from "./BoardColumn.module.css";
import TaskCard from "./TaskCard";

interface BoardColumnProps {
  status: TaskStatus;
  tasks: TaskDetail[];
  today: string;
  isPast: boolean;
  activityMap: Record<number, Activity[]>;
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
  today,
  isPast,
  activityMap,
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
    <div className={styles.placeholder} style={{ height: drag.height }} />
  );

  return (
    <section className={styles.column} data-status={status}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.kicker}>// {status}</span>
          <h3 className={styles.title}>{taskStatusLabel[status]}</h3>
        </div>
        <span className={styles.count}>{tasks.length}</span>
      </header>
      {head}
      <div className={styles.drop} data-drop-zone="true" data-status={status}>
        {visible.map((task, index) => {
          const locked = isPast || !canMove(task);
          return (
            <Fragment key={task.id}>
              {index === placeholderIndex && placeholder}
              <TaskCard
                task={task}
                today={today}
                activities={activityMap[task.id]}
                dimmed={isDimmed(task)}
                fresh={task.id === freshTaskId}
                locked={locked}
                boardDragging={drag !== null}
                onPointerDown={
                  !locked
                    ? (e) => onPressCard(e, task.id, { status, index })
                    : undefined
                }
                onClick={() => onOpenTask(task.id)}
              />
            </Fragment>
          );
        })}
        {placeholderIndex >= visible.length && placeholder}
      </div>
      {children}
    </section>
  );
}
