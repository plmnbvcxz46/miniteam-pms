# 自部署（Docker）

用 docker compose 一条命令起整套系统：MySQL、对象存储（MinIO）、后端、前端（nginx）。线上那台服务器**不用这套**，它是原生部署（MySQL 用 apt 装，后端 systemd 托管，见 `docs/deploy-oss.md`），这套是给别人自己部署用的。

## 怎么起

需要一台装了 Docker（含 compose v2.23 以上）的机器，空闲内存 2GB 左右。

```bash
mkdir miniteam-pms && cd miniteam-pms
# 下载 deploy/ 里的这三个文件
#   docker-compose.yml  .env.example  init-env.sh
sh init-env.sh          # 生成 .env，里面所有密码都是随机的，并打印初始管理员账号
docker compose up -d
```

等一两分钟（后端第一次启动要建表），浏览器打开 `http://服务器地址`，用 `.env` 里的 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 登录，**登录后先改管理员密码**。

不想用脚本也行：把 `.env.example` 复制成 `.env`，把空着的密码都填上。

## 里面有什么

| 服务 | 说明 |
|---|---|
| `mysql` | MySQL 8.0，库名 `app`，数据在卷 `mysql-data`。表结构由后端启动时的 Flyway 自动建 |
| `minio` | 对象存储，存文档文件，数据在卷 `minio-data`。镜像是我们自己从源码构建的（官方不再发布社区版镜像） |
| `minio-init` | 只跑一次：建桶、建一个只能访问这个桶的用户。后端用的是这个用户，不是根账号 |
| `backend` | 后端，只在容器网络里，不对外开放 |
| `frontend` | nginx，放前端页面，把 `/api/` 转给后端，对外只有这一个端口（`HTTP_PORT`，默认 80） |

## 密码和配置

所有密码都在 `.env` 里，不进镜像，也不要提交：

| 变量 | 含义 |
|---|---|
| `MYSQL_ROOT_PASSWORD`、`DB_PASSWORD` | 数据库 root 和后端用的账号 |
| `MINIO_ROOT_USER`、`MINIO_ROOT_PASSWORD` | 对象存储根账号，只用来初始化 |
| `OSS_BUCKET`、`OSS_ACCESS_KEY`、`OSS_SECRET_KEY` | 后端访问对象存储用的桶和密钥 |
| `JWT_SECRET` | 登录令牌签名密钥，固定下来重启后不用重新登录 |
| `ADMIN_USERNAME`、`ADMIN_PASSWORD` | 用户表为空时自动创建的初始管理员 |
| `HTTP_PORT`、`IMAGE_TAG` | 对外端口、镜像版本 |

`init-env.sh` 不会覆盖已有的 `.env`。数据库和存储第一次启动时就用这些密码初始化了，**之后再改 `.env` 里的数据库或存储密码不会生效**，要连数据卷一起删了重来（数据会丢）。

## 升级和回退

```bash
docker compose pull      # 拉最新镜像
docker compose up -d     # 重启有变化的服务
```

想固定某个版本或回退，在 `.env` 里把 `IMAGE_TAG` 改成那次的提交号（镜像在 GitHub 的 Packages 里能看到所有标签）再 `up -d`。表结构的升级由后端启动时的 Flyway 自动做，**只能往前，回退到旧版本后端前要先备份数据库**。

## 备份

要备份的是两个卷和 `.env`：

```bash
# 数据库（不停服务）
docker compose exec mysql sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction app' > app-$(date +%F).sql
# 文档文件（停一下 minio 最稳妥）
docker compose stop minio
docker run --rm -v miniteam-pms_minio-data:/data -v "$PWD":/backup alpine tar czf /backup/minio-$(date +%F).tgz -C /data .
docker compose start minio
```

## 镜像从哪来

镜像由 GitHub Actions 构建并推到 `ghcr.io/plmnbvcxz46/`：

- `miniteam-pms-backend`、`miniteam-pms-frontend`：每次合并到 `main` 且“部署”工作流成功后构建（`.github/workflows/docker-publish.yml`），标签是 `latest` 和提交号。
- `miniteam-pms-minio`：从源码构建要几分钟，单独放在 `.github/workflows/minio-image.yml`，只在手动触发或 `deploy/minio.Dockerfile` 变了时构建。
- 第一次发布后，要在仓库的 Packages 设置里把这三个包改成公开（Public），别人才能不登录就拉。

镜像还没发布，或者想自己改了再跑，在整个仓库里执行：

```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

## 换成别的对象存储

MinIO 没有官方安全更新。后端只认 S3 协议，想换成阿里云 OSS、腾讯 COS 或别的 S3 服务：把 compose 里的 `minio` 和 `minio-init` 两个服务删掉，给 `backend` 的环境变量改成对方的 `OSS_ENDPOINT`、`OSS_REGION`、`OSS_BUCKET`、`OSS_ACCESS_KEY`、`OSS_SECRET_KEY`，阿里云和腾讯云要把 `OSS_PATH_STYLE` 设为 `false`。

## 已知限制

- 这套文件**没有在本机实际运行验证过**（写的时候开发机上没有 Docker），第一次真正跑通要靠 CI 构建和部署后的试用，遇到问题请改这里。
- 只提供 HTTP，没有 HTTPS；要 HTTPS 在前面再加一层反向代理（Caddy、nginx + 证书）。
- 单机部署，没有高可用。
