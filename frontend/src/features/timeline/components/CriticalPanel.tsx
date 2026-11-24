import { Panel } from "../../../components/patterns/Panel";
import type { TaskDetail } from "../../../shared/types/task";
import type { CpmResult } from "../utils";
import styles from "./CriticalPanel.module.css";
import CriticalRow from "./CriticalRow";

interface CriticalPanelProps {
  tasks: TaskDetail[];
  cpm: CpmResult;
}

export default function CriticalPanel({ tasks, cpm }: CriticalPanelProps) {
  return (
    <Panel
      variant="flat"
      kicker="// CPM"
      title="关键路径计算"
      className={styles.panel}
      headerRight={
        <span className={styles.total}>
          总工期 <em>{cpm.total}</em> 个工作日
        </span>
      }
    >
      <div className={styles.scrollArea}>
        <table className={styles.table}>
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
    </Panel>
  );
}
