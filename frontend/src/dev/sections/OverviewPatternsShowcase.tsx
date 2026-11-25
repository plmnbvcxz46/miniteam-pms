import {
  MetricStrip,
  type MetricStripItem,
} from "../../components/patterns/MetricStrip";
import { Badge } from "../../components/ui/Badge";
import styles from "../UiShowcasePage.module.css";
import demoStyles from "./OverviewPatternsShowcase.module.css";

const OVERVIEW_ITEMS: readonly MetricStripItem[] = [
  { key: "done", label: "DONE", value: "06", unit: "/18" },
  { key: "remaining", label: "REMAINING", value: "12" },
  {
    key: "overdue",
    label: "OVERDUE",
    value: "12",
    tone: "alert",
    badge: (
      <Badge variant="solid" size="sm">
        风险
      </Badge>
    ),
  },
  { key: "daysLeft", label: "DAYS LEFT", value: "19", sub: "含周末" },
];

const TASK_ITEMS: readonly MetricStripItem[] = [
  { key: "est", label: "ESTIMATE", value: 4, unit: "工作日" },
  { key: "spent", label: "SPENT", value: 3, unit: "工作日" },
  { key: "due", label: "DEADLINE", value: "11.19", tone: "alert" },
  { key: "wait", label: "WAITING", value: 2, unit: "项" },
];

export function OverviewPatternsShowcase() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeading}>
          <span className={styles.kicker}>// PATTERNS · METRIC STRIP</span>
          <h2 className={styles.panelTitle}>MetricStrip 四格指标条（阶段 4 第 8 步）</h2>
        </div>
        <p className={styles.panelNote}>
          patterns 收官组件（16/16）· 首格反白 · alert 信号橙顶边与 badge
        </p>
      </div>

      <div className={demoStyles.stack}>
        <div className={demoStyles.group}>
          <span className={styles.code}>概览日报模式 · DONE / REMAINING / OVERDUE(alert) / DAYS LEFT</span>
          <MetricStrip items={OVERVIEW_ITEMS} />
        </div>
        <div className={demoStyles.group}>
          <span className={styles.code}>任务详情模式 · ESTIMATE / SPENT / DEADLINE(alert) / WAITING</span>
          <MetricStrip items={TASK_ITEMS} />
        </div>
      </div>
    </section>
  );
}
