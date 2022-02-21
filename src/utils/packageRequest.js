import axios from 'axios'
import router from '@/router'
import store from '@/store'
import { requestSuccess } from './request'
import { AUTH_TYPE } from '@/store/const'
import { getIsLogin } from '@/utils/auth'
import { getSiteSession } from '@/api/common.js'

const baseUrl = process.env.VUE_APP_API_BASE_URL || ''
// create an axios instance
const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  baseURL: `/qcbin${baseUrl}`
  // withCredentials: true, // send cookies when cross-domain requests
})

// request interceptor
service.interceptors.request.use(requestSuccess,
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  /**
     * If you want to get http information such as headers or status
     * Please return  response => response
     */

  async(response) => {
    if (getIsLogin() && store.getters.authType === AUTH_TYPE.SSO && response.status === 200 && typeof (response.data) === 'string' && response.config.url.indexOf('/rest/site-session') === -1) {
      await getSiteSession().then(data => {
        if (data !== '') {
          window.location.href = window.location.protocol + '//' + window.location.host + '/qcbin/'
        }
      }).catch(() => {})
    }
    return response.data
  },
  error => {
    const resStatus = error.response.status

    if (resStatus === 401) {
      if (store.getters.authType === AUTH_TYPE.SSO) {
        window.location.href = window.location.protocol + '//' + window.location.host + '/qcbin/'
      } else {
        router.push('/login')
      }
      store.dispath('user/clearLoginStatus')
    }
    return Promise.reject(error)
  }
)

export default service

export const batchRequest = (params, funcs, successMessage = 'success') => {
  const batchPromise = params.map((item, index) => {
    return funcs(item, index).then(_ => {
      return Promise.resolve({
        key: index,
        name: item.name,
        status: true,
        message: successMessage
      })
    }).catch(e => {
      if (e.response.data) {
        return Promise.resolve({
          key: index,
          name: item.name,
          status: false,
          message: e.response.data.QCRestException.Title
        })
      } else {
        return Promise.resolve({
          key: index,
          name: item.name,
          status: false,
          message: ''
        })
      }
    })
  })

  return Promise.all(batchPromise)
}
