import { useState } from "react";
import { Button } from "../../components/ui/Button";
import {
  Checkbox,
  type CheckboxCheckedState,
  type CheckboxProps,
} from "../../components/ui/Checkbox";
import {
  Switch,
  type SwitchProps,
  type SwitchVariant,
} from "../../components/ui/Switch";
import styles from "../UiShowcasePage.module.css";

function DemoCheckbox(props: CheckboxProps) {
  return <Checkbox {...props} />;
}

function DemoSwitch(props: SwitchProps) {
  return <Switch {...props} />;
}

const SWITCH_VARIANTS: { variant: SwitchVariant; title: string }[] = [
  { variant: "track", title: "track（单轨 · 成员权限）" },
  { variant: "segmented", title: "segmented（双格 · 账号启停）" },
];

export function FormSwitchShowcase() {
  const [rememberMe, setRememberMe] = useState<CheckboxCheckedState>(true);
  const [permOn, setPermOn] = useState(true);
  const [acctActive, setAcctActive] = useState(true);
  const [switchLoading, setSwitchLoading] = useState(false);

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}>
            <span className={styles.kicker}>// CHECKBOX · RADIX UI</span>
            <h2 className={styles.panelTitle}>Checkbox 复选框</h2>
          </div>
          <p className={styles.panelNote}>
            16×16 0 圆角方框 · 含 checked / invalid / 关联 label 同步禁用弱化
          </p>
        </div>
        <div className={styles.row}>
          <DemoCheckbox label="记住登录账号（受控）" checked={rememberMe} onCheckedChange={setRememberMe} />
          <DemoCheckbox label="未勾选默认态" />
          <DemoCheckbox label="校验失败态（invalid）" invalid />
          <DemoCheckbox label="禁用未勾选（label 同步弱化）" disabled />
          <DemoCheckbox label="禁用已勾选" disabled defaultChecked />
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}>
            <span className={styles.kicker}>// SWITCH · RADIX UI</span>
            <h2 className={styles.panelTitle}>Switch 开关</h2>
          </div>
          <p className={styles.panelNote}>
            track（有/无）&amp; segmented（启用/停用）· 含 checked / loading / disabled
          </p>
        </div>
        <div className={styles.sandboxControls}>
          <Button size="sm" variant={switchLoading ? "primary" : "default"} onClick={() => setSwitchLoading((v) => !v)}>
            切换原地 Loading（验证零宽高抖动）: {switchLoading ? "开" : "关"}
          </Button>
        </div>
        <div className={styles.formGrid}>
          {SWITCH_VARIANTS.map(({ variant, title }) => (
            <div key={variant} className={styles.formCell}>
              <span className={styles.code}>{title}</span>
              <div className={styles.row}>
                <DemoSwitch
                  variant={variant}
                  aria-label={`${title} 交互示例`}
                  loading={switchLoading}
                  checked={variant === "track" ? permOn : acctActive}
                  onCheckedChange={variant === "track" ? setPermOn : setAcctActive}
                />
                <DemoSwitch variant={variant} aria-label={`${title} 加载态`} defaultChecked loading />
                <DemoSwitch variant={variant} aria-label={`${title} 禁用态`} defaultChecked disabled />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
