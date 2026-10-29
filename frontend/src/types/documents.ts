/**
 * 文档版本实体结构（对齐后端 OpenAPI 契约）
 */
export interface DocumentVersionItem {
  /** 版本号，例如 "v1.2" */
  version: string;
  /** 更新日期或时间戳，例如 "10.16" */
  date: string;
  /** 操作人 / 上传者，例如 "测试经理 A" */
  operator: string;
  /** 变更说明 / 备注，例如 "补充非功能需求" */
  comment: string;
  /** 物理文件名，例如 "需求规格说明书_v1.2.docx" */
  fileName?: string;
  /** 文件大小（格式化文字或字节数，例如 "1.8 MB" 或 1887436） */
  fileSize?: string | number;
  /** 文件下载地址（对应后端 /document-versions/{id}/download） */
  downloadUrl?: string;
}

/**
 * 原生原型中保留的简写元组格式（用于平滑兼容原型 Mock 数据）
 * [版本号, 更新日期, 操作人, 变更说明]
 */
export type DocHistoryTuple = [
  version: string,
  date: string,
  operator: string,
  comment: string,
];

/**
 * 版本项支持对象形式或元组形式
 */
export type DocVersionRecord = DocumentVersionItem | DocHistoryTuple;

/**
 * 项目文档数据项定义（底层事实数据模型）
 */
export interface DocumentItem {
  /** 唯一标识（支持基于 ID 选中和状态更新） */
  id?: string;
  /** 文档名称 */
  n: string;
  /** 关联任务ID（可选，如 t129） */
  tid?: string;
  /** 是否定稿（可选，true 为已定稿） */
  final?: boolean;
  /** 关联任务名称或占位符，例如 "A 需求分析" 或 "—" */
  task?: string;
  /** 当前最新版本号，例如 "v1.2" */
  v: string;
  /** 最后修改人 / 责任人 */
  who: string;
  /** 最后更新日期，例如 "10.16" */
  up: string;
  /** 截止日期，例如 "10.16" */
  due: string;
  /** 版本历史记录（兼容元组或对象） */
  hist: DocVersionRecord[];
}
