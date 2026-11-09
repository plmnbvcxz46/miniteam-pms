import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAccess } from "../../state/access/useAccess";
import { useMe } from "../../state/auth/useAuth";
import { taskStatusOrder } from "../../shared/constants/task";
import type { TaskDetail } from "../../shared/types/task";
import BlockedBy from "./components/BlockedBy";
import BoardColumn from "./components/BoardColumn";
import TaskCard from "./components/TaskCard";
import BoardHeader, { type BoardFilter } from "./components/BoardHeader";
import { useTaskStore } from "../../state/task/taskStore";
import { useCardDrag, type DropTarget } from "./useCardDrag";
import {
  canMoveStatus,
  getBlockedTasks,
  getColumnTasks,
  toFullIndex,
} from "../../state/task/utils";
import "./css/board.css";

export default function BoardPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useMe();
  const { canEditTask, canViewTask, canMoveTask } = useAccess();
  const { taskMap, moveTask, openTaskForm, freshTaskId } = useTaskStore();
  const [filter, setFilter] = useState<BoardFilter>("all");

  const isShown = canViewTask;
  const canMove = canMoveTask;

  const handleDrop = async (taskId: number, target: DropTarget) => {
    const index = toFullIndex(taskMap, taskId, target, isShown);
    const blocked = await moveTask(taskId, target.status, index);
    if (blocked) window.alert(blocked);
  };
  const { drag, handlePress, wasDragged } = useCardDrag(
    handleDrop,
    (taskId, status) => canMoveStatus(taskMap[taskId].status, status),
  );

  // 顶栏 kicker 统计只算看得到的任务
  const allTasks = Object.values(taskMap).filter(isShown);
  const blockedCount = allTasks.filter((task) => task.status === "BLOCKED").length;
  const criticalCount = allTasks.filter(
    (task) => task.critical && task.status !== "DONE",
  ).length;
  const kicker = `共 ${allTasks.length} 项 · ${
    blockedCount > 0 ? `${blockedCount} 项阻塞` : "没有阻塞"
  } · ${criticalCount} 项在关键路径`;

  // 筛选只把不符合的卡片调暗，不从列里移除
  const isDimmed = (task: TaskDetail) => {
    if (filter === "mine") return task.assignee?.id !== currentUser.id;
    if (filter === "crit") return !task.critical;
    return false;
  };

  const handleOpenTask = (taskId: number) => {
    if (!wasDragged()) navigate(`/board/task?id=${taskId}`);
  };

  return (
    <section className="view" id="view-board" data-view="board">
      <BoardHeader
        kicker={kicker}
        filter={filter}
        onChangeFilter={setFilter}
        onCreateTask={canEditTask ? () => openTaskForm() : undefined}
      />

      <div className="scroll-x">
        <div className="board" id="board">
          {taskStatusOrder.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={getColumnTasks(taskMap, status).filter(isShown)}
              drag={drag}
              isDimmed={isDimmed}
              canMove={canMove}
              freshTaskId={freshTaskId}
              onPressCard={handlePress}
              onOpenTask={handleOpenTask}
              head={
                canEditTask &&
                status === "TODO" && (
                  <button
                    className="addcard"
                    type="button"
                    onClick={() => openTaskForm()}
                  >
                    新建任务
                  </button>
                )
              }
            >
              {status === "BLOCKED" && (
                <BlockedBy
                  tasks={getBlockedTasks(taskMap).filter(isShown)}
                  onOpenTask={handleOpenTask}
                />
              )}
            </BoardColumn>
          ))}
        </div>
      </div>

      {drag &&
        createPortal(
          <TaskCard
            task={taskMap[drag.taskId]}
            className="lifted floating"
            style={{
              position: "fixed",
              left: drag.left,
              top: drag.top,
              width: drag.width,
            }}
          />,
          document.body,
        )}
    </section>
  );
}
