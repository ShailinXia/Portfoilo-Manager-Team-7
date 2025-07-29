const express = require("express");
const db = require("../config/db");
const router = express.Router();

// 用户登录
router.post("/", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "用户名和密码不能为空" });
  }

  // 查询用户
  const user = db
    .prepare("SELECT * FROM userLogin WHERE username = ?")
    .get(username);

  if (!user) {
    // 用户不存在，自动注册
    db.prepare("INSERT INTO userLogin (username, password) VALUES (?, ?)").run(
      username,
      password
    );
    return res.status(200).json({
      message: "用户不存在，已自动注册！！！",
      data: { username, password },
    });
  } else if (user.password !== password) {
    // 密码错误
    return res.status(401).json({ message: "用户存在，❎ 密码错误" });
  }

  // 登录成功，返回用户信息（不包括密码）
  const { password: _, ...userInfo } = user;
  return res.json({ message: "登陆成功！！！", success:true, userInfo});
});

module.exports = router;
