import { useState } from "react";
import {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from "../components/ui/Button";
import {
  Spinner,
  type SpinnerProps,
  type SpinnerSize,
} from "../components/ui/Spinner";
import { FormShowcase } from "./sections/FormShowcase";
import styles from "./UiShowcasePage.module.css";

interface VariantRow {
  variant: ButtonVariant;
  label: string;
  usage: string;
}

const VARIANT_ROWS: VariantRow[] = [
  { variant: "default", label: "默认操作", usage: "暖纸黑框，常规次要操作" },
  { variant: "primary", label: "保存更改", usage: "墨黑反白，抽屉/常规主提交" },
  {
    variant: "accent",
    label: "新建任务",
    usage: "信号橙重心，单视图尽量 ≤ 1 处",
  },
  {
    variant: "danger",
    label: "删除任务",
    usage: "高危触发，需配合 AlertDialog 二次确认",
  },
  { variant: "dashed", label: "+ 添加条目", usage: "虚线框，看板列尾/附加入口" },
  { variant: "link", label: "查看详情", usage: "下划线行内文字操作" },
];

const SIZE_LIST: { size: ButtonSize; label: string; heightNote: string }[] = [
  { size: "sm", label: "小号 sm", heightNote: "30px" },
  { size: "md", label: "默认 md", heightNote: "34px" },
  { size: "lg", label: "大号 lg", heightNote: "40px" },
  { size: "icon", label: "×", heightNote: "40×40" },
];

const SPINNER_SIZES: { size: SpinnerSize; note: string }[] = [
  { size: "sm", note: "12px · 紧凑控件" },
  { size: "md", note: "14px · 按钮默认" },
  { size: "lg", note: "20px · 面板/页面加载" },
];

const PLANNED_UI_COMPONENTS: {
  name: string;
  primitive: string;
  note: string;
  ready?: boolean;
}[] = [
  {
    name: "Spinner",
    primitive: "原生 <span>",
    note: "sm / md / lg 纯 CSS 环",
    ready: true,
  },
  {
    name: "Button",
    primitive: "原生 <button>",
    note: "6 变体 × 4 尺寸 × 全交互态",
    ready: true,
  },
  { name: "Input", primitive: "原生 <input>", note: "underline / boxed + type=date", ready: true },
  { name: "Textarea", primitive: "原生 <textarea>", note: "underline / boxed + invalid", ready: true },
  { name: "Checkbox", primitive: "radix-ui Checkbox", note: "16×16 0 圆角勾选框", ready: true },
  { name: "Switch", primitive: "radix-ui Switch", note: "track / segmented 双形态" },
  { name: "Select", primitive: "radix-ui Select", note: "underline 下拉选择" },
  { name: "ToggleGroup", primitive: "radix-ui ToggleGroup", note: "segmented / chips 单多选" },
  { name: "Field", primitive: "原生语义容器", note: "useId 自动关联 label/hint/error" },
  { name: "Popover", primitive: "radix-ui Popover", note: "硬阴影暖纸通用浮层" },
  { name: "DropdownMenu", primitive: "radix-ui DropdownMenu", note: "键盘漫游操作菜单" },
  { name: "Drawer", primitive: "radix-ui Dialog", note: "md / lg 右侧滑出抽屉" },
  { name: "AlertDialog", primitive: "radix-ui AlertDialog", note: "破坏性操作二次确认" },
  { name: "Toast", primitive: "radix-ui Toast", note: "neutral / danger 轻提示" },
  { name: "Badge", primitive: "原生 <span>", note: "solid / outline / accent / muted" },
  { name: "Alert", primitive: "原生 <div>", note: "inline / banner（info/warning/danger）" },
  { name: "Tabs", primitive: "radix-ui Tabs", note: "平铺方角标签栏" },
  { name: "Progress", primitive: "radix-ui Progress", note: "solid / dual / segmented" },
  { name: "Separator", primitive: "radix-ui Separator", note: "single / double / dashed" },
];

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M6 1.5V10.5M1.5 6H10.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2.5 6H9.5M6.5 3L9.5 6L6.5 9"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function DemoButton(props: ButtonProps) {
  return <Button {...props} />;
}

function DemoSpinner(props: SpinnerProps) {
  return <Spinner {...props} />;
}

export default function UiShowcasePage() {
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxDisabled, setSandboxDisabled] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.kicker}>// STYLE GUIDE · PHASE 3 PILOT</span>
            <h1 className={styles.title}>
              组件样式<em className={styles.titleAccent}>手册</em>
            </h1>
            <p className={styles.subtitle}>
              仅开发环境可见（import.meta.env.DEV），用于验收 Design Tokens 与
              components/ui 基础组件视觉与交互态。
            </p>
          </div>
          <span className={styles.envBadge}>DEV ONLY · /dev/ui</span>
        </header>

        {/* 0. Spinner 加载指示环 */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelHeading}>
              <span className={styles.kicker}>// SPINNER</span>
              <h2 className={styles.panelTitle}>Spinner 加载指示环</h2>
            </div>
            <p className={styles.panelNote}>
              纯 CSS 环、继承 currentColor、支持 label 无障碍状态播报
            </p>
          </div>

          <div className={styles.row}>
            {SPINNER_SIZES.map((item) => (
              <div key={item.size} className={styles.spinnerDemoItem}>
                <DemoSpinner size={item.size} label={`加载中（${item.size}）`} />
                <span className={styles.code}>{item.size}</span>
                <span className={styles.desc}>{item.note}</span>
              </div>
            ))}
            <div className={styles.spinnerDemoAccent}>
              <DemoSpinner size="md" />
              <span className={styles.code}>继承信号橙</span>
            </div>
            <div className={styles.spinnerDemoInverse}>
              <DemoSpinner size="md" />
              <span className={styles.code}>继承反白</span>
            </div>
          </div>
        </section>

        {/* 1. Button 全变体 × 全状态矩阵 */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelHeading}>
              <span className={styles.kicker}>// BUTTON MATRIX</span>
              <h2 className={styles.panelTitle}>Button 全变体与全状态</h2>
            </div>
            <p className={styles.panelNote}>
              直接悬停、按下（:active）或按 Tab（:focus-visible）验收交互反馈
            </p>
          </div>

          <table className={styles.matrix}>
            <thead>
              <tr>
                <th>VARIANT</th>
                <th>DEFAULT / HOVER / ACTIVE</th>
                <th>LOADING（复用 Spinner · 零抖动）</th>
                <th>DISABLED（统一中性灰）</th>
              </tr>
            </thead>
            <tbody>
              {VARIANT_ROWS.map((row) => (
                <tr key={row.variant}>
                  <td>
                    <div className={styles.variantCell}>
                      <span className={styles.code}>{row.variant}</span>
                      <span className={styles.desc}>{row.usage}</span>
                    </div>
                  </td>
                  <td>
                    <DemoButton variant={row.variant}>{row.label}</DemoButton>
                  </td>
                  <td>
                    <DemoButton variant={row.variant} loading>
                      {row.label}
                    </DemoButton>
                  </td>
                  <td>
                    <DemoButton variant={row.variant} disabled>
                      {row.label}
                    </DemoButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 2. Button 尺寸、图标与撑满 */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelHeading}>
              <span className={styles.kicker}>// SIZES &amp; ICONS</span>
              <h2 className={styles.panelTitle}>尺寸档位、图标与撑满布局</h2>
            </div>
            <p className={styles.panelNote}>sm (30) / md (34) / lg (40) / icon (40×40)</p>
          </div>

          <div className={styles.row}>
            {SIZE_LIST.map((item) => (
              <Button
                key={item.size}
                size={item.size}
                aria-label={item.size === "icon" ? "关闭示例图标按钮" : undefined}
              >
                {item.size === "icon"
                  ? item.label
                  : `${item.label} · ${item.heightNote}`}
              </Button>
            ))}
            <Button variant="primary" leadingIcon={<PlusIcon />}>
              前置图标
            </Button>
            <Button variant="default" trailingIcon={<ArrowIcon />}>
              后置图标
            </Button>
            <Button
              variant="default"
              size="icon"
              aria-label="新增图标按钮"
              leadingIcon={<PlusIcon />}
            />
          </div>

          <div className={styles.fullWidthBox}>
            <Button variant="primary" size="lg" fullWidth>
              撑满容器按钮（fullWidth · lg）
            </Button>
          </div>
        </section>

        {/* 3. 实时交互沙盒 */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelHeading}>
              <span className={styles.kicker}>// INTERACTIVE SANDBOX</span>
              <h2 className={styles.panelTitle}>实时状态切换与防连点验证</h2>
            </div>
            <p className={styles.panelNote}>
              切换 loading 验证宽高零抖动及点击拦截
            </p>
          </div>

          <div className={styles.sandboxControls}>
            <Button
              size="sm"
              variant={sandboxLoading ? "primary" : "default"}
              onClick={() => setSandboxLoading((v) => !v)}
            >
              Loading: {sandboxLoading ? "开" : "关"}
            </Button>
            <Button
              size="sm"
              variant={sandboxDisabled ? "primary" : "default"}
              onClick={() => setSandboxDisabled((v) => !v)}
            >
              Disabled: {sandboxDisabled ? "开" : "关"}
            </Button>
            <Button size="sm" variant="link" onClick={() => setClickCount(0)}>
              重置计数
            </Button>
            <span className={styles.counter}>
              有效触发次数：<span className={styles.counterValue}>{clickCount}</span>
            </span>
          </div>

          <div className={styles.row}>
            <Button
              variant="accent"
              loading={sandboxLoading}
              disabled={sandboxDisabled}
              onClick={() => setClickCount((c) => c + 1)}
            >
              提交当前操作
            </Button>
            <Button
              variant="primary"
              loading={sandboxLoading}
              disabled={sandboxDisabled}
              leadingIcon={<PlusIcon />}
              onClick={() => setClickCount((c) => c + 1)}
            >
              保存并继续
            </Button>
            <Button
              variant="default"
              loading={sandboxLoading}
              disabled={sandboxDisabled}
              onClick={() => setClickCount((c) => c + 1)}
            >
              取消并返回
            </Button>
            <Button
              variant="danger"
              loading={sandboxLoading}
              disabled={sandboxDisabled}
              onClick={() => setClickCount((c) => c + 1)}
            >
              确认删除
            </Button>
          </div>
        </section>

        {/* 4. 第 1 批表单控件展示 */}
        <FormShowcase />

        {/* 5. 后续阶段 3 待封装 UI 组件索引 */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelHeading}>
              <span className={styles.kicker}>// ROADMAP · 17 COMPONENTS</span>
              <h2 className={styles.panelTitle}>
                后续阶段 3 待封装 UI 组件索引（规划中）
              </h2>
            </div>
            <p className={styles.panelNote}>
              验收 Button 风格后再安装 radix-ui 单包批量落地其余 16 项
            </p>
          </div>

          <div className={styles.roadmapGrid}>
            {PLANNED_UI_COMPONENTS.map((item) => (
              <div
                key={item.name}
                className={styles.roadmapCard}
                data-ready={item.ready ? "true" : undefined}
              >
                <div className={styles.roadmapTop}>
                  <span className={styles.code}>{item.name}</span>
                  <span className={styles.roadmapTag}>
                    {item.ready ? "已就绪" : "规划中"}
                  </span>
                </div>
                <span className={styles.desc}>{item.primitive}</span>
                <span className={styles.desc}>{item.note}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
