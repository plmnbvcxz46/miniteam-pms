import type { TaskDetail } from "../../../../shared/types/task";
import type { CpmRow } from "../../utils";

interface CriticalRowProps {
  task: TaskDetail;
  cpm: CpmRow;
}

export default function CriticalRow({ task, cpm }: CriticalRowProps) {
  return (
    <tr className={cpm.slack === 0 ? "crit" : ""}>
      <td>{task.title}</td>
      <td>{task.planDays}</td>
      <td>{cpm.es}</td>
      <td>{cpm.ef}</td>
      <td>{cpm.ls}</td>
      <td>{cpm.lf}</td>
      <td>{cpm.slack}</td>
    </tr>
  );
}
