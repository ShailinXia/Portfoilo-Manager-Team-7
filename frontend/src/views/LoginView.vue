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
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const emit = defineEmits(['login-success']); // 新增

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const handleLogin = async () => {
  error.value = '';

const handleLogin = async () => {
  error.value = '';

  // 1. 测试超级账号快速通过
  if (username.value === 'admin' && password.value === '123456') {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUsername', 'admin');
    emit('login-success');
    return;
  }

  // 2. 其它用户走后端接口校验
  try {
    const resp = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    });
    const result = await resp.json();
    if (result.success) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUsername', username.value);
      emit('login-success');
    } else {
      error.value = result.message || '用户名或密码错误';
    }
  } catch (err) {
    error.value = '登录失败: ' + err.message;
  }
};


</script>

<style scoped>
.login-container {
  background: url('../assets/loginBit.jpg') no-repeat center center;
  background-size: cover;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 150px;
  font-family: 'Poppins', 'Segoe UI', 'Arial', 'Microsoft YaHei', sans-serif;
}

.login-box {
  animation: fadeInUp 0.6s ease, glow 2s infinite alternate;
  background: rgba(255, 255, 255, 0.16);
  padding: 38px 42px 32px 42px;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  text-align: center;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  backdrop-filter: blur(15px);
  border: 1.5px solid rgba(255,255,255,0.20);
  box-shadow: 0 6px 40px rgba(0, 44, 98, 0.23), 0 0 30px rgba(20, 150, 255, 0.09);
  position: relative;
  z-index: 2;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px);}
  to   { opacity: 1; transform: translateY(0);}
}
@keyframes glow {
  from {
    box-shadow:
        0 0 16px rgba(255,255,255,0.18),
        0 0 40px rgba(0,150,255,0.20);
  }
  to {
    box-shadow:
        0 0 28px rgba(255,255,255,0.28),
        0 0 55px rgba(0,150,255,0.35);
  }
}

.login-box h2 {
  color: #fff;
  font-family: 'Poppins', 'Segoe UI', 'Arial', 'Microsoft YaHei', sans-serif;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 38px;
  font-size: 28px;
  text-shadow: 0 2px 12px rgba(52,152,219,0.18), 0 1px 2px rgba(0,0,0,0.18);
}

.form-group {
  margin-bottom: 25px;
  text-align: left;
}

.form-group label {
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 7px;
  display: block;
  letter-spacing: .5px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.23);
}

.form-group input {
  width: 100%;
  padding: 12px 18px;
  border: 1.5px solid rgba(255,255,255,0.28);
  border-radius: 8px;
  font-size: 17px;
  background: rgba(255,255,255,0.25);
  color: #20242d;
  font-family: inherit;
  transition: border-color 0.28s, background 0.28s;
  box-sizing: border-box;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0,44,98,0.07);
}

.form-group input::placeholder {
  color: rgba(170,190,230,0.65);
  font-size: 15px;
  font-weight: 400;
}

.form-group input:focus {
  background-color: #fff;
  border-color: #3498db;
  outline: none;
  color: #184066;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.11);
}

.login-btn {
  width: 100%;
  padding: 15px 0;
  background-image: linear-gradient(90deg, #3498db, #2980b9 80%);
  border: none;
  border-radius: 24px;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  transition: background .22s, box-shadow .22s, transform .14s;
  box-shadow: 0 4px 18px rgba(41,128,185,0.15), 0 1.5px 1.5px rgba(255,255,255,0.08);
  cursor: pointer;
  margin-top: 18px;
  letter-spacing: .8px;
  text-shadow: 0 2px 4px rgba(44,62,80,.14);
}

.login-btn:hover {
  background-image: linear-gradient(90deg, #2380c4 0%, #1a567d 100%);
  transform: translateY(-1.5px) scale(1.01);
  box-shadow: 0 8px 24px rgba(41,128,185,0.28), 0 1.5px 1.5px rgba(255,255,255,0.10);
}

.login-btn:active {
  transform: scale(0.99);
}

.error-message {
  color: #fff;
  margin-top: 25px;
  font-size: 15px;
  font-weight: 500;
  background-color: rgba(231, 76, 60, 0.26);
  border-radius: 6px;
  border-left: 4px solid #e74c3c;
  padding: 12px 16px;
  box-shadow: 0 2px 12px rgba(231,76,60,0.10);
  text-align: left;
}
</style>
