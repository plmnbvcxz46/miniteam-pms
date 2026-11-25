import { useRef } from "react";
import { FormDrawer } from "../../../components/patterns/FormDrawer";
import { Field } from "../../../components/ui/Field";
import { Input } from "../../../components/ui/Input";
import { Separator } from "../../../components/ui/Separator";
import { ToggleGroup, ToggleGroupItem } from "../../../components/ui/ToggleGroup";
import type { DiscussionFormValues, MentionValue } from "../../../shared/types/collab";
import type { UserBrief } from "../../../shared/types/global";
import type { TaskDetail } from "../../../shared/types/task";
import { useNewDiscussionForm } from "../hooks/useNewDiscussionForm";
import { MentionInput } from "./MentionInput";
import styles from "./NewDiscussionDrawer.module.css";

interface NewDiscussionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTaskId: number | null;
  lockTask: boolean;
  tasks: Record<number, TaskDetail>;
  mentionUsers: UserBrief[];
  onSubmit: (values: DiscussionFormValues) => Promise<void>;
}

function TaskChipsField({
  taskId,
  taskOptions,
  lockTask,
  notice,
  onChangeTask,
}: {
  taskId: number | null;
  taskOptions: TaskDetail[];
  lockTask: boolean;
  notice: string;
  onChangeTask: (id: number | null) => void;
}) {
  return (
    <Field
      label="关联任务"
      layout="vertical"
      hint={lockTask ? "已锁定来自任务页的关联任务" : "可选，关联后可在讨论中直接 @ 该任务下的文件"}
    >
      <ToggleGroup
        type="single"
        variant="chips"
        disabled={lockTask}
        value={taskId === null ? "none" : String(taskId)}
        onValueChange={(val) => {
          if (!val || lockTask) return;
          onChangeTask(val === "none" ? null : Number(val));
        }}
      >
        <ToggleGroupItem value="none">不关联任务</ToggleGroupItem>
        {taskOptions.map((task) => (
          <ToggleGroupItem key={task.id} value={String(task.id)}>
            T-{task.taskNo} {task.title}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {notice && <p className={styles.notice}>{notice}</p>}
    </Field>
  );
}

export function NewDiscussionDrawer({
  open,
  onOpenChange,
  initialTaskId,
  lockTask,
  tasks,
  mentionUsers,
  onSubmit,
}: NewDiscussionDrawerProps) {
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const form = useNewDiscussionForm({ tasks, initialTaskId, onSubmit });

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      kicker="// NEW DISCUSSION"
      title="发起"
      accentTitle="讨论"
      submitLabel={form.submitting ? "发起中…" : "发起讨论"}
      submitting={form.submitting}
      submitError={form.submitError || undefined}
      onSubmit={form.handleSubmit}
    >
      <Field
        label="讨论标题"
        required
        layout="vertical"
        error={form.titleError || undefined}
      >
        <Input
          variant="underline"
          value={form.title}
          maxLength={80}
          placeholder="一句话说清要讨论什么（例如：首页瀑布流改版方案）"
          onChange={(e) => form.handleTitleChange(e.target.value)}
        />
      </Field>
      <TaskChipsField
        taskId={form.taskId}
        taskOptions={form.taskOptions}
        lockTask={lockTask}
        notice={form.notice}
        onChangeTask={form.handleChangeTask}
      />
      <Separator variant="dashed" />
      <Field
        label="第一条消息"
        required
        layout="vertical"
        error={form.contentError || undefined}
        hint="输入 @ 可提及成员或关联任务下的文件 · Ctrl / Cmd + Enter 提交"
      >
        <MentionInput
          variant="underline"
          value={form.content}
          users={mentionUsers}
          documents={form.documents}
          rows={4}
          invalid={Boolean(form.contentError)}
          placeholder="描述问题背景、阻塞卡点或需要谁拍板……"
          onChange={(next: MentionValue) => form.handleContentChange(next)}
          onSubmitShortcut={() => submitBtnRef.current?.click()}
        />
      </Field>
      <button ref={submitBtnRef} type="submit" hidden aria-hidden="true" tabIndex={-1} />
    </FormDrawer>
  );
}
