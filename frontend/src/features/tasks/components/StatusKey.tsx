import { taskStatusKey } from "../../../shared/constants/task";
import type { TaskStatus } from "../../../shared/types/global";
import styles from "./StatusKey.module.css";

interface StatusKeyProps {
  status: TaskStatus;
  /** 在黑底选中胶囊内显示反白状态方块 */
  inverted?: boolean;
}

export default function StatusKey({ status, inverted = false }: StatusKeyProps) {
  return (
    <span
      className={styles.key}
      data-status={taskStatusKey[status] || "todo"}
      data-inverted={inverted ? "true" : undefined}
      aria-hidden="true"
    />
  );
}
