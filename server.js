// // server.js
// const express = require("express");
// const cors = require("cors");
//
// const app = express();
// const PORT = 8080; // 端口号可以根据需要修改
//
// // 允许跨域请求
// app.use(cors());
// // 解析 JSON 请求体
// app.use(express.json());
//
// // 示例 API 路由
// app.get("/api/hello", (req, res) => {
//   res.json({ message: "Hello from Node.js backend!" });
// });
//
// // 启动服务器
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8080;

// 您的股票数据
const stockData = [
  {
    "code": "601398",
    "name": "工商银行",
    "latest_price": 7.16,
    "market_cap": "2.73万亿",
    "turnover_rate": 0.18,
    "pe_ratio": 8.1,
    "pb_ratio": 0.74,
    "change_percent": -0.83
  },
  // 其他股票数据...
  {
    "code": "601939",
    "name": "建设银行",
    "latest_price": 9.44,
    "market_cap": "2.49万亿",
    "turnover_rate": 1.26,
    "pe_ratio": 7.45,
    "pb_ratio": 0.75,
    "change_percent": -0.63
  },
  {
    "code": "600941",
    "name": "中国移动",
    "latest_price": 117.08,
    "market_cap": "2.41万亿",
    "turnover_rate": 1.16,
    "pe_ratio": 19.65,
    "pb_ratio": 1.73,
    "change_percent": 0.09
  },
  {
    "code": "601288",
    "name": "农业银行",
    "latest_price": 6.28,
    "market_cap": "2.19万亿",
    "turnover_rate": 0.2,
    "pe_ratio": 7.6,
    "pb_ratio": 0.84,
    "change_percent": -0.48
  },
  {
    "code": "002594",
    "name": "比亚迪",
    "latest_price": 322.9,
    "market_cap": "1.86万亿",
    "turnover_rate": 1.37,
    "pe_ratio": 50.73,
    "pb_ratio": 8.8,
    "change_percent": 0.05
  },
  {
    "code": "600519",
    "name": "贵州茅台",
    "latest_price": 1585.81,
    "market_cap": "1.85万亿",
    "turnover_rate": 0.36,
    "pe_ratio": 17.26,
    "pb_ratio": 8.29,
    "change_percent": -0.05
  },
  {
    "code": "601988",
    "name": "中国银行",
    "latest_price": 5.36,
    "market_cap": "1.81万亿",
    "turnover_rate": 0.18,
    "pe_ratio": 8.34,
    "pb_ratio": 0.7,
    "change_percent": 1.71
  },
  {
    "code": "601857",
    "name": "中国石油",
    "latest_price": 8.76,
    "market_cap": "1.64万亿",
    "turnover_rate": 0.09,
    "pe_ratio": 8.74,
    "pb_ratio": 1.07,
    "change_percent": 0.92
  },
  {
    "code": "300750",
    "name": "宁德时代",
    "latest_price": 293.96,
    "market_cap": "1.31万亿",
    "turnover_rate": 0.51,
    "pe_ratio": 23.43,
    "pb_ratio": 5.42,
    "change_percent": 1.62
  },
  {
    "code": "600938",
    "name": "中国海油",
    "latest_price": 28.42,
    "market_cap": "1.24万亿",
    "turnover_rate": 1.25,
    "pe_ratio": 8.47,
    "pb_ratio": 1.58,
    "change_percent": -0.28
  },
];

// 中间件
app.use(cors());
app.use(express.json());

// 获取所有股票数据
app.get("/api/stocks", (req, res) => {
    res.json(stockData);
});

// 根据代码获取单个股票
app.get("/api/stocks/:code", (req, res) => {
  const stock = stockData.find(s => s.code === req.params.code);
  if (!stock) return res.status(404).json({ message: "Stock not found" });
  res.json(stock);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});