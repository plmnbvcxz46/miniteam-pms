import { createPortal } from "react-dom";
import { Button } from "../../../components/ui/Button";
import { useBoardPage } from "../hooks/useBoardPage";
import BlockedBy from "./BlockedBy";
import BoardColumn from "./BoardColumn";
import BoardHeader from "./BoardHeader";
import styles from "./BoardPage.module.css";
import TaskCard from "./TaskCard";

export default function BoardPage() {
  const b = useBoardPage();

  return (
    <section className={styles.page} id="view-board" data-view="board">
      <BoardHeader
        kicker={b.kicker}
        filter={b.filter}
        onChangeFilter={b.setFilter}
        onCreateTask={b.handleCreateTask}
      />

      <div className={styles.scrollX}>
        <div className={styles.board} id="board">
          {b.columns.map(({ status, tasks }) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={tasks}
              today={b.today}
              isPast={b.isPast}
              activityMap={b.activityMap}
              drag={b.drag}
              isDimmed={b.isDimmed}
              canMove={b.canMove}
              freshTaskId={b.freshTaskId}
              onPressCard={b.handlePress}
              onOpenTask={b.handleOpenTask}
              head={
                b.handleCreateTask &&
                status === "TODO" && (
                  <div className={styles.headSlot}>
                    <Button
                      variant="dashed"
                      size="md"
                      fullWidth
                      onClick={b.handleCreateTask}
                    >
                      + 新建任务
                    </Button>
                  </div>
                )
              }
            >
              {status === "BLOCKED" && (
                <BlockedBy
                  tasks={b.blockedTasks}
                  onOpenTask={b.handleOpenTask}
                />
              )}
            </BoardColumn>
          ))}
        </div>
      </div>

      {b.drag &&
        createPortal(
          <TaskCard
            task={b.taskMap[b.drag.taskId]}
            today={b.today}
            activities={b.activityMap[b.drag.taskId]}
            lifted
            floating
            style={{
              left: b.drag.left,
              top: b.drag.top,
              width: b.drag.width,
            }}
          />,
          document.body,
        )}
    </section>
  );
}
