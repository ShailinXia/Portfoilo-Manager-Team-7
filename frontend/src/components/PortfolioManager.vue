<template>
  <div class="portfolio-manager relative">
    <!-- 1. 比特币漂浮容器：放在根元素最前面 -->
    <div class="bitcoin-container pointer-events-none absolute inset-0 z-0"></div>
    <div class="header">
      <h1>投资组合管理 Portfolio Management</h1>
      <div class="portfolio-summary">
        <div class="summary-card">
          <h3>当前投资总金额</h3>
          <p class="value">{{ formatCurrency(totalValue) }}</p>
        </div>

        <div class="summary-card">
          <h3>当前持仓总价值</h3>
          <p class="value">{{ formatCurrency(totalValuePlusProfit) }}</p>
        </div>

        <div class="summary-card">
          <h3>总收益</h3>
          <p class="value" :class="{ positive: totalProfit >= 0, negative: totalProfit < 0 }">
            {{ formatCurrency(totalProfit) }}
            ({{ profitPercentage >= 0 ? '+' : '' }}{{ profitPercentage }}%) </p>
        </div>
        <div class="summary-card">
          <h3>持仓数量</h3>
          <p class="value">{{ portfolioItems.length }}</p>
        </div>
        <div class="summary-card">
          <h3>当前涨跌率</h3>
          <p class="value">{{ dailyChangePercentage }}%</p>
        </div>
      </div>
    </div>

    <div class="dashboard-container">
      <!-- 左侧 -->
      <div class="dashboard-col left-col">
        <div class="card portfolio-list-card">
          <h2>我的投资组合</h2>
          <div class="search-bar">
            <input v-model="searchQuery" placeholder="请输入名称或代码..." @keyup.enter="onSearch"/>
            <input
                type="date"
                v-model="searchDate"
                class="date-picker"
                :max="today"
                placeholder="选择日期"
            />
            <button @click="onSearch">搜索</button>
          </div>
          <!-- 投资组合滚动区 -->
          <div class="portfolio-list-scroll"
               @mouseenter="pauseScroll"
               @mouseleave="resumeScroll">
            <ul class="investment-items" :style="scrollStyle">
              <li v-for="item in filteredItems"
                  :key="item.investmentName + '_' + item.investmentCode + '_' + item.investmentType"
                  class="investment-row">
                <div class="item-info">
                  <div class="item-title">{{ item.investmentName }}</div>
                  <div class="item-sub">
                    {{ item.investmentCode }} ·
                    <span :class="['type-label', item.investmentType]">
                      {{ item.investmentType === 'stock' ? '股票' : '基金' }}
                    </span>
                  </div>
                </div>
                <div class="item-amount">
                  {{ formatCurrency(item.investmentAmount) }}
                </div>
                <button class="sell-btn" @click="confirmDelete(item)">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="vertical-align: middle;">
                    <circle cx="9" cy="9" r="9" fill="#2196F3"/>
                    <path d="M9 4 v4 m0 0 l3 3 m-3-3 l-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span style="margin-left: 6px; color:#fff; font-weight:600;">卖出</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div class="card add-investment-card">
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
                <li
                    v-for="item in nameSuggestions"
                    :key="item.code"
                    @click="selectSuggestion(item)">
                  {{ item.name }} ({{ item.code }})
                </li>
              </ul>
            </div>
            <div class="form-group">
              <label for="investment-symbol">代码</label>
              <input
                  type="text"
                  id="investment-symbol"
                  v-model="newInvestment.symbol"
                  readonly
                  required
                  placeholder="请输入投资项目代码..."
              />
            </div>
            <div class="form-group">
              <label>当前{{ newInvestment.type === 'stock' ? '股价' : '净值' }}：</label>
              <input
                  type="text"
                  :value="latestPrice !== null ? latestPrice : '--'"
                  readonly
                  style="background:#f8f8f8;color:#22334d;"
              />
            </div>
            <div class="form-group">
              <label for="investment-amount">买入股数</label>
              <input
                  type="number"
                  id="investment-amount"
                  v-model="newInvestment.amount"
                  min="1"
                  step="1"
                  required
              />
            </div>
            <button type="submit" class="add-btn">添加到组合</button>
          </form>
        </div>
      </div>
      <!-- 右侧 -->
      <div class="dashboard-col right-col">
        <div class="card performance-chart-card">
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <!--            <span style="font-size:22px;font-weight:bold;color:#2c3e50;">股票历史数据</span>-->

            <h2>股票历史数据</h2>
            <div class="stock-code-row">
              <input
                  type="text"
                  v-model="selectedStockCode"
                  @input="validateStockCode"
                  placeholder="输入股票代码(6位)"
                  maxlength="6"
                  class="custom-input"
              />
              <!--              <span v-if="stockCodeError" class="error-text-inline">{{ stockCodeError }}</span>-->
              <div v-if="chartError" class="error">{{ chartError }}</div>

            </div>


          </div>
          <div ref="echartsContainer" class="chart-wrapper" style="height:350px;width:100%"></div>
        </div>
        <div class="card allocation-chart-card">
          <h2>资产分配</h2>
          <div class="chart-container">
            <div ref="allocationRoseChart" style="width:100%;height:380px;"></div>
          </div>
        </div>
      </div>
    </div>


    <!-- 卖出弹窗 -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal sell-modal">
        <h3><i class="icon-warning"></i> 卖出投资</h3>
        <p class="modal-title">
          确定要卖出
          <span class="highlight">{{ itemToDelete?.investmentName }}</span>
          <span class="highlight">({{ itemToDelete?.investmentCode }})</span>
          吗？
        </p>
        <div class="modal-info-list">
          <div><span class="label">可用数量：</span><span class="value">{{ maxSellableAmount }}</span></div>
          <div><span class="label">当前价格：</span><span class="value">{{ latestSellPriceDisplay }}</span></div>
        </div>
        <div class="modal-form">
          <label>卖出数量：</label>
          <input type="number"
                 v-model.number="sellAmount"
                 :max="maxSellableAmount"
                 min="1"
                 :placeholder="'最多' + maxSellableAmount"
                 style="width: 80px;"
                 @input="onSellAmountInput"
          />
          <span v-if="sellAmountError" class="error-tip">{{ sellAmountError }}</span>
        </div>
        <div class="modal-info" v-if="sellAmount > 0">
          卖出总金额：<b style="color: #27ae60">{{ sellTotalDisplay }}</b>
        </div>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="cancel-btn">取消</button>
          <button @click="confirmSell" class="confirm-btn" :disabled="sellAmount < 1 || sellAmount > maxSellableAmount">确认卖出</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios'; // 新增

import * as echarts from 'echarts';

// Chart.register(...registerables);

// 放在你的<script>标签最上面，外面，不要放在methods里
function getCurrentUsername() {
  return localStorage.getItem('currentUsername');
}


export default {
  name: 'PortfolioManager',
  data() {
    return {
      portfolioItems: [],
      dailyChangePercentage: '',   // 今日涨跌率，字符串，默认空

      scrollIndex: 0,
      scrollTimer: null,
      itemHeight: 72, // 每项高度，px（可调整为你的li实际高度）
      autoScrollEnabled: true,

      searchQuery: "",
      searchDate: "",
      today: new Date().toISOString().split('T')[0],
      // searchDate: new Date().toISOString().split('T')[0], // 默认今天// 最大可选今天
      allItems: [],  // 全部投资项目
      filteredItems: [],

      showDeleteModal: false,
      itemToDelete: null,
      sellAmount: 0,
      latestSellPrice: null,
      sellAmountError: '',

      latestPrice: null,
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
      selectedStockName: '平安银行',
      stockSearchInput: '',  // 用户输入
      stockSearchOptions: [],
      // selectedStockCode: '000001',
      // stockCodes: ['000001', '601398', '601939'], // 可自己维护股票代码列表，或通过接口获取
      echartsInstance: null,
      // chartLoading: false,
      // chartError: null,
      // chartStartDate: '',
      // chartEndDate: '',
      originStockData: []
    };
  },
  computed: {

    scrollStyle() {
      // 动画平滑，向上偏移
      return {
        transform: `translateY(-${this.scrollIndex * this.itemHeight}px)`,
        transition: 'transform 0.5s cubic-bezier(.55,0,.1,1)'
      }
    },

    maxSellableAmount() {
      // 防止价格为0出错
      if (!this.latestSellPrice || this.latestSellPrice <= 0) return 0;
      // 只能卖出整数份
      return Math.floor(this.itemToDelete?.investmentAmount / this.latestSellPrice) || 0;
    },
    latestSellPriceDisplay() {
      return this.latestSellPrice === null ? '--' : '¥' + Number(this.latestSellPrice).toFixed(2);
    },
    sellTotalDisplay() {
      if (!this.latestSellPrice || !this.sellAmount) return '--';
      return '¥' + (Number(this.latestSellPrice) * Number(this.sellAmount)).toFixed(2);
    },

    totalValuePlusProfit() {
      // totalValue 是当前市值，totalProfit 是“今日浮动收益”
      // 你想“当前价值 + 今日收益”其实就是 totalValue + totalProfit
      // 实际上 totalValue 已经是包含了浮动的当前市值，理论上不需要再加一次 totalProfit
      // 但如果你就是想这么显示，代码如下
      return this.totalValue + this.totalProfit;
    },


    totalValue() {
      return this.portfolioItems.reduce(
          (sum, item) => sum + Number(item.investmentAmount || 0),
          0
      );
    },
    // 总收益 = 总价值 × 今日涨跌率
    totalProfit() {
      // dailyChangePercentage 是字符串类型，注意转为小数
      const percent = Number(this.dailyChangePercentage);
      // 允许 dailyChangePercentage 为 -1.30 或 0.56 等
      return this.totalValue * (isNaN(percent) ? 0 : percent / 100);
    },
    // 收益百分比 = 总收益 ÷ 总价值
    profitPercentage() {
      if (this.totalValue > 0) {
        return ((this.totalProfit / this.totalValue) * 100).toFixed(2);
      }
      return '0.00';
    },

    // dailyChangePercentage() {
    //   return this.totalValue > 0
    //       ? ((this.dailyChange / this.totalValue) * 100).toFixed(2)
    //       : '0.00';
    // },
    dailyChangeClass() {
      return {
        positive: this.dailyChange >= 0,
        negative: this.dailyChange < 0
      }
    }
  },

  mounted() {

    this.createBitcoinEffect();
    this.filteredItems = [...this.portfolioItems];
    this.initEcharts();
    this.fetchStockData();
    this.fetchStockList();
    this.fetchPortfolioItems();
    this.onSearch();
    this.initAllocationRoseChart();
    this.fetchDailyChangePercentage(); // 新增，初始化涨跌率


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
        this.latestPrice = null;

      }
    },
    // 下面新增对symbol监听
    'newInvestment.symbol': 'updateLatestPrice',
  },

  methods: {

    onSellAmountInput() {
      // 自动修正超限
      if (this.sellAmount > this.maxSellableAmount) {
        this.sellAmount = this.maxSellableAmount;
      }
      if (this.sellAmount < 1) {
        this.sellAmount = 1;
      }
    },


    async confirmSell() {
      if (!this.sellAmount || this.sellAmount <= 0) {
        this.sellAmountError = '请输入有效的卖出数量';
        return;
      }
      if (this.sellAmount > this.itemToDelete.investmentAmount) {
        this.sellAmountError = '卖出数量不能超过可用数量';
        return;
      }
      if (!this.latestSellPrice) {
        this.sellAmountError = '当前价格获取失败';
        return;
      }
      this.sellAmountError = '';

      const remainAmount = this.itemToDelete.investmentAmount - (this.sellAmount * this.latestSellPrice);
      const username = getCurrentUsername();

      // 1. 先删
      let url = `http://localhost:3000/api/userInfo?username=${encodeURIComponent(username)}&investmentCode=${encodeURIComponent(this.itemToDelete.investmentCode)}&investmentType=${encodeURIComponent(this.itemToDelete.investmentType)}`;
      try {
        await fetch(url, {method: 'DELETE'});

        // 2. 剩余有持仓则重新添加
        if (remainAmount > 0) {
          const postBody = {
            username,
            investmentType: this.itemToDelete.investmentType,
            investmentName: this.itemToDelete.investmentName,
            investmentCode: this.itemToDelete.investmentCode,
            investmentAmount: remainAmount,
            investmentDate: this.itemToDelete.investmentDate
          };
          await fetch('http://localhost:3000/api/userInfo/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(postBody)
          });
        }

        alert('卖出成功');
        this.showDeleteModal = false;
        this.itemToDelete = null;
        setTimeout(async () => {
          await this.fetchPortfolioItems();
          this.initAllocationRoseChart();
          await this.fetchDailyChangePercentage();
        }, 200);
      } catch (err) {
        alert('卖出失败：' + err.message);
      }
    },
// 弹窗打开时调用
    async confirmDelete(item) {
      this.itemToDelete = item;
      this.sellAmount = '';
      this.sellAmountError = '';
      this.showDeleteModal = true;
      // 拉取价格（股票/基金分开）
      if (item.investmentType === 'stock') {
        const res = await fetch(`http://localhost:3000/api/stocks/${item.investmentCode}/`);
        const data = await res.json();
        // console.log('接口返回数据：', data);

        this.latestSellPrice = data.latest_price || null;
      } else if (item.investmentType === 'fund') {
        const res = await fetch(`http://localhost:3000/api/funds/${item.investmentCode}/`);
        const data = await res.json();
        this.latestSellPrice = data.latest_net_value || null;
      }
    },


    // 新增：创建比特币漂浮效果
    createBitcoinEffect() {
      const container = this.$el.querySelector('.bitcoin-container');
      if (!container) return;

      const numberOfBitcoins = 50; // 调整数量

      for (let i = 0; i < numberOfBitcoins; i++) {
        // 创建SVG元素
        const bitcoin = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        bitcoin.setAttribute('viewBox', '0 0 1024 1024'); // 使用原SVG的viewBox
        bitcoin.setAttribute('width', '50'); // 调整为需要的显示大小
        bitcoin.setAttribute('height', '50');
        bitcoin.classList.add('bitcoin-icon');

        // 创建路径并设置新的路径数据和样式
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M316.32 649.12c-1.12 4.64-1.76 7.36-8.16 5.76l-72.96-18.24-18.72 75.2 134.56 33.6-27.2 109.28 71.84 17.92 27.2-109.28 44.64 11.2-27.2 109.12 68.32 17.12 27.36-109.28 51.36 12.96c34.24 8.48 164 10.08 192-103.36a140.16 140.16 0 0 0-65.12-161.6s80-24.48 91.2-97.76-39.84-107.36-69.44-126.08a352 352 0 0 0-73.76-32l28.48-114.24-65.76-16-28.16 113.6-52.8-13.12 28.8-114.08-66.56-16-28.48 114.08-139.2-34.72-16.96 67.2 76.32 19.04c7.68 1.92 6.72 5.76 6.08 8.32zM526.88 321.6L608 341.92c13.92 3.52 78.72 32 64 89.44a68 68 0 0 1-71.2 52.8 96 96 0 0 1-19.68-2.08l-89.44-22.4z m-51.36 210.08l126.72 32a69.6 69.6 0 0 1 48 88.96c-11.36 45.76-56.32 55.84-78.56 55.84a38.24 38.24 0 0 1-9.76-0.96l-122.4-30.4z');
        path.setAttribute('fill', 'rgba(247, 147, 26, 0.5)'); // 保持淡橙色
        path.setAttribute('stroke', 'rgba(247, 147, 26, 0.8)'); // 保持描边
        path.setAttribute('stroke-width', '0.5');
        bitcoin.appendChild(path);
        container.appendChild(bitcoin);

        // 随机设置位置和动画参数
        const startX = Math.random() * 100; // 水平起始位置（0%-100%）
        const animationDelay = Math.random() * 15; // 动画延迟（0-15秒）
        const duration = 20 + Math.random() * 20; // 动画持续时间（20-40秒）
        const floatX = (Math.random() - 0.5) * 50; // 水平漂移范围（-25%到25%）
        const floatRotate = (Math.random() - 0.5) * 360; // 旋转范围（-180°到180°）
        const size = 1.5 + Math.random() * 2.5; // 图标大小（1.5em-4em）
        const opacity = 0.4 + Math.random() * 0.6; // 不透明度（0.4-1）

        // 应用样式
        bitcoin.style.left = `${startX}%`;
        bitcoin.style.top = '-10%'; // 从屏幕顶部外开始
        bitcoin.style.animationDelay = `${animationDelay}s`;
        bitcoin.style.animationDuration = `${duration}s`;
        bitcoin.style.setProperty('--float-x', `${floatX}vw`); // 水平漂移变量
        bitcoin.style.setProperty('--float-rotate', `${floatRotate}deg`); // 旋转变量
        bitcoin.style.fontSize = `${size}em`;
        bitcoin.style.opacity = opacity;
        bitcoin.style.color = '#f7931a'; // 比特币橙黄色
      }
    },

    async fetchDailyChangePercentage() {
      let totalAmount = 0;
      let weightedSum = 0;

      // 并发拉取所有投资项目的 change_percent
      const promises = this.portfolioItems.map(async item => {
        let url = '';
        if (item.investmentType === 'stock') {
          url = `http://localhost:3000/api/stocks/${item.investmentCode}/`;
        } else if (item.investmentType === 'fund') {
          url = `http://localhost:3000/api/funds/${item.investmentCode}/`;
        } else {
          return;
        }

        try {
          const res = await fetch(url);
          const data = await res.json();
          // change_percent 可能为字符串
          const percent = Number(data.change_percent);
          const amount = Number(item.investmentAmount);
          if (!isNaN(percent) && !isNaN(amount)) {
            weightedSum += percent * amount;
            totalAmount += amount;
          }
        } catch (e) {
          // 忽略异常
        }
      });

      await Promise.all(promises);

      // 计算加权平均
      if (totalAmount > 0) {
        this.dailyChangePercentage = (weightedSum / totalAmount).toFixed(2);
      } else {
        this.dailyChangePercentage = '0.00';
      }
    },

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
    async onSearch() {
      // 1. 拉取全部数据
      const username = getCurrentUsername(); // 随时取
      // const username = 'Allen'; // 随时取
      console.log('当前用户名:', username);
      const resp = await fetch(`http://localhost:3000/api/userInfo/?username=${username}`);
      let data = await resp.json();
      if (!Array.isArray(data)) data = [data];

      let query = this.searchQuery.trim();
      let date = this.searchDate;

      // ⭐ 根据是否选日期决定合并方式
      let merged;
      if (!date) {
        // 不选日期，全合并
        merged = this.mergePortfolioItems(data, false);
      } else {
        // 选了日期，按日期合并
        // 只要当天的（避免多天数据累加）
        const filtered = data.filter(item => item.investmentDate === date);
        merged = this.mergePortfolioItems(filtered, true);
      }

      // 搜索条件筛选
      this.filteredItems = merged.filter(item => {
        let match = !query ||
            (item.investmentName && item.investmentName.includes(query)) ||
            (item.investmentCode && item.investmentCode.includes(query));
        return match;
      });
    },

    async refreshAndMergePortfolio() {
      // 主动拉取所有数据
      const username = getCurrentUsername(); // 随时取
      // const username = 'Allen'; // 随时取
      console.log('当前用户名:', username);
      const resp = await fetch(`http://localhost:3000/api/userInfo/?username=${username}`);
      let data = await resp.json();
      if (!Array.isArray(data)) data = [data];
      // 合并同名项目
      this.portfolioItems = this.mergePortfolioItems(data);
      // 再次根据当前搜索词过滤
      this.filterPortfolio();
    },
    mergePortfolioItems(items, withDate = false) {
      const map = {};
      items.forEach(item => {
        const key = withDate
            ? `${item.investmentName}_${item.investmentCode}_${item.investmentType}_${item.investmentDate}`
            : `${item.investmentName}_${item.investmentCode}_${item.investmentType}`;
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
      const username = getCurrentUsername(); // 随时取
      // const username = 'Allen'; // 随时取
      console.log('当前用户名:', username);
      const resp = await fetch(`http://localhost:3000/api/userInfo/?username=${username}`);
      let data = await resp.json();
      if (!Array.isArray(data)) data = [data];
      this.portfolioItems = this.mergePortfolioItems(data); // ⭐合并
      this.filterPortfolio();
      // ⚡️ 拉取完组合后自动刷新涨跌率
      await this.fetchDailyChangePercentage();
    },

    formatCurrency(val) {
      return '¥' + Number(val).toFixed(2);
    },

    async fetchStocks() {
      const res = await fetch('http://localhost:3000/api/stocks/all');
      // 保证 allStocks 里的 type 统一为 'stock'
      this.allStocks = (await res.json()).map(item => ({
        ...item,
        type: 'stock'
      }));
      cd
    },
    async fetchFunds() {
      const res = await fetch('http://localhost:3000/api/funds/all');
      // 保证 allFunds 里的 type 统一为 'fund'
      this.allFunds = (await res.json()).map(item => ({
        ...item,
        type: 'fund'
      }));
      console.log("基金列表：", this.allFunds);
    },


    onNameInput(e) {
      const val = e.target.value.trim();
      let list = this.newInvestment.type === 'stock' ? this.allStocks : this.allFunds;
      if (!val) {
        this.nameSuggestions = [];
        return;
      }
      this.nameSuggestions = list.filter(item =>
          (item.name && item.name.includes(val)) ||
          (item.code && item.code.includes(val))
      );
    },
    selectSuggestion(item) {
      this.newInvestment.name = item.name;
      this.newInvestment.symbol = item.code;
      this.nameSuggestions = [];
      this.$refs['investment-name']?.blur?.();
    },

    async fetchLatestPrice(type, symbol) {
      if (!type || !symbol) return null;
      let url, field;
      if (type === 'stock') {
        url = `http://localhost:3000/api/stocks/${symbol}/`;
        field = 'latest_price';
      } else if (type === 'fund') {
        url = `http://localhost:3000/api/funds/${symbol}/`;
        field = 'latest_net_value';
      } else {
        return null;
      }
      try {
        const res = await fetch(url);
        const data = await res.json();
        return Number(data[field]) || null;
      } catch (err) {
        return null;
      }
    },
    async updateLatestPrice() {
      const {type, symbol} = this.newInvestment;
      if (!type || !symbol) {
        this.latestPrice = null;
        return;
      }
      this.latestPrice = await this.fetchLatestPrice(type, symbol);
    },
    async addInvestment() {
      const username = getCurrentUsername(); // 随时取
      console.log('当前用户名:', username);

      const {type, symbol, amount, name, purchaseDate} = this.newInvestment;
      // 校验
      if (!type || !symbol || !amount || !name) {
        alert("请填写完整投资信息");
        return;
      }
      // 检查当前单价
      if (this.latestPrice === null || isNaN(this.latestPrice)) {
        alert("无法获取最新价格或净值，请检查代码");
        return;
      }

      // 计算总金额
      const totalAmount = Number(amount) * Number(this.latestPrice);


      // // 2. 计算实际金额
      // const totalAmount = Number(amount) * latestPrice;


      // const username = 'Allen'; // 随时取
      // console.log('当前用户名:', username);
      // 这里建议参数补全校验
      const postBody = {
        // name: this.newInvestment.name,
        // code: this.newInvestment.symbol,
        // type: this.newInvestment.type,
        // amount: this.newInvestment.amount,
        // purchaseDate: this.newInvestment.purchaseDate
        username: username,                                 // 新增，数据库要求
        investmentType: this.newInvestment.type,
        investmentName: this.newInvestment.name,
        investmentCode: this.newInvestment.symbol,
        // investmentAmount: Number(this.newInvestment.amount),
        investmentAmount: totalAmount,
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
          // 重点：添加成功后拉取最新列表并自动合并
          await this.fetchPortfolioItems();
          this.newInvestment = {
            type: 'stock',
            name: '',
            symbol: '',
            amount: '',
            purchaseDate: new Date().toISOString().split('T')[0]
          };
          this.initAllocationRoseChart(); // ✨异步刷新玫瑰图
          await this.fetchDailyChangePercentage();  // 新增

        } else {
          alert("添加有误：" + (result.message || "请检查数据"));
        }
      } catch (err) {
        alert("添加有误：" + err.message);
      }
    },

    // confirmDelete(item) {
    //   this.itemToDelete = item;
    //   this.showDeleteModal = true;
    // },
    // async deleteInvestment() {
    //
    //   try {
    //     // const username = this.itemToDelete.username || 'Allen'; // 保险起见
    //     const username = getCurrentUsername(); // 随时取
    //     // console.log('当前用户名:', username);
    //     // const username = 'Allen'; // 随时取
    //     console.log('当前用户名:', username);
    //
    //     const code = this.itemToDelete.investmentCode;
    //     const type = this.itemToDelete.investmentType;
    //     const url = `http://localhost:3000/api/userInfo?username=${encodeURIComponent(username)}&investmentCode=${encodeURIComponent(code)}&investmentType=${encodeURIComponent(type)}`;
    //     const resp = await fetch(url, {
    //       method: 'DELETE'
    //     });
    //     const result = await resp.json();
    //     if (result.success || (result.message && result.message.includes('成功'))) {
    //       await this.onSearch(); // 刷新
    //       this.showDeleteModal = false;
    //       this.itemToDelete = null;
    //       this.initAllocationRoseChart(); // ✨异步刷新玫瑰图
    //       await this.fetchDailyChangePercentage();  // 新增
    //
    //     } else {
    //       alert('删除失败：' + (result.message || '未知错误'));
    //     }
    //   } catch (err) {
    //     alert('删除失败：' + err.message);
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
      this.selectedStockName = stock ? stock.name : '';
    },

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
    async fetchStockDetail() {
      if (!/^\d{6}$/.test(this.selectedStockCode)) {
        this.selectedStockName = '';
        return;
      }
      try {
        const res = await axios.get(`http://localhost:3000/api/stocks/${this.selectedStockCode}/`);
        if (res.data && res.data.name) {
          this.selectedStockName = res.data.name;
        } else {
          this.selectedStockName = '';
        }
      } catch (e) {
        this.selectedStockName = '';
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
          this.originStockData = [];
          this.selectedStockName = '';
          return;
        }
        // 获取当前股票的名称
        await this.fetchStockDetail();

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
      // console.log([...new Set(dates)].length, dates.length); // 看看是否有重复或缺失
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
          {type: 'inside', start: 0, end: 100},
          {start: 80, end: 100}
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

      this.$nextTick(() => {
        this.echartsInstance.setOption(option, true);
        this.echartsInstance.resize();
      });


    },

    // ECharts 玫瑰图
    initAllocationRoseChart() {
      if (this.roseChartInstance) {
        this.roseChartInstance.dispose();
      }
      this.roseChartInstance = echarts.init(this.$refs.allocationRoseChart);
      const username = getCurrentUsername(); // 随时取
      // const username = 'Allen'; // 随时取
      // console.log('当前用户名:', username);
      // 拉取数据
      fetch(`http://localhost:3000/api/userInfo?username=${username}`)
          .then(res => res.json())
          .then(data => {
            // 按类型和名称合并金额
            const typeMap = {};
            data.forEach(item => {
              const key = `${item.investmentType}:${item.investmentName}`;
              if (!typeMap[key]) {
                typeMap[key] = 0;
              }
              typeMap[key] += Number(item.investmentAmount);
            });
            // 转成 ECharts 数据格式
            const roseData = Object.keys(typeMap).map(key => ({
              value: typeMap[key],
              name: key.split(':')[1] // 只展示名称，也可以拼类型
            }));
            this.renderAllocationRoseChart(roseData);
          });
    },
    renderAllocationRoseChart(roseData) {
      const option = {
        title: {
          // text: '资产分配玫瑰图',
          left: 'center',
          top: 20,
          textStyle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#2c3e50'
          }
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: '#fff',
          borderColor: '#cfd8dc',
          borderWidth: 1,
          textStyle: {
            color: '#222',
            fontSize: 15
          },
          padding: 12,

          formatter: '{b}: {c} ({d}%)'
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {show: true}
          }
        },
        legend: {
          show: true,
          type: 'scroll',        // 支持滚动

          top: 'bottom',
          itemWidth: 18,
          itemHeight: 10,
          textStyle: {
            fontSize: 15,
            color: '#555'
          }
        },
        series: [
          {
            name: '资产分配',
            type: 'pie',
            radius: [30, 110],
            center: ['50%', '50%'],
            roseType: 'radius',
            itemStyle: {
              borderRadius: 9,
              borderColor: '#fff',
              borderWidth: 3,
              shadowColor: 'rgba(32, 80, 190, 0.11)',
              shadowBlur: 16,
              shadowOffsetY: 3
            },
            label: {
              fontSize: 16,
              color: '#222',
              overflow: 'truncate',  // 防止超长
            },
            minAngle: 5,             // 防止过小的区块挤在一起
            avoidLabelOverlap: true, // 自动优化重叠
            labelLine: {
              length: 24,
              length2: 16,
              smooth: true
            },
            data: roseData
          }
        ]
      };
      this.roseChartInstance.setOption(option);
    },


  }
};
</script>

<style>
/* 比特币动画样式放在非scoped的style中 */
.bitcoin-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.bitcoin-icon {
  position: absolute;
  font-size: 2em;
  color: rgba(247, 147, 26, 0.5); /* 稍微提高透明度，更明显 */
  animation: float 10s ease-in-out infinite;
  opacity: 0;
}

@keyframes float {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  20% {
    opacity: 0.8; /* 提高显示时的透明度 */
  }
  80% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(100vh) translateX(var(--float-x)) rotate(var(--float-rotate));
    opacity: 0;
  }
}
</style>

<style scoped>

.modal.sell-modal {
  min-width: 350px;
  border-radius: 12px;
  box-shadow: 0 4px 32px 0 rgba(0,0,0,0.14);
  background: #fff;
  padding: 32px 30px 24px 30px;
}
.modal-title {
  font-size: 18px;
  margin: 0 0 16px 0;
  color: #222;
}
.modal-info-list {
  display: flex;
  gap: 24px;
  margin-bottom: 18px;
}
.modal-info-list .label {
  color: #999;
}
.modal-info-list .value {
  font-weight: 500;
  color: #555;
}
.modal-form {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.modal-form label {
  color: #555;
  font-size: 16px;
}
input[type="number"] {
  border: 1px solid #d0d7e3;
  border-radius: 5px;
  padding: 5px 8px;
  font-size: 15px;
  outline: none;
  transition: border-color .2s;
}
input[type="number"]:focus {
  border-color: #6c63ff;
}
.error-tip {
  color: #e74c3c;
  margin-left: 8px;
  font-size: 13px;
}
.highlight {
  color: #e74c3c;
  font-weight: bold;
  font-size: 17px;
}
.modal-actions {
  margin-top: 20px;
  display: flex;
  gap: 20px;
  justify-content: center;
}
.cancel-btn, .confirm-btn {
  border: none;
  border-radius: 4px;
  padding: 8px 20px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}
.cancel-btn {
  background: #f2f3f5;
  color: #666;
}
.confirm-btn {
  background: #e74c3c;
  color: #fff;
}
.confirm-btn:disabled {
  background: #eee;
  color: #bbb;
  cursor: not-allowed;
}
.icon-warning {
  color: #e67e22;
  font-size: 20px;
  vertical-align: middle;
  margin-right: 6px;
}


.stock-code-row {
  display: flex;
  align-items: center;
  gap: 5px;
  position: relative;
  margin-bottom: 5px;
}

.custom-input {
  height: 30px;
  padding: 0 16px;
  border: 1.5px solid #bcdfff;
  border-radius: 8px;
  font-size: 16px;
  background: #f7fafd;
  color: #2c3e50;
  width: 180px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.custom-input:focus {
  border-color: #3aa6ff;
  background: #e6f7ff;
  box-shadow: 0 0 4px 0 #7cc8ff;
}

.error-text-inline {
  color: #e54545;
  font-size: 15px;
  background: #ffeaea;
  border-radius: 6px;
  padding: 4px 12px;
  font-weight: 500;
  margin-left: 3px;
  min-width: 120px;
  white-space: nowrap;
  letter-spacing: 0.5px;
  position: relative;
  top: 0;
  /* 不再使用 block 显示 */
  display: inline-flex;
  align-items: center;
  height: 38px;
}


.highlight {
  color: red; /* 高亮色，也可以用 #ff9800 #2196f3 等 */
  font-weight: bold;
  font-size: 17px;
  padding: 0 2px;
}

.portfolio-dashboard-root {
  background: #f5f8fc;
  min-height: 100vh;
  padding: 0;
}

.dashboard-container {
  display: flex;
  gap: 32px;
  width: 100%;
  min-height: 1200px; /* 固定高度，可根据需求调整 */
  box-sizing: border-box;
  padding: 35px 32px 0 32px;
}

.dashboard-col {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
  height: 100%;
  min-width: 0;
}

/* 统一所有card高度，撑满父div */
.card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(41, 57, 77, 0.08), 0 1.5px 7px rgba(52, 152, 219, 0.07);
  padding: 24px 30px 24px 30px;
  min-height: 0;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.22s, transform 0.18s;
  position: relative;
}

/* 卡片悬浮特效 */
.card:hover {
  box-shadow: 0 12px 36px 0 rgba(32, 80, 190, 0.14), 0 8px 24px 0 rgba(52, 152, 219, 0.14);
  transform: translateY(-2px) scale(1.013);
  z-index: 2;
}

/* 卡片底部光晕装饰 */
.card::after {
  content: "";
  display: block;
  position: absolute;
  left: 50%;
  bottom: -15px;
  width: 72%;
  height: 15px;
  background: radial-gradient(ellipse at center, #7ec8ff2b 0%, transparent 90%);
  transform: translateX(-50%);
  pointer-events: none;
  opacity: 0.8;
  z-index: 1;
}

.portfolio-list-card, .add-investment-card, .performance-chart-card, .allocation-chart-card {
  min-height: 500px;
  max-height: 600px;
  height: 600px;
}

.portfolio-list-scroll {
  flex: 1 1 0;
  overflow-y: auto;
  min-height: 0;
  margin-top: 8px;
  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: #90caf9 #f3f8ff;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
}

.portfolio-list-scroll::-webkit-scrollbar {
  width: 8px;
  background: #f3f8ff;
  border-radius: 6px;
}

.portfolio-list-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #9ad8ff 0%, #63a4ff 90%);
  border-radius: 6px;
  min-height: 24px;
}

.portfolio-list-scroll::-webkit-scrollbar-thumb:hover {
  background: #2196f3;
}

/* 添加投资按钮高光 */
.add-btn {
  background: linear-gradient(90deg, #27d5e3 0%, #2ecc71 100%);
  color: #fff;
  border: none;
  padding: 12px 0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  width: 100%;
  margin-top: 18px;
  font-weight: 700;
  box-shadow: 0 3px 14px #2ecc7140;
  transition: background 0.18s, box-shadow 0.16s, transform 0.14s;
}

.add-btn:hover {
  background: linear-gradient(90deg, #15b6c7 0%, #1ea75a 100%);
  box-shadow: 0 6px 24px #27d5e333;
  transform: translateY(-1px) scale(1.03);
}

/* 下拉列表悬浮 */
.suggestion-list li {
  transition: background 0.18s, color 0.15s;
}

.suggestion-list li:hover {
  background: #e4f3ff;
  color: #2196f3;
}

/* 右侧图表自适应高度 */
.allocation-chart-card .chart-container,
.performance-chart-card .chart-wrapper {
  flex: 1 1 0;
  min-height: 0;
  height: 100%;
}

/* ...你的其它样式保持原有即可... */

.sell-btn {
  background: linear-gradient(90deg, #2196f3, #1769aa);
  border: none;
  color: #fff;
  border-radius: 24px;
  padding: 7px 16px 7px 10px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background .2s;
  box-shadow: 0 1px 6px rgba(33, 150, 243, 0.09);
}

.sell-btn:hover {
  background: linear-gradient(90deg, #1976d2, #0d47a1);
}


.date-picker {
  width: 120px;
  min-width: 0;
  padding: 5px 8px;
  font-size: 15px;
  border-radius: 8px;
  border: 1px solid #e0e7ef;
  background: #f7faff;
  outline: none;
  margin-left: 12px;
  margin-right: 12px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.date-picker:focus {
  border-color: #6ea8fe;
  background: #fff;
}


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
  background: #7dace4 100%;
  padding: 30px 20px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  color: #2c3e50;
  transition: all 0.3s ease;
}

.header h1 {
  margin-bottom: 25px;
  font-size: 30px;
  font-weight: bold;
  color: #222;
  text-shadow: 0 2px 8px rgba(77, 124, 255, 0.10);
  letter-spacing: 1px;
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
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.08);
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
  box-shadow: 0 2px 8px rgba(100, 140, 255, 0.10);
  transition: background 0.2s, box-shadow 0.2s;
}

.search-bar button:hover {
  background: linear-gradient(90deg, #36bb7e 0%, #3b67ea 100%);
  box-shadow: 0 4px 16px rgba(100, 140, 255, 0.18);
}

.investment-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.investment-row {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 16px;
  box-shadow: 0 2px 12px #e4e7ed33;
  padding: 20px 28px;
  margin-bottom: 18px;
}

/*.investment-row:hover {*/
/*  box-shadow: 0 8px 28px rgba(41, 57, 77, 0.11), 0 2px 8px #42d39233;*/
/*  transform: translateY(-2px) scale(1.01);*/
/*}*/

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


.item-info {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.item-info h3 {
  margin: 0 0 5px;
  font-size: 16px;
}

.item-sub {
  font-size: 15px;
  color: #8a98b6;
  font-family: 'Arial', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

.type-label {
  margin-left: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #24b29f;
  background: #e2f8f5;
  padding: 1px 10px;
  border-radius: 7px;
}

.item-title {
  font-weight: bold;
  font-size: 16px;
  color: #22334d;
  margin-bottom: 4px;
  font-family: 'Arial Black', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

.type-label.stock {
  color: #409eff;
  background: #e8f3ff;
}

.type-label.fund {
  color: #ff8800;
  background: #fff6e1;
}

.item-amount {
  flex: 0 0 110px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #22334d;
  letter-spacing: 1px;
}

.delete-btn.modern-delete {
  margin-left: 24px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  transition: transform 0.15s;
}

.delete-btn.modern-delete:hover {
  transform: scale(1.18);
  filter: brightness(1.14);
}

.name {
  font-weight: 600;
  font-size: 17px;
  color: #22334d;
}

.code {
  font-size: 14px;
  color: #7689a7;
  margin-left: 6px;
}

.type-tag {
  font-size: 13px;
  background: #e0f7fa;
  color: #00796b;
  padding: 2px 10px;
  border-radius: 8px;
  margin-left: 10px;
  font-weight: 500;
}

.item-amount {
  font-size: 18px;
  font-weight: bold;
  color: #273c75;
  flex: 1 1 120px;
  text-align: center;
}

.delete-btn.modern-delete {
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  margin-left: 10px;
  padding: 0;
  display: flex;
  align-items: center;
  transition: transform 0.1s;
}

.delete-btn.modern-delete:hover {
  transform: scale(1.16);
  filter: brightness(1.15);
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
  margin-bottom: 12px;
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

/*.add-investment {*/
/*  background: #fff;*/
/*  border-radius: 16px;*/
/*  padding: 28px 30px 26px 30px;*/
/*  box-shadow: 0 4px 24px rgba(41, 57, 77, 0.08), 0 1.5px 7px rgba(52, 152, 219, 0.07);*/
/*  margin-bottom: 28px;*/
/*  transition: box-shadow 0.18s, transform 0.18s;*/
/*  width: 100%;*/
/*  min-width: 240px; !* 最小宽度，防止太窄 *!*/
/*  max-width: 520px; !* 最大宽度，防止太宽 *!*/
/*  margin-left: auto;*/
/*  margin-right: auto;*/
/*  box-sizing: border-box;*/
/*}*/

.add-investment form {
  width: 100%;
}

.form-group input,
.form-group select {
  width: 100%;
  min-width: 0; /* 允许收缩 */
  box-sizing: border-box;
  font-size: 16px;
}

</style>