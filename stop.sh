#!/bin/bash

# 删除数据库文件，保留用户信息表
DB_FILE="./backend/db/dummy.db"

echo "Stopping data.js..."
pkill -f "npm start"

# echo "Stopping server.js..."
# pkill -f "server.js"

echo "Stopping Vue.js..."
pkill -f "npm run dev"

# 等待进程完全释放数据库资源
echo "Waiting for processes to release database lock..."
sleep 2

# 查找占用数据库文件的进程ID并杀死
echo "Checking and killing processes locking $DB_FILE ..."
PIDS=$(lsof "$DB_FILE" 2>/dev/null | awk 'NR>1 {print $2}' | sort -u)

if [ -z "$PIDS" ]; then
  echo "No processes locking the database."
else
  echo "Found processes locking the database: $PIDS"
  for PID in $PIDS; do
    echo "Killing process $PID ..."
    kill -9 $PID
  done
  echo "Processes killed."
fi

# 等待确保数据库锁释放
sleep 1

# 检查数据库文件是否存在
if [ ! -f "$DB_FILE" ]; then
  echo "❌ 数据库文件不存在: $DB_FILE"
  exit 1
fi

echo "Deleting data from all tables except 'userInfo'..."

# 拼接所有 DELETE 语句（除 userInfo 外）
SQL=$(sqlite3 "$DB_FILE" <<EOF
.output /dev/stdout
SELECT 'DELETE FROM "' || name || '";'
FROM sqlite_master
WHERE type='table' AND name NOT LIKE 'userLogin';
EOF
)

# 如果 SQL 非空才执行（避免空执行）
if [ -n "$SQL" ]; then
  echo "Executing:"
  echo "$SQL"
  echo "$SQL" | sqlite3 "$DB_FILE" || {
    echo "❌ 删除数据失败，可能仍被锁定"
    exit 1
  }
  echo "✅ Data cleared."
else
  echo "⚠️ 没有需要清除数据的表"
fi

echo "✅ All services stopped and database cleaned."

echo "✅ All services stopped."