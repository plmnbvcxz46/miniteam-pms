import { PageState } from "../../../components/patterns/PageState";
import { useTimelinePage } from "../hooks/useTimelinePage";
import CriticalPanel from "./CriticalPanel";
import GanttPanel from "./GanttPanel";
import TimelineHeader from "./TimelineHeader";
import styles from "./TimelinePage.module.css";

export function TimelinePage() {
  const page = useTimelinePage();

  if (page.missing) {
    return (
      <PageState
        status="missing"
        description="这一期没有存档，看不到当时的时间线。"
      />
    );
  }
  if (page.error) {
    return <PageState status="error" description={page.error} />;
  }
  if (!page.ready || !page.cpm || !page.forecast || !page.range) {
    return <PageState status="loading" description="正在加载项目时间线…" />;
  }

  return (
    <section className={styles.page}>
      <TimelineHeader
        kicker={page.kicker}
        scale={page.scale}
        onChangeScale={page.setScale}
        onCreateTask={page.onCreateTask}
      />
      <GanttPanel
        tasks={page.tasks}
        activityMap={page.activityMap}
        cpm={page.cpm}
        forecast={page.forecast}
        range={page.range}
        today={page.today}
        scale={page.scale}
        onOpenTask={page.onOpenTask}
      />
      <CriticalPanel tasks={page.tasks} cpm={page.cpm} />
    </section>
  );
}
