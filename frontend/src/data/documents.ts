import type { DocumentItem } from "../types/documents";
import type { IssueInfo } from "../types/global";
import { currentIssue } from "./global";

/**
 * 快照数据结构（预留快照切换功能使用）
 * “今天”基准日期统一取 data/global.ts 的 currentIssue.todayDate
 */
export interface DocumentSnapshot extends IssueInfo {
  docs: DocumentItem[];
}

export const docs: DocumentItem[] = [
  {
    id: "doc-1",
    n: "需求规格说明书",
    tid: "t129",
    final: true,
    task: "A 需求分析",
    v: "v1.2",
    who: "测试经理 A",
    up: "10.16",
    due: "10.16",
    hist: [
      ["v1.2", "10.16", "测试经理 A", "补充非功能需求"],
      ["v1.1", "10.15", "测试经理 A", "评审后修改用例"],
      ["v1.0", "10.14", "测试经理 A", "初稿"],
    ],
  },
  {
    id: "doc-2",
    n: "数据库设计说明书",
    tid: "t131",
    final: true,
    task: "B 数据库设计",
    v: "v1.1",
    who: "普通员工 B",
    up: "10.17",
    due: "10.18",
    hist: [
      ["v1.1", "10.17", "普通员工 B", "按评审意见调整索引"],
      ["v1.0", "10.16", "普通员工 B", "初稿"],
    ],
  },
  {
    id: "doc-3",
    n: "接口文档",
    tid: "t139",
    task: "C 后端开发",
    v: "v0.6",
    who: "普通员工 A",
    up: "10.18",
    due: "10.20",
    hist: [
      ["v0.6", "10.18", "普通员工 A", "补充登录接口"],
      ["v0.5", "10.16", "普通员工 A", "新增菜单接口草稿"],
      ["v0.4", "10.15", "普通员工 A", "统一返回格式"],
      ["v0.3", "10.14", "普通员工 A", "用户接口"],
    ],
  },
  {
    id: "doc-4",
    n: "前端组件说明",
    tid: "t137",
    task: "D 前端开发",
    v: "v0.3",
    who: "测试经理 A",
    up: "10.21",
    due: "10.27",
    hist: [
      ["v0.3", "10.21", "测试经理 A", "新增甘特图组件说明"],
      ["v0.2", "10.19", "测试经理 A", "看板拖拽"],
      ["v0.1", "10.17", "测试经理 A", "初稿"],
    ],
  },
  {
    id: "doc-5",
    n: "测试计划",
    tid: "t150",
    task: "E 联调测试",
    v: "v0.1",
    who: "普通员工 C",
    up: "10.20",
    due: "10.30",
    hist: [["v0.1", "10.20", "普通员工 C", "初稿"]],
  },
  {
    id: "doc-6",
    n: "开题报告",
    final: true,
    task: "—",
    v: "v2.0",
    who: "测试经理 A",
    up: "9.28",
    due: "9.28",
    hist: [
      ["v2.0", "9.28", "测试经理 A", "按老师意见修改"],
      ["v1.0", "9.25", "测试经理 A", "初稿"],
    ],
  },
  {
    id: "doc-7",
    n: "周会纪要 10.19",
    tid: "t146",
    final: true,
    task: "—",
    v: "v1.0",
    who: "普通员工 C",
    up: "10.19",
    due: "10.19",
    hist: [["v1.0", "10.19", "普通员工 C", "会议记录"]],
  },
];

/**
 * 当前默认期数快照对象
 */
export const currentSnapshot: DocumentSnapshot = {
  ...currentIssue,
  docs,
};
