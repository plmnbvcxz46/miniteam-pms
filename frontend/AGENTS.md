# frontend 补充约定

总约定见根目录 `AGENTS.md`，本文件只写前端补充，冲突时以根目录为准。

## 目录结构

```
src/
├── App.tsx、main.tsx        # 入口、路由
├── api/                     # 接口请求，按模块拆（http.ts 是封装）
├── state/<名称>/            # 全局状态：Provider + Context + use 钩子
│   ├── access、auth、config、issue、project   # 权限、登录、系统参数、期、项目
│   ├── task/                # 任务表（TaskProvider、taskStore、utils）
│   └── document/            # 文档表（DocumentProvider、documentStore）
├── layout/                  # 外壳：Shell、sidebar/、topbar/、NoProject、useNotifications 等
├── overlays/                # 全局抽屉：project/、settings/、task/
├── pages/<模块>/
│   ├── <模块>Page.tsx       # 页面入口：持有状态、组合组件，不写大段 JSX
│   ├── components/          # 本页面的组件，平铺，不再分子目录
│   ├── css/                 # 本模块样式，<模块>.css 作为入口 import 其余文件
│   └── utils.ts             # 本模块的纯函数（可选）
├── shared/                  # 多处共用的东西
│   ├── components/          # 通用组件（Drawer、TaskBar）
│   ├── constants/           # 常量（task.ts 任务状态、labels.ts 中文名、permissions.ts、reports.ts、legends.ts）
│   ├── types/               # 类型，global.ts 放全局共享，其余按模块
│   └── utils/               # 通用函数（date、download、load）
└── styles/                  # 全局样式
```

- **放置规则**：只在一个页面里用的，放在该页面目录里；被两个以上页面、或外层（`layout/`、`overlays/`）用到的，放 `shared/`（组件、常量、类型、函数）或 `state/`（全局状态）。不要把东西留在某个页面目录里让别的页面或外层去引用。
- 拆分参考 `pages/documents/`、`pages/members/`、`pages/reports/`：页面入口之下拆成容器面板（如 `*Panel`）与原子子组件（如 `*Row`、`*Item`、`*Bar`、`*Axis`、`*Chart`），都平铺在 `components/` 里，靠文件名区分。
- 全局样式入口是 `styles/main.css`，按层引入：`styles/tokens/`（设计变量）→ `styles/index.css`（旧全局样式，逐步拆走，不要再往里加新东西）→ `styles/typography/roles.css`（组合文字样式）。
- **文字一律用变量，不写死。** 字体族、字号、字重、行高、字距、文字色都在 `styles/tokens/typography.css`：字号用 `--fs-2xs`（10px）到 `--fs-7xl`（60px）共 12 档，文字色用 `--text`、`--text-mute`、`--text-alert` 等。现有档位不够时先在这里加一档，不要就地写一个新的 px 值。组件里也不要用 `style={{ fontSize }}`。
- **同一种文字角色用同一个组合类**（`styles/typography/roles.css`）：页面标题 `t-page-title`、抽屉标题 `t-overlay-title`、面板标题上方的 `// WORD` 用 `t-kicker`、面板标题 `t-section-title`、字段名 `t-label`、说明 `t-hint`、错误 `t-error`、等宽元信息 `t-meta`、大数字 `t-figure`。组件 CSS 只写位置、间距和特殊底色下的颜色，不再重复写字体。
- **表单抽屉**统一用 `.fr` 行：左边 `span.lb.t-label`，右边输入框加 `className="u"`（下划线样式，`select` 也一样），选项按钮用 `.chips`，左边缘和输入框对齐；错误放 `div.err.t-error`；底部按钮主操作在前、取消在后。参考 `overlays/task/TaskDrawer.tsx`。
- 从 `styles/index.css` 迁出某模块样式时，在原位置留一行注释说明迁到了哪里；多页面共用的基础类（如 `.span2`、`.track`）保留在 `styles/index.css`，模块局部尺寸调整用模块作用域选择器覆盖。

## 页面与视觉约定

- **一屏展示与内联滚动**：主页面内容应尽量收敛在一屏视口内展示，避免被 SVG 固有宽高比或长列表反向撑高整页。SVG 图表外层容器使用相对/绝对定位贴合网格分配高度；多行列表区块超出高度时开启局部内联滚动（`overflow-y: auto` 配合细滚动条）。
- **面板头部 `// 英文词` + 中文标题对照**：面板标题区（`.phd`、`.dsec-h`、`.hk`）统一采用上方 `<span className="k">// WORD</span>` + 下方中文标题的双层结构（如 `// BURNDOWN` + `剩余任务`、`// TASKS` + `完成任务`、`// REVISING` + `修订中`）。上方英文尽量用一个自然贴切的单词作视觉装饰，无需生硬直译。

## 常量、类型与数据来源

常量放 `src/shared/constants/`，类型放 `src/shared/types/`（全局共享的在 `global.ts`，其余按模块），字段名和结构**严格对齐** `docs/api/openapi.yaml`。页面数据一律来自 `src/api/`，不写假数据。

### 全局上下文（`shared/types/global.ts`、`state/`）

多个模块共用的登录态和项目上下文统一放这里，**不要在模块文件里重复定义**：

| 内容 | 来源 |
|---|---|
| `UserBrief`、`TaskRef`、`ProjectRole`、`MemberPermissions`、`PermKey`、`Activity` 等共享接口结构 | `shared/types/global.ts`，对应 OpenAPI 公共 schema |
| 当前登录身份（用户、系统角色） | `src/state/auth/` 的 `useAuth()` / `useMe()`，数据来自 `GET /auth/me`，已接真实接口，token 存在 `sessionStorage`（`src/api/http.ts`） |
| 能进哪些项目、在当前项目里的角色和权限、任务能不能看和改 | `src/state/access/` 的 `useAccess()`，全站只在这里判断，页面只问不算。项目、成员、权限变更记录来自接口（`src/state/project/` 的 `ProjectProvider` 取 `GET /projects`、`/projects/{id}`、`/members`、`/activities`），`useAccess()` 在上面加“看过去的期和已归档项目只读”。系统管理员所有项目都能进、所有权限都有，其他人只能进自己加入的项目；权限以接口的 `myPermissions` 为准 |
| 正在看哪一期、各页面的“今天” | `src/state/issue/` 的 `useIssue()`。过去的期只读；期列表来自 `GET /projects/{projectId}/issues`（期号按项目开始日期每天一期），某期快照 `GET /projects/{projectId}/issues/{issueDate}` 由 `IssueProvider` 取回 |
| `roleLabel` 等枚举中文名 | `shared/constants/labels.ts` |

### 前端替身

目前没有替身，页面数据全部来自接口。以后新页面如果要先用假数据跑起来，假数据放在该页面目录里，并在这里列出来，接口接通时一起删；字段以 `docs/api/openapi.yaml` 为准，后端按接口文档实现，不要照着假数据反推。系统角色已统一为系统管理员 `ADMIN` 和普通用户 `USER` 两种。

### 已接真实接口的部分

请求统一走 `src/api/`：`http.ts` 是封装（自动加 token、解 `{code,message,data}`、失败抛 `ApiError`、401 回登录页），按模块拆 `auth.ts`、`system.ts` 等。接通一个模块的做法：页面里的假数据换成 `src/api/` 的调用，加载中和失败要有提示，删掉对应的假数据和不再用的替身。已接通：认证、人员、系统角色、系统参数、操作日志、项目（新建、修改、归档、切换）、项目成员（邀请、改角色、改权限）、权限变更记录、期列表、任务（看板、详情、新建、修改、删除、改状态、拖动排序、前置任务、任务动态）、成员负载、甘特图和关键路径（`/gantt`、`/critical-path`）、总览（`/overview`）、统计报表（`/reports/*`，含 Excel 导出）、往期快照（`/issues/{issueDate}`）、文档（列表、详情、上传新文档、传新版本、定稿、下载，往期读快照里的 `documents`）、讨论和评论（发起、回复、@ 成员和任务下的文档，往期读快照里的 `discussions`）、项目动态、通知（铃铛）。文档数据在 `state/document/DocumentProvider.tsx`：列表接口不带版本记录，所以逐份取详情，再由 `state/document/utils.ts` 的 `toDocumentItem` 转成页面用的格式（日期是 MM.DD）；上传走 `http.upload`（multipart，单个文件 ≤ 20MB，只收 doc、docx、pdf、md，提交前先校验，失败显示后端 `message`）。“文档没定稿不能完成任务”由后端检查（`PUT /tasks/{id}/status` 和 `/position` 返回 409），前端只显示它的提示；文档有写操作后任务表会跟着重新取。讨论数据在 `pages/collab/useCollabData.ts`：列表接口不带评论，所以逐个取详情，动态一直取接口（过去的期按日期筛）；发起和回复成功后重新取讨论、动态和任务表（任务详情里带着讨论），失败时回复框和抽屉里显示后端 `message`。通知在 `layout/useNotifications.ts`：登录后取一次、之后每分钟取一次，未读数用 `GET /notifications/unread-count`（列表只取最近 30 条），点通知标为已读并跳转（通知属于别的项目时先切过去），@ 通知带 `?discussionId=&commentId=`，协作页等数据取到后定位到那条消息。进度和报表的数据由后端算，页面用 `state/issue/useIssueData.ts` 取：看今天调实时接口（任务表每变一次重新取），看过去的期读 `state/issue/IssueProvider` 里取回的快照（没有存档时页面提示“这一期没有存档”）。任务数据在 `state/task/TaskProvider.tsx`：用 `GET /projects/{projectId}/tasks?detail=true` 一次取完整任务表，写操作成功后整表重新取一遍，拖动先在页面上移动、接口失败再退回。新建项目任何登录用户都可以，权限不足、项目已归档等失败的情况把接口的 `message` 显示给用户。
