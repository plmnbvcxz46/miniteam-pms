import type {
  DocumentDetailApi,
  DocumentItem,
} from "../../shared/types/documents";
import { formatDayLabel } from "../../shared/utils/date";

/** yyyy-MM-dd HH:mm:ss 取日期部分，转成页面用的 MM.DD */
function dayLabelOf(dateTime: string): string {
  return formatDayLabel(dateTime.slice(0, 10));
}

/**
 * 接口的文档详情转成页面用的文档：日期换成 MM.DD 文字，“最后上传人”取最新版本的上传人，
 * 定稿的文档“更新日期”是定稿日期。绑定了任务的文档，截止日已经是任务的截止日（后端算好）
 */
export function toDocumentItem(doc: DocumentDetailApi): DocumentItem {
  const final = doc.status === "FINAL";
  return {
    id: doc.id,
    n: doc.name,
    taskId: doc.task?.id,
    taskTitle: doc.task?.title,
    final,
    v: doc.currentVersion ?? "",
    who: doc.versions[0]?.uploader.realName ?? doc.owner.realName,
    up: dayLabelOf(final && doc.finalizedAt ? doc.finalizedAt : doc.updatedAt),
    due: doc.dueDate ? formatDayLabel(doc.dueDate) : "",
    hist: doc.versions.map((ver) => ({
      id: ver.id,
      version: ver.version,
      date: dayLabelOf(ver.createdAt),
      operator: ver.uploader.realName,
      comment: ver.changeNote ?? "",
      fileName: ver.fileName,
      fileSize: ver.fileSize,
    })),
  };
}
