# miniteam-pms

小型软件团队项目管理系统（软件工程课程设计，第 8 组）。Monorepo：前端、后端、文档放在同一个仓库。

给组员看的上手说明和注意事项在 `README.md`。本文件是给所有 AI 编程工具（Cursor、Trae、通义灵码、Copilot、Claude 等）和组员看的总约定。`frontend/AGENTS.md`、`backend/AGENTS.md` 只写各自的补充，不和这里冲突；冲突时以本文件为准。

## 目录

| 目录 | 内容 | 用什么打开 |
|---|---|---|
| `frontend/` | 前端：React 19 + TypeScript + Vite，包管理器 pnpm | VS Code 只打开这个文件夹 |
| `backend/` | 后端：Java 21 + Spring Boot 4.0 + MyBatis + MySQL，Maven 构建，根包 `org.miniteam.pms` | IDEA 只打开这个文件夹 |
| `docs/` | 只放 Markdown 和小图片；Word/PPT 放外部，在 `docs/README.md` 登记链接 | 任意 |
| `.github/workflows/` | CI 和自动部署 | 只有组长改 |

## 给 AI 的硬性规则

1. **只改任务相关的目录。** 做前端任务不要动 `backend/`，反之亦然。需要另一边配合（比如新接口）时，在回复里说明，不要顺手改。
2. **不要提交任何密码、密钥、token。** 数据库地址和账号一律从环境变量读（见“配置和环境变量”）。仓库是公开的。
3. **不要新增大的依赖或换框架**（UI 组件库、状态管理库、ORM、Redis 等），先在回复里提出，等人确认。服务器内存只有 2G，后端堆内存上限 384M。
4. **不要改** `.github/workflows/`、根目录的 `.gitignore`、`.gitattributes`、`.editorconfig` 和本文件，除非任务明确要求。
5. **不要手动整理格式，也不要格式化无关代码。** 格式由工具统一处理（见“代码格式”），只改需要改的行，避免和队友冲突。
6. 写完代码要保证能编译：前端 `pnpm -C frontend build`，后端 `mvn -f backend -q package`。
7. 界面文字、注释、提交说明用中文；代码里的变量名、函数名、类名用英文。

## 代码格式

格式不靠人自觉，由工具统一，组员什么都不用装也不会被拦。

| 部分 | 工具 | 什么时候生效 |
|---|---|---|
| 后端 Java | Spotless（palantir-java-format 风格，4 空格缩进，自动删无用 import），配置在 `backend/pom.xml` | 本地跑 `mvn compile` / `mvn package` 时自动格式化；手动格式化用 `mvn -f backend spotless:apply` |
| 前端 | Prettier，VS Code 保存时自动格式化，配置在 `frontend/` | 保存文件时 |
| 全部 | GitHub Actions `.github/workflows/format.yml` | 每次向 `main` 提 PR，机器人 `format-bot` 自动格式化并以 `style: 自动格式化` 提交回 PR 分支 |

- 机器人提交后，本地再 push 会被拒绝，先 `git pull` 再 push 即可（IDEA 会弹窗提示合并，点确定）。
- 缩进、换行、编码的基础规则在根目录 `.editorconfig`，换行统一 LF（`.gitattributes`）。
- IDEA 想和机器人结果一致，可装 palantir-java-format 插件并启用；不装也行，以机器人为准。
- 机器人用仓库 Secret `FORMAT_TOKEN`（组长的 fine-grained token，只对本仓库有 Contents 读写权限）推送，过期后需组长重新生成。

## 前后端怎么对接

- 接口定义以 `docs/api/openapi.yaml` 为准，新增或修改接口先改这个文件。
- 所有后端接口路径以 `/api` 开头，例如 `GET /api/projects`。线上 nginx 把 `/api/` 原样转发给后端，其余请求都是前端页面。
- 前端请求一律写相对路径 `/api/...`，不要写死 `http://localhost:8080` 或服务器 IP。本地开发靠 Vite 的 `server.proxy` 把 `/api` 转到 `http://localhost:8080`。
- 接口统一返回 JSON：`{ "code": 200, "message": "ok", "data": ... }`，出错时 `code` 非 200，`message` 写给用户看的原因。
- 时间统一用 `yyyy-MM-dd HH:mm:ss` 字符串，时区 Asia/Shanghai。

## 配置和环境变量

后端配置里只能这样写，真实值由服务器或本机环境变量提供：

| 变量 | 含义 |
|---|---|
| `DB_URL` | JDBC 地址 |
| `DB_USERNAME` | 数据库用户名 |
| `DB_PASSWORD` | 数据库密码 |
| `SERVER_PORT` | 后端端口，默认 8080 |

本地开发默认连服务器上的**开发库 `app_dev`**（全组共用，可以随便测），线上后端连**线上库 `app`**（开发账号碰不到）。开发库密码不进仓库，写在本机 `backend/application-local.yaml` 里（已被忽略，向组长要），详见 `backend/AGENTS.md`。

## 线上环境（只读参考，组员不需要登录服务器）

- 阿里云 Ubuntu 24.04，2 核 2G。访问地址 `http://47.108.234.233`。
- 前端：`pnpm build` 产物 `frontend/dist/` 放到 nginx 的 `/var/www/app`。
- 后端：打成一个可执行 jar，用 `java -jar` 运行，systemd 托管，只监听 `127.0.0.1:8080`。
- 数据库：MySQL 8.0，字符集 utf8mb4。表结构由 **Flyway** 管理：建表/改表脚本放 `backend/src/main/resources/db/migration/`，文件名 `V序号__说明.sql`（两个下划线，如 `V1__init.sql`、`V2__add_task.sql`），后端启动时自动执行还没执行过的脚本，开发库和线上库都一样。**已合并进 main 的脚本绝对不能再改**（Flyway 会校验失败、后端起不来），要改表就新增下一个序号的脚本。
- 合并到 `main` 后由 GitHub Actions 自动构建并部署。

## Git 协作

- `main` 受保护，不能直接 push。每个人从 `main` 拉分支：`类型/描述`，小写、`-` 连接，例如 `feat/task-board`、`fix/kanban-drag`。
- 改完提 Pull Request，CI 编译通过、组长看过后合并。
- 提交说明格式：`类型: 做了什么`，类型用 `feat`（新功能）、`fix`（修 bug）、`docs`、`style`、`refactor`、`chore`。例如 `feat: 任务看板支持拖拽排序`。
- 提交前先 `git pull --rebase origin main`，有冲突自己解决，拿不准就问。

## 待定事项（定下来后更新这里）

- 前端 UI 组件库、路由、状态管理。
- 登录鉴权方案。
