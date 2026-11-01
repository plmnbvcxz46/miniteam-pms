import { taskStatusLabel } from "../../../../../data/global";
import { taskStatusKey } from "../../../../../data/task";
import type { TaskStatus } from "../../../../../types/global";

const STATUS_ORDER: TaskStatus[] = ["TODO", "DOING", "BLOCKED", "DONE"];

interface StatusChipsProps {
  status: TaskStatus;
  onChange: (status: TaskStatus) => void;
}

export default function StatusChips({ status, onChange }: StatusChipsProps) {
  return (
    <div className="chips" role="group" aria-label="任务状态">
      {STATUS_ORDER.map((item) => (
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
