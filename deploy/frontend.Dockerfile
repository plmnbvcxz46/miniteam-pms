# 前端镜像：构建静态文件，放进 nginx，并把 /api/ 转给后端。构建上下文是仓库根目录：
#   docker build -f deploy/frontend.Dockerfile -t miniteam-pms-frontend .
FROM node:22-alpine AS build
WORKDIR /src/frontend
RUN corepack enable && corepack prepare pnpm@10 --activate
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/frontend/dist /usr/share/nginx/html
EXPOSE 80
