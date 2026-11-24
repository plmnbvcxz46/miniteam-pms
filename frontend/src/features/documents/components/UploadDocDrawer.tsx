import { useId } from "react";
import { FormDrawer } from "../../../components/patterns/FormDrawer";
import {
  SearchDropdown,
  SearchDropdownRow,
} from "../../../components/patterns/SearchDropdown";
import { Field } from "../../../components/ui/Field";
import { Input } from "../../../components/ui/Input";
import { Separator } from "../../../components/ui/Separator";
import { ToggleGroup, ToggleGroupItem } from "../../../components/ui/ToggleGroup";
import type { BoundDocument } from "../../../shared/types/documents";
import type { TaskDetail } from "../../../shared/types/task";
import type { UploadSubmitPayload } from "../hooks/useDocumentsPage";
import { useUploadDocForm } from "../hooks/useUploadDocForm";
import FileDropzone from "./FileDropzone";
import styles from "./UploadDocDrawer.module.css";

interface UploadDocDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTargetDocId: number | null;
  defaultTaskId: number | null;
  revisingDocs: BoundDocument[];
  tasks: TaskDetail[];
  onSubmit: (payload: UploadSubmitPayload) => Promise<void>;
}

function TaskAssociationField({
  form,
  taskInputId,
}: {
  form: ReturnType<typeof useUploadDocForm>;
  taskInputId: string;
}) {
  return (
    <Field label="关联任务" htmlFor={taskInputId}>
      <SearchDropdown
        variant="line"
        inputId={taskInputId}
        ariaLabel="关联任务"
        items={form.filteredTasks}
        getKey={(task) => task.id}
        onPick={form.handlePickTask}
        isSelected={(task) => task.id === form.taskId}
        value={form.taskQuery}
        onChange={form.handleTaskQueryChange}
        placeholder="输入任务名筛选"
        headWord="TASKS"
        count={form.filteredTasks.length}
        emptyText="没有匹配的任务"
        openOn="focus"
        renderItem={(task) => (
          <SearchDropdownRow
            name={`T-${task.taskNo} ${task.title}`}
            sub={task.assignee?.realName ?? "未分配"}
          />
        )}
        footer={{
          content: "不关联任务（项目文档）",
          selected: form.taskId === null,
          onPick: form.handleClearTask,
        }}
      />
    </Field>
  );
}

function UploadDocFields({
  form,
  revisingDocs,
  taskInputId,
}: {
  form: ReturnType<typeof useUploadDocForm>;
  revisingDocs: BoundDocument[];
  taskInputId: string;
}) {
  return (
    <div className={styles.fields}>
      <FileDropzone
        file={form.selectedFile}
        error={form.fileError || undefined}
        onFileSelect={form.handleFileSelect}
      />

      <Separator variant="dashed" />

      <Field label="上传到" required align="top">
        <ToggleGroup
          type="single"
          variant="chips"
          aria-label="上传目标"
          value={form.targetDocId === null ? "new" : String(form.targetDocId)}
          onValueChange={(next) => {
            if (!next) return;
            form.handleTargetChange(next === "new" ? null : Number(next));
          }}
        >
          <ToggleGroupItem value="new">新建文档</ToggleGroupItem>
          {revisingDocs.map((doc) => (
            <ToggleGroupItem key={doc.id} value={String(doc.id)}>
              {doc.n}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      {form.isNewDoc && (
        <>
          <Separator variant="dashed" />
          <Field
            label="文档名称"
            required
            error={form.docNameError || undefined}
          >
            <Input
              variant="underline"
              placeholder="例如 需求规格说明书"
              value={form.docName}
              onChange={(e) => form.handleDocNameChange(e.target.value)}
              invalid={Boolean(form.docNameError)}
            />
          </Field>
        </>
      )}

      <Separator variant="dashed" />

      <Field label="版本说明" required error={form.noteError || undefined}>
        <Input
          variant="underline"
          placeholder="这一版改了什么"
          value={form.note}
          onChange={(e) => form.handleNoteChange(e.target.value)}
          invalid={Boolean(form.noteError)}
        />
      </Field>

      {form.isNewDoc && (
        <>
          <Separator variant="dashed" />
          <TaskAssociationField form={form} taskInputId={taskInputId} />
        </>
      )}
    </div>
  );
}

export default function UploadDocDrawer({
  isOpen,
  onClose,
  initialTargetDocId,
  defaultTaskId,
  revisingDocs,
  tasks,
  onSubmit,
}: UploadDocDrawerProps) {
  const taskInputId = useId();
  const form = useUploadDocForm({
    initialTargetDocId,
    defaultTaskId,
    revisingDocs,
    tasks,
    onSubmit,
    onClose,
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  return (
    <FormDrawer
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="上传"
      accentTitle="文档"
      submitLabel={form.submitting ? "上传中…" : "确认上传"}
      submitting={form.submitting}
      submitError={form.submitError || undefined}
      onSubmit={form.handleSubmit}
    >
      <UploadDocFields
        form={form}
        revisingDocs={revisingDocs}
        taskInputId={taskInputId}
      />
    </FormDrawer>
  );
}
