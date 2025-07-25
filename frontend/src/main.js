import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
// 导入 Chart.js --> cd frontend --> npm install chart.js
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

createApp(App).mount('#app')
const app = createApp(App);
app.use(router);
app.mount('#app');


