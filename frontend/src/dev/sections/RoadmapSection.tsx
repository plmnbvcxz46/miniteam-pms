import { Badge } from "../../components/ui/Badge";
import styles from "../UiShowcasePage.module.css";
import widgetStyles from "./ShowcaseWidgets.module.css";

const PLANNED_UI_COMPONENTS: {
  name: string;
  primitive: string;
  note: string;
  ready?: boolean;
}[] = [
  { name: "Spinner", primitive: "原生 <span>", note: "sm / md / lg 纯 CSS 环", ready: true },
  { name: "Button", primitive: "原生 <button>", note: "6 变体 × 4 尺寸 × 全交互态", ready: true },
  { name: "Input", primitive: "原生 <input>", note: "underline / boxed + type=date", ready: true },
  { name: "Textarea", primitive: "原生 <textarea>", note: "underline / boxed + invalid", ready: true },
  { name: "Checkbox", primitive: "radix-ui Checkbox", note: "16×16 0 圆角勾选框", ready: true },
  { name: "Switch", primitive: "radix-ui Switch", note: "track / segmented 双形态", ready: true },
  { name: "Select", primitive: "radix-ui Select", note: "underline 下拉选择", ready: true },
  { name: "ToggleGroup", primitive: "radix-ui ToggleGroup", note: "segmented / chips 单多选", ready: true },
  { name: "Field", primitive: "原生语义容器", note: "useId 自动关联 label/hint/error", ready: true },
  { name: "Popover", primitive: "radix-ui Popover", note: "硬阴影暖纸通用浮层", ready: true },
  { name: "DropdownMenu", primitive: "radix-ui DropdownMenu", note: "键盘漫游操作菜单", ready: true },
  { name: "Drawer", primitive: "radix-ui Dialog", note: "md / lg 右侧滑出抽屉", ready: true },
  { name: "AlertDialog", primitive: "radix-ui AlertDialog", note: "破坏性操作二次确认", ready: true },
  { name: "Toast", primitive: "radix-ui Toast", note: "neutral / danger 队列轻提示", ready: true },
  { name: "Badge", primitive: "原生 <span>", note: "solid / outline / accent / muted", ready: true },
  { name: "Alert", primitive: "原生 <div>", note: "inline / banner（info/warning/danger）", ready: true },
  { name: "Tabs", primitive: "radix-ui Tabs", note: "平铺方角标签栏", ready: true },
  { name: "Progress", primitive: "radix-ui Progress", note: "solid / dual / segmented", ready: true },
  { name: "Separator", primitive: "radix-ui Separator", note: "single / double / dashed", ready: true },
];

export function RoadmapSection() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeading}>
          <span className={styles.kicker}>// ROADMAP · 19 COMPONENTS</span>
          <h2 className={styles.panelTitle}>阶段 3 UI 基础组件清单与落位进度</h2>
        </div>
        <p className={styles.panelNote}>
          阶段 3 全部 19 项基础组件均已实现，统一标为墨色 Badge(solid)“已就绪”
        </p>
      </div>

      <div className={widgetStyles.roadmapGrid}>
        {PLANNED_UI_COMPONENTS.map((item) => (
          <div
            key={item.name}
            className={widgetStyles.roadmapCard}
            data-ready={item.ready ? "true" : undefined}
          >
            <div className={widgetStyles.roadmapTop}>
              <span className={styles.code}>{item.name}</span>
              <Badge size="sm" variant={item.ready ? "solid" : "muted"}>
                {item.ready ? "已就绪" : "规划中"}
              </Badge>
            </div>
            <span className={styles.desc}>{item.primitive}</span>
            <span className={styles.desc}>{item.note}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
