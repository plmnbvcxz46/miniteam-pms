import { useMemo, useState, type ReactNode } from "react";
import { useAccess } from "../../access/useAccess";
import { docs as demoDocs } from "../../data/documents";
import { useIssue } from "../../issue/useIssue";
import type { DocumentItem } from "../../types/documents";
import { DocumentStoreContext } from "./documentStore";
import { getDocsAtDate } from "./utils";

export default function DocumentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { isDemoProject } = useAccess();
  // 文档还没接接口：只有演示项目有假数据，其他项目是空的
  const [baseDocs, setDocs] = useState<DocumentItem[]>(isDemoProject ? demoDocs : []);
  const { isPast, today } = useIssue();
  // 看过去的期时，文档取当时的版本
  const docs = useMemo(
    () => (isPast ? getDocsAtDate(baseDocs, today) : baseDocs),
    [baseDocs, isPast, today],
  );

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
