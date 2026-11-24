import { Alert } from "../../../components/ui/Alert";
import { PageState } from "../../../components/patterns/PageState";
import { useReportsPage } from "../hooks/useReportsPage";
import BurndownPanel from "./BurndownPanel";
import DeviationPanel from "./DeviationPanel";
import ForecastHero from "./ForecastHero";
import LoadPanel from "./LoadPanel";
import ReportsHeader from "./ReportsHeader";
import styles from "./ReportsPage.module.css";
import WeeklyPanel from "./WeeklyPanel";

export function ReportsPage() {
  const {
    report,
    currentBurndown,
    range,
    rangeOptions,
    onRangeChange,
    exporting,
    exportError,
    onExport,
    error,
    missing,
  } = useReportsPage();

  if (missing) {
    return (
      <PageState
        status="missing"
        description="这一期没有存档，看不到当时的报表。"
      />
    );
  }
  if (error) {
    return <PageState status="error" description={error} />;
  }
  if (!report || !currentBurndown) return null;

  const { summary, weeklyCompleted, deviations, forecast, workload } = report;

  return (
    <section className={styles.view}>
      <ReportsHeader
        summary={summary}
        range={range}
        rangeOptions={rangeOptions}
        onRangeChange={onRangeChange}
        exporting={exporting}
        onExport={onExport}
      />
      {exportError && (
        <Alert variant="inline" tone="danger">
          {exportError}
        </Alert>
      )}
      <div className={styles.grid}>
        <BurndownPanel burndown={currentBurndown} className={styles.span2} />
        <LoadPanel workload={workload} />
        <WeeklyPanel items={weeklyCompleted} />
        <DeviationPanel items={deviations} />
        <ForecastHero
          forecast={forecast}
          today={currentBurndown.today}
          deviations={deviations}
        />
      </div>
    </section>
  );
}
