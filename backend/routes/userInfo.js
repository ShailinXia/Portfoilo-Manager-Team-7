const express = require("express");
const db = require("../config/db");
const router = express.Router();

// 获取用户信息
router.get("/", (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ message: "用户名不能为空" });
  }

// 查询用户信息
  const userInfo = db
    .prepare("SELECT * FROM userInfo WHERE username = ?")
    .get(username);

  if (userInfo) {
    res.json(userInfo);
  } else {
    res.status(404).json({ message: "用户信息未找到" });
  }
});

// 添加用户信息
router.post("/", (req, res) => {
  let dataArray = [];

  // 判断是单个对象还是数组
  if (Array.isArray(req.body)) {
    dataArray = req.body;
  } else if (typeof req.body === "object" && req.body !== null) {
    dataArray = [req.body]; // 包装为数组
  } else {
    return res
      .status(400)
      .json({ message: "请求体必须是 JSON 对象或 JSON 数组" });
  }

  // 验证每个对象的字段
  for (const item of dataArray) {
    const { username, investmentType, investmentAmount } = item;
    if (!username || !investmentType || !investmentAmount) {
      return res.status(400).json({
        message:
          "每个对象必须包含 username, investmentType 和 investmentAmount",
      });
    }
  }

  // 批量插入用户信息
  const insertUser = db.prepare(
    "INSERT INTO userInfo (username, investment_type, investment_amount) VALUES (?, ?, ?)"
  );
  // 使用事务批量插入
  const insertMany = db.transaction((users) => {
    for (const user of users) {
      insertUser.run(user.username, user.investmentType, user.investmentAmount);
    }
  });

  try {
    insertMany(dataArray);
    res.status(200).json({
      message: "用户信息批量添加成功",
      count: dataArray.length,
      data: dataArray,
    });
  } catch (error) {
    console.error("批量插入失败:", error.message);
    res.status(500).json({ message: "用户信息添加失败" });
  }
});

// 更新用户信息
router.put("/", (req, res) => {
  const { username, investmentType, investmentAmount } = req.body;
  // 更新用户信息
  const updateUser = db
    .prepare(
      "UPDATE userInfo SET investment_type = ?, investment_amount = ? WHERE username = ?"
    )
    .run(investmentType, investmentAmount, username);
  if (updateUser.changes > 0) {
    res.json({ message: "用户信息更新成功" });
  } else {
    res.status(404).json({ message: "用户信息未找到" });
  }
});

// 删除用户信息
router.delete("/", (req, res) => {
  const { username } = req.query;
  // 删除用户信息
  const deleteUser = db
    .prepare("DELETE FROM userInfo WHERE username = ?")
    .run(username);
  if (deleteUser.changes > 0) {
    res.json({ message: `${username}信息删除成功`});
  } else {
    res.status(404).json({ message: "用户信息未找到" });
  }
});

module.exports = router;
