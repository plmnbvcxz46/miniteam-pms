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
| 能进哪些项目、在当前项目里的角色和权限、任务能不能看和改 | `src/access/` 的 `useAccess()`，全站只在这里判断，页面只问不算。项目、成员、权限变更记录来自接口（`src/project/` 的 `ProjectProvider` 取 `GET /projects`、`/projects/{id}`、`/members`、`/activities`），`useAccess()` 在上面加“看过去的期和已归档项目只读”。系统管理员所有项目都能进、所有权限都有，其他人只能进自己加入的项目；权限以接口的 `myPermissions` 为准 |
| 正在看哪一期、各页面的“今天” | `src/issue/` 的 `useIssue()`。过去的期只读；期列表来自 `GET /projects/{projectId}/issues`（期号按项目开始日期每天一期），某期快照 `GET /projects/{projectId}/issues/{issueDate}` 还没接 |
| `users`（项目成员的 `UserBrief`，各模块假数据共用） | 概览、协作页已改用 `useAccess().members` 的 `user`；`data/global.ts` 的 `users` 只剩给演示项目的假数据当作者和负责人 |
| `currentIssue`（`IssueInfo`：期号、`M.DD` 日期、完整日期） | 期号取项目详情的 `issueNo`；日期直接取本地当前时间，不走接口 |
| `roleLabel` 等枚举中文名 | 前端常量 |

以后接入全局状态时，只替换 `data/global.ts` 的来源。

### 前端替身（接口接通时要换掉）

页面读的数据都来自 `src/data/`，但下面这些值不是接口字段，是前端按假数据现算的替身。接口接通后改读接口，对应的算法和假数据一起删：

| 替身 | 位置 | 接口接通后 |
|---|---|---|
| 往期的文档、讨论、动态、变更记录 | 按时间从现有假数据里筛出（`getDocsAtDate` 等）；任务、时间线、总览、报表、成员页的往期已读快照 | 文档、讨论模块接通后，后端把它们放进快照的 `discussions`、`documents`，前端改读 `snapshot` |

**演示项目**：文档、讨论等页面还没接接口（任务已接通，所有项目都读真实任务），它们的假数据只属于 `id = currentProjectId`（`data/global.ts`，现在是 1）的那个项目，其他项目这些页面是空的（`useAccess().isDemoProject`，`App.tsx` 里按项目 id 做 key，切换项目时这些页面的数据整个重来）。接通哪个模块，就把它从“演示项目才有”改成读接口。

假数据只用来让页面跑起来，字段以 `docs/api/openapi.yaml` 为准，后端按接口文档实现，不要照着假数据反推。系统角色已统一为系统管理员 `ADMIN` 和普通用户 `USER` 两种。

### 已接真实接口的部分

请求统一走 `src/api/`：`http.ts` 是封装（自动加 token、解 `{code,message,data}`、失败抛 `ApiError`、401 回登录页），按模块拆 `auth.ts`、`system.ts` 等。接通一个模块的做法：页面里的假数据换成 `src/api/` 的调用，加载中和失败要有提示，删掉对应的假数据和不再用的替身。已接通：认证、人员、系统角色、系统参数、操作日志、项目（新建、修改、归档、切换）、项目成员（邀请、改角色、改权限）、权限变更记录、期列表、任务（看板、详情、新建、修改、删除、改状态、拖动排序、前置任务、任务动态）、成员负载、甘特图和关键路径（`/gantt`、`/critical-path`）、总览（`/overview`）、统计报表（`/reports/*`，含 Excel 导出）、往期快照（`/issues/{issueDate}`）。进度和报表的数据由后端算，页面用 `issue/useIssueData.ts` 取：看今天调实时接口（任务表每变一次重新取），看过去的期读 `IssueProvider` 里取回的快照（没有存档时页面提示“这一期没有存档”）。任务数据在 `pages/board/TaskProvider.tsx`：用 `GET /projects/{projectId}/tasks?detail=true` 一次取完整任务表，写操作成功后整表重新取一遍，拖动先在页面上移动、接口失败再退回。新建项目任何登录用户都可以，权限不足、项目已归档等失败的情况把接口的 `message` 显示给用户。

### 模块（`types/<模块>.ts`、`data/<模块>.ts`）

- 只放本模块独有的结构；共享结构从 `./global` 引入。
- 文件内按“纯前端常量 → 接口假数据”分段，每份接口假数据上方注释对应接口，如 `/** GET /projects/{projectId}/members */`。
- 快照类型继承 `IssueInfo`，快照对象用 `...currentIssue` 填期号，不要再写死。
- 能由接口字段算出来的值（统计数、百分比、日期截取等）在组件里计算，不进假数据。

