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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type SelectContentProps,
  type SelectItemProps,
  type SelectLabelProps,
  type SelectSeparatorProps,
  type SelectTriggerProps,
} from "../../components/ui/Select";
import {
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupItemProps,
  type ToggleGroupProps,
  type ToggleGroupVariant,
} from "../../components/ui/ToggleGroup";
import {
  Field,
  type FieldAlign,
  type FieldLayout,
  type FieldProps,
} from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import styles from "../UiShowcasePage.module.css";

function DemoInput(props: InputProps) {
  return <Input {...props} />;
}

function DemoTextarea(props: TextareaProps) {
  return <Textarea {...props} />;
}

function DemoCheckbox(props: CheckboxProps) {
  return <Checkbox {...props} />;
}

function DemoSwitch(props: SwitchProps) {
  return <Switch {...props} />;
}

function DemoSelectTrigger(props: SelectTriggerProps) {
  return <SelectTrigger {...props} />;
}

function DemoSelectContent(props: SelectContentProps) {
  return <SelectContent {...props} />;
}

function DemoSelectItem(props: SelectItemProps) {
  return <SelectItem {...props} />;
}

function DemoSelectLabel(props: SelectLabelProps) {
  return <SelectLabel {...props} />;
}

function DemoSelectSeparator(props: SelectSeparatorProps) {
  return <SelectSeparator {...props} />;
}

function DemoToggleGroup(props: ToggleGroupProps) {
  return <ToggleGroup {...props} />;
}

function DemoToggleGroupItem(props: ToggleGroupItemProps) {
  return <ToggleGroupItem {...props} />;
}

const TOGGLE_VARIANT_NOTE: Record<ToggleGroupVariant, string> = {
  segmented: "segmented（连体分段单选）",
  chips: "chips（流式单/多选芯片）",
};

function DemoField(props: FieldProps) {
  return <Field {...props} />;
}

const FIELD_LAYOUTS: FieldLayout[] = ["horizontal", "vertical"];
const FIELD_ALIGNS: FieldAlign[] = ["baseline", "top"];

const SWITCH_VARIANTS: { variant: SwitchVariant; title: string }[] = [
  { variant: "track", title: "track（单轨 · 成员权限）" },
  { variant: "segmented", title: "segmented（双格 · 账号启停）" },
];

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
  const [rememberMe, setRememberMe] = useState<CheckboxCheckedState>(true);
  const [permOn, setPermOn] = useState(true);
  const [acctActive, setAcctActive] = useState(true);
  const [roleVal, setRoleVal] = useState("DEV");
  const [boardFilter, setBoardFilter] = useState("all");
  const [taskStatus, setTaskStatus] = useState("doing");
  const [deps, setDeps] = useState<string[]>(["T-01", "T-03"]);
  const [fieldLayout, setFieldLayout] = useState<FieldLayout>(FIELD_LAYOUTS[0]);
  const [showFieldError, setShowFieldError] = useState(true);

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
          <DemoCheckbox
            label="记住登录账号（受控）"
            checked={rememberMe}
            onCheckedChange={setRememberMe}
          />
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

        <div className={styles.formGrid}>
          {SWITCH_VARIANTS.map(({ variant, title }) => (
            <div key={variant} className={styles.formCell}>
              <span className={styles.code}>{title}</span>
              <div className={styles.row}>
                <DemoSwitch
                  variant={variant}
                  aria-label={`${title} 交互示例`}
                  checked={variant === "track" ? permOn : acctActive}
                  onCheckedChange={
                    variant === "track" ? setPermOn : setAcctActive
                  }
                />
                <DemoSwitch
                  variant={variant}
                  aria-label={`${title} 加载态`}
                  defaultChecked
                  loading
                />
                <DemoSwitch
                  variant={variant}
                  aria-label={`${title} 禁用态`}
                  defaultChecked
                  disabled
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}>
            <span className={styles.kicker}>// SELECT · RADIX UI</span>
            <h2 className={styles.panelTitle}>Select 下拉选择器</h2>
          </div>
          <p className={styles.panelNote}>
            underline 触发器（34px）· 展开箭头 180° 翻转 · 硬阴影暖纸浮层
          </p>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formCell}>
            <span className={styles.code}>default（受控 · 分组与分割线）</span>
            <Select value={roleVal} onValueChange={setRoleVal}>
              <DemoSelectTrigger aria-label="项目角色">
                <SelectValue placeholder="请选择项目角色" />
              </DemoSelectTrigger>
              <DemoSelectContent>
                <SelectGroup>
                  <DemoSelectLabel>管理角色</DemoSelectLabel>
                  <DemoSelectItem value="PM">项目经理（PM）</DemoSelectItem>
                </SelectGroup>
                <DemoSelectSeparator />
                <SelectGroup>
                  <DemoSelectLabel>研发与测试</DemoSelectLabel>
                  <DemoSelectItem value="DEV">开发工程师</DemoSelectItem>
                  <DemoSelectItem value="TESTER">测试工程师</DemoSelectItem>
                  <DemoSelectItem value="GUEST" disabled>
                    外部访客（已禁用选项）
                  </DemoSelectItem>
                </SelectGroup>
              </DemoSelectContent>
            </Select>
          </div>
          <div className={styles.formCell}>
            <span className={styles.code}>placeholder + invalid</span>
            <Select>
              <DemoSelectTrigger invalid aria-label="必选文档类型">
                <SelectValue placeholder="请选择关联任务（必填）" />
              </DemoSelectTrigger>
              <DemoSelectContent>
                <DemoSelectItem value="t1">T-01 认证模块联调</DemoSelectItem>
                <DemoSelectItem value="t2">T-02 甘特图关键路径</DemoSelectItem>
              </DemoSelectContent>
            </Select>
          </div>
          <div className={styles.formCell}>
            <span className={styles.code}>disabled</span>
            <Select defaultValue="PM" disabled>
              <DemoSelectTrigger aria-label="禁用角色选择">
                <SelectValue />
              </DemoSelectTrigger>
              <DemoSelectContent>
                <DemoSelectItem value="PM">项目经理（PM）</DemoSelectItem>
              </DemoSelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}>
            <span className={styles.kicker}>// TOGGLE GROUP · RADIX UI</span>
            <h2 className={styles.panelTitle}>ToggleGroup 分段与芯片切换组</h2>
          </div>
          <p className={styles.panelNote}>
            承接全站原 aria-pressed 按钮 · 支持 segmented / chips 与 single / multiple
          </p>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formCell}>
            <span className={styles.code}>{TOGGLE_VARIANT_NOTE.segmented}</span>
            <DemoToggleGroup
              type="single"
              variant="segmented"
              value={boardFilter}
              onValueChange={(v) => {
                if (v) setBoardFilter(v);
              }}
              aria-label="看板筛选"
            >
              <DemoToggleGroupItem value="all">全部</DemoToggleGroupItem>
              <DemoToggleGroupItem value="mine">我的</DemoToggleGroupItem>
              <DemoToggleGroupItem value="critical">关键路径</DemoToggleGroupItem>
            </DemoToggleGroup>
          </div>

          <div className={styles.formCell}>
            <span className={styles.code}>
              {TOGGLE_VARIANT_NOTE.chips}（单选 + 单项禁用）
            </span>
            <DemoToggleGroup
              type="single"
              variant="chips"
              value={taskStatus}
              onValueChange={(v) => {
                if (v) setTaskStatus(v);
              }}
              aria-label="任务状态"
            >
              <DemoToggleGroupItem value="todo" disabled>
                待开始（不可回退）
              </DemoToggleGroupItem>
              <DemoToggleGroupItem value="doing">进行中</DemoToggleGroupItem>
              <DemoToggleGroupItem value="blocked">阻塞</DemoToggleGroupItem>
              <DemoToggleGroupItem value="done">已完成</DemoToggleGroupItem>
            </DemoToggleGroup>
          </div>

          <div className={styles.formCell}>
            <span className={styles.code}>chips（多选 · 前置任务依赖）</span>
            <DemoToggleGroup
              type="multiple"
              variant="chips"
              value={deps}
              onValueChange={setDeps}
              aria-label="前置依赖"
            >
              <DemoToggleGroupItem value="T-01">T-01 需求评审</DemoToggleGroupItem>
              <DemoToggleGroupItem value="T-02">T-02 接口联调</DemoToggleGroupItem>
              <DemoToggleGroupItem value="T-03">T-03 权限验收</DemoToggleGroupItem>
            </DemoToggleGroup>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}>
            <span className={styles.kicker}>// FIELD · AUTO ARIA BINDING</span>
            <h2 className={styles.panelTitle}>
              Field 表单字段容器（与 6 类控件联动）
            </h2>
          </div>
          <p className={styles.panelNote}>
            useId() 自动打通 htmlFor / id / aria-invalid / aria-describedby，点标签可聚焦对应控件
          </p>
        </div>

        <div className={styles.sandboxControls}>
          <Button
            size="sm"
            variant={fieldLayout === "horizontal" ? "primary" : "default"}
            onClick={() => setFieldLayout("horizontal")}
          >
            horizontal（抽屉/设置）
          </Button>
          <Button
            size="sm"
            variant={fieldLayout === "vertical" ? "primary" : "default"}
            onClick={() => setFieldLayout("vertical")}
          >
            vertical（登录页）
          </Button>
          <Button
            size="sm"
            variant={showFieldError ? "danger" : "default"}
            onClick={() => setShowFieldError((v) => !v)}
          >
            校验错误态: {showFieldError ? "开" : "关"}
          </Button>
        </div>

        <div className={styles.fieldStack}>
          <DemoField
            label="任务标题"
            required
            layout={fieldLayout}
            align={FIELD_ALIGNS[0]}
            hint="最多 60 个字符，展示于看板卡片与时间线"
            error={showFieldError ? "请输入任务标题（自动触发 aria-invalid）" : undefined}
          >
            <Input placeholder="例如：完成阶段 3 基础表单组件封装" />
          </DemoField>

          <DemoField
            label="计划开始日"
            required
            layout={fieldLayout}
            align={FIELD_ALIGNS[0]}
            error={showFieldError ? "开始日期不能晚于项目截止日" : undefined}
          >
            <Input type="date" defaultValue="2026-11-22" />
          </DemoField>

          <DemoField
            label="项目角色"
            required
            layout={fieldLayout}
            align={FIELD_ALIGNS[0]}
            error={showFieldError ? "请选择成员项目角色" : undefined}
          >
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="请选择角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PM">项目经理</SelectItem>
                <SelectItem value="DEV">开发</SelectItem>
                <SelectItem value="TESTER">测试</SelectItem>
              </SelectContent>
            </Select>
          </DemoField>

          <DemoField
            label="任务说明"
            layout={fieldLayout}
            align={FIELD_ALIGNS[1]}
            hint="支持换行，作为评审与验收基准"
            error={showFieldError ? "补充验收要点后再提交" : undefined}
          >
            <Textarea placeholder="写清交付物、边界与验收方式…" />
          </DemoField>

          <DemoField
            label="编辑权限"
            layout={fieldLayout}
            align={FIELD_ALIGNS[1]}
            hint="控制该成员是否可维护项目排期"
          >
            <Switch variant="track" defaultChecked />
          </DemoField>

          <DemoField
            label="状态标签"
            layout={fieldLayout}
            align={FIELD_ALIGNS[1]}
          >
            <ToggleGroup type="single" variant="chips" defaultValue="doing">
              <ToggleGroupItem value="doing">进行中</ToggleGroupItem>
              <ToggleGroupItem value="blocked">阻塞</ToggleGroupItem>
              <ToggleGroupItem value="done">已完成</ToggleGroupItem>
            </ToggleGroup>
          </DemoField>

          <DemoField
            label="确认声明"
            layout={fieldLayout}
            align={FIELD_ALIGNS[1]}
            error={showFieldError ? "请先勾选确认" : undefined}
          >
            <Checkbox label="已核对所有必填项与排期约束" />
          </DemoField>
        </div>
      </section>
    </>
  );
}
