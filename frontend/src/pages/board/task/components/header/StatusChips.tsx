import { taskStatusLabel, taskStatusOrder } from "../../../../../constants/task";
import { taskStatusKey } from "../../../../../constants/task";
import type { TaskStatus } from "../../../../../types/global";

interface StatusChipsProps {
  status: TaskStatus;
  onChange: (status: TaskStatus) => void;
}

export default function StatusChips({ status, onChange }: StatusChipsProps) {
  return (
    <div className="chips" role="group" aria-label="任务状态">
      {taskStatusOrder.map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={item === status}
          onClick={() => onChange(item)}
        >
          <i className={`key ${taskStatusKey[item]}`} />
          {taskStatusLabel[item]}
        </button>
      ))}
    </div>
  );
}
