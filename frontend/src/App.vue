<!--<script setup>-->
<!--import PortfolioManager from './components/PortfolioManager.vue';-->
<!--</script>-->

<!--<template>-->
<!--  <PortfolioManager />-->
<!--  <StockList />-->

<!--</template>-->
<!--<script>-->
<!--import StockList from './components/StockList.vue';-->

<!--export default {-->
<!--  name: 'App',-->
<!--  components: {-->
<!--    StockList-->
<!--  }-->
<!--};-->
<!--</script>-->
<!--<style>-->
<!--body {-->
<!--  margin: 0;-->
<!--  padding: 20px;-->
<!--  background-color: #f5f7fa;-->
<!--}-->
<!--</style>-->

<script setup>

import { ref, onMounted } from 'vue';
import LoginView from './views/LoginView.vue';
import PortfolioManager from './components/PortfolioManager.vue';
import StockList from './components/StockList.vue';

const isAuthenticated = ref(false);
const activeTab = ref('portfolio');

// 检查登录状态
onMounted(() => {
  checkAuthStatus();
});

const checkAuthStatus = () => {
  isAuthenticated.value = localStorage.getItem('isAuthenticated') === 'true';
};

// 处理退出登录
const handleLogout = () => {
  localStorage.removeItem('isAuthenticated');
  isAuthenticated.value = false;
  activeTab.value = 'portfolio'; // 重置选项卡
};
// =======
// import PortfolioManager from 'C:/Users/Administrator/Portfoilo-Manager-Team-7/frontend/src/components/PortfolioManager.vue'; // Adjust the path as necessary
// >>>>>>> c6db412e21cdf5caa45eb22927780f95a6a24f93
</script>

<template>
  <div v-if="!isAuthenticated">
    <LoginView @login-success="isAuthenticated = true" />
  </div>
  <div v-else class="app-container">
    <div class="sidebar">
      <h2>投资管理系统</h2>
      <nav>
        <button
            @click="activeTab = 'portfolio'"
            :class="{ active: activeTab === 'portfolio' }"
        >
          投资组合
        </button>
        <button
            @click="activeTab = 'stocks'"
            :class="{ active: activeTab === 'stocks' }"
        >
          股票行情
        </button>
        <button class="logout-btn" @click="handleLogout">
          <span class="logout-icon">→</span> 退出登录
        </button>
      </nav>
    </div>

    <div class="main-content">
      <PortfolioManager v-if="activeTab === 'portfolio'" />
      <StockList v-if="activeTab === 'stocks'" />
    </div>
  </div>
</template>


<style>
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 200px;
  background-color: #2c3e50;
  color: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

.sidebar h2 {
  color: white;
  margin-bottom: 30px;
  text-align: center;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar button {
  background: none;
  border: none;
  color: #ecf0f1;
  padding: 12px 15px;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  font-size: 16px;
}

.sidebar button:hover {
  background-color: #34495e;
}

.sidebar button.active {
  background-color: #3498db;
  color: white;
}

.logout-btn {
  margin-top: 30px;
  background-color: #e74c3c !important;
}

.logout-btn:hover {
  background-color: #c0392b !important;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 10px;
  }

  .sidebar nav {
    flex-direction: row;
    justify-content: space-around;
    flex-wrap: wrap;
  }

  .sidebar button {
    padding: 10px;
    text-align: center;
  }

  .logout-btn {
    margin-top: 10px;
    width: 100%;
  }
}

/* 保持原有样式不变，添加以下样式 */
.logout-btn {
  margin-top: auto; /* 使退出按钮位于底部 */
  background-color: rgba(231, 76, 60, 0.1) !important;
  color: #e74c3c !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logout-btn:hover {
  background-color: rgba(231, 76, 60, 0.2) !important;
}

.logout-icon {
  font-weight: bold;
  transform: rotate(180deg);
  display: inline-block;
}

/* 移动端调整 */
@media (max-width: 768px) {
  .logout-btn {
    margin-top: 20px;
    width: 100%;
  }
}


</style>