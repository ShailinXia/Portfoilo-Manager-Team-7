// server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8080; // 端口号可以根据需要修改

// 允许跨域请求
app.use(cors());
// 解析 JSON 请求体
app.use(express.json());

// 示例：在 Node.js 端调用 API
const axios = require('axios');


const stockData = axios.get('http://localhost:3000/api/stocks?page=1&limit=50&order=desc')
  .then(response => {
    console.log('股票数据:', response.data);
  })
  .catch(error => {
    console.error('请求失败:', error);
  });

// 示例 API 路由
app.get("/api/stocks", (req, res) => {
  res.json(stockData);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});