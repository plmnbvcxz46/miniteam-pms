import { useMemo, useState, type ReactNode } from "react";
import { documentApi } from "../../api/document";
import { useIssueData } from "../issue/useIssueData";
import { useProject } from "../project/useProject";
import type { DocumentDetailApi } from "../../types/documents";
import { downloadBlob } from "../../utils/download";
import { DocumentStoreContext, type DocumentStore } from "./documentStore";
import { toDocumentItem } from "../../pages/documents/utils";

/** 取项目里的全部文档，每份带版本记录（列表接口不带版本，逐份取详情） */
async function loadDocuments(projectId: number): Promise<DocumentDetailApi[]> {
  const list = await documentApi.list(projectId);
  return Promise.all(list.map((doc) => documentApi.get(doc.id)));
}

/**
 * 文档数据：看今天时来自接口，看过去的期来自那一期快照里的 documents。
 * 写操作成功后重新取一遍。
 */
export default function DocumentProvider({ children }: { children: ReactNode }) {
  const { currentProject } = useProject();
  const projectId = currentProject?.id ?? null;
  // 每次写操作成功加一，useIssueData 据此重新取
  const [version, setVersion] = useState(0);
  const { data, error, missing } = useIssueData(
    loadDocuments,
    (pages) => pages.documents,
    version,
  );
  const docs = useMemo(() => (data ?? []).map(toDocumentItem), [data]);

  const store: DocumentStore = {
    docs,
    ready: data !== null,
    error,
    missing,
    version,
    reload: () => setVersion((n) => n + 1),
    createDocument: async (values) => {
      if (projectId === null) throw new Error("还没有选中项目");
      const created = await documentApi.create(projectId, values);
      setVersion((n) => n + 1);
      return created.id;
    },
    addVersion: async (documentId, values) => {
      await documentApi.addVersion(documentId, values);
      setVersion((n) => n + 1);
    },
    finalizeDocument: async (documentId) => {
      await documentApi.finalize(documentId);
      setVersion((n) => n + 1);
    },
    downloadVersion: async (versionId, fallbackName) => {
      const { blob, fileName } = await documentApi.download(versionId);
      downloadBlob(fileName ?? fallbackName, blob);
    },
  };

  return (
    <DocumentStoreContext.Provider value={store}>
      {children}
    </DocumentStoreContext.Provider>
  );
}
