import React, { useState } from "react";
import Drawer from "../../../../components/Drawer";
import type { DocumentItem } from "../../../../types/documents";

interface UploadDocDrawerProps {
  /** 是否打开 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 所有文档列表（用于选择上传到已有文档） */
  docs: DocumentItem[];
  /** 目标文档 ID（若指定且对应文档未定稿，默认选中它） */
  initialTargetDocId?: number | null;
  /** 新建文档时可关联的任务 */
  taskOptions: { id: number; name: string }[];
  /** 新建文档时预选的任务（如从任务详情进来），不在下拉选项里时会补进去 */
  initialTask?: { id: number; name: string } | null;
  /** 提交上传的回调；失败时抛错，message 显示在抽屉里，成功后抽屉关闭 */
  onSubmit?: (data: {
    file: File;
    docName: string; // 文档业务名称（支持用户自定义修改或预填）
    targetDocId: number | "new"; // "new" 或是已有文档的 id
    note: string;
    taskId: number | null; // 新建文档时关联的任务，不关联为空
  }) => Promise<void>;
}

/** 后端接受的文件：Word、PDF、Markdown，单个不超过 20 MB */
const ALLOWED_EXTENSIONS = ["doc", "docx", "pdf", "md"];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

/** 选中的文件不合规时返回原因 */
function checkFile(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return "只支持 Word、PDF、Markdown 文件（doc、docx、pdf、md）";
  }
  if (file.size === 0) return "这个文件是空的";
  if (file.size > MAX_FILE_SIZE) return "文件太大，单个文件不超过 20 MB";
  return null;
}

/** 关着时不渲染，打开时才挂上表单，每次打开都是新的表单状态 */
export default function UploadDocDrawer(props: UploadDocDrawerProps) {
  return props.isOpen ? <UploadDocForm {...props} /> : null;
}

function UploadDocForm({
  onClose,
  docs,
  initialTargetDocId,
  taskOptions: availableTasks,
  initialTask,
  onSubmit,
}: UploadDocDrawerProps) {
  // 未定稿的文档选项
  const revisingDocOptions = docs.filter(
    (d) => !d.final
  );

  // 默认选中的目标
  const defaultTarget: number | "new" =
    initialTargetDocId !== null &&
    initialTargetDocId !== undefined &&
    docs.some((d) => d.id === initialTargetDocId && !d.final)
      ? initialTargetDocId
      : "new";

  const [targetDocId, setTargetDocId] = useState<number | "new">(defaultTarget);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // 默认选中已有文档时，文档名显示它的名称（不能改）
  const [docName, setDocName] = useState<string>(
    defaultTarget === "new"
      ? ""
      : (docs.find((d) => d.id === defaultTarget)?.n ?? ""),
  );
  const [note, setNote] = useState<string>("");
  const [taskId, setTaskId] = useState<number>(
    initialTask?.id ?? availableTasks[0]?.id ?? 0,
  );
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // 任务选项
  const taskOptions =
    initialTask && !availableTasks.some((opt) => opt.id === initialTask.id)
      ? [...availableTasks, initialTask]
      : availableTasks;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // 若当前是新建文档，且用户尚未自定义文档名称（或文档名为空），自动提取文件名去除后缀作为默认文档名
      if (targetDocId === "new" && !docName.trim()) {
        const autoName = file.name.replace(/\.[^.]+$/, "");
        setDocName(autoName);
      }
    }
  };

  const handleTargetChange = (newTarget: number | "new") => {
    setTargetDocId(newTarget);
    if (newTarget !== "new") {
      const found = docs.find((d) => d.id === newTarget);
      if (found) {
        setDocName(found.n);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!selectedFile) {
      setErrorMsg("请选择要上传的文件");
      return;
    }
    const fileProblem = checkFile(selectedFile);
    if (fileProblem) {
      setErrorMsg(fileProblem);
      return;
    }

    if (targetDocId === "new" && !docName.trim()) {
      setErrorMsg("请填写文档名称");
      return;
    }

    if (!note.trim()) {
      setErrorMsg("写一句版本说明，方便队友知道改了什么");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);
    try {
      await onSubmit?.({
        file: selectedFile,
        docName: docName.trim(),
        targetDocId,
        note: note.trim(),
        taskId: taskId === 0 ? null : taskId,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "上传失败，请稍后再试");
      setSubmitting(false);
    }
  };

  const isNewDoc = targetDocId === "new";

  return (
    <Drawer
      className="ov fx opening"
      labelledBy="fx-title"
      onClose={onClose}
    >
      <header className="fx-head">
        <h1 className="fx-title" id="fx-title">
          上传<em>文档</em>
        </h1>
        <button
          className="ov-close"
          type="button"
          aria-label="关闭"
          onClick={onClose}
        >
          关闭<span aria-hidden="true">×</span>
        </button>
      </header>

      <div className="double ov-rule">
        <i />
        <i />
      </div>

      <div className="fx-body">
        <form onSubmit={handleSubmit}>
          {/* 文件拖拽/选择区域 */}
          <label className="dz" id="f-dz">
            <b>
              {selectedFile
                ? selectedFile.name
                : "把文件拖到这里，或点此选择"}
            </b>
            <small>Word、PDF、Markdown，单个不超过 20 MB</small>
            <input
              type="file"
              id="f-file"
              accept=".doc,.docx,.pdf,.md"
              onChange={handleFileChange}
            />
          </label>

          {/* 上传目标 */}
          <div className="fr top">
            <span className="lb">
              上传到<b>*</b>
            </span>
            <div className="chips" role="radiogroup" aria-label="上传目标">
              <button
                type="button"
                role="radio"
                aria-pressed={isNewDoc}
                onClick={() => handleTargetChange("new")}
              >
                新建文档
              </button>
              {revisingDocOptions.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  role="radio"
                  aria-pressed={targetDocId === doc.id}
                  onClick={() => handleTargetChange(doc.id)}
                >
                  {doc.n}
                </button>
              ))}
            </div>
          </div>

          {/* 文档名称 */}
          <label className="fr">
            <span className="lb">
              文档名称<b>*</b>
            </span>
            <input
              type="text"
              placeholder="..."
              required
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              disabled={!isNewDoc}
            />
          </label>

          {/* 版本说明 */}
          <label className="fr">
            <span className="lb">
              版本说明<b>*</b>
            </span>
            <input
              type="text"
              placeholder="..."
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          {/* 关联任务（新建文档时显示） */}
          {isNewDoc && (
            <label className="fr">
              <span className="lb">关联任务</span>
              <select
                value={taskId}
                onChange={(e) => setTaskId(Number(e.target.value))}
              >
                <option value={0}>不关联任务（项目文档）</option>
                {taskOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* 错误提示 */}
          {errorMsg && (
            <div
              style={{
                color: "var(--signal)",
                fontSize: "12px",
                padding: "4px 0",
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* 底部按钮 */}
          <div className="fx-acts">
            <button
              className="btn"
              type="button"
              onClick={onClose}
            >
              取消
            </button>
            <button className="btn primary go" type="submit" disabled={submitting}>
              {submitting ? "上传中…" : "确认上传"}
            </button>
          </div>
        </form>
      </div>
    </Drawer>
  );
}
