import request from '@/utils/request'
import { urlEncode } from '@/utils'
// test git yes
export function getAllPolicies() {
  return request({
    url: '/v2/sa/api/policies',
    method: 'get'
  })
}

export function getOnePolicy(policyId) {
  return request({
    url: '/v2/sa/api/policies/' + urlEncode(policyId),
    method: 'get'
  })
}

export function createNewPolicy(data) {
  return request({
    url: '/v2/sa/api/policies',
    method: 'post',
    data
  })
}

export function deletePolicy(policyId) {
  return request({
    url: '/v2/sa/api/policies/' + urlEncode(policyId),
    method: 'delete'
  })
}

export function getAllValidators() {
  return request({
    url: '/v2/sa/api/password-validators',
    method: 'get'
  })
}

// export function updatePolicy(data) {
//   return request({
//     url: '/v2/sa/api/policies/',
//     method: 'put',
//     data
//   })
// }

export function updateAPolicy(data) {
  return request({
    url: '/v2/sa/api/policies/' + urlEncode(data.policy['policy-id']),
    method: 'put',
    data
  })
}

export function assignPolicy(data) {
  return request({
    url: '/v2/sa/api/site-users/policy',
    method: 'put',
    data
  })
}
