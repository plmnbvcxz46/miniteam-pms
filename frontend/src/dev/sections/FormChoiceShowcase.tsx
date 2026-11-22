import { useState } from "react";
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
import styles from "../UiShowcasePage.module.css";

function DemoSelectTrigger(props: SelectTriggerProps) { return <SelectTrigger {...props} />; }
function DemoSelectContent(props: SelectContentProps) { return <SelectContent {...props} />; }
function DemoSelectItem(props: SelectItemProps) { return <SelectItem {...props} />; }
function DemoSelectLabel(props: SelectLabelProps) { return <SelectLabel {...props} />; }
function DemoSelectSeparator(props: SelectSeparatorProps) { return <SelectSeparator {...props} />; }
function DemoToggleGroup(props: ToggleGroupProps) { return <ToggleGroup {...props} />; }
function DemoToggleGroupItem(props: ToggleGroupItemProps) { return <ToggleGroupItem {...props} />; }

const TOGGLE_VARIANT_NOTE: Record<ToggleGroupVariant, string> = {
  segmented: "segmented（连体分段单选）",
  chips: "chips（流式单/多选芯片）",
};

function SelectShowcasePanel() {
  const [roleVal, setRoleVal] = useState("DEV");

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeading}>
          <span className={styles.kicker}>// SELECT · RADIX UI</span>
          <h2 className={styles.panelTitle}>Select 下拉选择器</h2>
        </div>
        <p className={styles.panelNote}>underline 触发器（34px）· 展开箭头 180° 翻转 · 硬阴影暖纸浮层</p>
      </div>
      <div className={styles.formGrid}>
        <div className={styles.formCell}>
          <span className={styles.code}>default（受控 · 分组与分割线）</span>
          <Select value={roleVal} onValueChange={setRoleVal}>
            <DemoSelectTrigger aria-label="项目角色"><SelectValue placeholder="请选择项目角色" /></DemoSelectTrigger>
            <DemoSelectContent>
              <SelectGroup><DemoSelectLabel>管理角色</DemoSelectLabel><DemoSelectItem value="PM">项目经理（PM）</DemoSelectItem></SelectGroup>
              <DemoSelectSeparator />
              <SelectGroup>
                <DemoSelectLabel>研发与测试</DemoSelectLabel>
                <DemoSelectItem value="DEV">开发工程师</DemoSelectItem>
                <DemoSelectItem value="TESTER">测试工程师</DemoSelectItem>
                <DemoSelectItem value="GUEST" disabled>外部访客（已禁用选项）</DemoSelectItem>
              </SelectGroup>
            </DemoSelectContent>
          </Select>
        </div>
        <div className={styles.formCell}>
          <span className={styles.code}>placeholder + invalid</span>
          <Select>
            <DemoSelectTrigger invalid aria-label="必选文档类型"><SelectValue placeholder="请选择关联任务（必填）" /></DemoSelectTrigger>
            <DemoSelectContent><DemoSelectItem value="t1">T-01 认证模块联调</DemoSelectItem><DemoSelectItem value="t2">T-02 甘特图关键路径</DemoSelectItem></DemoSelectContent>
          </Select>
        </div>
        <div className={styles.formCell}>
          <span className={styles.code}>disabled</span>
          <Select defaultValue="PM" disabled>
            <DemoSelectTrigger aria-label="禁用角色选择"><SelectValue /></DemoSelectTrigger>
            <DemoSelectContent><DemoSelectItem value="PM">项目经理（PM）</DemoSelectItem></DemoSelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}

export function FormChoiceShowcase() {
  const [boardFilter, setBoardFilter] = useState("all");
  const [taskStatus, setTaskStatus] = useState("doing");
  const [deps, setDeps] = useState<string[]>(["T-01", "T-03"]);

  return (
    <>
      <SelectShowcasePanel />

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}>
            <span className={styles.kicker}>// TOGGLE GROUP · RADIX UI</span>
            <h2 className={styles.panelTitle}>ToggleGroup 分段与芯片切换组</h2>
          </div>
          <p className={styles.panelNote}>承接全站原 aria-pressed 按钮 · 支持 segmented / chips 与 single / multiple</p>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.formCell}>
            <span className={styles.code}>{TOGGLE_VARIANT_NOTE.segmented}</span>
            <DemoToggleGroup type="single" variant="segmented" value={boardFilter} onValueChange={(v) => { if (v) setBoardFilter(v); }} aria-label="看板筛选">
              <DemoToggleGroupItem value="all">全部</DemoToggleGroupItem>
              <DemoToggleGroupItem value="mine">我的</DemoToggleGroupItem>
              <DemoToggleGroupItem value="critical">关键路径</DemoToggleGroupItem>
            </DemoToggleGroup>
          </div>
          <div className={styles.formCell}>
            <span className={styles.code}>{TOGGLE_VARIANT_NOTE.chips}（单选 + 单项禁用）</span>
            <DemoToggleGroup type="single" variant="chips" value={taskStatus} onValueChange={(v) => { if (v) setTaskStatus(v); }} aria-label="任务状态">
              <DemoToggleGroupItem value="todo" disabled>待开始（不可回退）</DemoToggleGroupItem>
              <DemoToggleGroupItem value="doing">进行中</DemoToggleGroupItem>
              <DemoToggleGroupItem value="blocked">阻塞</DemoToggleGroupItem>
              <DemoToggleGroupItem value="done">已完成</DemoToggleGroupItem>
            </DemoToggleGroup>
          </div>
          <div className={styles.formCell}>
            <span className={styles.code}>chips（多选 · 前置任务依赖）</span>
            <DemoToggleGroup type="multiple" variant="chips" value={deps} onValueChange={setDeps} aria-label="前置依赖">
              <DemoToggleGroupItem value="T-01">T-01 需求评审</DemoToggleGroupItem>
              <DemoToggleGroupItem value="T-02">T-02 接口联调</DemoToggleGroupItem>
              <DemoToggleGroupItem value="T-03">T-03 权限验收</DemoToggleGroupItem>
            </DemoToggleGroup>
          </div>
        </div>
      </section>
    </>
  );
}
