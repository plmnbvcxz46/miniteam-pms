import { useMemo, useState, type FormEvent } from "react";
import type { BoundDocument } from "../../../shared/types/documents";
import type { TaskDetail } from "../../../shared/types/task";
import type { UploadSubmitPayload } from "./useDocumentsPage";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_EXT = [".doc", ".docx", ".pdf", ".md"] as const;

export interface UseUploadDocFormOptions {
  initialTargetDocId: number | null;
  defaultTaskId: number | null;
  revisingDocs: BoundDocument[];
  tasks: TaskDetail[];
  onSubmit: (payload: UploadSubmitPayload) => Promise<void>;
  onClose: () => void;
}

function validateFile(file: File | null): string {
  if (!file) return "请先选择要上传的文件";
  if (file.size > MAX_FILE_SIZE) return "文件大小不能超过 20 MB";
  const lower = file.name.toLowerCase();
  const validExt = ALLOWED_EXT.some((ext) => lower.endsWith(ext));
  if (!validExt) {
    return "仅支持 Word（.doc / .docx）、PDF（.pdf）、Markdown（.md）";
  }
  return "";
}

function formatTaskLabel(task: TaskDetail | undefined): string {
  return task ? `T-${task.taskNo} ${task.title}` : "";
}

function filterTaskList(tasks: TaskDetail[], query: string): TaskDetail[] {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter((t) => {
    const label = `t-${t.taskNo} ${t.title}`.toLowerCase();
    const assignee = t.assignee?.realName.toLowerCase() ?? "";
    return label.includes(q) || assignee.includes(q);
  });
}

function useTaskPicker(tasks: TaskDetail[], defaultTaskId: number | null) {
  const initialTask = defaultTaskId
    ? tasks.find((t) => t.id === defaultTaskId)
    : undefined;
  const [taskId, setTaskId] = useState<number | null>(
    () => initialTask?.id ?? null,
  );
  const [taskQuery, setTaskQuery] = useState(() =>
    formatTaskLabel(initialTask),
  );
  const filteredTasks = useMemo(
    () => filterTaskList(tasks, taskQuery),
    [tasks, taskQuery],
  );

  const handlePickTask = (task: TaskDetail) => {
    setTaskId(task.id);
    setTaskQuery(formatTaskLabel(task));
  };

  const handleTaskQueryChange = (value: string) => {
    setTaskQuery(value);
    if (!value.trim()) setTaskId(null);
  };

  const handleClearTask = () => {
    setTaskId(null);
    setTaskQuery("");
  };

  return {
    taskId,
    taskQuery,
    filteredTasks,
    handlePickTask,
    handleTaskQueryChange,
    handleClearTask,
  };
}

function useFormValidationAndSubmit({
  isNewDoc,
  targetDocId,
  selectedFile,
  docName,
  note,
  taskId,
  onSubmit,
  onClose,
}: {
  isNewDoc: boolean;
  targetDocId: number | null;
  selectedFile: File | null;
  docName: string;
  note: string;
  taskId: number | null;
  onSubmit: (payload: UploadSubmitPayload) => Promise<void>;
  onClose: () => void;
}) {
  const [fileError, setFileError] = useState("");
  const [docNameError, setDocNameError] = useState("");
  const [noteError, setNoteError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fErr = validateFile(selectedFile);
    const nErr = isNewDoc && !docName.trim() ? "请输入文档名称" : "";
    const vErr = !note.trim() ? "请填写版本说明" : "";
    setFileError(fErr);
    setDocNameError(nErr);
    setNoteError(vErr);
    setSubmitError("");
    if (fErr || nErr || vErr || !selectedFile) return;

    setSubmitting(true);
    try {
      await onSubmit({
        targetDocId,
        file: selectedFile,
        name: docName.trim(),
        taskId: isNewDoc ? taskId : null,
        changeNote: note.trim(),
      });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "上传失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    fileError,
    setFileError,
    docNameError,
    setDocNameError,
    noteError,
    setNoteError,
    submitError,
    setSubmitError,
    submitting,
    handleSubmit,
  };
}

export function useUploadDocForm({
  initialTargetDocId,
  defaultTaskId,
  revisingDocs,
  tasks,
  onSubmit,
  onClose,
}: UseUploadDocFormOptions) {
  const validInitialTarget =
    initialTargetDocId !== null &&
    revisingDocs.some((d) => d.id === initialTargetDocId)
      ? initialTargetDocId
      : null;

  const [targetDocId, setTargetDocId] = useState<number | null>(validInitialTarget);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [note, setNote] = useState("");

  const taskPicker = useTaskPicker(tasks, defaultTaskId);
  const isNewDoc = targetDocId === null;
  const validation = useFormValidationAndSubmit({
    isNewDoc,
    targetDocId,
    selectedFile,
    docName,
    note,
    taskId: taskPicker.taskId,
    onSubmit,
    onClose,
  });

  const handleFileSelect = (file: File | null) => {
    validation.setSubmitError("");
    const err = validateFile(file);
    if (err) {
      setSelectedFile(null);
      validation.setFileError(err);
      return;
    }
    validation.setFileError("");
    setSelectedFile(file);
    if (isNewDoc && !docName.trim() && file) {
      setDocName(file.name.replace(/\.[^.]+$/, ""));
      validation.setDocNameError("");
    }
  };

  return {
    isNewDoc,
    targetDocId,
    selectedFile,
    docName,
    note,
    ...validation,
    ...taskPicker,
    handleFileSelect,
    handleTargetChange: (nextId: number | null) => {
      setTargetDocId(nextId);
      validation.setDocNameError("");
      validation.setSubmitError("");
    },
    handleDocNameChange: (value: string) => {
      setDocName(value);
      if (value.trim()) validation.setDocNameError("");
    },
    handleNoteChange: (value: string) => {
      setNote(value);
      if (value.trim()) validation.setNoteError("");
    },
  };
}
