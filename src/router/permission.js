import router from './index'
import { getIsLogin } from '@/utils/auth'
import { AUTH_TYPE } from '@/store/const'
import store from '@/store'
import { siteSession } from '@/api/common.js'
import Vue from 'vue'
import i18n from '@/locales/index.js'
import message from '@/components/MFMessage'

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  message.destroy()

  let isLogin = getIsLogin() ? JSON.parse(getIsLogin()) : false

  // Determine whether the user is an SA user
  // const isSa = store.getters.role !== OP_USER_ROLE.basicUser

  try {
    if (!store.getters.serverType) {
      await store.dispatch('user/getServerType')
    }
    // Determine if it is SSO certified
    if (store.getters.authType === AUTH_TYPE.SSO && to.path !== 'login') {
      if (!isLogin || (isLogin && store.getters.initWeb)) {
        // check user is login
        await store.dispatch('user/isAuthenticated')
        await siteSession()
        isLogin = getIsLogin() ? JSON.parse(getIsLogin()) : false
        store.commit('user/SET_INITWEB', false)
      }
    }
  } catch (e) {
    console.log(e)
  }

  if (isLogin) {
    if (to.path === '/login') {
      store.dispatch('user/clearInterval')
      next()
    } else {
      // Set regular refresh cookie and obtain authentication mode
      if (!store.getters.resetSession) {
        await store.dispatch('user/setResetSession')
      }
      // determine whether the user has obtained his permission roles through getInfo
      if (store.getters.roleId && store.getters.addRoutes.length > 0) {
        if (store.getters.isPageChanged) {
          Vue.prototype.$mfConfirm({
            title: i18n.t('confirm'),
            message: i18n.t('changePageConfirm'),
            cancelText: i18n.t('Cancel'),
            confirmText: i18n.t('OK'),
            onConfirm: async() => {
              // await store.dispatch('pageChange/runSave')
              store.dispatch('pageChange/resetPageChanged')
              next()
            }
          })
        } else {
          next()
        }
      } else {
        try {
          const role = await store.dispatch('user/getRole')
          const deniedFeature = await store.dispatch('user/getDeniedFeature')
          // add router to vuex
          const accessRoutes = await store.dispatch('permission/generateRoutes', { permission: role.permission || [], deniedFeature: deniedFeature || [] })
          let path = to.path
          router.addRoutes(accessRoutes)

          if (accessRoutes.length > 1) {
            path = accessRoutes[0].children[0].path
          } else if (accessRoutes.length === 1) {
            next('mySettings')
            return
          }

          next({ ...{ to, path }, replace: true })
        } catch (error) {
          console.log(error)
          store.dispatch('user/clearInterval')
          store.dispatch('user/clearLoginStatus')
          next('/login')
        }
      }
    }
  } else {
    store.dispatch('pageChange/resetPageChanged')
    if (whiteList.indexOf(to.path) !== -1) {
      next() // in the free login whitelist, go directly
    } else if (from.path !== '/login') {
      next('/login')
    }
  }
})

router.onError(() => {
  // sso logout may cause request static file failed then router error, redirect to the login page
  if (store.getters.authType === AUTH_TYPE.SSO) {
    window.location.href = window.location.protocol + '//' + window.location.host + '/qcbin/'
  }
})
