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

1. **只改任务相关的目录。** 做前端任务不要动 `backend/`，反之亦然。需要另一边配合（比如新接口）时，在回复里说明，不要顺手改。例外：按下面“模块开发流程”做的前后端配套任务，两边都改，但分开提交。
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

- 接口定义以 `docs/api/openapi.yaml` 为准，新增或修改接口先改这个文件。方法上标了 `# 暂不实现` 的接口先不做，不要删。
- 后端对接前先看 `docs/backend-integration.md`：哪些数据前端现在是自己算的替身、往期快照怎么存、哪些接口暂不实现。
- 权限以后端为准。前端 `src/access/` 的判断只是界面显示，不是安全边界：后端要从 JWT 取身份，每个请求校验项目成员和权限，列表在服务端过滤，单个资源无权限返回 403，往期快照同样校验。
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
| `JWT_SECRET` | JWT 签名密钥。不配则每次启动随机生成（重启后所有人要重新登录），线上必须配；本地开发可以不配 |
| `ADMIN_USERNAME`、`ADMIN_PASSWORD` | 用户表为空时自动创建的初始管理员，默认 `admin` / `123456`；线上建议改掉密码 |

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

## 模块开发流程（后端模块 + 前端接通，配套完成）

后端按模块（见 `docs/backend-integration.md` 的顺序）逐个做，**每个模块后端做完就把前端对应页面接到真实接口，一起验证、一起交付**。认证、用户、角色、系统参数、日志这一模块就是按这套做的，可作参考。

1. **先对照再动手。** 读 `docs/api/openapi.yaml` 里本模块的接口、`docs/database.md`、`docs/backend-integration.md`，再看前端页面实际用到哪些接口。前端在用但文档漏了或标了“暂不实现”的，补实现并改文档；文档有、前端没用的不用做。
2. **写后端。** 按 `backend/AGENTS.md` 分层；每个接口自己校验身份和权限，不信前端；写操作记 `OperationLogService`；改表走新的 Flyway 脚本。
3. **验证后端。** 写不依赖数据库的单元测试（工具类、算法）；再起本机后端连开发库，用脚本把本模块所有接口跑一遍：正常、参数错误、无权限（403）、未登录（401）、重复和不存在（409、404）。脚本用 Python 的 `urllib`（关掉代理）发请求，不要在 Git Bash 里用 `curl -d` 直接写中文，参数会被改坏。最后 `mvn -f backend -q package` 要通过。Windows 上没有 JDK 在 PATH 里时，可以把 `JAVA_HOME` 指到 IDEA 自带的 `jbr`。
4. **接通前端。** 页面改读 `src/api/`，字段以 openapi 为准；联调不通或接口缺东西时，**优先改前端去适配接口**，只有接口确实缺前端在用的功能才补后端。前端按后端的校验规则在提交前先校验一遍，并把接口返回的 `message` 显示给用户。删掉被换掉的假数据和替身，同步 `frontend/AGENTS.md`。
5. **在浏览器里点一遍。** 起后端和 `pnpm dev`，真的点完本模块所有操作：成功、失败提示、刷新后数据还在、普通用户和管理员的区别。别只看类型检查。再跑 `pnpm -C frontend build` 和 `pnpm -C frontend lint`。
6. **两组提交，一个 PR。** 后端一个提交、前端一个提交（后端有补充再加一个），提交说明按上面格式，例如 `feat: 后端项目和成员接口`、`feat: 前端接通项目和成员接口`。一个模块一个分支一个 PR，PR 描述写清改了什么、怎么验证的、合并前要注意什么。
7. **文档同步。** 接口有变动改 `docs/api/openapi.yaml`，表有变动改 `docs/database.md`，新环境变量加到上面的表里并提醒组长在服务器配置，已不成立的说明（如“暂不实现”）一并更新。
8. **测试数据。** 联调会在共用开发库留下测试账号和数据，做完要清理自己造的，清不掉的在 PR 里说明。需要成批的假数据时可以用脚本或 AI 工具生成再写库，工具给的结果不要直接信，核对过再用。

## 待定事项（定下来后更新这里）

- 前端 UI 组件库、路由、状态管理。
