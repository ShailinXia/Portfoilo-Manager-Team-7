// server.js
const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 8080; // 端口号可以根据需要修改

app.use(cors()); // 使用 CORS 中间件

// 解析 JSON 请求体
app.use(express.json());

// 示例：在 Node.js 端调用 API
const axios = require("axios");

let stockData = null;
let stockNames = null;

// 启动时获取一次数据并保存为 JSON
function fetchStockData(page=1, limit=20, order='desc') {
  axios
    .get(`http://localhost:3000/api/stocks?page=${page}&limit=${limit}&order=${order}`)
    .then((response) => {
      stockData = response.data; // 保存为 JSON 格式
      console.log("股票数据:", stockData);
      return stockData; // 返回 JSON 格式数据
    })
    .catch((error) => {
      console.error("请求失败:", error);
    });
}

stockData = fetchStockData(page=1, limit=20, order="desc"); // 启动时获取一次数据

// 示例 API 路由
app.get("/api/stocks", (req, res) => {
  if (stockData) {
    res.json(stockData); // 返回 JSON 格式数据
  } else {
    res.status(503).json({ error: "数据未准备好" });
  }
});

function fetchStockNamesPage(page = 1, pageSize = 10) {
  //FIXME:虽然用了 axios.get(...) 是异步的，但你的函数本身 没有返回 这个 Promise，所以外部根本拿不到结果！应加上return，让函数真正返回
  return axios
    .get(`http://localhost:3000/api/stocks/names?page=${page}&pageSize=${pageSize}`)
    .then((response) => {
      stockNames =  response.data; // 返回 JSON 格式数据
      console.log(`第${page}股票名称数据:`, stockNames);
      return stockNames; // 返回 JSON 格式数据
    })
    .catch((error) => {
      console.error("请求失败:", error);
      return [];
    });
}

stockNames = fetchStockNamesPage(page=1, pageSize=10);

//NOTE:需配置异步加载 async及await
app.get("/api/stocks/names", async (req, res) => {
  // 从 query 中获取分页参数，默认 page=1, pageSize=10
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  stockNames = await fetchStockNamesPage(page, pageSize)
  if (stockNames && stockNames.length > 0) {
    res.json(stockNames); // 返回 JSON 格式数据
  } else {
    res.status(404).json({ error: "未找到股票名称" });
  }
});


// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
