# 文档文件存储（MinIO）部署说明

文档上传的文件存在 **S3 协议的对象存储**里，库里只记文件名、大小、版本等元数据。后端只认 S3 协议（`common/storage/S3FileStorage`），业务代码里没有任何 MinIO 专有的东西，所以存储服务可以换：自建 MinIO、Garage、阿里云 OSS、腾讯 COS 都行，只改下面的环境变量。

## 后端配置

| 变量 | 含义 | 默认值 |
|---|---|---|
| `OSS_ENDPOINT` | S3 地址 | `http://127.0.0.1:9000` |
| `OSS_BUCKET` | 桶名。线上 `app`，开发 `app-dev` | `app-dev` |
| `OSS_ACCESS_KEY` | 访问密钥 ID | `unset`（没配时上传下载会报错，其他功能不受影响） |
| `OSS_SECRET_KEY` | 访问密钥 | `unset` |
| `OSS_REGION` | 区域，MinIO 填 `us-east-1` 即可 | `us-east-1` |
| `OSS_PATH_STYLE` | 路径风格访问。MinIO 要 `true`；阿里云 OSS、腾讯 COS 设 `false` | `true` |

- 线上：写进 `/opt/app/app.env`（systemd 的环境文件），指向 `http://127.0.0.1:9000`、桶 `app`。
- 本机开发：密钥写进 `backend/application-local.yaml`（已被忽略，不要提交）：

  ```yaml
  app:
    storage:
      endpoint: http://127.0.0.1:9000
      bucket: app-dev
      access-key: 开发密钥 ID
      secret-key: 开发密钥
  ```

- 桶是私有的。下载由后端校验项目成员身份后读出文件再返回，不发预签名链接，前端拿不到存储地址。
- 文件限制：doc、docx、pdf、md，单个 20MB。`application.yaml` 里的 `spring.servlet.multipart` 管后端的限制，**nginx 要同步放开**：`client_max_body_size 25m;`（nginx 默认只有 1MB，不改上传会返回 413）。

## 服务器上的 MinIO（和 MySQL 一样原生安装，不用 docker）

服务器是 2 核 2G，MinIO 空闲时占 100–200MB。装法和 MySQL 一致：二进制 + systemd。

> 注意：MinIO 社区版从 2025 年起不再发布预构建的二进制和镜像（`dl.min.io` 返回 410），只剩源码。
> 现在线上的二进制是从源码自己编译的（Go 1.24，`CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go install -trimpath github.com/minio/minio@latest`，
> 国内用 `GOPROXY=https://goproxy.cn,direct`）。没有官方签名，也不会再有安全更新，升级要自己重新编译。
> 如果以后要换成别的 S3 兼容存储（Garage、SeaweedFS、RustFS），业务代码不用改，换服务并改上面的变量即可。

当前服务器布局（2026-11 部署）：

| 项 | 值 |
|---|---|
| 二进制 | `/usr/local/bin/minio` |
| systemd 单元 | `minio-pms.service`（`MemoryMax=400M`），环境文件 `/etc/default/minio-pms`（根账号，权限 640） |
| 监听 | `127.0.0.1:9000`（S3）、`127.0.0.1:9001`（控制台），**不对外开放** |
| 数据目录 | `/data/minio-pms`（用户 `minio-pms`）。`/data/minio` 是以前别的项目留下的旧数据，别动 |
| 桶 | `app`（线上）、`app-dev`（开发，全组共用） |
| 访问密钥 | 每个桶一个单独的用户（`app-user`、`app-dev-user`），策略只允许访问自己的桶；密钥在服务器 `/root/minio-keys.txt`（权限 600） |

装法概要（需要 root）：

1. 建用户和数据目录：`useradd -r -s /usr/sbin/nologin minio-pms`，`mkdir /data/minio-pms && chown minio-pms: /data/minio-pms`。
2. `/etc/default/minio-pms` 里写 `MINIO_ROOT_USER`、`MINIO_ROOT_PASSWORD`（随机长密码）、`MINIO_VOLUMES=/data/minio-pms`、`MINIO_OPTS="--address 127.0.0.1:9000 --console-address 127.0.0.1:9001"`、`GOMEMLIMIT=250MiB`。
3. systemd 单元：`ExecStart=/usr/local/bin/minio server $MINIO_OPTS $MINIO_VOLUMES`，`Restart=on-failure`，`MemoryMax=400M`。
4. 用 `mc` 建桶，给每个桶建一个只能访问该桶的用户（策略放行 `s3:ListBucket` 在桶上，`s3:GetObject/PutObject/DeleteObject` 在 `桶/*` 上），后端用这些用户的密钥，不要用根账号。

## 组员本机怎么连开发桶

MinIO 只监听服务器本机，和开发库 3306 不一样，没有对外开放。本机开发用 SSH 隧道把服务器的 9000 映射到本机：

```bash
ssh -N -L 9000:127.0.0.1:9000 aliyun
```

隧道开着，后端默认的 `OSS_ENDPOINT=http://127.0.0.1:9000` 就连到开发桶了（密钥向组长要）。**开发库里的文档记录和开发桶里的文件是配套的**：清理测试数据时要同时删库里的行和桶里的对象。

## 备份

文件只在服务器硬盘上，没有副本。数据目录 `/data/minio-pms` 定期打包备份，或者用 `mc mirror` 同步到别处。恢复时和数据库一起恢复，否则库里有记录而文件找不到（下载会提示「文件已经找不到了」）。
