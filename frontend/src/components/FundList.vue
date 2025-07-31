<template>
  <div class="fund-list">
    <h1>中国基金数据</h1>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="搜索基金名称或代码..." @input="filterFunds" @focus="clearJumpPage" />
      <button @click="clearSearch" class="clear-btn"> 清除</button>
    </div>

    <div class="fund-grid">
      <div v-for="fund in pagedFunds" :key="fund.code" class="fund-card">
        <div class="fund-header">
          <h3>{{ fund.name }}</h3>
          <span class="fund-code">{{ fund.code }}</span>
        </div>

        <div class="fund-price" v-if="fund.change_percent != null">
          <span class="price">¥{{ fund.latest_net_value.toFixed(2) }}</span>
          <span class="change" :class="{ 'up': fund.change_percent >= 0, 'down': fund.change_percent < 0 }">
            {{ fund.change_percent >= 0 ? '+' : '' }}{{ fund.change_percent.toFixed(2) }}%
          </span>
        </div>

        <div class="fund-details">
          <div class="detail">
            <span class="label">市值:</span>
            <span class="value">{{ fund.fund_size }}</span>
          </div>
          <!-- <div class="detail">
            <span class="label">市盈率:</span>
            <span class="value">{{ fund.pe_ratio }}</span>
          </div> -->
          <div class="detail">
            <span class="label">管理者:</span>
            <span class="value">{{ fund.managers }}</span>
          </div>
          <!-- <div class="detail">
            <span class="label">换手率:</span>
            <span class="value">{{ fund.turnover_rate }}%</span>
          </div> -->
        </div>
      </div>
    </div>

    <div class="pagination-controls">
      <button @click="prevPage" :disabled="currentPage <= 1" class="page-btn">上一页</button>

      <span class="page-info">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
      </span>

      <div class="jump-to-page">
        <input type="number" v-model.number="jumpPage" min="1" :max="totalPages" @keydown.enter="goToPage"
          placeholder="页码" />
        <button @click="goToPage" class="page-btn">跳转</button>
      </div>

      <button @click="nextPage" :disabled="currentPage >= totalPages" class="page-btn">下一页</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'FundList',
  data() {
    return {
      currentPage: 1,
      pageSize: 15,
      totalItems: 2686,
      totalPages: 0,
      pagedFunds: [], // 当前页显示的股票（由后端返回）
      searchQuery: '',
      loading: false,
      error: null,
      jumpPage: null, // 跳转页码输入
      isFiltering: false,
      filteredFunds: [],
    };
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
      this.filterFunds(); // 使用 filterFunds 替代 fetchFunds
    },
    currentPage() {
      if (this.isFiltering) {
        this.applyPagination();
      } else {
        this.fetchFunds();
      }
    },
    // currentPage() {
    //   this.fetchFunds();
    // }
  },
  async created() {
    await this.fetchFunds();
    this.applyPagination();
  },
  methods: {
    clearJumpPage() {
      this.jumpPage = null;
    },
        async clearSearch() {
      this.searchQuery = '';
      this.jumpPage = null;
      this.currentPage = 1;
      this.isFiltering = false;
      await this.fetchStocks();
    },
    async fetchFunds() {
      this.loading = true;
      this.error = null;
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
        };
        const response = await axios.get('http://localhost:3000/api/funds', { params });

        // 假设后端返回格式为：{ data: [...], total: 123 }
        this.pagedFunds = response.data;
        this.totalItems = 2686;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      } catch (err) {
        console.error('获取股票数据失败:', err);
        this.error = '获取股票数据失败，请稍后重试';
      } finally {
        this.loading = false;
      }
    },

    async filterFunds() {
      const keyword = this.searchQuery.trim();

      if (!keyword) {
        this.isFiltering = false;
        await this.fetchFunds();  // 恢复默认分页数据
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get('http://localhost:3000/api/funds/searchAll', {
          params: { keyword }
        });


        this.filteredFunds = response.data;
        this.totalItems = this.filteredFunds.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.isFiltering = true;
        this.jumpPage = null;
        this.currentPage = 1;
        this.applyPagination(); // 在前端分页切片
      } catch (error) {
        this.error = '搜索失败，请检查网络或稍后再试';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    async applyPagination() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;

      if (this.isFiltering) {
        this.pagedFunds = this.filteredFunds.slice(start, end);
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.clearJumpPage();
        this.currentPage--;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.clearJumpPage();
        this.currentPage++;
      }
    },

    // 跳转到指定页码
    goToPage() {
      if (this.jumpPage >= 1 && this.jumpPage <= this.totalPages) {
        this.currentPage = this.jumpPage;
        this.clearJumpPage();

        if (this.isFiltering) {
          this.applyPagination();
        }
      } else {
        alert(`请输入 1 到 ${this.totalPages} 之间的页码`);
      }
    }
  }
};
</script>

<style scoped>
.fund-list {
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
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.search-bar input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.clear-btn {
  padding: 8px 16px;
  background-color: #fff;
  border: 1px solid #333;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.clear-btn:hover {
  background-color: #333;
  color: #fff;
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  /* 居中对齐 */
  gap: 10px;
  flex-wrap: nowrap;
  /* 不换行，防止“下一页”掉下来 */
  margin-top: 20px;
}

.page-btn {
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #333;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

.page-info {
  margin: 0 10px;
}

.jump-to-page {
  display: flex;
  align-items: center;
  gap: 5px;
}

.jump-to-page input {
  width: 40px;
  padding: 6px 12px;
  flex-wrap: nowrap;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.fund-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.fund-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.fund-card:hover {
  transform: translateY(-5px);
}

.fund-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.fund-header h3 {
  margin: 0;
  color: #333;
}

.fund-code {
  background: #f5f5f5;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.fund-price {
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
  background-color: #ffebee;
  color: #c62828;
}

.down {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.fund-details {
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