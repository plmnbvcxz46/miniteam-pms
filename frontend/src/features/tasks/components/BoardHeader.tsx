import { PageHeader } from "../../../components/patterns/PageHeader";
import { Button } from "../../../components/ui/Button";
import { ToggleGroup, ToggleGroupItem } from "../../../components/ui/ToggleGroup";
import styles from "./BoardHeader.module.css";

export type BoardFilter = "all" | "mine" | "crit";

const FILTERS: { key: BoardFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "mine", label: "我的" },
  { key: "crit", label: "关键路径" },
];

interface BoardHeaderProps {
  kicker: string;
  filter: BoardFilter;
  onChangeFilter: (filter: BoardFilter) => void;
  /** 没有“编辑任务”权限时不传，按钮不显示 */
  onCreateTask?: () => void;
}

export default function BoardHeader({
  kicker,
  filter,
  onChangeFilter,
  onCreateTask,
}: BoardHeaderProps) {
  return (
    <PageHeader
      kicker={kicker}
      title="任务"
      accentTitle="看板"
      actions={
        <div className={styles.actions}>
          <ToggleGroup
            type="single"
            variant="segmented"
            aria-label="筛选"
            value={filter}
            onValueChange={(next) => {
              if (next) onChangeFilter(next as BoardFilter);
            }}
          >
            {FILTERS.map((item) => (
              <ToggleGroupItem key={item.key} value={item.key}>
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {onCreateTask && (
            <Button variant="accent" onClick={onCreateTask}>
              + 新建任务
            </Button>
          )}
        </div>
      }
    />
  );
}
