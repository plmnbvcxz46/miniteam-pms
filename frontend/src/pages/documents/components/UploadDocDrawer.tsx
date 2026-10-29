import React, { useState } from "react";
import Drawer from "../../../components/Drawer";
import type { DocumentItem } from "../../../types/documents";

interface UploadDocDrawerProps {
  /** 是否打开 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 所有文档列表（用于选择上传到已有文档） */
  docs: DocumentItem[];
  /** 目标文档 ID（若指定且对应文档未定稿，默认选中它） */
  initialTargetDocId?: string | null;
  /** 提交上传的回调 */
  onSubmit?: (data: {
    file: File | null;
    docName: string; // 文档业务名称（支持用户自定义修改或预填）
    targetDocId: string; // "new" 或是已有文档的 id
    note: string;
    taskId: string;
  }) => void;
}

export default function UploadDocDrawer({
  isOpen,
  onClose,
  docs,
  initialTargetDocId,
  onSubmit,
}: UploadDocDrawerProps) {
  if (!isOpen) return null;

  // 未定稿的文档选项
  const revisingDocOptions = docs.filter((d) => !d.final && d.id);

  // 默认选中的目标
  const defaultTarget =
    initialTargetDocId &&
      docs.some((d) => d.id === initialTargetDocId && !d.final)
      ? initialTargetDocId
      : "new";

  const [targetDocId, setTargetDocId] = useState<string>(defaultTarget);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [taskId, setTaskId] = useState<string>("t139");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // 任务选项
  const taskOptions = [
    { id: "t129", name: "A 需求分析" },
    { id: "t131", name: "B 数据库设计" },
    { id: "t139", name: "C 后端开发" },
    { id: "t137", name: "D 前端开发" },
    { id: "t150", name: "E 联调测试" },
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (targetDocId === "new" && !docName.trim()) {
      setErrorMsg("请填写文档名称");
      return;
    }

    if (!note.trim()) {
      setErrorMsg("写一句版本说明，方便队友知道改了什么");
      return;
    }

    setErrorMsg("");
    onSubmit?.({
      file: selectedFile,
      docName: docName.trim(),
      targetDocId,
      note: note.trim(),
      taskId,
    });
    onClose();
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
                onClick={() => setTargetDocId("new")}
              >
                新文档
              </button>
              {revisingDocOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-pressed={targetDocId === item.id}
                  onClick={() => setTargetDocId(item.id!)}
                >
                  {item.n}
                </button>
              ))}
            </div>
          </div>

          {/* 文档名称：仅在新建文档时展示，支持自定义或修改预填 */}
          {isNewDoc && (
            <div className="fr">
              <label htmlFor="f-doc-name">
                文档名称<b>*</b>
              </label>
              <input
                className="u"
                id="f-doc-name"
                placeholder="输入文档名..."
                value={docName}
                onChange={(e) => {
                  setDocName(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
              />
            </div>
          )}

          {/* 版本说明 */}
          <div className="fr">
            <label htmlFor="f-note">
              版本说明<b>*</b>
            </label>
            <input
              className="u"
              id="f-note"
              placeholder="..."
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
            />
            {errorMsg && <div className="err">{errorMsg}</div>}
          </div>

          {/* 关联任务：新建文档时关联 */}
          <div className="fr top">
            <span className="lb">关联任务</span>
            <div className="chips" role="radiogroup" aria-label="关联任务">
              {taskOptions.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  role="radio"
                  aria-pressed={taskId === task.id}
                  onClick={() => setTaskId(task.id)}
                >
                  {task.name}
                </button>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="fx-acts">
            <button className="btn primary" type="submit">
              上传
            </button>
            <button className="btn" type="button" onClick={onClose}>
              取消
            </button>
          </div>
        </form>
      </div>
    </Drawer>
  );
}
