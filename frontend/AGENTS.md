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
| `currentUser` | `GET /auth/me` |
| `users`（项目成员的 `UserBrief`，各模块假数据共用） | `GET /projects/{projectId}/members` 的 `user` |
| `myProjectRole`、`myPermissions` | 项目详情的 `myProjectRole` / `myPermissions` |
| `currentIssue`（`IssueInfo`：期号、`M.DD` 日期、完整日期） | 期号取项目详情的 `issueNo`；日期直接取本地当前时间，不走接口 |
| `roleLabel` 等枚举中文名 | 前端常量 |

以后接入全局状态时，只替换 `data/global.ts` 的来源。

### 模块（`types/<模块>.ts`、`data/<模块>.ts`）

- 只放本模块独有的结构；共享结构从 `./global` 引入。
- 文件内按“纯前端常量 → 接口假数据”分段，每份接口假数据上方注释对应接口，如 `/** GET /projects/{projectId}/members */`。
- 快照类型继承 `IssueInfo`，快照对象用 `...currentIssue` 填期号，不要再写死。
- 能由接口字段算出来的值（统计数、百分比、日期截取等）在组件里计算，不进假数据。

