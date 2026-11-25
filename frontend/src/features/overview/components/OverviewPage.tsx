import { PageState } from "../../../components/patterns/PageState";
import { useOverviewPage } from "../hooks/useOverviewPage";
import CriticalChainPanel from "./CriticalChainPanel";
import FigureStrip from "./FigureStrip";
import HeadlinePanel from "./HeadlinePanel";
import OverviewHeader from "./OverviewHeader";
import styles from "./OverviewPage.module.css";
import ProgressPanel from "./ProgressPanel";
import SchedulePanel from "./SchedulePanel";
import TodoPanel from "./TodoPanel";

export function OverviewPage() {
  const page = useOverviewPage();

  if (page.missing) {
    return (
      <PageState
        status="missing"
        description="这一期没有存档，看不到当时的日报。"
      />
    );
  }
  if (page.error) {
    return <PageState status="error" description={page.error} />;
  }
  if (!page.overview || !page.forecast) {
    return <PageState status="loading" description="正在加载项目日报…" />;
  }

  const { overview, forecast } = page;

  return (
    <section className={styles.page}>
      <OverviewHeader
        kicker={page.kicker}
        onCreateTask={page.onCreateTask}
      />
      <FigureStrip stats={overview.stats} />

      <div className={styles.rowTop}>
        <SchedulePanel
          week={page.week}
          rows={page.schedule}
          dayProgress={page.dayProgress}
          onOpenTask={page.openTask}
        />
        <HeadlinePanel
          headline={overview.headline}
          onOpenTask={page.openTask}
          onOpenBoard={page.openBoard}
        />
      </div>

      <div className={styles.rowBottom}>
        <TodoPanel
          items={page.todos}
          total={overview.todoTotal}
          onOpenTask={page.openTask}
        />
        <ProgressPanel
          done={overview.progress.done}
          total={overview.progress.total}
        />
        <CriticalChainPanel
          chain={overview.criticalPath.nodes}
          forecast={forecast}
          totalDays={overview.criticalPath.totalDuration}
        />
      </div>
    </section>
  );
}
