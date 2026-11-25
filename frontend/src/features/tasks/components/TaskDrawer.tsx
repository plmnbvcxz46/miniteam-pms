import { useId, useState } from "react";
import { FormDrawer } from "../../../components/patterns/FormDrawer";
import { Field } from "../../../components/ui/Field";
import { Input } from "../../../components/ui/Input";
import { Separator } from "../../../components/ui/Separator";
import { Textarea } from "../../../components/ui/Textarea";
import { ToggleGroup, ToggleGroupItem } from "../../../components/ui/ToggleGroup";
import type { TaskDetail, TaskFormValues } from "../../../shared/types/task";
import { useTaskDrawer } from "../hooks/useTaskDrawer";
import AssigneePicker from "./AssigneePicker";
import styles from "./TaskDrawer.module.css";

interface TaskDrawerProps {
  /** 为空是新建，否则编辑这个任务 */
  taskId: number | null;
  tasks: Record<number, TaskDetail>;
  onClose: () => void;
  /** 保存失败时抛错，message 显示在表单里 */
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

function TaskScheduleAndDeps({
  form,
  planStartId,
}: {
  form: ReturnType<typeof useTaskDrawer>;
  planStartId: string;
}) {
  return (
    <>
      <Field
        label="排期"
        required
        htmlFor={planStartId}
        error={form.scheduleError || undefined}
      >
        <div className={styles.scheduleRow}>
          <span className={styles.scheduleText}>从</span>
          <Input
            id={planStartId}
            variant="underline"
            type="date"
            aria-label="计划开始日期"
            className={styles.dateInput}
            value={form.planStart}
            invalid={Boolean(form.scheduleError)}
            onChange={(e) => form.handlePlanStartChange(e.target.value)}
          />
          <span className={styles.scheduleText}>开始，做</span>
          <Input
            variant="underline"
            mono
            inputMode="numeric"
            aria-label="计划工作日"
            className={styles.daysInput}
            value={form.planDays}
            invalid={Boolean(form.scheduleError)}
            onChange={(e) => form.handlePlanDaysChange(e.target.value)}
          />
          <span className={styles.scheduleText}>个工作日</span>
        </div>
      </Field>

      <Separator variant="dashed" />

      <Field label="前置任务" align="top">
        {form.predecessorOptions.length > 0 ? (
          <ToggleGroup
            type="multiple"
            variant="chips"
            aria-label="前置任务"
            value={form.predecessorIds.map(String)}
            onValueChange={(ids) => form.setPredecessorIds(ids.map(Number))}
          >
            {form.predecessorOptions.map((item) => (
              <ToggleGroupItem key={item.id} value={String(item.id)}>
                {item.title}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ) : (
          <span className={styles.emptyText}>没有可选的前置任务</span>
        )}
      </Field>
    </>
  );
}

export default function TaskDrawer({
  taskId,
  tasks,
  onClose,
  onSubmit,
}: TaskDrawerProps) {
  const assigneeLabelId = useId();
  const assigneeInputId = useId();
  const planStartId = useId();
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const form = useTaskDrawer({ taskId, tasks, onSubmit });

  return (
    <FormDrawer
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={form.isEdit ? "编辑任务" : "新建任务"}
      submitLabel={form.isEdit ? "保存" : "创建任务"}
      submitting={form.submitting}
      submitError={form.submitError || undefined}
      onSubmit={form.handleSubmit}
    >
      <Field label="任务名称" required error={form.titleError || undefined}>
        <Input
          variant="underline"
          autoFocus
          value={form.title}
          placeholder="例如 菜单接口"
          onChange={(e) => form.handleTitleChange(e.target.value)}
        />
      </Field>

      <Separator variant="dashed" />

      <Field
        label={<span id={assigneeLabelId}>负责人</span>}
        htmlFor={assigneeInputId}
      >
        <AssigneePicker
          candidates={form.candidates}
          value={form.assigneeId}
          labelId={assigneeLabelId}
          inputId={assigneeInputId}
          query={assigneeQuery}
          onQueryChange={setAssigneeQuery}
          onChange={form.setAssigneeId}
        />
      </Field>

      <Separator variant="dashed" />

      <TaskScheduleAndDeps form={form} planStartId={planStartId} />

      <Separator variant="dashed" />

      <Field label="说明" align="top">
        <Textarea
          variant="underline"
          value={form.description}
          placeholder="验收标准、注意事项"
          onChange={(e) => form.setDescription(e.target.value)}
        />
      </Field>
    </FormDrawer>
  );
}
