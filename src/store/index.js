import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'

Vue.use(Vuex)

const modulesFiles = require.context('./modules', true, /\.js$/)

// it will auto require all vuex module from modules file
const modules = modulesFiles.keys().reduce((modulesStore, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  modulesStore[moduleName] = value.default
  return modulesStore
}, {})

const store = new Vuex.Store({
  modules,
  getters
})

export default store
