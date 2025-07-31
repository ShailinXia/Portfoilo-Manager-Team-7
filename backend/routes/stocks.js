const express = require("express");
const db = require("../config/db");
const router = express.Router();

// 获取所有股票列表，支持分页、按市值/涨跌幅排序
router.get("/", (req, res) => {
  const {
    page = req.query.page || 1,
    pageSize = req.query.pageSize || 15,
    sort = "market_cap",
    order = "desc",
  } = req.query;
  const offset = (page - 1) * pageSize;

  // 只允许特定字段排序
  const allowedSort = ["market_cap", "change_percent"];
  const sortField = allowedSort.includes(sort) ? sort : "market_cap";
  const sortOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

  // 查询所有股票
  const stocks = db
    .prepare(
      `SELECT * FROM stocks ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`
    )
    .all(pageSize, offset);

  // 动态计算涨跌幅
  const stocksWithChange = stocks.map((stock) => {
    const prev = db
      .prepare(
        "SELECT price FROM stock_history WHERE stock_code = ? ORDER BY date DESC LIMIT 1 OFFSET 1"
      )
      .get(stock.code);
    let change_percent = null;
    if (prev && prev.price) {
      change_percent = Number(
        (((stock.latest_price - prev.price) / prev.price) * 100).toFixed(2)
      );
    }
    return { ...stock, change_percent };
  });

  // 排序
  stocksWithChange.sort((a, b) => {
    if (sortField === "market_cap") {
      // 市值排序（假设 market_cap 为数字，若为字符串需转换）
      return sortOrder === "ASC"
        ? Number(a.market_cap) - Number(b.market_cap)
        : Number(b.market_cap) - Number(a.market_cap);
    } else {
      // 涨跌幅排序
      return sortOrder === "ASC"
        ? (a.change_percent ?? -Infinity) - (b.change_percent ?? -Infinity)
        : (b.change_percent ?? -Infinity) - (a.change_percent ?? -Infinity);
    }
  });

  res.json(stocksWithChange);
});

router.get("/searchAll", (req, res) => {
  const { keyword } = req.query;
  if (!keyword) {
    return res.status(400).json({ message: "请输入搜索内容" });
  }

  // 模拟数据库中的数据（建议你用数据库查询）
  const stocks = db
    .prepare(`SELECT * FROM stocks WHERE name LIKE ? OR code LIKE ?`)
    .all(`%${keyword}%`, `${keyword}`); // 示例用 SQLite

  // 动态计算涨跌幅
  const stocksWithChange = stocks.map((stock) => {
    const prev = db
      .prepare(
        "SELECT price FROM stock_history WHERE stock_code = ? ORDER BY date DESC LIMIT 1 OFFSET 1"
      )
      .get(stock.code);
    let change_percent = null;
    if (prev && prev.price) {
      change_percent = Number(
        (((stock.latest_price - prev.price) / prev.price) * 100).toFixed(2)
      );
    }
    return { ...stock, change_percent };
  });

  res.json(stocksWithChange);

  // res.json(result); // 返回所有匹配项，由前端分页
});

// 获取全部股票列表信息
router.get("/all", (req, res) => {
  const stocks = db.prepare("SELECT * FROM stocks").all();
  if (stocks.length === 0) {
    return res.status(404).json({ error: "未找到股票信息" });
  }
  res.json(stocks);
});

// NOTE:静态路由优先于动态路由，动态路由放在最后
// 获取所有股票名称
router.get("/names", (req, res) => {
  // 获取分页参数，默认 page=1, pageSize=10
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  try {
    const rows = db
      .prepare(
        "SELECT stocks.name FROM stocks JOIN stock_history ON stocks.code = stock_history.stock_code LIMIT ? OFFSET ?"
      )
      .all(pageSize, offset);

    console.log(`第 ${page} 页的股票名称:`, rows);

    if (rows.length === 0) {
      return res.status(404).json({ error: "未找到股票名称" });
    } else {
      console.log("查询到的股票名称:", rows);
      res.json(rows);
    }
  } catch (err) {
    console.error("数据库查询失败:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// 获取所有股票代码
router.get("/codes", (req, res) => {
  // 从 query 中获取分页参数，默认 page=1, pageSize=10
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  try {
    // 查询总数
    const total = db
      .prepare("SELECT COUNT(stock_code) AS count FROM stock_history")
      .get().count;

    // 查询分页数据，以名称展示
    const rows = db
      .prepare(
        `
      SELECT stocks.code
      FROM stocks 
      join stock_history 
      on stocks.code=stock_history.stock_code
      LIMIT ? OFFSET ?
    `
      )
      .all(pageSize, offset);

    // // 查询分页数据，以code形式展示
    // const rows = db.prepare(`
    //   SELECT DISTINCT stock_code
    //   FROM stock_history
    //   LIMIT ? OFFSET ?
    // `).all(pageSize, offset);

    // 返回分页数据和元信息
    console.log(`第 ${page} 页的股票代码:`, rows);
    res.json({
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      data: rows,
    });
  } catch (err) {
    console.error("分页查询出错:", err);
    res.status(500).json({ error: "数据库错误" });
  }
});

// 获取单只股票详情（动态计算涨跌幅）
router.get("/:code", (req, res) => {
  const { code } = req.params;
  const stock = db.prepare("SELECT * FROM stocks WHERE code = ?").get(code);
  if (!stock) return res.status(404).json({ error: "未找到该股票" });

  const prev = db
    .prepare(
      "SELECT price FROM stock_history WHERE stock_code = ? ORDER BY date DESC LIMIT 1 OFFSET 1"
    )
    .get(code);

  let change_percent = null;
  if (prev && prev.price) {
    change_percent = Number(
      (((stock.latest_price - prev.price) / prev.price) * 100).toFixed(2)
    );
  }

  res.json({ ...stock, change_percent });
});

// 获取股票简要信息（代码、名称、最新价、涨跌幅）
router.get("/:code/brief", (req, res) => {
  const { code } = req.params;
  const stock = db
    .prepare("SELECT code, name, latest_price FROM stocks WHERE code = ?")
    .get(code);
  if (!stock) return res.status(404).json({ error: "未找到该股票" });

  const prev = db
    .prepare(
      "SELECT price FROM stock_history WHERE stock_code = ? ORDER BY date DESC LIMIT 1 OFFSET 1"
    )
    .get(code);

  let change_percent = null;
  if (prev && prev.price) {
    change_percent = Number(
      (((stock.latest_price - prev.price) / prev.price) * 100).toFixed(2)
    );
  }

  res.json({ ...stock, change_percent });
});

// 获取单只股票历史价格，只返回日期和价格
router.get("/:code/history", (req, res) => {
  const { code } = req.params;
  const { start, end } = req.query;

  let sql = `
    SELECT date, price, name
    FROM stock_history
    JOIN stocks ON stock_history.stock_code = stocks.code
    WHERE stock_code = ?
  `;
  const params = [code];

  if (start && end) {
    sql += " AND date BETWEEN ? AND ?";
    params.push(start, end);
  } else if (start) {
    sql += " AND date >= ?";
    params.push(start);
  } else if (end) {
    sql += " AND date <= ?";
    params.push(end);
  }

  sql += " ORDER BY date ASC";

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

module.exports = router;
