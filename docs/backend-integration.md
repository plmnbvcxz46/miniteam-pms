# 后端对接说明

给后端同学看。前端页面已基本完成，现在读的是 `frontend/src/data/` 里的假数据，部分数据由前端按假数据现算。后端按 `docs/api/openapi.yaml` 实现，不要照着假数据反推字段。本文说明哪些接口前端用到了、哪些没用、哪些前端自己算了、哪些需要先定设计。

## 一、安全：前端的过滤不是安全边界

前端 `src/access/` 和各页面的可见性过滤只负责界面显示，隐藏的按钮和页面，别人改请求照样能发。后端必须独立保证：

- 身份只认 JWT，不信请求里传的用户 id。
- 每个请求都校验“当前用户是否是这个项目的成员、有没有这项权限”。系统管理员所有项目都能进、所有权限都有。
- 列表接口在服务端过滤；单个资源（任务、文档、讨论）没权限返回 403。
- 往期（`/issues/{issueDate}` 的快照）和当前用同一套权限规则。
- 所有写接口自己校验权限和参数，不信任前端已经校验过。

## 二、前端已用到的接口（优先实现）

按“前端换数据来源就能用”的顺序，建议先做增删改查类：

1. 认证：`/auth/login`、`/auth/register`、`/auth/logout`、`/auth/me`、`/auth/password`（已做）
2. 项目和成员：`/projects`、`/projects/{id}`、归档、`/projects/{id}/members`、`/users/search`（已做）
3. 用户和设置：`/users`（含状态、重置密码）、`GET /roles`、`/configs`、`/logs`（已做）
4. 任务：`/projects/{id}/tasks`、`/tasks/{id}`、状态、位置、`/tasks/{id}/predecessors`、`/tasks/{id}/activities`、`DELETE /tasks/{id}`（只有项目经理和系统管理员能删，过去的期不能删，删除后其他任务的前置、后续里要去掉它）（已做，见第六节交接）
5. 讨论、文档、通知：`/discussions`、评论、`/documents`、定稿、版本下载、`/notifications`、`/projects/{id}/activities`

每个接口的字段以 openapi 为准，前端 `types/` 里的类型和它对齐。

## 三、前端自己算了的数据（后端要实现这些接口）

这些在文档里都有对应接口，前端现在没调，是从任务现算的替身。接口通了以后前端改读接口，对应算法和假数据一起删。算法位置可以当参考实现。

| 前端的替身 | 前端位置 | 对应接口 |
|---|---|---|
| 任务优先级得分 | `pages/board/priority.ts`，权重取系统参数 | `/priority-ranking`，任务的 `priority` |
| 预测完工、延期天数、关键路径 | `pages/timeline/utils.ts` 的 `computeCpm`、`getForecast` | `/reports/forecast`、`/critical-path` |
| 报表概况、燃尽、每周完成、工期偏差、成员负载 | `pages/reports/derive.ts` | `/reports/summary`、`burndown`、`weekly-completed`、`duration-deviation`、`/workload` |
| 总览的待办、关键路径面板 | `pages/overview/` | `/todo`、`/overview`、`/critical-path` |
| 看板、时间线 | `pages/board/`、`pages/timeline/` | `/board`、`/gantt` |
| 报表 Excel 导出 | `utils/xlsx.ts` | `/reports/export` |

**验收办法**：后端用 `frontend/src/data/` 的假数据做种子，接口返回值应该和前端现在算出来的一致。不一致就说明有一边写错了，先对照 `derive.ts` 和 `priority.ts` 找原因。

## 四、需要先定设计的事

### 往期快照

前端有“切换期数”：过去的期只读，任务、文档、讨论、动态、成员工时都显示那一期当时的样子。文档里只有 `GET /projects/{id}/issues/{issueDate}` 的 `snapshot`，和前端需要的不齐：

- 快照里没有成员页和成员工时（前端读的是 `data/issueMemberHours.ts`）。
- 前端假数据用的是任务状态和进度的当期值，文档、讨论、动态、变更记录是按时间从当前数据里筛的。

两种做法：

| 做法 | 优点 | 缺点 |
|---|---|---|
| 期末存一份快照（JSON 或快照表） | 实现简单，查询快 | 历史不能回头重算 |
| 按状态变更记录回推 | 灵活 | 必须保证每次变更都有记录，工作量大 |

建议用第一种。无论哪种，都要把前端用到的字段补进 `snapshot` 的 schema。如果不存成员页的往期数据，前端就在往期时成员页只显示当前，要和前端说。

### 系统角色

已定：系统角色只有 `ADMIN` 系统管理员和 `USER` 普通用户，`V2__system_roles.sql` 已把种子改成这两个。项目经理、普通成员、测试人员是项目内的角色，存在 `project_member.project_role`，不属于系统角色。注册的账号默认是 `USER`。

### 里程碑

前端已移除“所属阶段”。接口已用注释标“暂不实现”，但 `TaskCard`、`TaskDetail` 的 schema 里还留着 `milestoneId`、`milestone`（`required` 里也有 `milestoneId`）。先一直返回 null；是否从 schema 里删掉之后再定。

## 五、暂不实现的接口

`openapi.yaml` 里这类接口在方法名上一行写了 `# 暂不实现：前端没有对应功能，之后按需补充`，一共 39 个：

- 里程碑全套
- 缺陷全套，以及 `/reports/defect-density`
- 字典 `/dicts` 全套
- 推荐指派 `/assign-suggestions` 和 `/apply`
- 角色的新建、修改、删除，`GET /permissions`
- 依赖的列表、新增，`DELETE /dependencies/{id}`（前端保存时走的是 `PUT /tasks/{id}/predecessors`）
- 恢复项目、删除项目
- 单独改进度、改负责人
- 成员的移除（修改角色岗位、改权限前端在用，已实现）
- 删除讨论、删除评论
- 文档的新建、修改、删除、上传新版本
- 通知的全部已读、未读数
- `GET /users/{userId}`

这些之后会按需补，先不用做。用 `grep -n "暂不实现" docs/api/openapi.yaml` 可以列出来。

## 六、任务模块交接（给做下一个模块的人）

任务模块把任务、看板、前置任务、任务动态、优先级、关键路径标记、成员负载做完了。下一个模块是**进度和报表**：甘特图、关键路径面板、总览、待办、优先级排名、统计报表、导出，顺带往期快照。下面是接着做需要知道的事。

### 已经有的东西，直接用

| 东西 | 位置 | 说明 |
|---|---|---|
| 关键路径（CPM） | `task/CriticalPath.java` | `CriticalPath.compute(nodes)` 输入任务 id、计划工期、前置 id，返回每个任务的 es/ef/ls/lf/slack 和总工期，slack 为 0 即关键。甘特图、`/critical-path`、预测完工都复用它，不要再写一份 |
| 优先级得分 | `task/PriorityCalculator.java` | 输入任务和系统参数，返回得分和高/中/低。`/priority-ranking`、`/todo` 直接用 |
| 工作日 | `task/WorkdayCalendar.java` | 加工作日、数工作日、逾期天数，周六日不算，没有法定节假日 |
| 依赖成环检查 | `task/DependencyGraph.java` | |
| 项目内权限 | `project/ProjectAccess` | 每个接口第一步 `require(projectId)`，同任务模块 |
| 一次取项目全部任务和依赖 | `TaskService.Snapshot`（私有类） | 把任务、依赖、关键路径、优先级一次算好。进度和报表模块要用时，把它抽成独立的类（比如 `task/ProjectTaskSnapshot`）再被 `TaskService` 和新模块共用，不要各算各的 |
| 看板可见范围 | `TaskService.visible` | 有“编辑任务”权限的看全部，其他人只看自己负责的和关键路径上的。总览、甘特图、待办等要用同一条规则 |
| 成员负载 | `report/service/WorkloadService`、`GET /projects/{id}/workload` | `weeklyHours` 目前和 `loadHours` 同一口径（未完成任务预估工时之和），做报表时如果要区分“本周”的工时，改这里和 `MemberVO` |

### 任务模块里已经定下的规则（做报表要对得上）

- 任务编号 `taskNo` 是项目内 `MAX+1`，和 `id` 不同。前端显示 `T-编号`，链接用 `id`。
- 已完成的任务 `critical` 为 false、优先级得分为 0（不参与评分）；`overdueDays` 已完成为 0，未完成是今天减去截止日。
- “今天”取项目当前所在的那一天：`IssueCalendar.effectiveDate(startDate, actualEnd, today)`，已归档项目停在结束日期。
- 状态变化的副作用：进入已完成记完成日、进度 100；离开已完成清完成日、进度 0；第一次离开待开始记实际开始；移回待开始清实际开始和完成日。
- 任务动态（`operation_log`，`targetType=TASK`）里状态变化的 `detail` 是“某某 把任务移到阻塞”，前端时间线用文案里有没有“阻塞”推算阻塞区间，**没有结构化的前后状态**。报表要统计阻塞时长、甘特图要画阻塞段时，建议在日志里加结构化字段（或另建状态变更表）再改前端 `getBlockedSpans`。
- 任务列表 `?detail=true` 返回 `TaskDetail`（`TaskCard` 的超集），前端靠它一次取完整任务表。任务多了以后再考虑分页。
- 预估工时 `estHours` 默认 `planDays × 8`，前端表单目前不让填，所有任务都是这个值，所以负载、燃尽图的“工时”口径现在等于工期×8。

### 还在前端现算、要换成接口的东西

| 前端位置 | 现在 | 换成 |
|---|---|---|
| `pages/timeline/utils.ts` 的 `computeCpm`、`getForecast`、时间线页 | 用任务表现算关键路径和预测 | `GET /gantt`、`GET /critical-path`。后端预测完工的算法文档里没写细，前端 `getForecast` 的口径是“关键路径上未完成任务里逾期最多的那个，把整体往后拖几个工作日”，先照这个做，和前端对得上再删前端 |
| `pages/overview/` 的 `utils.ts`、总览各面板 | 用任务表现算统计、头条、待办、成员排期、关键链 | `GET /overview`、`/todo`。**待办口径不一致**：前端取“逾期或今天到期”的任务，接口写的是“当前用户未完成任务按优先级得分排序”，做的时候和前端确认选哪个，改接口文档或改前端 |
| `pages/reports/derive.ts`、`utils/xlsx.ts` | 报表概况、燃尽、每周完成、工期偏差、预测、负载、Excel | `GET /reports/*`、`/reports/export` |
| 往期（`issue/IssueProvider`、各页面的 `isPast`） | 往期任务页**显示当前任务、只读**，不存快照；成员工时用 `data/issueMemberHours.ts` | 要做快照时见本文“四、往期快照”；做了之后前端把任务页往期改读 `GET /issues/{issueDate}` 的 `snapshot`，并删掉 `data/issueMemberHours.ts` |

### 前端要一起做的事（下个模块接通时）

1. 时间线、总览、报表改读新接口后，删掉 `computeCpm`、`getForecast`、`pages/overview/utils.ts` 里的现算、`pages/reports/derive.ts`，同步 `frontend/AGENTS.md` 的“前端替身”表。
2. 任务页往期的提示：现在往期只是把写操作禁用，页面上没有“显示的是当前数据”的提示，做快照前可以加一句，做了快照就不用了。
3. `TaskProvider` 现在一次取最多 100 条任务动态给时间线用，任务多、动态多时会被截断，换成结构化的阻塞数据后可以删。
4. 文档、讨论还没接，`TaskProvider` 里任务的 `documents` 仍由前端的文档假数据按 `taskId` 拼出来，“文档没定稿不能完成任务”也是前端本地检查；做文档模块时要把这条规则放到后端 `PUT /tasks/{id}/status`、`/position` 里，并让 `TaskDetail.documents`、`discussions` 返回真实数据（现在是空数组）。

### 开发库里的测试数据

联调时造的测试账号（`ptk` 开头）、测试项目（“任务联调…”）已经清掉。id=1 的“测试项目 App”里有一批演示任务（管理员是项目经理），文档、讨论的假数据里写死的任务 id（128 到 150）对不上这些真实任务，所以演示项目里从文档、讨论点进任务会回到看板，做文档和讨论模块时一起处理。
