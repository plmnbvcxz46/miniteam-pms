#!/bin/sh
# 用 .env.example 生成 .env，所有空着的密码填随机值。已经有 .env 就不覆盖，免得把正在用的密码换掉。
set -eu
cd "$(dirname "$0")"

if [ -f .env ]; then
  echo ".env 已经存在，没有改动。要重新生成请先删掉它（注意：数据库和存储里已经用旧密码初始化过的话，要连数据卷一起删）。" >&2
  exit 1
fi

random() {
  # 32 个字母数字，不含容易在 shell 和 JDBC 里出问题的符号
  LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 32
}

while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    MYSQL_ROOT_PASSWORD=|DB_PASSWORD=|MINIO_ROOT_PASSWORD=|OSS_SECRET_KEY=|JWT_SECRET=|ADMIN_PASSWORD=)
      echo "${line}$(random)" ;;
    *)
      echo "$line" ;;
  esac
done < .env.example > .env
chmod 600 .env

echo "已生成 .env。初始管理员："
grep -E '^(ADMIN_USERNAME|ADMIN_PASSWORD)=' .env
echo "登录后请先改掉管理员密码，并把 .env 备份到安全的地方（丢了数据库密码就进不去数据库了）。"
