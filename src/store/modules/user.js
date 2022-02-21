import { removeToken, setIsLogin, setCustomerId, setActiveCustomerId, getLocalStorage, setLocalStorage, removeLocalStorage } from '@/utils/auth'
import { getUserName } from '@/api/user'
import router, { resetRouter } from '@/router'
import store from '../index'
import { login, siteSession, isAuthenticated, logout, getServerType, getIsLDAP, getPermission, getDeniedFeature, getSiteSession } from '@/api/common.js'
import { xml2Obj } from '@/utils'
import { OP_USER_ROLE, REFRESH_INTERVAL_COOKIE_NAME } from '@/store/const'

const INTERVALTIME = 1000 * 3 * 60

const state = {

  resetSession: null,

  serverType: null,

  authType: null,

  canChangePassword: false,

  roleId: '',

  permission: [],

  deniedFeature: [],

  customerId: '',

  activeCustomerId: +getLocalStorage('activeCustomerId'),

  isSsprEnabled: '',

  initWeb: true // use localstorage instead of cookie for secure. then SSO logout will not clear localstorage, 'isLogin' is still 'true', login again will not run 'isAuthenticated', any api will return '401'. so force run 'isAuthenticated' at init
}

const mutations = {
  SET_RESETSESSION: (state, interval) => {
    state.resetSession = interval
  },

  SET_SERVERTYPE: (state, serverType) => {
    state.serverType = serverType
  },

  SET_AUTHTYPE: (state, authType) => {
    state.authType = authType
  },

  SET_CANCHANGEPASSWORD: (state, canChangePassword) => {
    state.canChangePassword = canChangePassword
  },

  SET_ROLE: (state, role) => {
    state.roleId = role
  },

  SET_PERMISSION: (state, permission) => {
    state.permission = permission
  },

  SET_DENIEDFEATURE: (state, deniedFeature) => {
    state.deniedFeature = deniedFeature
  },

  SET_CUSTOMERID: (state, customerId) => {
    state.customerId = customerId
  },

  SET_ACTIVECUSTOMER: (state, activeCustomerId) => {
    setActiveCustomerId(activeCustomerId)
    state.activeCustomerId = activeCustomerId
  },

  SET_ISSSPRENABLED: (state, enable) => {
    state.isSsprEnabled = enable
  },

  SET_INITWEB: (state, initWeb) => {
    state.initWeb = initWeb
  }
}

const actions = {
  // user login
  login({ commit, state, dispatch }, userInfo) {
    return new Promise((resolve, reject) => {
      login(userInfo).then(async() => {
        await dispatch('getCurrentUserName')
        setIsLogin(true)
        await siteSession()
        const role = await dispatch('getRole')
        const deniedFeature = await dispatch('getDeniedFeature')
        const accessedRoutes = await store.dispatch('permission/generateRoutes', { permission: role.permission || [], deniedFeature: deniedFeature || [] })

        router.addRoutes(accessedRoutes)
        // If Accessedroutes has only one value, then the role only has the MySetting permission
        if (accessedRoutes.length === 1) {
          router.push('mySettings')
        } else {
          router.push(accessedRoutes[0].children[0].path)
        }

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  getCurrentUserName() {
    return new Promise((resolve, reject) => {
      getUserName().then(data => {
        const res = xml2Obj(data)
        setLocalStorage('ALM_UserName', res.Username)
        resolve(data)
      }).catch(e => {
        reject(e)
      })
    })
  },

  setResetSession({ commit, state }) {
    const interval = setInterval(async() => {
      await getSiteSession()
    }, INTERVALTIME)
    commit('SET_RESETSESSION', interval)
  },

  clearInterval({ commit, state }) {
    window.clearInterval(state.resetSession)
    commit('SET_RESETSESSION', null)
    // commit('SET_SERVERTYPE', null)
    commit('SET_AUTHTYPE', null)
  },

  // user is authenticated
  isAuthenticated({ commit }) {
    return new Promise((resolve, reject) => {
      isAuthenticated().then(data => {
        const res = xml2Obj(data)
        setLocalStorage('ALM_UserName', res.Username)
        setIsLogin(true)
        resolve()
      }).catch(error => {
        setIsLogin(false)
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout().then(() => {
        dispatch('clearLoginStatus')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  clearLoginStatus({ commit, dispatch }) {
    dispatch('clearInterval')
    commit('SET_ROLE', '')

    store.commit('taskStatus/SET_IS_TASK_REMINDER_VISIBLE', false)

    // reset customer store
    commit('SET_CUSTOMERID', '')
    commit('SET_ACTIVECUSTOMER', '')
    store.commit('customer/SET_CUSTOMERLIST', [])
    store.dispatch('permission/resetRouter')
    resetRouter()

    removeToken()
    removeLocalStorage('ALM_UserName')
    removeLocalStorage('customerId')
    removeLocalStorage('activeCustomerId')
    removeLocalStorage(REFRESH_INTERVAL_COOKIE_NAME)
  },

  // get user role
  getRole({ commit }) {
    return new Promise((resolve, reject) => {
      getPermission().then(data => {
        const { role } = data
        commit('SET_ROLE', role['role-id'])
        commit('SET_CUSTOMERID', role['customer-id'])

        if (!state.activeCustomerId) {
          setLocalStorage('activeCustomerId', role['customer-id'])
          commit('SET_ACTIVECUSTOMER', role['customer-id'])
        }

        setCustomerId(role['customer-id'])

        if (role.permission) {
          role.permission = Array.isArray(role.permission) ? role.permission : [role.permission]
        }
        commit('SET_PERMISSION', role.permission || [])

        resolve(role)
      }).catch(() => {
        commit('SET_ROLE', OP_USER_ROLE.basicUser)
        resolve()
      })
    })
  },

  getDeniedFeature({ commit }) {
    return new Promise((resolve, reject) => {
      getDeniedFeature().then(data => {
        const list = data['denied-features']['feature-name'] ? (Array.isArray(data['denied-features']['feature-name']) ? data['denied-features']['feature-name'] : [data['denied-features']['feature-name']]) : []
        commit('SET_DENIEDFEATURE', list)
        resolve(list)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get server type
  async getServerType({ commit }) {
    try {
      const { serversettings } = await getServerType()

      commit('SET_SERVERTYPE', serversettings.parameter.find(i => i.name === 'serverDeploymentType').value)
      commit('SET_AUTHTYPE', serversettings.parameter.find(i => i.name === 'authType').value)
      commit('SET_CANCHANGEPASSWORD', serversettings.parameter.find(i => i.name === 'canChangePassword').value)
      commit('SET_ISSSPRENABLED', serversettings.parameter.find(i => i.name === 'isSsprEnabled').value)
    } catch (e) {
      console.log(e)
    }
  },

  async getIsLDAP({ commit }) {
    try {
      const parameter = await getIsLDAP()
      if (parameter && !store.getters.authType && store.getters.authType !== 0) {
        commit('SET_AUTHTYPE', parameter['site-parameter'].value)
      }
    } catch (e) {
      console.log(e)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
