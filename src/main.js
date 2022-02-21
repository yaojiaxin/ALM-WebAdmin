// with polyfills
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import Vue from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './locales' // internationalization

import '@/components/lazy_use'
import '@/router/permission'
import * as filters from './filters' // global filters

import '@/styles/microfocus-theme.less'
import '@/styles/index.less'
import './icons'
import { checkPermission, isNotDeniedFeature } from '@/utils/permission'

// import { mockXHR } from '../mock/index'

// directives
import Directives from '@/directive'

Vue.use(Directives)

Vue.config.productionTip = false

// if (process.env.NODE_ENV === 'development') {
//   mockXHR()
// }

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')

Vue.prototype.checkPermission = checkPermission
Vue.prototype.isNotDeniedFeature = isNotDeniedFeature
