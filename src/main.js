import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
import './plugins/element.js'
import './assets/fonts/iconfont.css'

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios 请求拦截
axios.interceptors.request.use(config => {
  // 为请求头对象，添加token验证的authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 回调函数最后必须返回config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
