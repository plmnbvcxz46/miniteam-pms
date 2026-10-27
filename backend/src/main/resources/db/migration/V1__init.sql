-- ============================================================
-- 系统：角色、用户、配置、字典、日志、通知
-- ============================================================

CREATE TABLE sys_role (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    code        VARCHAR(32)  NOT NULL COMMENT '角色编码',
    name        VARCHAR(32)  NOT NULL COMMENT '角色名称',
    permissions JSON         NULL     COMMENT '权限编码列表',
    sort        INT          NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_role_code (code)
) COMMENT '系统角色';

CREATE TABLE sys_user (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    username        VARCHAR(32)  NOT NULL COMMENT '账号',
    password_hash   VARCHAR(100) NOT NULL COMMENT '加盐哈希后的密码',
    real_name       VARCHAR(32)  NOT NULL COMMENT '姓名',
    dept            VARCHAR(64)  NULL     COMMENT '部门/小组',
    role_id         BIGINT       NOT NULL COMMENT '系统角色',
    email           VARCHAR(128) NULL,
    skill_tags      JSON         NULL     COMMENT '技能标签，负载均衡用',
    weekly_capacity INT          NOT NULL DEFAULT 40 COMMENT '每周工时上限（小时）',
    status          TINYINT      NOT NULL DEFAULT 1 COMMENT '1 启用 0 停用',
    last_login_at   DATETIME     NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_username (username),
    KEY idx_user_role (role_id)
) COMMENT '用户';

CREATE TABLE sys_config (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    config_key   VARCHAR(64)  NOT NULL COMMENT '参数键',
    config_value VARCHAR(500) NOT NULL COMMENT '参数值',
    name         VARCHAR(64)  NOT NULL COMMENT '参数名称',
    remark       VARCHAR(255) NULL,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_config_key (config_key)
) COMMENT '系统参数';

CREATE TABLE sys_dict (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    dict_type  VARCHAR(64) NOT NULL COMMENT '字典类型',
    label      VARCHAR(64) NOT NULL COMMENT '显示文字',
    value      VARCHAR(64) NOT NULL COMMENT '存储值',
    sort       INT         NOT NULL DEFAULT 0,
    status     TINYINT     NOT NULL DEFAULT 1 COMMENT '1 启用 0 停用',
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_dict_type_value (dict_type, value)
) COMMENT '数据字典';

CREATE TABLE operation_log (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT       NULL     COMMENT '操作人，系统自动操作为空',
    project_id  BIGINT       NULL     COMMENT '所属项目',
    target_type VARCHAR(32)  NOT NULL COMMENT '对象类型：TASK/DOCUMENT/MEMBER/PROJECT/DEFECT…',
    target_id   BIGINT       NULL     COMMENT '对象 ID',
    action      VARCHAR(64)  NOT NULL COMMENT '动作编码',
    detail      VARCHAR(500) NULL     COMMENT '可读描述',
    ip          VARCHAR(64)  NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_log_project_time (project_id, created_at),
    KEY idx_log_target (target_type, target_id),
    KEY idx_log_user (user_id)
) COMMENT '操作日志（同时用于任务操作记录、项目动态、权限变更记录）';

CREATE TABLE notification (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL COMMENT '接收人',
    project_id BIGINT       NULL,
    type       VARCHAR(32)  NOT NULL COMMENT 'ASSIGN/MENTION/DELAY/DEFECT/SYSTEM…',
    title      VARCHAR(128) NOT NULL,
    content    VARCHAR(500) NULL,
    link       VARCHAR(255) NULL     COMMENT '点击跳转的前端路由',
    is_read    TINYINT      NOT NULL DEFAULT 0,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notice_user_read (user_id, is_read, created_at)
) COMMENT '站内通知';

-- ============================================================
-- 项目：项目、成员、里程碑、往期日报
-- ============================================================

CREATE TABLE project (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(64)  NOT NULL,
    description VARCHAR(500) NULL,
    owner_id    BIGINT       NOT NULL COMMENT '项目经理',
    status      VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE 进行中 / ARCHIVED 已归档',
    start_date  DATE         NOT NULL COMMENT '开始日期，期号从这天算起',
    plan_end    DATE         NOT NULL COMMENT '计划结束日期',
    actual_end  DATE         NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_project_owner (owner_id)
) COMMENT '项目';

CREATE TABLE project_member (
    id                BIGINT      NOT NULL AUTO_INCREMENT,
    project_id        BIGINT      NOT NULL,
    user_id           BIGINT      NOT NULL,
    project_role      VARCHAR(16) NOT NULL DEFAULT 'MEMBER' COMMENT 'PM 项目经理 / MEMBER 普通成员 / TESTER 测试人员',
    position          VARCHAR(32) NULL     COMMENT '岗位显示名，如 后端开发',
    can_edit_task     TINYINT     NOT NULL DEFAULT 1 COMMENT '新建、修改任务，拖动看板',
    can_edit_schedule TINYINT     NOT NULL DEFAULT 0 COMMENT '修改工期和依赖',
    can_edit_doc      TINYINT     NOT NULL DEFAULT 1 COMMENT '上传新版本，修改文档状态',
    can_manage_member TINYINT     NOT NULL DEFAULT 0 COMMENT '邀请成员，修改权限',
    joined_at         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_member_project_user (project_id, user_id),
    KEY idx_member_user (user_id)
) COMMENT '项目成员';

CREATE TABLE milestone (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    project_id   BIGINT       NOT NULL,
    name         VARCHAR(64)  NOT NULL,
    description  VARCHAR(255) NULL,
    due_date     DATE         NOT NULL,
    status       VARCHAR(16)  NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING 未完成 / DONE 已完成',
    completed_at DATETIME     NULL,
    sort         INT          NOT NULL DEFAULT 0,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_milestone_project (project_id, sort)
) COMMENT '里程碑（阶段）';

CREATE TABLE daily_issue (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    project_id    BIGINT       NOT NULL,
    issue_date    DATE         NOT NULL COMMENT '期日期',
    issue_no      INT          NOT NULL COMMENT '期号',
    headline      VARCHAR(255) NULL     COMMENT '当日头条',
    predicted_end DATE         NULL     COMMENT '当日预测完工日期',
    delay_days    INT          NOT NULL DEFAULT 0 COMMENT '当日预测延期天数',
    snapshot      JSON         NOT NULL COMMENT '当日各页面状态快照',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_issue_project_date (project_id, issue_date)
) COMMENT '往期日报（每日只读快照）';

-- ============================================================
-- 任务：任务、依赖
-- ============================================================

CREATE TABLE task (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    project_id      BIGINT        NOT NULL,
    task_no         INT           NOT NULL COMMENT '项目内编号，显示为 T-编号',
    milestone_id    BIGINT        NULL     COMMENT '所属阶段',
    parent_id       BIGINT        NULL     COMMENT '父任务，子任务拆分用',
    title           VARCHAR(128)  NOT NULL,
    description     TEXT          NULL,
    status          VARCHAR(16)   NOT NULL DEFAULT 'TODO' COMMENT 'TODO 待开始 / DOING 进行中 / BLOCKED 阻塞 / DONE 已完成',
    assignee_id     BIGINT        NULL     COMMENT '负责人，空为未分配',
    creator_id      BIGINT        NOT NULL,
    importance      TINYINT       NOT NULL DEFAULT 3 COMMENT '重要度 1-5',
    urgency         TINYINT       NOT NULL DEFAULT 3 COMMENT '紧急度 1-5',
    plan_days       INT           NOT NULL DEFAULT 1 COMMENT '计划工期（工作日），CPM 用',
    est_hours       DECIMAL(6,1)  NOT NULL DEFAULT 0 COMMENT '预估工时（小时），负载、燃尽图、每周工时用',
    required_skills JSON          NULL     COMMENT '所需技能，分配建议用',
    progress        TINYINT       NOT NULL DEFAULT 0 COMMENT '进度百分比 0-100',
    plan_start      DATE          NULL     COMMENT '计划开始',
    due_date        DATE          NULL     COMMENT '截止日期',
    actual_start    DATE          NULL,
    actual_end      DATE          NULL     COMMENT '实际完成日期',
    sort_order      INT           NOT NULL DEFAULT 0 COMMENT '看板列内排序',
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_task_project_no (project_id, task_no),
    KEY idx_task_project_status (project_id, status, sort_order),
    KEY idx_task_assignee_status (assignee_id, status),
    KEY idx_task_milestone (milestone_id),
    KEY idx_task_parent (parent_id)
) COMMENT '任务';

CREATE TABLE task_dependency (
    id          BIGINT   NOT NULL AUTO_INCREMENT,
    project_id  BIGINT   NOT NULL,
    pre_task_id BIGINT   NOT NULL COMMENT '前置任务',
    next_task_id BIGINT  NOT NULL COMMENT '后续任务',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_dep_pair (pre_task_id, next_task_id),
    KEY idx_dep_next (next_task_id),
    KEY idx_dep_project (project_id)
) COMMENT '任务依赖（只允许同一项目内）';

-- ============================================================
-- 协作：讨论、评论、缺陷
-- ============================================================

CREATE TABLE discussion (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    project_id      BIGINT       NOT NULL,
    task_id         BIGINT       NULL     COMMENT '关联任务',
    title           VARCHAR(128) NOT NULL,
    creator_id      BIGINT       NOT NULL,
    comment_count   INT          NOT NULL DEFAULT 0,
    last_comment_at DATETIME     NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_discussion_project (project_id, last_comment_at),
    KEY idx_discussion_task (task_id)
) COMMENT '讨论';

CREATE TABLE comment (
    id            BIGINT   NOT NULL AUTO_INCREMENT,
    discussion_id BIGINT   NOT NULL,
    user_id       BIGINT   NOT NULL,
    content       TEXT     NOT NULL,
    mentions      JSON     NULL     COMMENT '@ 到的用户 ID',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_comment_discussion (discussion_id, created_at)
) COMMENT '评论';

CREATE TABLE defect (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    project_id  BIGINT       NOT NULL,
    task_id     BIGINT       NULL     COMMENT '关联任务',
    module      VARCHAR(64)  NULL     COMMENT '关联模块',
    title       VARCHAR(128) NOT NULL,
    steps       TEXT         NULL     COMMENT '复现说明',
    severity    VARCHAR(16)  NOT NULL DEFAULT 'NORMAL' COMMENT 'FATAL 致命 / SEVERE 严重 / NORMAL 一般 / MINOR 轻微',
    status      VARCHAR(16)  NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING 待确认 / FIXED 已修复 / CLOSED 已关闭',
    reporter_id BIGINT       NOT NULL COMMENT '登记人（测试人员）',
    assignee_id BIGINT       NULL     COMMENT '修复人',
    fixed_at    DATETIME     NULL,
    closed_at   DATETIME     NULL     COMMENT '回归通过时间',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_defect_project_status (project_id, status),
    KEY idx_defect_task (task_id),
    KEY idx_defect_assignee (assignee_id)
) COMMENT '缺陷';

-- ============================================================
-- 文档：文档、版本
-- ============================================================

CREATE TABLE document (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    project_id      BIGINT       NOT NULL,
    task_id         BIGINT       NULL     COMMENT '关联任务，空为项目文档',
    name            VARCHAR(128) NOT NULL,
    category        VARCHAR(32)  NOT NULL DEFAULT 'OTHER' COMMENT '分类，见字典 doc_category',
    owner_id        BIGINT       NOT NULL COMMENT '负责人',
    status          VARCHAR(16)  NOT NULL DEFAULT 'REVISING' COMMENT 'REVISING 修订中 / FINAL 定稿',
    current_version VARCHAR(16)  NULL     COMMENT '当前版本号，如 v0.6',
    due_date        DATE         NULL     COMMENT '截止日期',
    finalized_at    DATETIME     NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_document_project_status (project_id, status),
    KEY idx_document_task (task_id)
) COMMENT '文档';

CREATE TABLE document_version (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    document_id  BIGINT       NOT NULL,
    version      VARCHAR(16)  NOT NULL COMMENT '版本号',
    change_note  VARCHAR(255) NULL     COMMENT '本版改动',
    file_name    VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_path    VARCHAR(255) NOT NULL COMMENT '存储路径',
    file_size    BIGINT       NOT NULL DEFAULT 0 COMMENT '字节',
    content_type VARCHAR(128) NULL,
    uploader_id  BIGINT       NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_docver_document_version (document_id, version)
) COMMENT '文档版本';

-- ============================================================
-- 外键
-- ============================================================

ALTER TABLE sys_user
    ADD CONSTRAINT fk_sys_user_role_id FOREIGN KEY (role_id) REFERENCES sys_role (id) ON DELETE RESTRICT;

ALTER TABLE project
    ADD CONSTRAINT fk_project_owner_id FOREIGN KEY (owner_id) REFERENCES sys_user (id) ON DELETE RESTRICT;

ALTER TABLE project_member
    ADD CONSTRAINT fk_project_member_project_id FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_project_member_user_id FOREIGN KEY (user_id) REFERENCES sys_user (id) ON DELETE CASCADE;

ALTER TABLE milestone
    ADD CONSTRAINT fk_milestone_project_id FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE;

ALTER TABLE daily_issue
    ADD CONSTRAINT fk_daily_issue_project_id FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE;

ALTER TABLE task
    ADD CONSTRAINT fk_task_project_id FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_task_milestone_id FOREIGN KEY (milestone_id) REFERENCES milestone (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_task_parent_id FOREIGN KEY (parent_id) REFERENCES task (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_task_assignee_id FOREIGN KEY (assignee_id) REFERENCES sys_user (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_task_creator_id FOREIGN KEY (creator_id) REFERENCES sys_user (id) ON DELETE RESTRICT;

ALTER TABLE task_dependency
    ADD CONSTRAINT fk_task_dependency_project_id FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_task_dependency_pre_task_id FOREIGN KEY (pre_task_id) REFERENCES task (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_task_dependency_next_task_id FOREIGN KEY (next_task_id) REFERENCES task (id) ON DELETE CASCADE;

ALTER TABLE discussion
    ADD CONSTRAINT fk_discussion_project_id FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_discussion_task_id FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_discussion_creator_id FOREIGN KEY (creator_id) REFERENCES sys_user (id) ON DELETE RESTRICT;

ALTER TABLE comment
    ADD CONSTRAINT fk_comment_discussion_id FOREIGN KEY (discussion_id) REFERENCES discussion (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_comment_user_id FOREIGN KEY (user_id) REFERENCES sys_user (id) ON DELETE RESTRICT;

ALTER TABLE defect
    ADD CONSTRAINT fk_defect_project_id FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_defect_task_id FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_defect_reporter_id FOREIGN KEY (reporter_id) REFERENCES sys_user (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_defect_assignee_id FOREIGN KEY (assignee_id) REFERENCES sys_user (id) ON DELETE SET NULL;

ALTER TABLE document
    ADD CONSTRAINT fk_document_project_id FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_document_task_id FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_document_owner_id FOREIGN KEY (owner_id) REFERENCES sys_user (id) ON DELETE RESTRICT;

ALTER TABLE document_version
    ADD CONSTRAINT fk_document_version_document_id FOREIGN KEY (document_id) REFERENCES document (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_document_version_uploader_id FOREIGN KEY (uploader_id) REFERENCES sys_user (id) ON DELETE RESTRICT;

ALTER TABLE notification
    ADD CONSTRAINT fk_notification_user_id FOREIGN KEY (user_id) REFERENCES sys_user (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_notification_project_id FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE;

ALTER TABLE operation_log
    ADD CONSTRAINT fk_operation_log_user_id FOREIGN KEY (user_id) REFERENCES sys_user (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_operation_log_project_id FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE SET NULL;

-- ============================================================
-- 初始数据
-- ============================================================

INSERT INTO sys_role (code, name, sort) VALUES
    ('ADMIN',  '系统管理员', 1),
    ('PM',     '项目经理',   2),
    ('MEMBER', '普通成员',   3),
    ('TESTER', '测试人员',   4),
    ('GUEST',  '访客',       5);

INSERT INTO sys_config (config_key, config_value, name, remark) VALUES
    ('priority.weight.importance', '0.30', '优先级权重 w1', '重要度'),
    ('priority.weight.urgency',    '0.30', '优先级权重 w2', '紧急度'),
    ('priority.weight.time',       '0.25', '优先级权重 w3', '时间紧迫度'),
    ('priority.weight.block',      '0.15', '优先级权重 w4', '阻塞影响度'),
    ('priority.alpha',             '0.5',  '关键路径加权系数 α', '阻塞影响度中关键路径任务的额外加权'),
    ('priority.top_n',             '5',    '今日待办条数', NULL),
    ('member.weekly_capacity',     '40',   '默认每周工时上限', '小时');

INSERT INTO sys_dict (dict_type, label, value, sort) VALUES
    ('task_status',     '待开始', 'TODO',     1),
    ('task_status',     '进行中', 'DOING',    2),
    ('task_status',     '阻塞',   'BLOCKED',  3),
    ('task_status',     '已完成', 'DONE',     4),
    ('doc_category',    '需求',   'REQUIREMENT', 1),
    ('doc_category',    '设计',   'DESIGN',   2),
    ('doc_category',    '接口',   'API',      3),
    ('doc_category',    '测试',   'TEST',     4),
    ('doc_category',    '会议',   'MEETING',  5),
    ('doc_category',    '其他',   'OTHER',    6),
    ('doc_status',      '修订中', 'REVISING', 1),
    ('doc_status',      '定稿',   'FINAL',    2),
    ('defect_severity', '致命',   'FATAL',    1),
    ('defect_severity', '严重',   'SEVERE',   2),
    ('defect_severity', '一般',   'NORMAL',   3),
    ('defect_severity', '轻微',   'MINOR',    4),
    ('defect_status',   '待确认', 'PENDING',  1),
    ('defect_status',   '已修复', 'FIXED',    2),
    ('defect_status',   '已关闭', 'CLOSED',   3);
