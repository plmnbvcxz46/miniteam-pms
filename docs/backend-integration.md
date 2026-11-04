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

## 三、前端自己算了的数据（已全部换成接口）

任务优先级、关键路径、预测完工、总览、待办、统计报表、Excel 导出、往期快照，都已经由后端接口提供（任务模块、进度和报表模块），前端现算的替身和假数据已经删除。后端的计算放在纯函数里、有单元测试：`task/PriorityCalculator`、`task/CriticalPath`、`progress/ProgressCalculator`、`progress/ProgressForecast`、`report/ReportCalculator`，输入都是 `task/ProjectTaskSnapshot`（某一天的全部任务和依赖），所以实时接口和往期快照用的是同一份代码。

## 四、需要先定设计的事

### 往期快照

已定并做完（进度和报表模块）：
- 每天零点（`Asia/Shanghai`）给每个还没归档的项目存一份“昨天结束时”的原始数据，写进 `daily_issue`：`snapshot` 里是 `{tasks, dependencies, members}`，另外把头条、预测完工、延期天数存进各自的列。服务启动时会补一次昨天缺的（存的是启动那一刻的状态）。
- 读往期（`GET /issues/{issueDate}`）时不直接返回存下来的结果，而是用同一套计算类，按存档数据和那一天的日期重新算出 `overview`、`gantt`、`criticalPath`、`reports`、`tasks`、`members`，并按调用人的权限过滤。好处是不会把“只有项目经理看得到的任务”固化进别人的视图，也不用维护两份计算逻辑。
- 当前这一期（今天，已归档的项目是结束日期）不用存档，按实时数据算。服务没有跑过的日子没有存档，读它返回 404“这一期没有存档”，前端往期页面显示提示。
- `discussions`、`documents` 两个键现在是空数组，文档、讨论模块接通后要把它们的原始数据加进 `StoredState` 并在 `IssueSnapshotService.pages` 里算出来。

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

> 这一节是任务模块留下的交接，当时“进度和报表”还没做。那个模块现在做完了，做了什么见第七节；下面的内容原样保留，当作规则和历史参考，其中“还在前端现算、要换成接口的东西”和“前端要一起做的事”两小节里的 1、2 两项已经完成。

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

## 七、进度和报表模块交接（给做文档、讨论、协作模块的人）

进度和报表模块把甘特图、关键路径面板、总览、今日待办、优先级排名、统计报表、Excel 导出、往期列表和往期快照做完了，前端时间线、总览、报表三个页面和顶栏的往期切换都读真实接口。下面是后面的模块要知道的事。

### 已经有的东西，直接用

| 东西 | 位置 | 说明 |
|---|---|---|
| 某一天的任务快照 | `task/ProjectTaskSnapshot` | 输入“今天”、全部任务、依赖、系统参数，算好前置/后续、关键路径（CPM）、任务卡上的 `critical`、优先级。不读库。可见范围规则 `visibleTo` 也在这里 |
| 读库并交给计算类 | `progress/service/ProjectDataLoader` | `load(project)` 取项目现在的样子，`load(project, date)` 指定“今天”；`viewer(ctx)` 得到“谁在看” |
| 进度计算 | `progress/ProgressCalculator`、`ProgressForecast` | 甘特图、关键路径、总览、待办、优先级排名、预测完工 |
| 报表计算 | `report/ReportCalculator`、`ReportExport`、`XlsxWriter` | 概况、燃尽、每周完成、工期偏差、成员负载、Excel（`java.util.zip` 手写，没有加依赖） |
| 往期 | `progress/service/IssueSnapshotService` | 每日零点生成、启动补生成、列表、某一期。接口在 `IssueController` |

### 口径（前后端要对得上）

- **可见范围**：有“编辑任务”权限的看全部任务，其他人看自己负责的和关键路径上未完成的。统计数字、列表、报表里的数量都只算看得见的任务；关键路径和预测完工用项目全部任务算，不随可见范围变。
- **预测完工**：计划完成日 = 全部任务截止日的最大值（没有任务取项目计划结束日）；延期天数 = 未完成的关键路径任务里逾期最多的那个（逾期天数相同取编号小的）；预测完成日 = 计划完成日加延期天数个工作日。
- **关键路径标记有两种**：任务卡上的 `critical` 是“在关键路径上且没完成”；甘特图、关键路径面板的 `critical` 是总时差为 0，已完成的也算。
- **甘特图字母编号**：有排期（计划开始和截止日都有）的任务按计划开始日、任务编号排，A、B、…、Z、AA…；对所有人一样。没有排期的任务不在甘特图和关键路径面板里。
- **今日待办**：当前用户负责的未完成任务按优先级得分从高到低，得分相同先到期的在前，取系统参数 `priority.top_n` 条；`dueTag` 是逾期 / 今天 / 周几 / 下周几 / M月D日 / 无截止。
- **燃尽图**：以“项”为单位；实际 = 这一天结束时还没完成的任务数；计划 = 截止日在这一天之后的任务数；预测从今天剩余项数线性降到预测完成日。
- **工期偏差**：最近完成的 5 个，实际天数按日历天（含首尾）算。
- **总览的 `headline`**：先看关键路径上的逾期任务，再看逾期最久的；`title` 是整句话（逗号前后各一段）。
- **往期**：`GET /issues` 里当前这一期的头条是实时算的，过去的期用存档里的列。往期页面（任务看板、时间线、总览、报表、成员页）都读 `GET /issues/{issueDate}` 的 `snapshot`，只读。

### 还没做、后面的模块要接的

1. **文档、讨论进快照**：`IssueSnapshotService.pages` 里 `discussions`、`documents` 现在是空数组；往期的文档页、协作页前端还在用 `getDocsAtDate` 等函数从现有假数据里按时间筛。做文档、讨论模块时把它们的原始数据加进 `StoredState`（存档格式向前兼容：读的时候忽略不认识的字段、缺的字段是空），前端改读 `snapshot`。
2. **“文档没定稿不能完成任务”**：仍是前端 `TaskProvider` 的本地检查，要搬进 `PUT /tasks/{id}/status`、`/position`，并让 `TaskDetail.documents`、`discussions` 返回真实数据。
3. **阻塞区间**：时间线任务条的阻塞段仍靠任务动态文案里有没有“阻塞”推算（`getBlockedSpans`），`TaskProvider` 因此一次取 100 条任务动态。要精确就加结构化的状态变更记录，再改前端并删掉这次取动态。
4. **`ProjectSummaryVO.headline`**：项目列表里的 `headline` 仍是 null（避免列表接口给每个项目都读一遍任务）；顶栏的头条来自往期列表。
5. **成员页的 `weeklyHours`**：仍和 `loadHours` 同一口径（未完成任务预估工时之和），要区分“本周”的工时要同时改 `WorkloadService`、`ReportCalculator.workload`、`MemberVO`。

### 注意

- 没存档的日子（项目开始后服务没有跑过零点）读往期是 404。开发库里除了刚做这个模块之后的日子，之前的期都没有存档；id=1 的“测试项目 App”补了几期演示用的存档。
- 启动补生成会给开发库里所有进行中的项目写一份“昨天”的存档（只写缺的），这是正常的。
- 存档的 JSON 直接序列化了 `Task`、`TaskDependency`、`ProjectMember` 这几个实体：以后给它们**删字段或改字段类型**会让旧存档读不出来（新增字段没事，读的时候缺的是 null，未知字段会被忽略）。要改，先想好怎么迁移旧存档。
