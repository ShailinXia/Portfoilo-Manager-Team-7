const db = require('../config/db');

let virtualDate = new Date('2025-01-01'); // 初始虚拟日期

let muH = 0;
let sigma = 0;

/**
 * 模拟每小时股价变化，加入随机涨跌因素
 * S(t) = S(t-1) * exp(mu + sigma * epsilon)
 *
 * @param {number} S0 - 初始股价
 * @param {number} muH - 每小时平均对数收益率（趋势）
 * @param {number} sigma - 每小时波动率（控制涨跌幅）
 * @param {number} hours - 模拟的小时数
 * @returns {number[]} 股票价格序列
 */
function simulateStockPriceWithRandom(muH, sigma) {

  // 生成标准正态分布随机数（Box-Muller方法）
  const u1 = Math.floor(Math.random() * (20 + 1)) -10;
  const u2 = Math.floor(Math.random() * (10 + 1)) -5;
  const epsilon = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

  // 计算新的股价
  // const prevPrice = prices[prices.length - 1];
  // const newPrice = prevPrice * Math.exp(muH + sigma * epsilon);
  // return parseFloat(newPrice.toFixed(2));
  return Math.exp(muH + sigma * epsilon);

  // prices.push(parseFloat(newPrice.toFixed(2))); // 保留两位小数
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function simulatePrices() {
  try {
    const stocks = db.prepare('SELECT code, latest_price FROM stocks').all();
    stocks.forEach(stock => {
      // 随机波动 ±2%
      const changePercent = simulateStockPriceWithRandom((muH = 0.00005), (sigma = 0.005));
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
setInterval(simulatePrices, 5 * 1000);

module.exports = { simulatePrices };