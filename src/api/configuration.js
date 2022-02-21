import request from '@/utils/request'
import requestNoMessage from '@/utils/packageRequest'
import { urlEncode } from '@/utils'

export function getConfigurationParameter() {
  return request({
    url: '/v2/sa/api/site-params',
    method: 'get'
  })
}

export function getParameterByParamName(name) {
  return request({
    url: '/v2/sa/api/site-params/' + urlEncode(name),
    method: 'get'
  })
}
export function getParameterByParamNameRequestNoMessage(name) {
  return requestNoMessage({
    url: '/v2/sa/api/site-params/' + urlEncode(name),
    method: 'get'
  })
}
export function getMailSetting() {
  return request({
    url: '/v2/sa/api/mails/settings',
    method: 'get'
  })
}

export function addConfigurationParameter(data) {
  return request({
    url: '/v2/sa/api/site-params',
    method: 'post',
    data
  })
}
export function deleteConfigurationParameter(data) {
  return request({
    url: '/v2/sa/api/site-params/' + urlEncode(data.name),
    method: 'delete'
  })
}

export function editConfigurationParameter(data, name) {
  return request({
    url: '/v2/sa/api/site-params/' + urlEncode(name),
    method: 'put',
    data
  })
}

export function editMailSetting(data) {
  return request({
    url: '/v2/sa/api/mails/settings/',
    method: 'put',
    data,
    headers: {
      Ptal: 'webadmin'
    }
  })
}

export function editMailSettingDiscover(data) {
  return requestNoMessage({
    url: '/v2/sa/api/mails/discover/',
    method: 'post',
    data
  })
}

export function almCollect(param) {
  return request({
    url: `/v2/sa/api/collectors/advisor-collector/execute?de-identification=${urlEncode(param)}`,
    method: 'post'
  })
}

