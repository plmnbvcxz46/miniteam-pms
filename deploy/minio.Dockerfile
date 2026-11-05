# MinIO 镜像：官方已不再发布社区版的二进制和镜像（Docker Hub 上的 minio/minio 已下架），所以从源码构建。
# 提交号固定，改版本只改这里。没有官方签名，也不会有官方的安全更新；
# 想换成别的 S3 兼容存储，把 compose 里的 minio 服务去掉、改 .env 里的 OSS_* 即可，后端代码不用动。
#   docker build -f deploy/minio.Dockerfile -t miniteam-pms-minio .
FROM golang:1.24 AS build
ARG MINIO_REF=7aac2a2c5b7c
ARG MC_REF=latest
ENV CGO_ENABLED=0 GOBIN=/out
RUN go install -trimpath github.com/minio/minio@${MINIO_REF} \
 && go install -trimpath github.com/minio/mc@${MC_REF}

FROM alpine:3.20
# mc 在初始化容器里建桶、建用户用；minio 是存储服务本身
COPY --from=build /out/minio /usr/local/bin/minio
COPY --from=build /out/mc /usr/local/bin/mc
EXPOSE 9000 9001
ENTRYPOINT ["/usr/local/bin/minio"]
CMD ["server", "/data", "--address", ":9000", "--console-address", ":9001"]
