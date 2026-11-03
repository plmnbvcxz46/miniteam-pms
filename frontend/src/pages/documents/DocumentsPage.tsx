import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMe } from "../../auth/useAuth";
import type { DocumentItem } from "../../types/documents";
import { formatDayLabel } from "../../utils/date";
import { useTaskStore } from "../board/taskStore";
import DocumentHeader from "./components/header/DocumentHeader";
import DocumentRevising from "./components/revising/DocumentRevising";
import DocumentFinal from "./components/final/DocumentFinal";
import DocumentDetail from "./components/detail/DocumentDetail";
import UploadDocDrawer from "./components/drawer/UploadDocDrawer";
import { useDocumentStore } from "./documentStore";
import { bindDocToTask, getDocToday } from "./utils";
import "./css/documents.css";

export default function DocumentsPage() {
  // 顶层维护的文档数据集与当前快照基准日期（从假数据中注入）
  const { docs: rawDocs, setDocs: setDocList, finalizeDocument } = useDocumentStore();
  const currentDate = getDocToday();
  const { user: currentUser } = useMe();

  // 选中文档的 ID：地址栏 ?id= 指定的文档（如从讨论里的 @ 文件跳过来），
  // 没带或不存在时默认选中 3，即 "接口文档"
  const navigate = useNavigate();
  const location = useLocation();
  const { taskMap: tasks } = useTaskStore();

  // 绑定了任务的文档，截止日跟着任务走
  const docList = useMemo(
    () => rawDocs.map((d) => bindDocToTask(d, tasks)),
    [rawDocs, tasks],
  );
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const linked = Number(searchParams.get("id"));
    return rawDocs.some((d) => d.id === linked) ? linked : 3;
  });

  // 搜索关键字
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // 从任务详情点“上传文件”跳过来时，路由 state 带着任务 ID，直接打开抽屉并预选这个任务
  const uploadTaskId = (location.state as { uploadTaskId?: number } | null)
    ?.uploadTaskId;
  const [drawerTaskId] = useState<number | null>(uploadTaskId ?? null);
  useEffect(() => {
    if (uploadTaskId !== undefined) {
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
  }, [uploadTaskId, location.pathname, location.search, navigate]);

  // 抽屉显隐与预选目标 ID
  const [isDrawerOpen, setIsDrawerOpen] = useState(uploadTaskId !== undefined);
  const [drawerTargetDocId, setDrawerTargetDocId] = useState<number | null>(null);

  // 过滤后的列表
  const filteredDocs = useMemo(() => {
    const q = searchKeyword.trim().toLowerCase();
    if (!q) return docList;
    return docList.filter(
      (d) =>
        d.n.toLowerCase().includes(q) ||
        d.taskTitle.toLowerCase().includes(q) ||
        d.who.toLowerCase().includes(q)
    );
  }, [docList, searchKeyword]);

  // 修订中与定稿列表
  const revisingDocs = useMemo(
    () => filteredDocs.filter((d) => !d.final),
    [filteredDocs]
  );
  const finalDocs = useMemo(
    () => filteredDocs.filter((d) => !!d.final),
    [filteredDocs]
  );

  // 当前选中的文档对象
  const selectedDoc = useMemo(
    () => docList.find((d) => d.id === selectedId) ?? null,
    [docList, selectedId]
  );

  // 顶部“+ 上传文档”
  const handleOpenNewUpload = () => {
    setDrawerTargetDocId(null);
    setIsDrawerOpen(true);
  };

  // 侧边栏“上传新版本”
  const handleOpenVersionUpload = () => {
    setDrawerTargetDocId(selectedId);
    setIsDrawerOpen(true);
  };

  // 上传时可选的关联任务：已完成的任务不能再挂未定稿的新文档
  const taskOptions = Object.values(tasks)
    .filter((task) => task.status !== "DONE")
    .map((task) => ({ id: task.id, name: task.title }));

  // 侧栏“定稿”
  const handleFinalize = () => {
    if (!selectedDoc) return;
    if (!window.confirm(`确定将《${selectedDoc.n}》定稿吗？定稿后不能再上传新版本。`)) {
      return;
    }
    finalizeDocument(selectedDoc.id, currentDate);
  };

  // 提交上传处理逻辑（增加到列表或在已有文档追加版本）
  const handleUploadSubmit = (data: {
    file: File | null;
    docName: string;
    targetDocId: number | "new";
    note: string;
    taskId: number;
  }) => {
    const uploadedFileName = data.file ? data.file.name : undefined;
    const uploadedFileSize = data.file ? `${(data.file.size / (1024 * 1024)).toFixed(1)} MB` : "1.5 MB";

    if (data.targetDocId === "new") {
      const finalDocName = data.docName || (data.file ? data.file.name.replace(/\.[^.]+$/, "") : "未命名文档");
      const newDoc: DocumentItem = {
        id: Math.max(0, ...docList.map((d) => d.id)) + 1,
        n: finalDocName,
        taskId: data.taskId,
        v: "v0.1",
        who: currentUser.realName,
        up: currentDate,
        due: formatDayLabel(tasks[data.taskId]?.dueDate ?? "2026-10-30"),
        final: false,
        hist: [
          {
            version: "v0.1",
            date: currentDate,
            operator: currentUser.realName,
            comment: data.note,
            fileName: uploadedFileName || `${finalDocName}_v0.1.docx`,
            fileSize: uploadedFileSize,
          },
        ],
      };
      setDocList((prev) => [...prev, newDoc]);
      setSelectedId(newDoc.id);
    } else {
      setDocList((prev) =>
        prev.map((d) => {
          if (d.id !== data.targetDocId) return d;
          const currentV = d.v.replace("v", "");
          const [maj, min] = currentV.split(".").map(Number);
          const nextV = `v${maj}.${(min || 0) + 1}`;
          const newVersionItem = {
            version: nextV,
            date: currentDate,
            operator: currentUser.realName,
            comment: data.note,
            fileName: uploadedFileName || `${d.n}_${nextV}.docx`,
            fileSize: uploadedFileSize,
          };
          return {
            ...d,
            v: nextV,
            up: currentDate,
            hist: [newVersionItem, ...d.hist],
          };
        })
      );
    }
  };

  return (
    <section className="view" id="view-docs">
      <DocumentHeader
        docs={docList}
        currentDate={currentDate}
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        onUploadClick={handleOpenNewUpload}
      />

      <div className="dg">
        <div className="dleft">
          <DocumentRevising
            docs={revisingDocs}
            selectedId={selectedId}
            currentDate={currentDate}
            onSelect={setSelectedId}
          />
          <DocumentFinal
            docs={finalDocs}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        <DocumentDetail
          doc={selectedDoc}
          currentDate={currentDate}
          onTaskClick={(taskId) => navigate(`/board/task?id=${taskId}`)}
          onUploadVersion={handleOpenVersionUpload}
          onFinalize={handleFinalize}
        />
      </div>

      {/* 上传文档 / 新版本抽屉 */}
      <UploadDocDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        docs={docList}
        initialTargetDocId={drawerTargetDocId}
        taskOptions={taskOptions}
        initialTask={
          drawerTaskId !== null && tasks[drawerTaskId]
            ? { id: drawerTaskId, name: tasks[drawerTaskId].title }
            : null
        }
        onSubmit={handleUploadSubmit}
      />
    </section>
  );
}
