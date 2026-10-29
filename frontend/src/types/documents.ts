/**
 * 文档版本历史条目
 * 元组格式: [版本号, 更新日期, 操作人, 变更说明]
 * 例如: ["v1.2", "10.16", "测试经理 A", "补充非功能需求"]
 */
export type DocHistoryTuple = [
  version: string,
  date: string,
  operator: string,
  comment: string,
];

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
  /** 版本历史记录 */
  hist: DocHistoryTuple[];
}
