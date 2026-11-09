import type { DocumentDetailApi, DocumentItemApi, DocumentVersionApi } from "../shared/types/documents";
import { http } from "./http";

export const documentApi = {
  list: (projectId: number) => http.get<DocumentItemApi[]>(`/projects/${projectId}/documents`),
  get: (documentId: number) => http.get<DocumentDetailApi>(`/documents/${documentId}`),
  /** 上传新文档，文件作为第一个版本（版本号后端自动给 v0.1） */
  create: (
    projectId: number,
    values: { file: File; name: string; taskId: number | null; changeNote: string },
  ) => {
    const form = new FormData();
    form.append("file", values.file);
    form.append("name", values.name);
    if (values.taskId !== null) form.append("taskId", String(values.taskId));
    if (values.changeNote) form.append("changeNote", values.changeNote);
    return http.upload<DocumentDetailApi>(`/projects/${projectId}/documents`, form);
  },
  /** 给没定稿的文档传新版本（版本号后端在当前版本上加 0.1） */
  addVersion: (documentId: number, values: { file: File; changeNote: string }) => {
    const form = new FormData();
    form.append("file", values.file);
    if (values.changeNote) form.append("changeNote", values.changeNote);
    return http.upload<DocumentVersionApi>(`/documents/${documentId}/versions`, form);
  },
  /** 定稿，定稿后不能再传新版本，也不能改回修订中 */
  finalize: (documentId: number) =>
    http.put<DocumentItemApi>(`/documents/${documentId}/status`, { status: "FINAL" }),
  /** 下载某个版本的文件 */
  download: (versionId: number) => http.download(`/document-versions/${versionId}/download`),
};
