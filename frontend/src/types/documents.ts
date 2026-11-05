/**
 * 文档模块类型（对齐 docs/api/openapi.yaml 的 DocumentItem、DocumentVersion、DocumentDetail）
 */
import type { TaskRef, UserBrief } from "./global";
import type { DocStatus } from "./task";

export type { DocStatus };

/** 文档版本（DocumentVersion） */
export interface DocumentVersionApi {
  id: number;
  version: string;
  changeNote: string | null;
  fileName: string;
  /** 字节 */
  fileSize: number;
  contentType: string | null;
  uploader: UserBrief;
  /** yyyy-MM-dd HH:mm:ss */
  createdAt: string;
  downloadUrl: string;
}

/** 文档（DocumentItem） */
export interface DocumentItemApi {
  id: number;
  name: string;
  category: string;
  task: TaskRef | null;
  owner: UserBrief;
  status: DocStatus;
  currentVersion: string | null;
  /** 绑定了任务时是任务的截止日 */
  dueDate: string | null;
  overdueDays: number;
  /** yyyy-MM-dd HH:mm:ss */
  createdAt: string;
  updatedAt: string;
  finalizedAt: string | null;
}

/** 文档详情（DocumentDetail），版本记录新的在前 */
export interface DocumentDetailApi extends DocumentItemApi {
  versions: DocumentVersionApi[];
}

/** 页面里一个版本记录：日期是 MM.DD */
export interface DocumentVersionItem {
  /** 版本 id，下载用 */
  id: number;
  /** 版本号，例如 "v1.2" */
  version: string;
  /** 上传日期，例如 "10.16" */
  date: string;
  /** 上传人 */
  operator: string;
  /** 版本说明 */
  comment: string;
  fileName: string;
  /** 字节 */
  fileSize: number;
}

/**
 * 页面用的文档（由接口的 DocumentDetail 转换而来，日期是 MM.DD 文字）
 */
export interface DocumentItem {
  id: number;
  /** 文档名称 */
  n: string;
  /** 所属任务 ID，没有所属任务时为空 */
  taskId?: number;
  /** 所属任务的标题，没有所属任务时为空 */
  taskTitle?: string;
  /** 是否定稿 */
  final?: boolean;
  /** 当前最新版本号，例如 "v1.2" */
  v: string;
  /** 最后上传人 */
  who: string;
  /** 最后更新日期，定稿的文档是定稿日期，例如 "10.16" */
  up: string;
  /** 截止日期，例如 "10.16"，没有为空字符串；绑定了任务时是任务的截止日 */
  due: string;
  /** 版本历史记录，新的在前 */
  hist: DocumentVersionItem[];
}

/** 补上所属任务标题后的文档：没有所属任务时为“项目文档” */
export interface BoundDocument extends DocumentItem {
  taskTitle: string;
}
