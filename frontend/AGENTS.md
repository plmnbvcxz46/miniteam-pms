# frontend 补充约定

总约定见根目录 `AGENTS.md`，本文件只写前端补充，冲突时以根目录为准。设计系统与组件详细规范见 [`DESIGN.md`](./DESIGN.md)，历史基线审计见 [`audit.md`](./audit.md)。

---

## 重构目录结构与单向分层规则

当前正处于设计系统与架构重构期（已完成阶段 0 审计、阶段 1 规范、阶段 2 基础设施），新旧目录并行过渡，**新代码一律按目标结构落位**，旧目录在阶段 3–4 逐步迁出并删除：

```text
src/
├── App.tsx、main.tsx              # 入口、路由
├── styles/                        # 全局样式底座（阶段 2 已就位）
│   ├── tokens/                    # 仅允许 CSS 自定义属性定义（primitives/semantic/components/layout/typography/motion）
│   ├── base.css                   # Reset、color-scheme、body、:focus-visible、.sr-only、reduced-motion
│   ├── main.css                   # 统一入口：tokens/*.css → base.css → 过渡旧样式
│   ├── legacy.css                 # [过渡] 旧 CSS 变量兼容别名，阶段 4 全部模块迁移完成后必须为空并删除
│   ├── index.css                  # [过渡] 遗留全局样式，禁止新增规则，阶段 4 迁完删除
│   └── typography/roles.css       # [过渡] 旧 .t-* 排版角色类（非 Token），按 DESIGN.md 2.5 E 迁入组件后删除
├── components/                    # 通用组件层
│   ├── ui/                        # 阶段 3 封装：基于原生语义元素与 radix-ui 单包的无业务基础组件
│   └── patterns/                  # 阶段 4 按需建立：迁移到首个用到它的模块时再建
├── dev/                           # 仅开发环境（import.meta.env.DEV）组件样式手册页 /dev/ui，生产构建彻底排除
├── features/<业务域>/              # 按业务域收敛的页面与领域 hooks（阶段 4 逐模块从 pages/layout/overlays 迁入）
├── services/                      # 接口请求层（阶段 3 由 api/ 演进）
├── stores/                        # 全局状态层（阶段 3 由 state/ 演进）
├── shared/                        # 跨层通用纯函数、常量、类型（严禁反向依赖 state/stores/services）
└── [过渡旧目录] api/、state/、layout/、overlays/、pages/
```

### 硬性依赖方向红线（`eslint.config.js` 强制拦截）
- **单向依赖**：`features/*` → `components/patterns/*` → `components/ui/*` → `styles/tokens/*`。
- **`components/ui/`**：禁止引用 `components/patterns/` 及任何业务/数据层（`features`/`services`/`stores`/`api`/`state`/`pages`/`layout`/`overlays`）。
- **`components/patterns/`**：仅允许组合 `components/ui/` 与 `shared/` 纯工具，禁止依赖任何业务域或直接读取 `stores`/`state`（所有业务数据与 `today` 等状态一律由上层 props 传入）。
- **`features/<域>/`**：各 feature 之间**严禁互引**（包括相对路径跨兄弟目录）；UI/页面组件（`*.tsx`）禁止直接导入 `services/*` 或 `api/*`，网络请求必须收口在 hooks / stores / services 层。
- **Radix UI 引入规范**：统一从单包 `"radix-ui"` 按需具名导入（阶段 3 封装首个基础组件时安装），**禁止使用独立 `@radix-ui/*` 分包**。

---

## Design System 与样式红线（`stylelint.config.mjs` 强制校验）

详细 Token 数值、组件状态矩阵与 Do/Don't 规范以 [`DESIGN.md`](./DESIGN.md) 为准：

- **Token 文件纯净度**：`src/styles/tokens/*.css` **只允许 `:root`（及预留 `[data-theme="dark"]`）下的 `--*` 变量声明**，严禁写入普通选择器样式规则。
- **三层色彩红线**：`原始色板（primitives.css） → 语义色（semantic.css） → 组件色（components.css）`。组件与业务样式**严禁直接引用 `--gray-*` / `--signal-*` 或写死 hex / `rgba()`**（SVG `<mask>` 逻辑黑白除外）。
- **视觉基调与语义分离**：保持暖纸黑白 + 单信号橙（不引入新色相）；`--color-accent`、`--color-danger`、`--color-warning` 按用途分开命名与引用，`--color-success` / `--color-info` 使用墨色或中性灰；本次仅实现浅色值，预留 `[data-theme="dark"]` 仅覆写语义层扩展。
- **样式标尺**：间距以 **4px 为基准**，仅允许 `--space-0-5`（`2px`）与 `--space-1-5`（`6px`）两个半步（原 `10px`/`14px` 迁入新样式时对齐 `8/12/16px`）；全站坚持 **`0` 圆角**（仅圆形元素用 `--radius-full`）；标准描边 `1.5px` / 粗描边 `2px`；保留 `--font-size-2xs: 10px`、展示双档 `--font-size-display: 60px` / `--font-size-display-sm: 44px`（断点处切换 Token）以及大号统计数字语义 Token `--font-size-figure`（指向 `--font-size-display`）。
- **CSS Modules + `data-*` 驱动**：新组件与新页面样式统一使用 `*.module.css`，变体与交互态通过 `data-variant`、`data-size`、`data-state`、`data-loading`、`data-invalid` 与标准伪类（含补齐 `:active`、`:focus-visible`、`disabled` 弱化、`[aria-invalid="true"]`）驱动，**禁止拼接状态 class 名**。
- **破坏性操作与反馈**：使用 Radix `AlertDialog`（`ConfirmDialog`）统一替代原生 `window.confirm` 与双击确认，使用 `Toast` 替代 `window.alert` 与短暂操作反馈，表单/页面校验错误使用行内提示。

---

## 组件清单登记表（当前：阶段 2 基础设施就绪）

> 阶段 3 实现与阶段 4 迁移时，每落地或变更一个组件须同步更新本表与 `DESIGN.md`；禁止不经登记私自造重复控件。

### 基础组件（`src/components/ui/`）
| 组件 | 底层原语 | 状态 | 备注 |
|---|---|---|---|
| `Button` / `Input` / `Textarea` / `Badge` / `Alert` | 原生语义元素 | 待阶段 3 实现 | 覆盖 9 态，支持 `data-variant` / `data-size` |
| `Switch` / `Checkbox` / `ToggleGroup` / `Tabs` | `radix-ui` | 待阶段 3 实现 | 统一替代 `.sw2`/`.pm`/`.ck`/`.seg`/`.chips`/`.roles`/`.ov-tabs` |
| `Select` / `Popover` / `DropdownMenu` | `radix-ui` | 待阶段 3 实现 | 替代手写 `useDismiss` + `.issues` 与原生 `<select>` |
| `Drawer` / `AlertDialog` / `Toast` | `radix-ui` | 待阶段 3 实现 | `Drawer` 基于 `Dialog`；统一替代 `window.alert`/`confirm` |
| `Progress` / `Separator` | `radix-ui` | 待阶段 3 实现 | 支持双段进度与报纸双横线 |

### 业务范式组件（`src/components/patterns/`，阶段 4 迁移到首个用到它的模块时按需建立）
| 范式组件 | 状态 | 职责摘要 |
|---|---|---|
| `AppShell` / `PageHeader` / `Panel` / `Legend` | 阶段 4 按需建立 | `PageHeader` 吸收 `.t-page-title`（`60px`/`44px` 断点切 Token） |
| `FormDrawer` / `FormField` / `SearchInput` / `ConfirmDialog` | 阶段 4 按需建立 | 统一 `.fr`/`.srow` 表单行与破坏性操作二次确认 |
| `MetricStrip` / `HeroCard` / `LoadBar` / `TaskBar` | 阶段 4 按需建立 | `TaskBar` 剥离 `useIssue()` 改为受控 `today` prop |
| `ListRow` / `ActivityFeed` / `EmptyState` / `PageState` | 阶段 4 按需建立 | 强制原生 `<button>`/`<Link>` 语义，消除非语义点击元素 |
| `AssigneeCombobox` / `MentionTextarea` / `FileDropzone` | 阶段 4 按需建立 | `FileDropzone` 内部自治拖拽上传，文案不变 |

---

## 工程门禁规定（提交前必跑，不配置 husky）

- 本前端**不安装 `husky` / `lint-staged`**（不修改 Monorepo 根目录配置）。
- **每次提交前必须在 `frontend/` 目录运行以下命令，全部退出码为 0 方可提交**：
  ```bash
  pnpm check   # 串联执行 pnpm lint && pnpm lint:css && pnpm typecheck && pnpm knip
  pnpm build   # 验证 tsc -b && vite build 完整产物构建
  ```
- 各单项命令说明：
  - `pnpm lint`：ESLint 10 代码检查 + 单向依赖/跨 feature/Radix 单包约束。
  - `pnpm lint:css`：Stylelint + `stylelint-declaration-strict-value` Token 强制校验与原始色板禁令。
  - `pnpm typecheck`：无状态全量检查 `tsconfig.app.json` 与 `tsconfig.node.json`。
  - `pnpm knip`：死文件、死导出与未用依赖检测。

---

## 过渡期旧样式与遗留文件说明

- **旧 CSS 过渡豁免清单**：`src/styles/index.css`、`src/styles/legacy.css`、`src/styles/typography/roles.css`、`src/shared/components/TaskBar.css` 及 `src/pages/*/css/**/*.css` 已在 `stylelint.config.mjs` 的 `ignoreFiles` 中按模块登记；**严禁向这些旧文件新增规则**，阶段 4 每迁移完一个业务模块即从 `ignoreFiles` 移出并删除对应旧样式。**阶段 4 全部模块迁移完成后，`legacy.css` 必须为空并删除**。
- **组件样式手册 `/dev/ui`**：位于 `src/dev/UiShowcasePage.tsx`，通过 `import.meta.env.DEV` + 懒加载挂载在免登录路由 `/dev/ui`，供本地 `pnpm dev` 验收基础组件视觉与交互态，生产构建自动排除。
- **`frontend/prototype/`**：包含旧静态原型 `global.html` / `global.js`（`global.js:3291-3309` 含文档拖拽上传原始实现，且仍登记于 `tsconfig.app.json:25`）。在阶段 4 文档模块把拖拽上传收归 `FileDropzone`（且队友确认不再参考）之前**保留作为参考实现**，已在 `knip.json` 中忽略 `prototype/**`。
- **`knip.json` 遗留死导出豁免**：针对阶段 0 审出的 4 项旧代码零引用导出（`src/shared/utils/download.ts`、`src/pages/members/utils.ts`、`src/shared/types/reports.ts`、`src/shared/types/members.ts`）配置了精准 `ignoreIssues`，待阶段 4 迁移对应模块时删除并同步移除豁免，禁止放宽全局规则。

---

## 页面与视觉约定

- **一屏展示与内联滚动**：主页面内容应尽量收敛在一屏视口内展示，避免被 SVG 固有宽高比或长列表反向撑高整页。SVG 图表外层容器使用相对/绝对定位贴合网格分配高度；多行列表区块超出高度时开启局部内联滚动（`overflow-y: auto` 配合细滚动条）。
- **面板头部 `// 英文词` + 中文标题对照**：面板标题区统一采用上方 `// WORD`（kicker）+ 下方中文标题的双层结构（如 `// BURNDOWN` + `剩余任务`、`// TASKS` + `完成任务`、`// REVISING` + `修订中`）。上方英文尽量用一个自然贴切的单词作视觉装饰，无需生硬直译。

---

## 常量、类型与数据来源

常量放 `src/shared/constants/`，类型放 `src/shared/types/`（全局共享的在 `global.ts`，其余按模块），字段名和结构**严格对齐** `docs/api/openapi.yaml`。页面数据一律来自后端接口（现有 `src/api/`，阶段 3 演进为 `src/services/`），不写假数据。

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

请求统一走 `src/api/`：`http.ts` 是封装（自动加 token、解 `{code,message,data}`、失败抛 `ApiError`、401 回登录页），按模块拆 `auth.ts`、`system.ts` 等。接通一个模块的做法：页面里的假数据换成 `src/api/` 的调用，加载中和失败要有提示，删掉对应的假数据和不再用的替身。已接通：认证、人员、系统角色、系统参数、操作日志、项目（新建、修改、归档、切换）、项目成员（邀请、改角色、改权限）、权限变更记录、期列表、任务（看板、详情、新建、修改、删除、改状态、拖动排序、前置任务、任务动态）、成员负载、甘特图和关键路径（`/gantt`、`/critical-path`）、总览（`/overview`）、统计报表（`/reports/*`，含 Excel 导出）、往期快照（`/issues/{issueDate}`）、文档（列表、详情、上传新文档、传新版本、定稿、下载，往期读快照里的 `documents`）、讨论和评论（发起、回复、@ 成员和任务下的文档，往期读快照里的 `discussions`）、项目动态、通知（铃铛）。文档数据在 `state/document/DocumentProvider.tsx`：列表接口不带版本记录，所以逐份取详情，再由 `state/document/utils.ts` 的 `toDocumentItem` 转成页面用的格式（日期是 MM.DD）；上传走 `http.upload`（multipart，单个文件 ≤ 20MB，只收 doc、docx、pdf、md，提交前先校验，失败显示后端 `message`）。“文档没定稿不能完成任务”由后端检查（`PUT /tasks/{id}/status` 和 `/position` 返回 409），前端只显示它的提示；文档有写操作后任务表会跟着重新取。讨论数据在 `pages/collab/useCollabData.ts`：列表接口不带评论，所以逐个取详情，动态一直取接口（过去的期按日期筛）；发起和回复成功后重新取讨论、动态和任务表（任务详情里带着讨论），失败时回复框和抽屉里显示后端 `message`。通知在 `layout/useNotifications.ts`：登录后取一次、之后每分钟取一次，未读数用 `GET /notifications/unread-count`（列表只取最近 30 条），点通知标为已读并跳转（通知属于别的项目时先切过去），@ 通知带 `?discussionId=&commentId=`，协作页等数据取到后定位到那条消息。进度和报表的数据由后端算，页面用 `state/issue/useIssueData.ts` 取：看今天调实时接口（任务表每变一次重新取），看过去的期读 `state/issue/IssueProvider` 里取回的快照（没有存档时页面提示“这一期没有存档”）。任务数据在 `state/task/TaskProvider.tsx`：用 `GET /projects/{projectId}/tasks?detail=true` 一次取完整任务表，写操作成功后整表重新取一遍，拖动先在页面上移动、接口失败再退回。开始过的任务不能回到待开始（`state/task/utils.ts` 的 `canMoveStatus`，看板拖不进去、详情页按钮置灰，后端也会 409）；待开始的任务到了计划开始日由后端自动开始（前置都完成了进行中，否则阻塞）。任务条（`shared/components/taskBarModel.ts`）从实际开始日涂黑，系统自动移到阻塞的那条动态从实际开始日算阻塞。按天画的图（任务条、时间线、文档修订、侧栏时间进度）都把今天算作已过完：今天线、填充、逾期段都到今天 24:00，和逾期天数、已用天数（含今天）对得上；只有总览的成员排期精确到此刻，今天线和填充按当前时间画。新建项目任何登录用户都可以，权限不足、项目已归档等失败的情况把接口的 `message` 显示给用户。
