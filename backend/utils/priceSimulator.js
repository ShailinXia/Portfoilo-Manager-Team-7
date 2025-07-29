const db = require('../config/db');

let virtualDate = new Date('2025-01-01'); // 初始虚拟日期

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function simulatePrices() {
  try {
    const stocks = db.prepare('SELECT code, latest_price FROM stocks').all();
    stocks.forEach(stock => {
      // 随机波动 ±2%
      const changePercent = (Math.random() * 4 - 2).toFixed(2); // -2% ~ +2%
      const newPrice = +(stock.latest_price * (1 + changePercent / 100)).toFixed(2);

      // 只更新最新价
      db.prepare('UPDATE stocks SET latest_price = ? WHERE code = ?')
          .run(newPrice, stock.code);

      // 插入历史价格
      // db.prepare('INSERT INTO stock_history (stock_code, date, price) VALUES (?, ?, ?)')
      //     .run(stock.code, formatDate(virtualDate), newPrice);
      // 用 INSERT OR REPLACE 防止历史表重复
      db.prepare('INSERT OR REPLACE INTO stock_history (stock_code, date, price) VALUES (?, ?, ?)')
          .run(stock.code, formatDate(virtualDate), newPrice);
    });

    virtualDate.setDate(virtualDate.getDate() + 1);
    console.log(`[模拟股价已更新] ${formatDate(virtualDate)}，共${stocks.length}只股票`);
  } catch (err) {
    console.error('[simulatePrices 错误]', err); // 打印完整的错误堆栈
    process.exit(1); // 测试时打开

  }
}


// 每分钟模拟一次
setInterval(simulatePrices, 600 * 1000);

module.exports = { simulatePrices };