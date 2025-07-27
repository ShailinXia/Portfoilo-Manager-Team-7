#!/bin/bash

echo "🧩 初始化数据库..."
node scripts/initDB.js

echo "🚀 启动服务..."
node app.js