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
      <!-- 左侧 -->
      <div class="left-panel">
        <div class="card portfolio-list">
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
        <div class="card add-investment">
          <h2>添加投资项目</h2>
          <form @submit.prevent="addInvestment">
            <div class="form-group">
              <label for="investment-type">投资类型</label>
              <select id="investment-type" v-model="newInvestment.type" required>
                <option v-for="t in investmentTypes" :value="t.value" :key="t.value">{{ t.label }}</option>
              </select>
            </div>
            <div class="form-group" style="position:relative">
              <label for="investment-name">名称</label>
              <input
                  type="text"
                  id="investment-name"
                  v-model="newInvestment.name"
                  @input="onNameInput"
                  autocomplete="off"
                  required
                  placeholder="请输入并选择..."
              />
              <ul v-if="nameSuggestions.length" class="suggestion-list">
                <li v-for="item in nameSuggestions" @mousedown.prevent="selectSuggestion(item)">
                  {{ item.name }} ({{ item.code }})
                </li>
              </ul>
            </div>
            <div class="form-group">
              <label for="investment-symbol">代码/符号</label>
              <input
                  type="text"
                  id="investment-symbol"
                  v-model="newInvestment.symbol"
                  readonly
                  required
                  placeholder="自动填充"
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
      <!-- 右侧 -->
      <div class="right-panel">
        <div class="card performance-chart">
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <span style="font-size:22px;font-weight:bold;color:#2c3e50;">股票历史数据</span>
            
            <div class="stock-code-input">
              <input
                type="text"
                v-model="selectedStockCode"
                @input="validateStockCode"
                placeholder="输入股票代码(6位)"
                maxlength="6"
                class="custom-input"
              />
              <span v-if="stockCodeError" class="error-text">{{ stockCodeError }}</span>
            </div>
          </div>
          <div v-if="chartError" class="error">{{ chartError }}</div>
          <div ref="echartsContainer" class="chart-wrapper" style="height:350px;width:100%"></div>
          <div class="controls-container">
            <button @click="fetchStockData" :disabled="chartLoading || stockCodeError" class="refresh-btn">
              {{ chartLoading ? '加载中...' : '刷新数据' }}
            </button>
            <div class="date-range-container">
              <div class="date-input-group">
                <label>开始日期: </label>
                <input type="date" v-model="chartStartDate" :disabled="chartLoading"/>
              </div>
              <div class="date-input-group">
                <label>结束日期: </label>
                <input type="date" v-model="chartEndDate" :disabled="chartLoading"/>
              </div>
            </div>
          </div>
        </div>

        <div class="card allocation-chart">
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
import {Chart, registerables} from 'chart.js';
import * as echarts from 'echarts';
import axios from 'axios';

Chart.register(...registerables);

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
      investmentTypes: [
        {value: 'stock', label: '股票'},
        {value: 'fund', label: '基金'}
      ],
      newInvestment: {
        type: 'stock',
        name: '',
        symbol: '',
        amount: 0,
        purchaseDate: new Date().toISOString().split('T')[0]
      },
      allStocks: [],
      allFunds: [],
      nameSuggestions: [],
      loadingNames: false,
      searchQuery: '',
      filteredItems: [],
      showDeleteModal: false,
      itemToDelete: null,
      allocationChart: null,

      // 股票图表相关数据
      selectedStockCode: '000001',
      stockCodeError: '',
      chartStartDate: '2025-01-01',
      chartEndDate: '2025-07-25',
      chartLoading: false,
      chartError: null,
      echartsInstance: null,
      originStockData: [],
      stocksList: []
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
      return (Math.random() * 200 - 100).toFixed(2);
    },
    dailyChangePercentage() {
      const dailyChangeValue = parseFloat(this.dailyChange);
      return dailyChangeValue !== 0 ? ((dailyChangeValue / this.totalValue) * 100).toFixed(2) : 0;
    }
  },
  mounted() {
    this.filteredItems = [...this.portfolioItems];
    this.initAllocationChart();
    this.initEcharts();
    this.fetchStockData();
    this.fetchStockList();

    window.addEventListener('resize', this.resizeEcharts);
  },
  beforeUnmount() {
    this.destroyEcharts();
    window.removeEventListener('resize', this.resizeEcharts);
  },
  watch: {
    selectedStockCode: 'fetchStockData',
    chartStartDate: 'fetchStockData',
    chartEndDate: 'fetchStockData',
    'newInvestment.type': {
      immediate: true,
      handler(val) {
        if (val === 'stock') {
          this.fetchStocks();
        } else if (val === 'fund') {
          this.fetchFunds();
        }
        this.newInvestment.name = '';
        this.newInvestment.symbol = '';
        this.nameSuggestions = [];
      }
    }
  },
  methods: {
    validateStockCode() {
      if (!this.selectedStockCode) {
        this.stockCodeError = '请输入股票代码';
        return;
      }
      
      if (!/^\d{6}$/.test(this.selectedStockCode)) {
        this.stockCodeError = '股票代码必须是6位数字';
        return;
      }
      
      const codeNum = parseInt(this.selectedStockCode);
      if (codeNum < 1 || codeNum > 999999) {
        this.stockCodeError = '股票代码必须在000001-999999之间';
        return;
      }
      
      this.stockCodeError = '';
    },
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
    async fetchStocks() {
      const res = await fetch('http://localhost:3000/api/stocks');
      this.allStocks = await res.json();
    },
    async fetchFunds() {
      const res = await fetch('http://localhost:3000/api/funds');
      this.allFunds = await res.json();
    },
    onNameInput(e) {
      const val = e.target.value.trim();
      let list = this.newInvestment.type === 'stock' ? this.allStocks : this.allFunds;
      if (!val) {
        this.nameSuggestions = [];
        return;
      }
      this.nameSuggestions = list.filter(item =>
          item.name.includes(val) ||
          (item.code && item.code.includes(val))
      ).slice(0, 10);
    },
    selectSuggestion(item) {
      this.newInvestment.name = item.name;
      this.newInvestment.symbol = item.code;
      this.nameSuggestions = [];
    },
    async addInvestment() {
      const postBody = {
        username: "Allen",
        investmentType: this.newInvestment.type,
        investmentName: this.newInvestment.name,
        investmentCode: this.newInvestment.symbol,
        investmentAmount: Number(this.newInvestment.amount),
        investmentDate: this.newInvestment.purchaseDate
      };
      try {
        const resp = await fetch('http://localhost:3000/api/userInfo/', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(postBody)
        });
        const result = await resp.json();
        if (result.success) {
          alert("添加投资项目成功！");
          this.newInvestment = {
            type: 'stock',
            name: '',
            symbol: '',
            amount: '',
            purchaseDate: new Date().toISOString().split('T')[0]
          };
          this.filterPortfolio && this.filterPortfolio();
        } else {
          alert("添加有误：" + (result.message || "请检查数据"));
        }
      } catch (err) {
        alert("添加有误：" + err.message);
      }
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
      this.updateAllocationChart();
    },
    initEcharts() {
      if (this.echartsInstance) return;
      this.echartsInstance = echarts.init(this.$refs.echartsContainer);
    },
    destroyEcharts() {
      if (this.echartsInstance) {
        this.echartsInstance.dispose();
        this.echartsInstance = null;
      }
    },
    resizeEcharts() {
      if (this.echartsInstance) this.echartsInstance.resize();
    },
    async fetchStockList() {
      try {
        const res = await axios.get('http://localhost:3000/api/stocks');
        this.stocksList = res.data;
      } catch (err) {
        this.stocksList = [];
      }
    },
    async fetchStockData() {
      // 检查股票代码是否为六位数字
      if (!/^\d{6}$/.test(this.selectedStockCode)) {
        this.chartError = '请输入有效的六位股票代码';
        return;
      }

      this.chartLoading = true;
      this.chartError = null;

      try {
        let url = `http://localhost:3000/api/stocks/${this.selectedStockCode}/history`;
        const params = {
          start: this.chartStartDate || '2025-01-01',
          end: this.chartEndDate || '2025-07-25'
        };

        const response = await axios.get(url, {params});
        let rawData = response.data;

        // 如果返回的数据为空，则显示无历史数据
        if (!rawData || rawData.length === 0) {
          this.chartError = '无历史数据';
          return;
        }

        // 处理数据
        rawData = rawData.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
        this.originStockData = rawData;
        this.renderEcharts();
      } catch (err) {
        this.chartError = '股票历史数据加载失败: ' + (err.response?.data?.message || err.message);
        console.error('获取股票数据失败:', err);
      } finally {
        this.chartLoading = false;
      }
    },
    renderEcharts() {
      if (!this.originStockData || !this.originStockData.length) {
        this.chartError = '无历史数据';
        return;
      }

      const dates = this.originStockData.map(d => d.date);
      const prices = this.originStockData.map(d => d.price);
      let min = Math.min(...prices);
      let max = Math.max(...prices);

      if (min === max) {
        min = min * 0.95;
        max = max * 1.05;
      } else {
        min = min * 0.9;
        max = max * 1.1;
      }

      min = Math.floor(min * 100) / 100;
      max = Math.ceil(max * 100) / 100;

      const option = {
        tooltip: {
          trigger: 'axis',
          position: function (pt) {
            return [pt[0], '10%'];
          }
        },
        title: {
          text: `(${this.selectedStockCode})`,
          left: 'center'
        },
        toolbox: {
          feature: {
            dataZoom: {yAxisIndex: 'none'},
            restore: {},
            saveAsImage: {}
          }
        },
        xAxis: {type: 'category', data: dates, boundaryGap: false},
        yAxis: {type: 'value', min, max, boundaryGap: [0, '100%']},
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            start: 0,
            end: 100
          }
        ],
        series: [
          {
            name: '价格',
            type: 'line',
            symbol: 'none',
            sampling: 'lttb',
            itemStyle: {
              color: 'rgb(255, 70, 131)'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {offset: 0, color: 'rgb(255, 158, 68)'},
                {offset: 1, color: 'rgb(255, 70, 131)'}
              ])
            },
            data: prices
          }
        ]
      };

      this.echartsInstance.setOption(option, true);
    },
    initAllocationChart() {
      const allocationCtx = this.$refs.allocationChart.getContext('2d');
      this.allocationChart = new Chart(allocationCtx, {
        type: 'pie',
        data: this.getAllocationChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: '资产类型分配'
            }
          }
        }
      });
    },
    updateAllocationChart() {
      this.allocationChart.data = this.getAllocationChartData();
      this.allocationChart.update();
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
.suggestion-list {
  position: absolute;
  background: #fff;
  border: 1px solid #ddd;
  z-index: 9;
  left: 0;
  right: 0;
  max-height: 160px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
}

.suggestion-list li {
  padding: 6px 12px;
  cursor: pointer;
}

.suggestion-list li:hover {
  background: #f3f6fa;
}

.portfolio-manager {
  font-family: 'Arial', sans-serif;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

.stock-code-input {
  position: relative;
  display: flex;
  flex-direction: column;
}

.custom-input {
  height: 32px;
  font-size: 15px;
  padding: 0 12px;
  border: 1.5px solid #d9d9d9;
  border-radius: 8px;
  transition: border 0.2s;
  outline: none;
  color: #2c3e50;
}

.custom-input:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.12);
}

.error-text {
  color: #ff0000;
  font-size: 12px;
  margin-top: 4px;
}

.header {
  margin-bottom: 30px;
  text-align: center;
  background: linear-gradient(to right, #2980b9, #6dd5fa);
  padding: 30px 20px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  color: white;
  transition: all 0.3s ease;
}

.header h1 {
  margin-bottom: 25px;
  font-size: 30px;
  font-weight: bold;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.portfolio-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
  justify-content: center;
  align-items: center;
}

.summary-card {
  background: white;
  color: #2c3e50;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
}

.summary-card h3 {
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: 600;
  color: #34495e;
}

.summary-card .value {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.value.positive {
  color: #27ae60;
}

.value.negative {
  color: #e74c3c;
}

.content {
  display: flex;
  flex-direction: row;
  width: 100%;
  box-sizing: border-box;
  gap: 32px;
  padding: 5px 32px 0 32px;
  background: #f5f8fc;
}

.left-panel, .right-panel {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: none;
  box-shadow: none;
  padding: 0;
}

.portfolio-list, .add-investment, .performance-chart, .allocation-chart {
  background: #fff;
  border-radius: 16px;
  padding: 28px 30px 26px 30px;
  box-shadow: 0 4px 24px rgba(41, 57, 77, 0.08), 0 1.5px 7px rgba(52, 152, 219, 0.07);
  margin-bottom: 28px;
  transition: box-shadow 0.18s, transform 0.18s;
  will-change: box-shadow, transform;
}

.portfolio-list:hover,
.add-investment:hover,
.allocation-chart:hover,
.performance-chart:hover {
  box-shadow: 0 8px 28px rgba(41, 57, 77, 0.12), 0 4px 12px rgba(52, 152, 219, 0.12);
  transform: translateY(-2px) scale(1.01);
}

.portfolio-list h2,
.add-investment h2,
.performance-chart h2,
.allocation-chart h2 {
  font-size: 22px;
  font-weight: 700;
  color: #29394d;
  margin-bottom: 20px;
  letter-spacing: 1px;
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

.chart-wrapper {
  position: relative;
  height: 300px;
  margin: 20px 0;
}

.controls-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
  align-items: center;
}

.date-range-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.date-input-group {
  display: flex;
  align-items: center;
  gap: 5px;
}

.date-input-group label {
  white-space: nowrap;
}

.date-input-group input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.refresh-btn {
  padding: 10px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
  text-align: center;
}

.refresh-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.error {
  color: #ff0000;
  background-color: #ffeeee;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
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
    gap: 18px;
    padding: 14px 4px 0 4px;
  }

  .left-panel, .right-panel {
    width: 100%;
    min-width: 0;
    margin-bottom: 0;
    border-radius: 10px;
    padding: 14px 8px;
  }

  .date-range-container {
    flex-direction: column;
    gap: 8px;
  }

  .date-input-group {
    width: 100%;
  }

  .portfolio-list, .add-investment, .performance-chart, .allocation-chart {
    padding: 14px 8px 12px 8px;
    border-radius: 10px;
    margin-bottom: 14px;
  }

  .portfolio-list h2,
  .add-investment h2,
  .performance-chart h2,
  .allocation-chart h2 {
    font-size: 18px;
    margin-bottom: 14px;
  }
}
</style>