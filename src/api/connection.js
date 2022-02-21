import request from '@/utils/request'
import { urlEncode } from '@/utils'

export function sendActionEmails(param, data) {
  return request({
    url: `/v2/sa/api/site-connections/send-message?query={${urlEncode(param)}}`,
    method: 'post',
    data
  })
}

export function groupBySessions(group) {
  return request({
    url: `/v2/sa/api/site-connections/groups/${urlEncode(group)}`,
    method: 'get'
  })
}

export function getAllSessions(startIndex, pageSize, params, sort, sortColumnKey) {
  const query = []

  for (const key in params) {
    if (key === 'host' || key === 'client-type' || key === 'username') {
      query.push(`login-session.${key}['${params[key]}']`)
    } else {
      query.push(`${key}['${params[key]}']`)
    }
  }
  return request({
    url: `/v2/sa/api/site-connections?start-index=${urlEncode(startIndex)}&page-size=${urlEncode(pageSize)}`,
    method: 'get',
    params: {
      query: `{${query.join(';')}}`,
      'order-by': sort ? `{${sortColumnKey}[${sort}]}` : undefined
    }
  })
}

export function getGroupSessions(data) {
  let param = ''
  data.group === 'user' ? param = 'login-session.username' : param = 'project'
  return request({
    // url: `/v2/sa/api/site-connections?extra-field=group&${urlEncode(data.group)}=${urlEncode(data.value)}`,
    url: `/v2/sa/api/site-connections?start-index=1&page-size=max&query={${param}['${urlEncode(data.value)}']}`,
    method: 'get'
  })
}

export function disconnectSessions(data) {
  return request({
    url: `/v2/sa/api/site-connections?query={${urlEncode(data)}}`,
    method: 'delete'
  })
}

export function getAllLicenses() {
  return request({
    url: '/v2/sa/api/license',
    method: 'get'
  })
}
