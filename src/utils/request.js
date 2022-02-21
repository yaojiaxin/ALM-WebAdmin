import axios from 'axios'
// import { message } from 'ant-design-vue'
// import message from '@/components/MFMessage'
import store from '@/store'
import router from '@/router'
import { SERVER_TYPE, AUTH_TYPE } from '@/store/const'
import { getIsLogin } from '@/utils/auth'
import { errorMessage } from '@/utils'
import { getSiteSession } from '@/api/common.js'

const baseUrl = process.env.VUE_APP_API_BASE_URL || ''
// create an axios instance
const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  baseURL: `/qcbin${baseUrl}`
  // withCredentials: true, // send cookies when cross-domain requests
})

export function requestSuccess(config) {
  const isLogin = getIsLogin()
  if (isLogin) {
    // set headers
    // config.headers['ALM-CLIENT-TYPE'] = 'WebAdmin'
    if (store.getters.serverType === SERVER_TYPE.Saas) {
      if (!config.headers['has-customer']) {
        config.headers['customer-id'] = store.getters.activeCustomerId || store.getters.customerId
      }
    }
  }
  return config
}

// request interceptor
service.interceptors.request.use(requestSuccess,
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
     * If you want to get http information such as headers or status
     * Please return  response => response
     */

  async(response) => {
    if (store.getters.authType === AUTH_TYPE.SSO && getIsLogin() && response.status === 200 && typeof (response.data) === 'string' && response.config.url.indexOf('/rest/site-session') === -1) {
      await getSiteSession().then(data => {
        if (data !== '') {
          window.location.href = window.location.protocol + '//' + window.location.host + '/qcbin/'
        }
      }).catch(() => {})
    }
    const contentType = response.headers['content-type']
    if (response.config.responseType === 'blob' || (contentType && contentType.indexOf('application/octet-stream') > -1)) {
      return response
    } else {
      return response.data
    }
  },
  error => {
    const resStatus = error.response.status
    const resData = error.response && error.response.data

    if (resData) {
      if (resStatus === 401) {
        if (router.history.current.path !== '/login') {
          if (store.getters.authType === AUTH_TYPE.SSO) {
            window.location.href = window.location.protocol + '//' + window.location.host + '/qcbin/'
          } else {
            router.push('/login')
          }
          store.dispatch('user/clearLoginStatus')
        } else {
          return Promise.reject(error)
        }
      } else {
        if (resData.QCRestException) {
          errorMessage(resData.QCRestException.Title, resData.QCRestException.StackTrace)
          return Promise.reject(resData.QCRestException.Title)
        }
      }
    } else {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        QCRestException: {
          Title: 'Timeout'
        }
      })
    }

    // console.log('err' + error) // for debug
    return Promise.reject(error)
  }
)

export default service
