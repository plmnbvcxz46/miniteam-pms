import {
  Progress,
  type ProgressProps,
  type ProgressSegment,
  type ProgressSegmentState,
  type ProgressSurface,
  type ProgressTone,
  type ProgressVariant,
} from "../../components/ui/Progress";
import {
  Separator,
  type SeparatorOrientation,
  type SeparatorProps,
  type SeparatorVariant,
} from "../../components/ui/Separator";
import styles from "../UiShowcasePage.module.css";
import { DisplayFeedbackShowcase } from "./DisplayFeedbackShowcase";
import widgetStyles from "./ShowcaseWidgets.module.css";

function DemoProgress(props: ProgressProps) {
  return <Progress {...props} />;
}

function DemoSeparator(props: SeparatorProps) {
  return <Separator {...props} />;
}

const PROGRESS_VARIANT_NOTE: Record<ProgressVariant, string> = {
  solid: "solid（单轨进度条 + 阈值上限线 / 斜纹预警）",
  dual: "dual（单轨双层叠加：时间斜纹 + 完成率实底）",
  segmented: "segmented（按周/按期分段格子：past 墨底 / today 信号橙空心粗框 / future 纸底）",
};

const WARNING_PROGRESS_TONE: ProgressTone = "warning";
const INVERSE_PROGRESS_SURFACE: ProgressSurface = "inverse";
const TODAY_SEG_STATE: ProgressSegmentState = "today";

const WEEK_SEGMENTS: ProgressSegment[] = [
  { key: "d1", state: "past", title: "周一 · 已过" },
  { key: "d2", state: "past", title: "周二 · 已过" },
  { key: "d3", state: "past", title: "周三 · 已过" },
  { key: "d4", state: TODAY_SEG_STATE, title: "周四 · 今日（信号橙空心粗框）" },
  { key: "d5", state: "future", title: "周五 · 未来" },
  { key: "d6", state: "future", title: "周六 · 未来" },
  { key: "d7", state: "future", title: "周日 · 未来" },
];

const SEPARATOR_VARIANTS: { variant: SeparatorVariant; label: string }[] = [
  { variant: "single", label: "single（1.5px 墨色单实线）" },
  { variant: "double", label: "double（2px+1.5px 抽屉/分区双线）" },
  { variant: "masthead", label: "masthead（报刊页头 5px+1.5px 粗细双横线）" },
  { variant: "dashed", label: "dashed（1px 墨色虚线分割）" },
];

const VERTICAL_ORIENTATION: SeparatorOrientation = "vertical";

function ProgressShowcasePanel() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeading}>
          <span className={styles.kicker}>// PROGRESS · RADIX UI</span>
          <h2 className={styles.panelTitle}>Progress 进度条原语（solid / dual / segmented）</h2>
        </div>
        <p className={styles.panelNote}>具备完整 aria-valuemin / aria-valuemax / aria-valuenow 无障碍属性</p>
      </div>

      <div className={styles.fieldStack}>
        <div className={styles.formCell}>
          <span className={styles.code}>{PROGRESS_VARIANT_NOTE.solid} · 常态（64% / 阈值线 80%）</span>
          <DemoProgress variant="solid" value={64} thresholdPercent={80} aria-label="常规成员负载 64%" />
        </div>
        <div className={styles.formCell}>
          <span className={styles.code}>solid · 超载预警（92% · warning + 斜纹 + 80% 满载线）</span>
          <DemoProgress variant="solid" tone={WARNING_PROGRESS_TONE} striped value={92} thresholdPercent={80} aria-label="超载成员负载 92%" />
        </div>
        <div className={styles.formCell}>
          <span className={styles.code}>{PROGRESS_VARIANT_NOTE.dual}（浅底 · 时间 70% vs 完成 58%）</span>
          <DemoProgress variant="dual" value={58} secondaryValue={70} aria-label="项目完成率 58%，时间已过 70%" />
        </div>
        <div className={styles.formCell}>
          <span className={styles.code}>dual · 反色面（surface=&quot;inverse&quot; · 侧栏摘要卡）</span>
          <div className={widgetStyles.progressInverseWrap}>
            <DemoProgress
              variant="dual"
              surface={INVERSE_PROGRESS_SURFACE}
              value={42}
              secondaryValue={65}
              aria-label="反色底完成率 42%，时间已过 65%"
            />
          </div>
        </div>
        <div className={styles.formCell}>
          <span className={styles.code}>{PROGRESS_VARIANT_NOTE.segmented}（7 日周期，第 4 日为今天）</span>
          <DemoProgress variant="segmented" value={4} max={7} segments={WEEK_SEGMENTS} aria-label="本周进度第 4 天" />
        </div>
        <div className={styles.formCell}>
          <span className={styles.code}>segmented · 固定格宽（segmentWidth=22 · 顶栏周进度）</span>
          <DemoProgress
            variant="segmented"
            segmentWidth={22}
            value={4}
            max={7}
            segments={WEEK_SEGMENTS}
            aria-label="固定格宽周进度第 4 天"
          />
        </div>
      </div>
    </section>
  );
}

function SeparatorShowcasePanel() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeading}>
          <span className={styles.kicker}>// SEPARATOR · RADIX UI</span>
          <h2 className={styles.panelTitle}>Separator 报刊分割线（single / double / masthead / dashed）</h2>
        </div>
        <p className={styles.panelNote}>支持 horizontal（水平）与 vertical（垂直）双方向及 decorative 无障碍语义</p>
      </div>

      <div className={styles.fieldStack}>
        {SEPARATOR_VARIANTS.map((item) => (
          <div key={item.variant} className={styles.formCell}>
            <span className={styles.code}>{item.label} · horizontal</span>
            <DemoSeparator variant={item.variant} orientation="horizontal" />
          </div>
        ))}
      </div>

      <div className={styles.row}>
        <span className={styles.code}>vertical 垂直分割：</span>
        <span className={styles.desc}>第 32 期</span>
        <DemoSeparator variant="single" orientation={VERTICAL_ORIENTATION} decorative={false} />
        <span className={styles.desc}>2026-11-22</span>
        <DemoSeparator variant="double" orientation={VERTICAL_ORIENTATION} />
        <span className={styles.desc}>剩余 6 天</span>
        <DemoSeparator variant="masthead" orientation={VERTICAL_ORIENTATION} />
        <span className={styles.desc}>正常</span>
        <DemoSeparator variant="dashed" orientation={VERTICAL_ORIENTATION} />
        <span className={styles.desc}>完成率 58%</span>
      </div>
    </section>
  );
}

export function DisplayShowcase() {
  return (
    <>
      <DisplayFeedbackShowcase />
      <ProgressShowcasePanel />
      <SeparatorShowcasePanel />
    </>
  );
}
