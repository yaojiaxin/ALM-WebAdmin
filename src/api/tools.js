import request from '@/utils/request'

/** Quality Insight */
export function getQualityInsightSettings() {
  return request({
    url: '/v2/sa/api/quality-insight',
    method: 'get'
  })
}

export function updateQualityInsightSettings(data) {
  return request({
    url: '/v2/sa/api/quality-insight',
    method: 'put',
    data: { 'quality-insight': data }
  })
}

export function testQISearchServerConnection(data) {
  return request({
    url: '/v2/sa/api/quality-insight/test-connection',
    method: 'post',
    data: { 'quality-insight': data }
  })
}
/** Quality Insight */

export function getProjectUpgradePriorities() {
  return request({
    url: '/v2/sa/api/project-upgrade-priorities',
    method: 'get',
    headers: {
      'customer-id': 0,
      'has-customer': true
    }
  })
}

export function putProjectUpgradePriorities(data) {
  return request({
    url: '/v2/sa/api/project-upgrade-priorities',
    method: 'put',
    data
  })
}

export function testTypeService() {
  return request({
    url: '/v2/sa/api/services/custom-test-types-service',
    method: 'put'
  })
}

export function getCollectors(data) {
  const requestData = {
    url: '/v2/sa/api/collectors/server-collector/execute',
    method: 'post',
    data
  }
  if (data === null) delete requestData.data
  return request(requestData)
}

/** Project Planning and Tracking */
export function getQPMSettings() {
  return request({
    url: '/v2/sa/api/qpm-settings',
    method: 'get'
  })
}

export function getQPMStatus() {
  return request({
    url: '/v2/sa/api/qpm-status',
    method: 'get'
  })
}

export function updateQPMSettings(data) {
  return request({
    url: '/v2/sa/api/qpm-settings',
    method: 'put',
    data: { 'qpm-settings': data }
  })
}
/** Project Planning and Tracking */
