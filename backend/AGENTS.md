# backend

后端补充约定。总约定见根目录 `AGENTS.md`，冲突时以根目录为准。

## 技术栈

- Java 21，Spring Boot 4.0（`spring-boot-starter-webmvc`），MyBatis（`mybatis-spring-boot-starter` 4.0），MySQL 8（`mysql-connector-j`），Flyway（表结构迁移），Lombok，Validation。
- 注意是 Spring Boot **4.x**：网上很多教程和 AI 默认按 2.x/3.x 写，遇到包名、starter 名或配置项对不上时，以 4.x 官方文档为准，不要降级依赖版本。
- 根包 `org.miniteam.pms`，启动类 `BackendApplication`。配置文件 `src/main/resources/application.yaml`。

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
