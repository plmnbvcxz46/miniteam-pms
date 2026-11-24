import { HeroCard } from "../../components/patterns/HeroCard";
import { Legend, type LegendItem } from "../../components/patterns/Legend";
import { LoadBar } from "../../components/patterns/LoadBar";
import { Badge } from "../../components/ui/Badge";
import styles from "../UiShowcasePage.module.css";
import demoStyles from "./ReportPatternsShowcase.module.css";

const SWATCH_LEGENDS: readonly LegendItem[] = [
  { key: "solid", label: "进行中", swatch: "solid" },
  { key: "outline", label: "待开始", swatch: "outline" },
  { key: "dashed", label: "已完成", swatch: "dashed" },
  { key: "striped", label: "阻塞 / 逾期", swatch: "striped" },
];

const LINE_LEGENDS: readonly LegendItem[] = [
  { key: "actual", label: "实际", swatch: "line-solid" },
  { key: "plan", label: "计划", swatch: "line-dashed" },
  { key: "pred", label: "预测", swatch: "line-accent-dashed" },
  { key: "due", label: "截止日", swatch: "vline-dashed" },
  { key: "today", label: "今天", swatch: "vline-accent" },
];

const LOAD_SAMPLES = [
  { name: "正常", hours: 28, capacity: 40 },
  { name: "满载", hours: 40, capacity: 40 },
  { name: "超载", hours: 48, capacity: 40 },
] as const;

function LegendDemo() {
  return (
    <div className={demoStyles.block}>
      <span className={styles.code}>Legend · 色块与线条图例</span>
      <div className={demoStyles.legendRows}>
        <Legend items={SWATCH_LEGENDS} />
        <Legend items={LINE_LEGENDS} />
      </div>
    </div>
  );
}

function HeroCardDemo() {
  return (
    <div className={demoStyles.block}>
      <span className={styles.code}>HeroCard · alert / calm / surface 三态</span>
      <div className={demoStyles.heroGrid}>
        <HeroCard
          tone="alert"
          kicker="// FORECAST"
          title="预测完工"
          badge={
            <Badge variant="solid" size="sm">
              风险
            </Badge>
          }
          footer={<span>任务看板重构 +3 · 报表导出 +2</span>}
        >
          <span className={demoStyles.heroFigure}>12.04</span>
          <span className={demoStyles.heroNote}>晚 5 天</span>
        </HeroCard>

        <HeroCard
          tone="calm"
          kicker="// FORECAST"
          title="预测完工"
          badge={<span className={demoStyles.calmStatus}>正常</span>}
          footer={<span>暂无超期任务</span>}
        >
          <span className={demoStyles.heroFigure}>11.27</span>
          <span className={demoStyles.heroNote}>按计划</span>
        </HeroCard>

        <HeroCard tone="surface" title="需求规格说明书.md">
          <div className={demoStyles.surfaceRow}>
            <span className={demoStyles.heroFigure}>v1.4</span>
            <span className={styles.desc}>修订中 · 截止 11.28</span>
          </div>
        </HeroCard>
      </div>
    </div>
  );
}

function LoadBarDemo() {
  return (
    <div className={demoStyles.block}>
      <span className={styles.code}>LoadBar · detailed / compact 变体</span>
      <div className={demoStyles.loadList}>
        {LOAD_SAMPLES.map((sample) => (
          <div key={sample.name} className={demoStyles.loadRow}>
            <span className={styles.code}>{sample.name}</span>
            <LoadBar
              hours={sample.hours}
              capacity={sample.capacity}
              maxScale={50}
              label={`${sample.name}负载`}
            />
            <span className={styles.code}>
              {sample.hours}/{sample.capacity}h
            </span>
          </div>
        ))}
      </div>
      <div className={styles.row}>
        <span className={styles.desc}>compact（正常 24/40h）：</span>
        <div className={demoStyles.compactBox}>
          <LoadBar variant="compact" hours={24} capacity={40} label="紧凑正常" />
        </div>
        <span className={styles.desc}>compact（超载 46/40h）：</span>
        <div className={demoStyles.compactBox}>
          <LoadBar variant="compact" hours={46} capacity={40} label="紧凑超载" />
        </div>
      </div>
    </div>
  );
}

export function ReportPatternsShowcase() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeading}>
          <span className={styles.kicker}>// PATTERNS · REPORTS</span>
          <h2 className={styles.panelTitle}>Legend、HeroCard 与 LoadBar</h2>
        </div>
        <p className={styles.panelNote}>
          第 4 步新增：数据驱动图例 · 报刊强调卡三态外壳 · 工时负载轨道（role=meter）
        </p>
      </div>
      <LegendDemo />
      <HeroCardDemo />
      <LoadBarDemo />
    </section>
  );
}
