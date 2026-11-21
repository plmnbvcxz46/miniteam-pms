# 前端设计与架构审计报告（阶段 0）

> **审计范围**：`frontend/`（只读静态扫描，未改动任何业务源码）
> **基线信息**：分支 `refactor/design-system`（切自 `main` 提交 `7e7faa3`，已打回滚标签 `pre-refactor`）
> **目标架构参考**：三层色彩 + 4px 基准 Design Tokens、Radix UI 无样式原语（`components/ui/`）、业务范式组件（`components/patterns/`）、按业务域收敛的 `features/` 与 `services/` / `stores/` 单向分层。

---

## 0. 项目现状概览

### 0.1 技术栈与关键依赖版本

来自 `frontend/package.json`：

| 类别 | 包名与版本 | 说明 |
|---|---|---|
| 核心框架 | `react` `^19.3.1`、`react-dom` `^19.3.1` | React 19 |
| 路由 | `react-router-dom` `^7.18.4` | 静态路由导入，无代码分割 |
| 语言与构建 | `typescript` `~6.0.3`、`vite` `^8.3.5`、`@vitejs/plugin-react` `^6.1.2` | `pnpm build` = `tsc -b && vite build` |
| 代码规范 | `eslint` `^10.13.0`、`typescript-eslint` `^8.72.1`、`prettier` `^3.9.10` | 尚未配置 `stylelint`、`knip`、`husky` / `lint-staged` |
| UI 组件库 | **无** | 全部控件与浮层手写，计划引入 Radix UI 原语 |

### 0.2 `frontend/src/` 目录与文件规模

全量统计 `frontend/src/` 下共 **222 个文件、21,275 行有效代码**（按非尾随空行计）：

| 类型 | 文件数 | 行数 | 说明 |
|---|---:|---:|---|
| `.tsx` | 122 | 10,577 | 113 个 UI/页面组件 + 2 个入口（`App.tsx` / `main.tsx`）+ 7 个状态 Provider |
| `.ts` | 60 | 4,282 | API 封装、Store、纯函数工具、常量、类型定义 |
| `.css` | 40 | 6,416 | 全为全局样式（无 CSS Modules），其中 `styles/index.css` 占 2,415 行（37.6%） |
| **合计** | **222** | **21,275** | |

按一级目录分布：

| 目录 | 总文件数 | `.tsx` | `.ts` | `.css` | 行数 |
|---|---:|---:|---:|---:|---:|
| `src/` 根目录 | 2 | 2 | 0 | 0 | 90 |
| `src/api/` | 9 | 0 | 9 | 0 | 416 |
| `src/layout/` | 15 | 10 | 5 | 0 | 968 |
| `src/overlays/` | 13 | 10 | 3 | 0 | 2,134 |
| `src/pages/`（9 个页面模块） | 135 | 91 | 9 | 35 | 11,569 |
| `src/shared/` | 21 | 2 | 18 | 1 | 2,023 |
| `src/state/` | 23 | 7 | 16 | 0 | 1,496 |
| `src/styles/` | 4 | 0 | 0 | 4 | 2,579 |

### 0.3 Git 基线与文档存放位置说明

- **Git 基线**：在干净的 `main`（`7e7faa3` `Merge pull request #36 from plmnbvcxz46/fix/today-end-of-day`）上创建回滚标签 `pre-refactor`，并切出本次重构主分支 `refactor/design-system`。
- **文档位置说明**：本仓库为 Monorepo（含 `frontend/`、`backend/`、`docs/`、`deploy/`），根 `AGENTS.md` 规定前端任务仅操作 `frontend/`。本审计报告当前存放于 `frontend/audit.md`；后续阶段产生的设计系统文档（如 `design-system.md` / `migration-plan.md`）是否统一放在 `frontend/` 下还是移至 `docs/`，已列入第 7 节由用户拍板。

---

## 1. 组件清单与功能重复组件分组

### 1.1 React 组件完整清单

统计范围：`src/shared/components/`、`src/layout/`、`src/overlays/`、`src/pages/`，共 **113 个 `.tsx` 组件文件**（不含 `src/App.tsx`(80 行)、`src/main.tsx`(9 行) 与 `src/state/*Provider.tsx` 7 个状态提供者）。复杂度按行数与交互逻辑分为：低（<60 行纯展示）、中（60–150 行或含局部状态）、高（>150 行或含复杂表单/浮层/图表/拖拽）。

#### A. `src/shared/components/`（2 个）
| 路径 | 职责 | 行数 | 复杂度 | 备注（私有子组件） |
|---|---|---:|---|---|
| `src/shared/components/Drawer.tsx` | Portal 抽屉壳（遮罩 + dialog 容器 + `#shell.dim` 切换） | 38 | 低 | 无 Esc 关闭与焦点陷阱 |
| `src/shared/components/TaskBar.tsx` | 任务进度/阻塞/逾期/完成时间条（支持 `compact` 与共享时间轴） | 145 | 高 | 含内部 `DueMark`；反向依赖 `useIssue()` |

#### B. `src/layout/`（10 个）
| 路径 | 职责 | 行数 | 复杂度 | 备注 |
|---|---|---:|---|---|
| `src/layout/Shell.tsx` | 全局主框架（侧栏、顶栏、Outlet、设置/新建项目/任务抽屉托管） | 119 | 中 | 聚合全局 overlay 开关 |
| `src/layout/NoProject.tsx` | 无可用项目时的空态占位页（带新建项目按钮） | 27 | 低 | 复用 `.vh` + `.pnl` |
| `src/layout/sidebar/NavIcon.tsx` | 16×16 侧边栏双层 SVG 图标映射 | 67 | 低 | 8 个固定图标 |
| `src/layout/sidebar/ProjectSwitch.tsx` | 侧栏项目切换器下拉浮层（列表 + 新建项目入口） | 100 | 中 | `useDismiss` + `.issues.projs` |
| `src/layout/sidebar/SidebarNav.tsx` | 侧栏分组导航链接（阻塞徽标 + 系统管理触发器） | 51 | 低 | `NavLink` + `<a>` |
| `src/layout/sidebar/SummaryCard.tsx` | 侧栏底部项目周期与完成率双层进度卡 | 41 | 低 | `.gauge` 双层条 |
| `src/layout/topbar/AccountMenu.tsx` | 顶栏账号菜单浮层（当前账号、个人资料、退出登录） | 91 | 中 | `useDismiss` + `.issues.accts` |
| `src/layout/topbar/IssueSwitch.tsx` | 顶栏期号/往期归档切换浮层（含“回到今天”与快照错误条） | 90 | 中 | `useDismiss` + `.issues` |
| `src/layout/topbar/NotificationBell.tsx` | 顶栏通知铃铛图标与未读/历史通知浮层 | 131 | 中 | `useDismiss` + `.issues.notes` |
| `src/layout/topbar/WeekLine.tsx` | 顶栏项目按周格子进度条 | 41 | 低 | `.weeks` 网格 |

#### C. `src/overlays/`（10 个）
| 路径 | 职责 | 行数 | 复杂度 | 备注（私有子组件） |
|---|---|---:|---|---|
| `src/overlays/project/NewProjectDrawer.tsx` | 新建项目表单抽屉 | 150 | 中 | `.ov.fx` + `.fr` 表单 |
| `src/overlays/settings/SettingDrawer.tsx` | 系统设置多标签抽屉壳（5 个分区按权限过滤） | 108 | 中 | `.ov.drawer` + `.ov-tabs` |
| `src/overlays/settings/Switch.tsx` | 两格反白开关（启用/停用、开/关） | 34 | 低 | `.sw2` 双按钮 |
| `src/overlays/settings/panels/LogsPanel.tsx` | 操作日志按日分组列表与分页加载更多 | 86 | 中 | 内联调 `logApi.list` |
| `src/overlays/settings/panels/MePanel.tsx` | 个人资料编辑（姓名/邮箱/技能标签）+ 修改密码 | 283 | 高 | 含内部 `PasswordForm` |
| `src/overlays/settings/panels/ParamsPanel.tsx` | 系统参数配置表单（优先级权重/系数/工时上限） | 159 | 中 | 含内部 `ParamsForm`、`NumberRow` |
| `src/overlays/settings/panels/PeoplePanel.tsx` | 人员名册搜索、详情编辑（角色/启停/重置/删除）与新增人员 | 375 | 高 | 含内部 `NewPersonForm` |
| `src/overlays/settings/panels/ProjPanel.tsx` | 当前项目信息编辑与归档（二次点击确认） | 202 | 高 | `.srow` 表单 |
| `src/overlays/task/AssigneePicker.tsx` | 负责人可搜索下拉选择器（技能高亮、推荐标记、负载条、键盘导航） | 272 | 高 | 含内部 `LoadMeter` |
| `src/overlays/task/TaskDrawer.tsx` | 新建/编辑任务表单抽屉（负责人、排期、前置任务芯片） | 226 | 高 | `.ov.fx` + `AssigneePicker` |

#### D. `src/pages/`（91 个，按 9 个页面模块分组）

**1. `pages/login/`（1 个）**
| 路径 | 职责 | 行数 | 复杂度 |
|---|---|---:|---|
| `src/pages/login/LoginPage.tsx` | 登录/注册切换表单（含记住账号、字段级 `aria-invalid` 校验） | 212 | 高 |

**2. `pages/overview/`（10 个）**
| 路径 | 职责 | 行数 | 复杂度 |
|---|---|---:|---|
| `src/pages/overview/OverviewPage.tsx` | 项目日报总览页容器与状态编排 | 121 | 中 |
| `src/pages/overview/components/OverviewHeader.tsx` | 总览页头（统计 kicker + 新建任务按钮） | 28 | 低 |
| `src/pages/overview/components/FigureStrip.tsx` | 4 格 KPI 指标条容器 | 41 | 低 |
| `src/pages/overview/components/Figure.tsx` | 单格 KPI 卡片（含风险态） | 20 | 低 |
| `src/pages/overview/components/HeadlinePanel.tsx` | 风险/正常头条强调卡（阻塞任务标签 + 跳转） | 60 | 中 |
| `src/pages/overview/components/TodoPanel.tsx` | 今日待办列表面板（最多 4 行溢出折叠） | 50 | 低 |
| `src/pages/overview/components/SchedulePanel.tsx` | 本周成员排期面板（周表头 + 今日时刻线） | 75 | 中 |
| `src/pages/overview/components/ScheduleRow.tsx` | 单成员多泳道排期任务条 | 52 | 中 |
| `src/pages/overview/components/CriticalChainPanel.tsx` | 深色关键路径链条与预测完工面板 | 65 | 中 |
| `src/pages/overview/components/ProgressPanel.tsx` | 项目总体完成率与双段进度条面板 | 39 | 低 |

**3. `pages/board/`（5 个）**
| 路径 | 职责 | 行数 | 复杂度 |
|---|---|---:|---|
| `src/pages/board/BoardPage.tsx` | 4 列任务看板容器、筛选暗化与拖拽浮层 Portal | 125 | 高 |
| `src/pages/board/components/BoardHeader.tsx` | 看板页头（3 态分段筛选 + 新建任务按钮） | 52 | 低 |
| `src/pages/board/components/BoardColumn.tsx` | 看板单状态列（列头、拖拽占位符、附加槽位） | 79 | 中 |
| `src/pages/board/components/TaskCard.tsx` | 可拖拽/点击任务卡片（含内部 `CardDue`、优先级分、`TaskBar`） | 82 | 中 |
| `src/pages/board/components/BlockedBy.tsx` | 阻塞列底部“阻塞源任务”快捷跳转区 | 23 | 低 |

**4. `pages/task/`（11 个）**
| 路径 | 职责 | 行数 | 复杂度 |
|---|---|---:|---|
| `src/pages/task/TaskPage.tsx` | 任务详情页容器（路由参数解析、权限拦截、操作回调） | 99 | 中 |
| `src/pages/task/components/TaskHeader.tsx` | 任务详情页头（返回/面包屑、元信息、状态芯片、编辑/二次确认删除） | 89 | 中 |
| `src/pages/task/components/StatusChips.tsx` | 任务 4 状态单选芯片组（禁用非法回退） | 32 | 低 |
| `src/pages/task/components/TaskFigures.tsx` | 任务详情 4 格 KPI 条 | 26 | 低 |
| `src/pages/task/components/FigureItem.tsx` | 任务详情单格 KPI 卡（带 unit 单位） | 23 | 低 |
| `src/pages/task/components/SchedulePanel.tsx` | 任务排期 `TaskBar` 与前驱/后继依赖列表面板 | 50 | 低 |
| `src/pages/task/components/TaskInfoPanel.tsx` | 任务说明 + 关联文档/讨论列表与快捷入口 | 80 | 中 |
| `src/pages/task/components/DependencyRow.tsx` | 前置/后续任务跳转行 | 23 | 低 |
| `src/pages/task/components/LinkRow.tsx` | 关联文档/讨论跳转行 | 26 | 低 |
| `src/pages/task/components/TaskLogPanel.tsx` | 深色任务操作记录滚动面板 | 28 | 低 |
| `src/pages/task/components/NoAccess.tsx` | 任务无查看权限占位页 | 27 | 低 |

**5. `pages/timeline/`（8 个）**
| 路径 | 职责 | 行数 | 复杂度 |
|---|---|---:|---|
| `src/pages/timeline/TimelinePage.tsx` | 时间线与关键路径页容器 | 96 | 中 |
| `src/pages/timeline/components/TimelineHeader.tsx` | 时间线页头（按周/按月刻度分段 + 新建任务） | 51 | 低 |
| `src/pages/timeline/components/GanttPanel.tsx` | 甘特图面板（ResizeObserver 动态日宽、参考竖线、预测角标） | 166 | 高 |
| `src/pages/timeline/components/GanttAxis.tsx` | 甘特图周/日双层横轴刻度 | 52 | 低 |
| `src/pages/timeline/components/GanttDeps.tsx` | 甘特图任务间 SVG 折线与箭头依赖层 | 81 | 中 |
| `src/pages/timeline/components/GanttRow.tsx` | 甘特图单行（左吸顶任务名按钮 + 右 `TaskBar`） | 45 | 低 |
| `src/pages/timeline/components/CriticalPanel.tsx` | CPM 关键路径计算表格面板 | 46 | 低 |
| `src/pages/timeline/components/CriticalRow.tsx` | CPM 单任务行（ES/EF/LS/LF/总时差） | 21 | 低 |

**6. `pages/documents/`（13 个）**
| 路径 | 职责 | 行数 | 复杂度 |
|---|---|---:|---|
| `src/pages/documents/DocumentsPage.tsx` | 项目文档页容器（搜索、分栏联动、定稿/下载/上传编排） | 221 | 高 |
| `src/pages/documents/components/DocumentHeader.tsx` | 文档页头（统计 kicker + 搜索框 + 上传按钮） | 66 | 中 |
| `src/pages/documents/components/DocumentRevising.tsx` | 修订中文档时间轴列表容器（listbox） | 71 | 中 |
| `src/pages/documents/components/DocumentRevisingHeader.tsx` | 修订中区头部（含配置化图例与计数） | 36 | 低 |
| `src/pages/documents/components/DocumentRevisingItem.tsx` | 修订中单文档行（含内部 `TimelineBar` 时间条、状态徽标） | 113 | 中 |
| `src/pages/documents/components/DocumentFinal.tsx` | 已定稿文档双列网格容器（listbox） | 41 | 低 |
| `src/pages/documents/components/DocumentFinalHeader.tsx` | 定稿区头部（标题与计数） | 18 | 低 |
| `src/pages/documents/components/DocumentFinalItem.tsx` | 已定稿单文档选项卡片 | 41 | 低 |
| `src/pages/documents/components/DocumentDetail.tsx` | 右侧文档详情栏容器（空态、详情块、上传/定稿操作） | 85 | 中 |
| `src/pages/documents/components/DocumentDetailHero.tsx` | 文档详情顶部版本/逾期 Hero 卡 | 50 | 低 |
| `src/pages/documents/components/DocumentDetailFacts.tsx` | 文档属性 `<dl>` 列表（含可点关联任务） | 41 | 低 |
| `src/pages/documents/components/DocumentDetailHistory.tsx` | 版本历史列表与附件下载按钮 | 76 | 中 |
| `src/pages/documents/components/UploadDocDrawer.tsx` | 上传文档/新版本抽屉（含内部 `UploadDocForm`、文件校验） | 292 | 高 |

**7. `pages/collab/`（12 个）**
| 路径 | 职责 | 行数 | 复杂度 |
|---|---|---:|---|
| `src/pages/collab/CollabPage.tsx` | 团队协作三栏页容器（草稿会话、定位闪烁、发起讨论） | 339 | 高 |
| `src/pages/collab/components/CollabHeader.tsx` | 协作页头（统计 kicker + 发起讨论按钮） | 27 | 低 |
| `src/pages/collab/components/ThreadsPanel.tsx` | 左侧讨论话题列表面板 | 53 | 低 |
| `src/pages/collab/components/ThreadItem.tsx` | 单条讨论话题选项按钮 | 47 | 低 |
| `src/pages/collab/components/ThreadDetailPanel.tsx` | 中间讨论详情、滚动定位与回复表单容器 | 105 | 中 |
| `src/pages/collab/components/ThreadTaskMeta.tsx` | 讨论顶部关联任务元信息条（风险高亮） | 29 | 低 |
| `src/pages/collab/components/MessageItem.tsx` | 单条评论渲染（富文本分段、`@人`、`@文档` 按钮/失效态） | 80 | 中 |
| `src/pages/collab/components/ReplyForm.tsx` | 底部回复表单（集成 `MentionInput` + 发送态/报错） | 83 | 中 |
| `src/pages/collab/components/MentionInput.tsx` | `@` 提及自动补全多行输入框（成员/文档分组浮层 + 键盘导航） | 210 | 高 |
| `src/pages/collab/components/NewDiscussionDrawer.tsx` | 发起讨论表单抽屉（关联任务芯片 + `MentionInput`） | 208 | 高 |
| `src/pages/collab/components/ActivityFeedPanel.tsx` | 右侧深色项目动态面板 | 67 | 中 |
| `src/pages/collab/components/ActivityFeedItem.tsx` | 可点击/键盘触发单条动态项（关联或草稿联动） | 58 | 中 |

**8. `pages/members/`（18 个）**
| 路径 | 职责 | 行数 | 复杂度 |
|---|---|---:|---|
| `src/pages/members/MembersPage.tsx` | 权限分流壳（按 `canManageMember` 切换管理/个人视图） | 11 | 低 |
| `src/pages/members/MemberAdminView.tsx` | 成员管理视图容器（搜索、工时刻度、邀请/角色/权限变更） | 131 | 中 |
| `src/pages/members/MemberSelfView.tsx` | 普通成员“我的信息”5 面板网格页 | 52 | 低 |
| `src/pages/members/components/MembersHeader.tsx` | 成员管理页头（人数/超载 kicker + 邀请按钮） | 41 | 低 |
| `src/pages/members/components/MemberCrew.tsx` | 成员横向滚动矩阵表容器 | 93 | 中 |
| `src/pages/members/components/CrewLabels.tsx` | 成员矩阵左侧吸顶表头与搜索框列 | 61 | 低 |
| `src/pages/members/components/MemberColumn.tsx` | 单成员纵向数据列（姓名卡、工时、任务数、角色下拉、权限开关） | 99 | 中 |
| `src/pages/members/components/MemberLoad.tsx` | 成员矩阵内工时数字与进度轨道 | 42 | 低 |
| `src/pages/members/components/PermToggle.tsx` | 权限切换开关按钮（虚线/实心条 + “有/无”） | 34 | 低 |
| `src/pages/members/components/PermLog.tsx` | 成员页底部权限变更记录区 | 36 | 低 |
| `src/pages/members/components/PermLogItem.tsx` | 单条权限变更记录行 | 16 | 低 |
| `src/pages/members/components/InviteMemberDrawer.tsx` | 邀请成员表单抽屉（含内部 `InviteMemberForm`、用户搜索） | 284 | 高 |
| `src/pages/members/components/SelfHeader.tsx` | 个人视图页头 | 19 | 低 |
| `src/pages/members/components/SelfIdentity.tsx` | 深色个人基本信息与技能标签面板 | 45 | 低 |
| `src/pages/members/components/SelfLoad.tsx` | 个人本周工时与 `role="meter"` 进度条面板 | 54 | 低 |
| `src/pages/members/components/SelfPerms.tsx` | 个人 4 项项目权限只读展示面板 | 33 | 低 |
| `src/pages/members/components/SelfTasks.tsx` | 个人负责任务状态统计与未完成跳转列表面板 | 88 | 中 |
| `src/pages/members/components/SelfLog.tsx` | 个人权限变更记录面板 | 34 | 低 |

**9. `pages/reports/`（13 个）**
| 路径 | 职责 | 行数 | 复杂度 |
|---|---|---:|---|
| `src/pages/reports/ReportsPage.tsx` | 统计报表页容器（范围切换、Excel 导出、5 面板编排） | 100 | 中 |
| `src/pages/reports/components/ReportsHeader.tsx` | 报表页头（统计 kicker + 范围分段 + 导出按钮） | 58 | 低 |
| `src/pages/reports/components/BurndownPanel.tsx` | 燃尽图面板（含内联样式图例） | 47 | 低 |
| `src/pages/reports/components/BurndownChart.tsx` | 燃尽图 SVG（计划/实际/预测三线 + mask 绘制动画 + 参考线） | 234 | 高 |
| `src/pages/reports/components/WeeklyPanel.tsx` | 每周完成任务柱状图面板 | 34 | 低 |
| `src/pages/reports/components/WeeklyAxis.tsx` | 每周柱状图横轴日期 | 16 | 低 |
| `src/pages/reports/components/WeeklyBar.tsx` | 单周柱子（当周/已完成/空态动画） | 33 | 低 |
| `src/pages/reports/components/LoadPanel.tsx` | 成员工时横向柱图面板 | 42 | 低 |
| `src/pages/reports/components/LoadAxis.tsx` | 成员工时底部 0/上限刻度轴 | 21 | 低 |
| `src/pages/reports/components/LoadRow.tsx` | 单成员工时进度条与超载段动画行 | 53 | 低 |
| `src/pages/reports/components/DeviationPanel.tsx` | 任务工期偏差对比面板 | 39 | 低 |
| `src/pages/reports/components/DeviationRow.tsx` | 单任务计划虚线 vs 实际/超期对比条 | 75 | 中 |
| `src/pages/reports/components/ForecastHero.tsx` | 预测完工 Hero 卡（周期分段条 + 超期摘要） | 117 | 中 |

### 1.2 功能/交互重复组件分组与目标归并方案

| 分组 | 现有重复实例（路径） | 重复点与现存问题 | 建议目标归属与方案（Radix UI） |
|---|---|---|---|
| **1. 抽屉与表单抽屉** | `Drawer`、`SettingDrawer`、`NewProjectDrawer`、`TaskDrawer`、`UploadDocDrawer`、`InviteMemberDrawer`、`NewDiscussionDrawer`（共 7 处） | 5 个表单抽屉全部手写 `.fx-head` + `.ov-close` + `.double` 双横线 + `.fx-body` + `.fx-acts`；`UploadDocDrawer.tsx:157` 与 `InviteMemberDrawer.tsx:122` 多传 `.opening` 且用 `<header><h1>`，其余 3 个无动画且用 `<div><h2>`；`Drawer.tsx` 无 Esc 关闭、无 focus trap、直接改 `#shell` DOM 类名 | `components/ui/Drawer`（基于 `@radix-ui/react-dialog`）+ `components/patterns/FormDrawer`（统一头部、双线、滚动体、错误槽、底部按钮栏） |
| **2. 页面头部（PageHeader）** | `OverviewHeader`、`BoardHeader`、`TaskHeader`、`TimelineHeader`、`DocumentHeader`、`CollabHeader`、`MembersHeader`、`SelfHeader`、`ReportsHeader`、`NoProject.tsx:9-21`、`NoAccess.tsx:9-21`、`LoginPage.tsx:107-113`（12 处） | 均重复 `.vh > .vl (.k + h1.vt.t-page-title) + .va` 结构；标题双色 `<em>`、右操作区全部各自拼装 | `components/patterns/PageHeader`（支持 `kicker`/`breadcrumb`/`title`/`accentTitle`/`description`/`actions` 插槽） |
| **3. 按钮与二次确认/弹窗** | `.btn`（default/primary/go/risk，散见 20+ 文件）、`.addcard`（`BoardPage.tsx:88`、`TaskInfoPanel.tsx:61,69`）、`.ov-close`（6 个抽屉）、`.tk-back`、`.back`、`.hv-download-btn`、`.hero .go`；二次确认（`TaskHeader.tsx:27`、`PeoplePanel.tsx:24`、`ProjPanel.tsx:33`）；原生 `window.confirm`/`alert`（`DocumentsPage.tsx:113`、`BoardPage.tsx:35`、`TaskPage.tsx:55,61`） | 按钮变体靠全局类名拼装，无统一 loading/size API；二次确认有 3 种不同取消行为（blur 取消 / 按钮取消 / 不取消）加 1 处原生 `confirm`；操作拦截用 `window.alert` 阻塞线程 | `components/ui/Button`（variant: `default`/`primary`/`accent`/`danger`/`dashed`/`ghost`/`link` + `icon` + `loading`）、`components/ui/AlertDialog`（`@radix-ui/react-alert-dialog` 统一危险确认）、`components/ui/Toast`（替代 `window.alert`） |
| **4. 分段控制 / 芯片组 / 徽标** | 分段 `.seg`（`BoardHeader`、`TimelineHeader`、`ReportsHeader`）；芯片 `.chips`（`StatusChips`、`TaskDrawer.tsx:187`、`UploadDocDrawer.tsx:203`、`InviteMemberDrawer.tsx:200`）；隐形按钮 `.roles`（`MePanel.tsx:130`、`PeoplePanel.tsx:199,350`）；徽标 `.chip`/`.tag`/`.ds`/`.thr-late`（10+ 处） | `.seg`/`.chips`/`.roles` 都是单/多选按钮组但分属 3 套 DOM/CSS；`UploadDocDrawer.tsx:206` 与 `InviteMemberDrawer.tsx:211` 在 `role="radio"` 上误用 `aria-pressed`（应为 `aria-checked`）；徽标颜色覆盖散落各 CSS | `components/ui/ToggleGroup`（基于 `@radix-ui/react-toggle-group`，`variant="segmented" \| "chips"`）、`components/ui/Badge`（静态状态/关键路径/计数徽标） |
| **5. 开关与复选框** | `overlays/settings/Switch.tsx`（`.sw2` 双按钮）与 `pages/members/components/PermToggle.tsx`（`.pm` 单按钮 `role="switch"`）；原生 checkbox：`LoginPage.tsx:189`（`.ck`）与 `InviteMemberDrawer.tsx:248`（`.member-perm-check`） | 两套布尔开关样式、语义不统一（`PermToggle.tsx:23-24` 同时写了 `aria-checked` 与冗余的 `aria-pressed`）；两处 checkbox 各自写宽高和 `accent-color` | `components/ui/Switch`（基于 `@radix-ui/react-switch`，提供轨道式与双格分段式）、`components/ui/Checkbox`（基于 `@radix-ui/react-checkbox`） |
| **6. 浮层菜单与下拉选择器** | `ProjectSwitch`、`IssueSwitch`、`NotificationBell`、`AccountMenu`、`AssigneePicker`（5 处复用 `.issues` + `useDismiss`）、`MentionInput.tsx:203`（`.mn-pop`）；原生 `<select>`：`UploadDocDrawer.tsx:259`（`select.u`）、`InviteMemberDrawer.tsx:174`（`select.u`）、`MemberColumn.tsx:63`（`select.in`） | 5 个浮层各自维护 `open` + `rootRef` + `useDismiss`，定位靠硬编码 `top: 71px`（`.projs`）或 `calc(100% + 8px)`，无碰撞检测与 Portal 避遮挡；`<select>` 在抽屉与矩阵中分属两套下划线类 | `components/ui/Popover`（`@radix-ui/react-popover`）、`components/ui/DropdownMenu`（`@radix-ui/react-dropdown-menu`）、`components/ui/Select`（`@radix-ui/react-select`）；业务复合型保留在 `components/patterns/AssigneeCombobox` 与 `MentionTextarea` |
| **7. KPI 指标条与 Hero 强调卡** | KPI 指标条：`overview/{FigureStrip,Figure}` 与 `task/{TaskFigures,FigureItem}`；Hero 强调卡：`HeadlinePanel`、`ForecastHero`、`DocumentDetailHero` | 两组 KPI 组件共用 `.figures`/`.figure` 样式，仅差 `sub` 文案与 `unit` 单位；3 个 Hero 卡均包含 `.hk` 标题+风险徽标、大数字、风险/正常双底色 | `components/patterns/MetricStrip`（单卡 `MetricCard` 同时支持 `unit`、`sub`、`alert`、`inverted`）、`components/patterns/HeroCard` |
| **8. 表单行与输入/搜索框** | 表单行两套：`.fr` + `.u`（5 个表单抽屉 + `LoginPage`）与 `.srow` + `.in`（`MePanel`、`ProjPanel`、`ParamsPanel`、`PeoplePanel`）；搜索框 `.field`：`DocumentHeader.tsx:44`、`CrewLabels.tsx:25`、`PeoplePanel.tsx:134` 及 `.invite-search`（`InviteMemberDrawer.tsx:150`） | 相同下划线输入风格被拆成 `.u` 与 `.in` 两套类；`label` 与 `input` 的关联、必填星号、错误提示、inline 布局写法不统一（部分用 `<span className="lb">` 未关联 `htmlFor`） | `components/ui/Input`、`components/ui/Textarea`、`components/patterns/FormField`（统一布局 `horizontal`/`vertical` + 必填/提示/错误绑定）、`components/patterns/SearchInput` |
| **9. 面板容器与图例头** | `<section className="pnl [flat] [dark]">` + `.phd`（20+ 组件）；文档变体 `.dsec`/`.dsec-h`（`DocumentRevising`、`DocumentFinal`）；图例 `.legend`（`SchedulePanel`(overview)、`ProgressPanel`、`GanttPanel`、`DocumentRevisingHeader`、`BurndownPanel`、`DeviationPanel` 共 6 处） | 面板头双层 `// WORD` + 中文标题在 20+ 处重复手写；6 处图例仅 `DocumentRevisingHeader` 做成数据驱动，其余手写 `<i>` + 内联 style（如 `BurndownPanel.tsx:18-37`） | `components/patterns/Panel`（含 `variant="default" \| "flat" \| "dark"`、`kicker`、`title`、`headerRight`）+ `components/patterns/Legend` |
| **10. 负载条 / 进度条 / 时间条** | 工时负载条 `.track`：`MemberLoad.tsx:30`、`SelfLoad.tsx:33`、`LoadRow.tsx:25`、`AssigneePicker.tsx:30`（`LoadMeter`）；进度/时间条：`SummaryCard`、`.pbar`（`ProgressPanel`）、`.fbar`（`ForecastHero`）、`TaskBar`、`DocumentRevisingItem` 内 `TimelineBar` | 3 处 `.track` 重复 `.cap` + `.fill` + `.over` 相同结构（仅 `SelfLoad` 写了 `role="meter"`）；文档修订时间条与 `TaskBar` 逻辑高度相似 | `components/patterns/LoadBar`（整合 4 处工时条并内置 `role="meter"`）、`components/ui/Progress`（整合 `.gauge`/`.pbar`/`.fbar`）、`components/patterns/TaskBar`（保留并从组件内部剥离 `useIssue` 依赖） |
| **11. 跳转列表行与日志流** | 跳转行：`DependencyRow` 与 `LinkRow`（共用 `.dep`）、`TodoPanel`（`.item`）、`BlockedBy`（`.r`）、`SelfTasks`（`.me-task`）、`GanttRow`（`.gt-name`）；日志/动态流：`TaskLogPanel`、`ActivityFeedPanel`/`Item`、`PermLog`/`SelfLog`/`PermLogItem`、`LogsPanel` | `DependencyRow` 与 `LinkRow` 几乎同构；`task-panels.css:94-115` 与 `collab-feed.css:5-55` 重复定义 `.feed`/`.ev`；日志流按页面各写一套时间/内容排版 | `components/patterns/ListRow`（支持前缀标、标题、副信息、状态、跳转）、`components/patterns/ActivityFeed`（支持只读/可点、深浅底） |
| **12. 提示条 / 报错条 / 空态** | 报错条：`.page-note.err`（4 页）、`.err.t-error`（6 表单）、`.msg.err`（6 处设置/成员）、`.issue-note.err`、`auth-note`；空态：`NoProject`、`NoAccess`、`msgs-empty`、`me-empty`、`pempty`、`dep-none`、`DocumentDetail.tsx:31` | 错误提示和空态共 10+ 套局部类名与字号，缺少统一的视觉容器与无障碍 `role="alert"`/`role="status"` 规范 | `components/ui/Alert`（`inline` / `banner`）+ `components/patterns/EmptyState` + `components/patterns/PageState`（统一整页 loading / missing / error） |

---

## 2. 样式取值统计与归并后的 Token 草案

扫描范围：`frontend/src/` 全部 **40 个 `.css` 文件（6,416 行有效代码，其中 `styles/index.css` 2,415 行占 37.6%）** 与 **182 个 `.ts`/`.tsx` 文件**（含 77 处内联 `style`、35 处 SVG 展示属性、1 个样式常量文件 `shared/constants/legends.ts`）。

### 2.1 样式取值精确统计

#### 1) 颜色（Colors）
- **CSS 硬编码 Hex（21 种，共 43 次）**：
  - `#0a0a0a`（10 次：`index.css:6` 及 3 个文档样式文件反色覆写、`documents-layout.css:72`）
  - `#fafaf7`（4 次：`index.css:5` 及 3 个文档反色覆写）
  - `#cfcfca`（4 次：`typography.css:52`、`index.css:943`、`document-final.css:45`、`document-revising.css:77`）
  - `#fff`（4 次：`report-burndown.css:69` 用于 SVG `<mask>` 遮罩；`index.css:2113,2133,2135` 死代码 `.lab`）
  - `#3a3a3a`（3 次：`index.css:944`、`document-final.css:44`、`document-revising.css:76`）
  - `#ff5a1f`（3 次：`index.css:11`、`document-final.css:47`、`document-revising.css:79`）
  - 各 1 次（15 种）：`#f2f1ec`（`--ground`）、`#cfcec8`（`--hair`）、`#e4e3dc`（`--wash`）、`#c4c2bb`（`--soft`）、`#5e5e5e`（`--mute`）、`#b83a00`（`--signal-text`）、`#8f8d86`（`--text-faint`）、`#2a2a2a`（`.btn.primary:hover`, `index.css:816`）、`#ff7442`（`.btn.go:hover`, `index.css:824`）；其余 6 种全部位于死代码 `.lab`（`index.css:2112-2139`：`#1b1b1b`、`#9a9a9a`、`#555`、`#ddd`、`#000`、`#777`）。
  - 另：`data:image/svg+xml` 内嵌 `#0a0a0a`（`index.css:1828` 下拉箭头）与噪点滤镜（`index.css:95`）。
- **CSS `rgb()`/`rgba()`/`hsl()`（7 种 `rgba`，共 8 次；`hsl` 0 次）**：
  - `rgba(10, 10, 10, 0.045)`（2 次：`index.css:83-84` 背景网格线）
  - `rgba(10, 10, 10, 0.14)`（1 次：`report-burndown.css:32` 燃尽图网格线）
  - `rgba(0, 0, 0, 0.02)`（1 次：`collab-detail.css:58` 空态底色）
  - `rgba(246, 243, 236, 0.08)`（1 次：`collab-feed.css:27` 暗底动态 hover，色值偏离 `--paper`/`--ground`）
  - `rgba(255, 79, 17, 0.42)` / `0.32` / `0.12`（各 1 次：`collab-detail.css:70,73`、`collab-feed.css:33` —— `rgb(255,79,17)` 为 `#ff4f11`，偏离主橙 `--signal: #ff5a1f` = `rgb(255,90,31)`）
- **CSS 颜色关键字（3 种，共 36 次）**：`transparent`（27）、`currentColor`（5）、`inherit`（4）。
- **CSS 已有颜色/纹理变量引用（21 种，共 554 次）**：
  - `var(--ink)`（198）、`var(--text-mute)`（70）、`var(--signal)`（63）、`var(--paper)`（49）、`var(--text-inverse)`（38）、`var(--text)`（30）、`var(--wash)`（22）、`var(--text-alert)`（21）、`var(--text-accent)`（16）、`var(--text-inverse-mute)`（11）、`var(--hair)`（9）、`var(--over)`（6）、`var(--signal-text)`（4）、`var(--ground)`（4）、`var(--mute)`（3）、`var(--text-faint)`（3）、`var(--soft)`（2）、`var(--hatch)`（2）、`var(--tb-warn)` / `var(--tb-past)` / `var(--tb-border)`（各 1）。
- **TSX SVG 属性与内联样式颜色**：
  - SVG `fill`/`stroke`（24 处）：`fill="none"`（6）、`stroke="currentColor"`（5）、`stroke="none"`（5）、`fill="#FF5A1F"`（3，Logo 橙块：`ProjectSwitch.tsx:39`、`SettingDrawer.tsx:64`、`LoginPage.tsx:102`）、`fill="currentColor"`（2）、`fill="#FAFAF7"`（1，`ProjectSwitch.tsx:38`）、`fill="#0a0a0a"`（1，`LoginPage.tsx:101`）、`stroke="var(--ink)"` / `fill="var(--ink)"` / `fill="var(--signal)"`（各 1，`NotificationBell.tsx`）、`fill="white"` / `fill="black"`（各 1，`NotificationBell.tsx:81-82`，属 SVG `<mask>` 逻辑色，**不可随主题替换**）。
  - 内联 `style` 颜色（3 处）：`CriticalChainPanel.tsx:28`、`BurndownPanel.tsx:31`、`legends.ts:48`（均使用 `var(--*)`）。

#### 2) 间距（Spacing：`margin*` / `padding*` / `gap*`）
全站 CSS 间距属性共 **623 个独立 token 值（40 种取值）**（`padding*` 330 / `gap*` 159 / `margin*` 144，扣减 `calc(...)` 嵌套计数后为 623）：
- **4px 基准值**：`0`（130）、`8px`（60）、`12px`（56）、`4px`（37）、`16px`（36）、`20px`（9）、`24px`（7）、`28px`（4）、`32px`（3）、`40px`（1）、`80px`（1）。
- **非 4px 步进值（2px 半步与微调）**：`10px`（58，第 3 高频）、`6px`（53，第 5 高频）、`14px`（42，第 6 高频）、`2px`（29）、`5px`（15）、`3px`（15）、`1px`（9）、`22px`（7）、`9px`（6）、`18px`（6）、`7px`（4）、`13px`（1）。
- **负边距与动态/特殊值**：`auto`（12）、`-0.75px`（5，竖线居中偏移）、`-8px`（2）、`-2px`（2）、`-16px` / `-14px` / `-15px` / `-7px` / `-4px` / `-1.5px` / `-1px` / `-0.5px`（各 1）、`30vh`（1，抽屉底部留白）、`clamp(40px, 12vh, 112px)`（1，登录页）、3 个 `calc(var(--tb-bar) ...)`（`TaskBar.css`）。
- **TSX 内联静态间距（10 处）**：`padding: 24`（2：`ProjectProvider.tsx:158`、`TaskProvider.tsx:175`）、`marginLeft: 12`（2：`ProjectProvider.tsx:163`、`TaskProvider.tsx:180`）、`marginTop: 10`（2：`MePanel.tsx:172`、`ProjPanel.tsx:162`）、`padding: "20px"`（`DocumentDetail.tsx:31`）、`padding: "8px 0"`（`PermLog.tsx:30`）、`marginTop: "16px"`（`TaskInfoPanel.tsx:32`）、`marginTop: 8`（`MePanel.tsx:273`）、`marginTop: 6`（`MePanel.tsx:147`）。

#### 3) 圆角（Border Radius）
- 全站 CSS `border-radius` 仅 **1 处**且取值为 `0`（`pages/task/css/task-header.css:21`）；SVG `rx`/`ry` 为 **0 处**。全站为 **100% 锐角（0px）** 的瑞士网格/报刊风格。

#### 4) 描边与轮廓（Border & Outline & Stroke）
- **`border-width`（CSS 178 次 + `stroke-width` 9 次 = 187 次）**：`1.5px`（80，核心边框）、`1px`（53，次级分隔线）、`0`（31）、`2.5px`（9，粗分隔/表头底线/当前周框）、`2px`（3）、`3px`（2：`login.css:83`、`timeline.css:191`）。CSS SVG `stroke-width`：`1.5`（5）、`3`（2）、`1`（1）、`12`（1，mask）；TSX SVG `strokeWidth`：`1.8`（4）、`1.5`（2）；内联 `borderWidth`（4，图例）。
- **`border-style`（150 次）**：`solid`（115）、`dashed`（35）。
- **`border-color`（159 次）**：`var(--ink)`（112）、`var(--signal)`（14）、`var(--hair)`（9）、`var(--paper)`（7）、`currentColor`（4）、`var(--signal-text)`（3）、`var(--mute)`（2）、`var(--soft)`（2）、`transparent`（2）、`var(--tb-border)`（1）、以及死代码 `.lab` 中的 `#555`/`#fff`/`#777`（各 1）。
- **`outline-width`（26 次）与 `outline-color`（22 次）**：`2px`（17）、`1.5px`（4）、`none`（4）、`2.5px`（1）；颜色为 `var(--signal)`（21）、`var(--ink)`（1）。

#### 5) 排版（字号 / 字重 / 行高 / 字距 / 字体族）
- **字号 `font-size`（222 次，全走 `--fs-*` 变量，仅 1 处硬编码 `0`；TSX 0 处内联 `fontSize`）**：
  - `--fs-2xs` = `10px`（**69 次**，全站最高频）
  - `--fs-xs` = `11px`（45 次）
  - `--fs-md` = `13px`（32 次）
  - `--fs-sm` = `12px`（28 次）
  - `--fs-lg` = `15px`（15 次）
  - `--fs-6xl` = `56px`（8 次）
  - `--fs-2xl` = `22px`（7 次）
  - `--fs-5xl` = `44px`（7 次）
  - `--fs-3xl` = `28px`（5 次）
  - `--fs-xl` = `18px`（2 次：`collab-detail.css:6`、`overview.css:333`）
  - `--fs-7xl` = `60px`（2 次：`index.css:1164`、`roles.css:9`）
  - `--fs-4xl` = `36px`（1 次：`overview.css:336`）
  - `0`（1 次：`index.css:1418` `.ov-close`）
- **字重 `font-weight`（190 次，100% 走变量）**：`--fw-bold` 700（101）、`--fw-heavy` 800（47）、`--fw-regular` 400（18）、`--fw-black` 900（17）、`--fw-medium` 500（7）。
- **行高 `line-height`（63 次）**：`--lh-normal` 1.45（18）、`--lh-solid` 0.88（13）、`--lh-none` 1（12）、`--lh-snug` 1.2（8）、`--lh-loose` 1.7（4）；另有 8 处硬编码 px 行高：`30px`（3）、`12px`（2）、`20px`（1）、`23px`（1）、`18px`（1）。
- **字距 `letter-spacing`（32 次）**：`--ls-tighter` -3px（10）、`--ls-snug` -1px（6）、`--ls-tight` -2px（4）、`--ls-wide` 0.5px（4）、`--ls-wider` 1px（3）、`0`（3）、`--ls-slight` -0.5px（2）。
- **字体族 `font-family`（152 次）**：`--font-mono`（140）、`--font-sans`（7）、`--font-disp`（5）。外部 Google Fonts 引入于 `index.html:15`（Archivo / JetBrains Mono / Noto Sans SC）。

#### 6) 阴影（Box Shadow）
共 **5 处**（`text-shadow` 0 处），全部零模糊硬边或内描边：
- `6px 6px 0 var(--ink)`（2 次：`board-card.css:98,126` 拖拽悬浮卡）
- `3px 3px 0 var(--ink)`（1 次：`collab-mention.css:33` `@提及` 下拉浮层）
- `inset 0 0 0 2px var(--signal)`（1 次：`timeline.css:105` 甘特图高危行内框）
- `inset 0 5px 0 var(--signal)`（1 次：`index.css:1094` KPI 告警顶部橙条）

#### 7) 动画时长与缓动（Transition & Animation）
- **`transition`（3 条规则，4 个属性过渡）**：时长 `0.12s`（4 次：`collab-feed.css:21`、`task-header.css:29`）、`none`（1 次，`prefers-reduced-motion`）；缓动 `ease`（2 显式 + 2 隐式）。
- **`animation`（21 条声明，仅 3 条运行时生效，18+ 条挂在死类 `.enter`/`.first` 上）**：
  - 实际生效：`slidein 0.26s cubic-bezier(0.4, 0, 0.2, 1)`（抽屉）、`fadein 0.15s linear`（遮罩）、`msg-orange-flash 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)`（@消息高亮）。
  - 全部声明时长：`0.3s`（4）、`0.28s`（3）、`0.32s`（2）、`var(--dur, 0.3s)`（2）、`0.15s`/`0.2s`/`0.26s`/`0.4s`/`0.45s`/`0.5s`/`0.55s`/`1.2s`/`var(--dur, 0.5s)`/`var(--dur2, 0.1s)`（各 1）。
  - 全部缓动：`cubic-bezier(0.4, 0, 0.2, 1)`（10）、`ease-out`（8）、`linear`（2）、`cubic-bezier(0.2, 0.8, 0.2, 1)`（1）。

#### 8) 层级（`z-index`，共 30 处，16 种取值）
| `z-index` | 次数 | 位置与用途 |
|---|---:|---|
| `-1` | 1 | `overview.css:117` 成员排期背景格 |
| `0` | 3 | 负载/文档/任务条基准线（`index.css:1258`、`document-revising.css:154`、`TaskBar.css:126`） |
| `1` | 5 | 进度条/甘特轨道/任务条填充 |
| `2` | 4 | 粘性列头/依赖连线/今天线（`member-crew.css:44`、`overview.css:79`、`timeline.css:216`、`TaskBar.css:83`） |
| `3`–`7` | 7 | 局部图表层叠：文档今日线 `3`、TaskBar 框架/标签 `4`/`5`、甘特左列/表头 `6`/`7` |
| `20` | 4 | 侧栏 `.index`、顶栏 `.masthead`、`.issue-note`（`index.css:103,538,593`）、`@提及` 浮层（`collab-mention.css:21`） |
| `30` | 1 | 顶栏下拉浮层 `.issues`（`index.css:285`） |
| `39` / `40` | 2 | 抽屉遮罩 `.ov-bd`（`39`）与抽屉主体 `.ov`（`40`，`index.css:1343,1334`） |
| `50` | 1 | 看板拖拽镜像卡（`board-card.css:103`） |
| `70` | 1 | 全局纸张颗粒噪点 `.shell::after`（`index.css:92`，`pointer-events: none`） |
| `100` | 1 | 死代码 `.lab`（`index.css:2107`） |

### 2.2 归并后的 Design Token 草案

> **设计原则**：严格保留项目现有的 **暖纸黑墨 + 信号橙 + 0px 锐角 + 硬边偏移投影** 瑞士报刊视觉风格，不擅自圆角化或换色系；收口重复/漂移色值与零散数值，建立三层色彩与浅色/深色双主题体系。

#### 第一层：色彩（三层 Token + 浅色/深色映射）

**Level 1 · 原始色板（Primitives，禁止业务组件直接引用）**
```css
:root {
  /* 暖纸中性色阶（贴合现有 #fafaf7 / #f2f1ec / #e4e3dc / #cfcec8 / #0a0a0a） */
  --gray-0: #ffffff;
  --gray-50: #fafaf7;   /* 原 --paper */
  --gray-100: #f2f1ec;  /* 原 --ground */
  --gray-200: #e4e3dc;  /* 原 --wash */
  --gray-300: #cfcec8;  /* 原 --hair / 合并 #cfcfca */
  --gray-350: #c4c2bb;  /* 原 --soft */
  --gray-400: #8f8d86;  /* 原 --text-faint */
  --gray-500: #73726c;  /* 深色次要边/占位过渡 */
  --gray-600: #5e5e5e;  /* 原 --mute */
  --gray-700: #3a3a38;  /* 原暗面 #3a3a3a 暖化对齐 */
  --gray-800: #262624;  /* 原 #2a2a2a / 深色悬浮面 */
  --gray-850: #1a1a18;  /* 深色面板面 */
  --gray-900: #111110;  /* 深色画布底 */
  --gray-950: #0a0a0a;  /* 原 --ink */

  /* 信号橙色阶（收口 collab 漂移的 #ff4f11） */
  --signal-300: #ff8a5c; /* 深色可读文字橙 */
  --signal-400: #ff7442; /* 原 .btn.go:hover */
  --signal-500: #ff5a1f; /* 原 --signal */
  --signal-600: #e04810; /* 深色按压/实心 */
  --signal-700: #b83a00; /* 原 --signal-text（浅底 AA 可读橙） */

  /* 扩展克制状态色（预留；若坚持纯黑白橙美学可全部映射至 neutral/signal） */
  --green-600: #1e6b45;
  --green-400: #4aba82;
  --amber-600: #a86400;
  --amber-400: #e8a838;
  --blue-600: #1f568a;
  --blue-400: #63a4e6;
}
```

**Level 2 · 语义色（Semantic：浅色 `:root` vs 深色 `[data-theme="dark"]`）**

| 语义 Token | 浅色 `:root` | 深色 `[data-theme="dark"]` | 用途与原变量映射 |
|---|---|---|---|
| `--color-bg` | `var(--gray-100)` (`#f2f1ec`) | `var(--gray-900)` (`#111110`) | 页面画布底色（原 `--ground`） |
| `--color-bg-subtle` | `var(--gray-200)` (`#e4e3dc`) | `var(--gray-800)` (`#262624`) | 悬浮/次级底（原 `--wash`） |
| `--color-surface` | `var(--gray-50)` (`#fafaf7`) | `var(--gray-850)` (`#1a1a18`) | 面板/抽屉/卡片面（原 `--paper`） |
| `--color-surface-inverse` | `var(--gray-950)` (`#0a0a0a`) | `var(--gray-100)` (`#f2f1ec`) | 反色强调块/按钮/选中行（原 `.dark`/`.btn.primary`） |
| `--color-text` | `var(--gray-950)` (`#0a0a0a`) | `var(--gray-100)` (`#f2f1ec`) | 主文字（原 `--text`） |
| `--color-text-muted` | `var(--gray-600)` (`#5e5e5e`) | `var(--gray-350)` (`#c4c2bb`) | 次要/说明/时间（原 `--text-mute`） |
| `--color-text-faint` | `var(--gray-400)` (`#8f8d86`) | `var(--gray-500)` (`#73726c`) | 禁用/归档/占位（原 `--text-faint`） |
| `--color-text-inverse` | `var(--gray-50)` (`#fafaf7`) | `var(--gray-950)` (`#0a0a0a`) | 反色底主字（原 `--text-inverse`） |
| `--color-text-inverse-muted` | `var(--gray-300)` (`#cfcec8`) | `var(--gray-600)` (`#5e5e5e`) | 反色底次字（原 `--text-inverse-mute`） |
| `--color-border-subtle` | `var(--gray-300)` (`#cfcec8`) | `var(--gray-700)` (`#3a3a38`) | 细分隔线（原 `--hair`/`--soft`） |
| `--color-border` | `var(--gray-350)` (`#c4c2bb`) | `var(--gray-600)` (`#5e5e5e`) | 次级边框/虚线空态框 |
| `--color-border-strong` | `var(--gray-950)` (`#0a0a0a`) | `var(--gray-300)` (`#cfcec8`) | 主骨架框（原 `--ink` 描边） |
| `--color-primary` | `var(--signal-500)` (`#ff5a1f`) | `var(--signal-500)` (`#ff5a1f`) | 信号橙主强调/当前态（原 `--signal`） |
| `--color-primary-hover` | `var(--signal-400)` (`#ff7442`) | `var(--signal-400)` (`#ff7442`) | 主强调悬浮（原 `#ff7442`） |
| `--color-primary-text` | `var(--signal-700)` (`#b83a00`) | `var(--signal-300)` (`#ff8a5c`) | 橙色可读文字（原 `--text-alert`/`--signal-text`） |
| `--color-danger` | `var(--signal-700)` | `var(--signal-300)` | 风险/错误/阻塞文字 |
| `--color-danger-bg` | `var(--signal-500)` | `var(--signal-600)` | 风险实心块/徽章 |
| `--color-warning` | `var(--signal-500)` *(或 `--amber-600`)* | `var(--signal-400)` *(或 `--amber-400`)* | 警告/临期（待决策） |
| `--color-success` | `var(--gray-950)` *(或 `--green-600`)* | `var(--gray-100)` *(或 `--green-400`)* | 完成/正常（待决策） |
| `--color-info` | `var(--gray-600)` *(或 `--blue-600`)* | `var(--gray-350)` *(或 `--blue-400`)* | 一般信息提示（待决策） |
| `--color-grid-line` | `rgba(10, 10, 10, 0.045)` | `rgba(242, 241, 236, 0.055)` | 画布背景 24px 网格线 |
| `--color-chart-grid` | `rgba(10, 10, 10, 0.14)` | `rgba(242, 241, 236, 0.14)` | 图表辅助网格线 |
| `--color-signal-tint` | `rgba(255, 90, 31, 0.12)` | `rgba(255, 90, 31, 0.18)` | 激活行淡橙底（收口原 `255,79,17`） |
| `--color-signal-flash` | `rgba(255, 90, 31, 0.38)` | `rgba(255, 90, 31, 0.42)` | `@提及` 跳转闪烁底 |
| `--pattern-hatch-warn` | `repeating-linear-gradient(135deg, var(--color-primary) 0 3px, var(--color-surface) 3px 6px)` | 同左（自动随语义色响应） | **合并原重复的 `--hatch` 与 `--over`** |
| `--pattern-hatch-past` | `repeating-linear-gradient(135deg, var(--color-border-strong) 0 3px, var(--color-surface) 3px 6px)` | 同左 | 已完成任务历史异常斜纹 |

**Level 3 · 组件色（仅确有必要）**
- **局部反色面板 Token**（`--panel-inverse-bg` / `--panel-inverse-text` / `--panel-inverse-border` / `--panel-inverse-muted`）：替代 `.dark`（`index.css:940`）、`.df[aria-selected]`（`document-final.css:41`）、`.dr[aria-selected]`（`document-revising.css:73`）、`.dsec.on`（`documents-layout.css:71`）四处硬编码 hex 覆写。
- **任务条组件 Token**（`--taskbar-bar-h`、`--taskbar-track-h`、`--taskbar-border-w`）：收编现有 `TaskBar.css` 的 `--tb-*`。

#### 第二层：样式 Token 草案

| 维度 | Token 定义草案 | 归并与迁移说明 |
|---|---|---|
| **间距（4px 基准）** | `--space-0: 0`、`--space-1: 4px`、`--space-2: 8px`、`--space-3: 12px`、`--space-4: 16px`、`--space-5: 20px`、`--space-6: 24px`、`--space-7: 28px`、`--space-8: 32px`、`--space-10: 40px`、`--space-12: 48px` | 现有高频半步值（`2px` 29x / `6px` 53x / `10px` 58x / `14px` 42x）可选保留过渡半步档 `--space-0-5`/`1-5`/`2-5`/`3-5`（收口 1/3/5/7/9/13px），或严格对齐 4px 栅格（见第 7 节决策）。 |
| **圆角** | `--radius-none: 0px`、`--radius-sm: 0px`、`--radius-md: 0px`、`--radius-lg: 0px`、`--radius-full: 9999px` | 保持全站 0px 锐角风格；若局部启用非零圆角，遵循同心圆角公式 `R_outer = R_inner + padding`。 |
| **描边** | `--border-width-hair: 1px`、`--border-width-thin: 1.5px`、`--border-width-thick: 2.5px` | `1.5px`（80x）为品牌核心框线；`2.5px` 合并现有 `2px`(3x)/`2.5px`(9x)/`3px`(2x)；是否整数化为 `1px`/`2px` 待拍板。 |
| **阴影** | `--shadow-sm: 3px 3px 0 var(--color-border-strong)`、`--shadow-md: 6px 6px 0 var(--color-border-strong)`、`--shadow-lg: 8px 8px 0 var(--color-border-strong)` | 延续硬边偏移投影；现有 `inset 0 5px 0 var(--signal)` 等状态条改用边框/伪元素实现。 |
| **字体族** | `--font-sans`、`--font-display`、`--font-mono` | 沿用现有 Archivo / JetBrains Mono / Noto Sans SC 字体栈。 |
| **字号** | 正文 6 档：`--font-size-2xs: 10px`（待定）、`xs: 11px`、`sm: 12px`、`base: 13px`、`lg: 15px`、`xl: 22px`、`2xl: 28px`；展示 3 档：`--font-size-display-sm: 44px`、`display-md: 56px`、`display-lg: 60px` | 合并仅 2 次的 `18px` 至 `22px`、仅 1 次的 `36px` 至 `28px`；`60px`（2 次）可与 `56px` 合并；`10px`（69 次）去留待拍板。 |
| **字重** | `--font-weight-regular: 400`、`medium: 500`、`bold: 700`、`heavy: 800`、`black: 900` | 与现有 5 档 100% 对齐。 |
| **行高** | `--line-height-solid: 0.88`、`none: 1`、`snug: 1.2`、`normal: 1.45`、`loose: 1.7` | 8 处硬编码 px 行高改用 `height` + Flex 垂直居中。 |
| **动效** | `--duration-fast: 120ms`、`--duration-normal: 260ms`、`--duration-slow: 450ms`；`--ease-standard: cubic-bezier(0.4, 0, 0.2, 1)`、`--ease-out: ease-out` | 收口现有 14 种散落时长；保留 `prefers-reduced-motion` 降级。 |
| **层级** | `--z-base: 0`、`--z-sticky: 10`、`--z-chrome: 20`、`--z-dropdown: 30`、`--z-backdrop: 39`、`--z-modal: 40`、`--z-drag: 50`、`--z-toast: 60`、`--z-grain: 70` | 将 `@提及` 浮层从 `20` 统一抬至 `--z-dropdown (30)`，避免与顶栏同层竞争。 |
| **焦点环** | `--focus-ring: 2px solid var(--color-primary)`、`--focus-ring-offset: 2px` | 贴边列表项用 `-2px` 内缩偏移。 |

---

## 3. 各可交互组件的状态覆盖情况矩阵

### 3.1 系统性缺口摘要
1. **`active`（按压态 `:active`）全站 0 覆盖**：全部 40 个 CSS 文件中**无任何 `:active` 规则**。
2. **`invalid`（校验错误态）近乎空白**：全站仅 `LoginPage.tsx:85-88` + `login.css:63-69` 实现了 `aria-invalid="true"` + `aria-describedby` + 红色下边框；其余 5 个抽屉表单与 4 个设置面板输入框均无 `invalid` 态。
3. **选择器断链导致 `hover` 失效（现存 Bug）**：
   - `overview.css:140` `.tl .bar[data-t]:hover` — `ScheduleRow.tsx:29-46` 未输出 `data-t`；
   - `overview.css:204-205` `.todo-list .item[data-t]:hover b` 与 `index.css:1027` `[data-t]{cursor:pointer}` — `TodoPanel.tsx:31` 未输出 `data-t`/`data-go`；
   - `index.css:1149-1150` `.hero .headline[data-t]:hover` — `HeadlinePanel.tsx` 未输出 `data-t`。
4. **非语义可点击元素缺键盘访问与焦点环**：`TodoPanel.tsx:31`（`div.item`）、`BlockedBy.tsx:16`（`div.r`）、`TaskCard.tsx:45`（`article.card`）、`HeadlinePanel.tsx:46,52`（`span` 与无 `href` 的 `a.go`）、`DocumentDetailFacts.tsx:21`（`span.lnk`）、`ThreadTaskMeta.tsx:23`（`b.lnk`）均无 `tabIndex`/`role`/`onKeyDown`。
5. **隐藏原生控件吞掉焦点环**：`.roles .perm`（`MePanel.tsx:133`、`PeoplePanel.tsx:202,353`）与 `.dz input[type="file"]`（`UploadDocDrawer.tsx:183`）被 1×1 透明隐藏，外层 `<label>` 无 `:focus-within`。另需注意：`.dz` 的拖拽上传逻辑原挂在旧原型外层共享表单容器 `frontend/prototype/global.js:3291-3309` 的事件委托上，迁移到 React `UploadDocDrawer.tsx` 时因归属错位而被漏迁（详见第 5.2 节），导致当前 React 运行时仅保留文案与 `.dz.over` 样式。
6. **`loading` 零散且缺防连点兜底**：仅 6 处主表单按钮有提交中禁用+文案切换；`MePanel`、`ParamsPanel`、`PeoplePanel`（编辑/重置/删除）、`PermToggle`、`DocumentDetail`（定稿/下载）、`ReportsHeader`（导出）无 loading 态。

### 3.2 可交互组件 9 态覆盖矩阵

图例：`✓` 已实现 ｜ `◐` 部分实现 ｜ `✗` 缺失 ｜ `—` 不适用。全局兜底指 `styles/index.css:54` 全局 `:focus-visible`。

| 控件/组件（典型位置） | default | hover | active | focus-visible | disabled | loading | invalid | selected | open | 当前实现方式与核查依据 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **通用按钮 `.btn`**（default/primary/go/risk，全站） | ✓ | ◐ | ✗ | ✓ | ✓ | ◐ | — | — | — | 伪类 `:hover`（`index.css:808-825`，`.btn.risk` 缺独立 hover）；全局 `:focus-visible`；`:disabled` 降透明度（`index.css:502`）；loading 零散 |
| **虚线新建按钮 `.addcard`**（`BoardPage:88`、`TaskInfoPanel:61`） | ✓ | ✓ | ✗ | ✓ | ✗ | — | — | — | — | `:hover` 变 `.wash`（`board-extras.css:53`）；全局 `:focus-visible`；只读期仅靠 `.past .addcard{display:none}` 隐藏 |
| **抽屉关闭按钮 `.ov-close`**（6 个抽屉） | ✓ | ✓ | ✗ | ✓ | — | — | — | — | — | `:hover` 变 `.wash`（`index.css:1424`）；全局 `:focus-visible` |
| **局部文本/图标按钮**（`.tk-back`、`.hv-download-btn`、`.back`、`.auth-alt button`、`.hero .go`） | ✓ | ◐ | ✗ | ◐ | ✗ | ✗ | — | — | — | `.tk-back`/`hv-download-btn` 有 `:hover`（`task-header.css:33`、`document-detail.css:195`）；`.back`/`.auth-alt button`/`.hero .go` 缺 `:hover`；`.hero .go` 无 `href` 不可聚焦 |
| **侧栏导航链接 `.grp a`**（`SidebarNav.tsx:25-45`） | ✓ | ✓ | ✗ | ✓ | ◐ | — | — | ✓ | — | `[aria-current="page"]`（`index.css:170`）；`:not([aria-current]):hover`（L174）；CSS 有 `.past .grp a[aria-disabled="true"]`（L186）但 TSX 未传 |
| **行内链接 `.lnk` / `.me-task` / `.dep` / `.gt-name`** | ✓ | ✓ | ✗ | ◐ | — | — | — | — | — | `<Link>`/`<button>` 项有 `:hover` 与 `:focus-visible`；`DocumentDetailFacts.tsx:21`（`span.lnk`）与 `ThreadTaskMeta.tsx:23`（`b.lnk`）缺 `focus-visible` |
| **下划线输入框/文本域 `.fr .u`**（5 抽屉 + `LoginPage`） | ✓ | ✗ | ✗ | ◐ | ✓ | — | ◐ | — | — | 仅 `:focus` 橙下划线（`index.css:1816`）；`:disabled` 虚线+`not-allowed`（L1831）；仅 `LoginPage` 实现 `[aria-invalid="true"]`（`login.css:63`） |
| **设置区输入框 `.in`**（`Me`/`Proj`/`Params`/`People`） | ✓ | ✗ | ✗ | ✓ | ✗ | — | ✗ | — | — | `index.css:1556-1573` 无 `:hover`/`:disabled`/`:read-only`/`invalid`；仅全局 `:focus-visible` |
| **搜索框 `.field input`**（`DocumentHeader`/`CrewLabels`/`PeoplePanel`） | ✓ | ✗ | ✗ | ◐ | — | ✗ | — | — | — | `index.css:856-876` 无 `:hover` 与 `:focus-within` 外框高亮 |
| **原生下拉框 `select.u` / `select.in`** | ✓ | ✗ | ✗ | ◐ | ◐ | — | ✗ | — | — | `select.u` 继承 `.u:focus`/`:disabled`；`select.in`（`index.css:1574`）无 `:hover`/`:disabled`/`invalid` |
| **文件选择/拖拽区 `.dz`**（`UploadDocDrawer.tsx:183`） | ✓ | ✓ | ✗ | ✗ | — | — | ✗ | ◐ | — | `:hover`（`index.css:2070`）；选中仅改文案；内部 `input[type=file]` 隐藏无 `:focus-within`；原拖拽事件与 `.dz.over` 切换位于旧原型外层容器 `frontend/prototype/global.js:3291-3309`，迁入 React 时漏迁（见第 5.2 节） |
| **复选框 `.ck` / `.member-perm-check`**（`LoginPage`/`InviteMemberDrawer`） | ✓ | ✗ | ✗ | ✓ | ◐ | — | — | ✓ | — | 原生 `:checked` + `accent-color`；`InviteMemberDrawer` 禁用时外层 `<label>` 仍 `cursor: pointer`（`invite-drawer.css:28`） |
| **两格开关 `Switch` `.sw2`**（`overlays/settings/Switch.tsx`） | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | — | ✓ | — | `[aria-pressed="true"]` 反白（`index.css:1609`）；`:not([aria-pressed]):hover`（L1613）；无 `disabled` |
| **权限开关 `PermToggle` `.pm`**（`pages/members/components/PermToggle.tsx`） | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | — | ✓ | — | `[aria-pressed="true"]`（`member-crew.css:198`）；`:hover`（L209）；`:disabled` 仅改光标未视觉弱化（L213）；`:focus-visible`（L217） |
| **分段选择 `.seg`**（`Board`/`Timeline`/`Reports`） | ✓ | ✓ | ✗ | ✓ | ✗ | — | — | ✓ | — | `[aria-pressed="true"]` 反白（`index.css:849`）；`:not([aria-pressed]):hover`（L853）；全局 `:focus-visible` |
| **芯片选择组 `.chips`**（`StatusChips`/`Task`/`UploadDoc`/`Invite`） | ✓ | ✓ | ✗ | ✓ | ◐ | — | — | ✓ | — | `[aria-pressed="true"]`（`index.css:1312`）；`:disabled` 仅 `cursor: default`（L1327）无视觉弱化；2 处抽屉误在 `role="radio"` 上用 `aria-pressed` |
| **角色/标签隐形按钮 `.roles label`**（`MePanel`/`PeoplePanel`） | ✓ | ✗ | ✗ | ✗ | ◐ | — | — | ✓ | — | `:has(.perm[aria-pressed="true"])`（`index.css:1726`）；无 `:hover`；内部按钮 1×1 透明吞掉焦点环；禁用时仍 `cursor: pointer` |
| **设置抽屉标签 `.ov-tabs a`**（`SettingDrawer.tsx:69-78`） | ✓ | ✓ | ✗ | ✓ | — | — | — | ✓ | — | `[aria-current="page"]`（`index.css:1444`）；`:not([aria-current]):hover`（L1449）；全局 `:focus-visible` |
| **下拉浮层（`ProjectSwitch`/`IssueSwitch`/`AccountMenu`）** | ✓ | ◐ | ✗ | ✓ | ◐ | — | — | ✓ | ◐ | 选项 `.issues button` 有 `:hover`/`:focus-visible`/`[aria-current="true"]`（`index.css:344-366`）；触发器 `.project`/`.me` 缺 `:hover`，仅 `AccountMenu` 有 `[aria-expanded="true"]`（L671）；`AccountMenu:60` 原生 `disabled` 无样式（CSS 仅死类 `.accts button.off`） |
| **通知铃铛 `NotificationBell`**（`layout/topbar/NotificationBell.tsx`） | ✓ | ✓ | ✗ | ✓ | — | ✗ | — | — | ◐ | `.bell:hover`（`index.css:664`）；有 `aria-expanded` 但无 `open` 视觉态；未读用 class `.unread`（L448） |
| **抽屉容器 `Drawer`**（`shared/components/Drawer.tsx`） | ✓ | — | — | — | — | — | — | — | ◐ | 条件挂载控制开关；仅 2/6 抽屉传 `.opening` 滑入（`index.css:1366`）；无关闭过渡、无 Esc 关闭与焦点陷阱 |
| **负责人选择器 `AssigneePicker`**（`overlays/task/AssigneePicker.tsx`） | ✓ | ✓ | ✗ | ◐ | ✗ | ✗ | ✗ | ✓ | ✓ | 展开切为 `<input role="combobox">` + `.ap-pop`；`.ap-tg:hover`（`index.css:1881`）；选项用 class `.on`（L1921）+ `[aria-selected="true"]`（L1924）；加载无 loading 态、无 `disabled` |
| **@提及输入 `MentionInput`**（`pages/collab/components/MentionInput.tsx`） | ✓ | ✗ | ✗ | ◐ | ✗ | — | ✗ | ✓ | ✓ | 候选浮层 `.mn-pop` 按 `isOpen` 展开，选项靠 `[aria-selected="true"]` 反白（`collab-mention.css:58`）；输入宿主缺 hover/disabled/invalid |
| **看板拖拽任务卡 `TaskCard`**（`pages/board/components/TaskCard.tsx`） | ✓ | ✓ | ◐ | ✗ | ◐ | — | — | — | — | `:hover` 抬起+硬阴影（`board-card.css:124`）；拖拽中靠 class `.lifted.floating`（L96-106）；无权限用 class `.locked`（L19,124）；`<article>` 缺 `tabIndex` 与 `focus-visible` |
| **列表选择项**（`ThreadItem`/`Document*Item`/`PeoplePanel .pp`/`ActivityFeedItem`） | ✓ | ✓ | ✗ | ✓ | — | — | — | ✓ | — | 前 4 项用 `<button>` + `:hover`/`:focus-visible` + `[aria-current]`/`[aria-selected]`；`ActivityFeedItem` 用 `div[role="button"]` + class `.active`（`collab-feed.css:30`） |
| **概览/看板非语义可点击项**（`ScheduleRow .bar`/`TodoPanel .item`/`BlockedBy .r`/`HeadlinePanel .tags span`） | ✓ | ◐ | ✗ | ◐ | — | — | — | — | — | `ScheduleRow`/`TodoPanel` 因缺 `data-t` 导致 hover 失效；`TodoPanel`/`BlockedBy`/`HeadlinePanel` 均无 `focus-visible` |
| **消息内 `@文档` 标签 `.mn-tag.doc`**（`MessageItem.tsx:39-56`） | ✓ | ✓ | ✗ | ✓ | ✓ | — | — | — | — | 可用文档为 `<button>`（`:hover` 反白、`:focus-visible` 橙框，`collab-mention.css:86-94`）；失效文档切为 `span.gone` 虚线删除线（L96-106） |

---

## 4. 未使用的 CSS、变量、导出、文件与依赖

### 4.1 CSS 变量盘点（47 个定义变量 + 11 个注入/未定义变量）
- `styles/tokens/typography.css`（35 个）与 `styles/index.css`（12 个）共 47 个 `:root` 变量均至少被 CSS 引用 1 次（0 个纯死定义），但存在：
  1. **完全等价重复变量**：`styles/index.css:14-23` 中 `--hatch`（引用 2 次）与 `--over`（引用 6 次）定义值逐字一致，应合并为单一 Token。
  2. **低频/语义绕过变量**：`--soft`（2 次）、`--mute`（直接引用 3 次，其余 70 次走 `--text-mute`）、`--signal-text`（直接引用 4 次，其余 21 次走 `--text-alert`）。
  3. **全站从未定义/赋值的死变量（2 个）**：
     - `--iz`：`styles/index.css:1352-1355`（4 处，永远回退 `1`）；
     - `--c`：`styles/index.css:2214`（位于死选择器 `.enter .crew > *` 中）。
  4. **TSX 运行时内联注入的局部动态变量（9 个，有效）**：`--i`、`--at`、`--fill`、`--h`、`--name`、`--d`、`--d2`、`--dur`、`--dur2`。
  5. **硬编码覆写全局色变量（4 处反模式）**：`document-final.css:42-47`、`document-revising.css:74-79`、`documents-layout.css:77-78`、`styles/index.css:943-944` 直接写死 hex 覆写 `--paper`/`--ink`，会破坏深色模式。

### 4.2 未使用的 CSS 选择器 / 角色类 / Keyframes / 空规则

| 文件 | 未使用项 | 行号 / 规模 | 核实说明 |
|---|---|---|---|
| `styles/typography/roles.css` | `.t-body`、`.t-figure`、`.t-figure-sm` | L47, L79, L88（3 个角色类） | 11 个 `.t-*` 类中 3 个零引用 |
| `styles/index.css` | `.lab`、`.lab.min`、`#lab-t` 等 | L2102–2149, L2411–2414（11 条规则） | 遗留 Demo 切换条，DOM 已移除 |
| `styles/index.css` | `.enter ...`（18 条）与 `.masthead.first`（1 条） | L2152–2215（19 条规则） | TS/TSX 零挂载 `.enter` / `.first`，整套入场动效从不触发 |
| `styles/index.css` | `@keyframes stroke` | L2248–2252（1 个） | CSS 内部亦零引用 |
| `styles/index.css` | `@keyframes wipe / wipeup / linedown / wipedown / draw / rise / rule` | L2216–2282（7 个） | 仅被未挂载的 `.enter`/`.first` 引用 |
| `styles/index.css` | `.accts button.off` 及子选择器 | L473–487（4 条规则） | 账号菜单不再渲染 `.off` 禁用项 |
| `styles/index.css` | `.me.swapped` | L671（1 条选择器） | 遗留账号切换模拟态 |
| `styles/index.css` | `.fr .pms`、`.fr .pms .pm` | L1856–1863（2 条规则） | TSX 零使用 |
| `styles/index.css` | `.fx-acts .note` | L2094–2099（1 条规则） | 5 个表单抽屉均无 `.note` |
| `styles/index.css` | `.ss .bad` | L1775（1 条选择器） | TSX 零使用 |
| `styles/index.css` | `[data-go]`、`.hero .headline[data-go]:hover` | L1028, L1150（2 处） | TSX 无 `data-go` 属性 |
| `styles/index.css` | `.vt {}` | L2343（1 条空规则） | `@media (max-width: 900px)` 内空声明块 |
| `pages/login/css/login.css` | `.auth-demo-grid` 及子规则 | L138–192（11 条规则，55 行） | 遗留演示账号网格，登录页已接真实认证 |
| `pages/collab/css/collab-feed.css` | `.enter .ev, .enter .msg` | L57–60（1 条规则） | 依赖从未挂载的 `.enter` |
| `pages/timeline/css/timeline.css` | `.enter .gt-line.today` | L288–290（1 条规则） | 依赖从未挂载的 `.enter` |

*(核实排除误报：`.tb-ink`/`.tb-past`/`.tb-warn` 由 `TaskBar.tsx:90` 动态拼接，`.blocked`/`.doing` 由 `BoardColumn.tsx:48` 动态拼接，均有效。)*

### 4.3 重复样式规则与 `styles/index.css`（2,415 行）残留旧全局样式清单

- **逐字重复的跨文件规则**：`.feed`/`.ev`/`.ev time`/`.ev p`（`collab-feed.css:5-17,41-51` vs `task-panels.css:94-115`）；`.df[aria-selected="true"]`（`document-final.css:41-48`）vs `.dr[aria-selected="true"]`（`document-revising.css:73-80`）；`.scroll-x`（`member-crew.css:5` vs `index.css:993`）；`:root` 分散在 `typography.css:4` 与 `index.css:3`；`.tl .bar` 分散在 `overview.css` L106 与 L317。
- **短类名碰撞风险**：全站 414 个 CSS 类中，**69 个通用短类名**跨 2 个以上全局 CSS 文件重复出现（如 `.late` 跨 14 文件、`.now` 跨 6 文件、`.done`/`.on`/`.phd`/`.pnl`/`.k`/`.vh` 各跨 5 文件）。
- **`styles/index.css`（2,415 行）残留旧样式分块清单**：

| 行号范围 | 行数 | 区块内容 | 实际使用方 | 迁移建议 |
|---|---:|---|---|---|
| L1–72 | 72 | `:root` 色板/纹理 + Reset + `:focus-visible` + `.sr`/`.mono` | 全站基础 | 拆至 `styles/tokens/` 与 `styles/base.css` |
| L73–97 | 25 | `.shell` 网格外壳 + 24px 网格线 + `::after` 噪点纸纹 | `layout/Shell.tsx` | 迁至 `layout/` 样式 |
| L98–271 | 174 | 侧栏 `.index`、`.project`、`.grp`、`.sum-card` | `layout/sidebar/*` | 迁至 `layout/sidebar/` |
| L272–532 | 261 | 顶栏浮层 `.issues`/`.projs`/`.notes`/`.accts`/`.afoot`/`.pnew`/`.pfoot`（含死 `.accts .off`） | `ProjectSwitch`/`IssueSwitch`/`NotificationBell`/`AccountMenu` | 迁至 Radix Popover/Dropdown + 删死规则 |
| L533–718 | 186 | 顶栏 `.masthead`、`#issue-wrap`、`.issue`、`.page-note`、`.issue-note`、`.back`、`.weekline`、`.bell`、`.me`（含死 `.swapped`） | `layout/topbar/*` + 4 页空态 | 顶栏迁 `layout/topbar/`，`.page-note` 抽 `EmptyState`/`Alert` |
| L719–789 | 71 | `main`、`.view`、`.vh`、`.vt` | 全站页面 Header | 抽为 `patterns/PageHeader` |
| L790–882 | 93 | `.btn`、`.seg`、`.field`、`.toolbar` | 全站高频基础控件 | 拆为 `ui/Button`、`ui/ToggleGroup`、`ui/Input` |
| L883–1031 | 149 | `.pnl`、`.phd`、`.dark`、`.legend`、`.key`、`.chip`、`.scroll-x/y`、`.lnk`、`[data-t]` | 全站容器与工具类 | 拆为 `patterns/Panel`、`ui/Badge`、`patterns/Legend` |
| L1032–1105 | 74 | `.figures` / `.figure`（KPI 四联指标条） | `overview/FigureStrip`、`task/TaskFigures` | 抽为 `patterns/MetricStrip` |
| L1106–1216 | 111 | `.bar`、`.hero` / `.hero.calm` | `overview`、`reports/ForecastHero` | 抽为 `patterns/HeroCard` + 排期样式 |
| L1219–1247 | 29 | `.tbl`（数据表格） | `timeline/CriticalPanel` | 迁入 `ui/Table` 或 `features/timeline` |
| L1248–1284 | 37 | `.span2`、`.track`（成员负载条） | `members`、`reports`、`settings` | `.track` 抽为 `patterns/LoadBar` |
| L1293–1330 | 38 | `.chips`（芯片按钮组） | 表单抽屉、任务页、设置面板 | 抽为 `ui/ToggleGroup` |
| L1331–1500 | 170 | `.ov`/`.ov-bd`/`.fx` 抽屉壳 + `.ov-head`/`.ov-tabs`/`.double` + `slidein`/`fadein` | `Drawer`、`SettingDrawer` | 迁至 Radix Dialog `ui/Drawer` |
| L1501–1783 | 283 | 系统设置抽屉全套（`.ss`/`.blk`/`.rows`/`.srow`/`.in`/`.sw2`/`.perm`/`.g4`/`.roster`/`.pp`/`#person`/`.roles`/`.logday`/`.lg`） | `overlays/settings/*` | 整体迁至 `features/settings` |
| L1784–2100 | 317 | `.fr`/`.u`（L1784–1863）、`.ap*`（L1864–2054）、`.dz`（L2055–2082）、`.fx-acts`（L2083–2100） | 5 个表单抽屉、`AssigneePicker` | 拆为 `patterns/FormField`、`AssigneeCombobox`、`ui/Dropzone` |
| L2101–2150 | 50 | `.lab` Demo 切换条 | **无（全死代码）** | 直接删除 |
| L2151–2291 | 141 | `.enter` / `.first` 入场动效 + 8 个 `@keyframes` + `prefers-reduced-motion` | **除 reduced-motion 外全未生效** | 已确认删除 `.enter`/`.first` 与 8 个死 `@keyframes`（保留 `prefers-reduced-motion`） |
| L2292–2415 | 124 | `@media (max-width: 900px)` 聚合响应式（含跨页 `.ov1/.ov2/.tg/.dg/.tl` 及空 `.vt{}`、死 `.lab`） | 全站窄屏 | 随模块样式下沉至对应组件/页面 CSS |

### 4.4 未使用的导出符号（TypeScript Compiler API 静态分析）

基于 TypeScript `LanguageService.findReferences` 扫描 `src/` 除 `src/main.tsx` 外的全部 **413 个导出符号**及 `src/api/*.ts` 导出对象方法（`src/App.tsx:9-20` 均为静态导入，无动态路由误报）：

#### A. 真正死代码（外部引用 = 0 且文件内引用 = 0）
1. **顶层导出（4 项）**：
   - `src/shared/utils/download.ts:14` — `downloadTextFile`（函数）
   - `src/pages/members/utils.ts:7` — `formatFullDateTime`（函数）
   - `src/shared/types/reports.ts:136` — `ReportSnapshot`（接口，注释称预留往期切换，实际 `IssuePages.reports` 用 `Reports`）
   - `src/shared/types/members.ts:53` — `MemberSnapshot`（接口，实际 `IssuePages.members` 用 `PastMember[]`）
2. **API 封装对象未被调用的方法（5 项）**：
   - `src/api/task.ts:16` `taskApi.get`、`:22` `taskApi.status`、`:28` `taskApi.activities`（前端统一走 `taskApi.list(detail=true)`、`taskApi.position` 与 `activityApi.list`）
   - `src/api/progress.ts:10` `progressApi.todo`、`:12` `progressApi.priorityRanking`（前端统一走 `progressApi.overview`）
   - *注*：`src/api/report.ts:14-22` 的 5 个单项查询方法在同文件 `reportApi.all`（L28-40）内部被调用，**非死代码**，仅对外暴露多余。

#### B. 仅文件内使用的过度导出（外部引用 = 0，内部引用 ≥ 1，共 34 项）
- **函数（4 项）**：`src/overlays/settings/utils.ts:7` `formatLogDay`、`src/state/task/utils.ts:135` `applyTaskStatus`、`src/shared/components/taskBarModel.ts:59` `getBlockedSpans`、`src/pages/collab/utils.ts:311` `toDiscussionTask`。
- **常量/变量（5 项）**：`src/overlays/settings/sections.ts:9` `sections`、`src/overlays/task/assignee.ts:4` `MAX_VISIBLE_TAGS`、`src/shared/utils/load.ts:2` `DEFAULT_LOAD_SCALE`、`src/pages/documents/utils.ts:15` `DSPAN`、`src/shared/constants/legends.ts:23` `LEGEND_SAMPLES`。
- **接口（25 项）**：
  - `src/shared/types/task.ts:9` `Priority`
  - `src/shared/types/reports.ts:31` `BurndownPoint`、`:89` `DefectDensity`
  - `src/shared/types/progress.ts:12` `GanttTask`、`:43` `CpmApiRow`、`:120` `ScheduleBar`、`:164` `PastMember`
  - `src/shared/utils/date.ts:22` `AxisTick`
  - `src/shared/constants/legends.ts:6` `LegendSampleStyle`
  - `src/shared/components/taskBarModel.ts:22` `BarFill`、`:27` `BarFrame`
  - `src/overlays/settings/sections.ts:25` `SectionViewer`
  - `src/overlays/task/assignee.ts:6` `RankedCandidate`、`:18` `RankResult`
  - `src/layout/nav.ts:4` `NavItem`、`:13` `NavGroup`
  - `src/layout/utils.ts:10` `WeekProgress`、`:47` `PeriodProgress`
  - `src/layout/useNotifications.ts:10` `Notifications`
  - `src/state/issue/useIssueData.ts:11` `IssueData`
  - `src/pages/overview/utils.ts:103` `ScheduleBarView`
  - `src/pages/documents/utils.ts:65` `DocStatusInfo`
  - `src/pages/collab/utils.ts:114` `RichInlineSegment`、`:379` `MentionSegment`
  - `src/pages/collab/useCollabData.ts:24` `CollabData`

### 4.5 孤立文件与 `package.json` 依赖检查
- **`frontend/prototype/`（2 个遗留孤立文件，~180 KB，暂保留待队友确认）**：`prototype/global.html`（63,324 B，1,663 行）与 `prototype/global.js`（117,206 B，3,939 行）在 `src/` 运行时零引用（`index.html:20` 仅加载 `/src/main.tsx`），`frontend/README.md:94` 已注明页面完成后删除；用户已拍板**暂保留待队友确认是否还需参考，不在此轮直接删除**（未来删除时需同步移出 `tsconfig.app.json:25` 的 `"prototype/global.js"`）。
- **`public/` 与 `src/`（0 个孤立文件）**：`public/favicon.svg` 已被 `index.html:10` 引用；`src/` 全部 182 个 `.ts`/`.tsx` 与 40 个 `.css` 文件均可从 `src/main.tsx` 及 `@import` 链可达。
- **`package.json` 依赖（0 个冗余依赖）**：3 项 `dependencies`（`react`、`react-dom`、`react-router-dom`）与 14 项 `devDependencies` 全部在构建/开发/规范链路中使用。缺口为待引入的 Radix UI 原语包以及 `stylelint`、`knip`、`husky`/`lint-staged` 与 `typecheck`/`format:check` 脚本（见第 7 节）。

---

## 5. 分层问题

对照目标单向架构 `services/` → `stores/` / `features/<业务域>/` → `components/patterns/` → `components/ui/`（各 feature 零互引、UI 组件禁止直接发 API 请求），现状存在 5 类结构性问题：

### 5.1 组件与页面 Hook 直接调用 `src/api/*`（11 个文件，24 处调用）
| 文件 | 行号与调用 | 问题与重构去向 |
|---|---|---|
| `src/overlays/settings/panels/MePanel.tsx` | L2, L237 `authApi.changePassword` | 改密直调 API、改资料走 props `onSave`，数据流分裂；迁入 `services/auth` + `stores/auth` |
| `src/overlays/settings/panels/PeoplePanel.tsx` | L2, L29 `userApi.list`/`roleApi.list`, L68 `update`, L78 `setStatus`, L88 `create`, L102 `resetPassword`, L116 `remove` | 375 行 UI 面板承载完整用户管理 CRUD；抽为 `features/settings` service/hook |
| `src/overlays/settings/panels/LogsPanel.tsx` | L2, L18/L37 `logApi.list` | 分页拉取日志耦合在 UI 组件内；抽为 `features/settings` hook |
| `src/overlays/task/TaskDrawer.tsx` | L3, L40 `workloadApi.get` | 表单打开直调负载接口并吞异常（L55 `.catch(() => undefined)`）；抽入 `features/tasks` |
| `src/pages/members/components/InviteMemberDrawer.tsx` | L2, L85 `userApi.search` | 邀请抽屉直调用户搜索接口；由 `features/members` hook 注入 |
| `src/pages/overview/OverviewPage.tsx` | L4, L39 `progressApi.overview` | 页面直接向 `useIssueData` 传 `progressApi` 方法 |
| `src/pages/timeline/TimelinePage.tsx` | L4, L29 `progressApi.gantt`, L31 `progressApi.criticalPath` | 页面直接向 `useIssueData` 传两个 API 方法 |
| `src/pages/reports/ReportsPage.tsx` | L2, L32 `reportApi.all`, L65 `reportApi.export` | 页面同时直接查询报表与下载 Excel |
| `src/pages/collab/CollabPage.tsx` | L3, L235 `collabApi.createDiscussion`, L265 `collabApi.createComment` | 页面组件直接写接口并手动串联 `refresh()` + `reloadTasks()` |
| `src/pages/collab/useCollabData.ts` | L2, L17 `listDiscussions`, L18 `listActivities`, L20 `getDiscussion` | 页面内私有 Hook 承载 N+1 聚合请求；下沉至 `services/collab` |
| `src/layout/useNotifications.ts` | L2, L29 `list`, L30 `unreadCount`, L49 `markRead`, L57 `markAllRead` | 外壳目录直接管理通知接口轮询与读写；抽至 `services/notifications` / `stores/notifications` |

### 5.2 业务逻辑、权限校验与原生阻断弹窗混入 UI 组件
1. **权限与只读口径碎片化且存在遗漏**：
   - `AccessProvider`（`src/state/access/AccessProvider.tsx:23,78-82`）未统一输出 `canManageMember`、`canEditDoc`、`canEditProject`、`canCollab`，导致 `MemberAdminView.tsx:40`、`SettingDrawer.tsx:97`、`ProjPanel.tsx:24-25` 各自重复拼装。
   - **已存在漏洞**：`src/pages/documents/DocumentsPage.tsx:27,181,209-210` 与 `src/pages/collab/CollabPage.tsx:60,210,307,325` 仅判断 `isPast`，**未校验 `isArchived`（及 `permissions.canEditDoc`）**，仅靠后端兜底报错。
2. **领域业务规则与表单校验硬编码在组件内**：
   - `src/pages/members/components/InviteMemberDrawer.tsx:40-66,111`（角色默认权限矩阵与岗位文案）；
   - `src/pages/members/components/MemberCrew.tsx:68-70`（JSX 内联“至少保留一名 PM”保护规则）；
   - `src/overlays/settings/panels/ParamsPanel.tsx:34-65`（优先级权重之和为 1 等参数校验）；
   - `src/pages/documents/components/UploadDocDrawer.tsx:29-41`、`src/overlays/task/TaskDrawer.tsx:83-95`（扩展名/20MB、工期 1~365 等校验）。
3. **视图层混用原生阻断弹窗**：`BoardPage.tsx:35`、`TaskPage.tsx:55,61` 用 `window.alert`；`DocumentsPage.tsx:113` 用 `window.confirm`。
4. **聚合计算散落在渲染函数中**：`Shell.tsx:38`、`SummaryCard.tsx:10`、`BoardPage.tsx:43-50`、`TimelinePage.tsx:72-75` 在渲染函数里直接遍历 `taskMap` 统计。
5. **交互逻辑归属错位：文档拖拽上传逻辑散落在旧外层容器**：
   - **真实实现位置**：旧静态原型 `frontend/prototype/global.js:3291-3309`（对应模板 `L3035` 与 `change` 监听 `L3310-3313`）在外层共享表单容器 `fxForm` 上以事件委托监听 `dragover` / `dragleave` / `drop`，通过 `e.target.closest(".dz")` 切换 `.over` 类并读取 `e.dataTransfer.files[0]`。
   - **分层问题与现存断链**：由于拖拽交互没有封装在上传区组件自身、而是挂在外层表单容器，后续迁入 React（`src/pages/documents/components/UploadDocDrawer.tsx:183-196`）时只搬入了 DOM、文案（“把文件拖到这里，或点此选择”）与 `src/styles/index.css:2070-2073` 的 `.dz.over` 样式，漏迁了外层拖放监听，导致 `src/` 运行时无任何 `dragover`/`dragleave`/`drop`/`dataTransfer` 事件响应。
   - **迁移方案**：迁移文档模块时**保持文案不变**，将完整的 `onDragEnter`/`onDragOver`/`onDragLeave`/`onDrop`、文件读取校验及 `data-drag-over` 视觉态全部**收归到上传组件（`components/patterns/FileDropzone`）内部**。

### 5.3 跨模块 / 跨页面 / 外层之间的违规与交叉引用
- **`shared/components` 反向依赖 `state/`（严重违规）**：`src/shared/components/TaskBar.tsx:2,40` 调用 `useIssue()`，迁移至 `components/patterns/` 时必须改为受控 prop `today: string`。
- **页面间横向互引（违反零互引原则）**：`src/pages/overview/OverviewPage.tsx:9`、`src/pages/overview/utils.ts:18`、`src/pages/overview/components/CriticalChainPanel.tsx:4` 跨页导入 `../timeline/utils` 的 `toForecast` / `TimelineForecast`。
- **页面依赖 `layout/` 内部 Hook**：`src/pages/overview/OverviewPage.tsx:7,30` 导入 `src/layout/useProjectPeriod.ts` 读取 `<Outlet context>`，而 `Shell.tsx:81` 传下的就是 `useAccess().currentProject`。
- **浮层借用 `layout/` 内部 Hook**：`src/overlays/task/AssigneePicker.tsx:9` 导入 `src/layout/useDismiss.ts`（应迁入 `shared/hooks/` 或随 Radix Popover 淘汰）。
- **`layout/Shell.tsx` 强耦合全部业务抽屉与任务 Store**：`Shell.tsx:2,3,7,9,10` 直接挂载 3 个业务抽屉并消费 `useTaskStore`。
- **隐式 `location.state` 跨页契约**：`src/pages/task/TaskPage.tsx:90-95` 通过 `navigate(..., { state: { uploadTaskId / newDiscussionTaskId } })` 隐式触发文档/协作页抽屉，缺少集中类型化契约。

### 5.4 `state/`、`shared/`、`api/` 之间的耦合与边界问题
静态扫描确认当前 **0 个文件级循环依赖**，但存在以下耦合：
1. **7 层 Provider 刚性嵌套与隐式跨 Store 联动**（`src/App.tsx:44-79`）：`Auth` → `Config` → `Project` → `Issue` → `Access` → `Document(key=projectId)` → `Task`；`TaskProvider.tsx:9,49,81` 监听 `useDocumentStore().version` 触发重拉，导致强顺序依赖；`App.tsx:40-43` 还残留过时注释。
2. **`AccessProvider` 承担过多职责**：`AccessProvider.tsx:59-83` 同时转发全部项目/成员 CRUD、往期快照合并与权限计算。
3. **状态层混入 UI 渲染与全局 DOM 副作用**：
   - `ProjectProvider.tsx:156-175`、`TaskProvider.tsx:173-192` 在 Provider 内直接返回错误 `<div className="msg err">` 或 `return null` 阻塞整棵树；
   - `TaskProvider.tsx:64-66,202-209` 混入全局表单开关 `taskForm` 与高亮定时器 `freshTaskId`；
   - `IssueProvider.tsx:102-105` 直接写 `document.body.classList.toggle("past", isPast)`，与 `useCardDrag.ts:72,92` 的 `body.dragging` 跨文件驱动多个 CSS 模块。
4. **`api/` 与 `shared/types/` 边界渗漏**：`src/api/report.ts:10,37` 跨文件调 `workloadApi` 并做 7 接口聚合；`src/state/task/TaskProvider.tsx:3` 跨模块引用 `api/project.ts` 的 `activityApi`；`src/shared/types/auth.ts:44,55` 在纯类型文件里放运行时函数 `toAccount`/`isSystemAdmin`。

### 5.5 全局样式污染与非就近样式依赖
- `layout/`（引用 60 个 `index.css` 类）、`overlays/settings/`（45 个）、`overlays/task/`（40 个）、`overlays/project/`（17 个）与 `Drawer.tsx` **均无任何就近 CSS 文件（0 行）**，100% 依赖巨型全局表 `styles/index.css`。
- 9 个已拆出模块 CSS 的页面（35 个 CSS 文件）仍大量依赖 `index.css` 全局类（members 48、documents 47、overview 42、collab 36、reports 35、timeline 26、task 23、board 15、login 12），且 40 个 CSS 文件均无作用域隔离，存在 `.feed`/`.ev`、`.card`、`.dg`、`.tg`、`.scroll-x`、`.ov1`/`.ov2`/`.tl` 跨文件覆写。

---

## 6. 迁移顺序建议

### 6.1 现有模块规模与耦合盘点
| 模块 | 旧路径 | TS/TSX 规模 | CSS 规模 | 跨层/外部依赖 | 耦合等级 |
|---|---|---:|---:|---|---|
| 登录 | `pages/login/` | 1 文件 / 212L | 1 文件 / 199L | 仅 `state/auth` | 极低 |
| 新建项目抽屉 | `overlays/project/` | 1 文件 / 150L | 0（全用 `index.css`） | 纯受控 props | 极低 |
| 应用外壳 | `layout/` | 15 文件 / 968L | 0（全用 `index.css`） | 挂 3 个 overlays + 5 个 state + `api/collab` | 高（基础底座） |
| 系统设置抽屉 | `overlays/settings/` | 9 文件 / 1,328L | 0（全用 `index.css`） | `api/auth`、`api/system` + 3 个 state | 中 |
| 统计报表 | `pages/reports/` | 14 文件 / 910L | 7 文件 / 469L | `api/report` + 3 个 state | 低-中 |
| 成员与权限 | `pages/members/` | 19 文件 / 1,219L | 5 文件 / 665L | `api/system` + 4 个 state | 中 |
| 文档管理 | `pages/documents/` | 14 文件 / 1,270L | 6 文件 / 608L | 3 个 state（反向牵动 `taskStore`） | 中 |
| 时间线/甘特 | `pages/timeline/` | 9 文件 / 665L | 1 文件 / 298L | `api/progress` + 3 个 state + `TaskBar` | 中-高 |
| 项目总览 | `pages/overview/` | 11 文件 / 728L | 1 文件 / 341L | `api/progress` + `timeline/utils` + `layout/useProjectPeriod` + 3 state | 中（需先解耦 timeline） |
| 任务表单抽屉 | `overlays/task/` | 3 文件 / 653L | 0（全用 `index.css`） | `api/task` + `layout/useDismiss` + 3 state | 中-高 |
| 任务详情 | `pages/task/` | 12 文件 / 524L | 4 文件 / 275L | 3 state + `TaskBar` + 跨页 `location.state` | 中-高 |
| 任务看板 | `pages/board/` | 6 文件 / 500L | 4 文件 / 333L | 4 state + 自定义指针拖拽 + `body.dragging` | 高 |
| 团队协作 | `pages/collab/` | 14 文件 / 1,890L | 6 文件 / 461L | `api/collab` + 全部 6 个 state + `@提及`编辑器 | 极高 |

### 6.2 推荐阶段 4 逐模块迁移顺序（从低耦合到高耦合）

> **迁移前置条件（阶段 1~3 完成）**：Token 与全局样式底座就绪；`components/ui/`（Radix UI 封装）与 `components/patterns/`（`PageHeader`、`Panel`、`FormDrawer`、`MetricStrip`、`AlertDialog`、`Toast`、去状态化 `TaskBar`）落位；`services/` 与拆分后的 `stores/`（补齐统一权限出口、剥离 Provider 内 UI 错误渲染）就位。

| 顺序 | 目标 `features/<域>` | 涉及旧路径 | 依赖基础 UI（`components/ui`） | 依赖范式组件（`components/patterns`） | 主要重构难点与风险点 |
|---:|---|---|---|---|---|
| **1** | `features/auth` | `pages/login/` | `Button`、`Input`、`Checkbox`、`Alert` | `FormField` | **试点模块**：最孤立、0 项目上下文依赖，用来端到端跑通 Token + UI 原语 + CSS Modules 规范；保留记住账号与 `aria-invalid` 焦点回跳。 |
| **2** | `layout` + `features/projects` + `features/notifications` | `layout/`、`overlays/project/` | `Popover`、`DropdownMenu`、`Button`、`Badge`、`Drawer`、`ScrollArea` | `AppShell`、`FormDrawer`、`EmptyState`、`Toast` | 解耦 `Shell` 对 `index.css` 60 个全局类依赖；将 `useNotifications` 迁入 `services/notifications`；移除 `useProjectPeriod` 的 `<Outlet context>`；保住期号切换与无项目空态。 |
| **3** | `features/settings` | `overlays/settings/` | `Drawer`、`Tabs`、`Switch`、`Input`、`Select`、`Button`、`Alert`、`AlertDialog` | `FormDrawer`、`FormField`、`Panel` | 抽离 `MePanel`/`PeoplePanel`/`LogsPanel` 内 9 处直连 API；将 `ParamsPanel` 校验与权限判断下沉 domain 层；剥离 45 个 `index.css` 全局类。 |
| **4** | `features/reports` | `pages/reports/` | `Button`、`ToggleGroup`、`Tooltip`、`Alert` | `PageHeader`、`Panel`、`HeroCard`、`Legend`、`EmptyState` | 只读数据可视化、无跨 Store 写联动；保留一屏视口与 SVG 响应式容器布局，将 `reportApi.all`/`export` 收口至 `services/reports`。 |
| **5** | `features/members` | `pages/members/` | `Input`、`Button`、`Switch`、`Select`、`Drawer`、`Badge`、`Checkbox` | `PageHeader`、`Panel`、`FormDrawer`、`SearchInput`、`LoadBar`、`ActivityFeed` | 拆离 `InviteMemberDrawer` 的 `userApi.search` 与硬编码权限矩阵；将“至少保留一名 PM”与 `canManageMember` 统一收口；兼顾管理/个人双视图与横向滚动负载条。 |
| **6** | `features/documents` | `pages/documents/` | `Input`、`Button`、`Select`、`Drawer`、`Badge`、`Alert`、`AlertDialog`、`FileDropzone` | `PageHeader`、`Panel`、`FormDrawer`、`HeroCard`、`Legend`、`EmptyState` | 用 `AlertDialog` 替换 `window.confirm`；补齐 `canEditDoc` 与 `isArchived` 校验；将文件类型/20MB 校验抽入纯函数；用显式事件替代 `DocumentProvider.version` 隐式耦合。 |
| **7** | `features/timeline` | `pages/timeline/` | `Button`、`ToggleGroup`、`Tooltip`、`ScrollArea`、`Table` | `PageHeader`、`Panel`、`TaskBar`（受控版）、`Legend` | **关键前置解耦**：先将 `TaskBar` 改为接收 `today` prop，并将 `toForecast`/`TimelineForecast` 上提至 `services/progress`，为第 8 步 `overview` 解除跨页依赖；注意甘特依赖连线 SVG 坐标精度。 |
| **8** | `features/overview` | `pages/overview/` | `Button`、`Badge`、`Progress`、`Tooltip` | `PageHeader`、`Panel`、`MetricStrip`、`HeroCard`、`Legend`、`ListRow` | 清除对 `pages/timeline/utils` 与 `layout/useProjectPeriod` 两处违规引用；将 `progressApi.overview` 收口至 `services/progress`；成员排期图保留“精确到此刻”的今天线规则。 |
| **9** | `features/tasks` | `overlays/task/`、`pages/task/`、`pages/board/` | `Button`、`Drawer`、`Popover`、`Input`、`Textarea`、`Select`、`ToggleGroup`、`Badge`、`Alert`、`AlertDialog`、`Toast` | `PageHeader`、`Panel`、`FormDrawer`、`MetricStrip`、`TaskBar`、`AssigneeCombobox`、`ActivityFeed`、`ListRow` | 三处合一迁入统一任务域：先迁 `TaskDrawer` + `AssigneePicker` 与 `TaskPage`（解除 `.feed`/`.ev` 冲突、用 `Toast` 替换 `window.alert`、规范跨页路由参数），最后迁 `BoardPage`（高风险：自定义指针拖拽 `useCardDrag` + Portal 浮卡 + 乐观更新回滚 + 替代 `body.dragging`）。 |
| **10** | `features/collab` | `pages/collab/` | `Button`、`Drawer`、`Popover`、`Input`、`Textarea`、`Badge`、`ScrollArea` | `PageHeader`、`Panel`、`FormDrawer`、`MentionTextarea`、`ActivityFeed`、`EmptyState` | **压轴最复杂模块**（1,890L，跨 6 个 Store + 直连 API）：收口 `useCollabData` 与发帖/回复写后刷新至 `services/collab`；补齐 `isArchived` 只读约束；重构自定义 `@提及` 富文本输入框 `MentionInput`；保住通知跳转 `?discussionId=&commentId=` 定位闪烁与草稿动态转正式讨论链路。 |

---

## 7. 需用户拍板的待定问题清单

进入阶段 1（Token 与主题落地 + 工程门禁配置）前，请确认以下 10 项关键决策：

1. **重构文档存放位置**：阶段 0 的 `audit.md` 已按 Monorepo 约定放在 `frontend/audit.md`；后续的 `design-system.md`、`migration-plan.md` 等重构文档是否继续统一放在 `frontend/` 目录，还是放到仓库 `docs/` 目录？
2. **新增依赖确认**（遵守根 `AGENTS.md` 规则 3）：
   - 运行时 UI 原语：按需引入 `@radix-ui/react-dialog`、`@radix-ui/react-alert-dialog`、`@radix-ui/react-popover`、`@radix-ui/react-dropdown-menu`、`@radix-ui/react-select`、`@radix-ui/react-switch`、`@radix-ui/react-checkbox`、`@radix-ui/react-toggle-group`、`@radix-ui/react-tabs`、`@radix-ui/react-tooltip`、`@radix-ui/react-toast`（或统一使用 `radix-ui` 单包）。
   - 开发期质量门禁：`stylelint`（+ `stylelint-config-standard`）、`knip`、`husky` + `lint-staged`（注意根仓库 `.git` 在上一层，配置 `husky` 时需确认是否只在本分支/前端生效，不改根配置文件）。是否全部同意引入？
3. **极小字号 `10px`（69 次）与展示字号 `18px/36px/60px` 取舍**：
   - `10px` 是全站最高频字号（所有 `// KICKER`、坐标轴、徽章、时间）。建议：**保留 `10px`（`--font-size-2xs`）维持报刊高密度一屏排版**，还是出于可读性下限抬升至 `11px` / `12px`？
   - `18px`（2 次）与 `36px`（1 次）建议合并到相邻档位 `22px` / `28px`；`60px`（2 次）是否合并进 `56px`？
4. **非 4px 倍数高频间距取舍**：`6px`（53x）、`10px`（58x）、`14px`（42x）、`2px`（29x）合计近 200 次。是**引入 2px 半步阶梯**（`--space-0-5`/`1-5`/`2-5`/`3-5`，零视觉漂移过渡），还是**严格对齐 4px 整数倍**（4/8/12/16，页面略变宽松）？
5. **核心描边 `1.5px`（80 次）与圆角 `0px` 策略**：
   - 描边：保留 `1.5px` / `2.5px` 延续现有硬朗报刊质感，还是整数化为 `1px` / `2px` 避免非 HiDPI 屏亚像素模糊？
   - 圆角：坚持全站 `0px` 直角，还是允许 Switch / Tooltip / Toast 等个别原子控件采用 `2px–4px` 微圆角？
6. **深色模式视觉方向**：
   - 骨架边框：高对比浅灰（`#cfcec8`，保留黑框报刊特征）还是柔和中灰（`#5e5e5e`，降低视觉疲劳）？
   - 局部反色面板（`.dark` / 文档选中项等 4 处）：在深色下继续做高对比浅纸反白块，还是改为抬升深灰表面 + 信号橙边？
   - 全局纸张噪点层 `.shell::after`（`mix-blend-mode: multiply`）：深色模式下改用 `soft-light` / `overlay` 还是关闭纸纹？
7. **语义状态色（Success / Warning / Info）策略**：现有界面严格遵守“暖纸黑白 + 单信号橙”克制语言（无绿/黄/蓝）。重构后是**保持纯黑白橙单强调色**，还是引入草案中预留的低饱和绿/琥珀/蓝辅助状态色？
8. **原生 `window.alert` / `window.confirm` 与 3 种二次点击确认**：是否同意统一替换为 Radix `AlertDialog`（危险操作二次确认）与 `Toast`（状态拦截与操作反馈）？
9. **遗留死代码与未生效特性的去留（已确认结论）**：
   - `frontend/prototype/`（180 KB）及 `tsconfig.app.json:25` 引用：**暂保留，待队友确认是否还需参考后再决定删除**。
   - `styles/index.css` 中 141 行从未触发的 `.enter`/`.first` 入场动效与 8 个死 `@keyframes`：**确认删除**（保留 `prefers-reduced-motion` 无障碍降级）。
   - `UploadDocDrawer` 拖拽上传区（`.dz`）：经复查，原拖拽实现位于 `frontend/prototype/global.js:3291-3309` 外层容器 `fxForm` 事件委托中，属分层归属问题（已补充至第 5.2 节）；迁移文档模块时将完整拖拽逻辑收归上传组件内部，**文案“把文件拖到这里，或点此选择”保持不变**。
10. **无障碍与状态补齐基线**：是否同意在组件重写时一并补齐全站缺失的 `:active` 按压态、表单 `aria-invalid` 红框视觉、禁用态统一弱化、以及 6 处非语义点击元素（`div`/`span`/`article`）的键盘可达性修复？
