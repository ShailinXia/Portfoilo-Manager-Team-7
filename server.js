// server.js
const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 8080; // 端口号可以根据需要修改

// 允许跨域请求
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*'); // 允许所有域名访问
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // 允许的HTTP方法
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // 允许的请求头
//   next();
// });

app.use(cors()); // 使用 CORS 中间件

// 解析 JSON 请求体
app.use(express.json());

// 示例：在 Node.js 端调用 API
const axios = require('axios');

let stockData = null;

// 启动时获取一次数据并保存为 JSON
axios.get('http://localhost:3000/api/stocks?page=1&limit=50&order=desc')
  .then(response => {
    stockData = response.data; // 保存为 JSON 格式
    console.log('股票数据:', stockData);
  })
  .catch(error => {
    console.error('请求失败:', error);
  });

// 示例 API 路由
app.get("/api/stocks", (req, res) => {
  if (stockData) {
    res.json(stockData); // 返回 JSON 格式数据
  } else {
    res.status(503).json({ error: '数据未准备好' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});