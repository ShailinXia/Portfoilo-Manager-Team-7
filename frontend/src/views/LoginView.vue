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

  /* 渐变层 + 本地图片背景
  background-image: url('../assets/login.png');  
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center; */
  background: url('../assets/loginBit.jpg') no-repeat center center;
  background-size: cover;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start; 
  padding-top: 150px; /* 顶部间距 */
  position: relative;
  overflow: hidden;
  font-family: 'Arial', 'Microsoft YaHei', sans-serif;
}

.login-box {
  animation: fadeInUp 0.6s ease, glow 2s infinite alternate;
  background: rgba(255, 255, 255, 0.15); /* 更透明的白色背景 */
  padding: 10px 50px;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 420px;
  text-align: center;
  min-height: 500px; /* 新增最小高度 */
  display: flex;
  flex-direction: column;
  justify-content: center; /* 内容垂直居中 */
  backdrop-filter: blur(12px); /* 增强模糊效果 */
  border: 1px solid rgba(255, 255, 255, 0.2); /* 更明显的边框 */
  box-shadow: 
    0 0 15px rgba(255, 255, 255, 0.2), /* 内发光 */
    0 0 30px rgba(0, 150, 255, 0.3); /* 外发光 */
  position: relative;
  z-index: 2;
  margin-top: 150px;

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
   color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: 600;
  margin-bottom: 30px;
  font-size: 26px;
}

.form-group {
  margin-bottom: 28px;
  margin-bottom: 30px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 15px; /* 调整内边距 */
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px; /* 增大字体 */
  transition: all 0.3s;
  background-color: #f9f9f9;
  height: 48px; /* 固定高度 */
  box-sizing: border-box; /* 确保padding不影响最终尺寸 */
  background: rgba(255, 255, 255, 0.2);
  color: #333;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.form-group input:focus {
  background-color: #fff; 
  border-color: #3498db; 
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  color: #000; 
}

.login-btn {
  margin-top: 30px; /* 增加上方间距 */
  width: 100%;
  padding: 14px;
  background-image: linear-gradient(to right, #3498db, #2980b9);
  border: none;
  border-radius: 8px;
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
  box-shadow: 0 4px 14px rgba(41, 128, 185, 0.35);
  cursor: pointer;
  margin-top: 10px;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);

}

.login-btn:hover {
  background-image: linear-gradient(to right, #2980b9, #1c5980);
  transform: translateY(-2px);

  box-shadow: 0 6px 20px rgba(41, 128, 185, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.error-message {
  color: #e74c3c;
  margin-top: 20px;

  font-size: 14px;
  padding: 10px;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 5px;
  border-left: 3px solid #e74c3c;
}

@keyframes glow {
  from {
    box-shadow: 
      0 0 10px rgba(255, 255, 255, 0.2),
      0 0 20px rgba(0, 150, 255, 0.3);
  }
  to {
    box-shadow: 
      0 0 20px rgba(255, 255, 255, 0.3),
      0 0 40px rgba(0, 150, 255, 0.5);
  }
}


</style>