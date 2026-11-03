# frontend 补充约定

总约定见根目录 `AGENTS.md`，本文件只写前端补充，冲突时以根目录为准。

## 目录结构

```
src/
├── pages/<模块>/
│   ├── <模块>Page.tsx        # 页面入口：持有状态、组合组件，不写大段 JSX
│   ├── components/<区块>/    # 按页面区块分子目录，如 header/、detail/、drawer/
│   ├── css/                  # 本模块样式，<模块>.css 作为入口 import 其余文件
│   └── utils.ts              # 本模块的纯函数（可选）
├── types/
│   ├── global.ts             # 全局共享类型
│   └── <模块>.ts             # 模块自有类型
└── data/
    ├── global.ts             # 全局假数据
    └── <模块>.ts             # 模块假数据
```

- 拆分参考 `pages/documents/`、`pages/members/`、`pages/reports/`：按页面区块划分 `components/<区块>/` 子目录，每个区块内部再拆分为容器面板（如 `*Panel`）与原子子组件（如 `*Row`、`*Item`、`*Bar`、`*Axis`、`*Chart`）。
- 从 `styles/index.css` 迁出某模块样式时，在原位置留一行注释说明迁到了哪里；多页面共用的基础类（如 `.span2`、`.track`）保留在 `styles/index.css`，模块局部尺寸调整用模块作用域选择器覆盖。

## 页面与视觉约定

- **一屏展示与内联滚动**：主页面内容应尽量收敛在一屏视口内展示，避免被 SVG 固有宽高比或长列表反向撑高整页。SVG 图表外层容器使用相对/绝对定位贴合网格分配高度；多行列表区块超出高度时开启局部内联滚动（`overflow-y: auto` 配合细滚动条）。
- **面板头部 `// 英文词` + 中文标题对照**：面板标题区（`.phd`、`.dsec-h`、`.hk`）统一采用上方 `<span className="k">// WORD</span>` + 下方中文标题的双层结构（如 `// BURNDOWN` + `剩余任务`、`// TASKS` + `完成任务`、`// REVISING` + `修订中`）。上方英文尽量用一个自然贴切的单词作视觉装饰，无需生硬直译。

## 假数据与类型

接口未接通前，页面一律从 `src/data/` 读假数据，类型放 `src/types/`，字段名和结构**严格对齐** `docs/api/openapi.yaml`，以后换成真实请求时只改数据来源，不改组件。

### 全局（`types/global.ts`、`data/global.ts`）

多个模块共用、或暂时拿不到的登录态和项目上下文，统一放这里，**不要在模块文件里重复定义**：

| 内容 | 将来的真实来源 |
|---|---|
| `UserBrief`、`TaskRef`、`ProjectRole`、`MemberPermissions`、`PermKey`、`Activity` 等共享接口结构 | OpenAPI 公共 schema |
| `currentProjectId` | 路由或项目上下文 |
| 当前登录身份（用户、系统角色） | `src/auth/` 的 `useAuth()` / `useMe()`，数据来自 `GET /auth/me`，已接真实接口，token 存在 `sessionStorage`（`src/api/http.ts`） |
| 能进哪些项目、在当前项目里的角色和权限、任务能不能看和改 | `src/access/` 的 `useAccess()`，全站只在这里判断，页面只问不算。系统管理员所有项目都能进、所有权限都有，其他人只能进自己加入的项目，权限取自 `data/members.ts` 的 `projectMembers`（对应 `GET /projects`、`GET /projects/{projectId}/members`） |
| 正在看哪一期、各页面的“今天” | `src/issue/` 的 `useIssue()`。过去的期只读；接口对应 `GET /projects/{projectId}/issues` 和 `GET /projects/{projectId}/issues/{issueDate}` |
| `users`（项目成员的 `UserBrief`，各模块假数据共用） | `GET /projects/{projectId}/members` 的 `user` |
| `currentIssue`（`IssueInfo`：期号、`M.DD` 日期、完整日期） | 期号取项目详情的 `issueNo`；日期直接取本地当前时间，不走接口 |
| `roleLabel` 等枚举中文名 | 前端常量 |

以后接入全局状态时，只替换 `data/global.ts` 的来源。

### 前端替身（接口接通时要换掉）

页面读的数据都来自 `src/data/`，但下面这些值不是接口字段，是前端按假数据现算的替身。接口接通后改读接口，对应的算法和假数据一起删：

| 替身 | 位置 | 接口接通后 |
|---|---|---|
| 任务优先级得分 | `pages/board/priority.ts`，权重取系统参数 | 后端按开题报告的评分公式算，读 `priority` |
| 预测完工、延期天数 | `pages/timeline/utils.ts` 的 `getForecast` | 读后端的进度预测 |
| 统计报表的概况、燃尽图、每周完成、工期偏差、成员负载 | `pages/reports/derive.ts` | 读 `GET /projects/{projectId}/reports/*` |
| 往期各页面的样子 | 任务取 `data/issueSnapshots.ts`，成员工时取 `data/issueMemberHours.ts`，文档、讨论、动态、变更记录按时间从现有数据筛出 | 切期时读 `GET /projects/{projectId}/issues/{issueDate}` 的 `snapshot`，快照里没有成员页，要和后端确认 |
| 报表 Excel 导出 | `utils/xlsx.ts` 手写 | 读 `GET /projects/{projectId}/reports/export` 返回的文件 |
| 项目和权限判断 | `src/access/` | 登录态和 `GET /projects` 的结果 |

假数据只用来让页面跑起来，字段以 `docs/api/openapi.yaml` 为准，后端按接口文档实现，不要照着假数据反推。系统角色已统一为系统管理员 `ADMIN` 和普通用户 `USER` 两种。

### 已接真实接口的部分

请求统一走 `src/api/`：`http.ts` 是封装（自动加 token、解 `{code,message,data}`、失败抛 `ApiError`、401 回登录页），按模块拆 `auth.ts`、`system.ts` 等。接通一个模块的做法：页面里的假数据换成 `src/api/` 的调用，加载中和失败要有提示，删掉对应的假数据和不再用的替身。已接通：认证、人员、系统角色、系统参数、操作日志。

### 模块（`types/<模块>.ts`、`data/<模块>.ts`）

- 只放本模块独有的结构；共享结构从 `./global` 引入。
- 文件内按“纯前端常量 → 接口假数据”分段，每份接口假数据上方注释对应接口，如 `/** GET /projects/{projectId}/members */`。
- 快照类型继承 `IssueInfo`，快照对象用 `...currentIssue` 填期号，不要再写死。
- 能由接口字段算出来的值（统计数、百分比、日期截取等）在组件里计算，不进假数据。

