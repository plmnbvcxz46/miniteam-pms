import { taskStatusKey } from "../../../../data/task";
import type { TodoItemData } from "../../utils";
import { pad2 } from "../../utils";

/** 面板最多放几行，超出的并成“还有 N 项” */
const MAX_ROWS = 4;

interface TodoPanelProps {
  items: TodoItemData[];
  onOpenTask: (taskId: number) => void;
}

export default function TodoPanel({ items, onOpenTask }: TodoPanelProps) {
  const overflow = items.length > MAX_ROWS;
  const shown = overflow ? items.slice(0, MAX_ROWS - 1) : items;

  return (
    <section className="pnl todo-list">
      <div className="phd">
        <div>
          <span className="k">// 今日</span>
          <h2>今日待办</h2>
        </div>
        <span className="n">{pad2(items.length)}</span>
      </div>
      <div className="todo">
        {shown.map(({ task, tag, tone }) => (
          <div
            key={task.id}
            className="item"
            onClick={() => onOpenTask(task.id)}
          >
            <i className={`key ${taskStatusKey[task.status]}`} />
            <b>{task.title}</b>
            <small className={tone}>{tag}</small>
          </div>
        ))}
        {overflow && (
          <div className="item more">
            <b>还有 {items.length - shown.length} 项…</b>
          </div>
        )}
        {items.length === 0 && (
          <div className="item more">
            <b>今天没有要盯的任务</b>
          </div>
        )}
      </div>
    </section>
  );
}
