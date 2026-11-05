import { createContext, useContext } from "react";
import type { DocumentItem } from "../../types/documents";

/** 文档页和任务模块共用的文档数据，来自接口 */
export interface DocumentStore {
  /** 文档列表（含版本记录）；还没取到时为空 */
  docs: DocumentItem[];
  /** 列表是否已经取到 */
  ready: boolean;
  /** 取失败的原因，已经有数据时为空 */
  error: string;
  /** 看的是过去的期，但这一期没有存档 */
  missing: boolean;
  /** 文档每有写操作加一；任务表据此重新取（任务详情里带着文档的状态） */
  version: number;
  /** 重新取一遍，对应 GET /projects/{projectId}/documents 和 GET /documents/{documentId} */
  reload: () => void;
  /** 上传新文档，文件作为第一个版本，对应 POST /projects/{projectId}/documents。成功返回新文档 id，失败抛 ApiError */
  createDocument: (values: {
    file: File;
    name: string;
    taskId: number | null;
    changeNote: string;
  }) => Promise<number>;
  /** 给没定稿的文档传新版本，对应 POST /documents/{documentId}/versions。失败抛 ApiError */
  addVersion: (documentId: number, values: { file: File; changeNote: string }) => Promise<void>;
  /** 把文档定稿，对应 PUT /documents/{documentId}/status。失败抛 ApiError */
  finalizeDocument: (documentId: number) => Promise<void>;
  /** 下载一个版本的文件，对应 GET /document-versions/{versionId}/download。失败抛 ApiError */
  downloadVersion: (versionId: number, fallbackName: string) => Promise<void>;
}

export const DocumentStoreContext = createContext<DocumentStore | null>(null);

export function useDocumentStore(): DocumentStore {
  const store = useContext(DocumentStoreContext);
  if (!store) throw new Error("useDocumentStore 必须在 DocumentProvider 内使用");
  return store;
}
