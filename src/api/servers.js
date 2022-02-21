import request from '@/utils/request'
import requestNoMessage from '@/utils/packageRequest'
import { addSingleQuotesForParam } from '@/utils'

export function getAllDbServers(params) {
  const query = params ? `?query=${addSingleQuotesForParam(params)}` : ''
  return request({
    url: `/v2/sa/api/db-servers${query}`,
    method: 'get'
  })
}

export function getAllDbServersWithoutMessage(params) {
  const query = params ? `?query=${addSingleQuotesForParam(params)}` : ''
  return requestNoMessage({
    url: `/v2/sa/api/db-servers${query}`,
    method: 'get'
  })
}

export function getDbServerDetail(id) {
  return request({
    url: `/v2/sa/api/db-servers/${id}`,
    method: 'get'
  })
}

export function pingDb(id, data) {
  return request({
    url: `/v2/sa/api/db-servers/${id}/ping`,
    method: 'post',
    data: { 'db-server': data }
  })
}

export function updateDbServerDetail(id, data) {
  return request({
    url: `/v2/sa/api/db-servers/${id}`,
    method: 'put',
    data: { 'db-server': data }
  })
}

export function deleteDbServer(id) {
  return request({
    url: `/v2/sa/api/db-servers/${id}`,
    method: 'delete'
  })
}

export function getSupportedSearchLanguage(id) {
  return request({
    url: `/v2/sa/api/db-servers/${id}/search-languages`,
    method: 'get'
  })
}

export function createDBServer(data) {
  return request({
    url: '/v2/sa/api/db-servers',
    method: 'post',
    data: { 'db-server': data }
    // data
  })
}

export function getTableSpaces(id) {
  return request({
    url: `/v2/sa/api/db-servers/${id}/tablespaces`,
    method: 'get'
  })
}

export function getProjects(id) {
  return request({
    url: `/v2/sa/api/db-servers/${id}/projects`,
    method: 'get'
  })
}

/** app servers */
export function getAllAppServers() {
  return request({
    method: 'get',
    url: `/v2/sa/api/servers`
  })
}

export function getAppServer(serverId) {
  return request({
    method: 'get',
    url: `/v2/sa/api/servers/${serverId}`
  })
}

export function updateAppServer(serverId, data) {
  return request({
    method: 'put',
    url: `/v2/sa/api/servers/${serverId}`,
    data: { server: data }
  })
}

export function deleteAppServer(serverId) {
  return request({
    method: 'delete',
    url: `/v2/sa/api/servers/${serverId}`
  })
}
/** app servers */
