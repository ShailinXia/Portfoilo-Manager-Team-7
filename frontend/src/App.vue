<script setup>

import { onMounted, ref } from 'vue';
import { SwitchButton } from '@element-plus/icons-vue'; // 导入退出图标
import PortfolioManager from './components/PortfolioManager.vue';
import StockList from './components/StockList.vue';
import LoginView from './views/LoginView.vue';

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

</script>


<template>
  <div v-if="!isAuthenticated">
    <LoginView @login-success="isAuthenticated = true"/>
  </div>
  <div v-else class="app-container">
    <!-- 修改后的侧边栏结构 -->
    <aside class="sidebar">
      <!-- 侧边栏头部 -->
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">
            <i class="icon-cube"></i>
          </div>
          <h1>投资管理系统</h1>
        </div>
      </div>
      
      <!-- 侧边栏导航 -->
      <nav class="sidebar-nav">
        <button
          @click="activeTab = 'portfolio'"
          :class="{ active: activeTab === 'portfolio' }"
        >
          <i class="icon-dashboard"></i>
          <span>投资组合</span>
        </button>
        <button
          @click="activeTab = 'stocks'"
          :class="{ active: activeTab === 'stocks' }"
        >
          <i class="icon-project-diagram"></i>
          <span>股票行情</span>
        </button>
      </nav>
      
      <!-- 侧边栏底部 -->
      <div class="sidebar-footer">
        <button class="logout-btn" @click="handleLogout">
          <i class="icon-logout"></i>
          <span>退出登录</span>
        </button>
      </div>
    </aside>

    <div class="main-content">
      <PortfolioManager v-if="activeTab === 'portfolio'"/>
      <StockList v-if="activeTab === 'stocks'"/>
    </div>
  </div>
</template>


<style>
/* 基础样式 */
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
  background-color: #f5f7fa;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

/* 新侧边栏样式 */
.sidebar {
  width: 240px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 20;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #eee;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(to bottom right, #3b82f6, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon i {
  color: white;
  font-size: 18px;
}

.sidebar h1 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
}

.sidebar button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  margin: 0 10px;
  border-radius: 6px;
  background: none;
  border: none;
  color: #555;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.sidebar button:hover {
  background-color: #f5f5f5;
  color: #3b82f6;
}

.sidebar button.active {
  background-color: #eef2ff;
  color: #3b82f6;
  font-weight: 600;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #eee;
}

.logout-btn {
  color: #555 !important;
}

.logout-btn:hover {
  color: #ef4444 !important;
  background-color: #fef2f2 !important;
}

/* 完整的图标样式 */
/* icon-cube */
.icon-cube {
  position: relative;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  transform: rotate(-45deg) skewX(15deg) skewY(15deg);
}
.icon-cube::before,
.icon-cube::after {
  content: '';
  position: absolute;
  background-color: currentColor;
}
.icon-cube::before {
  width: 16px;
  height: 2px;
  top: -2px;
  left: 0;
  transform: skewX(-15deg);
}
.icon-cube::after {
  width: 2px;
  height: 16px;
  top: 0;
  left: -2px;
  transform: skewY(-15deg);
}

/* icon-dashboard */
.icon-dashboard {
  position: relative;
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-radius: 2px;
}
.icon-dashboard::before,
.icon-dashboard::after {
  content: '';
  position: absolute;
  background-color: currentColor;
}
.icon-dashboard::before {
  width: 10px;
  height: 2px;
  top: 4px;
  left: 2px;
}
.icon-dashboard::after {
  width: 2px;
  height: 6px;
  top: 8px;
  left: 4px;
}

/* icon-chart-line */
.icon-chart-line {
  position: relative;
  width: 18px;
  height: 18px;
  border-bottom: 2px solid currentColor;
}
.icon-chart-line::before,
.icon-chart-line::after {
  content: '';
  position: absolute;
  background-color: currentColor;
}
.icon-chart-line::before {
  width: 2px;
  height: 8px;
  bottom: 0;
  left: 4px;
  transform: rotate(45deg);
  transform-origin: bottom left;
}
.icon-chart-line::after {
  width: 2px;
  height: 12px;
  bottom: 0;
  left: 10px;
  transform: rotate(-45deg);
  transform-origin: bottom right;
}

/* icon-project-diagram */
.icon-project-diagram {
  position: relative;
  width: 18px;
  height: 18px;
}
.icon-project-diagram::before,
.icon-project-diagram::after {
  content: '';
  position: absolute;
  background-color: currentColor;
}
.icon-project-diagram::before {
  width: 6px;
  height: 6px;
  border: 2px solid currentColor;
  top: 0;
  left: 0;
}
.icon-project-diagram::after {
  width: 6px;
  height: 6px;
  border: 2px solid currentColor;
  bottom: 0;
  right: 0;
}
.icon-project-diagram > div {
  position: absolute;
  background-color: currentColor;
}
.icon-project-diagram > div:nth-child(1) {
  width: 2px;
  height: 10px;
  top: 4px;
  left: 3px;
}
.icon-project-diagram > div:nth-child(2) {
  width: 10px;
  height: 2px;
  top: 11px;
  left: 3px;
}
.icon-project-diagram > div:nth-child(3) {
  width: 2px;
  height: 10px;
  top: 4px;
  right: 3px;
}

/* icon-logout */
/* 填充箭头 */
/* 加长尾部的填充箭头 */
.icon-logout {
  position: relative;
  width: 20px;  /* 稍微加宽容器 */
  height: 18px;
  display: inline-block;
}

.icon-logout::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 14px;  /* 向右移动箭头头位置 */
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 8px solid currentColor; /* 箭头头部大小不变 */
}

.icon-logout::after {
  content: '';
  position: absolute;
  width: 20px;  /* 加长尾巴从10px→12px */
  height: 2px;
  background-color: currentColor;
  top: 8px;
  left: 0;      /* 保持左对齐 */
}

/* icon-cog */
.icon-cog {
  position: relative;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid currentColor;
}
.icon-cog::before,
.icon-cog::after {
  content: '';
  position: absolute;
  background-color: currentColor;
  border-radius: 1px;
}
.icon-cog::before {
  width: 2px;
  height: 6px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
}
.icon-cog::after {
  width: 2px;
  height: 6px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
}
.icon-cog > div {
  position: absolute;
  width: 2px;
  height: 6px;
  background-color: currentColor;
  border-radius: 1px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
}

.main-content {
  flex: 1;
  padding: 20px;
  margin-left: 240px;
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
  }
  
  .main-content {
    margin-left: 0;
    padding: 20px;
  }
  
  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .sidebar button {
    flex: 1;
    justify-content: center;
    text-align: center;
  }
  
  .sidebar-footer {
    display: none;
  }
}
</style>
