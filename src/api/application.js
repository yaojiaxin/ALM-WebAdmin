import request from '@/utils/request'

export function getSiteVersion() {
  return request({
    url: '/v2/sa/api/site-version',
    method: 'get'
  })
}

export function getExtensions() {
  return request({
    url: '/v2/sa/api/extensions',
    method: 'get'
  })
}
