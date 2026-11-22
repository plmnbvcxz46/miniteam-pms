import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Checkbox } from "../../components/ui/Checkbox";
import {
  Field,
  type FieldAlign,
  type FieldLayout,
  type FieldProps,
} from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";
import { Switch } from "../../components/ui/Switch";
import { Textarea } from "../../components/ui/Textarea";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/ToggleGroup";
import styles from "../UiShowcasePage.module.css";

function DemoField(props: FieldProps) {
  return <Field {...props} />;
}

const FIELD_LAYOUTS: FieldLayout[] = ["horizontal", "vertical"];
const FIELD_ALIGNS: FieldAlign[] = ["baseline", "top"];

export function FormFieldShowcase() {
  const [fieldLayout, setFieldLayout] = useState<FieldLayout>(FIELD_LAYOUTS[0]);
  const [showFieldError, setShowFieldError] = useState(true);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeading}>
          <span className={styles.kicker}>// FIELD · AUTO ARIA BINDING</span>
          <h2 className={styles.panelTitle}>Field 表单字段容器（与 6 类控件联动）</h2>
        </div>
        <p className={styles.panelNote}>useId() 自动打通 htmlFor / id / aria-invalid / aria-describedby，点标签可聚焦对应控件</p>
      </div>

      <div className={styles.sandboxControls}>
        <Button size="sm" variant={fieldLayout === "horizontal" ? "primary" : "default"} onClick={() => setFieldLayout("horizontal")}>horizontal（抽屉/设置）</Button>
        <Button size="sm" variant={fieldLayout === "vertical" ? "primary" : "default"} onClick={() => setFieldLayout("vertical")}>vertical（登录页）</Button>
        <Button size="sm" variant={showFieldError ? "danger" : "default"} onClick={() => setShowFieldError((v) => !v)}>校验错误态: {showFieldError ? "开" : "关"}</Button>
      </div>

      <div className={styles.fieldStack}>
        <DemoField label="任务标题" required layout={fieldLayout} align={FIELD_ALIGNS[0]} hint="最多 60 个字符，展示于看板卡片与时间线" error={showFieldError ? "请输入任务标题（自动触发 aria-invalid）" : undefined}>
          <Input placeholder="例如：完成阶段 3 基础表单组件封装" />
        </DemoField>

        <DemoField label="计划开始日" required layout={fieldLayout} align={FIELD_ALIGNS[0]} error={showFieldError ? "开始日期不能晚于项目截止日" : undefined}>
          <Input type="date" defaultValue="2026-11-22" />
        </DemoField>

        <DemoField label="项目角色" required layout={fieldLayout} align={FIELD_ALIGNS[0]} error={showFieldError ? "请选择成员项目角色" : undefined}>
          <Select>
            <SelectTrigger><SelectValue placeholder="请选择角色" /></SelectTrigger>
            <SelectContent><SelectItem value="PM">项目经理</SelectItem><SelectItem value="DEV">开发</SelectItem><SelectItem value="TESTER">测试</SelectItem></SelectContent>
          </Select>
        </DemoField>

        <DemoField label="任务说明" layout={fieldLayout} align={FIELD_ALIGNS[1]} hint="支持换行，作为评审与验收基准" error={showFieldError ? "补充验收要点后再提交" : undefined}>
          <Textarea placeholder="写清交付物、边界与验收方式…" />
        </DemoField>

        <DemoField label="编辑权限" layout={fieldLayout} align={FIELD_ALIGNS[1]} hint="控制该成员是否可维护项目排期">
          <Switch variant="track" defaultChecked />
        </DemoField>

        <DemoField label="状态标签" layout={fieldLayout} align={FIELD_ALIGNS[1]}>
          <ToggleGroup type="single" variant="chips" defaultValue="doing">
            <ToggleGroupItem value="doing">进行中</ToggleGroupItem>
            <ToggleGroupItem value="blocked">阻塞</ToggleGroupItem>
            <ToggleGroupItem value="done">已完成</ToggleGroupItem>
          </ToggleGroup>
        </DemoField>

        <DemoField label="确认声明" layout={fieldLayout} align={FIELD_ALIGNS[1]} error={showFieldError ? "请先勾选确认" : undefined}>
          <Checkbox label="已核对所有必填项与排期约束" />
        </DemoField>
      </div>
    </section>
  );
}
