import type {
  CollabSnapshot,
  DiscussionBrief,
  DiscussionDetail,
} from "../types/collab";
import type { Activity } from "../types/global";
import { currentIssue, users } from "./global";

/* 全局数据（登录用户、项目成员、项目 ID、期号、状态枚举中文名）见 ./global */

/*
 * 假数据口径（与统计报表、成员页、文档页保持同一天）：
 * - “今天”基准日期为 2026-10-22（第 32 期，周四）
 * - 共 5 个讨论（关联 1 个逾期任务 T-139“补全接口文档”，逾期 2 天）
 * - 项目动态共 10 条，其中今天（2026-10-22）3 条
 */

/* =========================================================
 * 一、纯前端常量
 * ========================================================= */

/** 团队协作假数据基准日期（用于判断“今天”/“昨天”相对时间展示） */
export const collabTodayDate = "2026-10-22";

/** 默认选中的讨论 ID */
export const defaultDiscussionId = 1;

/** 初始未读的讨论 ID 列表（纯前端会话红点状态，点击切换后消除） */
export const initialUnreadIds: number[] = [1];

/* =========================================================
 * 二、接口假数据
 * ========================================================= */

const { pmA, devA, devB, qaC } = users;

/** GET /projects/{projectId}/discussions */
export const discussions: DiscussionBrief[] = [
  {
    id: 1,
    title: "接口文档字段命名统一",
    task: { id: 139, taskNo: 139, title: "补全接口文档" },
    commentCount: 5,
    lastCommentAt: "2026-10-22 10:41:00",
  },
  {
    id: 2,
    title: "甘特图依赖线怎么画",
    task: { id: 137, taskNo: 137, title: "甘特图组件" },
    commentCount: 3,
    lastCommentAt: "2026-10-21 11:12:00",
  },
  {
    id: 3,
    title: "周五彩排时间",
    task: { id: 135, taskNo: 135, title: "答辩 PPT" },
    commentCount: 4,
    lastCommentAt: "2026-10-21 15:02:00",
  },
  {
    id: 4,
    title: "菜单接口要不要分页",
    task: { id: 144, taskNo: 144, title: "菜单接口" },
    commentCount: 2,
    lastCommentAt: "2026-10-20 16:30:00",
  },
  {
    id: 5,
    title: "数据库表设计评审",
    task: { id: 131, taskNo: 131, title: "数据库表设计" },
    commentCount: 1,
    lastCommentAt: "2026-10-17 09:00:00",
  },
];

/** GET /discussions/{discussionId}（按 discussionId 索引） */
export const discussionDetails: Record<number, DiscussionDetail> = {
  1: {
    id: 1,
    title: "接口文档字段命名统一",
    creator: pmA,
    createdAt: "2026-10-21 16:20:00",
    task: {
      id: 139,
      taskNo: 139,
      title: "补全接口文档",
      status: "BLOCKED",
      overdueDays: 2,
    },
    comments: [
      {
        id: 101,
        user: pmA,
        content:
          "接口文档还差菜单和权限两部分。字段命名先统一成小驼峰，和若依返回的 <em>menuId</em>、<em>parentId</em> 保持一致。",
        mentions: [],
        createdAt: "2026-10-21 16:20:00",
      },
      {
        id: 102,
        user: devB,
        content:
          "前端这边已经按小驼峰写了，菜单树用的是 <em>children</em>，文档里也请写成这个名字。",
        mentions: [],
        createdAt: "2026-10-21 17:05:00",
      },
      {
        id: 103,
        user: devA,
        content:
          "权限部分卡在按钮级权限标识的格式上，<em>project:task:move</em> 这种三段式可以吗？",
        mentions: [],
        createdAt: "2026-10-22 09:18:00",
      },
      {
        id: 104,
        user: pmA,
        content: "可以，就用三段式。这个任务我先移到阻塞，今天下午一起过一遍。",
        mentions: [],
        createdAt: "2026-10-22 09:30:00",
      },
      {
        id: 105,
        user: devA,
        content: "好的，下午两点前我把菜单部分补上。",
        mentions: [],
        createdAt: "2026-10-22 10:41:00",
      },
    ],
  },
  2: {
    id: 2,
    title: "甘特图依赖线怎么画",
    creator: devB,
    createdAt: "2026-10-21 10:02:00",
    task: {
      id: 137,
      taskNo: 137,
      title: "甘特图组件",
      status: "DOING",
      overdueDays: 0,
    },
    comments: [
      {
        id: 201,
        user: devB,
        content:
          "依赖线打算用 SVG 按任务条的实际位置生成，ECharts 的自定义系列不好做描边动画。",
        mentions: [],
        createdAt: "2026-10-21 10:02:00",
      },
      {
        id: 202,
        user: pmA,
        content: "同意，动画要跟着时间轴生长，分叉同时画，汇合同时到。",
        mentions: [],
        createdAt: "2026-10-21 10:30:00",
      },
      {
        id: 203,
        user: devB,
        content: "明白，我按工作日换算延迟。",
        mentions: [],
        createdAt: "2026-10-21 11:12:00",
      },
    ],
  },
  3: {
    id: 3,
    title: "周五彩排时间",
    creator: qaC,
    createdAt: "2026-10-21 14:00:00",
    task: {
      id: 135,
      taskNo: 135,
      title: "答辩 PPT",
      status: "DOING",
      overdueDays: 0,
    },
    comments: [
      {
        id: 301,
        user: qaC,
        content: "周五下午三点彩排可以吗？教室我已经问过了。",
        mentions: [],
        createdAt: "2026-10-21 14:00:00",
      },
      {
        id: 302,
        user: pmA,
        content: "可以。每人讲五分钟，演示放最后。",
        mentions: [],
        createdAt: "2026-10-21 14:12:00",
      },
      {
        id: 303,
        user: devA,
        content: "演示用 Chrome，记得提前把缩放设成 100%。",
        mentions: [],
        createdAt: "2026-10-21 14:40:00",
      },
      {
        id: 304,
        user: qaC,
        content: "收到，我把顺序写进 PPT 最后一页。",
        mentions: [],
        createdAt: "2026-10-21 15:02:00",
      },
    ],
  },
  4: {
    id: 4,
    title: "菜单接口要不要分页",
    creator: devA,
    createdAt: "2026-10-20 16:10:00",
    task: {
      id: 144,
      taskNo: 144,
      title: "菜单接口",
      status: "TODO",
      overdueDays: 0,
    },
    comments: [
      {
        id: 401,
        user: devA,
        content: "菜单数据量很小，我倾向于不分页，一次返回整棵树。",
        mentions: [],
        createdAt: "2026-10-20 16:10:00",
      },
      {
        id: 402,
        user: devB,
        content: "不分页可以，前端直接渲染树。",
        mentions: [],
        createdAt: "2026-10-20 16:30:00",
      },
    ],
  },
  5: {
    id: 5,
    title: "数据库表设计评审",
    creator: pmA,
    createdAt: "2026-10-17 09:00:00",
    task: {
      id: 131,
      taskNo: 131,
      title: "数据库表设计",
      status: "DONE",
      overdueDays: 0,
    },
    comments: [
      {
        id: 501,
        user: pmA,
        content: "评审意见都已处理，讨论结束。",
        mentions: [],
        createdAt: "2026-10-17 09:00:00",
      },
    ],
  },
};

/** GET /projects/{projectId}/activities（按时间倒序） */
export const activities: Activity[] = [
  {
    id: 210,
    user: devB,
    targetType: "TASK",
    targetId: 137,
    action: "PROGRESS",
    detail: "普通员工 B 把 <b>甘特图组件</b> 的进度更新为 60%",
    createdAt: "2026-10-22 10:52:00",
  },
  {
    id: 209,
    user: devA,
    targetType: "DISCUSSION",
    targetId: 1,
    action: "COMMENT",
    detail: "普通员工 A 回复了 <b>接口文档字段命名统一</b>",
    createdAt: "2026-10-22 10:41:00",
  },
  {
    id: 208,
    user: pmA,
    targetType: "TASK",
    targetId: 139,
    action: "MOVE",
    detail: "测试经理 A 把 <b>补全接口文档</b> 移到阻塞",
    createdAt: "2026-10-22 09:30:00",
  },
  {
    id: 207,
    user: qaC,
    targetType: "DOCUMENT",
    targetId: 135,
    action: "UPLOAD",
    detail: "普通员工 C 上传了 <b>答辩 PPT 第二版</b>",
    createdAt: "2026-10-21 18:02:00",
  },
  {
    id: 206,
    user: pmA,
    targetType: "TASK",
    targetId: 150,
    action: "CREATE",
    detail: "测试经理 A 新建任务 <b>部署脚本</b>",
    createdAt: "2026-10-21 15:20:00",
  },
  {
    id: 205,
    user: devB,
    targetType: "TASK",
    targetId: 131,
    action: "DONE",
    detail: "普通员工 B 完成了 <b>数据库表设计</b> 的评审修改",
    createdAt: "2026-10-21 09:12:00",
  },
  {
    id: 204,
    user: qaC,
    targetType: "DOCUMENT",
    targetId: 5,
    action: "UPLOAD",
    detail: "普通员工 C 上传了 <b>测试计划</b> v0.1",
    createdAt: "2026-10-20 17:40:00",
  },
  {
    id: 203,
    user: devA,
    targetType: "DISCUSSION",
    targetId: 4,
    action: "CREATE",
    detail: "普通员工 A 发起讨论 <b>菜单接口要不要分页</b>",
    createdAt: "2026-10-20 16:10:00",
  },
  {
    id: 202,
    user: qaC,
    targetType: "DOCUMENT",
    targetId: 7,
    action: "UPLOAD",
    detail: "普通员工 C 上传了 <b>周会纪要 10.19</b>",
    createdAt: "2026-10-19 18:30:00",
  },
  {
    id: 201,
    user: pmA,
    targetType: "TASK",
    targetId: 139,
    action: "MOVE",
    detail: "测试经理 A 把 <b>补全接口文档</b> 移到进行中",
    createdAt: "2026-10-19 10:05:00",
  },
];

/** 当前默认期数快照对象 */
export const currentSnapshot: CollabSnapshot = {
  ...currentIssue,
  discussions,
  discussionDetails,
  activities,
};
