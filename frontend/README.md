# miniteam-pms 前端

小型软件团队项目管理系统的前端应用，基于 **React 19 + TypeScript + Vite 8 + React Router 7 + `radix-ui`（单包） + CSS Modules + Design Tokens**，包管理器为 **pnpm**。

> 架构与设计系统重构（阶段 0 ～ 阶段 4）已完成落位；所有业务页面均已接通真实后端接口（以 `../docs/api/openapi.yaml` 为准），无前端假数据。

---

## 快速开始

```bash
pnpm install
pnpm dev
```

- 本地开发通过 Vite `server.proxy` 将 `/api/...` 请求转发到后端，默认目标为 `http://localhost:8080`。
- 如需代理到其他后端地址，可在个人文件 `frontend/.env.local`（已被忽略）中配置：
  ```env
  DEV_API_TARGET=http://你的后端地址:端口
  ```
- **开发环境组件样式手册**：本地运行 `pnpm dev` 时可免登录访问 `http://localhost:5173/#/dev/ui`（或 `/dev/ui`），查看全部基础组件与范式组件状态；该路由通过 `import.meta.env.DEV` 控制，生产构建自动排除。

### 常用命令

| 命令 | 说明 |
|---|---|
| `pnpm dev` | 启动本地开发服务器（默认 `5173`） |
| `pnpm test` | 运行任务时间条模型单元测试（`scripts/test-taskbar-model.ts`） |
| `pnpm check` | 提交前全量门禁：依次执行 `pnpm lint`、`pnpm lint:css`、`pnpm lint:lines`、`pnpm typecheck`、`pnpm knip` |
| `pnpm build` | 运行 `tsc -b && vite build` 生成生产包（`dist/`） |
| `pnpm preview` | 本地预览 `dist/` 构建产物 |

---

## 目录结构

```text
frontend/
├── scripts/
│   ├── check-css-lines.mjs          # CSS / CSS Modules 有效行数门禁（建议 ≤150，硬上限 ≤250）
│   └── test-taskbar-model.ts        # TaskBar 几何与阻塞状态计算单元测试
├── prototype/                       # 原型 global.html / global.js，仅作历史参考，不参与构建
└── src/
    ├── App.tsx、main.tsx            # 应用入口、Hash 路由、Provider 装配与 /dev/ui 拦截
    ├── styles/                      # 全局样式底座（已彻底清零旧过渡样式）
    │   ├── tokens/                  # 纯 CSS 变量定义（primitives/semantic/components/layout/typography/motion）
    │   ├── base.css                 # Reset、color-scheme、基础排版、:focus-visible、.sr-only、reduced-motion
    │   └── main.css                 # 统一样式入口：tokens/*.css → base.css
    ├── components/
    │   ├── ui/                      # 19 项无业务基础组件（Alert/Button/Drawer/Input/Progress/Select/Tabs/Toast 等）
    │   └── patterns/                # 跨模块业务范式组件（PageHeader/Panel/FormDrawer/SearchDropdown/TaskBar/MetricStrip 等）
    ├── features/                    # 按业务域收敛的页面、局部组件、领域 hooks 与工具函数（共 11 个域）
    │   ├── auth/                    # 登录与注册
    │   ├── overview/                # 项目日报（指标条、本周排期、Headline、今日待办、进度、关键路径）
    │   ├── tasks/                   # 任务看板（4 列拖拽与键盘访问）+ 任务详情页 + 任务新建/编辑抽屉 + AssigneePicker
    │   ├── timeline/                # 依赖排期甘特图、关键路径表与完成日期预测
    │   ├── reports/                 # 燃尽图、工时负载、周完成、工期偏差与 Excel 导出
    │   ├── collab/                  # 团队协作（讨论话题、消息流、@ 成员/任务文件、右侧项目动态、发起讨论抽屉）
    │   ├── documents/               # 文档与版本（修订中/定稿、拖拽上传、版本上传、定稿确认、下载）
    │   ├── members/                 # 成员管理、项目角色、6 项细粒度权限开关与成员负载
    │   ├── projects/                # 新建项目抽屉
    │   ├── notifications/           # 顶栏通知铃铛与未读跳转
    │   └── settings/                # 系统管理与个人设置大抽屉（个人资料/改密/人员/角色/系统参数/操作日志/项目归档）
    ├── layout/                      # 主应用外壳（Shell、侧栏导航、项目切换、期次切换、本周工期进度、账号菜单）
    ├── services/                    # 统一 HTTP 封装（http.ts）与各业务模块接口调用
    ├── stores/                      # 全局状态（auth/access/project/issue/task/document/config 与 ProviderError）
    ├── shared/                      # 跨层通用常量、类型（对齐 openapi.yaml）与纯工具函数
    └── dev/                         # 仅开发环境生效的 /dev/ui 组件样式手册页
```

---

## 页面路由与主要入口

- **未登录**：登录 / 注册页（`LoginPage`）。
- **主工作区（`Shell` + Hash 路由 `#/...`）**：

| 路由 | 对应模块 | 核心功能 |
|---|---|---|
| `/overview` | `features/overview` | 项目日报：KPI 指标、本周成员排期、风险头条、今日待办、项目进度与关键路径 |
| `/board` | `features/tasks` | 4 列任务看板（`TODO` / `DOING` / `BLOCKED` / `DONE`）、视角筛选、拖拽与键盘打开详情 |
| `/board/task?id=...` | `features/tasks` | 任务详情、状态切换、前置/后续依赖、绑定文档与操作记录 |
| `/timeline` | `features/timeline` | 多视图时间线甘特图（含关键路径高亮与共享主干连接线）、关键路径分析与新建任务 |
| `/reports` | `features/reports` | 燃尽图、工时负载、周完成、工期偏差对比与导出报表 |
| `/collab` | `features/collab` | 讨论列表、详情消息流（支持 `@成员` / `@任务文件`）、项目动态联动与发起讨论抽屉 |
| `/documents` | `features/documents` | 修订中/定稿文档展示、详情与版本历史、拖拽上传/传新版本、定稿锁定与下载 |
| `/members` | `features/members` | 成员列表、角色与权限矩阵管理、邀请成员、工时与权限变更日志 |

- **全局浮层与往期视图**：
  - 顶栏支持**期次切换**：切换到过去期次时全站自动进入**只读模式**并展示对应期次快照（`IssueProvider`）。
  - 顶栏/侧栏挂有**系统管理与个人设置抽屉**（`SettingsDrawer`）、**通知铃铛**（`NotificationBell`）、**新建/编辑任务抽屉**（`TaskDrawer`）及**新建项目抽屉**（`NewProjectDrawer`）。

---

## 开发约束与协作文档

提交代码前请在 `frontend/` 运行 `pnpm test`、`pnpm check` 与 `pnpm build`，确认全部退出码为 `0`：

1. **单向依赖红线（`eslint.config.js` 拦截）**：`features/*` → `components/patterns/*` → `components/ui/*` → `styles/tokens/*`；各 `features/<域>/` 之间禁止互引；`*.tsx` 组件内禁止直接导入 `services/*`。
2. **UI 组件库引入**：统一从 `"radix-ui"` 单包具名导入，不引入独立 `@radix-ui/*` 分包，不私自新增重型第三方依赖。
3. **样式与 Token 红线（`stylelint.config.mjs` 校验）**：统一使用 `*.module.css` 与 `data-*` 状态属性；禁止引用 `--gray-*` / `--signal-*` 原始色板或写死色值；传给 `components/ui/` 的 `className` **仅限布局属性**（边距、尺寸、定位），不得覆盖视觉风格。
4. **体量门禁**：`.ts` / `.tsx`（覆盖 `components`、`dev`、`features`、`layout`、`services`、`stores`）及样式文件有效行数建议 **≤ 150 行**、硬上限 **250 行**；单函数有效行数 **≤ 80 行**。

详细约定请参阅：
- 仓库总协作规范：[`../AGENTS.md`](../AGENTS.md)
- 前端开发与验收规范：[`AGENTS.md`](./AGENTS.md)
- 设计系统 Token 与组件规范：[`DESIGN.md`](./DESIGN.md)
- 阶段 0 基线审计与阶段 3.5 组件盘点：[`audit.md`](./audit.md)、[`custom-components.md`](./custom-components.md)
