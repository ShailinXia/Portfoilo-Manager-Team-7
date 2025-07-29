<template>
  <div class="stock-list">
    <h1>中国A股大盘股数据</h1>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="搜索股票名称或代码..." @input="filterStocks" />
    </div>

    <div class="stock-grid">
      <div v-for="stock in pagedStocks" :key="stock.code" class="stock-card">
        <div class="stock-header">
          <h3>{{ stock.name }}</h3>
          <span class="stock-code">{{ stock.code }}</span>
        </div>

        <div class="stock-price" v-if="stock.change_percent != null">
          <span class="price">¥{{ stock.latest_price.toFixed(2) }}</span>
          <span class="change" :class="{ 'up': stock.change_percent >= 0, 'down': stock.change_percent < 0 }">
            {{ stock.change_percent >= 0 ? '+' : '' }}{{ stock.change_percent.toFixed(2) }}%
          </span>
        </div>

        <div class="stock-details">
          <div class="detail">
            <span class="label">市值:</span>
            <span class="value">{{ stock.market_cap }}</span>
          </div>
          <div class="detail">
            <span class="label">市盈率:</span>
            <span class="value">{{ stock.pe_ratio }}</span>
          </div>
          <div class="detail">
            <span class="label">市净率:</span>
            <span class="value">{{ stock.pb_ratio }}</span>
          </div>
          <div class="detail">
            <span class="label">换手率:</span>
            <span class="value">{{ stock.turnover_rate }}%</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="pagination-controls">
      <button 
        @click="prevPage"
        :disabled="currentPage <= 1"
        class="page-btn"
      >上一页</button>
      
      <span class="page-info">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
      </span>
      
      <button 
        @click="nextPage"
        :disabled="currentPage >= totalPages"
        class="page-btn"
      >下一页</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'StockList',
  data() {
    return {
      currentPage: 1,
      pageSize: 9, // 每页显示9条
      totalItems: 0,
      allStocks: [],    // 存储所有股票数据
      filteredStocks: [], // 存储过滤后的股票
      pagedStocks: [],  // 存储当前页显示的股票
      searchQuery: '',
      loading: false,
      error: null,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredStocks.length / this.pageSize);
    }
  },
  watch: {
    // 当搜索词或页码变化时更新分页
    searchQuery() {
      this.currentPage = 1;
      this.filterStocks();
    },
    currentPage() {
      this.updatePagedStocks();
    }
  },
  async created() {
    await this.fetchAllStocks();
  },
  methods: {
    async fetchAllStocks() {
      this.loading = true;
      this.error = null;
      try {
        // 获取所有股票数据
        const response = await axios.get('http://localhost:3000/api/stocks?');
        this.allStocks = response.data;
        this.filteredStocks = [...this.allStocks];
        this.totalItems = this.filteredStocks.length;
        this.updatePagedStocks();
      } catch (err) {
        console.error('获取股票数据失败:', err);
        this.error = '获取股票数据失败，请稍后重试';
      } finally {
        this.loading = false;
      }
    },
    
    filterStocks() {
      if (!this.searchQuery) {
        this.filteredStocks = [...this.allStocks];
      } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredStocks = this.allStocks.filter(stock => 
          stock.name.toLowerCase().includes(query) || 
          stock.code.toLowerCase().includes(query)
        );
      }
      this.totalItems = this.filteredStocks.length;
      this.updatePagedStocks();
    },
    
    updatePagedStocks() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.pagedStocks = this.filteredStocks.slice(start, end);
    },
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    }
  }
};
</script>

<style scoped>
.stock-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 20px;
}

.loading,
.error {
  text-align: center;
  padding: 20px;
  margin: 20px 0;
  border-radius: 5px;
}

.error {
  background-color: #ffebee;
  color: #c62828;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.pagination-controls {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  gap: 15px;
  align-items: center;
}

.page-btn {
  padding: 8px 20px;
  border: 1px solid #2c3e50;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 14px;
}

.stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.stock-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stock-card:hover {
  transform: translateY(-5px);
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.stock-header h3 {
  margin: 0;
  color: #333;
}

.stock-code {
  background: #f5f5f5;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.stock-price {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.price {
  font-size: 24px;
  font-weight: bold;
  margin-right: 10px;
}

.change {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.up {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.down {
  background-color: #ffebee;
  color: #c62828;
}

.stock-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.detail {
  display: flex;
  justify-content: space-between;
}

.label {
  color: #666;
}

.value {
  font-weight: 500;
}
</style>