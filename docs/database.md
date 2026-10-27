# 数据库设计

MySQL 8.0，字符集 utf8mb4，InnoDB。表结构以 `backend/src/main/resources/db/migration/` 下的脚本为准，本文的字段表由 `V1__init.sql` 整理。

## 表清单

| 模块 | 表 | 说明 |
|---|---|---|
| 系统 | `sys_user` | 用户 |
|  | `sys_role` | 系统角色 |
|  | `sys_config` | 系统参数 |
|  | `sys_dict` | 数据字典 |
|  | `operation_log` | 操作日志（同时用于任务操作记录、项目动态、权限变更记录） |
|  | `notification` | 站内通知 |
| 项目 | `project` | 项目 |
|  | `project_member` | 项目成员 |
|  | `milestone` | 里程碑（阶段） |
|  | `daily_issue` | 往期日报（每日只读快照） |
| 任务 | `task` | 任务 |
|  | `task_dependency` | 任务依赖（只允许同一项目内） |
| 协作 | `discussion` | 讨论 |
|  | `comment` | 评论 |
|  | `defect` | 缺陷 |
| 文档 | `document` | 文档 |
|  | `document_version` | 文档版本 |

## 表间关系

共 32 个外键，命名 `fk_表名_字段名`。

| 表 | 字段 | 引用 | 被引用记录删除时 |
|---|---|---|---|
| `sys_user` | `role_id` | `sys_role` | 禁止删除 |
| `project` | `owner_id` | `sys_user` | 禁止删除 |
| `project_member` | `project_id` | `project` | 级联删除 |
| `project_member` | `user_id` | `sys_user` | 级联删除 |
| `milestone` | `project_id` | `project` | 级联删除 |
| `daily_issue` | `project_id` | `project` | 级联删除 |
| `task` | `project_id` | `project` | 禁止删除 |
| `task` | `milestone_id` | `milestone` | 置空 |
| `task` | `parent_id` | `task` | 置空 |
| `task` | `assignee_id` | `sys_user` | 禁止删除 |
| `task` | `creator_id` | `sys_user` | 禁止删除 |
| `task_dependency` | `project_id` | `project` | 级联删除 |
| `task_dependency` | `pre_task_id` | `task` | 级联删除 |
| `task_dependency` | `next_task_id` | `task` | 级联删除 |
| `discussion` | `project_id` | `project` | 级联删除 |
| `discussion` | `task_id` | `task` | 置空 |
| `discussion` | `creator_id` | `sys_user` | 禁止删除 |
| `comment` | `discussion_id` | `discussion` | 级联删除 |
| `comment` | `user_id` | `sys_user` | 禁止删除 |
| `defect` | `project_id` | `project` | 级联删除 |
| `defect` | `task_id` | `task` | 置空 |
| `defect` | `reporter_id` | `sys_user` | 禁止删除 |
| `defect` | `assignee_id` | `sys_user` | 置空 |
| `document` | `project_id` | `project` | 级联删除 |
| `document` | `task_id` | `task` | 置空 |
| `document` | `owner_id` | `sys_user` | 禁止删除 |
| `document_version` | `document_id` | `document` | 级联删除 |
| `document_version` | `uploader_id` | `sys_user` | 禁止删除 |
| `notification` | `user_id` | `sys_user` | 级联删除 |
| `notification` | `project_id` | `project` | 级联删除 |
| `operation_log` | `user_id` | `sys_user` | 置空 |
| `operation_log` | `project_id` | `project` | 置空 |

`operation_log.target_id` 按 `target_type` 指向不同的表，不建外键。

## 业务流程与数据

| 步骤 | 写入 | 读取 |
|---|---|---|
| 登录 | — | `sys_user`、`sys_role` |
| 建项目 | `project`、`project_member` | — |
| 邀请成员 | `project_member`、`notification`、`operation_log` | `sys_user` |
| 划分阶段 | `milestone` | — |
| 建任务、设依赖 | `task`、`task_dependency` | — |
| 分配建议 | 确认后写 `task.assignee_id`、`notification` | `task`、`sys_user.skill_tags` |
| 更新任务状态 | `task`、`operation_log` | — |
| 讨论 | `discussion`、`comment`、`notification`（@） | — |
| 上传文档 | `document`、`document_version` | — |
| 登记与修复缺陷 | `defect` | — |
| 关键路径、预测完工、延期预警 | 预警写 `notification` | `task`、`task_dependency` |
| 今日待办（优先级评分） | — | `task`、`sys_config` |
| 每日零点生成日报 | `daily_issue` | 当日计算结果 |
| 统计报表 | — | `task`、`defect` |
| 系统管理 | `sys_user`、`sys_role`、`sys_dict`、`sys_config` | `operation_log` |

## 页面与数据

| 页面 | 表 |
|---|---|
| 顶栏 | `project`、`daily_issue`、`notification` |
| 概览 | `task`、`task_dependency`、`project_member`、`daily_issue` |
| 任务看板 | `task`、`task_dependency` |
| 任务详情 | `task`、`task_dependency`、`document`、`discussion`、`operation_log` |
| 进度 | `task`、`task_dependency`、`milestone` |
| 统计报表 | `task`、`defect` |
| 团队协作 | `discussion`、`comment`、`defect`、`operation_log` |
| 文档 | `document`、`document_version` |
| 成员与权限 | `project_member`、`sys_user`、`task`、`operation_log` |
| 系统管理 | `sys_user`、`sys_role`、`sys_dict`、`sys_config`、`operation_log` |

## 字段

### 系统

#### `sys_user` 用户

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `username` | VARCHAR(32) | 否 |  | 账号 |
| `password_hash` | VARCHAR(100) | 否 |  | 加盐哈希后的密码 |
| `real_name` | VARCHAR(32) | 否 |  | 姓名 |
| `dept` | VARCHAR(64) | 是 |  | 部门/小组 |
| `role_id` | BIGINT | 否 |  | 系统角色 |
| `email` | VARCHAR(128) | 是 |  | 邮箱 |
| `skill_tags` | JSON | 是 |  | 技能标签，负载均衡用 |
| `weekly_capacity` | INT | 否 | 40 | 每周工时上限（小时） |
| `status` | TINYINT | 否 | 1 | 1 启用 0 停用 |
| `last_login_at` | DATETIME | 是 |  | 最近登录时间 |
| `created_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | DATETIME | 否 | CURRENT_TIMESTAMP，更新时自动刷新 | 更新时间 |

唯一：`username`  
索引：`role_id`

#### `sys_role` 系统角色

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `code` | VARCHAR(32) | 否 |  | 角色编码 |
| `name` | VARCHAR(32) | 否 |  | 角色名称 |
| `permissions` | JSON | 是 |  | 权限编码列表 |
| `sort` | INT | 否 | 0 | 排序 |
| `created_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | DATETIME | 否 | CURRENT_TIMESTAMP，更新时自动刷新 | 更新时间 |

唯一：`code`

#### `sys_config` 系统参数

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `config_key` | VARCHAR(64) | 否 |  | 参数键 |
| `config_value` | VARCHAR(500) | 否 |  | 参数值 |
| `name` | VARCHAR(64) | 否 |  | 参数名称 |
| `remark` | VARCHAR(255) | 是 |  | 备注 |
| `updated_at` | DATETIME | 否 | CURRENT_TIMESTAMP，更新时自动刷新 | 更新时间 |

唯一：`config_key`

#### `sys_dict` 数据字典

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `dict_type` | VARCHAR(64) | 否 |  | 字典类型 |
| `label` | VARCHAR(64) | 否 |  | 显示文字 |
| `value` | VARCHAR(64) | 否 |  | 存储值 |
| `sort` | INT | 否 | 0 | 排序 |
| `status` | TINYINT | 否 | 1 | 1 启用 0 停用 |
| `created_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 创建时间 |

唯一：`dict_type, value`

#### `operation_log` 操作日志（同时用于任务操作记录、项目动态、权限变更记录）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `user_id` | BIGINT | 是 |  | 操作人，系统自动操作为空 |
| `project_id` | BIGINT | 是 |  | 所属项目 |
| `target_type` | VARCHAR(32) | 否 |  | 对象类型：TASK/DOCUMENT/MEMBER/PROJECT/DEFECT… |
| `target_id` | BIGINT | 是 |  | 对象 ID |
| `action` | VARCHAR(64) | 否 |  | 动作编码 |
| `detail` | VARCHAR(500) | 是 |  | 可读描述 |
| `ip` | VARCHAR(64) | 是 |  | 操作 IP |
| `created_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 创建时间 |

索引：`project_id, created_at`；`target_type, target_id`；`user_id`

#### `notification` 站内通知

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `user_id` | BIGINT | 否 |  | 接收人 |
| `project_id` | BIGINT | 是 |  | 所属项目 |
| `type` | VARCHAR(32) | 否 |  | ASSIGN/MENTION/DELAY/DEFECT/SYSTEM… |
| `title` | VARCHAR(128) | 否 |  | 标题 |
| `content` | VARCHAR(500) | 是 |  | 内容 |
| `link` | VARCHAR(255) | 是 |  | 点击跳转的前端路由 |
| `is_read` | TINYINT | 否 | 0 | 1 已读 0 未读 |
| `created_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 创建时间 |

索引：`user_id, is_read, created_at`

### 项目

#### `project` 项目

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `name` | VARCHAR(64) | 否 |  | 名称 |
| `description` | VARCHAR(500) | 是 |  | 描述 |
| `owner_id` | BIGINT | 否 |  | 项目经理 |
| `status` | VARCHAR(16) | 否 | ACTIVE | ACTIVE 进行中 / ARCHIVED 已归档 |
| `start_date` | DATE | 否 |  | 开始日期，期号从这天算起 |
| `plan_end` | DATE | 否 |  | 计划结束日期 |
| `actual_end` | DATE | 是 |  | 实际结束日期 |
| `created_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | DATETIME | 否 | CURRENT_TIMESTAMP，更新时自动刷新 | 更新时间 |

索引：`owner_id`

#### `project_member` 项目成员

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `project_id` | BIGINT | 否 |  | 所属项目 |
| `user_id` | BIGINT | 否 |  | 用户 |
| `project_role` | VARCHAR(16) | 否 | MEMBER | PM 项目经理 / MEMBER 普通成员 / TESTER 测试人员 |
| `position` | VARCHAR(32) | 是 |  | 岗位显示名，如 后端开发 |
| `can_edit_task` | TINYINT | 否 | 1 | 新建、修改任务，拖动看板 |
| `can_edit_schedule` | TINYINT | 否 | 0 | 修改工期和依赖 |
| `can_edit_doc` | TINYINT | 否 | 1 | 上传新版本，修改文档状态 |
| `can_manage_member` | TINYINT | 否 | 0 | 邀请成员，修改权限 |
| `joined_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 加入时间 |

唯一：`project_id, user_id`  
索引：`user_id`

#### `milestone` 里程碑（阶段）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `project_id` | BIGINT | 否 |  | 所属项目 |
| `name` | VARCHAR(64) | 否 |  | 名称 |
| `description` | VARCHAR(255) | 是 |  | 描述 |
| `due_date` | DATE | 否 |  | 截止日期 |
| `status` | VARCHAR(16) | 否 | PENDING | PENDING 未完成 / DONE 已完成 |
| `completed_at` | DATETIME | 是 |  | 完成时间 |
| `sort` | INT | 否 | 0 | 排序 |
| `created_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | DATETIME | 否 | CURRENT_TIMESTAMP，更新时自动刷新 | 更新时间 |

索引：`project_id, sort`

#### `daily_issue` 往期日报（每日只读快照）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `project_id` | BIGINT | 否 |  | 所属项目 |
| `issue_date` | DATE | 否 |  | 期日期 |
| `issue_no` | INT | 否 |  | 期号 |
| `headline` | VARCHAR(255) | 是 |  | 当日头条 |
| `predicted_end` | DATE | 是 |  | 当日预测完工日期 |
| `delay_days` | INT | 否 | 0 | 当日预测延期天数 |
| `snapshot` | JSON | 否 |  | 当日各页面状态快照 |
| `created_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 创建时间 |

唯一：`project_id, issue_date`

### 任务

#### `task` 任务

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `project_id` | BIGINT | 否 |  | 所属项目 |
| `task_no` | INT | 否 |  | 项目内编号，显示为 T-编号 |
| `milestone_id` | BIGINT | 是 |  | 所属阶段 |
| `parent_id` | BIGINT | 是 |  | 父任务，子任务拆分用 |
| `title` | VARCHAR(128) | 否 |  | 标题 |
| `description` | TEXT | 是 |  | 描述 |
| `status` | VARCHAR(16) | 否 | TODO | TODO 待开始 / DOING 进行中 / BLOCKED 阻塞 / DONE 已完成 |
| `assignee_id` | BIGINT | 是 |  | 负责人，空为未分配 |
| `creator_id` | BIGINT | 否 |  | 创建人 |
| `importance` | TINYINT | 否 | 3 | 重要度 1-5 |
| `urgency` | TINYINT | 否 | 3 | 紧急度 1-5 |
| `plan_days` | INT | 否 | 1 | 计划工期（工作日），CPM 用 |
| `est_hours` | DECIMAL(6,1) | 否 | 0 | 预估工时（小时），负载、燃尽图、每周工时用 |
| `required_skills` | JSON | 是 |  | 所需技能，分配建议用 |
| `progress` | TINYINT | 否 | 0 | 进度百分比 0-100 |
| `plan_start` | DATE | 是 |  | 计划开始 |
| `due_date` | DATE | 是 |  | 截止日期 |
| `actual_start` | DATE | 是 |  | 实际开始日期 |
| `actual_end` | DATE | 是 |  | 实际完成日期 |
| `sort_order` | INT | 否 | 0 | 看板列内排序 |
| `created_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | DATETIME | 否 | CURRENT_TIMESTAMP，更新时自动刷新 | 更新时间 |

唯一：`project_id, task_no`  
索引：`project_id, status, sort_order`；`assignee_id, status`；`milestone_id`；`parent_id`

#### `task_dependency` 任务依赖（只允许同一项目内）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `project_id` | BIGINT | 否 |  | 所属项目 |
| `pre_task_id` | BIGINT | 否 |  | 前置任务 |
| `next_task_id` | BIGINT | 否 |  | 后续任务 |
| `created_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 创建时间 |

唯一：`pre_task_id, next_task_id`  
索引：`next_task_id`；`project_id`

### 协作

#### `discussion` 讨论

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `project_id` | BIGINT | 否 |  | 所属项目 |
| `task_id` | BIGINT | 是 |  | 关联任务 |
| `title` | VARCHAR(128) | 否 |  | 标题 |
| `creator_id` | BIGINT | 否 |  | 创建人 |
| `comment_count` | INT | 否 | 0 | 评论数 |
| `last_comment_at` | DATETIME | 是 |  | 最后评论时间 |
| `created_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 创建时间 |

索引：`project_id, last_comment_at`；`task_id`

#### `comment` 评论

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `discussion_id` | BIGINT | 否 |  | 所属讨论 |
| `user_id` | BIGINT | 否 |  | 用户 |
| `content` | TEXT | 否 |  | 内容 |
| `mentions` | JSON | 是 |  | @ 到的用户 ID |
| `created_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 创建时间 |

索引：`discussion_id, created_at`

#### `defect` 缺陷

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `project_id` | BIGINT | 否 |  | 所属项目 |
| `task_id` | BIGINT | 是 |  | 关联任务 |
| `module` | VARCHAR(64) | 是 |  | 关联模块 |
| `title` | VARCHAR(128) | 否 |  | 标题 |
| `steps` | TEXT | 是 |  | 复现说明 |
| `severity` | VARCHAR(16) | 否 | NORMAL | FATAL 致命 / SEVERE 严重 / NORMAL 一般 / MINOR 轻微 |
| `status` | VARCHAR(16) | 否 | PENDING | PENDING 待确认 / FIXED 已修复 / CLOSED 已关闭 |
| `reporter_id` | BIGINT | 否 |  | 登记人（测试人员） |
| `assignee_id` | BIGINT | 是 |  | 修复人 |
| `fixed_at` | DATETIME | 是 |  | 修复时间 |
| `closed_at` | DATETIME | 是 |  | 回归通过时间 |
| `created_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | DATETIME | 否 | CURRENT_TIMESTAMP，更新时自动刷新 | 更新时间 |

索引：`project_id, status`；`task_id`；`assignee_id`

### 文档

#### `document` 文档

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `project_id` | BIGINT | 否 |  | 所属项目 |
| `task_id` | BIGINT | 是 |  | 关联任务，空为项目文档 |
| `name` | VARCHAR(128) | 否 |  | 名称 |
| `category` | VARCHAR(32) | 否 | OTHER | 分类，见字典 doc_category |
| `owner_id` | BIGINT | 否 |  | 负责人 |
| `status` | VARCHAR(16) | 否 | REVISING | REVISING 修订中 / FINAL 定稿 |
| `current_version` | VARCHAR(16) | 是 |  | 当前版本号，如 v0.6 |
| `due_date` | DATE | 是 |  | 截止日期 |
| `finalized_at` | DATETIME | 是 |  | 定稿时间 |
| `created_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | DATETIME | 否 | CURRENT_TIMESTAMP，更新时自动刷新 | 更新时间 |

索引：`project_id, status`；`task_id`

#### `document_version` 文档版本

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT | 否 |  | 主键，自增 |
| `document_id` | BIGINT | 否 |  | 所属文档 |
| `version` | VARCHAR(16) | 否 |  | 版本号 |
| `change_note` | VARCHAR(255) | 是 |  | 本版改动 |
| `file_name` | VARCHAR(255) | 否 |  | 原始文件名 |
| `file_path` | VARCHAR(255) | 否 |  | 存储路径 |
| `file_size` | BIGINT | 否 | 0 | 字节 |
| `content_type` | VARCHAR(128) | 是 |  | 文件类型 |
| `uploader_id` | BIGINT | 否 |  | 上传人 |
| `created_at` | DATETIME | 否 | CURRENT_TIMESTAMP | 创建时间 |

唯一：`document_id, version`

## 初始数据

| 表 | 内容 |
|---|---|
| `sys_role` | ADMIN 系统管理员、PM 项目经理、MEMBER 普通成员、TESTER 测试人员、GUEST 访客 |
| `sys_config` | 优先级权重 w1=0.30、w2=0.30、w3=0.25、w4=0.15，α=0.5，今日待办 5 条，默认每周工时上限 40 小时 |
| `sys_dict` | 任务状态、文档分类、文档状态、缺陷严重级别、缺陷状态 |

不预置用户账号。
