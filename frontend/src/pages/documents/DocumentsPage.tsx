import { useState, useMemo } from "react";
import { docs as initialDocs } from "../../data/documents";
import type { DocumentItem } from "../../types/documents";
import DocumentHeader from "./components/DocumentHeader";
import DocumentRevising from "./components/DocumentRevising";
import DocumentFinal from "./components/DocumentFinal";
import DocumentDetail from "./components/DocumentDetail";
import UploadDocDrawer from "./components/UploadDocDrawer";
import "./css/documents.css";

export default function DocumentsPage() {
  // 顶层维护的文档数据集
  const [docList, setDocList] = useState<DocumentItem[]>(initialDocs);

  // 选中文档的 ID（默认选中 "doc-3"，即 "接口文档"）
  const [selectedId, setSelectedId] = useState<string | null>("doc-3");

  // 搜索关键字
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // 抽屉显隐与预选目标 ID
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTargetDocId, setDrawerTargetDocId] = useState<string | null>(null);

  // 过滤后的列表
  const filteredDocs = useMemo(() => {
    const q = searchKeyword.trim().toLowerCase();
    if (!q) return docList;
    return docList.filter(
      (d) =>
        d.n.toLowerCase().includes(q) ||
        (d.task && d.task.toLowerCase().includes(q)) ||
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

  // 任务名映射辅助
  const taskMap: Record<string, string> = {
    t129: "A 需求分析",
    t131: "B 数据库设计",
    t139: "C 后端开发",
    t137: "D 前端开发",
    t150: "E 联调测试",
  };

  // 提交上传处理逻辑（增加到列表或在已有文档追加版本）
  const handleUploadSubmit = (data: {
    file: File | null;
    docName: string;
    targetDocId: string;
    note: string;
    taskId: string;
  }) => {
    const uploadedFileName = data.file ? data.file.name : undefined;
    const uploadedFileSize = data.file ? `${(data.file.size / (1024 * 1024)).toFixed(1)} MB` : "1.5 MB";

    if (data.targetDocId === "new") {
      const finalDocName = data.docName || (data.file ? data.file.name.replace(/\.[^.]+$/, "") : "未命名文档");
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        n: finalDocName,
        tid: data.taskId,
        task: taskMap[data.taskId] || "未指定任务",
        v: "v0.1",
        who: "测试经理 A",
        up: "10.22",
        due: "10.30",
        final: false,
        hist: [
          {
            version: "v0.1",
            date: "10.22",
            operator: "测试经理 A",
            comment: data.note,
            fileName: uploadedFileName || `${finalDocName}_v0.1.docx`,
            fileSize: uploadedFileSize,
          },
        ],
      };
      setDocList((prev) => [...prev, newDoc]);
      setSelectedId(newDoc.id!);
    } else {
      setDocList((prev) =>
        prev.map((d) => {
          if (d.id !== data.targetDocId) return d;
          const currentV = d.v.replace("v", "");
          const [maj, min] = currentV.split(".").map(Number);
          const nextV = `v${maj}.${(min || 0) + 1}`;
          const newVersionItem = {
            version: nextV,
            date: "10.22",
            operator: "测试经理 A",
            comment: data.note,
            fileName: uploadedFileName || `${d.n}_${nextV}.docx`,
            fileSize: uploadedFileSize,
          };
          return {
            ...d,
            v: nextV,
            up: "10.22",
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
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        onUploadClick={handleOpenNewUpload}
      />

      <div className="dg">
        <div className="dleft">
          <DocumentRevising
            docs={revisingDocs}
            selectedId={selectedId}
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
          onTaskClick={(taskId) => {
            console.log("跳转任务:", taskId);
          }}
          onUploadVersion={handleOpenVersionUpload}
        />
      </div>

      {/* 上传文档 / 新版本抽屉 */}
      <UploadDocDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        docs={docList}
        initialTargetDocId={drawerTargetDocId}
        onSubmit={handleUploadSubmit}
      />
    </section>
  );
}
