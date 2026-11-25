import { PageHeader } from "../../../components/patterns/PageHeader";
import { Button } from "../../../components/ui/Button";

interface OverviewHeaderProps {
  kicker: string;
  /** 没有“编辑任务”权限时不传，按钮不显示 */
  onCreateTask?: () => void;
}

export default function OverviewHeader({
  kicker,
  onCreateTask,
}: OverviewHeaderProps) {
  return (
    <PageHeader
      kicker={kicker}
      title="项目"
      accentTitle="日报"
      actions={
        onCreateTask ? (
          <Button variant="accent" onClick={onCreateTask}>
            + 新建任务
          </Button>
        ) : undefined
      }
    />
  );
}
