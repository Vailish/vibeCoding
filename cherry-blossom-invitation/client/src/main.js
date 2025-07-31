import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import '@fortawesome/fontawesome-free/css/all.css'

// Axios 설정
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'

const app = createApp(App)

// 전역 속성으로 axios 등록
app.config.globalProperties.$http = axios

app.use(router).mount('#app')