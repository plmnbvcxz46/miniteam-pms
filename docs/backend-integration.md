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

1. 认证：`/auth/login`、`/auth/register`、`/auth/logout`、`/auth/me`、`/auth/password`
2. 项目和成员：`/projects`、`/projects/{id}`、归档、`/projects/{id}/members`、`/users/search`
3. 用户和设置：`/users`（含状态、重置密码）、`GET /roles`、`/configs`、`/logs`
4. 任务：`/projects/{id}/tasks`、`/tasks/{id}`、状态、位置、`/tasks/{id}/predecessors`、`/tasks/{id}/activities`、`DELETE /tasks/{id}`（只有项目经理和系统管理员能删，过去的期不能删，删除后其他任务的前置、后续里要去掉它）
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

`openapi.yaml` 里这类接口在方法名上一行写了 `# 暂不实现：前端没有对应功能，之后按需补充`，一共 41 个：

- 里程碑全套
- 缺陷全套，以及 `/reports/defect-density`
- 字典 `/dicts` 全套
- 推荐指派 `/assign-suggestions` 和 `/apply`
- 角色的新建、修改、删除，`GET /permissions`
- 依赖的列表、新增，`DELETE /dependencies/{id}`（前端保存时走的是 `PUT /tasks/{id}/predecessors`）
- 恢复项目、删除项目
- 单独改进度、改负责人
- 成员的修改、移除、改权限
- 删除讨论、删除评论
- 文档的新建、修改、删除、上传新版本
- 通知的全部已读、未读数
- `GET /users/{userId}`

这些之后会按需补，先不用做。用 `grep -n "暂不实现" docs/api/openapi.yaml` 可以列出来。
