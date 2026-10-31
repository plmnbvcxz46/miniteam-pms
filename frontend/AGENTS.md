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

- 拆分参考 `pages/documents/`。
- 从 `styles/index.css` 迁出某模块样式时，在原位置留一行注释说明迁到了哪里。

## 假数据与类型

接口未接通前，页面一律从 `src/data/` 读假数据，类型放 `src/types/`，字段名和结构**严格对齐** `docs/api/openapi.yaml`，以后换成真实请求时只改数据来源，不改组件。

### 全局（`types/global.ts`、`data/global.ts`）

多个模块共用、或暂时拿不到的登录态和项目上下文，统一放这里，**不要在模块文件里重复定义**：

| 内容 | 将来的真实来源 |
|---|---|
| `UserBrief`、`ProjectRole`、`MemberPermissions`、`PermKey`、`Activity` 等共享接口结构 | OpenAPI 公共 schema |
| `currentProjectId` | 路由或项目上下文 |
| `currentUser` | `GET /auth/me` |
| `myProjectRole`、`myPermissions` | 项目详情的 `myProjectRole` / `myPermissions` |
| `currentIssue`（`IssueInfo`：期号、`M.DD` 日期、完整日期） | 期号取项目详情的 `issueNo`；日期直接取本地当前时间，不走接口 |
| `roleLabel` 等枚举中文名 | 前端常量 |

以后接入全局状态时，只替换 `data/global.ts` 的来源。

### 模块（`types/<模块>.ts`、`data/<模块>.ts`）

- 只放本模块独有的结构；共享结构从 `./global` 引入。
- 文件内按“纯前端常量 → 接口假数据”分段，每份接口假数据上方注释对应接口，如 `/** GET /projects/{projectId}/members */`。
- 快照类型继承 `IssueInfo`，快照对象用 `...currentIssue` 填期号，不要再写死。
- 能由接口字段算出来的值（统计数、百分比、日期截取等）在组件里计算，不进假数据。

