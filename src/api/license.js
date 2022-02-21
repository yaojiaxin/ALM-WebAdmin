import request from '@/utils/request'
import { urlEncode } from '@/utils'

export function getLicenseUsage(resolve, param) {
  const url = `/v2/sa/api/license/usage?resolution=${urlEncode(resolve)}&query={start-date[${urlEncode(param.startDate)}];end-date[${urlEncode(param.endDate)}];project[${urlEncode(param.project)}];username[${urlEncode(param.username === '' ? param.username : "'" + param.username + "'")}]}`
  return request({
    url: url,
    method: 'get'
  })
}

export function getLicenseUsageSaas(resolve, param) {
  const url = `/v2/sa/api/license/usage?resolution=${urlEncode(resolve)}&query={start-date[${urlEncode(param.startDate)}];end-date[${urlEncode(param.endDate)}];customer-id[${urlEncode(param.customer)}]}`
  return request({
    url: url,
    method: 'get'
  })
}

export function getLicensesUsageExport(resolve, param, type) {
  return request({
    url: `/v2/sa/api/license/usage/export?resolution=${urlEncode(resolve)}&query={start-date[${urlEncode(param.startDate)}];end-date[${urlEncode(param.endDate)}];customer-id[${urlEncode(param.customer)}]}`,
    method: 'get',
    responseType: type === 'multipart/form-data' || type === 'text/csv' ? 'blob' : '', // excel use binary stream
    headers: {
      'Content-Type': type
    },
    data: {}
  })
}

export function getAllLicenses() {
  return request({
    url: '/v2/sa/api/license',
    method: 'get'
  })
}

// http://localhost:8081/qcbin/v2/sa/api/license?query={is-assignable[Y]}
export function getAllLicensesType(data) {
  return request({
    url: `/v2/sa/api/license?query={${urlEncode(data)}}`,
    method: 'get'
  })
}

export function getLicensesStatus() {
  return request({
    url: '/v2/sa/api/license/status',
    method: 'get'
  })
}

export function getLicensesAssignments() {
  return request({
    url: '/v2/sa/api/license/assignments',
    method: 'get'
  })
}

export function putLicensesAssignments(data) {
  return request({
    url: '/v2/sa/api/license/assignments',
    method: 'put',
    data
  })
}

export function getLicensesQuotas(data) {
  if (data) {
    return request({
      url: `/v2/sa/api/license/quotas?type=${urlEncode(data.type)}&expiry=${urlEncode(data.expiry)}`,
      method: 'get'
    })
  } else {
    return request({
      url: '/v2/sa/api/license/quotas',
      method: 'get'
    })
  }
}

export function updateLicensesQuotas(param, data) {
  return request({
    url: `/v2/sa/api/license/quotas?type=${urlEncode(param.type)}&expiry=${urlEncode(param.expiry)}`,
    method: 'put',
    data
  })
}

export function postLicenses(data) {
  const formData = new FormData()
  for (const key in data) {
    formData.append(key, data[key])
  }
  return request({
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    url: '/v2/sa/api/license/datastore',
    method: 'post',
    data: formData
  })
}

export function deleteLicenses() {
  return request({
    url: '/v2/sa/api/license/datastore',
    method: 'delete'
  })
}

export function putLicenses(data) {
  return request({
    url: '/v2/sa/api/license/datastore',
    method: 'put',
    data
  })
}

