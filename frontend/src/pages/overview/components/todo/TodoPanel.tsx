import { taskStatusKey } from "../../../../constants/task";
import { pad2 } from "../../../../utils/date";
import type { TodoRow } from "../../utils";

/** 面板最多放几行，超出的并成“还有 N 项” */
const MAX_ROWS = 4;

interface TodoPanelProps {
  /** 接口给的前几项（按优先级得分排好） */
  items: TodoRow[];
  /** 待办总数 */
  total: number;
  onOpenTask: (taskId: number) => void;
}

export default function TodoPanel({ items, total, onOpenTask }: TodoPanelProps) {
  const overflow = total > MAX_ROWS;
  const shown = items.slice(0, overflow ? MAX_ROWS - 1 : MAX_ROWS);

  return (
    <section className="pnl todo-list">
      <div className="phd">
        <div>
          <span className="k t-kicker">// TODAY</span>
          <h2 className="t-section-title">今日待办</h2>
        </div>
        <span className="n">{pad2(total)}</span>
      </div>
      <div className="todo">
        {shown.map(({ id, title, status, tag, tone }) => (
          <div key={id} className="item" onClick={() => onOpenTask(id)}>
            <i className={`key ${status ? taskStatusKey[status] : ""}`} />
            <b>{title}</b>
            <small className={tone}>{tag}</small>
          </div>
        ))}
        {overflow && (
          <div className="item more">
            <b>还有 {total - shown.length} 项…</b>
          </div>
        )}
        {total === 0 && (
          <div className="item more">
            <b>今日无待办任务</b>
          </div>
        )}
      </div>
    </section>
  );
}
