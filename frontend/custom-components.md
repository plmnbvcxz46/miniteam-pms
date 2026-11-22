# 自定义组件盘点与差异分析（阶段 3.5）

> **盘点范围**：`frontend/src/` 下全部页面与组件（113 个业务/布局/浮层 `.tsx` 组件 + `useCardDrag.ts`），核查 `components/ui/`（19 项已实现）尚未覆盖的全部自定义组件与交互。
> **归属铁律**：
> - 被 **≥ 2 个业务模块**使用 → `src/components/patterns/`
> - **通用交互、无业务含义** → `src/components/ui/`
> - **仅 1 个业务模块**使用 → 留在对应 `src/features/<模块>/`（或 `src/layout/`）内部，不往上抽象
> **底层方案三选一**：`A. radix-ui 原语与现有 ui 组件组合` / `B. 需要第三方库` / `C. 保留现有手写实现`

---

## 一、盘点概览

| 归属层 | 数量 | 说明 |
|---|---:|---|
| **`components/ui/`（新增待建）** | **0 项** | 现有 19 项基础组件已覆盖全部无业务通用原语（含 `Progress` 承接阶段/周进度条、`Popover`/`DropdownMenu`/`Drawer`/`AlertDialog`/`Toast` 承接浮层与反馈）；模糊搜索下拉已由队友抽为 `SearchDropdown`（跨 4 模块复用），作为组合范式进入 `components/patterns/SearchDropdown`（基于 `ui/Popover` + `ui/Input` + `ui/Spinner`，不引入 `cmdk`/`downshift`）。 |
| **`components/patterns/`（待建）** | **14 项** | 严格满足 ≥ 2 个模块复用；按阶段 4 迁移到首个使用模块时按需建立（合并 `origin/main` PR #37 后：新增跨 4 模块 5 处复用的 `SearchDropdown`，原 `SearchInput` 仅剩 `CrewLabels` 1 处故移出 `patterns/`；另保留原决策，不收入仅单模块使用的 `AppShell`、`AssigneePicker`、`MentionInput`、`FileDropzone`）。 |
| **`features/<模块>` / `layout` 内部保留** | **15 项** | 仅单一业务模块使用的图表、矩阵、拖拽看板、富文本 `@提及`、负责人选择器、文件拖放区与外壳部件，严禁提前抽象至 `patterns/`。 |
| **合计盘点项** | **29 项** | 完整覆盖 `src/` 下所有非 `components/ui/` 自定义组件与交互。 |

---

## 二、自定义组件全量盘点表（29 项）

> 建立时机对应阶段 4 迁移顺序：`1. auth` → `2. layout + projects + notifications` → `3. settings` → `4. reports` → `5. members` → `6. documents` → `7. timeline` → `8. overview` → `9a. tasks(详情/表单)` → `9b. tasks-board(看板拖拽)` → `10. collab`。

### A. 归属 `components/patterns/`（14 项，待建）

| # | 组件名 | 现有实现位置（文件:行） | 使用它的模块 | 交互复杂度 | 建议归属 | 底层方案 | 建立时机 |
|---:|---|---|---|---|---|---|---|
| 1 | **`PageHeader`** | `OverviewHeader.tsx:15`、`BoardHeader.tsx:27`、`TimelineHeader.tsx:26`、`ReportsHeader.tsx:30`、`CollabHeader.tsx:14`、`DocumentHeader.tsx:38`、`MembersHeader.tsx:24`、`SelfHeader.tsx:13`、`TaskHeader.tsx:30-88`、`NoProject.tsx:9-21`、`NoAccess.tsx:9-21` | `layout`、`overview`、`board`、`task`、`timeline`、`documents`、`collab`、`members`、`reports`（9 模块） | 低 | `components/patterns` | A. `radix-ui` / 现有 `ui` 组合（`Button`、`Separator(double)`） | 阶段 4 第 2 步（`layout`） |
| 2 | **`Panel`** | 20+ 处 `.pnl`/`.phd`（`NoProject.tsx:23`、`TodoPanel.tsx:21`、`ProgressPanel.tsx:11`、`GanttPanel.tsx:66`、`BurndownPanel.tsx:13`、`TaskInfoPanel.tsx:20`、`TaskLogPanel.tsx:11`、`ActivityFeedPanel.tsx:30`、`SelfLoad.tsx:17`、`DocumentRevising.tsx:39`、`DocumentFinal.tsx:21`） | `layout`、`overview`、`task`、`timeline`、`documents`、`collab`、`members`、`reports`（8 模块） | 低 | `components/patterns` | A. `radix-ui` / 现有 `ui` 组合（`Separator` + CSS Modules 容器） | 阶段 4 第 2 步（`layout`） |
| 3 | **`FormDrawer`** | `NewProjectDrawer.tsx:60-149`、`TaskDrawer.tsx:112-225`、`UploadDocDrawer.tsx:156-291`、`InviteMemberDrawer.tsx:121-283`、`NewDiscussionDrawer.tsx:95-207` | `projects`、`tasks`、`documents`、`members`、`collab`（5 模块） | 中 | `components/patterns` | A. `radix-ui` / 现有 `ui` 组合（`Drawer(md)`、`Button`、`Alert`、`Separator`） | 阶段 4 第 2 步（`projects`） |
| 4 | **`EmptyState` / `PageState`** | `NoProject.tsx:9-26`、`NoAccess.tsx:9-26`、`OverviewPage.tsx:71-86`、`TimelinePage.tsx:70-85`、`DocumentsPage.tsx:172-186`、`ReportsPage.tsx:50-65`、`DocumentDetail.tsx:31`、`PermLog.tsx:30`、`LogsPanel.tsx:52,75` | `layout`、`overview`、`task`、`timeline`、`documents`、`reports`、`members`、`settings`、`collab`（9 模块） | 低 | `components/patterns` | A. `radix-ui` / 现有 `ui` 组合（`Alert`、`Button`、`Spinner`） | 阶段 4 第 2 步（`layout`） |
| 5 | **`ActionPopover`** | `ProjectSwitch.tsx:53-99`、`IssueSwitch.tsx:54-89`、`NotificationBell.tsx:96-128`（共用 `.issues` 刊头 `h4` + 滚动列表 `.list.scroll-y` + 底部 `.pfoot`；`AssigneePicker` 已改走 `SearchDropdown`） | `layout`、`notifications`（2 模块 3 处） | 中 | `components/patterns` | A. `radix-ui` / 现有 `ui` 组合（`Popover`、`Button`、`Badge`） | 阶段 4 第 2 步（`layout`） |
| 6 | **`SearchDropdown`** | `shared/components/SearchDropdown.tsx:1-371` + `SearchDropdown.css`（被 `PeoplePanel.tsx:135`、`InviteMemberDrawer.tsx:173`、`DocumentHeader.tsx:51`、`UploadDocDrawer.tsx:282`、`AssigneePicker.tsx:60` 复用） | `settings`、`members`、`documents`、`tasks`（4 模块 5 处） | 高 | `components/patterns` | A. `radix-ui` / 现有 `ui` 组合（`Popover` + `Input` + `Spinner` + 完整 WAI-ARIA `combobox`/`listbox` 键盘状态机，按行数门禁拆分子文件，0 新增依赖） | 阶段 4 第 3 步（`settings`） |
| 7 | **`ConfirmDialog`** | `PeoplePanel.tsx:24,235`、`ProjPanel.tsx:33,183`、`DocumentsPage.tsx:113`、`TaskHeader.tsx:27,77` | `settings`、`documents`、`tasks`（3 模块） | 中 | `components/patterns` | A. `radix-ui` / 现有 `ui` 组合（`AlertDialog`、`Button(danger)`） | 阶段 4 第 3 步（`settings`） |
| 8 | **`Legend`** | `BurndownPanel.tsx:18-37`、`DeviationPanel.tsx:18-31`、`DocumentRevisingHeader.tsx:18-30`、`GanttPanel.tsx:73-90`、`SchedulePanel.tsx:25-44`、`ProgressPanel.tsx:27-36`（6 处） | `reports`、`documents`、`timeline`、`overview`（4 模块） | 低 | `components/patterns` | A. `radix-ui` / 现有 `ui` 组合（数据驱动纯展示组件，与 `Badge` 对齐） | 阶段 4 第 4 步（`reports`） |
| 9 | **`HeroCard`** | `ForecastHero.tsx:49-115`、`DocumentDetailHero.tsx:18-47`、`HeadlinePanel.tsx:26-59` | `reports`、`documents`、`overview`（3 模块） | 低 | `components/patterns` | A. `radix-ui` / 现有 `ui` 组合（`Badge` + 共享外框/顶栏/风险态外壳，主体 slot 由各模块组合） | 阶段 4 第 4 步（`reports`） |
| 10 | **`LoadBar`** | `LoadRow.tsx:25-49`、`MemberLoad.tsx:30-39`、`SelfLoad.tsx:33-50`、`AssigneePicker.tsx:30-39`（`LoadMeter`） | `reports`、`members`、`tasks`（3 模块） | 低 | `components/patterns` | A. `radix-ui` / 现有 `ui` 组合（基于 `Progress(solid, striped, thresholdPercent)` + `role="meter"` + `load.ts`） | 阶段 4 第 4 步（`reports`） |
| 11 | **`ListRow`** | `SelfTasks.tsx:46-83`、`TodoPanel.tsx:30-36`、`DependencyRow.tsx:11-21`、`LinkRow.tsx:19-24`、`BlockedBy.tsx:11-20`、`ThreadItem.tsx:20-45` | `members`、`overview`、`tasks`、`collab`（4 模块） | 低 | `components/patterns` | A. `radix-ui` / 现有 `ui` 组合（原生 `<button>`/`<Link>` + `Badge`） | 阶段 4 第 5 步（`members`） |
| 12 | **`ActivityFeed`** | `PermLog.tsx:20-35`、`SelfLog.tsx:14-31`、`PermLogItem.tsx:8-15`、`TaskLogPanel.tsx:10-26`、`ActivityFeedPanel.tsx:30-65`、`ActivityFeedItem.tsx:25-56` | `members`、`tasks`、`collab`（3 模块） | 低-中 | `components/patterns` | A. `radix-ui` / 现有 `ui` 组合（`Panel` + 统一样式时间线列表，支持只读/可选中与深浅面） | 阶段 4 第 5 步（`members`） |
| 13 | **`TaskBar`** | `shared/components/TaskBar.tsx:33-145` + `taskBarModel.ts` + `TaskBar.css`（被 `GanttRow.tsx:31`、`SchedulePanel.tsx(task):26`、`TaskCard.tsx:69` 复用） | `timeline`、`tasks`（含详情与看板，2 模块 3 处） | 高 | `components/patterns` | C. 保留现有手写实现（剥离 `useIssue()` 改为必传 `today` prop，迁入 CSS Modules） | 阶段 4 第 7 步（`timeline`） |
| 14 | **`MetricStrip`** | `overview/FigureStrip.tsx:14-39` + `Figure.tsx:9-19`、`task/TaskFigures.tsx:15-24` + `FigureItem.tsx:8-22` | `overview`、`tasks`（2 模块） | 低 | `components/patterns` | A. `radix-ui` / 现有 `ui` 组合（`Badge` + 4 格 KPI 网格，`--font-size-figure`） | 阶段 4 第 8 步（`overview`） |

### B. 留在 `features/<模块>` 或 `layout/` 内部（15 项，不往上抽象）

| # | 组件名 | 现有实现位置（文件:行） | 使用它的模块 | 交互复杂度 | 建议归属 | 底层方案 | 建立时机 |
|---:|---|---|---|---|---|---|---|
| 15 | **`LoginHeader`** | `LoginPage.tsx:98-113` | `auth`（仅 1 模块） | 低 | `features/auth` | A. 现有 `ui` / Token 组合（直接使用 `--font-size-display`） | 阶段 4 第 1 步（`auth`） |
| 16 | **`AppShell` & 侧栏/顶栏专有部件**（`NavIcon`/`SidebarNav`/`SummaryCard`/`WeekLine`/`AccountMenu`） | `Shell.tsx:1-119`、`NavIcon.tsx:1-67`、`SidebarNav.tsx:1-51`、`SummaryCard.tsx:1-41`、`WeekLine.tsx:1-41`、`AccountMenu.tsx:1-91` | `layout`（仅全局外壳 1 处） | 中 | `layout` | A. 现有 `ui` 组合（`SummaryCard` 复用 `Progress(dual)`、`WeekLine` 复用 `Progress(segmented)`、`AccountMenu` 复用 `DropdownMenu`） | 阶段 4 第 2 步（`layout`） |
| 17 | **`SettingsPanelShell` & 系统日志按日表 `LogsPanel`** | `SettingDrawer.tsx:1-108`、`LogsPanel.tsx:50-85`、`MePanel.tsx:1-283`、`ParamsPanel.tsx:1-159`、`PeoplePanel.tsx:1-375`、`ProjPanel.tsx:1-202` | `settings`（仅 1 模块） | 高 | `features/settings` | A. 现有 `ui` 组合（`Drawer(lg)`、`Tabs`、`Field`、`Input`、`Switch`、`ToggleGroup`、`Badge`） | 阶段 4 第 3 步（`settings`） |
| 18 | **`BurndownChart`** | `BurndownPanel.tsx:1-47`、`BurndownChart.tsx:1-234` | `reports`（仅 1 模块） | 高 | `features/reports` | C. 保留现有手写 SVG 实现（含 `<mask>` 绘制动画，严禁替换蒙版逻辑黑白） | 阶段 4 第 4 步（`reports`） |
| 19 | **`WeeklyBarChart`** | `WeeklyPanel.tsx:1-34`、`WeeklyBar.tsx:1-33`、`WeeklyAxis.tsx:1-16` | `reports`（仅 1 模块） | 低 | `features/reports` | C. 保留现有手写实现（CSS Grid 柱图 + 入场动画，切语义 Token） | 阶段 4 第 4 步（`reports`） |
| 20 | **`DeviationChart`** | `DeviationPanel.tsx:1-39`、`DeviationRow.tsx:1-76` | `reports`（仅 1 模块） | 中 | `features/reports` | C. 保留现有手写实现（计划虚线 vs 实际/超期双层条，切语义 Token） | 阶段 4 第 4 步（`reports`） |
| 21 | **`MemberCrewMatrix`** | `MemberCrew.tsx:1-93`、`CrewLabels.tsx:1-61`、`MemberColumn.tsx:1-99` | `members`（仅 1 模块） | 中 | `features/members` | A. 现有 `ui` 组合（横向滚动矩阵 + `Select` + `Switch(track)` + `patterns/LoadBar` + `ui/Input(boxed)` 本地过滤框） | 阶段 4 第 5 步（`members`） |
| 22 | **`FileDropzone`** | `UploadDocDrawer.tsx:182-196` + 参考原型 `prototype/global.js:3291-3309` | `documents`（仅 1 模块） | 中 | `features/documents` | C. 保留/补齐原生 HTML5 Drag&Drop 实现（内部自治 `onDragEnter`/`Over`/`Leave`/`Drop` + 20MB/扩展名校验，**文案不变**；`Alert(inline)` 报校验错） | 阶段 4 第 6 步（`documents`） |
| 23 | **`DocumentRevisingTimeline`** | `DocumentRevising.tsx:1-71`、`DocumentRevisingItem.tsx:18-113`（含内部 `TimelineBar`） | `documents`（仅 1 模块） | 中 | `features/documents` | C. 保留现有手写实现（按文档历史版本与截止日绘制双段进度条，外层复用 `Panel` + `Legend` + `Badge`） | 阶段 4 第 6 步（`documents`） |
| 24 | **`GanttChart`**（`GanttPanel`/`GanttAxis`/`GanttDeps`/`GanttRow`） | `GanttPanel.tsx:1-169`、`GanttAxis.tsx:1-52`、`GanttDeps.tsx:1-81`、`GanttRow.tsx:1-45` | `timeline`（仅 1 模块） | 高 | `features/timeline` | C. 保留现有手写实现（`ResizeObserver` 动态日宽 + SVG 依赖折线箭头；行内进度条复用 `patterns/TaskBar`） | 阶段 4 第 7 步（`timeline`） |
| 25 | **`CriticalPathTable`** | `CriticalPanel.tsx:1-46`、`CriticalRow.tsx:1-21` | `timeline`（仅 1 模块） | 低 | `features/timeline` | C. 保留现有语义 `<table>` 实现（外层复用 `Panel` + `Badge`） | 阶段 4 第 7 步（`timeline`） |
| 26 | **`MemberScheduleBoard`**（`SchedulePanel`/`ScheduleRow`） | `overview/components/SchedulePanel.tsx:1-75`、`ScheduleRow.tsx:1-52` | `overview`（仅 1 模块） | 中 | `features/overview` | C. 保留现有手写实现（多泳道排期 + 精确到此刻的今天线；外层复用 `Panel` + `Legend`） | 阶段 4 第 8 步（`overview`） |
| 27 | **`CriticalChainPanel`** | `overview/components/CriticalChainPanel.tsx:1-65` | `overview`（仅 1 模块） | 低 | `features/overview` | A. 现有 `ui` / `patterns` 组合（`Panel(dark)` + `Badge`） | 阶段 4 第 8 步（`overview`） |
| 28 | **`AssigneePicker`** | `overlays/task/AssigneePicker.tsx` + `overlays/task/assignee.ts`（已瘦身为 `SearchDropdown` 之上的业务封装） | `tasks`（仅 `TaskDrawer`，1 模块） | 中 | `features/tasks` | A. 组合 `patterns/SearchDropdown` + `patterns/LoadBar` + `ui/Badge` + 保留 `assignee.ts` 检索与推荐算法 | 阶段 4 第 9a 步（`tasks`） |
| 29 | **`DraggableBoard`（`TaskCard` + `useCardDrag`）** | `BoardPage.tsx:32-123`、`BoardColumn.tsx:1-79`、`TaskCard.tsx:1-82`、`useCardDrag.ts:1-139` | `tasks`（仅看板，1 模块） | 高 | `features/tasks` | C. 保留现有手写指针拖拽实现（只迁位置并改 `data-*` 选择器；内部条复用 `patterns/TaskBar(compact)`，详见第五节 Bug 清单） | 阶段 4 第 9b 步（`tasks-board`） |
| *(附)* | **`MentionInput` & `MessageItem`** | `MentionInput.tsx:1-211`、`MessageItem.tsx:1-80` | `collab`（`ReplyForm` 与 `NewDiscussionDrawer` 同属 1 模块） | 高 | `features/collab` | C. 保留现有手写 `@` 光标触发与键盘导航逻辑（外框复用 `ui/Textarea` 与 `Popover` 浮层视觉 Token） | 阶段 4 第 10 步（`collab`） |

> 注：以上 `B` 表含 15 组（计入 `MentionInput` 共 16 项，与 `A` 表 14 项合计覆盖全部非 `ui/` 自定义组件；`ProgressPanel` `.pbar` 已直接由阶段 3 `ui/Progress(solid)` 覆盖，无需额外自定义）。

---

## 三、相似组件的差异分析

> 所有**会带来视觉变化的统一**此处仅给建议，等待用户确认后于阶段 4 执行。

### 组 1：5 个表单抽屉（`NewProjectDrawer` / `TaskDrawer` / `UploadDocDrawer` / `InviteMemberDrawer` / `NewDiscussionDrawer`）
- **差异点**：
  1. `UploadDocDrawer.tsx:157` 与 `InviteMemberDrawer.tsx:122` 给抽屉传 `.opening` 动画类并使用 `<header><h1>`，其余 3 个无 `.opening` 且用 `<div><h2>`。
  2. 提交按钮在 TSX 中写 `btn primary`，靠 `index.css:2089` `.fx-acts .btn.primary` 暗中覆写为信号橙底。
- **归类**：**无意漂移**。
- **建议**：统一收归 `patterns/FormDrawer`（内部复用 `ui/Drawer(md)` + 统一滑入动画 + `Button(accent)` 提交钮 + 统一 `Alert(inline, danger)` 错误槽）。
- **视觉变化影响**：`NewProjectDrawer`、`TaskDrawer`、`NewDiscussionDrawer` 打开时将与其他 2 个抽屉一致带平滑滑入过渡；所有 5 个抽屉标题统一为 `--font-size-display-sm`（44px），视觉更协调。

### 组 2：12 处页面头部（9 页 Header + `NoProject` + `NoAccess` + `LoginPage`）
- **差异点**：
  1. 9 个标准页面（`Overview`/`Board`/`Timeline`/`Reports`/`Collab`/`Documents`/`Members`/`Self` + `NoProject`/`NoAccess`）结构完全一致：双线刊头 + `// KICKER` + `60px` 标题 + 右侧操作区。
  2. `TaskHeader.tsx:30-88` 增加了顶部返回按钮与面包屑，且标题被 `task-header.css:64` 降档为 `44px`（`--font-size-display-sm`）。
  3. `LoginPage.tsx:98-113` 只有 Logo + 居中 `60px` 大标题，无双横线、无右侧操作区。
- **归类**：
  - `TaskHeader` 与其余 10 处标准页头 → **有意的小差别**；
  - `LoginPage` → **差别太大**。
- **建议**：`patterns/PageHeader` 仅提供 `size="default" | "compact"` 两个明确变体（1 个变体属性，零布尔堆叠：`default` 用 `60px`、`compact` 用 `44px` 供 `TaskHeader` 使用，可选 `breadcrumb` 与 `actions` 插槽）；`LoginPage` 保持独立轻页头 `LoginHeader`，仅引用 `--font-size-display`。
- **视觉变化影响**：无视觉变化（精确还原各页现有排版）。

### 组 3：面板容器（20+ 处 `.pnl`/`.phd` vs 文档页 `.dsec`/`.dsec-h`）
- **差异点**：
  1. 绝大多数面板使用 `.pnl`（暖纸底+黑框）、`.pnl.flat`（无阴影/嵌套）、`.pnl.dark`（反色黑底），头部均是 `// WORD` + 中文标题 + 右侧计数/操作。
  2. 文档页 `DocumentRevising.tsx:39` 与 `DocumentFinal.tsx:21` 自造 `.dsec` / `.dsec-h`，边框与阴影一致，仅内边距/字号有 2–4px 细微偏差（`document-revising.css` vs `index.css`）。
- **归类**：`.pnl` 三种底色为**有意的小差别**；文档页 `.dsec` 细微间距差为**无意漂移**。
- **建议**：统一收归 `patterns/Panel`，提供 `variant="default" | "flat" | "dark"` 三个明确变体（0 布尔开关堆叠）。
- **视觉变化影响**：**文档页（`DocumentsPage`）** 的“修订中”与“已定稿”两个分区头部间距与描边将对齐全站标准面板（变化幅度 2–4px）。

### 组 4：工时负载条（4 处：`MemberLoad` / `SelfLoad` / `LoadRow` / `AssigneePicker.LoadMeter`）
- **差异点**：
  1. `MemberLoad.tsx:30`（成员矩阵）、`SelfLoad.tsx:33`（个人页）、`LoadRow.tsx:25`（报表页）均调用同一个 `calculateLoadBar()`，渲染完全同构的 `.track > .cap + .fill + .over`（上限虚线 + 墨色填充 + 超载橙斜纹）；但仅 `SelfLoad` 写了 `role="meter"` 无障碍属性，仅 `LoadRow` 带入场 CSS 动画。
  2. `AssigneePicker.tsx:30` 的 `LoadMeter` 是下拉选项内的迷你细条（无上限虚线，仅单色填充超载变橙）。
- **归类**：前 3 处缺 ARIA 为**无意漂移**；`AssigneePicker.LoadMeter` 的紧凑单轨为**有意的小差别**。
- **建议**：统一收归 `patterns/LoadBar`（底层复用 `ui/Progress(solid, striped, thresholdPercent)`），提供 `variant="detailed" | "compact"` 两个变体（`detailed` 带上限虚线与斜纹，`compact` 用于下拉选项），统一内置 `role="meter"`。
- **视觉变化影响**：`MemberLoad` / `SelfLoad` / `LoadRow` 视觉基本一致（高度与斜纹统一对齐 `ui/Progress` 规范，成员页与报表页负载条厚度将完全统一）。

### 组 5：时间条与阶段进度条（`TaskBar` / 概览 `ScheduleRow` / 文档 `TimelineBar` / 报表 `DeviationRow` / `SummaryCard` / `ProgressPanel` / `ForecastHero` / `WeekLine`）
- **差异点与外层包装实测核查（阶段 3.5 补充确认）**：
  1. 4 处阶段/项目进度条的外层包装逐一核对结果：
     - `WeekLine`（`src/layout/topbar/WeekLine.tsx:12-39`，仅全局顶栏 1 处）：横向三段 `[开始月日] + [按周格子 .weeks（past/now）] + [结束月日]`；
     - `SummaryCard`（`src/layout/sidebar/SummaryCard.tsx:19-39`，仅全局侧栏 1 处）：垂直卡 `距计划结束 N 天 + [双层时间/完成条 .gauge] + 底部时间/完成百分比`；
     - `ProgressPanel`（`src/pages/overview/components/ProgressPanel.tsx:11-37`，仅总览 1 处）：标准 `Panel + 百分比大数 + [双段条 .pbar（内嵌已完成/剩余数字）] + Legend`；
     - `ForecastHero`（`src/pages/reports/components/ForecastHero.tsx:63-81`，仅报表 Hero 1 处）：`[主段+超期斜纹/提前虚线 .fbar] + 贴合主段宽度的“今天 / 计划”日期标注`；
     - 时间线页（`TimelinePage`）无此类阶段进度条（`GanttAxis` 为周/日表头刻度，任务行复用 `patterns/TaskBar`）。
     - **核查结论**：上述 4 处外层包装**无任何两处存在相同包装逻辑**，各自仅出现 1 次 → **维持现状，不升级为新的 `patterns` 组件**，在各自所属模块直接调用 `ui/Progress`（及已登记的 `Panel`/`Legend`/`HeroCard`）即可。
  2. `TaskBar`（`timeline`、`task`、`board` 3 处复用）：完整任务生命周期模型（`taskBarModel.ts`：未开始/进行中/阻塞多段/逾期/提前完成/今天线/截止线/完成标记），已有 `compact` 紧凑模式。
  3. `ScheduleRow`（`overview`）：本周 7 天多泳道自动堆叠排期，每条是可点击 `<button>` 且内嵌任务标题，**今天线精确到当前时刻（非 24:00）**，业务语义与 DOM 结构与 `TaskBar` 完全不同。
  4. `DocumentRevisingItem` 内 `TimelineBar`（`documents`）：基于文档版本日期数组计算 `first` → `due` → `today`，嵌套在 `role="option"` 选中行内，反色选中时条色同步反白。
  5. `DeviationRow`（`reports`）：无日期轴，是“计划天数虚线 vs 实际天数实线 + 超期段”的工期对比条。
- **归类**：**结构或交互差别大 / 差别太大**。
- **已确认方案**：
  - `SummaryCard` / `ProgressPanel` / `ForecastHero` / `WeekLine` → 维持各自模块内直接复用 `ui/Progress`，不新建 `patterns`；
  - `TaskBar` → 归入 `patterns/TaskBar`（剥离 `useIssue()` 必传 `today`，提供 `variant="full" | "compact"`）；
  - `ScheduleRow`、`DocumentRevisingItem`、`DeviationRow` → **各自留在所属 `features/` 内部，保持独立**，仅共享 `shared/utils/date.ts` 日期计算纯函数与语义斜纹 Token（`--comp-pattern-warn`）。
- **视觉变化影响**：无（避免强行合并破坏“总览精确到此刻、其余按天 24:00”的核心业务约定）。

### 组 6：Hero 强调卡（3 处：`HeadlinePanel` / `ForecastHero` / `DocumentDetailHero`）
- **差异点**：
  1. 三者共享完全一致的报刊强调卡外框语义：顶栏 `.hk`（标题/kicker + 右上角风险/正常徽标）、风险态（橙色高亮/顶边）与正常态（`.calm` 暖纸底）切换、以及大号核心数字（`--font-size-display` / `--font-size-figure`）。
  2. 但主体内容差异明显：`HeadlinePanel` 含两段式中文头条句 + 可点击阻塞任务标签 + 右下跳转按钮；`ForecastHero` 含周期进度条 `.fbar` + 日期刻度 + 超期任务摘要；`DocumentDetailHero` 仅含文档名 + 单行大数字/版本号与两行副文。
- **归类**：**结构或交互差别大（但外壳完全同构）**。
- **建议**：`patterns/HeroCard` **只共享外壳与顶栏零件**（`tone="alert" | "calm"`、`kicker?`、`title?`、`badge?`、`children`、`footer?`），主体内容由 `overview`、`reports`、`documents` 各自组合，不往 `HeroCard` 堆砌 `headline`/`progress`/`tags` 等业务 props。
- **视觉变化影响**：三页 Hero 卡的顶部 `// KICKER` + 风险徽标对齐方式与外框描边完全一致，其中 `ForecastHero` 大号日期字号由 56px 统一对齐 `--font-size-figure`（窄容器在阶段 4 需按前序约定截图确认不溢出）。

### 组 7：KPI 指标条（2 处：`overview/FigureStrip+Figure` vs `task/TaskFigures+FigureItem`）
- **差异点**：
  1. 两者共用同一套 `index.css` `.figures`/`.figure` 4 联网格与首格反白样式。
  2. `overview/Figure.tsx:14` 在 `alert` 态右上角显示 `<span className="chip">风险</span>` 且底部有 `sub` 说明；`task/FigureItem.tsx:19` 无 `sub` 与“风险”徽标，但在大数字右侧多了一个 `unit`（如 `工作日`、`项`）。
- **归类**：**有意的小差别**（纯可选插槽，非冲突变体）。
- **建议**：合并为 `patterns/MetricStrip` + `MetricCard`（可选 `unit?`、`sub?`、`tone="default" | "alert"`、`badge?`，不堆布尔开关）。
- **视觉变化影响**：无视觉变化（大数字统一使用 `--font-size-figure`，阶段 4 迁移时截图核验 4 联宽度）。

### 组 8：日志与动态流（4 处：`TaskLogPanel` / `ActivityFeedPanel` / `PermLog` & `SelfLog` / `LogsPanel`）
- **差异点**：
  1. `TaskLogPanel.tsx`（深色底只读 `time + p`）与 `ActivityFeedPanel.tsx`（深色底可点击选中 `time + p + 讨论联动`）共用 `.feed`/`.ev`（且 `task-panels.css` 与 `collab-feed.css` 存在样式重复碰撞！）。
  2. `PermLog.tsx` / `SelfLog.tsx`（浅色底只读 `time + p`，含新增自动滚顶）。
  3. `LogsPanel.tsx:54-73`（设置抽屉系统操作日志）：按日期分组 `<h3>`、4 列固定网格（`时间 | 操作人 | 对象·动作+斜体详情 | IP`）+ 分页“加载更多”，与前 3 处结构截然不同。
- **归类**：
  - `TaskLogPanel` / `ActivityFeedPanel` / `PermLog` & `SelfLog` → **有意的小差别**；
  - `LogsPanel` → **差别太大**。
- **建议**：前 3 处合并为 `patterns/ActivityFeed`（`surface="light" | "dark"`，支持可选 `onSelect` / `activeId`）；`LogsPanel` 保持独立留在 `features/settings/` 内部。
- **视觉变化影响**：`TaskLogPanel` 与 `ActivityFeedPanel` 的行距/分割线/时间字体彻底统一（消除 `.feed`/`.ev` 样式碰撞）；`PermLog`/`SelfLog` 与 `TaskLogPanel` 保持各自浅/深底色，视觉微调仅限于间距对齐 4px 栅格。

### 组 9：跳转列表行（6 处：`DependencyRow`/`LinkRow` / `TodoPanel` / `BlockedBy` / `SelfTasks` / `ThreadItem` / `GanttRow`）
- **差异点**：
  1. `DependencyRow.tsx` 与 `LinkRow.tsx` 共用 `.dep` 样式，几乎完全同构（左侧状态色块或标签 + 标题 + 副信息 + 右侧状态）。
  2. `TodoPanel.tsx:31`（`<div onClick>` 缺键盘语义）、`BlockedBy.tsx`（`<div onClick>` 缺键盘语义）、`SelfTasks.tsx`（`<button>`）、`ThreadItem.tsx`（`<button>`）：均为“左侧徽标/状态点 + 主标题 + 副信息/右侧状态”的可点击列表行。
  3. `GanttRow.tsx` 左侧名称按钮是固定 `170px` 吸顶列且必须与右侧 `40px` 甘特行高像素级对齐。
- **归类**：前 5 处交互/语义差异为**无意漂移 + 轻微变体**；`GanttRow` 为**差别太大**。
- **建议**：前 5 处统一为 `patterns/ListRow`（强制原生 `<button type="button">` 或 `<Link>` 顺带修复 `TodoPanel`、`BlockedBy` 非语义可点击问题；提供 `density="compact" | "comfortable"` 与 `leading`/`title`/`meta`/`trailing` 插槽）；`GanttRow` 保持独立留在 `features/timeline/`。
- **视觉变化影响**：`TodoPanel`、`BlockedBy`、`SelfTasks`、`DependencyRow`、`LinkRow` 的 hover 态、focus-visible 焦点环与行内间距将统一为标准 `ListRow` 风格（均保持暖纸风，仅细节内边距对齐 4px 栅格）。

### 组 10：`.issues` 浮层列表（4 处）与搜索框（4 处）
- **差异点 A（浮层列表）**：
  - `ProjectSwitch`、`IssueSwitch`、`NotificationBell`、`AssigneePicker` 均复用 `.issues` 样式：顶部 `<h4>KICKER<em>计数</em></h4>` + `.list.scroll-y` + 可选底部 `.pfoot` 操作按钮；但 4 处各自用 `useDismiss` 手写定位（硬编码 `top: 71px` 等），缺 Portal 与碰撞避让。
  - `AccountMenu.tsx` 实际是纯操作菜单（个人资料 / 退出登录），无滚动列表和底部操作栏，属于标准 `ui/DropdownMenu`。
  - **归类**：前 4 处外壳为**无意漂移**（手写定位），抽成 `patterns/ActionPopover`（基于 `ui/Popover` 提供统一刊头、滚动体、空态与底部槽）；`AccountMenu` 直接用 `ui/DropdownMenu`。
  - **视觉变化影响**：浮层出现位置由硬编码坐标改为 Radix 自动贴边与防溢出，视觉外观（暖纸底、黑框、硬阴影）保持一致。
- **差异点 B（搜索下拉与普通搜索框，合并 `origin/main` 后更新）**：
  - 合并 `origin/main`（PR #37）后，`PeoplePanel`、`InviteMemberDrawer`、`DocumentHeader`、`UploadDocDrawer` 与 `AssigneePicker` 共 5 处（跨 4 模块）已统一使用 `shared/components/SearchDropdown`（支持 `variant="line" | "box"`、`toggle` 切换钮、`openOn="focus" | "input"`、`loading` 异步搜索、`footer` 固定行与 `align="left" | "right"`）；原普通搜索框仅剩 `members/CrewLabels.tsx` 1 处（边输边滤）。
  - **归类**：`SearchDropdown` 为跨 4 模块高频复用的核心交互范式；`CrewLabels` 仅单处本地输入，不再构成跨模块范式。
  - **建议**：在 `components/patterns/` 建立 **`SearchDropdown`**（替代原 `SearchInput` 登记），底层采用方案 A（`ui/Popover` + `ui/Input` + `ui/Spinner`），消除现有手写 `useDismiss` 与 `placement="fixed"` 的 `DOMRect` 坐标计算；`CrewLabels` 直接在 `features/members/` 内使用 `ui/Input(boxed)`。
  - **视觉变化影响**：`SearchDropdown` 浮层改为 Radix Portal 自动避让定位，外观（暖纸底、黑框、硬阴影、`// KICKER` 刊头、下划线/带框两种触发器）与现有 `main` 保持一致。

---

## 四、第三方依赖评估对比（当前结论：建议 0 新增第三方依赖）

### 4.1 模糊搜索下拉（`SearchDropdown` / `AssigneePicker`）方案对比

合并 `origin/main`（PR #37）后，队友已将原 `AssigneePicker` 的通用下拉搜索交互抽为 `shared/components/SearchDropdown.tsx`（371 行），被 `settings`（`PeoplePanel`）、`members`（`InviteMemberDrawer`）、`documents`（`DocumentHeader`、`UploadDocDrawer`）、`tasks`（`AssigneePicker`）共 **4 个模块 5 处**复用；而 `AssigneePicker` 保留任务专属业务语义（空格分词、`+必含`、`-排除`、姓名子串 `<mark>` 高亮、技能匹配排序、结合工时负载的推荐算法与迷你负载条）。

| 维度 | 方案 A：`radix-ui` `Popover` + 现有 `ui/Input` / `ui/Spinner` 组合为 `patterns/SearchDropdown`（**推荐**） | 方案 B：引入 `cmdk` | 方案 C：引入 `downshift` |
|---|---|---|---|
| **新增体积（gzip）** | **0 KB**（零新依赖） | ~4–5 KB（依赖 `@radix-ui/react-dialog`，且与本项目单包 `radix-ui` 存在依赖版本重装风险） | ~7–8 KB（仅提供 hook，仍需手写全部 UI 与定位） |
| **可访问性（WAI-ARIA）** | 现有 `SearchDropdown.tsx` 已完整实现 `role="combobox"`、`aria-expanded`、`aria-controls`、`aria-activedescendant`、`role="listbox"`/`option`、键盘 `↑/↓/Enter/Esc/Tab` 与焦点返回；接入 `ui/Popover` 即可补齐 Portal 与碰撞翻转，移除 `useDismiss` 与手算 `DOMRect` | 开箱即用 `cmdk` 列表键盘导航，但**默认内置模糊评分器会与 `AssigneePicker` 的 `+必含/-排除` 自定义语法及 `InviteMemberDrawer` 远程异步搜索冲突**（需 `shouldFilter={false}` 关掉核心过滤功能） | 极佳的 ARIA 合规性，但需重写全部状态机，且仍需搭配 Floating UI / Radix Popover 解决 Portal 定位 |
| **与 `radix-ui` 单包配合** | **完美兼容**（零依赖冲突，遵守 `AGENTS.md` 单包约束） | 需显式引入 `cmdk`（内部可能拉取旧独立 `@radix-ui/react-dialog` 造成多份 Radix 实例） | 无冲突，但属于第二套交互状态抽象 |
| **维护情况与团队成本** | 1 份 `patterns/SearchDropdown`（按行数门禁拆为容器 + 键盘 hook + 选项列表，每文件 ≤ 150–250 行）同时服务全部 5 处；`AssigneePicker` 仅留薄业务封装 + 纯函数 `assignee.ts` | 偏向 Cmd+K 命令面板，定制下划线触发器、`toggle` 切换钮与 `footer` 固定行体验生硬 | 维护稳定但低频更新，学习与迁移成本高于收益 |

- **建议（`SearchDropdown` 与 `AssigneePicker` 方案 A 合二为一）**：**建议合并为同一套方案 A 底座，但保持分层解耦**——将通用下拉搜索交互壳统一建设为 `components/patterns/SearchDropdown`（0 新增依赖，基于 `ui/Popover` + `ui/Input` + `ui/Spinner`），而 `features/tasks/components/AssigneePicker` 保留在任务模块内部作为业务薄封装调用 `patterns/SearchDropdown` + `patterns/LoadBar` + `ui/Badge` + `assignee.ts`。这样既消除重复造 combobox 的成本，又严守 `patterns/` 不沾染任务业务算法的红线。

### 4.2 拖拽（`useCardDrag`）与图表（`BurndownChart` / `GanttPanel`）
- **拖拽**：不引入 `@dnd-kit` / `react-beautiful-dnd`，按要求保留现有手写 `useCardDrag`（仅 139 行、0 依赖、完美支持自定义列间权限拦截 `canDrop` 与 Portal 浮卡）。
- **图表 / 甘特**：不引入 ECharts / Recharts / dhtmlx-gantt，现有纯手写 SVG/HTML 体积小、内存占用极低（线上服务器仅 2G 内存）、与暖纸报刊风高度融合，保留手写实现仅切语义 Token 与 CSS Modules。

---

## 五、现有拖拽实现（`useCardDrag.ts`）保留策略与阶段 4 修复计划（已拍板）

- **已确认策略**：阶段 4 第 9b 步迁移 `BoardPage` 时，**保留 `useCardDrag.ts` 手写指针拖拽逻辑**，迁至 `features/tasks/hooks/useCardDrag.ts`（不引入第三方拖拽库），并将以下 **4 处缺陷逐一修复，每处单独提交**；修复完成后提供**手动拖拽验证步骤**供用户实测确认：
  1. **提交 ①**：将 `useCardDrag.ts:33, 36` 硬编码的全局类名选择器 `.drop[data-status]` / `.card` 改为 `data-drop-zone` / `data-drag-card` 属性选择器，适配 CSS Modules。
  2. **提交 ②**：补齐 `pointerId` 追踪与 `setPointerCapture`（及 `lostpointercapture` 处理），修复指针拖出浏览器窗口外松手或多触点时残留悬浮浮卡与 `body.dragging` 的 Bug。
  3. **提交 ③**：修复拖放落点在源卡片外后紧接用键盘打开卡片时 `wasDragged()` 仍返回 `true` 造成误拦截的 Bug。
  4. **提交 ④**：`TaskCard.tsx:45` 补齐键盘可达性（`Tab` 聚焦、`Enter`/`Space` 打开详情），拖拽本身仍保持纯指针操作。

---

## 六、阶段 3.5 已拍板决策与阶段 4 迁移顺序（定稿）

1. **依赖政策（定稿）**：全程 **0 新增第三方依赖**；`AssigneePicker` 采用方案 A（`radix-ui` `Popover` + `ui/Input` + 保留 `assignee.ts`），图表、甘特、拖拽均保留手写实现。
2. **6 处视觉统一（定稿）**：全部同意在阶段 4 对应步骤执行（`FormDrawer`、`Panel`、`LoadBar`、`HeroCard`、`ActivityFeed`/`ListRow`、`SearchInput`）；**其中 `LoadBar` 与 `HeroCard` 统一时，必须提供修改前后对比截图由用户确认**。
3. **阶段进度条外层包装（定稿）**：经实测核查，`WeekLine`、`SummaryCard`、`ProgressPanel`、`ForecastHero` 4 处外层无任何两处重复，**维持各自直接复用 `ui/Progress`**，不新增 `patterns`。
4. **阶段 4 最终迁移顺序（11 步定稿）**：
   - `1. features/auth` → `2. layout + features/projects + features/notifications` → `3. features/settings` → `4. features/reports` → `5. features/members` → `6. features/documents` → `7. features/timeline` → `8. features/overview` → **`9a. features/tasks`（`TaskDrawer` + `AssigneePicker` + `TaskPage`）** → **`9b. features/tasks-board`（`BoardPage` + `BoardColumn` + `TaskCard` + `useCardDrag` 4 处独立修复）** → `10. features/collab`。

---

## 七、合并 `origin/main`（PR #37）后的阶段 3.5 增量复核

在合并 `origin/main`（`pre-refactor..origin/main` 共 26 个提交、38 个前端文件）后，核查所有新增/改动前端代码对阶段 3.5 盘点及阶段 4 迁移的影响如下：

1. **唯一新增的跨模块自定义组件**：`src/shared/components/SearchDropdown.tsx`（371 行）+ `SearchDropdown.css`（142 行），已被 4 个模块 5 处使用（`settings/PeoplePanel`、`members/InviteMemberDrawer`、`documents/DocumentHeader`、`documents/UploadDocDrawer`、`tasks/AssigneePicker`）。
   - **归属调整**：新增登记 `components/patterns/SearchDropdown`；由于原 4 处普通搜索框中 3 处已改用 `SearchDropdown`、仅剩 `members/CrewLabels` 1 处，原 `patterns/SearchInput` 移出 `patterns/`，由 `features/members/` 直接使用 `ui/Input(boxed)`。
   - **与 `AssigneePicker` 方案 A 合并建议**：底座合二为一进入 `patterns/SearchDropdown`（方案 A：`ui/Popover` + `ui/Input` + `ui/Spinner`，0 新增依赖，拆分满足 ≤ 250 行 / ≤ 80 行门禁），`AssigneePicker` 留在 `features/tasks/` 内作为业务薄封装调用 `patterns/SearchDropdown` + `patterns/LoadBar` + `ui/Badge` + `assignee.ts`。
2. **对阶段 4 各步骤的具体影响**：
   - **第 3 步（`features/settings`）**：原建 `SearchInput` 改为**首次建立 `patterns/SearchDropdown`**（供 `PeoplePanel` 使用，并以 `ui/Popover` 取代旧组件对 `layout/useDismiss` 的耦合）。
   - **第 5 步（`features/members`）**：`InviteMemberDrawer` 复用 `patterns/SearchDropdown`（异步搜索模式）；`CrewLabels` 直接用 `ui/Input(boxed)`，不再建设 `patterns/SearchInput`。
   - **第 6 步（`features/documents`）**：`DocumentHeader`（`variant="box"` 右对齐）与 `UploadDocDrawer`（`variant="line"` + `toggle` + `footer`）复用 `patterns/SearchDropdown`；旧 `shared/components/SearchDropdown.*` 暂留至第 9a 步全部迁移完毕后删除。
   - **第 7 步（`features/timeline`）**：`GanttDeps` / `GanttPanel` / `GanttRow` 新增了同一前置共用竖线、默认淡化仅悬停高亮前后置依赖连线、空心任务条垫底色、月视图日期行复用与计划线顶端标签，迁移样式与交互时须完整保留。
   - **第 8 步（`features/overview`）**：`FigureStrip` / `Figure` 已去掉下方小字并将已完成并入分母（两位数字）、`CriticalChainPanel` 改为方格加两行、`SchedulePanel` 修复今天线滚动不中断，构建 `MetricStrip` 等组件时以最新 `main` 行为为准。
   - **第 9a 步（`features/tasks`）**：`AssigneePicker` 直接切换调用 `patterns/SearchDropdown`（无需重新手写 combobox 状态机），全部 5 处调用迁完后**删除旧 `src/shared/components/SearchDropdown.tsx` / `SearchDropdown.css` 并移出 `stylelint.config.mjs` 的 `ignoreFiles`**。
