# backend

后端补充约定。总约定见根目录 `AGENTS.md`，冲突时以根目录为准。

## 技术栈

- Java 21，Spring Boot 4.0（`spring-boot-starter-webmvc`），MyBatis（`mybatis-spring-boot-starter` 4.0），MySQL 8（`mysql-connector-j`），Flyway（表结构迁移），Lombok，Validation。
- 注意是 Spring Boot **4.x**：网上很多教程和 AI 默认按 2.x/3.x 写，遇到包名、starter 名或配置项对不上时，以 4.x 官方文档为准，不要降级依赖版本。
- 根包 `org.miniteam.pms`，启动类 `BackendApplication`。配置文件 `src/main/resources/application.yaml`。

## 包结构

- 根包 `org.miniteam.pms`，按业务模块分包：`auth` `user` `project` `task` `progress` `report` `collab` `defect` `document` `system`，模块职责见各包 `package-info.java` 和 `docs/features.md`。
- 模块内分层：`controller` `service` `mapper` `entity` `dto`，按需建子包。只改自己任务所属的模块。
- 通用代码放 `common`，不放业务逻辑。
- MyBatis XML 放 `src/main/resources/mapper/<模块>/`。
- Controller 返回 `Result<T>`，分页返回 `Result<PageResult<T>>`。
- 业务错误抛 `BusinessException(ResultCode.XXX, "给用户看的原因")`，由全局异常处理转换，不要在 Controller 里自己拼错误响应。
- 日期时间字段用 `LocalDate` / `LocalDateTime`，DTO 上加 `@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")`（日期为 `yyyy-MM-dd`）。

## 认证与权限

- `@RestController` 的路径会自动加 `/api` 前缀（`common/config/ApiPrefixConfig`），Controller 里只写接口文档里的路径，如 `@RequestMapping("/users")`，不要再写 `/api`。
- 除登录、注册外的接口都要带 JWT，由 `auth/AuthInterceptor` 统一校验。身份只从 `AuthContext.require()` 取，**不要信请求里传的用户 id**；只有系统管理员能做的事用 `AuthContext.requireAdmin()`，无权限抛 403。
- 项目内的权限（是不是成员、能不能编辑任务等）不在拦截器里做，写在对应模块的 Service 里，每个接口自己校验。
- 记操作日志用 `OperationLogService.record(...)`，失败不会影响业务。
- 数据库里的 JSON 数组列（技能标签、权限编码）在 XML 里用 `typeHandler="org.miniteam.pms.common.mybatis.JsonStringListTypeHandler"`，Java 侧是 `List<String>`。
- 本机第一次启动时用户表是空的，会自动创建管理员 `admin` / `123456`，用它登录；开发库建好之后这个账号已经存在。

## 常用命令（在仓库根目录执行）

| 做什么 | 命令 |
|---|---|
| 编译并打包 | `mvn -f backend package`（会顺带自动格式化） |
| 只格式化 | `mvn -f backend spotless:apply` |
| 跑测试 | `mvn -f backend test` |

Windows 没装 Maven 的话，把 `mvn -f backend` 换成在 `backend` 目录里执行 `.\mvnw.cmd`。

## 代码格式

- 由 Spotless + palantir-java-format 统一，配置在 `pom.xml` 的 `spotless-maven-plugin`，绑定在 `process-sources` 阶段，编译时自动执行。
- 不要改 Spotless 配置，也不要为了“好看”手动调整缩进和换行。PR 时 GitHub 机器人会再格式化一遍。

## 配置

- `application.yaml` 里的数据库连接都写成 `${DB_URL:默认值}` 这种形式，这样服务器能用环境变量覆盖；**任何密码都不能写进去**。
- 本机运行时**默认连服务器上的开发库 `app_dev`**（全组共用），服务器上的后端由环境变量改连线上库 `app`。
- 开发库密码不在仓库里。第一次运行前，在 `backend/` 下新建 `application-local.yaml`（已被忽略，启动时自动读取），内容向组长要，格式：

  ```yaml
  spring:
    datasource:
      password: 开发库密码
  ```

- 开发库大家共用：**改表必须写 Flyway 脚本**放进 `src/main/resources/db/migration/`（`V序号__说明.sql`，序号接着最大的往下编），启动后端时自动执行；不要在数据库工具里手动建表改表。两个人同时写脚本可能撞序号，写之前在群里说一声。不要写清空全表、删库这类操作。
- 连接池上限 10（`hikari.maximum-pool-size`），MySQL 总上限 100，不要再调大。
