import { createContext, useContext, type Dispatch, type SetStateAction } from "react";
import type { DocumentItem } from "../../types/documents";

/** 文档页和任务模块共用的文档数据，接通接口后改为请求数据 */
export interface DocumentStore {
  docs: DocumentItem[];
  setDocs: Dispatch<SetStateAction<DocumentItem[]>>;
  /** 把文档定稿，对应 PUT /documents/{documentId}/status */
  finalizeDocument: (documentId: number, today: string) => void;
}

export const DocumentStoreContext = createContext<DocumentStore | null>(null);

export function useDocumentStore(): DocumentStore {
  const store = useContext(DocumentStoreContext);
  if (!store) throw new Error("useDocumentStore 必须在 DocumentProvider 内使用");
  return store;
}
