import { useState } from "react";
import {
  Input,
  type InputProps,
  type InputSize,
  type InputVariant,
} from "../../components/ui/Input";
import {
  Textarea,
  type TextareaProps,
  type TextareaVariant,
} from "../../components/ui/Textarea";
import styles from "../UiShowcasePage.module.css";

function DemoInput(props: InputProps) {
  return <Input {...props} />;
}

function DemoTextarea(props: TextareaProps) {
  return <Textarea {...props} />;
}

const TEXTAREA_VARIANTS: { variant: TextareaVariant; label: string }[] = [
  { variant: "underline", label: "underline（抽屉说明）" },
  { variant: "boxed", label: "boxed（协作回复框）" },
];

const INPUT_VARIANTS: { variant: InputVariant; label: string }[] = [
  { variant: "underline", label: "underline（表单下划线）" },
  { variant: "boxed", label: "boxed（全框搜索/输入）" },
];

const INPUT_SIZES: InputSize[] = ["sm", "md"];

export function FormShowcase() {
  const [dateVal, setDateVal] = useState("2026-11-22");

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}>
            <span className={styles.kicker}>// INPUT &amp; DATE ALIGNMENT</span>
            <h2 className={styles.panelTitle}>Input 输入框（含 type=&quot;date&quot; 外观对齐）</h2>
          </div>
          <p className={styles.panelNote}>
            underline / boxed × sm (30px) / md (34px) · 文本与日期输入框等高齐平
          </p>
        </div>

        <div className={styles.formGrid}>
          {INPUT_VARIANTS.map(({ variant, label }) =>
            INPUT_SIZES.map((size) => (
              <div key={`${variant}-${size}`} className={styles.formCell}>
                <span className={styles.code}>
                  {label} · {size}
                </span>
                <DemoInput
                  variant={variant}
                  size={size}
                  placeholder={`示例输入（${variant} / ${size}）`}
                />
              </div>
            )),
          )}
          <div className={styles.formCell}>
            <span className={styles.code}>mono + readOnly</span>
            <DemoInput
              variant="underline"
              mono
              readOnly
              defaultValue="PMS-2026-042"
            />
          </div>
          <div className={styles.formCell}>
            <span className={styles.code}>invalid (aria-invalid)</span>
            <DemoInput
              variant="underline"
              invalid
              defaultValue="非法输入内容"
            />
          </div>
          <div className={styles.formCell}>
            <span className={styles.code}>disabled（underline）</span>
            <DemoInput variant="underline" disabled defaultValue="已禁用字段" />
          </div>
          <div className={styles.formCell}>
            <span className={styles.code}>disabled（boxed）</span>
            <DemoInput variant="boxed" disabled defaultValue="已禁用搜索框" />
          </div>
        </div>

        <div className={styles.subHead}>
          <span className={styles.code}>type=&quot;date&quot; 对齐验证（与文本输入同高同框）</span>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.formCell}>
            <span className={styles.desc}>普通文本对比（underline · md）</span>
            <DemoInput variant="underline" defaultValue="任务计划排期" />
          </div>
          <div className={styles.formCell}>
            <span className={styles.desc}>type=&quot;date&quot; 默认（underline · md）</span>
            <DemoInput
              variant="underline"
              type="date"
              value={dateVal}
              onChange={(e) => setDateVal(e.target.value)}
            />
          </div>
          <div className={styles.formCell}>
            <span className={styles.desc}>type=&quot;date&quot; invalid（underline）</span>
            <DemoInput
              variant="underline"
              type="date"
              invalid
              defaultValue="2026-10-01"
            />
          </div>
          <div className={styles.formCell}>
            <span className={styles.desc}>type=&quot;date&quot; disabled（underline）</span>
            <DemoInput
              variant="underline"
              type="date"
              disabled
              defaultValue="2026-11-22"
            />
          </div>
          <div className={styles.formCell}>
            <span className={styles.desc}>type=&quot;date&quot; boxed（sm · 30px）</span>
            <DemoInput
              variant="boxed"
              size="sm"
              type="date"
              defaultValue="2026-11-22"
            />
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}>
            <span className={styles.kicker}>// TEXTAREA</span>
            <h2 className={styles.panelTitle}>Textarea 多行文本域</h2>
          </div>
          <p className={styles.panelNote}>
            underline / boxed · 含 hover / focus-visible / invalid / readOnly / disabled
          </p>
        </div>

        <div className={styles.formGrid}>
          {TEXTAREA_VARIANTS.map(({ variant, label }) => (
            <div key={variant} className={styles.formCell}>
              <span className={styles.code}>{label}</span>
              <DemoTextarea
                variant={variant}
                placeholder="输入任务背景说明、验收标准或讨论回复…"
              />
            </div>
          ))}
          <div className={styles.formCell}>
            <span className={styles.code}>invalid（boxed）</span>
            <DemoTextarea
              variant="boxed"
              invalid
              defaultValue="内容长度超出限制示例"
            />
          </div>
          <div className={styles.formCell}>
            <span className={styles.code}>disabled（underline）</span>
            <DemoTextarea
              variant="underline"
              disabled
              defaultValue="归档项目或往期快照下的只读/禁用说明文本。"
            />
          </div>
        </div>
      </section>
    </>
  );
}
