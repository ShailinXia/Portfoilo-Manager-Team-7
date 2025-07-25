#!/bin/bash

echo "Stopping data.js..."
pkill -f "npm start"

echo "Stopping server.js..."
pkill -f "server.js"

echo "Stopping Vue.js..."
pkill -f "npm run dev"

# 删除数据库文件
echo "Removing database files..."
rm -rf ./dummydata/db/dummy.db

echo "✅ All services stopped."