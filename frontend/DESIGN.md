# miniteam-pms 前端设计规范（DESIGN.md）

> **适用范围**：`frontend/` 全部设计 Token、基础组件（`components/ui/`）、业务范式组件（`components/patterns/`）与业务域模块（`features/*`）。
> **定位**：阶段 2（基础设施与 Token）、阶段 3（`components/ui/` 基础组件与 `/dev/ui` 开发期样式手册）、阶段 4（逐模块迁移并按需建立 `components/patterns/`）的唯一设计与工程落位标准；所有约定均基于阶段 0 审计（[`audit.md`](./audit.md)）、阶段 3.5 自定义组件盘点（[`custom-components.md`](./custom-components.md)）与用户已拍板决策制定。

---

## 0. 架构与工程约束总览

1. **视觉风格延续**：严格保留项目现有的 **Tako 暖纸黑墨 + 单信号橙 + 0px 锐角 + 1.5px 描边 + 硬边偏移投影** 报刊/瑞士网格美学，不引入任何新色相或圆角化改风。
2. **运行时无样式原语**：统一安装并使用单包 **`radix-ui`**，按需具名导入（如 `import { Dialog, AlertDialog, Popover } from "radix-ui"`），不混装独立 `@radix-ui/react-*` 分包。
3. **样式隔离与状态驱动**：全面采用 **CSS Modules（`*.module.css`）+ `data-*` 属性** 控制变体与状态（如 `data-variant`、`data-size`、`data-state`、`data-loading`、`data-invalid`），**禁止字符串拼接状态/变体 class 名**，彻底消除全局短类名碰撞。
4. **单向依赖红线**：严格遵守 `features/*` → `components/patterns/*` → `components/ui/*` → `styles/tokens/*`；各 `features/<业务域>` 之间禁止互引；`components/ui/` 与 `components/patterns/` 严禁直接调用 `services/*` 或读取业务 `stores/*`。
5. **工程质量门禁**：**不配置 `husky` / Git hooks**（避免改动 Monorepo 根配置或干扰协作提交），统一在 `frontend/package.json` 提供 `check` 脚本串联执行 `eslint` + `stylelint` + `tsc` + `knip`，并由开发者与 CI 按需执行。
6. **历史遗留处置约定**：
   - `frontend/prototype/`（含 `tsconfig.app.json:25` 中的引用）在文档模块完成将拖拽上传收归 `FileDropzone` 且确认不再参考之前**保留作为参考实现**，暂不删除；
   - `src/styles/index.css` 中从未挂载的 `.enter` / `.first`（19 条规则）及 8 个死 `@keyframes`（`wipe`/`wipeup`/`linedown`/`wipedown`/`stroke`/`draw`/`rise`/`rule`）在阶段 2 **确认删除**，保留 `@media (prefers-reduced-motion: reduce)`；
   - `UploadDocDrawer` 拖拽上传交互（原位于旧原型 `frontend/prototype/global.js:3291-3309` 外层容器委托）在迁移文档模块时**收归 `FileDropzone` 内部**，文案保持“把文件拖到这里，或点此选择”不变。

---

# 第一层：色彩系统（Color System）

## 1.1 色彩美学与治理原则

1. **单一强调色相**：全站维持 **暖纸中性色 + 墨黑 + 单信号橙**，**不引入绿、黄、蓝等任何新色相**。
2. **三层色彩架构**：`Level 1 原始色板（Primitive） → Level 2 语义色（Semantic） → Level 3 组件色（Component，仅确有必要）`。
   - **硬性红线**：`components/ui/`、`components/patterns/` 及 `features/` 的任何样式**严禁直接引用原始色板（`--gray-*` / `--signal-*`）或硬编码 hex / `rgba()`**（阶段 2 通过 Stylelint 规则强制拦截）。
3. **语义分开命名**：`--color-accent`（主强调/当前态）、`--color-danger`（错误/破坏性操作）、`--color-warning`（阻塞/逾期/临期）**必须按业务用途分开命名并分别引用**，当前浅色主题下均指向同一信号橙原始色；`--color-success` 与 `--color-info` 使用墨色或中性灰表达，不另设色相。
4. **色值漂移收口**：统一修复审计发现的色值漂移——`pages/collab/css/` 的 `rgb(255, 79, 17)`（`#ff4f11`）归入 `--signal-500`（`#ff5a1f` = `rgb(255, 90, 31)`）；`rgba(246, 243, 236, 0.08)` 归入 `--gray-50` 透明叠加；`#cfcfca` 归入 `--gray-300`（`#cfcec8`）。
5. **浅色实现与深色扩展约定**：
   - **本次只定义并实现浅色主题值**（`:root` 默认浅色，`color-scheme: light`），**不实现深色模式**；
   - 架构上预留 `[data-theme="dark"]` 扩展点：未来需要深色模式时，**只需在 `[data-theme="dark"]` 下覆写 Level 2 语义色 Token**（并调整 `.shell::after` 纸纹混合模式），Level 1 原始色板与所有组件/业务样式均无需改动。
6. **SVG `<mask>` 豁免说明**：`NotificationBell.tsx`（`fill="white"` / `fill="black"`）与 `report-burndown.css`（`.chart .mk { stroke: #fff; }`）中的纯黑白属于 SVG 几何蒙版的不透明度通道而非界面色彩，**严禁替换为语义色 Token**。

## 1.2 Level 1：原始色板（Primitive Tokens）

> 定义位置：`src/styles/tokens/primitives.css`（仅允许被 `semantic.css` 引用）。

| Token | 取值 | 来源与定位 |
|---|---|---|
| `--gray-0` | `#ffffff` | 纯白基准（备用/高光） |
| `--gray-50` | `#fafaf7` | 原 `--paper`（暖纸表面） |
| `--gray-100` | `#f2f1ec` | 原 `--ground`（暖纸画布底） |
| `--gray-200` | `#e4e3dc` | 原 `--wash`（浅灰悬浮/弱填充面） |
| `--gray-300` | `#cfcec8` | 原 `--hair`（兼收口原 `#cfcfca`） |
| `--gray-350` | `#c4c2bb` | 原 `--soft`（虚线边框/次级弱框） |
| `--gray-400` | `#8f8d86` | 原 `--text-faint`（占位/归档/禁用字） |
| `--gray-600` | `#5e5e5e` | 原 `--mute`（次要说明字） |
| `--gray-700` | `#3a3a3a` | 原暗面细分隔线 `#3a3a3a` |
| `--gray-800` | `#2a2a2a` | 原 `.btn.primary:hover` 深墨悬浮 |
| `--gray-950` | `#0a0a0a` | 原 `--ink`（主墨黑） |
| `--signal-400` | `#ff7442` | 原 `.btn.go:hover`（亮信号橙，悬浮态） |
| `--signal-500` | `#ff5a1f` | 原 `--signal`（主信号橙，兼收口漂移 `#ff4f11`） |
| `--signal-700` | `#b83a00` | 原 `--signal-text`（深信号橙，满足暖纸浅底 WCAG AA 可读性） |

## 1.3 Level 2：语义色（Semantic Tokens，浅色默认）

> 定义位置：`src/styles/tokens/semantic.css`（组件与业务样式的唯一色彩入口；未来 `[data-theme="dark"]` 仅覆写此文件）。

### A. 背景与表面（Surface）
| Token | 浅色取值 | 语义与用途 | 原变量映射 |
|---|---|---|---|
| `--color-bg` | `var(--gray-100)` | 页面画布底层背景 | 原 `--ground` |
| `--color-bg-subtle` | `var(--gray-200)` | 悬浮态、浅灰底区块、控件 hover | 原 `--wash` |
| `--color-surface` | `var(--gray-50)` | 面板、卡片、抽屉、浮层、控件默认表面 | 原 `--paper` |
| `--color-surface-inverse` | `var(--gray-950)` | 反色主按钮、选中导航/选项、暗色面板底 | 原 `--ink` 背景 |
| `--color-surface-inverse-hover` | `var(--gray-800)` | 反色主按钮悬浮态 | 原 `#2a2a2a` |

### B. 文字（Text）
| Token | 浅色取值 | 语义与用途 | 原变量映射 |
|---|---|---|---|
| `--color-text` | `var(--gray-950)` | 主标题、正文、强信息 | 原 `--text` |
| `--color-text-muted` | `var(--gray-600)` | 说明、时间、`// KICKER`、次要元信息 | 原 `--text-mute` / `--mute` |
| `--color-text-faint` | `var(--gray-400)` | 占位符、禁用态、已归档项 | 原 `--text-faint` |
| `--color-text-inverse` | `var(--gray-50)` | 反色深底上的主文字 | 原 `--text-inverse` |
| `--color-text-inverse-muted` | `var(--gray-300)` | 反色深底上的次要文字 | 原 `--text-inverse-mute` |

### C. 描边（Border）
| Token | 浅色取值 | 语义与用途 | 原变量映射 |
|---|---|---|---|
| `--color-border` | `var(--gray-300)` | 列表项分隔线、次级边框、虚线空态框 | 原 `--hair` / `--soft` |
| `--color-border-strong` | `var(--gray-950)` | 面板/卡片/按钮/输入框/抽屉主骨架框 | 原 `--ink` 描边 |
| `--color-border-inverse` | `var(--gray-50)` | 反色深底内的主分割线与仪表框 | 原 `--paper` 描边 |
| `--color-border-inverse-subtle` | `var(--gray-700)` | 反色深底内的次级列表分割线 | 原 `.dark --hair` |

### D. 强调与状态（Accent & Status —— 分开命名，无新色相）
| Token | 浅色取值 | 语义与用途 | 规范约束 |
|---|---|---|---|
| `--color-accent` | `var(--signal-500)` | 主强调、当前页/当前期/今天指示、焦框 | 单视图实心橙重心尽量 ≤ 1 处 |
| `--color-accent-hover` | `var(--signal-400)` | 实心主强调按钮悬浮态 | 替代硬编码 `#ff7442` |
| `--color-accent-text` | `var(--signal-700)` | 暖纸浅底上的强调可读文字 | 替代 `--signal-text` / `--text-accent` |
| `--color-accent-subtle` | `rgba(255, 90, 31, 0.12)` | 激活行/定位高亮淡橙底 | 收口原 `rgba(255,79,17,0.12)` |
| `--color-danger` | `var(--signal-700)` | 错误提示、校验失败、删除/归档文字与边框 | 破坏性操作靠图标+文字+AlertDialog 区分 |
| `--color-danger-bg` | `var(--signal-500)` | 高危实心徽章、顶部告警条 | 与主强调语义隔离，按用途选用 |
| `--color-danger-subtle` | `rgba(255, 90, 31, 0.12)` | 错误态弱背景 | — |
| `--color-warning` | `var(--signal-500)` | 阻塞、逾期、临期、超载指示色 | — |
| `--color-warning-text` | `var(--signal-700)` | 暖纸浅底上的阻塞/逾期文字 | 原 `--text-alert` |
| `--color-warning-subtle` | `rgba(255, 90, 31, 0.12)` | 警告态弱背景 | — |
| `--color-success` | `var(--gray-950)` | 已完成、达标、正常状态（墨色表达） | 不引入绿色 |
| `--color-success-subtle` | `var(--gray-200)` | 正常/完成态弱底（中性浅灰） | 不引入绿色 |
| `--color-info` | `var(--gray-600)` | 中性信息提示、系统动态、只读提示（中性灰） | 不引入蓝色 |
| `--color-info-subtle` | `var(--gray-200)` | 信息提示弱底（中性浅灰） | 不引入蓝色 |

### E. 网格与交互叠加（Overlay / Grid）
| Token | 浅色取值 | 用途 |
|---|---|---|
| `--color-grid-line` | `rgba(10, 10, 10, 0.045)` | 外壳画布 24px 网格底纹 |
| `--color-chart-grid` | `rgba(10, 10, 10, 0.14)` | 燃尽图/图表内部辅助网格线 |
| `--color-empty-tint` | `rgba(10, 10, 10, 0.02)` | 虚线空态框极浅底色 |
| `--color-inverse-hover` | `rgba(250, 250, 247, 0.08)` | 反色深底列表项 hover（收口原 `246,243,236`） |
| `--color-flash-peak` | `rgba(255, 90, 31, 0.38)` | `@提及` 消息跳转闪烁高亮峰值（收口原 `255,79,17`） |

## 1.4 Level 3：组件色（Component Tokens，仅确有必要）

> 定义位置：`src/styles/tokens/components.css`（全部引用 Level 2 语义色，严禁写死 hex）。

| Token | 取值 | 作用与清理目标 |
|---|---|---|
| `--comp-inverse-bg` | `var(--color-surface-inverse)` | 统一反色面板/选中行底色；**消除 `.dark`、`.df[aria-selected]`、`.dr[aria-selected]`、`.dsec.on` 4 处手写 hex 变量覆写** |
| `--comp-inverse-text` | `var(--color-text-inverse)` | 反色块主文字 |
| `--comp-inverse-text-muted` | `var(--color-text-inverse-muted)` | 反色块次文字 |
| `--comp-inverse-border` | `var(--color-border-inverse)` | 反色块主描边 |
| `--comp-inverse-border-subtle` | `var(--color-border-inverse-subtle)` | 反色块次级分割线 |
| `--comp-pattern-warn` | `repeating-linear-gradient(135deg, var(--color-warning) 0 3px, var(--color-surface) 3px 6px)` | 阻塞/逾期斜纹；**合并原完全等价的 `--hatch` 与 `--over`** |
| `--comp-pattern-warn-inverse` | `repeating-linear-gradient(135deg, var(--color-warning) 0 3px, var(--color-surface-inverse) 3px 6px)` | 反色底上的阻塞/逾期斜纹 |
| `--comp-pattern-past` | `repeating-linear-gradient(135deg, var(--color-border-strong) 0 3px, var(--color-surface) 3px 6px)` | 已完成任务历史异常斜纹（替代 `--tb-past`） |
| `--comp-backdrop-dot` | `radial-gradient(circle, var(--color-text-muted) 0 0.8px, transparent 1.1px)` | 抽屉/弹窗半色调点阵遮罩（配合 `var(--space-1-5)` 6px 点距与 `var(--color-grid-line)` 4.5% 底色压暗，兼顾报刊网点退后感与低摩尔纹；同步删除死变量 `--iz`） |

---

# 第二层：样式系统（Style Tokens）

> 定义位置：`src/styles/tokens/layout.css`、`src/styles/tokens/typography.css`、`src/styles/tokens/motion.css`。

## 2.1 间距（Spacing）

**4px 基准网格**，**严格只允许两个半步 Token（`--space-0-5: 2px`、`--space-1-5: 6px`）**；原 `10px` 与 `14px` 一律对齐到 `8px / 12px / 16px`，禁止新增其他非 4px 倍数间距。

| Token | 取值 | 典型场景 |
|---|---:|---|
| `--space-0` | `0` | 重置外边距/贴边 |
| `--space-0-5` | `2px` | *(允许半步 1)* 徽章/标签垂直内边距、极紧凑元素 gap、微调偏移 |
| `--space-1` | `4px` | 图标与文字紧凑间距、小芯片 gap、次级上下留白 |
| `--space-1-5` | `6px` | *(允许半步 2)* 按钮图标 gap、表头/紧凑列表行上下内边距 |
| `--space-2` | `8px` | 控件组 gap、标签与控件间距、紧凑卡片内边距 |
| `--space-3` | `12px` | 标准列表行/按钮水平内边距、面板内部上下间距、常规 gap |
| `--space-4` | `16px` | 面板水平内边距、区块间距、页内模块 gap、侧栏内边距 |
| `--space-5` | `20px` | 页头底部留白、表单行栏距、较大区块间隔 |
| `--space-6` | `24px` | 抽屉头部/主体内边距、宽列网格 gap |
| `--space-7` | `28px` | 主内容区水平外边距（桌面端） |
| `--space-8` | `32px` | 抽屉水平内边距、空状态留白 |
| `--space-10` | `40px` | 抽屉底部滚动缓冲留白 |
| `--space-12` | `48px` | 页面级大留白（登录页、空项目页） |

### 既有非标准间距迁移对照表（阶段 2–4 必遵）
| 旧值（审计次数） | 归并目标 Token | 对齐原则 |
|---|---|---|
| `1px`(9) / `3px`(15) | `--space-0-5` (`2px`) 或 `--space-1` (`4px`) | 微间距归 `2px`，分组间距归 `4px` |
| `5px`(15) / `7px`(4) | `--space-1-5` (`6px`) | 就近对齐 `6px` |
| `9px`(6) | `--space-2` (`8px`) | 列表行/标题栏上下内边距对齐 `8px` |
| **`10px`(58)** | **`--space-2` (`8px`) 或 `--space-3` (`12px`)** | 按钮/工具条紧凑 gap 与行上下内边距 → `8px`；导航/卡片/抽屉常规内边距与 gap → `12px` |
| `13px`(1) | `--space-3` (`12px`) | 卡片底部微调对齐 `12px` |
| **`14px`(42)** | **`--space-3` (`12px`) 或 `--space-4` (`16px`)** | 按钮/浮层行水平内边距 → `12px`；面板主视图 gap、图例组间距、区块间隔 → `16px` |
| `18px`(6) | `--space-4` (`16px`) 或 `--space-5` (`20px`) | 顶栏上边距/抽屉正文上边距 → `16px`；段落/面板分组 → `20px` |
| `22px`(7) | `--space-5` (`20px`) 或 `--space-6` (`24px`) | 侧栏/主区底边距 → `20px`；抽屉顶边距/上传区 → `24px` |
| `-0.75px`(5) | `calc(var(--border-width-thin) / -2)` | 竖向基准线/今日线居中偏移公式化，不写死魔法数 |

## 2.2 圆角（Border Radius）

全站坚持 **0 圆角锐利几何美学**，**不设 `sm` / `md` / `lg` 微圆角**。

| Token | 取值 | 适用范围 |
|---|---:|---|
| `--radius-none` | `0px` | **全站默认**：面板、卡片、按钮、输入框、芯片、标签、下拉、抽屉、弹窗、Toast、进度条、任务条 |
| `--radius-full` | `9999px` | **仅限本身语义为圆形的元素**（圆形头像、圆形状态点等） |

- **同心圆角原则**：嵌套圆角容器需遵守 `R_outer = R_inner + padding`。在全站 `--radius-none: 0px` 下天然满足 `0 = 0 + 0`；**严禁**在任何原子组件（包括 Radix `Switch`、`Tooltip`、`AlertDialog`、`Toast`）中局部混入 `2px–8px` 圆角。

## 2.3 描边（Border）

| Token | 取值 | 用途与旧值归并 |
|---|---:|---|
| `--border-width-thin` | `1.5px` | **标准描边**：面板、卡片、按钮、输入框、抽屉、浮层、KPI 框（承接原 80 次 `1.5px`） |
| `--border-width-thick` | `2px` | **粗描边**：表头/区块强调线、当前期/当前周框、焦点与激活下划线（**将原 9 次 `2.5px`、3 次 `2px`、2 次 `3px` 统一归并至 `2px`**） |
| `--border-width-hair` | `1px` | *(辅助细线特例)* 仅用于数据密集列表项内部分隔线、甘特/燃尽图表网格线与紧凑任务条，不用于容器外框 |

- **描边线型**：仅允许 `solid` 与 `dashed`。
- **描边颜色**：只使用 `--color-border`、`--color-border-strong`、`--color-accent`、`--color-danger`、`--color-warning`、`--color-border-inverse`、`--color-border-inverse-subtle`（及 `transparent` / `currentColor`）。
- **图表 SVG 线宽策略**：数据可视化折线与参考线（如燃尽图实际线 `3`、网格线 `1`）属数据编码而非 UI 描边，保留在对应图表组件样式内部管理。

## 2.4 阴影（Elevation / Shadow）

保留 **零模糊硬边偏移投影（`blur = 0`）** 报刊纸片质感：

| Token | 取值 | 对应层级与组件 |
|---|---|---|
| `--shadow-sm` | `2px 2px 0 var(--color-border-strong)` | 轻抬升卡片 / 紧凑浮标 |
| `--shadow-md` | `4px 4px 0 var(--color-border-strong)` | 下拉菜单 / Popover / `@提及` 浮层（归并原 `3px 3px 0`） |
| `--shadow-lg` | `6px 6px 0 var(--color-border-strong)` | 弹窗（`AlertDialog`）/ `Toast` / 看板拖拽悬浮镜像卡（承接原 `6px 6px 0`） |

- *注*：原 KPI 告警顶条（`inset 0 5px 0 var(--signal)`）与甘特高危行内框（`inset 0 0 0 2px var(--signal)`）属内描边状态强调而非海拔投影，颜色改为 `--color-danger-bg` / `--color-warning`。

## 2.5 字体与排版（Typography）

### A. 字体族（Font Family）
| Token | 取值 | 用途 |
|---|---|---|
| `--font-sans` | `"Noto Sans SC", "Archivo", "PingFang SC", "Microsoft YaHei", sans-serif` | 默认界面正文、表单标签、面板中文标题 |
| `--font-display` | `"Archivo", "Noto Sans SC", "PingFang SC", sans-serif` | 页面/抽屉刊头大标题 |
| `--font-mono` | `"JetBrains Mono", "Noto Sans SC", ui-monospace, monospace` | 编号、日期、等宽大数字、`// KICKER`、按钮、元信息 |

*(保持 `index.html` 现有字体引入与全局 `font-variant-numeric: tabular-nums`。)*

### B. 字号阶梯（Font Size）
| Token | 取值 | 原变量与归并说明 | 典型用途 |
|---|---:|---|---|
| `--font-size-2xs` | `10px` | 原 `--fs-2xs`（69 次，**明确保留**） | `// KICKER`、坐标轴刻度、时间戳、角标、提示 |
| `--font-size-xs` | `11px` | 原 `--fs-xs`（45 次） | 按钮文字、等宽元信息、错误提示、徽章 |
| `--font-size-sm` | `12px` | 原 `--fs-sm`（28 次） | 次要正文、动态/表格列表项 |
| `--font-size-md` | `13px` | 原 `--fs-md`（32 次） | **默认正文基准**、表单标签、选项文字 |
| `--font-size-lg` | `15px` | 原 `--fs-lg`（15 次；**归并 `overview.css:333` 原 `18px`**） | 面板标题、表单输入框、侧栏导航 |
| `--font-size-xl` | `22px` | 原 `--fs-2xl`（7 次；**归并 `collab-detail.css:6` 原 `18px`**） | 卡片副标题、人名、重点标题 |
| `--font-size-2xl` | `28px` | 原 `--fs-3xl`（5 次；**归并 `overview.css:336` 原 `36px`**） | 中号统计数字、个人页姓名、面板计数 |
| `--font-size-display-sm` | `44px` | 原 `--fs-5xl`（7 次，**正式定稿响应式降档**） | 抽屉标题、详情页标题、窄屏（`≤900px`）页面主标题、紧凑大数字；断点处切换 Token，不写死数值 |
| `--font-size-display` | `60px` | 原 `--fs-7xl`（12 处有效渲染） | 报纸报头式页面主标题、总览头条大数 |
| `--font-size-figure` | `var(--font-size-display)`（`60px`） | **新增统计大数字语义 Token**（承接原 `--fs-6xl: 56px` 7 处有效渲染） | 全站大号 KPI / 统计数字（与页面标题语义分离，未来可独立微调） |

> **移除冗余档位与窄容器迁移校验说明**：
> - 原 `--fs-xl: 18px` 与 `--fs-4xl: 36px` 彻底归并移除；
> - 原 `--fs-6xl: 56px` 与 `--font-size-display: 60px` 仅差 4px（6.7%）且共用同一字距与行高，新 Token 体系**取消独立的 `56px` 档位**，新增语义 Token `--font-size-figure: var(--font-size-display)`（当前为 `60px`）专门承接下方 7 处大数字迁移（页面标题引用 `--font-size-display`，大数字引用 `--font-size-figure`）；
> - **窄容器迁移红线**：看板列头（`BoardColumn`）、成员卡片（`MemberLoad`）、报表预测日期（`ForecastHero` 5 字符日期）等窄容器在阶段 4 迁移时**必须截图对比，确认不溢出、不挤压**（空间受限时按需改用 `--font-size-display-sm: 44px`）。阶段 2 过渡期 `legacy.css` 中 `--fs-6xl` 暂保留 `56px` 保零回归，阶段 4 逐组件迁移时切至 `--font-size-figure`。

#### 附 1：全站 `60px` 字号（`--fs-7xl`）实证使用清单（12 处有效 + 1 处覆写排除）
经全站扫描，无硬编码 `font-size: 60px`，全部通过原 `--fs-7xl: 60px` 引用：

| CSS 定义位置 | 选择器 | 使用组件（路径与行号） | 展示内容 | 响应式 / 局部覆写 |
|---|---|---|---|---|
| `src/styles/typography/roles.css:7-13` | `.t-page-title` | `src/pages/overview/components/OverviewHeader.tsx:15` | `项目日报`（页头 `<h1>`） | `≤900px` 切 `--font-size-display-sm`（`44px`） |
| 同上 | `.t-page-title` | `src/pages/board/components/BoardHeader.tsx:27` | `任务看板` | 同上 |
| 同上 | `.t-page-title` | `src/pages/timeline/components/TimelineHeader.tsx:26` | `时间线` | 同上 |
| 同上 | `.t-page-title` | `src/pages/reports/components/ReportsHeader.tsx:30` | `统计报表` | 同上 |
| 同上 | `.t-page-title` | `src/pages/collab/components/CollabHeader.tsx:14` | `团队协作` | 同上 |
| 同上 | `.t-page-title` | `src/pages/documents/components/DocumentHeader.tsx:38` | `项目文档` | 同上 |
| 同上 | `.t-page-title` | `src/pages/members/components/MembersHeader.tsx:24` | `成员权限` | 同上 |
| 同上 | `.t-page-title` | `src/pages/members/components/SelfHeader.tsx:13` | `我的信息` | 同上 |
| 同上 | `.t-page-title` | `src/pages/login/LoginPage.tsx:110` | `登录` / `注册` | 另在 `max-height: 700px` 切 `--font-size-display-sm` |
| 同上 | `.t-page-title` | `src/layout/NoProject.tsx:12` | `还没有项目` | `≤900px` 切 `--font-size-display-sm` |
| 同上 | `.t-page-title` | `src/pages/task/components/NoAccess.tsx:12` | `无权查看` | `≤900px` 切 `--font-size-display-sm` |
| *(覆写排除)* | `.t-page-title` | `src/pages/task/components/TaskHeader.tsx:48` | 任务详情标题 | 被 `task-header.css:64-68` 覆写为 `44px`（迁移后用 `PageHeader` `size="compact"`） |
| `src/styles/index.css:1161-1167` | `.hero .big b` | `src/pages/overview/components/HeadlinePanel.tsx:36` | 总览头条延期大数字（如 `+03`/`00`） | `max-height: 800px` 降为 `--font-size-2xl`（`28px`） |

#### 附 2：原 `56px` 字号（`--fs-6xl`）实证使用清单与迁移映射（8 处 CSS 规则：7 处有效 + 1 处死类）
经全站扫描，无硬编码 `font-size: 56px`，全部通过原 `--fs-6xl: 56px` 引用；新体系统一迁移至 `--font-size-figure`（当前指向 `--font-size-display`，`60px`；看板列头、成员卡片等窄容器在阶段 4 迁移时需截图对比，确认不溢出、不挤压）：

| # | CSS 文件与行号 | 选择器 | 对应组件（路径与行号） | 展示内容与阶段 4 迁移目标 |
|---:|---|---|---|---|
| 1 | `pages/board/css/board-layout.css:44` | `.col header .count` | `pages/board/components/BoardColumn.tsx:55` | 看板 4 列顶部任务总数 → `--font-size-figure`（窄容器须截图核对不溢出） |
| 2 | `pages/documents/css/document-detail.css:50` | `.dhero .row b` | `pages/documents/components/DocumentDetailHero.tsx:23` | 文档详情顶卡版本号/逾期天数 → `--font-size-figure` |
| 3 | `pages/members/css/member-crew.css:128` | `.c-load .big` | `pages/members/components/MemberLoad.tsx:29` | 成员卡片本周工时大数字 → `--font-size-figure`（窄容器须截图核对不挤压） |
| 4 | `pages/members/css/member-self.css:95` | `.me-big` | `pages/members/components/SelfLoad.tsx:29` | 个人页本周工时大数字 → `--font-size-figure` |
| 5 | `pages/overview/css/overview.css:212` | `.pg .big` | `pages/overview/components/ProgressPanel.tsx:19` | 总览页项目进度百分比 → `--font-size-figure` |
| 6 | `pages/reports/css/report-forecast.css:84` | `.hero .huge` | `pages/reports/components/ForecastHero.tsx:84` | 报表页预测完工日期（如 `05.18`）→ `--font-size-figure`（窄容器按需切 `--font-size-display-sm`） |
| 7 | `styles/index.css:1075` | `.figure .num` | `pages/overview/components/Figure.tsx:16` + `pages/task/components/FigureItem.tsx:17` | 总览页 & 任务详情页 4 联 KPI 大数字 → `--font-size-figure` |
| 8 | `styles/typography/roles.css:81` | `.t-figure` | **未使用（0 处引用）** | 死角色类，随 `roles.css` 淘汰删除 |

### C. 字重（Font Weight）
> `index.html` 加载的字库不含 `600` 字重，为避免浏览器合成伪粗体，`--font-weight-semibold` 直接映射至实际加载的 `700`。

| Token | 取值 | 原变量与用途 |
|---|---:|---|
| `--font-weight-regular` | `400` | 原 `--fw-regular`（18 次）：正文、说明、等宽元信息 |
| `--font-weight-medium` | `500` | 原 `--fw-medium`（7 次）：已读通知、次级弱化标签 |
| `--font-weight-semibold` | `700` | 原 `--fw-bold`（101 次）：按钮、标签、加粗正文、导航激活、表单项 |
| `--font-weight-heavy` | `800` | 原 `--fw-heavy`（47 次）：等宽 KPI 大数字、高强调标签 |
| `--font-weight-black` | `900` | 原 `--fw-black`（17 次）：刊头页面主标题、抽屉标题、面板标题 |

### D. 行高与字距（Line Height & Letter Spacing）
| Token | 取值 | 原变量与用途 |
|---|---:|---|
| `--line-height-solid` | `0.88` | 原 `--lh-solid`（13 次）：44px+ 超大数字压紧上下留白 |
| `--line-height-none` | `1` | 原 `--lh-none`（12 次）：单行大标题与图标容器 |
| `--line-height-tight` | `1.2` | 原 `--lh-snug`（8 次）：多行标题、紧凑卡片 |
| `--line-height-normal` | `1.45` | 原 `--lh-normal`（18 次）：常规正文、列表、消息 |
| `--line-height-relaxed` | `1.7` | 原 `--lh-loose`（4 次）：任务说明、长评论、文本域 |
| `--letter-spacing-tighter` | `-3px` | `--font-size-display`（`60px`）超大统计数字 |
| `--letter-spacing-tight` | `-2px` | `44px`–`60px` 展示大标题 |
| `--letter-spacing-snug` | `-1px` | `22px`–`28px` 小标题与中号数字 |
| `--letter-spacing-normal` | `0` | 默认正文（收口原 2 次 `-0.5px`） |
| `--letter-spacing-wide` | `0.5px` | 等宽小标签 |
| `--letter-spacing-wider` | `1px` | 侧栏分组头、浮层标题 |

- *规范要求*：原 8 处硬编码 px 行高（`30px`/`23px`/`20px`/`18px`/`12px`）改用 `height` / `min-height` + `display: flex; align-items: center`，禁止以 px 值写 `line-height`。

### E. 全局排版角色 Class（`roles.css`）淘汰与组件迁移去向表
> **硬性原则**：原 `src/styles/typography/roles.css` 中的 `.t-page-title` 等 11 个全局角色 class 属于排版组合类而非 Design Token，**不保留为全局样式**；随阶段 3/4 组件迁移逐步吸收进对应组件 CSS Module，全站迁移完毕后删除 `roles.css`。

| 旧角色 Class | 原定义位置 | 原样式核心 | 全站引用次数 | 迁移去向（对应组件） |
|---|---|---|---:|---|
| `.t-page-title` | `roles.css:7-13, 97-100` | `disp / 60px (≤900px: 44px) / 900 / lh:1 / ls:-2px` | 12 处 | **`components/patterns/PageHeader`**（`<h1>` 默认 `--font-size-display`，`≤900px` 与详情页 `size="compact"` 切 `--font-size-display-sm`） |
| `.t-overlay-title` | `roles.css:16-22` | `disp / 44px / 900 / lh:1 / ls:-2px` | 6 处 | **`components/ui/Drawer`**（`Drawer.Title`）与 **`components/patterns/FormDrawer`**（`--font-size-display-sm`） |
| `.t-section-title` | `roles.css:25-29` | `sans / 15px / 900` | 27 处 | **`components/patterns/Panel`**（面板标题槽）及 `features/board` 看板列头 |
| `.t-kicker` | `roles.css:32-37` | `mono / 10px / 700 / muted` | 28 处 | **`components/patterns/Panel`** / **`PageHeader`** / **`HeroCard`** / **`MetricCard`** 各自内置 `kicker` 槽位 |
| `.t-label` | `roles.css:40-44` | `sans / 13px / 700` | 40 处 | **`components/ui/Field`**（`label` 槽位） |
| `.t-body` | `roles.css:47-52` | `sans / 13px / 400 / lh:1.45` | **0 处** | **直接删除**（全局 `base.css` `body` 默认承载正文排版） |
| `.t-hint` | `roles.css:55-60` | `mono / 10px / 400 / muted` | 3 处 | **`components/ui/Field`**（`hint` 槽位）与 **`components/patterns/EmptyState`** |
| `.t-error` | `roles.css:63-68` | `mono / 11px / 700 / danger` | 12 处 | **`components/ui/Field`**（`error` 槽位）与 **`components/ui/Alert`**（`data-variant="inline" data-tone="danger"`） |
| `.t-meta` | `roles.css:71-76` | `mono / 11px / 400 / muted` | 3 处 | **`components/patterns/EmptyState`** 与 **`components/patterns/ListRow`**（`meta` 槽位） |
| `.t-figure` | `roles.css:79-85` | `mono / 56px / 800 / lh:0.88 / ls:-3px` | **0 处** | **直接删除**（大数字样式归入 **`MetricCard`** / **`HeroCard`** CSS Module，字号切 `--font-size-figure`） |
| `.t-figure-sm` | `roles.css:88-94` | `mono / 28px / 800 / lh:1 / ls:-1px` | **0 处** | **直接删除**（中号数字样式归入 **`Panel`** / 业务统计组件 CSS Module） |

## 2.6 动效、层级与焦点环（Motion, Z-Index & Focus）

### A. 动效（Motion）
| Token | 取值 | 用途 |
|---|---|---|
| `--duration-fast` | `120ms` | 悬停、按压、焦点、开关/芯片/菜单微交互（承接原 `0.12s`） |
| `--duration-normal` | `260ms` | 抽屉滑入、弹窗/浮层展开收起（承接原 `slidein 0.26s`） |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | 全站统一标准缓动（承接原 10 次主缓动） |

### B. 层级（Z-Index）
| Token | 取值 | 用途 |
|---|---:|---|
| `--z-base` | `0` | 常规文档流、图表基线 |
| `--z-sticky` | `10` | 粘性表头、甘特图固定左列/日期轴（收口原 2–7 零散层级） |
| `--z-chrome` | `20` | 侧栏 `.index`、顶栏 `.masthead` |
| `--z-dropdown` | `30` | Popover、Select、Dropdown、`@提及` 浮层（将原 `collab-mention` 从 20 抬至 30） |
| `--z-backdrop` | `39` | 抽屉与弹窗半色调点阵遮罩 |
| `--z-modal` | `40` | `Drawer` 抽屉、`AlertDialog` 确认弹窗 |
| `--z-drag` | `50` | 看板拖拽悬浮镜像卡 |
| `--z-toast` | `60` | 全局 `Toast` 轻提示 |
| `--z-grain` | `70` | 全局纸纹叠加层 `.shell::after`（`pointer-events: none`） |

### C. 焦点环（Focus Ring）
| Token | 取值 | 用途 |
|---|---|---|
| `--focus-ring-width` | `2px` | 焦点描边粗细 |
| `--focus-ring-color` | `var(--color-accent)` | 焦点描边颜色（信号橙） |
| `--focus-ring` | `var(--focus-ring-width) solid var(--focus-ring-color)` | 统一 `:focus-visible` 焦点环声明 |
| `--focus-ring-offset` | `2px` | 外露控件（按钮/链接/开关）默认外偏移 |
| `--focus-ring-offset-inset` | `-2px` | 贴边列表项/网格单元格内缩偏移 |

- **硬性规则**：焦点环**仅作用于 `:focus-visible`**；禁止在任何可交互元素上无替代方案地声明 `outline: none`。

---

# 第三层：基础组件规范（`src/components/ui/`）

## 3.1 通用工程约束
- **底层原语**：统一使用单包 `radix-ui` 按需具名导入（`Dialog`、`AlertDialog`、`Popover`、`DropdownMenu`、`Select`、`Switch`、`Checkbox`、`ToggleGroup`、`Tabs`、`Toast`、`Separator`、`Progress`），不混装独立 `@radix-ui/react-*` 分包。
- **样式与状态驱动**：每个组件配套独立 CSS Module（`*.module.css`）；变体、尺寸、状态统一通过 **`data-*` 属性**（`data-variant`、`data-size`、`data-state`、`data-loading`、`data-invalid`、`data-disabled`、`data-tone`）与标准伪类（`:hover`、`:active`、`:focus-visible`、`:disabled`、`[aria-invalid="true"]`）驱动，**禁止拼接状态类名**。
- **Token 红线**：组件样式只允许引用第一层语义色/组件色与第二层样式 Token；状态切换只改变 Token 映射，不引起布局抖动。
- **不提前抽象**：本清单仅登记项目 9 个页面与全局壳体**实际用到**的基础组件与变体。

## 3.2 `components/ui/` 组件登记表（共 19 项，分批封装）

> **阶段 3 封装批次规划**：
> - **前置基础（2 项）**：`Button`（已试点，前置修正去 `ghost`/`selected`、统一禁用态、强化 `accent` hover 并复用 `Spinner`）、`Spinner`（纯 CSS 旋转环）；
> - **第 1 批 · 表单控件（7 项）**：`Input`（含 `type="date"` 外观对齐）、`Textarea`、`Checkbox`、`Switch`、`Select`、`ToggleGroup`、`Field`；
> - **第 2 批 · 浮层（5 项，不含 `Tooltip`）**：`Popover`、`DropdownMenu`、`Drawer`、`AlertDialog`、`Toast`；
> - **第 3 批 · 展示类（5 项）**：`Badge`、`Alert`、`Tabs`、`Progress`、`Separator`。
>
> **明确不封装的控件决策（按阶段 3 核查与阶段 3.5 全量盘点拍板）**：
> - **`Tooltip`**：全站 0 处自定义 Tooltip，仅 13 处原生 `title` 截断/提示，**不封装**，沿用原生 `title`；
> - **`DatePicker`**：全站仅 5 处单日 `<input type="date">`，**不封装**独立日期选择器和日期库，直接复用 `ui/Input[type="date"]` 并确保其高度、描边、字号、字体、`focus`、`invalid`、`disabled` 与其他文本输入框完全一致；
> - **`Avatar`**：全站仅 `AccountMenu.tsx:37` 1 处首字母方块，**不封装**，保留在 `AccountMenu` 局部样式；
> - **`Combobox`**：经阶段 3.5 盘点及 `origin/main` 合并复核（详见 [`custom-components.md`](./custom-components.md)），通用下拉搜索壳已跨 4 模块 5 处复用，归入业务范式层 **`components/patterns/SearchDropdown`**（基于 `ui/Popover` + `ui/Input` + `ui/Spinner`，**不抽象 `ui/Combobox`，不引入 `cmdk`/`downshift` 等新依赖**）；`AssigneePicker` 保留在 `features/tasks/` 内作为业务薄封装调用 `patterns/SearchDropdown`；
> - **骨架屏**：**不做**，页面与按钮加载态复用极简 `ui/Spinner` 或文字提示。
> - **阶段 3.5 结论**：`components/ui/` **新增待建项为 0 项**，现有 19 项已完整覆盖全站无业务通用原语。

| 组件 | 批次 / 底层原语 | 尺寸 / 变体（`data-size` / `data-variant`） | `data-*` 与 ARIA 属性 | 核心语义 Token | 替换旧实现 |
|---|---|---|---|---|---|
| **`Spinner`** | 前置 · 原生 `<span>` | 尺寸：`sm`(12px) / `md`(14px) / `lg`(20px)；继承 `currentColor` | `data-size`、`role="status"`（传入 `label` 时）或 `aria-hidden="true"` | `--border-width-thin`、`--radius-full`、`--duration-normal` | 抽离 `Button` 旋转环，供按钮与阶段 4 `PageState` 复用 |
| **`Button`** | 前置 · 原生 `<button>` | 变体（6 种，已删未使用的 `ghost`）：`default`（纸底黑框）、`primary`（墨底反白）、`accent`（信号橙底黑字）、`danger`（纸底橙字橙框）、`dashed`（虚线新建）、`link`（下划线行内）；尺寸：`sm`(30px) / `md`(34px) / `lg`(40px) / `icon`(40×40) | `data-variant`、`data-size`、`data-loading`、`data-full-width`、`aria-busy`、`disabled`（**不承载 `selected`/`aria-pressed`**） | `--color-surface`、`--color-bg-subtle`、`--color-surface-inverse`、`--color-surface-inverse-hover`、`--color-accent`、`--color-accent-text`、`--color-text-inverse`、`--color-danger`、`--color-border`、`--color-border-strong`、`--color-text-faint`、`--border-width-thin`、`--focus-ring` | `.btn`（default/primary/go/risk）、`.addcard`、`.ov-close`、`.bell`、`.tk-back`、`.back`、`.hv-download-btn`、`.auth-alt button`、`.hero .go` |
| **`Input`** | 第 1 批 · 原生 `<input>` | 变体：`underline`（墨色下划线 `--color-border-strong`，焦点切 2px 信号橙，表单/设置统一）、`boxed`（全框，搜索/行内输入）；尺寸：`sm` / `md`；**兼容 `type="date"` 与文本输入外观完全一致** | `data-variant`、`data-size`、`data-invalid`、`aria-invalid`、`aria-describedby`、`readOnly`、`disabled` | `--color-surface`、`--color-bg-subtle`、`--color-text`、`--color-text-muted`、`--color-text-faint`、`--color-border`、`--color-border-strong`、`--color-accent`、`--color-danger`、`--border-width-thin` | `.fr .u`、`.in`（含 `.sm`/`.xs`/`.u.n`）、`.field input`、5 处 `input[type="date"]` |
| **`Textarea`** | 第 1 批 · 原生 `<textarea>` | 变体：`underline`（抽屉说明）、`boxed`（协作回复框） | `data-variant`、`data-invalid`、`aria-invalid`、`aria-describedby`、`disabled` | 同 `Input` | `.fr textarea.u`、`.reply textarea` |
| **`Checkbox`** | 第 1 批 · `radix-ui` `Checkbox` | 默认单尺寸（16×16 锐角方框 + 实心勾选） | `data-state="checked"\|"unchecked"`、`data-disabled`、`data-invalid` | `--color-surface`、`--color-bg-subtle`、`--color-surface-inverse`、`--color-text-inverse`、`--color-border`、`--color-border-strong`、`--color-danger`、`--focus-ring` | `LoginPage` `.ck`、`InviteMemberDrawer` `.member-perm-check` |
| **`Switch`** | 第 1 批 · `radix-ui` `Switch` | 变体：`track`（单轨 `28×12` 固定轨道 + `8×8` 方形滑块 + “有/无”，开态滑块在右墨色实底、关态滑块在左纸色底，不使用虚线）、`segmented`（双格“启用/停用”，`loading` 态双格文字 `visibility: hidden` 锁定同宽零抖动） | `data-variant`、`data-state="checked"\|"unchecked"`、`data-disabled`、`data-loading`、`aria-busy` | `--color-surface`、`--color-surface-inverse`、`--color-text`、`--color-text-inverse`、`--color-bg-subtle`、`--color-border`、`--color-border-strong`、`--color-text-faint`、`--focus-ring` | `overlays/settings/Switch`（`.sw2`）、`pages/members/PermToggle`（`.pm`） |
| **`Select`** | 第 1 批 · `radix-ui` `Select` | 变体：`underline`（抽屉与成员矩阵统一；禁用态透明底 + 弱化点线下划线） | `data-state="open"\|"closed"`、`data-highlighted`、`data-disabled`、`data-invalid`、`data-placeholder` | `--color-surface`、`--color-bg-subtle`、`--color-border`、`--color-border-strong`、`--color-accent`、`--color-danger`、`--shadow-md`、`--z-dropdown` | `UploadDocDrawer` / `InviteMemberDrawer` `select.u`、`MemberColumn` `select.in` |
| **`ToggleGroup`** | 第 1 批 · `radix-ui` `ToggleGroup` | 变体：`segmented`（连体黑框分段）、`chips`（流式单/多选芯片）；支持 `type="single" \| "multiple"` | `data-variant`、`data-state="on"\|"off"`、`data-disabled` | `--color-surface`、`--color-bg-subtle`、`--color-surface-inverse`、`--color-text-inverse`、`--color-border`、`--color-border-strong`、`--color-text-faint` | `.seg`（3 页）、`.chips`（4 处，修复 `role="radio"` + `aria-pressed` 误用）、`.roles`（2 处，修复隐藏按钮吞焦点）；**承接全站切换/选中态按钮** |
| **`Field`** | 第 1 批 · 原生语义容器 | 布局：`layout="horizontal" \| "vertical"`（横向固定左标签列 + 右内容列左起点严格对齐）、`align="baseline" \| "top"`；支持 `label`/`required`（**墨色星号 `*`**）/`hint`/`error`；**内置 `useId()` 自动打通 `htmlFor`/`id`/`aria-invalid`/`aria-describedby`** | `data-layout`、`data-align`、`data-invalid`、`data-required` | `--color-text`、`--color-text-muted`、`--color-danger`、`--font-size-md`、`--font-size-2xs`、`--font-size-xs`、`--space-2` | 40 处 `.fr`（22）与 `.srow`（18）表单行（替代原 `patterns/FormField`） |
| **`Popover`** | 第 2 批 · `radix-ui` `Popover` | 通用浮层容器（Portal + 碰撞翻转 + 外部点击/Esc 关闭 + 焦点返回） | `data-state="open"\|"closed"`、`data-side` | `--color-surface`、`--color-border-strong`、`--shadow-md`、`--z-dropdown`、`--duration-fast` | `useDismiss` + `.issues`（`ProjectSwitch`、`IssueSwitch`、`NotificationBell`、`AssigneePicker`） |
| **`DropdownMenu`** | 第 2 批 · `radix-ui` `DropdownMenu` | 操作菜单（内置键盘漫游、`Item`、`Separator`、`Label`） | `data-state="open"\|"closed"`、`data-highlighted`、`data-disabled`、`data-tone="danger"` | `--color-surface`、`--color-bg-subtle`、`--color-surface-inverse`、`--color-danger`、`--shadow-md`、`--z-dropdown` | `AccountMenu` `.issues.accts` |
| **`Drawer`** | 第 2 批 · `radix-ui` `Dialog` | 尺寸：`md`（表单抽屉，640px，标题 `--font-size-display-sm` 44px）、`lg`（设置抽屉，880px，标题 `--font-size-display` 60px，窄屏降为 44px）；右侧滑入、6px 半色调点阵遮罩（4.5% 底色压暗）、双横线、复用 `Button(default, size="icon")` 关闭钮 | `data-size`、`data-state="open"\|"closed"` | `--color-surface`、`--color-border-strong`、`--color-grid-line`、`--comp-backdrop-dot`、`--shadow-lg`、`--z-backdrop`、`--z-modal`、`--duration-normal`、`--ease-standard` | `shared/components/Drawer.tsx`（消除 `#shell.classList` 直接 DOM 操作，补齐 Esc 与焦点管理） |
| **`AlertDialog`** | 第 2 批 · `radix-ui` `AlertDialog` | 居中模态二次确认弹窗（6px 半色调点阵遮罩、4.5% 底色压暗、硬阴影、**默认焦点落“取消”按钮**、确认钮用 `Button(danger)` 支持 `loading`） | `data-state="open"\|"closed"` | `--color-surface`、`--color-border-strong`、`--color-danger`、`--color-grid-line`、`--comp-backdrop-dot`、`--shadow-lg`、`--z-modal` | `window.confirm`（`DocumentsPage:113`）及 3 处不一致的双击确认（`TaskHeader:27`、`PeoplePanel:24`、`ProjPanel:33`） |
| **`Toast`** | 第 2 批 · `radix-ui` `Toast` | 语气：`neutral`（信息/完成，墨色+暖纸）、`danger`（拦截/错误，信号橙边框与标识）；支持**多条队列右下角叠放（最新在上）、各自独立计时自动消失与独立手动关闭** | `data-tone="neutral"\|"danger"`、`data-state="open"\|"closed"`、`role="status"` / `role="alert"` | `--color-surface`、`--color-surface-inverse`、`--color-border-strong`、`--color-danger`、`--shadow-lg`、`--z-toast` | `window.alert`（`BoardPage:35`、`TaskPage:55,61`）与短暂操作回执 |
| **`Badge`** | 第 3 批 · 原生 `<span>` | 变体：`solid`（墨底反白，完成/就绪/正常等常态强标识）、`outline`（纸底黑框）、`muted`（弱边灰字，规划中/编号/次要信息）、`accent`（橙底黑字，**仅用于逾期/阻塞等需注意状态**）；尺寸：`sm` / `md` | `data-variant`、`data-size` | `--color-surface-inverse`、`--color-text-inverse`、`--color-accent`、`--color-border`、`--color-border-strong`、`--font-size-2xs`、`--font-size-xs` | `.chip`、`.tag`、`.ds`、`.thr-late`、`.risk`、`.score` |
| **`Alert`** | 第 3 批 · 原生 `<div>` | 语气：`info`（**中性灰墨色** `--color-info-subtle`/`--color-info`）、`warning`（**信号橙**）、`danger`（**信号橙**）；变体：`inline` / `banner` | `data-tone`、`data-variant`、`role="alert"\|"status"` | `--color-text`、`--color-info`、`--color-info-subtle`、`--color-warning-text`、`--color-danger`、`--color-border-strong`、`--border-width-thin` | `.page-note.err`、`.issue-note`、`.auth-note`、`.ss .msg[.err]`、`.err.t-error` |
| **`Tabs`** | 第 3 批 · `radix-ui` `Tabs` | 默认单变体（方角平铺标签栏，支持组间 `Separator`） | `data-state="active"\|"inactive"`、`data-disabled` | `--color-surface-inverse`、`--color-text-inverse`、`--color-bg-subtle`、`--focus-ring` | `SettingDrawer` `.ov-tabs` |
| **`Progress`** | 第 3 批 · `radix-ui` `Progress` | 变体：`solid`（单段完成）、`dual`（时间斜纹+完成实心）、`segmented`（主段+超期/提前段） | `data-variant`、`data-state`、`aria-valuenow`/`min`/`max` | `--color-surface`、`--color-surface-inverse`、`--color-border-strong`、`--comp-pattern-warn` | `SummaryCard` `.gauge`、`ProgressPanel` `.pbar`、`ForecastHero` `.fbar` |
| **`Separator`** | 第 3 批 · `radix-ui` `Separator` | 变体：`single`（1.5px 实线）、`double`（抽屉/分区双线 2px+1.5px）、`masthead`（**页头标准分隔**，报刊粗细双横线 5px+1.5px）、`dashed`（1px 墨色虚线行/字段分割） | `data-variant`、`data-orientation` | `--color-border-strong`、`--border-width-thin`、`--border-width-thick`、`--border-width-hair` | `.vh`（`masthead`）、`.double`（`double`）、`.tsep` / 表单分割（`dashed`） |

## 3.3 基础组件 9 态强制覆盖规范（补齐审计缺口）

阶段 3 实现基础组件时**必须**逐项验证下表状态（`✓` 必做，`—` 不适用）：

| 组件 | `default` | `hover` | `active`（全站新增补齐） | `focus-visible` | `disabled` | `loading` | `invalid` | `selected` | `open` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `Button` | ✓ | ✓（`default`/`dashed`→`--color-bg-subtle`；`primary`→`--color-surface-inverse-hover`；`accent`→`--color-accent-text` 深橙底+反白字；`danger`→`--color-danger-subtle`；`link`→`--color-accent-text`） | ✓（`accent`→墨底反白；其余按压加深 + `translate(1px, 1px)`，零抖动） | ✓（`var(--focus-ring)`） | ✓（全变体统一中性灰处理：`default`/`primary`/`accent`/`danger` 为 `--color-bg-subtle` + `--color-text-faint` + `--color-border`；`dashed` 为 `--color-surface` + `--color-text-faint` 清晰虚线框与灰字；`link` 为透明底+灰字） | ✓（`data-loading` + `disabled` + `aria-busy` + 复用 `ui/Spinner`，原变体底色不退灰、宽高零抖动） | — | —（已移除，选中/切换统一迁往 `ToggleGroup` / `Switch`） | — |
| `Input` / `Textarea` | ✓ | ✓（边框升至 `--color-border-strong`） | — | ✓（下划线切 `--color-accent` 粗底线或全框 `--focus-ring`） | ✓（`underline` 变体为透明底 `transparent` + `--color-text-faint` 弱化点线 `dotted` 下划线与弱化字；`boxed` 变体为 `--color-bg-subtle` 浅灰底 + 虚线边 + `--color-text-faint` + `not-allowed`；`readOnly` 同步虚线底区分） | — | ✓（`[aria-invalid="true"]` 边框切 `--color-danger` + `aria-describedby`） | — | — |
| `Switch` | ✓ | ✓（非禁用底色切 `--color-bg-subtle`） | ✓（按压微暗/缩进反馈） | ✓（`var(--focus-ring)`） | ✓（`--color-bg-subtle` + `--color-text-faint` + `--color-border` + `not-allowed`） | ✓（`data-loading` + 双格/单轨文字 `visibility: hidden` 占位 + 绝对居中 `ui/Spinner`，宽度与正常态 100% 一致零抖动） | — | ✓（`track` 28×12 轨道内 8×8 方形滑块左右位移反色；`segmented` 实心反白） | — |
| `Checkbox` | ✓ | ✓（边框强化/浅底） | ✓（按压反色微调） | ✓（`var(--focus-ring)`） | ✓（含关联 `<label>` 同步 `not-allowed` 与弱化） | — | ✓（边框切 `--color-danger`） | ✓（`data-state="checked"`） | — |
| `ToggleGroup` | ✓ | ✓（未选项切 `--color-bg-subtle`） | ✓（按压态反馈） | ✓（`var(--focus-ring)`，外层可见不吞焦点） | ✓（弱化文字+浅灰底+虚线/灰边，修复原仅改光标问题） | — | — | ✓（`data-state="on"` 墨底反白） | — |
| `Tabs` | ✓ | ✓（非当前项切 `--color-bg-subtle`） | ✓ | ✓（`var(--focus-ring)`） | ✓ | — | — | ✓（`data-state="active"` 墨底反白） | — |
| `Select` | ✓ | ✓（触发器与选项悬浮） | ✓ | ✓（`var(--focus-ring)`） | ✓ | — | ✓（触发器边框 `--color-danger`） | ✓（选项勾选/橙框标识） | ✓（`data-state="open"` 边框高亮 + 箭头 180° 翻转） |
| `Popover` / `DropdownMenu` | ✓ | ✓（触发器与菜单项 `[data-highlighted]`） | ✓ | ✓（`var(--focus-ring)`） | ✓（菜单项 `[data-disabled]`） | — | — | ✓（当前项橙框标识） | ✓（触发器 `[data-state="open"]` 显式高亮 + 箭头翻转） |
| `Drawer` / `AlertDialog` | ✓ | — | — | ✓（焦点自动进入并锁定在弹窗内，关闭返回触发器；`AlertDialog` 默认落焦“取消”） | — | — | — | — | ✓（统一 `data-state="open"\|"closed"` 滑入/淡出动画） |

## 3.4 全站既有 `aria-pressed` 迁移清单（阶段 4 统一迁离 `Button`）

`Button` 不再承载 `selected` / `aria-pressed` 态。经全站扫描（排除 `src/dev/` 与 `src/components/ui/`），现有 **11 个 TSX 文件、13 处交互点** 均在阶段 4 迁往语义匹配的 `ToggleGroup` / `Switch` / `Badge`：

### A. 迁往 `ui/ToggleGroup`（10 处，覆盖 9 个组件）
| # | 文件路径与行号 | 所在组件 | 业务场景 | 模式 | 迁移目标 |
|---:|---|---|---|---|---|
| 1 | `src/pages/board/components/BoardHeader.tsx:37` | `BoardHeader` | 看板任务筛选（全部 / 我的 / 关键路径） | 单选 | `ToggleGroup(type="single", variant="segmented")` |
| 2 | `src/pages/timeline/components/TimelineHeader.tsx:36` | `TimelineHeader` | 时间线刻度切换（按周 / 按月） | 单选 | `ToggleGroup(type="single", variant="segmented")` |
| 3 | `src/pages/reports/components/ReportsHeader.tsx:42` | `ReportsHeader` | 燃尽图范围切换（本周 / 全周期） | 单选 | `ToggleGroup(type="single", variant="segmented")` |
| 4 | `src/pages/task/components/StatusChips.tsx:20` | `StatusChips` | 任务状态切换（含非法回退单项禁用） | 单选 | `ToggleGroup(type="single", variant="chips")` |
| 5 | `src/overlays/task/TaskDrawer.tsx:192` | `TaskDrawer` | 任务前置依赖多选 | **多选** | `ToggleGroup(type="multiple", variant="chips")` |
| 6 | `src/pages/collab/components/NewDiscussionDrawer.tsx:142, 154` | `NewDiscussionDrawer` | 发起讨论关联任务选择（含锁定禁用） | 单选 | `ToggleGroup(type="single", variant="chips")` |
| 7 | `src/pages/documents/components/UploadDocDrawer.tsx:207, 217` | `UploadDocDrawer` | 上传目标选择（新建 / 修订中文档；修复 `role="radio"` 混用） | 单选 | `ToggleGroup(type="single", variant="chips")` |
| 8 | `src/pages/members/components/InviteMemberDrawer.tsx:204, 212, 220` | `InviteMemberDrawer` | 邀请成员项目角色选择（修复 `role="radio"` 混用） | 单选 | `ToggleGroup(type="single", variant="chips")` |
| 9 | `src/overlays/settings/panels/PeoplePanel.tsx:205` | `PeoplePanel` | 人员详情系统账号类型选择（含 `disabled={isSelf}`） | 单选 | `ToggleGroup(type="single", variant="chips")` |
| 10 | `src/overlays/settings/panels/PeoplePanel.tsx:356` | `PeoplePanel`（`NewPersonForm`） | 新增人员系统账号类型选择 | 单选 | `ToggleGroup(type="single", variant="chips")` |

### B. 迁往 `ui/Switch` 或可移除标签（3 处，不归 `Button`）
| # | 文件路径与行号 | 所在组件 | 业务场景与原形态 | 迁移目标 |
|---:|---|---|---|---|
| 11 | `src/overlays/settings/Switch.tsx:20, 27` | `Switch` | 账号状态“启用/停用”双格切换 | `ui/Switch(variant="segmented")`（Radix `role="switch"` + `aria-checked`） |
| 12 | `src/pages/members/components/PermToggle.tsx:24` | `PermToggle` | 成员权限“有/无”单轨开关（清除冗余 `aria-pressed`） | `ui/Switch(variant="track")` |
| 13 | `src/overlays/settings/panels/MePanel.tsx:136` | `MePanel` | 个人技能标签点击移除（恒 `true`，非切换态） | 阶段 4 改用 `ui/Badge` + 移除按钮 |

*(另：`login.css:173` `.auth-demo-grid` 与 `index.css:2077` `.lab` 的 2 处死 CSS 选择器随阶段 4 旧样式清理。)*

---

# 第四层：业务范式组件规范（`src/components/patterns/`）

## 4.1 与 `ui/` 及 `features/` 的分层边界与落位节奏
- **落位节奏**：**阶段 3 仅封装 `components/ui/` 基础组件**（配合 `/dev/ui` 仅开发环境样式手册页验证风格与交互态）；**`components/patterns/` 在阶段 4 迁移到首个用到它的业务模块时再按需创建**，避免脱离真实页面空转抽象。
- **单向依赖铁律**：`features/*` → `components/patterns/*` → `components/ui/*` → `styles/tokens/*`。
- **范式层红线**：
  - `patterns/` 只组合 `ui/` 与布局/交互骨架，**严禁调用 `services/*`（原 `src/api/*`）发请求**，**严禁直接读取业务 `stores/*`**（如 `useAccess`、`useIssue`、`useTaskStore`、`useProject`、`useAuth`）。
  - 所有业务数据（含 `today`、权限布尔值、选项列表）和异步回调一律由上层 `features/*` 通过 props 传入。
  - 各 `features/<域>` 之间禁止互引；跨领域复用界面结构一律上收至 `patterns/`。

## 4.2 `components/patterns/` 组件登记表（共 14 项，全部待建）

> 依据阶段 3.5 自定义组件盘点与用户拍板决策（详见 [`custom-components.md`](./custom-components.md)）：
> - **仅被 ≥ 2 个模块复用的组合才进入 `components/patterns/`**；原草案中仅单模块使用的 `AppShell`（`layout`）、`AssigneePicker`（`tasks`）、`MentionInput`（`collab`）、`FileDropzone`（`documents`）已移出 `patterns/`，保留在对应模块内部。
> - **阶段进度条外层核查结论**：`WeekLine`、`SummaryCard`、`ProgressPanel`、`ForecastHero` 4 处外层包装各不相同且均仅出现 1 次，维持各自直接复用 `ui/Progress`，不新建 `patterns`。
> - **全程 0 新增第三方依赖**；`LoadBar` 与 `HeroCard` 在阶段 4 统一时须截修改前后对比图确认；第 9 步拆为 `9a (features/tasks)` 与 `9b (features/tasks-board)`（`useCardDrag` 4 处缺陷按每处独立提交修复并提供手动拖拽验收步骤）。

| 范式组件 | 状态与建立时机 | 组合/底层方案 | 职责与核心 Props 契约 | 替换旧实现 |
|---|---|---|---|---|
| **`PageHeader`** | **待建** · 阶段 4 第 2 步（`layout`） | `ui/Button`、`ui/Separator(masthead)` | 报纸双线页头：`kicker`、`breadcrumb?`、`title`、`accentTitle?`、`subtitle?`、`size="default" \| "compact"`、`actions?`；`default` 用 `--font-size-display`（60px），窄屏（`≤900px`）及详情页 `compact` 切 `--font-size-display-sm`（44px） | 11 处 `.vh`（8 页标准 Header + `TaskHeader` + `NoProject` + `NoAccess`；`LoginPage` 保持独立轻页头，同样使用 `ui/Separator(masthead)`） |
| **`Panel`** | **待建** · 阶段 4 第 2 步（`layout`） | `ui/Separator` + CSS Modules | 面板容器：`variant="default" \| "flat" \| "dark"`、`kicker`（`// WORD`）、`title`、`headerRight?`、`scrollable?`；支持一屏内联滚动 | 20+ 处 `.pnl`/`.phd` 与文档页 `.dsec`/`.dsec-h` |
| **`FormDrawer`** | **待建** · 阶段 4 第 2 步（`projects`） | `ui/Drawer(md)`、`ui/Button`、`ui/Separator(double)`、`ui/Alert` | 表单抽屉标准外壳：`open`、`onOpenChange`、`title`、`accentTitle?`、`submitLabel`、`submitting`、`submitError?`、`onSubmit`、`children` | 5 个表单抽屉（`NewProjectDrawer`、`TaskDrawer`、`UploadDocDrawer`、`InviteMemberDrawer`、`NewDiscussionDrawer`） |
| **`EmptyState` / `PageState`** | **待建** · 阶段 4 第 2 步（`layout`） | `ui/Alert`、`ui/Button`、`ui/Spinner` | `EmptyState` 统一面板/列表空态；`PageState` 统一页面级 `loading` / `missing`（往期无存档）/ `error`（可带重试按钮） | `NoProject`、`NoAccess`、6 种零散空态类、4 页重复 `missing`/`error` 分支 |
| **`ActionPopover`** | **待建** · 阶段 4 第 2 步（`layout`） | `ui/Popover`、`ui/Button`、`ui/Badge` | 统一带刊头计数、可滚动列表、空态与底部操作槽的 `.issues` 浮层壳 | `ProjectSwitch`、`IssueSwitch`、`NotificationBell` 3 处 `.issues` 外壳 |
| **`SearchDropdown`** | **待建** · 阶段 4 第 3 步（`settings`） | `ui/Popover`、`ui/Input`、`ui/Spinner` | 公共下拉搜索组合：`variant="line" \| "box"`、`toggle?`、`openOn`、`loading`、`footer?`、完整 WAI-ARIA `combobox`/`listbox` 键盘导航（0 新增依赖） | `shared/components/SearchDropdown`（`PeoplePanel`、`InviteMemberDrawer`、`DocumentHeader`、`UploadDocDrawer`、`AssigneePicker` 5 处；原 `SearchInput` 仅剩 `CrewLabels` 1 处，改直接用 `ui/Input(boxed)`） |
| **`ConfirmDialog`** | **待建** · 阶段 4 第 3 步（`settings`） | `ui/AlertDialog`、`ui/Button(danger)` | 破坏性操作二次确认范式：`title`、`description`、`confirmLabel`（明确动词）、`loading`、`onConfirm`；默认焦点在“取消” | `window.confirm` 与 3 处双击确认逻辑 |
| **`Legend`** | **待建** · 阶段 4 第 4 步（`reports`） | 纯展示组件（对齐 `ui/Badge` 风格） | 数据驱动图例条：`items: { key, label, kind: "solid" \| "outline" \| "dashed" \| "hatch" \| "accent" }[]`，消除手写 `<i>` 与内联 style | 6 处 `.legend`（`Overview`、`Timeline`、`Documents`、`Reports`） |
| **`HeroCard`** | **待建** · 阶段 4 第 4 步（`reports`） | `ui/Badge`（仅共享外壳与顶栏） | 强调卡外壳：`tone="alert" \| "calm"`、`kicker?`、`title?`、`badge?`、`children`、`footer?`；主体业务内容由各模块自行组合 | `HeadlinePanel`、`ForecastHero`、`DocumentDetailHero` 3 处外框与 `.hk` 顶栏 |
| **`LoadBar`** | **待建** · 阶段 4 第 4 步（`reports`） | `ui/Progress(solid, striped, thresholdPercent)` | 工时负载轨道：`variant="detailed" \| "compact"`、`hours`、`capacity`、`scale`；内置 `role="meter"` + 上限虚线 + 超载斜纹 | `MemberLoad`、`SelfLoad`、`LoadRow`、`AssigneePicker.LoadMeter`（4 处） |
| **`ListRow`** | **待建** · 阶段 4 第 5 步（`members`） | 原生 `<button>`/`<Link>` + `ui/Badge` | 统一可点击跳转/选中列表行：`density="compact" \| "comfortable"`、`leading?`、`title`、`meta?`、`trailing?`、`selected?`、`tone?` | `DependencyRow`、`LinkRow`、`TodoPanel` 项、`BlockedBy` 项、`SelfTasks` 项、`ThreadItem` |
| **`ActivityFeed`** | **待建** · 阶段 4 第 5 步（`members`） | `Panel` + 时间线列表 | 统一时间线/日志列表：`items`、`surface="light" \| "dark"`、`activeId?`、`onSelect?`；消除 `.feed`/`.ev` 冲突（`LogsPanel` 4 列按日表保持独立） | `TaskLogPanel`、`ActivityFeedPanel/Item`、`PermLog`/`SelfLog`/`PermLogItem` |
| **`TaskBar`** | **待建** · 阶段 4 第 7 步（`timeline`） | 保留现有手写实现（剥离 `useIssue()`） | 任务计划/实际/阻塞/逾期/完成时间条：**必传 `today: string`**，`variant="full" \| "compact"`，支持共享 `range` | `shared/components/TaskBar.tsx`（供 `timeline` 与 `tasks` 复用） |
| **`MetricStrip`** | **待建** · 阶段 4 第 8 步（`overview`） | `ui/Badge` + 4 格 KPI 网格 | 4 格 KPI 指标条（`MetricCard`）：首格反白、`label`、`value`（`--font-size-figure`）、`unit?`、`sub?`、`tone="default" \| "alert"`、`badge?` | `overview/{FigureStrip,Figure}` + `task/{TaskFigures,FigureItem}` |

## 4.3 单模块内部自定义组件归属（不进入 `patterns/`）

仅单一模块使用的自定义组件保留在各自 `features/<域>/` 或 `layout/` 内，详见 [`custom-components.md`](./custom-components.md) 第二节 B 表：
- `layout`：`AppShell`、`NavIcon`、`SidebarNav`、`SummaryCard`、`WeekLine`、`AccountMenu`
- `features/auth`：`LoginHeader`
- `features/settings`：`SettingsPanelShell`、`LogsPanel`（4 列按日表）及各配置面板
- `features/reports`：`BurndownChart`、`WeeklyBarChart`、`DeviationChart`
- `features/members`：`MemberCrewMatrix`
- `features/documents`：`FileDropzone`（内部自治拖拽上传，文案不变）、`DocumentRevisingTimeline`
- `features/timeline`：`GanttChart`、`CriticalPathTable`
- `features/overview`：`MemberScheduleBoard`（精确到此刻今天线）、`CriticalChainPanel`
- `features/tasks`：`AssigneePicker`（`patterns/SearchDropdown` + `patterns/LoadBar` + `ui/Badge` + `assignee.ts`）、`DraggableBoard`（`TaskCard` + 保留手写 `useCardDrag`）
- `features/collab`：`MentionInput`、`MessageItem`

---

# 第五层：使用决策规范（Do / Don't）

## 5.1 色彩与视觉重心
- **Do**：每个视图中信号橙（`--color-accent`）实心视觉重心**尽量只有一处**（例如仅一个 `Button[data-variant="accent"]` 或一个风险态 `HeroCard`），其余次要/常规主操作用 `default` / `primary`（墨黑）承接。
- **Don't**：不要在同一个视图同时放置多个橙底实心按钮、橙底卡片与成片橙色徽标，稀释主操作与风险警示焦点。
- **Do**：组件按业务用途引用分开命名的语义 Token——主强调引用 `--color-accent`，错误/破坏性操作引用 `--color-danger`，阻塞/逾期引用 `--color-warning`（即使当前浅色下均映射到信号橙）。
- **Don't**：严禁在组件或模块 CSS 中直接写 `--gray-*`、`--signal-*` 原始色板或硬编码 hex / `rgba()`（SVG `<mask>` 逻辑黑白除外）。
- **Do**：`success`（完成/正常）与 `info`（一般信息/系统动态）统一用**墨色（`--color-success`）或中性灰（`--color-info`）**表达，延续暖纸黑白 + 单信号橙美学。
- **Don't**：严禁引入绿色、黄色、蓝色等任何新色相来区分成功、警告或信息。

## 5.2 破坏性操作与用户反馈
- **Do**：破坏性操作（删除任务、删除账号、归档项目、定稿锁定）依靠**明确动词文案 + 图标/后果说明 + `ConfirmDialog`（Radix `AlertDialog`）二次确认**来与普通操作区分，不靠新颜色区分；弹窗默认焦点落在“取消”按钮。
- **Don't**：不要另设暗红等新色区分破坏性操作；严禁使用原生 `window.confirm` / `window.alert`；严禁继续使用“失焦取消”或“无取消按钮”的双击按钮模式。
- **Do**：**短暂结果反馈与操作拦截**（如“文档未定稿不可完成任务”、“已保存”、“导出成功”）使用 `Toast`；**需要用户处理/修正才能继续的错误**（表单字段校验、登录失败、页面无存档/加载失败）使用**行内提示**（`ui/Field` 错误文本 + `aria-invalid="true"`，或页面内 `Alert` / `PageState`）。
- **Don't**：不要把表单字段校验错误塞进自动消失的 `Toast`；不要只在表单底部报文字错误而不给出错输入框设置 `aria-invalid="true"`。

## 5.3 状态覆盖、交互自治与无障碍
- **Do**：所有可交互组件必须完整覆盖适用状态，特别是全站补齐 `:active` 按压态、`:focus-visible` 焦点环（`--focus-ring`）、`disabled` 视觉弱化与 `loading` 防连点；状态切换仅通过 `data-*` 属性切换语义 Token，不引起布局抖动。
- **Don't**：禁止字符串拼接状态/变体 class（如 `` `btn ${primary ? "primary" : ""}` ``）；禁止给禁用态只改 `cursor: default` 而不做视觉弱化。
- **Do**：控件自身交互逻辑必须收归组件内部（如 `FileDropzone` 内部自行处理 `dragover`/`dragleave`/`drop` 并保持文案不变，`Drawer` 内部由 Radix `Dialog` 管理 Portal/Esc/焦点陷阱）。
- **Don't**：严禁把组件拖放/关闭等交互委托到外层表单、旧原型脚本或直接操作 `#shell` DOM。
- **Do**：所有可点击项必须使用原生 `<button type="button">` 或 `<Link>` / `<a href>`；隐藏原生 `<input>`（如文件选择、选项）时外层容器必须提供 `:focus-within` 可见焦点环；使用 `ToggleGroup` 保证单选/多选 ARIA 语义准确。
- **Don't**：严禁给 `<div>`/`<span>`/`<b>`/`<article>` 或无 `href` 的 `<a>` 仅绑 `onClick`（阶段 4 迁移时须将 `TodoPanel`、`BlockedBy`、`TaskCard`、`HeadlinePanel`、`DocumentDetailFacts`、`ThreadTaskMeta` 全部改为原生语义控件或完整键盘交互）；严禁在 `role="radio"` 上写 `aria-pressed`。

## 5.4 分层、样式与工程规范
- **Do**：严格遵守单向依赖 `features → patterns → ui`，`features` 间不互引；组件内禁止直接调用 `services/*`，数据与写操作经由 `stores/` 或页面容器编排后通过 props 传入；本次仅定义浅色 Token 值，并确保结构上支持 `[data-theme="dark"]` 仅覆写语义层扩展。
- **Don't**：禁止在 `components/ui/` 或 `components/patterns/` 中 import `useAccess`/`useIssue`/`useTaskStore` 或 `src/api/*`；禁止在样式中写入 `10px`/`14px` 等非基准间距（严格按 4px 基准与仅有的 `2px`/`6px` 两个半步对齐）或给非圆形元素加圆角。
- **Do**：动效仅保留功能性反馈，统一使用 `--duration-fast`/`--duration-normal` + `--ease-standard` 与 `prefers-reduced-motion`；删除 `.enter`/`.first` 与 8 个死 `@keyframes`；通过 `package.json` 的 `check` 脚本统一执行 `eslint + stylelint + tsc + knip`（不配置 husky）；`frontend/prototype/` 在文档模块将拖拽上传收归 `FileDropzone` 之前保留作为参考实现。
- **Don't**：不要为尚未出现的业务需求提前抽象通用组件或多余变体。

---

## 附录：目标样式目录与工程检查约定

### A. 样式文件分层与加载顺序（阶段 2 落位）
> **纯净度红线**：`src/styles/tokens/*.css` **只能包含 CSS 自定义属性定义**（`:root` 及预留 `[data-theme="dark"]`），禁止写入任何普通选择器或非 `--*` 声明（`color-scheme: light`、`prefers-reduced-motion` 等统一归入 `base.css`）。`roles.css` 不再作为长期全局样式层，仅在迁移期过渡保留，全站迁移完成后删除。

```text
frontend/src/styles/
├── tokens/
│   ├── primitives.css   # Level 1 原始色板（仅 CSS 变量；禁止组件/业务直接引用）
│   ├── semantic.css     # Level 2 语义色（仅 CSS 变量；浅色默认，预留 [data-theme="dark"]）
│   ├── components.css   # Level 3 确有必要的组件色与斜纹/遮罩纹理（仅 CSS 变量，仅引语义色）
│   ├── layout.css       # 间距、圆角、描边、阴影、层级、焦点环（仅 CSS 变量）
│   ├── typography.css   # 字体族、字号、字重、行高、字距（仅 CSS 变量）
│   └── motion.css       # 动效时长与缓动（仅 CSS 变量）
├── base.css             # Reset、:root color-scheme、body 基础排版、:focus-visible、.sr-only、prefers-reduced-motion
├── main.css             # 统一入口：严格按 tokens/*.css → base.css → 过渡旧样式顺序导入
├── index.css            # [过渡旧样式，阶段 4 迁完删除] 含旧变量兼容别名映射与尚未迁出的旧全局类
└── typography/roles.css # [过渡旧样式，阶段 4 迁完删除] 11 个 .t-* 角色类按 2.5 E 逐一迁入组件
```

### B. 阶段 2–3 质量门禁与开发环境样式手册约定（替代 husky）
- **开发依赖（阶段 2 已安装）**：`stylelint`、`stylelint-config-standard`、`stylelint-declaration-strict-value`、`knip`（**不安装 `husky` / `lint-staged`**）；
- **运行时依赖（阶段 3 按需安装）**：`radix-ui`（单包按需具名导入，留待阶段 3 封装首个 Radix 组件时安装，避免触发 `knip` 未使用依赖报错）；
- **单文件与单函数体量门禁（不含空行与注释）**：
  - `.tsx` / `.ts`（覆盖 `src/components/**`、`src/dev/**`、`src/features/**`、`src/services/**`、`src/stores/**`）：单文件有效行数建议 **≤ 150 行**、硬上限 **250 行**（ESLint `max-lines`），单函数有效行数 **≤ 80 行**（ESLint `max-lines-per-function`）；
  - `.module.css` / `base.css` / `tokens/*.css`：单文件有效行数建议 **≤ 150 行**、硬上限 **250 行**（由 `scripts/check-css-lines.mjs` 强制校验）；超过建议值按职责拆分子组件、hooks 或样式分片。
- **门禁脚本**：在 `frontend/package.json` 配置 `lint`（`eslint .`）、`lint:css`（`stylelint "src/**/*.css"`）、`lint:lines`（`node scripts/check-css-lines.mjs`）、`typecheck`（`tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.node.json --noEmit`）、`knip`（`knip`）与聚合脚本 `check`（`pnpm lint && pnpm lint:css && pnpm lint:lines && pnpm typecheck && pnpm knip`），使每次提交与模块迁移均可一键校验依赖方向、Token 红线、文件体量、类型安全与死代码。
- **开发环境样式手册（`/dev/ui`）**：在 `src/dev/UiShowcasePage.tsx` 提供长期保留的组件样式手册，仅通过 `import.meta.env.DEV` + 懒加载挂在免登录路由 `/dev/ui`，生产构建（`pnpm build`）彻底 tree-shake 排除；其样式（`src/dev/**/*.module.css`）同样受 Stylelint 严格 Token 规则约束。
- **遗留参考文件**：`frontend/prototype/`（及 `tsconfig.app.json:25` 引用）在文档模块完成 `FileDropzone` 拖拽上传收归之前保留作为参考实现，并在 `knip.json` 中忽略 `prototype/**`。
