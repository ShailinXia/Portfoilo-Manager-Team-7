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
            <input v-model="searchQuery" placeholder="搜索投资项目..." @keyup.enter="onSearch"/>
            <button @click="onSearch">搜索</button>
          </div>
          <ul class="investment-items">
            <li v-for="item in filteredItems" :key="item.investmentName + '_' + item.investmentCode + '_' + item.investmentType">
              <div class="item-info">
                <h3>{{ item.investmentName }}</h3>
                <p>{{ item.investmentCode }} · {{ item.investmentType }}</p>
              </div>
              <div class="item-value">
                <p>{{ formatCurrency(item.investmentAmount) }}</p>
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
<!--                <option v-for="t in investmentTypes" :value="t.value">{{ t.label }}</option>-->
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
                <li v-for="item in nameSuggestions" :key="item.code" @mousedown.prevent="selectSuggestion(item)">
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
            <!-- 其它表单同原来 -->
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
        <!--        <div class="card performance-chart">-->
        <!--          <h2>股票历史数据 (代码: 000001)</h2>-->
        <!--          <div v-if="chartError" class="error">{{ chartError }}</div>-->
        <!--          <div class="chart-wrapper">-->
        <!--            <canvas ref="stockChartCanvas"></canvas>-->
        <!--          </div>-->
        <!--          <div class="controls-container">-->
        <!--            <button @click="fetchStockData" :disabled="chartLoading" class="refresh-btn">-->
        <!--              {{ chartLoading ? '加载中...' : '刷新数据' }}-->
        <!--            </button>-->
        <!--            <div class="date-range-container">-->
        <!--              <div class="date-input-group">-->
        <!--                <label>开始日期: </label>-->
        <!--                <input type="date" v-model="chartStartDate" :disabled="chartLoading"/>-->
        <!--              </div>-->
        <!--              <div class="date-input-group">-->
        <!--                <label>结束日期: </label>-->
        <!--                <input type="date" v-model="chartEndDate" :disabled="chartLoading"/>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </div>-->
        <div class="card performance-chart">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:22px;font-weight:bold;color:#2c3e50;">股票历史数据</span>

            <select
                v-model="selectedStockCode"
                @change="fetchStockData"
                class="custom-select"
            >
              <option v-for="code in stockCodes" :value="code" :key="code">{{ code }}</option>
            </select>
          </div>
          <div v-if="chartError" class="error">{{ chartError }}</div>
          <div ref="echartsContainer" class="chart-wrapper" style="height:350px;width:100%"></div>
          <div class="controls-container">
            <button @click="fetchStockData" :disabled="chartLoading" class="refresh-btn">
              {{ chartLoading ? '加载中...' : '刷新数据' }}
            </button>
            <!--            <div class="date-range-container">-->
            <!--              <div class="date-input-group">-->
            <!--                <label>开始日期: </label>-->
            <!--                <input type="date" v-model="chartStartDate" :disabled="chartLoading"/>-->
            <!--              </div>-->
            <!--              <div class="date-input-group">-->
            <!--                <label>结束日期: </label>-->
            <!--                <input type="date" v-model="chartEndDate" :disabled="chartLoading"/>-->
            <!--              </div>-->
            <!--            </div>-->
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
        <p>确定要从投资组合中删除 {{ itemToDelete.investmentName }} ({{ itemToDelete.investmentCode }}) 吗？</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="cancel-btn">取消</button>
          <button @click="deleteInvestment" class="confirm-btn">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'; // 新增
import { Chart, registerables } from 'chart.js';
import * as echarts from 'echarts'; // 新增

Chart.register(...registerables);

export default {
  name: 'PortfolioManager',
  data() {
    return {
      portfolioItems: [],


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
      chartInstance: null,
      chartHistory: [],
      chartStartDate: '',
      chartEndDate: '',
      chartLoading: false,
      chartError: null,

      stocksList: [],
      selectedStockCode: '000001',
      selectedStockName: '',
      stockSearchInput: '',  // 用户输入
      stockSearchOptions: [],
      // selectedStockCode: '000001',
      stockCodes: ['000001', '601398', '601939'], // 可自己维护股票代码列表，或通过接口获取
      echartsInstance: null,
      // chartLoading: false,
      // chartError: null,
      // chartStartDate: '',
      // chartEndDate: '',
      originStockData: []
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
    this.initAllocationChart();
    this.initEcharts();
    this.fetchStockData();
    this.fetchStockList();
    this.fetchPortfolioItems();


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
        // 清空输入
        this.newInvestment.name = '';
        this.newInvestment.symbol = '';
        this.nameSuggestions = [];
      }
    }
  },

  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    },
    async onSearch() {
      // 主动请求Allen的所有数据
      const resp = await fetch('http://localhost:3000/api/userInfo/?username=Allen');
      let data = await resp.json();
      // 保证为数组
      if (!Array.isArray(data)) data = [data];
      // 合并同名项目
      const merged = this.mergePortfolioItems(data);
      this.portfolioItems = merged;
      this.filterPortfolio();
    },
    mergePortfolioItems(items) {
      // 如上函数体
      const map = {};
      items.forEach(item => {
        const key = `${item.investmentName}_${item.investmentCode}_${item.investmentType}`;
        if (map[key]) {
          map[key].investmentAmount += Number(item.investmentAmount);
        } else {
          map[key] = {
            ...item,
            investmentAmount: Number(item.investmentAmount)
          };
        }
      });
      return Object.values(map);
    },
    filterPortfolio() {
      if (!this.searchQuery) {
        this.filteredItems = [...this.portfolioItems];
        return;
      }
      const query = this.searchQuery.toLowerCase();
      this.filteredItems = this.portfolioItems.filter(item =>
          item.investmentName.toLowerCase().includes(query) ||
          (item.investmentCode && item.investmentCode.toLowerCase().includes(query)) ||
          item.investmentType.toLowerCase().includes(query)
      );
    },

    async fetchPortfolioItems() {
      const resp = await fetch('http://localhost:3000/api/userInfo/?username=Allen');
      const data = await resp.json();
      if (Array.isArray(data)) {
        // 返回的是数组
        this.portfolioItems = data;
      } else if (data && typeof data === 'object') {
        // 返回的是单个对象
        this.portfolioItems = [data];
      } else {
        // 其他情况，设为空
        this.portfolioItems = [];
      }

      // 刷新搜索结果
      this.filterPortfolio();
    },
    formatCurrency(val) { return '¥' + Number(val).toFixed(2); },

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
      // 中文名/拼音/简拼/代码都可模糊
      this.nameSuggestions = list.filter(item =>
          item.name.includes(val) ||
          (item.code && item.code.includes(val))
      ).slice(0, 10); // 最多展示10条
    },
    // 用户选中建议后填充
    selectSuggestion(item) {
      this.newInvestment.name = item.name;
      this.newInvestment.symbol = item.code;
      this.nameSuggestions = [];
    },
    async addInvestment() {
      // 这里建议参数补全校验
      const postBody = {
        // name: this.newInvestment.name,
        // code: this.newInvestment.symbol,
        // type: this.newInvestment.type,
        // amount: this.newInvestment.amount,
        // purchaseDate: this.newInvestment.purchaseDate
        username: "Allen",                                 // 新增，数据库要求
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
        // 这里根据后端实际返回格式调整，通常是 {success: true/false, ...}
        const result = await resp.json();
        console.log('API result:', result);
        if (result.success) {
          alert("添加投资项目成功！");
          // 清空表单（如有需要）
          // 重点：添加成功后拉取最新列表并刷新搜索
          await this.fetchPortfolioItems();
          this.filterPortfolio();
          this.newInvestment = {
            type: 'stock',
            name: '',
            symbol: '',
            amount: '',
            purchaseDate: new Date().toISOString().split('T')[0]
          };
          // 可以刷新投资组合列表
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
    async deleteInvestment() {
      try {
        const username = this.itemToDelete.username || 'Allen'; // 保险起见
        const code = this.itemToDelete.investmentCode;
        const url = `http://localhost:3000/api/userInfo?username=${encodeURIComponent(username)}&investmentCode=${encodeURIComponent(code)}`;
        const resp = await fetch(url, {
          method: 'DELETE'
        });
        const result = await resp.json();
        if (result.success || (result.message && result.message.includes('成功'))) {
          await this.onSearch(); // 刷新
          this.showDeleteModal = false;
          this.itemToDelete = null;
        } else {
          alert('删除失败：' + (result.message || '未知错误'));
        }
      } catch (err) {
        alert('删除失败：' + err.message);
      }
    },






    // // 股票图表相关方法
    // processStockData(data) {
    //   if (!data || data.length === 0) return [];
    //
    //   const grouped = {};
    //
    //   data.forEach(item => {
    //     if (!grouped[item.date]) {
    //       grouped[item.date] = {
    //         prices: [],
    //         date: item.date
    //       };
    //     }
    //     grouped[item.date].prices.push(item.price);
    //   });
    //
    //   return Object.values(grouped).map(day => ({
    //     date: day.date,
    //     avgPrice: day.prices.reduce((sum, price) => sum + price, 0) / day.prices.length,
    //     minPrice: Math.min(...day.prices),
    //     maxPrice: Math.max(...day.prices)
    //   }));
    // },
    // destroyChart() {
    //   if (this.chartInstance) {
    //     this.chartInstance.destroy();
    //     this.chartInstance = null;
    //   }
    // },
    // async fetchStockData() {
    //   try {
    //     this.chartLoading = true;
    //     this.chartError = null;
    //
    //     const response = await fetch(
    //         `http://localhost:3000/api/stocks/000001/history?start=${this.chartStartDate}&end=${this.chartEndDate}`
    //     );
    //
    //     if (!response.ok) {
    //       throw new Error(`获取数据失败: ${response.status}`);
    //     }
    //
    //     const data = await response.json();
    //
    //     this.destroyChart();
    //     this.chartHistory = this.processStockData(data);
    //
    //     if (!this.$refs.stockChartCanvas || this.chartHistory.length === 0) return;
    //
    //     const ctx = this.$refs.stockChartCanvas.getContext('2d');
    //     if (!ctx) return;
    //
    //     this.chartInstance = new Chart(ctx, {
    //       type: 'line',
    //       data: {
    //         labels: this.chartHistory.map(item => item.date),
    //         datasets: [
    //           {
    //             label: '平均价格',
    //             data: this.chartHistory.map(item => item.avgPrice),
    //             borderColor: 'rgb(75, 192, 192)',
    //             backgroundColor: 'rgba(75, 192, 192, 0.2)',
    //             tension: 0.1,
    //             fill: true
    //           },
    //           {
    //             label: '最低价格',
    //             data: this.chartHistory.map(item => item.minPrice),
    //             borderColor: 'rgb(255, 99, 132)',
    //             backgroundColor: 'rgba(255, 99, 132, 0.2)',
    //             borderDash: [5, 5],
    //             tension: 0.1
    //           },
    //           {
    //             label: '最高价格',
    //             data: this.chartHistory.map(item => item.maxPrice),
    //             borderColor: 'rgb(54, 162, 235)',
    //             backgroundColor: 'rgba(54, 162, 235, 0.2)',
    //             borderDash: [5, 5],
    //             tension: 0.1
    //           }
    //         ]
    //       },
    //       options: {
    //         responsive: true,
    //         maintainAspectRatio: false,
    //         plugins: {
    //           title: {
    //             display: true,
    //             text: '股票价格走势'
    //           },
    //           tooltip: {
    //             mode: 'index',
    //             intersect: false
    //           }
    //         },
    //         scales: {
    //           y: {
    //             beginAtZero: false,
    //             title: {
    //               display: true,
    //               text: '价格 (元)'
    //             }
    //           },
    //           x: {
    //             title: {
    //               display: true,
    //               text: '日期'
    //             }
    //           }
    //         },
    //         interaction: {
    //           mode: 'nearest',
    //           axis: 'x',
    //           intersect: false
    //         }
    //       }
    //     });
    //   } catch (err) {
    //     this.chartError = '获取数据失败: ' + err.message;
    //     console.error('获取数据时出错:', err);
    //   } finally {
    //     this.chartLoading = false;
    //   }
    // },
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
    calculateMA(dayCount, prices) {
      const result = [];
      for (let i = 0; i < prices.length; i++) {
        if (i < dayCount - 1) {
          result.push('-');
          continue;
        }
        let sum = 0;
        for (let j = 0; j < dayCount; j++) {
          sum += prices[i - j];
        }
        result.push(sum / dayCount);
      }
      return result;
    },
    async fetchStockList() {
      try {
        const res = await axios.get('http://localhost:3000/api/stocks');
        this.stocksList = res.data;
      } catch (err) {
        this.stocksList = [];
        // 错误处理
      }
    },
    updateSelectedStockName() {
      // 用 code 找到 name
      const stock = this.stocksList.find(s => s.code === this.selectedStockCode);
      console.log(stock)
      this.selectedStockName = stock ? stock.name : '';

    },
    // onSelectStock(code) {
    //   this.selectedStockCode = code;
    //   this.updateSelectedStockName();
    //   // ...拉历史数据
    //   this.fetchStockData();
    // },
    // 实时匹配输入的代码
    onStockSearchInput() {
      const keyword = this.stockSearchInput.trim();
      if (!keyword) {
        this.stockSearchOptions = [];
        return;
      }
      // 支持模糊匹配代码或名称
      this.stockSearchOptions = this.stocksList.filter(s =>
          s.code.includes(keyword) || (s.name && s.name.includes(keyword))
      );
    },
    // 选择候选
    onSelectStock(item) {
      this.selectedStockCode = item.code;
      this.selectedStockName = item.name;
      this.stockSearchInput = `${item.name} (${item.code})`;
      this.stockSearchOptions = [];
      this.fetchStockData(); // 拉取历史数据
    },
    async fetchStockData() {
      this.chartLoading = true;
      this.chartError = null;
      if (!this.selectedStockCode) {
        this.chartError = '请先选择股票代码';
        this.chartLoading = false;
        return;
      }
      console.log('fetchStockData selectedStockCode:', this.selectedStockCode);

      try {
        // 日期参数可选
        let url = `http://localhost:3000/api/stocks/${this.selectedStockCode}/history`;
        // let url = `http://localhost:8080/api/stocks/000001/history`;
        const params = {};
        if (this.chartStartDate) params.start = this.chartStartDate;
        if (this.chartEndDate) params.end = this.chartEndDate;
        const response = await axios.get(url, {params});
        let rawData = response.data;
        // 升序排序
        rawData = rawData.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
        this.originStockData = rawData;
        this.renderEcharts();
        this.stockData = response.data; // 更新数据
      } catch (err) {
        this.chartError = '股票历史数据加载失败';
      } finally {
        this.chartLoading = false;
      }
    },
    renderEcharts() {
      if (!this.originStockData || !this.originStockData.length) {
        this.chartError = '无历史数据';
        return;
      }
      // x轴日期，y轴收盘价
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
          text: this.selectedStockName
              ? `${this.selectedStockName} (${this.selectedStockCode})`
              : `(${this.selectedStockCode})`,
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

    // 资产分配图表相关方法
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
    updateCharts() {
      this.performanceChart.data = this.getPerformanceChartData();
      this.performanceChart.update();
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
  /*max-width: 1200px;*/
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

/* 可以放在你的全局样式文件或组件内style标签里 */
.custom-select {
  height: 32px;
  font-size: 15px;
  padding: 0 28px 0 12px;
  border: 1.5px solid #d9d9d9;
  border-radius: 8px;
  background: #f8fafc url("data:image/svg+xml,%3Csvg width='14' height='8' viewBox='0 0 14 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L7 7L13 1' stroke='%23333' stroke-width='1.5'/%3E%3C/svg%3E%0A") no-repeat right 12px center/16px 10px;
  transition: border 0.2s;
  outline: none;
  color: #2c3e50;
  appearance: none;
  -webkit-appearance: none;
}

.custom-select:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.12);
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
  /*height: 100vh;*/
  box-sizing: border-box;
  gap: 32px;
  padding: 5px 32px 0 32px;
  background: #f5f8fc;
}

/*.card {*/
/*  background: #fff;*/
/*  border-radius: 18px;*/
/*  box-shadow: 0 2px 12px #e2eafc44;*/
/*  padding: 24px 28px 28px 28px;*/
/*  margin-bottom: 0;*/
/*  display: flex;*/
/*  flex-direction: column;*/
/*  min-width: 0;*/
/*}*/

.left-panel, .right-panel {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px; /* 内部卡片间距，推荐加上 */
  background: none; /* 父 panel 透明 */
  box-shadow: none;
  padding: 0;
}


.portfolio-list, .add-investment, .performance-chart, .allocation-chart {
  background: #fff;
  border-radius: 16px; /* 圆角加大，显得更有质感 */
  padding: 28px 30px 26px 30px; /* 加大内边距，信息更舒展 */
  box-shadow: 0 4px 24px rgba(41, 57, 77, 0.08), 0 1.5px 7px rgba(52, 152, 219, 0.07);
  margin-bottom: 28px;
  transition: box-shadow 0.18s, transform 0.18s;
  /* 卡片悬浮效果，可选： */
  will-change: box-shadow, transform;
}

.portfolio-list:hover,
.add-investment:hover,
.allocation-chart:hover,
.performance-chart:hover {
  box-shadow: 0 8px 28px rgba(41, 57, 77, 0.12), 0 4px 12px rgba(52, 152, 219, 0.12);
  transform: translateY(-2px) scale(1.01);
}

/*.allocation-chart {*/
/*  background: white;*/
/*  border-radius: 8px;*/
/*  padding: 20px;*/
/*  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);*/
/*  height: 350px;*/
/*  margin-bottom: 20px;*/
/*}*/
/* 卡片内标题统一美化 */
.portfolio-list h2,
.add-investment h2,
.performance-chart h2 {
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
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 14px 0 18px 0;
}

.search-bar input {
  flex: 1;
  height: 38px;
  padding: 0 14px;
  border: 1.5px solid #d7dde8;
  border-radius: 8px;
  font-size: 15px;
  background: #f9fafc;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-bar input:focus {
  border-color: #409eff;
  background: #fff;
  box-shadow: 0 2px 8px rgba(64,158,255,0.08);
  outline: none;
}
.search-bar button {
  height: 38px;
  padding: 0 28px;
  background: linear-gradient(90deg, #42d392 0%, #647eff 100%);
  border: none;
  color: #fff;
  font-size: 15px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(100,140,255,0.10);
  transition: background 0.2s, box-shadow 0.2s;
}
.search-bar button:hover {
  background: linear-gradient(90deg, #36bb7e 0%, #3b67ea 100%);
  box-shadow: 0 4px 16px rgba(100,140,255,0.18);
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

/* 股票图表样式 */
.chart-wrapper {
  position: relative;
  height: 300px;
  margin: 20px 0;
}

/* 修复控制区域布局 */
.controls-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
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

.date-range-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
}

.date-input-group {
  flex: 1;
  min-width: 150px;
}

.date-input-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #555;
}

.date-input-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.error {
  color: #ff0000;
  background-color: #ffeeee;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

/* 资产分配图表样式 */
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

  /* 在小屏幕上优化日期范围布局 */
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
  .performance-chart, .allocation-chart, h2 {
    font-size: 18px;
    margin-bottom: 14px;
  }
}
</style>