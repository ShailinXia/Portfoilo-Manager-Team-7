import { createApp } from 'vue'
import App from './App.vue'

// 导入 Chart.js
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

createApp(App).mount('#app')