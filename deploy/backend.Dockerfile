# 后端镜像：在镜像里用 Maven 打包，再用精简的 JRE 运行。构建上下文是仓库根目录：
#   docker build -f deploy/backend.Dockerfile -t miniteam-pms-backend .
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
# 先只拷 pom 拉依赖，源码改了不用重新下载
COPY backend/pom.xml backend/pom.xml
RUN mvn -B -q -f backend/pom.xml dependency:go-offline
COPY backend/src backend/src
RUN mvn -B -q -f backend/pom.xml package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /src/backend/target/backend-*.jar app.jar
EXPOSE 8080
# 堆内存上限和线上一致（2G 机器），时区和后端代码里的 Asia/Shanghai 保持一致
ENV TZ=Asia/Shanghai
ENTRYPOINT ["java", "-Xmx384m", "-jar", "/app/app.jar"]
