import { ToggleGroup, ToggleGroupItem } from "../../../components/ui/ToggleGroup";
import { taskStatusLabel, taskStatusOrder } from "../../../shared/constants/task";
import type { TaskStatus } from "../../../shared/types/global";
import { canMoveStatus } from "../../../stores/task/utils";
import StatusKey from "./StatusKey";

interface StatusChipsProps {
  status: TaskStatus;
  onChange: (status: TaskStatus) => void;
}

export default function StatusChips({ status, onChange }: StatusChipsProps) {
  return (
    <ToggleGroup
      type="single"
      variant="chips"
      aria-label="任务状态"
      value={status}
      onValueChange={(next) => {
        if (next && next !== status) onChange(next as TaskStatus);
      }}
    >
      {taskStatusOrder.map((item) => {
        const allowed = canMoveStatus(status, item);
        return (
          <ToggleGroupItem
            key={item}
            value={item}
            disabled={!allowed}
            leadingIcon={<StatusKey status={item} inverted={item === status} />}
            title={allowed ? undefined : "任务已经开始，不能退回待开始"}
          >
            {taskStatusLabel[item]}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
