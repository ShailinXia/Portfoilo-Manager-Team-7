// server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8080; // 端口号可以根据需要修改

// 允许跨域请求
app.use(cors());
// 解析 JSON 请求体
app.use(express.json());

// 示例 API 路由
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Node.js backend!" });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});