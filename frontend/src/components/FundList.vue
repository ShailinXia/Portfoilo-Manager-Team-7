<template>
  <div class="fund-list">
    <h1>中国主要基金行情</h1>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="搜索基金名称或代码..." @input="filterFunds" />
    </div>

    <div class="fund-grid">
      <div v-for="fund in pagedFunds" :key="fund.code" class="fund-card">
        <div class="fund-header">
          <h3>{{ fund.name }}</h3>
          <span class="fund-code">{{ fund.code }}</span>
        </div>
        <div class="fund-price" v-if="fund.change_percent != null">
          <span class="price"> ¥{{ fund.latest_net_value.toFixed(4) }}</span>
          <span class="change" :class="{ 'up': fund.change_percent >= 0, 'down': fund.change_percent < 0 }">
            {{ fund.change_percent >= 0 ? '+' : '' }}{{ fund.change_percent.toFixed(2) }}%
          </span>
        </div>
        <div class="fund-details">
          <div class="detail">
            <span class="label">规模:</span>
            <span class="value">{{ fund.fund_size || '--' }}</span>
          </div>
          <div class="detail">
            <span class="label">基金经理:</span>
            <span class="value">{{ fund.managers || '--' }}</span>
          </div>
          <div class="detail" v-if="fund.industries">
            <span class="label">行业分布:</span>
            <span class="value">{{ fund.industries }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-controls">
      <button @click="prevPage" :disabled="currentPage <= 1" class="page-btn">上一页</button>
      <span class="page-info">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
      </span>
      <div class="jump-to-page">
        <input type="number" v-model.number="jumpPage" min="1" :max="totalPages" @keydown.enter="goToPage" placeholder="页码" />
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
      allFunds: [],
      pagedFunds: [],
      searchQuery: '',
      loading: false,
      error: null,
      pageSize: 12,
      currentPage: 1,
      jumpPage: null,
      totalPages: 1,
    };
  },
  async created() {
    await this.fetchFunds();
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
      this.filterFunds();
    },
    currentPage() {
      this.updatePagedFunds();
    }
  },
  methods: {
    async fetchFunds() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('http://localhost:3000/api/funds/');
        this.allFunds = response.data;
        this.totalPages = Math.ceil(this.allFunds.length / this.pageSize);
        this.updatePagedFunds();
      } catch (err) {
        this.error = '获取基金数据失败，请稍后重试';
      } finally {
        this.loading = false;
      }
    },
    filterFunds() {
      let filtered = this.allFunds;
      if (this.searchQuery.trim()) {
        const keyword = this.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(f =>
            (f.name && f.name.toLowerCase().includes(keyword)) ||
            (f.code && f.code.toLowerCase().includes(keyword))
        );
      }
      this.totalPages = Math.ceil(filtered.length / this.pageSize);
      this.currentPage = 1;
      this.updatePagedFunds(filtered);
    },
    updatePagedFunds(list) {
      const funds = list || this.filteredFunds || this.allFunds;
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.pagedFunds = funds.slice(start, end);
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.updatePagedFunds();
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.updatePagedFunds();
      }
    },
    goToPage() {
      if (this.jumpPage >= 1 && this.jumpPage <= this.totalPages) {
        this.currentPage = this.jumpPage;
        this.updatePagedFunds();
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.page-btn {
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #3b82f6;
  color: #3b82f6;
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.09);
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
  font-size: 20px;
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
  font-size: 20px;
  font-weight: bold;
  margin-right: 8px;
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

.fund-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
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
