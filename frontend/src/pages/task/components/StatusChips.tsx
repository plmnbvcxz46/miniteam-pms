import { taskStatusLabel, taskStatusOrder } from "../../../shared/constants/task";
import { taskStatusKey } from "../../../shared/constants/task";
import type { TaskStatus } from "../../../shared/types/global";
import { canMoveStatus } from "../../../state/task/utils";

interface StatusChipsProps {
  status: TaskStatus;
  onChange: (status: TaskStatus) => void;
}

export default function StatusChips({ status, onChange }: StatusChipsProps) {
  return (
    <div className="chips" role="group" aria-label="任务状态">
      {taskStatusOrder.map((item) => {
        const allowed = canMoveStatus(status, item);
        return (
          <button
            key={item}
            type="button"
            aria-pressed={item === status}
            disabled={!allowed}
            title={allowed ? undefined : "任务已经开始，不能退回待开始"}
            onClick={() => onChange(item)}
          >
            <i className={`key ${taskStatusKey[item]}`} />
            {taskStatusLabel[item]}
          </button>
        );
      })}
    </div>
  );
}
