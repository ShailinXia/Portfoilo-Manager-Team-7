#!/bin/bash

# 日志目录路径（根据需要你也可以使用绝对路径）
LOG_DIR="log"

# 创建 log 文件夹（如果不存在）
mkdir -p "$LOG_DIR"

# 初始化数据库
echo "Initializing database..."
(
  cd ./dummydata || exit
  node scripts/initdb.js
)

# 新建日志文件
touch "./$LOG_DIR/data.log" "./$LOG_DIR/server.log" "./$LOG_DIR/vue.log"

# 启动 data 服务
echo "Starting data.js..."
(
  cd ./dummydata || exit
  node app.js > "../$LOG_DIR/data.log" 2>&1 & // 启动 data.js 并将输出重定向到 data.log
)

# 延时函数
sleep 25 # 等待 25 秒以确保 data 服务启动完成

# 启动后端服务
echo "Starting server.js..."
(
  node server.js > "./$LOG_DIR/server.log" 2>&1 & // 启动 server.js 并将输出重定向到 server.log
)

# 启动前端 Vue 服务
echo "Starting Vue.js..."
(
  cd ./frontend || exit
  npm run dev > "../$LOG_DIR/vue.log" 2>&1 & // 启动 Vue.js 并将输出重定向到 vue.log
)

echo "✅ All services are started in background. Logs are in '$LOG_DIR/'."