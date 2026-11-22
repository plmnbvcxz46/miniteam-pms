import { EmptyState } from "../components/patterns/EmptyState";
import { PageHeader } from "../components/patterns/PageHeader";
import { Panel } from "../components/patterns/Panel";
import { Button } from "../components/ui/Button";
import styles from "./NoProject.module.css";

interface NoProjectProps {
  onCreate: () => void;
}

/** 没有能进的项目时，主区域显示这个（比如刚注册、还没被项目经理邀请的账号） */
export default function NoProject({ onCreate }: NoProjectProps) {
  return (
    <section className={styles.view} data-view="no-project">
      <PageHeader
        kicker="项目"
        title="还没有"
        accentTitle="项目"
        actions={
          <Button variant="accent" onClick={onCreate}>
            + 新建项目
          </Button>
        }
      />
      <Panel>
        <EmptyState description="你还没有加入任何项目，可以自己新建一个，或者请项目经理邀请你。" />
      </Panel>
    </section>
  );
}
