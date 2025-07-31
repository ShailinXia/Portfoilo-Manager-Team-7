const db = require('./config/db');
//NOTE:内置定时任务，必须要引入，否则定时任务不会执行;若文件内只是单纯的逻辑处理(且无返回值，或返回值没有用到)可以不引入
require('./utils/priceSimulator');
require('./utils/fundSimulator');
const express = require('express');
const stocksRouter = require('./routes/stocks');
const fundsRouter = require('./routes/funds'); // 加入基金路由
const userInfoRouter = require('./routes/userInfo'); // 引入用户信息路由
const loginRouter = require('./routes/login'); // 引入登录路由
const app = express();
const cors = require("cors");
app.use(cors()); // 使用 CORS 中间件

app.use(express.json());
app.use('/api/stocks', stocksRouter);
app.use('/api/funds', fundsRouter); // 注册基金路由
app.use('/api/userInfo', userInfoRouter); // 注册用户信息路由
app.use('/api/login', loginRouter); // 注册登录路由

app.listen(3000, '0.0.0.0', () => {
  console.log('API 服务已启动: http://localhost:3000');
});