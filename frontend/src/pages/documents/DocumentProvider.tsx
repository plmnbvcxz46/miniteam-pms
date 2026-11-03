import { useState, type ReactNode } from "react";
import { docs as initialDocs } from "../../data/documents";
import type { DocumentItem } from "../../types/documents";
import { DocumentStoreContext } from "./documentStore";

export default function DocumentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [docs, setDocs] = useState<DocumentItem[]>(initialDocs);

  // 定稿后更新日期记为今天，定稿列表上显示的“xx 定稿”取这个日期
  const finalizeDocument = (documentId: number, today: string) => {
    setDocs((prev) =>
      prev.map((doc) =>
        doc.id === documentId ? { ...doc, final: true, up: today } : doc,
      ),
    );
  };

  return (
    <DocumentStoreContext.Provider
      value={{ docs, setDocs, finalizeDocument }}
    >
      {children}
    </DocumentStoreContext.Provider>
  );
}
