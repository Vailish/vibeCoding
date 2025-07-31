import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'

import 'animate.css'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './style.css'

import Home from './views/Home.vue'
import Admin from './views/Admin.vue'
import Guestbook from './views/Guestbook.vue'
import RSVP from './views/RSVP.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/admin', name: 'Admin', component: Admin },
  { path: '/guestbook', name: 'Guestbook', component: Guestbook },
  { path: '/rsvp', name: 'RSVP', component: RSVP }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)

app.mount('#app')

AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true,
  mirror: false
})