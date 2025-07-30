const express = require("express");
const db = require("../config/db");
const router = express.Router();

// 获取所有基金列表，支持分页、类型筛选、规模/涨跌幅排序
router.get("/", (req, res) => {
  const {
    page = req.query.page || 1,
    pageSize = req.query.pageSize || 15,
    sort = "fund_size",
    order = "asc",
  } = req.query;
  const offset = (page - 1) * pageSize;

  // 只允许特定字段排序
  const allowedSort = ["market_cap", "fund_size"];
  const sortField = allowedSort.includes(sort) ? sort : "market_cap";
  const sortOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

  // 查询所有股票
  const funds = db
    .prepare(
      `SELECT * FROM funds ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`
    )
    .all(pageSize, offset);

  // 动态计算涨跌幅
  const fundsWithChange = funds.map((fund) => {
    const prev = db
      .prepare(
        "SELECT net_value FROM fund_history WHERE code = ? ORDER BY date DESC LIMIT 1 OFFSET 1"
      )
      .get(fund.code);
    let change_percent = null;
    if (prev && prev.net_value) {
      change_percent = Number(
        (
          ((fund.latest_net_value - prev.net_value) / prev.net_value) *
          100
        ).toFixed(2)
      );
    }
    return { ...fund, change_percent };
  });

  // 排序
  if (sort === "fund_size") {
    fundsWithChange.sort((a, b) => {
      return order === "asc"
        ? (a.fund_size ?? -Infinity) - (b.fund_size ?? -Infinity)
        : (b.fund_size ?? -Infinity) - (a.fund_size ?? -Infinity);
    });
  } else {
    fundsWithChange.sort((a, b) => {
      return order === "asc"
        ? Number(a[sort]) - Number(b[sort])
        : Number(b[sort]) - Number(a[sort]);
    });
  }

  res.json(fundsWithChange);
});

router.get("/searchAll", (req, res) => {
  const { keyword } = req.query;
  if (!keyword) {
    return res.status(400).json({ message: "请输入搜索内容" });
  }

  // 模拟数据库中的数据（建议你用数据库查询）
  const funds = db
    .prepare(`SELECT * FROM funds WHERE name LIKE ? OR code LIKE ?`)
    .all(`%${keyword}%`, `${keyword}`); // 示例用 SQLite

  // 动态计算涨跌幅
  const fundsWithChange = funds.map((fund) => {
    const prev = db
      .prepare(
        "SELECT net_value FROM fund_history WHERE code = ? ORDER BY date DESC LIMIT 1 OFFSET 1"
      )
      .get(fund.code);
    let change_percent = null;
    if (prev && prev.net_value) {
      change_percent = Number(
        (
          ((fund.latest_net_value - prev.net_value) / prev.net_value) *
          100
        ).toFixed(2)
      );
    }
    return { ...fund, change_percent };
  });

  res.json(fundsWithChange);

  // res.json(result); // 返回所有匹配项，由前端分页
});

// 获取全部基金列表
router.get("/all", (req, res) => {
  const funds = db.prepare("SELECT * FROM funds").all();
  if (funds.length > 0) {
    res.json(funds);
  } else {
    res.status(404).json({ message: "没有找到基金信息" });
  }
});

// 获取单只基金详情（动态计算涨跌幅）
router.get("/:code", (req, res) => {
  const { code } = req.params;
  const fund = db.prepare("SELECT * FROM funds WHERE code = ?").get(code);
  if (!fund) return res.status(404).json({ error: "未找到该基金" });

  const prev = db
    .prepare(
      "SELECT net_value FROM fund_history WHERE code = ? ORDER BY date DESC LIMIT 1 OFFSET 1"
    )
    .get(code);

  let change_percent = null;
  if (prev && prev.net_value) {
    change_percent = Number(
      (
        ((fund.latest_net_value - prev.net_value) / prev.net_value) *
        100
      ).toFixed(2)
    );
  }

  res.json({ ...fund, change_percent });
});

// 获取基金简要信息（代码、简称、最新净值、涨跌幅）
router.get("/:code/brief", (req, res) => {
  const { code } = req.params;
  const fund = db
    .prepare(
      "SELECT code, short_name, latest_net_value FROM funds WHERE code = ?"
    )
    .get(code);
  if (!fund) return res.status(404).json({ error: "未找到该基金" });

  const prev = db
    .prepare(
      "SELECT net_value FROM fund_history WHERE code = ? ORDER BY date DESC LIMIT 1 OFFSET 1"
    )
    .get(code);

  let change_percent = null;
  if (prev && prev.net_value) {
    change_percent = Number(
      (
        ((fund.latest_net_value - prev.net_value) / prev.net_value) *
        100
      ).toFixed(2)
    );
  }

  res.json({ ...fund, change_percent });
});

// 获取单只基金历史净值，只返回日期和净值
router.get("/:code/history", (req, res) => {
  const { code } = req.params;
  const { start, end } = req.query;

  let sql = `
    SELECT date, net_value
    FROM fund_history
    WHERE code = ?
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
