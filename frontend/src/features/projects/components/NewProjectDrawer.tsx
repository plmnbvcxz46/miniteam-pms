import { useId } from "react";
import { FormDrawer } from "../../../components/patterns/FormDrawer";
import { Field } from "../../../components/ui/Field";
import { Input } from "../../../components/ui/Input";
import { Separator } from "../../../components/ui/Separator";
import { Textarea } from "../../../components/ui/Textarea";
import type { ProjectSave } from "../../../shared/types/global";
import { useNewProjectForm } from "../hooks/useNewProjectForm";
import styles from "./NewProjectDrawer.module.css";

interface NewProjectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** POST /projects，成功后由调用方关掉抽屉；失败抛错，message 显示在表单里 */
  onSubmit: (values: ProjectSave) => Promise<void>;
}

export function NewProjectDrawer({
  open,
  onOpenChange,
  onSubmit,
}: NewProjectDrawerProps) {
  const form = useNewProjectForm({ onSubmit });
  const startId = useId();
  const endId = useId();

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset();
    onOpenChange(next);
  };

  return (
    <FormDrawer
      open={open}
      onOpenChange={handleOpenChange}
      title="新建项目"
      submitLabel={form.submitting ? "新建中…" : "新建项目"}
      submitting={form.submitting}
      submitError={form.submitError || undefined}
      onSubmit={form.handleSubmit}
    >
      <Field label="项目名称" required error={form.nameError || undefined}>
        <Input
          variant="underline"
          autoFocus
          value={form.name}
          placeholder="例如 课程设计网站"
          onChange={(e) => form.handleNameChange(e.target.value)}
        />
      </Field>

      <Separator variant="dashed" />

      <Field
        label="项目说明"
        align="top"
        error={form.descriptionError || undefined}
      >
        <Textarea
          variant="underline"
          rows={3}
          value={form.description}
          placeholder="一句话说明做什么，可不填"
          onChange={(e) => form.handleDescriptionChange(e.target.value)}
        />
      </Field>

      <Separator variant="dashed" />

      <Field
        label="起止日期"
        required
        htmlFor={startId}
        error={form.dateError || undefined}
      >
        <div className={styles.dateRange}>
          <span className={styles.dateSeparator}>从</span>
          <Input
            id={startId}
            variant="underline"
            type="date"
            aria-label="项目开始日期"
            className={styles.dateInput}
            value={form.startDate}
            onChange={(e) => form.handleStartDateChange(e.target.value)}
          />
          <span className={styles.dateSeparator}>到</span>
          <Input
            id={endId}
            variant="underline"
            type="date"
            aria-label="项目计划结束日期"
            className={styles.dateInput}
            value={form.planEnd}
            onChange={(e) => form.handlePlanEndChange(e.target.value)}
          />
        </div>
      </Field>
    </FormDrawer>
  );
}
