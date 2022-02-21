import { asyncRoutes, constantRoutes } from '@/router'
import store from '@/store'

// Use meta.permission to determin if the current user has permission
function hasPermission(route, permission) {
  if (route.meta && (route.meta.permission || route.meta.switchPermission)) {
    const activeCustomer = store.getters.activeCustomerId ? parseInt(store.getters.activeCustomerId) : 0

    if (activeCustomer !== store.getters.customerId) {
      if (route.meta.switchPermission) {
        return permission.findIndex(p => route.meta.switchPermission.includes(p['permission-name'])) > -1
      }
    } else {
      return permission.findIndex(p => route.meta.permission.includes(p['permission-name'])) > -1
    }
  } else {
    return true
  }
}
function hasLicense(route, deniedFeature) {
  if (route.meta && route.meta.license) {
    return !(deniedFeature.findIndex(p => route.meta.license.includes(p)) > -1)
  } else {
    return true
  }
}
// Filter asynchronous routing tables by recursion
export function filterAsyncRoutes(routes, permission, deniedFeature) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(tmp, permission) && hasLicense(tmp, deniedFeature)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, permission, deniedFeature)
      }
      // if (tmp.children && tmp.children.length === 0) {
      //   tmp.hidden = true
      // }
      res.push(tmp)
    }
  })
  return res
}

const state = {
  routes: [],
  addRoutes: [],

  role: '' // There is only one role per user
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  },

  SET_ROLE: (state, role) => {
    state.role = role
  }
}

const actions = {
  generateRoutes({ commit }, { permission, deniedFeature }) {
    return new Promise(resolve => {
      const accessedRoutes = filterAsyncRoutes(asyncRoutes, permission, deniedFeature)

      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  },

  resetRouter({ commit }) {
    commit('SET_ROUTES', [])
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
