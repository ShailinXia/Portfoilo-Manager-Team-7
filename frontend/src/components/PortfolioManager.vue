<template>
  <div class="portfolio-manager">
    <div class="header">
      <h1>投资组合管理</h1>
      <div class="portfolio-summary">
        <div class="summary-card">
          <h3>总价值</h3>
          <p class="value">{{ formatCurrency(totalValue) }}</p>
        </div>

        <div class="summary-card">
          <h3>总收益</h3>
          <p class="value" :class="{ positive: totalProfit >= 0, negative: totalProfit < 0 }">
            {{ formatCurrency(totalProfit) }} ({{ profitPercentage }}%)
          </p>
        </div>
        <div class="summary-card">
          <h3>持仓数量</h3>
          <p class="value">{{ portfolioItems.length }}</p>
        </div>
        <div class="summary-card">
          <h3>今日涨跌</h3>
          <p class="value"> {{ formatCurrency(dailyChange) }} ({{ dailyChangePercentage }}%)</p>
        </div>
      </div>
    </div>

    <div class="content">
      <!-- 左侧 - 投资组合列表和添加表单 -->
      <div class="left-panel">
        <div class="portfolio-list">
          <h2>我的投资组合</h2>
          <div class="search-bar">
            <input
                type="text"
                v-model="searchQuery"
                placeholder="搜索投资项目..."
                @input="filterPortfolio"
            />
          </div>

          <ul class="investment-items">
            <li v-for="item in filteredItems" :key="item.id" class="investment-item">
              <div class="item-info">
                <h3>{{ item.name }}</h3>
                <p>{{ item.symbol }} · {{ item.type }}</p>
              </div>
              <div class="item-value">
                <p>{{ formatCurrency(item.currentValue) }}</p>
                <p :class="{ positive: item.profit >= 0, negative: item.profit < 0 }">
                  {{ formatCurrency(item.profit) }} ({{ item.profitPercentage }}%)
                </p>
              </div>
              <button class="delete-btn" @click="confirmDelete(item)">×</button>
            </li>
          </ul>
        </div>

        <div class="add-investment">
          <h2>添加投资项目</h2>
          <form @submit.prevent="addInvestment">
            <div class="form-group">
              <label for="investment-type">投资类型</label>
              <select id="investment-type" v-model="newInvestment.type" required>
                <option value="stock">股票</option>
                <option value="fund">基金</option>
                <option value="bond">债券</option>
                <option value="crypto">加密货币</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div class="form-group">
              <label for="investment-name">名称</label>
              <input
                  type="text"
                  id="investment-name"
                  v-model="newInvestment.name"
                  required
                  placeholder="例如: 苹果公司"
              />
            </div>

            <div class="form-group">
              <label for="investment-symbol">代码/符号</label>
              <input
                  type="text"
                  id="investment-symbol"
                  v-model="newInvestment.symbol"
                  required
                  placeholder="例如: AAPL"
              />
            </div>

            <div class="form-group">
              <label for="investment-amount">投资金额</label>
              <input
                  type="number"
                  id="investment-amount"
                  v-model="newInvestment.amount"
                  min="0"
                  step="0.01"
                  required
              />
            </div>

            <div class="form-group">
              <label for="investment-date">购买日期</label>
              <input
                  type="date"
                  id="investment-date"
                  v-model="newInvestment.purchaseDate"
                  required
              />
            </div>

            <button type="submit" class="add-btn">添加到组合</button>
          </form>
        </div>
      </div>

      <!-- 右侧 - 投资组合表现图表 -->
      <div class="right-panel">
        <div class="performance-chart">
          <h2>投资组合表现</h2>
          <div class="chart-container">
            <canvas ref="performanceChart"></canvas>
          </div>
        </div>

        <div class="allocation-chart">
          <h2>资产分配</h2>
          <div class="chart-container">
            <canvas ref="allocationChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <h3>确认删除</h3>
        <p>确定要从投资组合中删除 {{ itemToDelete.name }} ({{ itemToDelete.symbol }}) 吗？</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="cancel-btn">取消</button>
          <button @click="deleteInvestment" class="confirm-btn">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';

export default {
  name: 'PortfolioManager',
  data() {
    return {
      portfolioItems: [
        {
          id: 1,
          name: '苹果公司',
          symbol: 'AAPL',
          type: 'stock',
          amount: 5000,
          purchaseDate: '2022-01-15',
          currentValue: 6200,
          profit: 1200,
          profitPercentage: 24
        },
        {
          id: 2,
          name: '标普500指数基金',
          symbol: 'VOO',
          type: 'fund',
          amount: 8000,
          purchaseDate: '2021-11-20',
          currentValue: 8500,
          profit: 500,
          profitPercentage: 6.25
        },
        {
          id: 3,
          name: '比特币',
          symbol: 'BTC',
          type: 'crypto',
          amount: 3000,
          purchaseDate: '2023-03-10',
          currentValue: 4500,
          profit: 1500,
          profitPercentage: 50
        }
      ],
      newInvestment: {
        type: 'stock',
        name: '',
        symbol: '',
        amount: 0,
        purchaseDate: new Date().toISOString().split('T')[0]
      },
      searchQuery: '',
      filteredItems: [],
      showDeleteModal: false,
      itemToDelete: null,
      performanceChart: null,
      allocationChart: null
    };
  },
  computed: {
    totalValue() {
      return this.portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);
    },
    totalProfit() {
      return this.portfolioItems.reduce((sum, item) => sum + item.profit, 0);
    },
    profitPercentage() {
      const totalInvested = this.portfolioItems.reduce((sum, item) => sum + item.amount, 0);
      return totalInvested > 0 ? ((this.totalProfit / totalInvested) * 100).toFixed(2) : 0;
    },
    dailyChange() {
      // 模拟每日涨跌 - 实际应用中应从API获取
      return (Math.random() * 200 - 100).toFixed(2);
    },
    dailyChangePercentage() {
      const dailyChangeValue = parseFloat(this.dailyChange);
      return dailyChangeValue !== 0 ? ((dailyChangeValue / this.totalValue) * 100).toFixed(2) : 0;
    },
    dailyChangeClass() {
      return {
      positive: this.dailyChange >= 0,
      negative: this.dailyChange < 0
    }
  }
  },
  mounted() {
    this.filteredItems = [...this.portfolioItems];
    this.initCharts();
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    },
    filterPortfolio() {
      if (!this.searchQuery) {
        this.filteredItems = [...this.portfolioItems];
        return;
      }
      const query = this.searchQuery.toLowerCase();
      this.filteredItems = this.portfolioItems.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.symbol.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query)
      );
    },
    addInvestment() {
      // 在实际应用中，这里会有API调用
      const newId = this.portfolioItems.length > 0
          ? Math.max(...this.portfolioItems.map(item => item.id)) + 1
          : 1;


      // 模拟计算当前价值和收益
      const currentValue = this.newInvestment.amount * (1 + (Math.random() * 0.5 - 0.1));
      const profit = currentValue - this.newInvestment.amount;
      const profitPercentage = (profit / this.newInvestment.amount) * 100;
      const newItem = {
        id: newId,
        name: this.newInvestment.name,
        symbol: this.newInvestment.symbol.toUpperCase(),
        type: this.newInvestment.type,
        amount: parseFloat(this.newInvestment.amount),
        purchaseDate: this.newInvestment.purchaseDate,
        currentValue: parseFloat(currentValue.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        profitPercentage: parseFloat(profitPercentage.toFixed(2))
      };

      this.portfolioItems.push(newItem);
      this.filterPortfolio();

      // 重置表单
      this.newInvestment = {
        type: 'stock',
        name: '',
        symbol: '',
        amount: 0,
        purchaseDate: new Date().toISOString().split('T')[0]
      };

      this.updateCharts();
    },
    confirmDelete(item) {
      this.itemToDelete = item;
      this.showDeleteModal = true;
    },
    deleteInvestment() {
      this.portfolioItems = this.portfolioItems.filter(item => item.id !== this.itemToDelete.id);
      this.filterPortfolio();
      this.showDeleteModal = false;
      this.itemToDelete = null;
      this.updateCharts();
    },
    initCharts() {
      Chart.register(...registerables);

      // 性能图表
      const performanceCtx = this.$refs.performanceChart.getContext('2d');
      this.performanceChart = new Chart(performanceCtx, {
        type: 'line',
        data: this.getPerformanceChartData(),
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: '投资组合价值变化'
            }
          }
        }
      });

      // 资产分配图表
      const allocationCtx = this.$refs.allocationChart.getContext('2d');
      this.allocationChart = new Chart(allocationCtx, {
        type: 'pie',
        data: this.getAllocationChartData(),
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: '资产类型分配'
            }
          }
        }
      });


      },
    updateCharts() {
      this.performanceChart.data = this.getPerformanceChartData();
      this.performanceChart.update();
      this.allocationChart.data = this.getAllocationChartData();
      this.allocationChart.update();
    },
    getPerformanceChartData() {
      // 模拟历史数据 - 实际应用中应从API获取
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      const currentMonth = new Date().getMonth();
      const labels = months.slice(0, currentMonth + 1);

      // 模拟增长数据
      const data = [];
      let value = this.totalValue * 0.7; // 起始值为当前总价值的70%
      for (let i = 0; i <= currentMonth; i++) {
        data.push(value);
        value *= (1 + (Math.random() * 0.1 - 0.02)); // 随机增长
      }

      return {
        labels,
        datasets: [{
          label: '投资组合价值',
          data,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          fill: true
        }]
      };
    },
    getAllocationChartData() {
      const types = {};

      this.portfolioItems.forEach(item => {
        if (!types[item.type]) {
          types[item.type] = 0;
        }
        types[item.type] += item.currentValue;
      });

      const typeNames = Object.keys(types);
      const backgroundColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)'
      ];

      return {
        labels: typeNames,
        datasets: [{
          data: typeNames.map(type => types[type]),
          backgroundColor: backgroundColors.slice(0, typeNames.length),
          borderWidth: 1
        }]
      };
    }
  }
};
</script>

<style scoped>
.portfolio-manager {
  font-family: 'Arial', sans-serif;
  /*max-width: 1200px;*/
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

.header {
  margin-bottom: 30px;
  text-align: center;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.portfolio-summary {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  text-align: center;
}

.summary-card h3 {
  margin-top: 0;
  color: #7f8c8d;
  font-size: 16px;
}

.summary-card .value {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0 0;
}

.positive {
  color: #27ae60;
}

.negative {
  color: #e74c3c;
}

.content {
  display: flex;
  gap: 30px;
}

.left-panel {
  /*width: 500px;*/

  flex: 1;
}

.right-panel {
  width: 590px;
}

.portfolio-list, .add-investment, .performance-chart {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.allocation-chart {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 510px;
  margin-bottom: 20px;
}

h2 {
  color: #2c3e50;
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.search-bar {
  margin-bottom: 15px;
}

.search-bar input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.investment-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.investment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.investment-item:last-child {
  border-bottom: none;
}

.item-info h3 {
  margin: 0 0 5px;
  font-size: 16px;
}

.item-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.item-value {
  text-align: right;
}

.item-value p {
  margin: 0;
}

.item-value p:first-child {
  font-weight: bold;
  margin-bottom: 5px;
}

.delete-btn {
  background: #e74c3c;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 15px;
}

.delete-btn:hover {
  background: #c0392b;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 14px;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.add-btn {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  margin-top: 10px;
}

.add-btn:hover {
  background: #27ae60;
}

.chart-container {
  position: relative;
  height: 270px;
  margin-top: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
}

.modal h3 {
  margin-top: 0;
  color: #2c3e50;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn, .confirm-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
}

.cancel-btn:hover {
  background: #7f8c8d;
}

.confirm-btn {
  background: #e74c3c;
  color: white;
}

.confirm-btn:hover {
  background: #c0392b;
}

@media (max-width: 900px) {
  .content {
    flex-direction: column;
  }
  .right-panel {
    width: 100%;
  }
}
</style>