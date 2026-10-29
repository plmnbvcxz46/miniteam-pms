import { useState } from "react";
import { docs } from "../../data/documents";
import DocumentHeader from "./components/DocumentHeader";
import DocumentRevising from "./components/DocumentRevising";
import DocumentFinal from "./components/DocumentFinal";
import DocumentDetail from "./components/DocumentDetail";

export default function DocumentsPage() {
  // 当前选中文档在 docs 中的下标索引，默认 2（对应原型的 "接口文档"）
  const [selectedIndex, setSelectedIndex] = useState<number>(2);

  const selectedDoc = docs[selectedIndex] ?? null;

  return (
    <section className="view" id="view-docs">
      <DocumentHeader />

      <div className="dg">
        <div className="dleft">
          <DocumentRevising
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
          <DocumentFinal
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
        </div>

        <DocumentDetail
          doc={selectedDoc}
          onTaskClick={(taskId) => {
            console.log("跳转任务:", taskId);
          }}
          onUploadVersion={() => {
            console.log("上传新版本:", selectedDoc?.n);
          }}
        />
      </div>
    </section>
  );
}
