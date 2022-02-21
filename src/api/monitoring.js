import request from '@/utils/request'
import { urlEncode } from '@/utils'

export function getAuditsExport(params, sort, sortColumnKey) {
  return request({
    url: '/v2/sa/api/audits/export',
    method: 'get',
    params: {
      query: params,
      'order-by': sort ? `{${sortColumnKey}[${sort}]}` : undefined
    },
    responseType: 'blob'
  })
}

export function getAudits(startIndex, pageSize, params, sort, sortColumnKey) {
  return request({
    url: `/v2/sa/api/audits?start-index=${urlEncode(startIndex)}&page-size=${urlEncode(pageSize)}`,
    method: 'get',
    params: {
      query: params,
      'order-by': sort ? `{${sortColumnKey}[${sort}]}` : undefined
    }
  })
}

export function getDropdownFilterData() {
  return request({
    url: `/v2/sa/api/audits/metadata`,
    method: 'get'
  })
}
