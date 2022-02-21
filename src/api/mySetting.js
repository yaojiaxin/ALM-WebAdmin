import request from '@/utils/request'
import requestNoMessage from '@/utils/packageRequest'
import store from '@/store'

export function getResources() {
  return request({
    url: '/v2/sa/api/user-profile',
    method: 'get',
    headers: {
      'has-customer': true,
      'customer-id': store.getters.customerId
    }
  })
}

export function putResources(data) {
  return requestNoMessage({
    url: '/v2/sa/api/user-profile',
    method: 'put',
    data
  })
}
