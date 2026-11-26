# frontend 补充约定

总约定见根目录 `AGENTS.md`，本文件只写前端补充，冲突时以根目录为准。设计系统与组件详细规范见 [`DESIGN.md`](./DESIGN.md)，历史基线审计见 [`audit.md`](./audit.md)，阶段 3.5 自定义组件盘点与差异分析见 [`custom-components.md`](./custom-components.md)。

---

## 重构目录结构与单向分层规则

已完成设计系统与架构重构（阶段 0 审计、阶段 1 规范、阶段 2 基础设施、阶段 3 基础组件、阶段 3.5 自定义组件盘点与阶段 4 全量 11 个业务模块及收尾均已落位，旧目录 `api/`、`state/`、`pages/`、`overlays/`、`shared/components/` 及过渡旧样式已全部清零移除），新代码一律按目标结构落位：

```text
src/
├── App.tsx、main.tsx              # 入口、路由
├── styles/                        # 全局样式底座
│   ├── tokens/                    # 仅允许 CSS 自定义属性定义（primitives/semantic/components/layout/typography/motion）
│   ├── base.css                   # Reset、color-scheme、body、:focus-visible、.sr-only、reduced-motion
│   └── main.css                   # 统一入口：tokens/*.css → base.css
├── components/                    # 通用组件层
│   ├── ui/                        # 19 项无业务基础组件：基于原生语义元素与 radix-ui 单包
│   └── patterns/                  # 16 项跨模块业务范式组件
├── dev/                           # 仅开发环境（import.meta.env.DEV）组件样式手册页 /dev/ui，生产构建彻底排除
├── features/<业务域>/              # 按业务域收敛的页面、局部组件、领域 hooks 与工具函数
├── layout/                        # 主应用外壳（AppShell、SidebarNav、SummaryCard、AccountMenu 等）
├── services/                      # 接口请求层（http.ts 及各模块 API）
├── stores/                        # 全局状态层（auth、access、config、project、issue、document、task）
└── shared/                        # 跨层通用纯函数、常量、类型（严禁反向依赖 stores/services）
```

### 硬性依赖方向红线（`eslint.config.js` 强制拦截）
- **单向依赖**：`features/*` → `components/patterns/*` → `components/ui/*` → `styles/tokens/*`。
- **`components/ui/`**：禁止引用 `components/patterns/` 及任何业务/数据层（`features`/`services`/`stores`/`api`/`state`/`pages`/`layout`/`overlays`）。
- **`components/patterns/`**：仅允许组合 `components/ui/` 与 `shared/` 纯工具，禁止依赖任何业务域或直接读取 `stores`/`state`（所有业务数据与 `today` 等状态一律由上层 props 传入）。
- **`features/<域>/`**：各 feature 之间**严禁互引**（包括相对路径跨兄弟目录）；UI/页面组件（`*.tsx`）禁止直接导入 `services/*` 或 `api/*`，网络请求必须收口在 hooks / stores / services 层。
- **Radix UI 引入规范**：统一从单包 `"radix-ui"` 按需具名导入，**禁止使用独立 `@radix-ui/*` 分包**。
- **跨模块复用检索铁律**：迁移任何模块前，先查 [`DESIGN.md`](./DESIGN.md) 的 `patterns` 登记表，并在整个 `src/` 中搜索其他模块是否有相同或相似实现；跨模块复用的组件必须进 `components/patterns/`，禁止在各模块内重复实现；需要新依赖时停下来询问。

---

## Design System 与样式红线（`stylelint.config.mjs` 强制校验）

详细 Token 数值、组件状态矩阵与 Do/Don't 规范以 [`DESIGN.md`](./DESIGN.md) 为准：

- **Token 文件纯净度**：`src/styles/tokens/*.css` **只允许 `:root`（及预留 `[data-theme="dark"]`）下的 `--*` 变量声明**，严禁写入普通选择器样式规则。
- **三层色彩红线**：`原始色板（primitives.css） → 语义色（semantic.css） → 组件色（components.css）`。组件与业务样式**严禁直接引用 `--gray-*` / `--signal-*` 或写死 hex / `rgba()`**（SVG `<mask>` 逻辑黑白除外）。
- **视觉基调与语义分离**：保持暖纸黑白 + 单信号橙（不引入新色相）；`--color-accent`、`--color-danger`、`--color-warning` 按用途分开命名与引用，`--color-success` / `--color-info` 使用墨色或中性灰；本次仅实现浅色值，预留 `[data-theme="dark"]` 仅覆写语义层扩展。
- **样式标尺**：间距以 **4px 为基准**，仅允许 `--space-0-5`（`2px`）与 `--space-1-5`（`6px`）两个半步（原 `10px`/`14px` 迁入新样式时对齐 `8/12/16px`）；全站坚持 **`0` 圆角**（仅圆形元素用 `--radius-full`）；标准描边 `1.5px` / 粗描边 `2px`；保留 `--font-size-2xs: 10px`、展示双档 `--font-size-display: 60px` / `--font-size-display-sm: 44px`（断点处切换 Token）以及大号统计数字语义 Token `--font-size-figure`（指向 `--font-size-display`）。
- **CSS Modules + `data-*` 驱动**：新组件与新页面样式统一使用 `*.module.css`，变体与交互态通过 `data-variant`、`data-size`、`data-state`、`data-loading`、`data-invalid` 与标准伪类（含补齐 `:active`、`:focus-visible`、`disabled` 弱化、`[aria-invalid="true"]`）驱动，**禁止拼接状态 class 名**。
- **破坏性操作与反馈**：使用 Radix `AlertDialog`（`ConfirmDialog`）统一替代原生 `window.confirm` 与双击确认，使用 `Toast` 替代 `window.alert` 与短暂操作反馈，表单/页面校验错误使用行内提示。
- **组件样式边界（`className` 传参铁律）**：页面向 `components/ui/` 传入的 `className` **只能用于布局**（`margin`、`width`、`grid`/`flex` 位置等），**不得覆盖颜色、字体、边框等视觉样式**；如既有变体或尺寸不满足需求，应在 `components/ui/` 层修正或新增明确变体/尺寸，并同步更新 `DESIGN.md` 与 `/dev/ui`。

---

## 组件清单登记表（当前：阶段 3 基础组件全部 19 项已实现）

> 阶段 3 实现与阶段 4 迁移时，每落地或变更一个组件须同步更新本表与 `DESIGN.md`；禁止不经登记私自造重复控件。明确**不封装** `Tooltip`（沿用原生 `title`）、`DatePicker`（复用 `Input[type="date"]`）、`Avatar`（保留在 `AccountMenu` 局部）与骨架屏。

### 基础组件（`src/components/ui/`，共 19 项，已全部实现）
| 批次 | 组件 | 底层原语 | 状态 | 备注 |
|---|---|---|---|---|
| 前置 | `Spinner` | 原生 `<span>` | **已实现**（`src/components/ui/Spinner/`） | `sm`/`md`/`lg`、`currentColor`、纯 CSS 环、`prefers-reduced-motion`、可选 `label` |
| 前置 | `Button` | 原生 `<button>` | **已实现**（`src/components/ui/Button/`） | 变体：`default`/`primary`/`accent`/`danger`/`dashed`/`link`；尺寸：`sm`/`md`/`lg`/`icon`；统一中性灰禁用态（`dashed` 保留清晰虚线）、强对比 `accent` hover、复用 `Spinner` 无抖动 `loading`（不含 `selected`） |
| 第 1 批（表单） | `Input` | 原生 `<input>` | **已实现**（`src/components/ui/Input/`） | `underline`（默认 `--color-border-strong` 墨色下划线，focus 切 2px 信号橙；透明点线禁用态）/`boxed`（浅灰底禁用态）、`sm`/`md`、`mono`、`invalid`、`readOnly`、`disabled`、完整对齐 `type="date"` 外观 |
| 第 1 批（表单） | `Textarea` | 原生 `<textarea>` | **已实现**（`src/components/ui/Textarea/`） | `underline`（默认 `--color-border-strong` 墨色下划线，focus 切 2px 信号橙；透明点线禁用态）/`boxed`（浅灰底禁用态）、`invalid`、`readOnly`、`disabled` 全态 |
| 第 1 批（表单） | `Checkbox` | `radix-ui` `Checkbox` | **已实现**（`src/components/ui/Checkbox/`） | 16×16 0 圆角方框、`checked`/`invalid`/关联 `label` 同步禁用弱化 |
| 第 1 批（表单） | `Switch` | `radix-ui` `Switch` | **已实现**（`src/components/ui/Switch/`） | `track`（28×12 固定轨道 + 8×8 方形滑块 + 有/无）& `segmented`（启用/停用）双变体、复用 `Spinner` 锁定同宽零抖动 `loading` 与统一禁用态 |
| 第 1 批（表单） | `Select` | `radix-ui` `Select` | **已实现**（`src/components/ui/Select/`） | `underline` 触发器（34px，透明点线禁用态）、展开箭头翻转、硬阴影暖纸面板、含 `invalid`/`disabled` |
| 第 1 批（表单） | `ToggleGroup` | `radix-ui` `ToggleGroup` | **已实现**（`src/components/ui/ToggleGroup/`） | `segmented`/`chips`、`single`/`multiple`、统一中性灰禁用态，承接全站切换态 |
| 第 1 批（表单） | `Field` | 原生语义容器 | **已实现**（`src/components/ui/Field/`） | `horizontal`（内容列左起点严格对齐）/`vertical`、墨色必填星号 `*`、`useId()` 自动打通 `htmlFor`/`id`/`aria-invalid`/`aria-describedby`（替代原 `FormField`） |
| 第 2 批（浮层） | `Popover` | `radix-ui` `Popover` | **已实现**（`src/components/ui/Popover/`） | Portal 碰撞避让、硬阴影暖纸浮层、支持 `padding="default"\|"none"`、触发器 `open` 显式高亮；不含 `Tooltip` |
| 第 2 批（浮层） | `DropdownMenu` | `radix-ui` `DropdownMenu` | **已实现**（`src/components/ui/DropdownMenu/`） | 常规/危险菜单项、分割线、分组标签、键盘漫游与 `disabled` |
| 第 2 批（浮层） | `Drawer` | `radix-ui` `Dialog` | **已实现**（`src/components/ui/Drawer/`） | `md`(640px，44px 标题)/`lg`(880px，60px 标题)、6px 半色调点阵遮罩（4.5% 压暗）、`Separator(masthead)` 粗黑刊头双横线（5px+1.5px）、复用 `Button(default, size="icon")` 大号 `×` 关闭钮、焦点陷阱与 Esc |
| 第 2 批（浮层） | `AlertDialog` | `radix-ui` `AlertDialog` | **已实现**（`src/components/ui/AlertDialog/`） | 6px 半色调点阵遮罩（4.5% 压暗）、硬阴影、默认焦点落“取消”、确认钮复用 `Button(danger)` 支持 `loading` |
| 第 2 批（浮层） | `Toast` | `radix-ui` `Toast` | **已实现**（`src/components/ui/Toast/`） | `neutral`/`danger` 语气、`ToastProvider`/`ToastViewport`/`Toast`、多条队列右下角最新在上叠放与独立计时、手动关闭、替代 `window.alert` |
| 第 3 批（展示） | `Badge` | 原生 `<span>` | **已实现**（`src/components/ui/Badge/`） | `solid`（墨底常态）/`outline`/`muted`/`accent`（橙色仅用于需注意状态），`sm`/`md` |
| 第 3 批（展示） | `Alert` | 原生 `<div>` | **已实现**（`src/components/ui/Alert/`） | `inline`/`banner` × `info`（中性色）/`warning`（橙）/`danger`（橙），支持 `title` 与 `action` |
| 第 3 批（展示） | `Tabs` | `radix-ui` `Tabs` | **已实现**（`src/components/ui/Tabs/`） | 平铺报刊风方角标签栏，`active` 墨底反白、方向键漫游与 `disabled` |
| 第 3 批（展示） | `Progress` | `radix-ui` `Progress` | **已实现**（`src/components/ui/Progress/`） | `solid`（含超载斜纹与阈值线）/`dual`（单轨叠加时间斜纹+完成实心，支持 `surface="default"\|"inverse"`）/`segmented`（按周格子，当期空心信号橙粗框，支持 `segmentWidth`），完整 ARIA |
| 第 3 批（展示） | `Separator` | `radix-ui` `Separator` | **已实现**（`src/components/ui/Separator/`） | `single`（单实线）/`double`（抽屉双线 2px+1.5px）/`masthead`（页头刊头双横线 5px+1.5px）/`dashed`（墨色虚线），支持 `horizontal`/`vertical` |

### 业务范式组件（`src/components/patterns/`，共 16 项：16 项已全部实现；其余按阶段 4 迁移到首个用到它的模块时按需建立）
> 完整归属判定、差异分析与 15 项单模块内部组件清单见 [`custom-components.md`](./custom-components.md)；仅被 1 个模块使用的自定义组件（如 `AppShell`、`AssigneePicker`、`MentionInput`、`FileDropzone`、各图表/拖拽看板）留在各自 `features/<域>/` 或 `layout/` 内部，不进入 `patterns/`。

| 范式组件 | 状态与建立时机 | 职责摘要 |
|---|---|---|
| `BrandMark` | **已实现** · 阶段 4 第 1 步（`src/components/patterns/BrandMark/`） | 双色品牌几何标识 + 可选 `MINITEAM PMS` 字标（`size="sm"\|"md"`、`tone="default"\|"inverse"`，供 `LoginHeader`、`ProjectSwitch`、`SettingDrawer` 复用） |
| `PageHeader` / `Panel` / `FormDrawer` / `EmptyState` & `PageState` / `ActionPopover` | **已实现** · 阶段 4 第 2 步（`src/components/patterns/{PageHeader,Panel,FormDrawer,EmptyState,PageState,ActionPopover}/`） | 双线页头（`60px`/`44px` 切 Token，已由 `LoginHeader` 与 `NoProject` 复用）、三变体面板、表单抽屉壳、空态/页态、刊头列表浮层壳 |
| `SearchDropdown` / `ConfirmDialog` / `ToastHost` | **已实现** · 阶段 4 第 3 步（`src/components/patterns/{SearchDropdown,ConfirmDialog,ToastHost}/`） | 公共下拉搜索（`Popover` + `Input` + `Spinner`，已替换 `PeoplePanel`/`InviteMemberDrawer`/`DocumentHeader`/`UploadDocDrawer`/`AssigneePicker` 全站 5 处调用，旧 `shared/components/SearchDropdown.*` 与 `useDismiss.ts` 已删）、破坏性操作二次确认（`AlertDialog`，全站 4 处已全部替换）、全局轻提示队列（`useToast()`，由 `Shell` 挂载） |
| `Legend` / `HeroCard` / `LoadBar` | **已实现** · 阶段 4 第 4 步（`src/components/patterns/{Legend,HeroCard,LoadBar}/`） | 数据驱动图例（已替换 `BurndownPanel`/`DeviationPanel`/`DocumentRevising`/`GanttPanel`/`Overview`）、三态强调卡外壳（`alert`/`calm`/`surface`，已替换 `ForecastHero`/`DocumentDetailHero`/`HeadlinePanel`）、工时负载轨道（`detailed`/`compact`，`role="meter"`，已替换全站 4 处：`LoadRow`/`MemberLoad`/`SelfLoad`/`AssigneePicker`） |
| `ListRow` / `ActivityFeed` | **已实现** · 阶段 4 第 5 步（`src/components/patterns/{ListRow,ActivityFeed}/`） | 原生语义跳转/选中列表行（已替换 `SelfTasks`/`TodoPanel`/`DependencyRow`/`LinkRow`/`BlockedBy`，`ThreadItem` 因两行换行与底部 meta 保留为独立 `<button>`）、浅/深面单双列时间线动态流（已替换 `PermLog`/`SelfLog`/`TaskLogPanel`/`ActivityFeedPanel`，`LogsPanel` 4 列按日表保持独立） |
| `TaskBar` | **已实现** · 阶段 4 第 7 步（`src/components/patterns/TaskBar/`） | 受控任务生命周期时间条（剥离 `useIssue()`，必传 `today` prop，支持 `full`/`compact`/`gantt` 三变体及 `data-taskbar-hit`，已全部接入 `GanttRow`、`SchedulePanel` 与 `TaskCard`，第 9b 步已删除 `src/shared/components/TaskBar.tsx` 过渡封装） |
| `MetricStrip` | **已实现** · 阶段 4 第 8 步（`src/components/patterns/MetricStrip/`） | 4 格 KPI 指标条（`--font-size-figure`，支持 `unit`/`sub`/`alert`，已替换 `overview/FigureStrip` 与 `task/TaskFigures` 全站 2 处） |

---

## 文件体量与工程门禁规定（提交前必跑，不配置 husky）

### 单文件与单函数有效行数红线（不含空行与注释）
- **组件与业务 TS/TSX 文件（`.tsx` / `.ts`）**：建议 **≤ 150 行**，硬上限 **250 行**（`max-lines: ["error", { max: 250, skipBlankLines: true, skipComments: true }]`）；单函数有效行数建议且硬上限 **≤ 80 行**（`max-lines-per-function: ["error", { max: 80, skipBlankLines: true, skipComments: true }]`）。
- **样式文件（`.module.css` / `base.css` / `tokens/*.css`）**：建议 **≤ 150 行**，硬上限 **250 行**（由 `scripts/check-css-lines.mjs` 强制校验，超过 150 行告警、超过 250 行退出码为 1）。
- **`/dev/ui` 展示页及各分区文件**：同样严格遵守上述行数上限。
- **拆分原则**：超过建议值（150 行）时按职责合理拆分为子组件、领域 hooks、样式分片或子展示分区；严禁为凑行数做无意义碎片化拆分。

### 提交前必跑门禁命令
- 本前端**不安装 `husky` / `lint-staged`**（不修改 Monorepo 根目录配置）。
- **每次提交前必须在 `frontend/` 目录运行以下命令，全部退出码为 0 方可提交**：
  ```bash
  pnpm check   # 串联执行 pnpm lint && pnpm lint:css && pnpm lint:lines && pnpm typecheck && pnpm knip
  pnpm build   # 验证 tsc -b && vite build 完整产物构建
  ```
- 各单项命令说明：
  - `pnpm lint`：ESLint 10 代码检查 + 单向依赖/跨 feature/Radix 单包约束 + TS/TSX 单文件（≤250）与单函数（≤80）有效行数硬上限。
  - `pnpm lint:css`：Stylelint + `stylelint-declaration-strict-value` Token 强制校验与原始色板禁令。
  - `pnpm lint:lines`：`node scripts/check-css-lines.mjs` 校验新规范 CSS / CSS Modules 单文件有效行数（建议 ≤150，硬上限 ≤250）。
  - `pnpm typecheck`：无状态全量检查 `tsconfig.app.json` 与 `tsconfig.node.json`。
  - `pnpm knip`：死文件、死导出与未用依赖检测。

---

## Git 分支与阶段 4 协作规范

阶段 4 重构采用**短分支、单模块交付、审完即合、合完即删**策略，避免分支堆积与重复开多工作目录产生漂移：

1. **按模块切短分支**：阶段 4 每个模块开始前，先确保本地 `main` 已 `git pull` 到最新，再切出短分支 `refactor/migrate-<模块>`（例如 `refactor/migrate-auth`、`refactor/migrate-settings`；文档或小修同理走短分支）。
2. **门禁验证与提 PR**：模块完成后，在 `frontend/` 运行 `pnpm check` 和 `pnpm build` 全部通过后推送该分支，并向 `main` 提交 PR。
3. **审阅与 Merge Commit 合并**：经审阅确认后，采用 **merge commit** 方式合并回 `main`（不使用 squash，保留完整提交历史与标签对应关系）。
4. **立即清理与同步**：合并后**立即删除该短分支（远程 + 本地）**，本地切回 `main` 并 `git pull origin main` 到最新。
5. **本地分支上限**：**任何时候本地只保留 `main` 和当前正在做的 1 个短分支**，不保留已合并的历史分支。

---

## 重构进度与接手指南

### 当前进度与下一步顺序
- **已完成**：
  - 阶段 0（审计 `audit.md`）～ 阶段 3.5（自定义组件盘点 `custom-components.md`，19 项 `components/ui/` 全部就位）；
  - 甘特阻塞修复（PR #40）；
  - 阶段 4 第 1 步：`features/auth`（PR #42，提取 `BrandMark`）；
  - 阶段 4 第 2 步：`layout + projects + notifications`（PR #43，新增 `PageHeader`/`Panel`/`EmptyState`/`PageState`/`FormDrawer`/`ActionPopover`，并完成 `LoginHeader` 复用 `PageHeader`）；
  - 阶段 4 第 3 步：`features/settings`（PR #45，新增 `SearchDropdown`/`ConfirmDialog`/`ToastHost`，删除 `overlays/settings/` 与 `index.css` 中的设置样式，`api/system.ts` 移入 `services/system.ts`）；
  - 阶段 4 第 4 步：`features/reports`（PR #46，新增 `Legend`/`HeroCard`/`LoadBar`，拆分 `burndownModel.ts` 与 `hooks/useReportsPage.ts`，删除 `pages/reports/` 与 `stylelint.config.mjs` 对应豁免，`api/report.ts` 移入 `services/report.ts`）；
  - 阶段 4 第 5 步：`features/members`（PR #47，新增 `ListRow`/`ActivityFeed`，复用 `LoadBar`/`SearchDropdown`/`FormDrawer`/`Select`/`Switch`/`ToggleGroup`/`Checkbox`，删除 `pages/members/` 与 `stylelint.config.mjs` 对应豁免及 `index.css` 废弃 `.fr .pms` 规则）；
  - 阶段 4 第 6 步：`features/documents`（PR #48，复用 `PageHeader`/`Panel`/`Legend`/`HeroCard`/`SearchDropdown`/`ConfirmDialog`/`FormDrawer`/`ToastHost`，内部落地 `FileDropzone` 与 `DocumentRevisingTimeline`，`api/document.ts` 移入 `services/document.ts`，删除 `pages/documents/`、`shared/constants/legends.ts`、`stylelint.config.mjs` 对应豁免及 `index.css` 中的 `.dsec-h > .legend` / `.dz*` 规则）；
  - 阶段 4 第 7 步：`features/timeline`（PR #49，已合并；新增 `patterns/TaskBar` 剥离 `useIssue()` 并补齐 `scripts/test-taskbar-model.ts` 5 项场景测试，挂载 `/dev/ui` `TimelinePatternsShowcase`，抽共享 `shared/utils/forecast.ts`，`api/progress.ts` 移入 `services/progress.ts`，迁移 `TimelineHeader`/`GanttPanel`/`GanttBody`/`GanttAxis`/`GanttRow`/`GanttDeps`/`CriticalPanel` 至 `features/timeline/`，删除 `pages/timeline/`、`shared/components/TaskBar.css`、`taskBarModel.ts`、`stylelint.config.mjs` 对应豁免与 `index.css` 遗留 `.tbl` 规则）；
  - 阶段 4 第 8 步：`features/overview`（PR #50，已合并；新增 `patterns/MetricStrip` 达成 `patterns/` 16/16 全部就位并挂载 `/dev/ui` `OverviewPatternsShowcase`，迁移 `OverviewHeader`/`FigureStrip`/`SchedulePanel`/`ScheduleRow`/`HeadlinePanel`/`TodoPanel`/`ProgressPanel`/`CriticalChainPanel`/`OverviewPage` 至 `features/overview/`，删除 `pages/overview/`、`stylelint.config.mjs` 对应豁免及 `index.css` 遗留 `.bar`/`.hero*`/`.ov1`/`.ov2`/`.dg`/`.tl` 规则）；
  - 阶段 4 第 9a 步：`features/tasks`（PR #51，已合并；迁移 `TaskDrawer`、`AssigneePicker` 与 `TaskPage` 及其子面板至 `features/tasks/`，`api/task.ts` 移入 `services/task.ts`；全量复用 `PageHeader(compact)`、`Panel`、`FormDrawer`、`SearchDropdown`、`ConfirmDialog`、`MetricStrip`、`LoadBar(compact)`、`ListRow`、`ActivityFeed(dark)`、`TaskBar(today)`、`ToastHost` 与 `ToggleGroup`/`Field`/`Input`/`Textarea`/`Badge`/`Button`；删除 `pages/task/`、`overlays/task/`、旧 `shared/components/SearchDropdown.*`、`layout/useDismiss.ts`、`stylelint.config.mjs` 对应豁免及 `index.css` 遗留 `.figures`/`.figure`/`.ap-*` 规则）；
  - 阶段 4 第 9b 步：`features/tasks-board`（PR #52，已合并；迁移 `BoardPage`、`BoardHeader`、`BoardColumn`、`TaskCard`、`BlockedBy`、`hooks/useBoardPage.ts` 与 `hooks/useCardDrag.ts` 至 `features/tasks/`，删除 `pages/board/`、`src/shared/components/TaskBar.tsx` 薄兼容层、`stylelint.config.mjs` 对应豁免及 `index.css` 中遗留 `.card` 规则；并按每处独立提交修复 `useCardDrag` 4 处缺陷：属性选择器、指针捕获防残留、`wasDragged` 定时复位及 `TaskCard` 键盘可达性）；
  - 阶段 4 第 10 步：`features/collab`（PR #53，已合并；迁移 `CollabPage`、`CollabHeader`、`ThreadsPanel`/`ThreadItem`/`ThreadDetailPanel`/`ThreadTaskMeta`/`MessageItem`/`ReplyForm`/`MentionInput`/`ActivityFeedPanel`/`NewDiscussionDrawer` 及 `hooks/`/`utils/` 至 `features/collab/`，将 `api/collab.ts` 移入 `services/collab.ts`；全量复用 `PageHeader`、`Panel(flat/dark)`、`FormDrawer`、`ActivityFeed(dark)`、`PageState` 及 `Badge`/`Button`/`Field`/`Input`/`Textarea`/`ToggleGroup(chips)`/`Separator`/`Alert`；在 `useMentionInput` 中增加 `window` capture 阶段 `Escape` 拦截以防穿透关闭抽屉；删除 `pages/collab/`、`shared/components/Drawer.tsx`、`stylelint.config.mjs` 对应豁免与 `index.css` 遗留 `.chips`/`.ov*`/`.fx*`/`.fr*`/`.double`/`.inl`/`.in` 规则；全部 11 个业务模块迁移完成）；
  - **阶段 4 收尾**（待审阅合并；将 `api/http.ts` 迁至 `services/http.ts`，将 `api/project.ts` 合并入 `services/projects.ts` 并删除 `src/api/`；将全部 `src/state/*` 迁入 `src/stores/*` 并删除 `src/state/`；抽取 `ProviderError.tsx` 以 `patterns/PageState` 替换 `ProjectProvider`/`TaskProvider` 遗留 `.msg.err`/`.btn` 全局错误兜底提示，同时拆分超 80 行 Provider/动作以通过 `eslint.config.js` 函数体量门禁；移除 `main.css` 旧样式导入，彻底删除 `src/styles/legacy.css`、`src/styles/index.css`、`src/styles/typography/roles.css` 并清空 `stylelint.config.mjs` 的 `ignoreFiles` 过渡豁免，仅保留 `["dist/**"]`）。
- **当前状态**：**阶段 0 ～ 阶段 4 前端设计系统与架构重构已全量完成**（除保留跨后端边界待办 `TaskAutoStart.isAutoBlocked()` 及 `frontend/prototype/` 参考决策外，前端已无过渡目录与遗留样式）。
- **完整执行轨迹**：
  ~~`3. features/settings`~~ → ~~`4. features/reports`~~ → ~~`5. features/members`~~ → ~~`6. features/documents`~~ → ~~`7. features/timeline`~~ → ~~`8. features/overview`~~ → ~~`9a. features/tasks`~~ → ~~`9b. features/tasks-board`~~ → ~~`10. features/collab`~~ → ~~**阶段 4 收尾**~~（全部完成）。

### 已登记待办与遗留状态
- **`LoginHeader` 复用 `PageHeader`**：已在第 2 步完成并清理原 TODO。
- ~~**`src/layout/useDismiss.ts` 与旧 `SearchDropdown.*` 暂留**~~：已在第 9a 步全部删除。
- ~~**`src/shared/components/TaskBar.tsx` 过渡薄封装**~~：已在第 9b 步删除。
- ~~**`src/shared/components/Drawer.tsx` 过渡抽屉壳**~~：已在第 10 步删除，`src/shared/components/` 与 `src/pages/` 均已清空移除。
- **`ToastHost` / `ConfirmDialog` 复用**：全站 4 处 `ConfirmDialog` 替换与需 Toast 轻提示的交互均已按模块迁完（`collab` 表单/回复提交错误保留行内 `Field` 与 `Alert(danger)`，加载与 `ProjectProvider`/`TaskProvider` 失败统一使用 `PageState`）。
- **PR #40 甘特待办核查状态（详见 `custom-components.md` 第七节）**：
  1. ~~核对 `GanttPanel`/`GanttRow` 前置状态传入并补齐 5 项测试~~：第 7 步已完成（已新增 `scripts/test-taskbar-model.ts` 5 项测试并通过）；
  2. 后端 `TaskAutoStart.isAutoBlocked()`（`backend/.../TaskAutoStart.java:73-79`）从 `detail.contains("阻塞")` 改为与 `DETAIL_AUTO_BLOCKED` / `DETAIL_AUTO_REBLOCKED` 精确比对——按职责边界红线留待后端分支处理。
- ~~**`api/http.ts` 与 `state/*` 集中迁移**~~：已在**阶段 4 收尾**全部迁入 `services/` 与 `stores/`，`src/api/` 与 `src/state/` 已清空删除。
- ~~**`src/styles/legacy.css`、`index.css`、`typography/roles.css`**~~：已在**阶段 4 收尾**全部清零并删除（当前剩余 **0 行**）。

### 每一步的固定流程
1. 从最新 `main` 切出短分支 `refactor/migrate-<模块>`（确认本地只保留 `main` 与当前 1 个短分支、工作区干净）；
2. 先列出迁移计划写进汇报，不必等确认直接执行；
3. 迁移要求：业务逻辑与接口行为不变；页面改用 `components/ui` 与 `patterns`；请求移入 `services/`；样式只用 Token；旧实现（含 `index.css` / `legacy.css` / `roles.css` 对应规则）在同一提交中删除；每个独立改动单独提交（Conventional Commits 中文描述）；
4. 视觉忠实于原版：基础组件默认样式若导致变淡或偏样，在 `components/ui/` 层修正并同步 `/dev/ui` 与 `DESIGN.md`，禁止在页面用 `className` 覆盖（`className` 仅限布局）；
5. 验证：`pnpm check` 与 `pnpm build` 全部通过；本步涉及的每个页面迁移前后各截对比图并实测主要交互；
6. 推送分支并用 `gh pr create` 提 PR 到 `main`（不合并，等待审阅）；审阅通过后以 **merge commit** 合并、删除远程与本地短分支并拉取最新 `main`。

### 已批准的视觉变更清单
- **`AccountMenu`（阶段 4 第 2 步已批准）**：账号菜单采用 `ui/DropdownMenu` 简洁样式替代原 `.accts` 双列底栏浮层，危险项（退出登录）使用 `tone="danger"` 语气。
- **`FormDrawer`（阶段 4 第 2 步已批准）**：5 个表单抽屉统一使用 `ui/Drawer(md)` `640px` 宽、头部 `Separator(masthead)` 5px+1.5px 粗黑双横线与 40×40 大号 `×` 关闭钮、提交/取消按钮统一置于抽屉底部 `footer`。
- **`SettingsDrawer`（阶段 4 第 3 步已批准）**：设置抽屉改用 `ui/Drawer(lg)` + `ui/Tabs` + `Field` 表单行，原 `#shell.dim` 灰化压暗改为 Drawer 点阵遮罩，分区标签用 `ui/Tabs`（去掉按组分隔的竖线）；删除账号/归档项目改 `ConfirmDialog`；保存、新增、删除等反馈改 `Toast`；重置密码后的新密码保留为行内 `Alert`。
- **`HeroCard` & `LoadBar`（阶段 4 第 4 步已批准）**：`ForecastHero` 改用 `patterns/HeroCard` + `ui/Badge(solid)`（`calm` 正常态由原橙底白字统一为反色墨底白字，风险标签统一为黑底白字；大号日期从 56px 对齐 `--font-size-figure` 60px）；`LoadRow` 改用 `patterns/LoadBar(detailed)`（轨道高度统一为 14px，内置 `role="meter"`）。
- **`features/members` 视觉统一（阶段 4 第 5 步已批准）**：`MemberColumn` 角色下拉换 `ui/Select`（消除原生 `<select>` 双下拉箭头）、权限开关换 `ui/Switch(track)`、`InviteMemberDrawer` 换 `FormDrawer` + `SearchDropdown` + `ToggleGroup(chips)` + `Checkbox`、`MemberLoad`/`SelfLoad` 复用 `LoadBar(detailed)`、`PermLog`/`SelfLog` 复用 `ActivityFeed`、`SelfTasks` 复用 `ListRow`。
- **`features/documents` 视觉统一（阶段 4 第 6 步已批准）**：`DocumentRevising`/`DocumentFinal` 复用 `Panel(variant="flat")`（原 `.dsec` 修订中黑底刊头统一为全站暖纸底刊头）、`DocumentRevising` 复用 `Legend` 与 `Badge(accent)`、`DocumentDetailHero` 改用独立 `HeroCard(alert/surface)` 置顶（与下方详情卡留 `--space-3` 间距避免双边框粘连，大号数字对齐 `--font-size-figure` 60px）、`DocumentDetail` 底部全宽操作钮居中对齐（不覆盖 `Button` 内部对齐）、定稿操作改 `ConfirmDialog` 替代 `window.confirm`、上传抽屉换 `FormDrawer` + `ToggleGroup(chips)` + `SearchDropdown` + `FileDropzone`、操作反馈接入 `ToastHost`。
- **`features/timeline` 视觉统一（阶段 4 第 7 步已批准）**：`TimelineHeader` 换 `PageHeader` + `ToggleGroup(segmented)` + `Button(accent)`；`GanttPanel` 与 `CriticalPanel` 统一使用 `Panel(variant="flat")` 暖纸底刊头（原 `.cpmp .phd` 黑底刊头与全站面板对齐，`总工期 23 个工作日` 保留高对比橙色数字）；`GanttPanel` 接入 `Legend`、预测完成日期对齐 `--font-size-display-sm`（44px）；`TaskBar` 剥离 Store 支持 `full`/`compact`/`gantt` 三变体并通过 `data-taskbar-hit` 命中悬停，日号今天高亮改为 `--border-width-thick` 橙框，整体页面加载与空/报错态接入 `PageState`。
- **`features/overview` 视觉统一（阶段 4 第 8 步，已合并）**：`FigureStrip` 改用 `patterns/MetricStrip`（4 格顶栏标签统一左对齐 `// {label}`，`tone="alert"` 采用 `::before` 5px 信号橙顶条 + `ui/Badge(solid)`）；`SchedulePanel` / `ProgressPanel` 复用 `Panel(default)` + `Legend`；`TodoPanel` 复用 `Panel(flat, scrollable)` + `ListRow(compact)`，下栏网格高度由 `178px` 调整为 `204px` 以完整容纳紧凑 `ListRow`（默认 `1440×900` 一屏零页面滚动）；`HeadlinePanel` 复用 `HeroCard(alert/calm)` + `Badge(solid)` 并将阻塞标签与底部操作条改为原生 `<button type="button">`；`CriticalChainPanel` 复用 `Panel(dark)` 并将节点方格间距对齐 4px 栅格（`--space-1`）。
- **`features/tasks` 视觉统一（阶段 4 第 9a 步，已合并）**：`TaskDrawer` 统一收归 `patterns/FormDrawer(md)` `640px` 抽屉、表单行用 `ui/Field` + `Separator(dashed)`，前置任务用 `ToggleGroup(multiple, chips)`；`AssigneePicker` 切至 `patterns/SearchDropdown` + `patterns/LoadBar(compact)`（超载为信号橙单轨）+ `ui/Badge(accent)` 推荐标识，清除命中与未命中行间手写分割判断与全局 `.ap-*` 样式；`TaskHeader` 改用 `PageHeader(compact)` + `StatusChips`/`ToggleGroup(single, chips)`，删除任务由“双击确认”改为 `ConfirmDialog` 居中模态确认（默认聚焦“取消”），操作拦截提示改 `Toast` 轻提示；`TaskFigures` 复用 `patterns/MetricStrip`、`DependencyRow`/`LinkRow` 复用 `ListRow(compact)`、`TaskInfoPanel` 虚线操作钮改用 `Button(dashed, sm)`、`TaskLogPanel` 复用 `Panel(dark)` + `ActivityFeed(dark)`。
- **`features/tasks-board` 视觉与交互统一（阶段 4 第 9b 步，PR #52 已合并）**：`BoardHeader` 改用 `PageHeader` + `ToggleGroup(segmented)` + `Button(accent)`；`BoardColumn` 列头计数统一 `--font-size-figure`（`60px`），`TODO` 列顶部虚线新增钮改用 `Button(dashed, fullWidth)`；`BlockedBy` 改用 `ListRow(compact)` 修复非语义 `<div onClick>`；`TaskCard` 直连 `patterns/TaskBar(compact, today)`、优先级/逾期接入 `Badge`、拖拽报错接入 `Toast`，并按计划分 4 笔独立提交修复 `useCardDrag` 选择器、指针捕获、`wasDragged` 复位与 `TaskCard` 键盘可达性（`role="button"` + `tabIndex={0}` + `Enter`/`Space` + `:focus-visible`）。
- **`features/collab` 视觉与交互统一（阶段 4 第 10 步，PR #53 已合并）**：`CollabHeader` 改用 `PageHeader` + `Button(accent)`；`ThreadsPanel`/`ThreadDetailPanel`/`ActivityFeedPanel` 统一收归 `Panel(flat/dark)`，`ActivityFeedPanel` 接入 `patterns/ActivityFeed(surface="dark")` 与 `parseRichInline` 富文本片段；`ThreadItem` 保持两行标题 + 元信息布局并改用原生 `<button aria-current>` + `Badge(accent, sm)`；`ThreadTaskMeta` 任务跳转改为原生 `<button>`；`MessageItem` 闪动动画收敛为 `--color-flash-peak` + `calc(var(--duration-normal) * 5)`；`ReplyForm` 使用 `MentionInput(boxed)` + `Button(primary, loading)` + `Alert(danger)`；`NewDiscussionDrawer` 切至 `patterns/FormDrawer(md)` + `Field` + `Input(underline)` + `ToggleGroup(single, chips)` + `MentionInput(underline)`，并在 `window` capture 阶段拦截 `@` 弹层态的 `Escape` 以防关闭外层抽屉。
- **阶段 4 收尾全局底座统一（待审阅合并）**：`ProjectProvider` 与 `TaskProvider` 数据加载失败的后备 UI（原 `<div className="msg err">` + `.btn`）已统一收归 `ProviderError`（`patterns/PageState(error)`），彻底移除旧全局样式依赖。

### 下一步启动指令模板（直接复制使用）
```text
你在接手一个进行中的前端重构。阶段 0～3.5 与阶段 4 已完成部分见 frontend/AGENTS.md 的“重构进度与接手指南”。开始前先完整阅读 frontend/AGENTS.md、frontend/DESIGN.md、frontend/audit.md、frontend/custom-components.md，严格遵守其中所有规则（设计 token、分层依赖方向、单文件行数门禁、className 只能用于布局、Git 短分支流程、pnpm check）。

本次任务：阶段 4 第 <X> 步——按 audit.md / custom-components.md 中的迁移顺序，迁移“<模块名>”这一步涉及的模块。只做这一步。
1. 切到 main 并 pull 到最新，确认工作区干净且本地无残留已合并分支，从 main 切出 refactor/migrate-<模块名>。
2. 先列出迁移计划：涉及哪些页面和组件；用到哪些 ui 组件；按 custom-components.md 登记应在本步建立的 patterns；要抽出的 services / hooks；要删除的旧样式与旧组件。全局搜索确认没有可复用的现有实现。计划写进汇报，不必等我确认，直接执行。
3. 迁移要求：
   - 业务逻辑与接口行为不变；页面改用 components/ui 与 patterns；请求移入 services；样式只用 token；旧实现（含 index.css / legacy.css / roles.css / stylelint.config.mjs ignoreFiles 中对应规则）在同一提交中删除；每个独立改动单独提交，Conventional Commits 中文描述。
   - 视觉必须忠实于原版：线条粗细、颜色深浅、字号层级、间距与原页面一致。如果发现基础组件的默认样式会让页面变淡或变样，在 ui 组件层修正（并同步 /dev/ui 和 DESIGN.md），不要在页面里用 className 覆盖。
4. 验证：pnpm check 与 pnpm build 通过；本步涉及的每个页面迁移前后各截一张对比图；手动走一遍这些页面的主要交互（以实际功能为准）。
5. 完成后推送 refactor/migrate-<模块名> 并用 gh 提 PR 到 main，不要合并，等我审阅。
6. 汇报：迁移计划、新建的 patterns 清单（附 /dev/ui 截图）、提交列表、PR 链接、前后对比图、legacy.css 剩余行数、发现的问题或需要我决定的事。最后一行单独写【等待审阅：阶段4-第<X>步<模块名>迁移完成】。
```

---

## 遗留文件与开发期辅助说明

- **旧 CSS 过渡豁免已全部清零**：原 `stylelint.config.mjs` 的 `ignoreFiles` 中登记的所有业务模块 CSS 及 `index.css` / `legacy.css` / `typography/roles.css` 已于**阶段 4 收尾**全部移出并删除，当前 `ignoreFiles` 仅保留 `["dist/**"]`。
- **过渡期公共下拉搜索组件（`SearchDropdown`）**：`src/shared/components/SearchDropdown.tsx` / `SearchDropdown.css` 原 5 处调用方（`PeoplePanel`、`InviteMemberDrawer`、`DocumentHeader`、`UploadDocDrawer`、`AssigneePicker`）已全部迁至 `components/patterns/SearchDropdown`，旧文件与 `layout/useDismiss.ts` 已在第 9a 步删除并移出 `ignoreFiles`。
- **组件样式手册 `/dev/ui`**：位于 `src/dev/UiShowcasePage.tsx`，通过 `import.meta.env.DEV` + 懒加载挂在免登录路由 `/dev/ui`，供本地 `pnpm dev` 验收基础组件视觉与交互态，生产构建自动排除。
- **`frontend/prototype/`**：包含旧静态原型 `global.html` / `global.js`（`global.js:3291-3309` 含文档拖拽上传原始实现，仍登记于 `tsconfig.app.json:25`）。第 6 步已将文档拖拽上传收归 `features/documents/components/FileDropzone`，暂留 `prototype/` 待第 6 步审阅确认不再参考后统一决策清理（已在 `knip.json` 中忽略 `prototype/**`）。

---

## 页面与视觉约定

- **一屏展示与内联滚动**：主页面内容应尽量收敛在一屏视口内展示，避免被 SVG 固有宽高比或长列表反向撑高整页。SVG 图表外层容器使用相对/绝对定位贴合网格分配高度；多行列表区块超出高度时开启局部内联滚动（`overflow-y: auto` 配合细滚动条）。
- **面板头部 `// 英文词` + 中文标题对照**：面板标题区统一采用上方 `// WORD`（kicker）+ 下方中文标题的双层结构（如 `// BURNDOWN` + `剩余任务`、`// TASKS` + `完成任务`、`// REVISING` + `修订中`）。上方英文尽量用一个自然贴切的单词作视觉装饰，无需生硬直译。

---

## 常量、类型与数据来源

常量放 `src/shared/constants/`，类型放 `src/shared/types/`（全局共享的在 `global.ts`，其余按模块），字段名和结构**严格对齐** `docs/api/openapi.yaml`。页面数据一律来自后端接口（统一收口在 `src/services/`），不写假数据。

### 全局上下文（`shared/types/global.ts`、`stores/`）

多个模块共用的登录态和项目上下文统一放这里，**不要在模块文件里重复定义**：

| 内容 | 来源 |
|---|---|
| `UserBrief`、`TaskRef`、`ProjectRole`、`MemberPermissions`、`PermKey`、`Activity` 等共享接口结构 | `shared/types/global.ts`，对应 OpenAPI 公共 schema |
| 当前登录身份（用户、系统角色） | `src/stores/auth/` 的 `useAuth()` / `useMe()`，数据来自 `GET /auth/me`，已接真实接口，token 存在 `sessionStorage`（`src/services/http.ts`） |
| 能进哪些项目、在当前项目里的角色和权限、任务能不能看和改 | `src/stores/access/` 的 `useAccess()`，全站只在这里判断，页面只问不算。项目、成员、权限变更记录来自接口（`src/stores/project/` 的 `ProjectProvider` 取 `GET /projects`、`/projects/{id}`、`/members`、`/activities`），`useAccess()` 在上面加“看过去的期和已归档项目只读”。系统管理员所有项目都能进、所有权限都有，其他人只能进自己加入的项目；权限以接口的 `myPermissions` 为准 |
| 正在看哪一期、各页面的“今天” | `src/stores/issue/` 的 `useIssue()`。过去的期只读；期列表来自 `GET /projects/{projectId}/issues`（期号按项目开始日期每天一期），某期快照 `GET /projects/{projectId}/issues/{issueDate}` 由 `IssueProvider` 取回 |
| `roleLabel` 等枚举中文名 | `shared/constants/labels.ts` |

### 前端替身

目前没有替身，页面数据全部来自接口。以后新页面如果要先用假数据跑起来，假数据放在该页面目录里，并在这里列出来，接口接通时一起删；字段以 `docs/api/openapi.yaml` 为准，后端按接口文档实现，不要照着假数据反推。系统角色已统一为系统管理员 `ADMIN` 和普通用户 `USER` 两种。

### 已接真实接口的部分

请求统一走 `src/services/`：`http.ts` 是封装（自动加 token、解 `{code,message,data}`、失败抛 `ApiError`、401 回登录页），按模块拆 `auth.ts`、`system.ts`、`projects.ts`、`task.ts`、`document.ts`、`progress.ts`、`report.ts`、`collab.ts`、`notifications.ts`。接通一个模块的做法：调用 `src/services/` 的封装，加载中和失败要有提示。已接通：认证、人员、系统角色、系统参数、操作日志、项目（新建、修改、归档、切换）、项目成员（邀请、改角色、改权限）、权限变更记录、期列表、任务（看板、详情、新建、修改、删除、改状态、拖动排序、前置任务、任务动态）、成员负载、甘特图和关键路径（`/gantt`、`/critical-path`）、总览（`/overview`）、统计报表（`/reports/*`，含 Excel 导出）、往期快照（`/issues/{issueDate}`）、文档（列表、详情、上传新文档、传新版本、定稿、下载，往期读快照里的 `documents`）、讨论和评论（发起、回复、@ 成员和任务下的文档，往期读快照里的 `discussions`）、项目动态、通知（铃铛）。文档数据在 `stores/document/DocumentProvider.tsx`：列表接口不带版本记录，所以逐份取详情，再由 `stores/document/utils.ts` 的 `toDocumentItem` 转成页面用的格式（日期是 MM.DD）；上传走 `http.upload`（multipart，单个文件 ≤ 20MB，只收 doc、docx、pdf、md，提交前先校验，失败显示后端 `message`）。“文档没定稿不能完成任务”由后端检查（`PUT /tasks/{id}/status` 和 `/position` 返回 409），前端只显示它的提示；文档有写操作后任务表会跟着重新取。讨论数据在 `features/collab/hooks/useCollabData.ts`：列表接口不带评论，所以逐个取详情，动态一直取接口（过去的期按日期筛）；发起和回复成功后重新取讨论、动态和任务表（任务详情里带着讨论），失败时回复框和抽屉里显示后端 `message`。通知在 `features/notifications/hooks/useNotifications.ts`：登录后取一次、之后每分钟取一次，未读数用 `GET /notifications/unread-count`（列表只取最近 30 条），点通知标为已读并跳转（通知属于别的项目时先切过去），@ 通知带 `?discussionId=&commentId=`，协作页等数据取到后定位到那条消息。进度和报表的数据由后端算，页面用 `stores/issue/useIssueData.ts` 取：看今天调实时接口（任务表每变一次重新取），看过去的期读 `stores/issue/IssueProvider` 里取回的快照（没有存档时页面提示“这一期没有存档”）。任务数据在 `stores/task/TaskProvider.tsx`：用 `GET /projects/{projectId}/tasks?detail=true` 一次取完整任务表，写操作成功后整表重新取一遍，拖动先在页面上移动、接口失败再退回。开始过的任务不能回到待开始（`stores/task/utils.ts` 的 `canMoveStatus`，看板拖不进去、详情页按钮置灰，后端也会 409）；待开始的任务到了计划开始日由后端自动开始（前置都完成了进行中，否则阻塞）。任务条（`components/patterns/TaskBar/`）从计划开始日涂黑，不单独画晚开工（要晚开工由项目经理改计划开始日），系统自动移到阻塞的那条动态从实际开始日算阻塞。按天画的图（任务条、时间线、文档修订、侧栏时间进度）都把今天算作已过完：今天线、填充、逾期段都到今天 24:00，和逾期天数、已用天数（含今天）对得上；只有总览的成员排期精确到此刻，今天线和填充按当前时间画。新建项目任何登录用户都可以，权限不足、项目已归档等失败的情况把接口的 `message` 显示给用户。
