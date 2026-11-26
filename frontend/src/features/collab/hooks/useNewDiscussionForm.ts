import { useState, type FormEvent } from "react";
import type {
  DiscussionFormValues,
  MentionValue,
} from "../../../shared/types/collab";
import type { DocumentRef } from "../../../shared/types/global";
import type { TaskDetail } from "../../../shared/types/task";
import { getTaskDocumentRefs } from "../utils/activityLink";
import { finalizeMention } from "../utils/format";

interface UseNewDiscussionFormParams {
  tasks: Record<number, TaskDetail>;
  initialTaskId: number | null;
  onSubmit: (values: DiscussionFormValues) => Promise<void>;
}

const EMPTY_CONTENT: MentionValue = { text: "", mentions: [], documents: [] };

function removeStaleDocuments(content: MentionValue, kept: DocumentRef[]) {
  const removed = content.documents.filter(
    (doc) => !kept.some((item) => item.id === doc.id),
  );
  if (removed.length === 0) return { nextContent: content, notice: "" };
  const text = removed.reduce(
    (acc, doc) =>
      acc.split(`@${doc.name} `).join("").split(`@${doc.name}`).join(""),
    content.text,
  );
  return {
    nextContent: {
      ...content,
      text,
      documents: content.documents.filter((doc) =>
        kept.some((item) => item.id === doc.id),
      ),
    },
    notice: `已移除不属于新任务的文件：${removed.map((doc) => doc.name).join("、")}`,
  };
}

export function useNewDiscussionForm({
  tasks,
  initialTaskId,
  onSubmit,
}: UseNewDiscussionFormParams) {
  const [title, setTitle] = useState("");
  const [taskId, setTaskId] = useState<number | null>(initialTaskId);
  const [content, setContent] = useState<MentionValue>(EMPTY_CONTENT);
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const taskOptions = Object.values(tasks)
    .filter((task) => task.status !== "DONE" || task.id === taskId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const documents = getTaskDocumentRefs(taskId, tasks);

  const handleChangeTask = (nextId: number | null) => {
    setTaskId(nextId);
    const { nextContent, notice: nextNotice } = removeStaleDocuments(
      content,
      getTaskDocumentRefs(nextId, tasks),
    );
    setContent(nextContent);
    setNotice(nextNotice);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const final = finalizeMention(content);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) setTitleError("填写标题后才能发起");
    if (!final.text) setContentError("填写第一条消息后才能发起");
    if (!trimmedTitle || !final.text) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit({ title: trimmedTitle, taskId, content: final });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "发起失败，请稍后再试",
      );
      setSubmitting(false);
    }
  };

  return {
    title,
    taskId,
    content,
    titleError,
    contentError,
    notice,
    submitting,
    submitError,
    taskOptions,
    documents,
    handleTitleChange: (next: string) => {
      setTitle(next);
      setTitleError("");
    },
    handleChangeTask,
    handleContentChange: (next: MentionValue) => {
      setContent(next);
      setContentError("");
      setNotice("");
    },
    handleSubmit,
  };
}
