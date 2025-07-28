<template>
  <div class="login-container">
    <div class="login-box">
      <h2>投资管理系统登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
              type="text"
              id="username"
              v-model="username"
              placeholder="请输入用户名"
              required
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
              type="password"
              id="password"
              v-model="password"
              placeholder="请输入密码"
              required
          />
        </div>
        <button type="submit" class="login-btn">登录</button>
      </form>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';

const emit = defineEmits(['login-success']); // 新增

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const handleLogin = () => {
  if (username.value === 'admin' && password.value === '123456') {
    localStorage.setItem('isAuthenticated', 'true');
    emit('login-success'); // 通知父组件
  } else {
    error.value = '用户名或密码错误';
  }
};

</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #3498db, #2c3e50);
  background-size: cover;
  backdrop-filter: blur(8px);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  animation: fadeInUp 0.6s ease;
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-box h2 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  width: 95%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #3498db;
  outline: none;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-image: linear-gradient(to right, #3498db, #2980b9);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.login-btn:hover {
  background-image: linear-gradient(to right, #2980b9, #1c5980);
  transform: translateY(-2px);
}


.error-message {
  color: #e74c3c;
  margin-top: 20px;
}
</style>