import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
// 导入 Chart.js --> cd frontend --> npm install chart.js
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables)

// const app = createApp(App)
// app.use(router) // 挂载路由
// app.mount('#app')

createApp(App).use(router).mount('#app')


