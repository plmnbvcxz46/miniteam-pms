import type { TaskDetail } from "../../../../shared/types/task";
import type { CpmResult } from "../../utils";
import CriticalRow from "./CriticalRow";

interface CriticalPanelProps {
  /** 按开始日排好的任务 */
  tasks: TaskDetail[];
  cpm: CpmResult;
}

export default function CriticalPanel({ tasks, cpm }: CriticalPanelProps) {
  return (
    <section className="pnl cpmp">
      <div className="phd">
        <div>
          <span className="k t-kicker">// CPM</span>
          <h2 className="t-section-title">关键路径计算</h2>
        </div>
        <span className="u">
          总工期 <em>{cpm.total}</em> 个工作日
        </span>
      </div>

      <div className="scroll-x">
        <table className="tbl cpm">
          <thead>
            <tr>
              <th>任务</th>
              <th>工期</th>
              <th>最早开始</th>
              <th>最早完成</th>
              <th>最迟开始</th>
              <th>最迟完成</th>
              <th>总时差</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <CriticalRow key={task.id} task={task} cpm={cpm.rows[task.id]} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
