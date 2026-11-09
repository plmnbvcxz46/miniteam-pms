import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useIssue } from "../../state/issue/useIssue";
import type { DocumentVersionItem } from "../../types/documents";
import { formatDayLabel } from "../../utils/date";
import { useTaskStore } from "../../state/task/taskStore";
import DocumentHeader from "./components/header/DocumentHeader";
import DocumentRevising from "./components/revising/DocumentRevising";
import DocumentFinal from "./components/final/DocumentFinal";
import DocumentDetail from "./components/detail/DocumentDetail";
import UploadDocDrawer from "./components/drawer/UploadDocDrawer";
import { useDocumentStore } from "../../state/document/documentStore";
import { withTaskTitle } from "./utils";
import "./css/documents.css";

export default function DocumentsPage() {
  // 文档数据来自接口（看过去的期时是那一期快照里的）
  const {
    docs: rawDocs,
    ready,
    error,
    missing,
    createDocument,
    addVersion,
    finalizeDocument,
    downloadVersion,
  } = useDocumentStore();
  const { isPast, today } = useIssue();
  const currentDate = formatDayLabel(today);
  // 定稿、下载失败的原因
  const [actionError, setActionError] = useState("");

  // 选中文档的 ID：地址栏 ?id= 指定的文档（如从讨论里的 @ 文件跳过来），
  // 没带或不存在时默认选中 3，即 "接口文档"
  const navigate = useNavigate();
  const location = useLocation();
  const { taskMap: tasks } = useTaskStore();

  // 没有所属任务的文档写“项目文档”（绑定了任务的文档，截止日由后端跟着任务算好）
  const docList = useMemo(() => rawDocs.map(withTaskTitle), [rawDocs]);
  const [searchParams] = useSearchParams();
  // 选中的文档：地址栏 ?id= 指定的（如从讨论里的 @ 文件跳过来），没指定或不存在时选第一份
  const [pickedId, setSelectedId] = useState<number | null>(() => {
    const linked = Number(searchParams.get("id"));
    return Number.isFinite(linked) && linked > 0 ? linked : null;
  });
  const selectedId =
    docList.find((d) => d.id === pickedId)?.id ?? docList[0]?.id ?? null;

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
  const handleFinalize = async () => {
    if (!selectedDoc) return;
    if (!window.confirm(`确定将《${selectedDoc.n}》定稿吗？定稿后不能再上传新版本。`)) {
      return;
    }
    setActionError("");
    try {
      await finalizeDocument(selectedDoc.id);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "定稿失败，请稍后再试");
    }
  };

  // 下载某个版本的文件
  const handleDownload = async (version: DocumentVersionItem) => {
    setActionError("");
    try {
      await downloadVersion(version.id, version.fileName);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "下载失败，请稍后再试");
    }
  };

  // 提交上传：新建文档，或给已有文档传新版本。失败时抛错，由抽屉显示原因
  const handleUploadSubmit = async (data: {
    file: File;
    docName: string;
    targetDocId: number | "new";
    note: string;
    taskId: number | null;
  }) => {
    if (data.targetDocId === "new") {
      const name = data.docName || data.file.name.replace(/\.[^.]+$/, "");
      const id = await createDocument({
        file: data.file,
        name,
        taskId: data.taskId,
        changeNote: data.note,
      });
      setSelectedId(id);
    } else {
      await addVersion(data.targetDocId, { file: data.file, changeNote: data.note });
    }
  };

  if (missing) {
    return (
      <section className="view" id="view-docs">
        <p className="page-note">这一期没有存档，看不到当时的文档。</p>
      </section>
    );
  }
  if (error) {
    return (
      <section className="view" id="view-docs">
        <p className="page-note err" role="alert">
          {error}
        </p>
      </section>
    );
  }
  if (!ready) return null;

  return (
    <section className="view" id="view-docs">
      <DocumentHeader
        docs={docList}
        currentDate={currentDate}
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        onUploadClick={isPast ? undefined : handleOpenNewUpload}
      />

      {actionError && (
        <p className="page-note err" role="alert">
          {actionError}
        </p>
      )}

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
          onUploadVersion={isPast ? undefined : handleOpenVersionUpload}
          onFinalize={isPast ? undefined : handleFinalize}
          onDownloadVersion={handleDownload}
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
