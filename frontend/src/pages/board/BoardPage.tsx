import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { currentUser } from "../../data/global";
import type { TaskStatus } from "../../types/global";
import type { TaskDetail } from "../../types/task";
import BlockedBy from "./components/column/BlockedBy";
import BoardColumn from "./components/column/BoardColumn";
import TaskCard from "./components/column/TaskCard";
import BoardHeader, { type BoardFilter } from "./components/header/BoardHeader";
import { useTaskStore } from "./taskStore";
import { useCardDrag, type DropTarget } from "./useCardDrag";
import { getBlockedTasks, getColumnTasks } from "./utils";
import "./css/board.css";

const STATUS_ORDER: TaskStatus[] = ["TODO", "DOING", "BLOCKED", "DONE"];

export default function BoardPage() {
  const navigate = useNavigate();
  const { taskMap, moveTask, openTaskForm, freshTaskId } = useTaskStore();
  const [filter, setFilter] = useState<BoardFilter>("all");

  const handleDrop = (taskId: number, target: DropTarget) => {
    moveTask(taskId, target.status, target.index);
  };
  const { drag, handlePress, wasDragged } = useCardDrag(handleDrop);

  // 顶栏 kicker 统计
  const allTasks = Object.values(taskMap);
  const blockedCount = getColumnTasks(taskMap, "BLOCKED").length;
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
        onCreateTask={() => openTaskForm()}
      />

      <div className="scroll-x">
        <div className="board" id="board">
          {STATUS_ORDER.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={getColumnTasks(taskMap, status)}
              drag={drag}
              isDimmed={isDimmed}
              freshTaskId={freshTaskId}
              onPressCard={handlePress}
              onOpenTask={handleOpenTask}
              head={
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
                  tasks={getBlockedTasks(taskMap)}
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
