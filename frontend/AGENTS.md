# frontend 补充约定

总约定见根目录 `AGENTS.md`，本文件只写前端补充，冲突时以根目录为准。设计系统与组件详细规范见 [`DESIGN.md`](./DESIGN.md)，历史基线审计见 [`audit.md`](./audit.md)，阶段 3.5 自定义组件盘点与差异分析见 [`custom-components.md`](./custom-components.md)。

---

## 重构目录结构与单向分层规则

当前正处于设计系统与架构重构期（已完成阶段 0 审计、阶段 1 规范、阶段 2 基础设施、阶段 3 基础组件、阶段 3.5 自定义组件盘点），新旧目录并行过渡，**新代码一律按目标结构落位**，旧目录在阶段 4 逐步迁出并删除：

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
| 第 2 批（浮层） | `Drawer` | `radix-ui` `Dialog` | **已实现**（`src/components/ui/Drawer/`） | `md`(640px，44px 标题)/`lg`(880px，60px 标题)、6px 半色调点阵遮罩（4.5% 压暗）、双横线刊头、复用 `Button(default, size="icon")` 关闭钮、焦点陷阱与 Esc |
| 第 2 批（浮层） | `AlertDialog` | `radix-ui` `AlertDialog` | **已实现**（`src/components/ui/AlertDialog/`） | 6px 半色调点阵遮罩（4.5% 压暗）、硬阴影、默认焦点落“取消”、确认钮复用 `Button(danger)` 支持 `loading` |
| 第 2 批（浮层） | `Toast` | `radix-ui` `Toast` | **已实现**（`src/components/ui/Toast/`） | `neutral`/`danger` 语气、`ToastProvider`/`ToastViewport`/`Toast`、多条队列右下角最新在上叠放与独立计时、手动关闭、替代 `window.alert` |
| 第 3 批（展示） | `Badge` | 原生 `<span>` | **已实现**（`src/components/ui/Badge/`） | `solid`（墨底常态）/`outline`/`muted`/`accent`（橙色仅用于需注意状态），`sm`/`md` |
| 第 3 批（展示） | `Alert` | 原生 `<div>` | **已实现**（`src/components/ui/Alert/`） | `inline`/`banner` × `info`（中性色）/`warning`（橙）/`danger`（橙），支持 `title` 与 `action` |
| 第 3 批（展示） | `Tabs` | `radix-ui` `Tabs` | **已实现**（`src/components/ui/Tabs/`） | 平铺报刊风方角标签栏，`active` 墨底反白、方向键漫游与 `disabled` |
| 第 3 批（展示） | `Progress` | `radix-ui` `Progress` | **已实现**（`src/components/ui/Progress/`） | `solid`（含超载斜纹与阈值线）/`dual`（单轨叠加时间斜纹+完成实心，支持 `surface="default"\|"inverse"`）/`segmented`（按周格子，当期空心信号橙粗框，支持 `segmentWidth`），完整 ARIA |
| 第 3 批（展示） | `Separator` | `radix-ui` `Separator` | **已实现**（`src/components/ui/Separator/`） | `single`（单实线）/`double`（抽屉双线 2px+1.5px）/`masthead`（页头刊头双横线 5px+1.5px）/`dashed`（墨色虚线），支持 `horizontal`/`vertical` |

### 业务范式组件（`src/components/patterns/`，共 15 项：6 项已实现，9 项待建，其余按阶段 4 迁移到首个用到它的模块时按需建立）
> 完整归属判定、差异分析与 15 项单模块内部组件清单见 [`custom-components.md`](./custom-components.md)；仅被 1 个模块使用的自定义组件（如 `AppShell`、`AssigneePicker`、`MentionInput`、`FileDropzone`、各图表/拖拽看板）留在各自 `features/<域>/` 或 `layout/` 内部，不进入 `patterns/`。

| 范式组件 | 状态与建立时机 | 职责摘要 |
|---|---|---|
| `BrandMark` | **已实现** · 阶段 4 第 1 步（`src/components/patterns/BrandMark/`） | 双色品牌几何标识 + 可选 `MINITEAM PMS` 字标（`size="sm"\|"md"`、`tone="default"\|"inverse"`，供 `LoginHeader`、`ProjectSwitch`、`SettingDrawer` 复用） |
| `PageHeader` / `Panel` / `FormDrawer` / `EmptyState` & `PageState` / `ActionPopover` | **已实现** · 阶段 4 第 2 步（`src/components/patterns/{PageHeader,Panel,FormDrawer,EmptyState,PageState,ActionPopover}/`） | 双线页头（`60px`/`44px` 切 Token，已由 `LoginHeader` 与 `NoProject` 复用）、三变体面板、表单抽屉壳、空态/页态、刊头列表浮层壳 |
| `SearchDropdown` / `ConfirmDialog` | **待建** · 阶段 4 第 3 步（`settings`） | 公共下拉搜索组合（`Popover` + `Input` + `Spinner`，跨 4 模块 5 处）与破坏性操作二次确认 |
| `Legend` / `HeroCard` / `LoadBar` | **待建** · 阶段 4 第 4 步（`reports`） | 数据驱动图例、强调卡外壳（共享顶栏与风险态）、工时负载轨道（`role="meter"`） |
| `ListRow` / `ActivityFeed` | **待建** · 阶段 4 第 5 步（`members`） | 原生语义跳转列表行、浅/深面时间线动态流（`LogsPanel` 4 列按日表保持独立） |
| `TaskBar` | **待建** · 阶段 4 第 7 步（`timeline`） | 任务生命周期时间条（剥离 `useIssue()`，改为受控 `today` prop） |
| `MetricStrip` | **待建** · 阶段 4 第 8 步（`overview`） | 4 格 KPI 指标条（`--font-size-figure`，支持 `unit`/`sub`/`alert`） |

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

## 过渡期旧样式与遗留文件说明

- **旧 CSS 过渡豁免清单**：`src/styles/index.css`、`src/styles/legacy.css`、`src/styles/typography/roles.css`、`src/shared/components/TaskBar.css`、`src/shared/components/SearchDropdown.css` 及 `src/pages/*/css/**/*.css` 已在 `stylelint.config.mjs` 的 `ignoreFiles` 中按模块登记；**严禁向这些旧文件新增规则**，阶段 4 每迁移完一个业务模块即从 `ignoreFiles` 移出并删除对应旧样式。**阶段 4 全部模块迁移完成后，`legacy.css` 必须为空并删除**。
- **过渡期公共下拉搜索组件（`SearchDropdown`）**：`src/shared/components/SearchDropdown.tsx` / `SearchDropdown.css` 为另一工作目录后续提交中抽出的公共下拉搜索组件（当前被 `PeoplePanel`、`InviteMemberDrawer`、`DocumentHeader`、`UploadDocDrawer`、`AssigneePicker` 使用）；未迁移的旧页面/表单若需带搜索的下拉输入，过渡期继续统一复用它，不要各写各的下拉；阶段 4 迁移时按 [`custom-components.md`](./custom-components.md) 收归至 `components/patterns/SearchDropdown`，全部调用方迁完后删除旧文件并移出 `ignoreFiles`。
- **组件样式手册 `/dev/ui`**：位于 `src/dev/UiShowcasePage.tsx`，通过 `import.meta.env.DEV` + 懒加载挂载在免登录路由 `/dev/ui`，供本地 `pnpm dev` 验收基础组件视觉与交互态，生产构建自动排除。
- **`frontend/prototype/`**：包含旧静态原型 `global.html` / `global.js`（`global.js:3291-3309` 含文档拖拽上传原始实现，且仍登记于 `tsconfig.app.json:25`）。在阶段 4 文档模块把拖拽上传收归 `FileDropzone` 且确认不再参考之前**保留作为参考实现**，已在 `knip.json` 中忽略 `prototype/**`。

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

请求统一走 `src/api/`：`http.ts` 是封装（自动加 token、解 `{code,message,data}`、失败抛 `ApiError`、401 回登录页），按模块拆 `auth.ts`、`system.ts` 等。接通一个模块的做法：页面里的假数据换成 `src/api/` 的调用，加载中和失败要有提示，删掉对应的假数据和不再用的替身。已接通：认证、人员、系统角色、系统参数、操作日志、项目（新建、修改、归档、切换）、项目成员（邀请、改角色、改权限）、权限变更记录、期列表、任务（看板、详情、新建、修改、删除、改状态、拖动排序、前置任务、任务动态）、成员负载、甘特图和关键路径（`/gantt`、`/critical-path`）、总览（`/overview`）、统计报表（`/reports/*`，含 Excel 导出）、往期快照（`/issues/{issueDate}`）、文档（列表、详情、上传新文档、传新版本、定稿、下载，往期读快照里的 `documents`）、讨论和评论（发起、回复、@ 成员和任务下的文档，往期读快照里的 `discussions`）、项目动态、通知（铃铛）。文档数据在 `state/document/DocumentProvider.tsx`：列表接口不带版本记录，所以逐份取详情，再由 `state/document/utils.ts` 的 `toDocumentItem` 转成页面用的格式（日期是 MM.DD）；上传走 `http.upload`（multipart，单个文件 ≤ 20MB，只收 doc、docx、pdf、md，提交前先校验，失败显示后端 `message`）。“文档没定稿不能完成任务”由后端检查（`PUT /tasks/{id}/status` 和 `/position` 返回 409），前端只显示它的提示；文档有写操作后任务表会跟着重新取。讨论数据在 `pages/collab/useCollabData.ts`：列表接口不带评论，所以逐个取详情，动态一直取接口（过去的期按日期筛）；发起和回复成功后重新取讨论、动态和任务表（任务详情里带着讨论），失败时回复框和抽屉里显示后端 `message`。通知在 `features/notifications/hooks/useNotifications.ts`：登录后取一次、之后每分钟取一次，未读数用 `GET /notifications/unread-count`（列表只取最近 30 条），点通知标为已读并跳转（通知属于别的项目时先切过去），@ 通知带 `?discussionId=&commentId=`，协作页等数据取到后定位到那条消息。进度和报表的数据由后端算，页面用 `state/issue/useIssueData.ts` 取：看今天调实时接口（任务表每变一次重新取），看过去的期读 `state/issue/IssueProvider` 里取回的快照（没有存档时页面提示“这一期没有存档”）。任务数据在 `state/task/TaskProvider.tsx`：用 `GET /projects/{projectId}/tasks?detail=true` 一次取完整任务表，写操作成功后整表重新取一遍，拖动先在页面上移动、接口失败再退回。开始过的任务不能回到待开始（`state/task/utils.ts` 的 `canMoveStatus`，看板拖不进去、详情页按钮置灰，后端也会 409）；待开始的任务到了计划开始日由后端自动开始（前置都完成了进行中，否则阻塞）。任务条（`shared/components/taskBarModel.ts`）从计划开始日涂黑，不单独画晚开工（要晚开工由项目经理改计划开始日），系统自动移到阻塞的那条动态从实际开始日算阻塞。按天画的图（任务条、时间线、文档修订、侧栏时间进度）都把今天算作已过完：今天线、填充、逾期段都到今天 24:00，和逾期天数、已用天数（含今天）对得上；只有总览的成员排期精确到此刻，今天线和填充按当前时间画。新建项目任何登录用户都可以，权限不足、项目已归档等失败的情况把接口的 `message` 显示给用户。
