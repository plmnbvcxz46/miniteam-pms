import { useState } from "react";
import {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from "../../components/ui/Button";
import {
  Spinner,
  type SpinnerProps,
  type SpinnerSize,
} from "../../components/ui/Spinner";
import styles from "../UiShowcasePage.module.css";
import widgetStyles from "./ShowcaseWidgets.module.css";

const VARIANT_ROWS: { variant: ButtonVariant; label: string; usage: string }[] = [
  { variant: "default", label: "默认操作", usage: "暖纸黑框，常规次要操作" },
  { variant: "primary", label: "保存更改", usage: "墨黑反白，抽屉/常规主提交" },
  { variant: "accent", label: "新建任务", usage: "信号橙重心，单视图尽量 ≤ 1 处" },
  { variant: "danger", label: "删除任务", usage: "高危触发，配合 AlertDialog 确认" },
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

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 1.5V10.5M1.5 6H10.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6H9.5M6.5 3L9.5 6L6.5 9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function DemoButton(props: ButtonProps) {
  return <Button {...props} />;
}
function DemoSpinner(props: SpinnerProps) {
  return <Spinner {...props} />;
}

function SpinnerAndMatrixSection() {
  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}>
            <span className={styles.kicker}>// SPINNER</span>
            <h2 className={styles.panelTitle}>Spinner 加载指示环</h2>
          </div>
          <p className={styles.panelNote}>纯 CSS 环、继承 currentColor、支持 label 无障碍播报</p>
        </div>
        <div className={styles.row}>
          {SPINNER_SIZES.map((item) => (
            <div key={item.size} className={widgetStyles.spinnerDemoItem}>
              <DemoSpinner size={item.size} label={`加载中（${item.size}）`} />
              <span className={styles.code}>{item.size}</span>
              <span className={styles.desc}>{item.note}</span>
            </div>
          ))}
          <div className={widgetStyles.spinnerDemoAccent}><DemoSpinner size="md" /><span className={styles.code}>继承信号橙</span></div>
          <div className={widgetStyles.spinnerDemoInverse}><DemoSpinner size="md" /><span className={styles.code}>继承反白</span></div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}>
            <span className={styles.kicker}>// BUTTON MATRIX</span>
            <h2 className={styles.panelTitle}>Button 全变体与全状态</h2>
          </div>
          <p className={styles.panelNote}>悬停、按下（:active）或按 Tab（:focus-visible）验收交互反馈</p>
        </div>
        <table className={widgetStyles.matrix}>
          <thead>
            <tr><th>VARIANT</th><th>DEFAULT / HOVER / ACTIVE</th><th>LOADING（零抖动）</th><th>DISABLED（统一中性灰）</th></tr>
          </thead>
          <tbody>
            {VARIANT_ROWS.map((row) => (
              <tr key={row.variant}>
                <td><div className={widgetStyles.variantCell}><span className={styles.code}>{row.variant}</span><span className={styles.desc}>{row.usage}</span></div></td>
                <td><DemoButton variant={row.variant}>{row.label}</DemoButton></td>
                <td><DemoButton variant={row.variant} loading>{row.label}</DemoButton></td>
                <td><DemoButton variant={row.variant} disabled>{row.label}</DemoButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

export function ButtonShowcase() {
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxDisabled, setSandboxDisabled] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  return (
    <>
      <SpinnerAndMatrixSection />

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}><span className={styles.kicker}>// SIZES &amp; ICONS</span><h2 className={styles.panelTitle}>尺寸档位、图标与撑满布局</h2></div>
          <p className={styles.panelNote}>sm (30) / md (34) / lg (40) / icon (40×40)</p>
        </div>
        <div className={styles.row}>
          {SIZE_LIST.map((item) => (
            <Button key={item.size} size={item.size} aria-label={item.size === "icon" ? "关闭示例图标按钮" : undefined}>
              {item.size === "icon" ? item.label : `${item.label} · ${item.heightNote}`}
            </Button>
          ))}
          <Button variant="primary" leadingIcon={<PlusIcon />}>前置图标</Button>
          <Button variant="default" trailingIcon={<ArrowIcon />}>后置图标</Button>
          <Button variant="default" size="icon" aria-label="新增图标按钮" leadingIcon={<PlusIcon />} />
        </div>
        <div className={widgetStyles.fullWidthBox}><Button variant="primary" size="lg" fullWidth>撑满容器按钮（fullWidth · lg）</Button></div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}><span className={styles.kicker}>// INTERACTIVE SANDBOX</span><h2 className={styles.panelTitle}>实时状态切换与防连点验证</h2></div>
          <p className={styles.panelNote}>切换 loading 验证宽高零抖动及点击拦截</p>
        </div>
        <div className={styles.sandboxControls}>
          <Button size="sm" variant={sandboxLoading ? "primary" : "default"} onClick={() => setSandboxLoading((v) => !v)}>Loading: {sandboxLoading ? "开" : "关"}</Button>
          <Button size="sm" variant={sandboxDisabled ? "primary" : "default"} onClick={() => setSandboxDisabled((v) => !v)}>Disabled: {sandboxDisabled ? "开" : "关"}</Button>
          <Button size="sm" variant="link" onClick={() => setClickCount(0)}>重置计数</Button>
          <span className={widgetStyles.counter}>有效触发次数：<span className={widgetStyles.counterValue}>{clickCount}</span></span>
        </div>
        <div className={styles.row}>
          {(["accent", "primary", "default", "danger"] as const).map((v) => (
            <Button key={v} variant={v} loading={sandboxLoading} disabled={sandboxDisabled} leadingIcon={v === "primary" ? <PlusIcon /> : undefined} onClick={() => setClickCount((c) => c + 1)}>
              {v === "accent" ? "提交当前操作" : v === "primary" ? "保存并继续" : v === "default" ? "取消并返回" : "确认删除"}
            </Button>
          ))}
        </div>
      </section>
    </>
  );
}
