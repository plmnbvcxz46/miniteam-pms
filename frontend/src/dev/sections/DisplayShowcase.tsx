import {
  Badge,
  type BadgeProps,
  type BadgeSize,
  type BadgeVariant,
} from "../../components/ui/Badge";
import styles from "../UiShowcasePage.module.css";

function DemoBadge(props: BadgeProps) {
  return <Badge {...props} />;
}

const BADGE_ITEMS: {
  variant: BadgeVariant;
  label: string;
  note: string;
}[] = [
  {
    variant: "solid",
    label: "已完成 / 已就绪",
    note: "墨底反白（常态强标识：完成、定稿、已就绪）",
  },
  {
    variant: "outline",
    label: "V3 · 架构设计",
    note: "墨框暖纸底（常规角色、任务编号、版本标签）",
  },
  {
    variant: "muted",
    label: "规划中 / 归档",
    note: "弱化描边与次要字（待办、归档、次要说明）",
  },
  {
    variant: "accent",
    label: "逾期 +2D / 阻塞",
    note: "信号橙（仅用于逾期、阻塞、关键路径等需注意状态）",
  },
];

const BADGE_SIZES: BadgeSize[] = ["sm", "md"];

export function DisplayShowcase() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeading}>
          <span className={styles.kicker}>// BADGE</span>
          <h2 className={styles.panelTitle}>Badge 状态与分类徽标</h2>
        </div>
        <p className={styles.panelNote}>
          solid（墨底常态）/ outline（墨框）/ muted（弱化）/ accent（信号橙，仅用于需注意状态）
        </p>
      </div>

      <div className={styles.formGrid}>
        {BADGE_ITEMS.map((item) => (
          <div key={item.variant} className={styles.formCell}>
            <span className={styles.code}>{item.variant}</span>
            <div className={styles.row}>
              {BADGE_SIZES.map((sz) => (
                <DemoBadge key={sz} variant={item.variant} size={sz}>
                  {item.label} · {sz}
                </DemoBadge>
              ))}
            </div>
            <span className={styles.desc}>{item.note}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
