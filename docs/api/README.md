# 接口

接口以 [`openapi.yaml`](openapi.yaml)（OpenAPI 3.0）为准，改接口先改这个文件。

## 导入 Apifox

项目设置 → 导入数据 → OpenAPI/Swagger → 选择 `openapi.yaml`。文件更新后重新导入，覆盖同名接口。

## 前端生成类型

在 `frontend/` 下执行：

```bash
pnpm dlx openapi-typescript ../docs/api/openapi.yaml -o src/api/schema.d.ts
```

## 分组

| 分组 | 主要路径 |
|---|---|
| 认证 | `/auth/*` |
| 用户管理、角色权限 | `/users`、`/roles`、`/permissions` |
| 项目、成员、里程碑 | `/projects`、`/projects/{projectId}/members`、`/milestones` |
| 任务、依赖 | `/projects/{projectId}/tasks`、`/board`、`/todo`、`/tasks/{taskId}`、`/dependencies` |
| 进度 | `/projects/{projectId}/gantt`、`/critical-path` |
| 统计报表 | `/projects/{projectId}/reports/*`、`/workload`、`/assign-suggestions` |
| 团队协作、缺陷 | `/discussions`、`/comments`、`/activities`、`/defects` |
| 文档 | `/projects/{projectId}/documents`、`/documents/{documentId}`、`/document-versions` |
| 通知、往期日报 | `/notifications`、`/projects/{projectId}/issues` |
| 系统管理 | `/logs`、`/dicts`、`/configs` |
