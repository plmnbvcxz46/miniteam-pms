import { PageHeader } from "../../../components/patterns/PageHeader";
import { Panel } from "../../../components/patterns/Panel";
import { Button } from "../../../components/ui/Button";
import styles from "./NoAccess.module.css";

interface NoAccessProps {
  onBack: () => void;
}

/** 没有权限查看这个任务时，替代任务详情显示 */
export default function NoAccess({ onBack }: NoAccessProps) {
  return (
    <section className={styles.page} id="view-task" data-view="task">
      <PageHeader
        kicker="任务详情"
        title="无权"
        accentTitle="查看"
        actions={
          <Button size="sm" variant="default" onClick={onBack}>
            ← 返回
          </Button>
        }
      />
      <Panel>
        <p className={styles.message}>
          这个任务不是你负责的，也不在关键路径上，看不了详情。
        </p>
      </Panel>
    </section>
  );
}
