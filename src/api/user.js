import request from '@/utils/request'
import { urlEncode, addSingleQuotesForParam } from '@/utils'
import requestNoMessage from '@/utils/packageRequest'

const COLLECTION = 'application/json-collection'

// users
export function fetchUsersList(startIndex, pageSize, params, isTransfer = false, sort) {
  if (isTransfer) {
    params = params ? `{name[*${params}*]}` : undefined
  }

  // when params is like {name[a b]}, help it add single quotes that it can be {name['a b']}
  params = addSingleQuotesForParam(
    params,
    (query) => query.split('[')[0].replace(/{/, '') === 'usse.is-locked' ? query : null
  )

  return request({
    url: `/v2/sa/api/site-users?start-index=${urlEncode(startIndex)}&page-size=${urlEncode(pageSize)}`,
    // url: '/v2/sa/api/site-users',
    method: 'get',
    params: {
      query: params,
      'order-by': sort ? `{name[${sort}]}` : undefined
    }
  })
}

// users-tool
export function fetchUsersListAll(userName) {
  return requestNoMessage({
    url: '/v2/sa/api/site-users',
    method: 'get'
  })
}

// users-tool
export function deleteUsers(userName) {
  return requestNoMessage({
    url: '/v2/sa/api/site-users/' + urlEncode(userName),
    method: 'delete'
  })
}

export function activeUsers(data) {
  return requestNoMessage({
    url: `/v2/sa/api/site-users/${urlEncode(data.name)}/activate`,
    method: 'PUT',
    data
  })
}

export function deActiveUsers(data) {
  return requestNoMessage({
    url: `/v2/sa/api/site-users/${urlEncode(data.name)}/deactivate`,
    method: 'PUT',
    data
  })
}

export function resetPassWord(data) {
  return requestNoMessage({
    url: `/v2/sa/api/site-users/${urlEncode(data.name)}/password`,
    method: 'PUT',
    data
  })
}

export function addUser(data) {
  return request({
    url: '/v2/sa/api/site-users',
    method: 'post',
    data
  })
}

export function getUser(name) {
  return request({
    url: `/v2/sa/api/site-users/${urlEncode(name)}`,
    method: 'get'
  })
}

export function editUser(data) {
  return request({
    url: `/v2/sa/api/site-users/${urlEncode(data.user.name)}`,
    method: 'put',
    data
  })
}

export function editUserNoMessage(data) {
  return requestNoMessage({
    url: `/v2/sa/api/site-users/${urlEncode(data.user.name)}`,
    method: 'put',
    data
  })
}

export function getUserProject(userName) {
  return request({
    url: `/v2/sa/api/site-users/${urlEncode(userName)}/projects`,
    method: 'get'
  })
}

export function deleteUserProject(data) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(data['domain-name'])}/projects/${urlEncode(data.name)}/users/${urlEncode(data.user)}`,
    method: 'delete',
    headers: {
      'customer-id': data['customer-id'],
      'has-customer': true
    }
  })
}

export function testMock(data) {
  return request({
    url: '/user/test/mock',
    method: 'post'
  })
}

export function uploadCsv(data) {
  const formData = new FormData()
  for (const key in data) {
    formData.append(key, data[key])
  }
  return requestNoMessage({
    // transformRequest: [function() {
    //   return data
    // }],
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    url: '/v2/sa/api/site-users',
    method: 'post',
    data: formData
  })
}

export function addUserProject(params, data) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(params.domain)}/projects/${urlEncode(params.project)}/users`,
    method: 'post',
    data,
    headers: {
      'Content-Type': COLLECTION
    }
  })
}

export function addUserProjectNoMsg(params, data) {
  return requestNoMessage({
    url: `/v2/sa/api/domains/${urlEncode(params.domain)}/projects/${urlEncode(params.project)}/users`,
    method: 'post',
    data,
    headers: {
      'Content-Type': COLLECTION
    }
  })
}

export function userUnlock(data) {
  return requestNoMessage({
    url: `/v2/sa/api/site-users/${urlEncode(data.name)}/unlock`,
    method: 'put'
  })
}

export function userLock(data) {
  return requestNoMessage({
    url: `/v2/sa/api/site-users/${urlEncode(data.name)}/lock`,
    method: 'put'
  })
}

export function downloadTemplate() {
  return request({
    url: '/v2/sa/api/site-users/download-template',
    method: 'get',
    responseType: 'blob'
  })
}

export function exportAlltUsers() {
  return request({
    url: '/v2/sa/api/site-users/export',
    method: 'get',
    responseType: 'blob'
  })
}

export function getAuthenticationSettings() {
  return request({
    url: '/v2/sa/api/authentication-settings',
    method: 'get'
  })
}

export function updateAuthenticationSettings(data) {
  return request({
    url: '/v2/sa/api/authentication-settings',
    method: 'put',
    data: { 'authentication-settings': data }
  })
}

export function getUserName() {
  return request({
    url: '/rest/is-authenticated',
    method: 'get'
  })
}

export function getOrphanUsers(params) {
  return request({
    url: '/v2/sa/api/orphan-users',
    method: 'get',
    params
  })
}

export function getOrphanProjects(data) {
  return request({
    url: `/v2/sa/api/orphan-users/${urlEncode(data)}/projects`,
    method: 'get'
  })
}

export function updateOrphanUsers(data) {
  return request({
    url: `/v2/sa/api/orphan-users`,
    method: 'put',
    data
  })
}

export function updateMoveUsers(id, data) {
  return requestNoMessage({
    url: `/v2/sa/api/customers/${urlEncode(id)}/users`,
    method: 'put',
    data
  })
}

export function getAllLDAP() {
  return request({
    url: `/v2/sa/api/ldap-servers`,
    method: 'get'
  })
}
export function getLDAPById(id) {
  return request({
    url: `/v2/sa/api/ldap-servers/${urlEncode(id)}`,
    method: 'get'
  })
}

export function postLDAP(data) {
  return request({
    url: `/v2/sa/api/ldap-servers`,
    method: 'post',
    data
  })
}

export function putLDAPById(data, id) {
  return request({
    url: `/v2/sa/api/ldap-servers/${urlEncode(id)}`,
    method: 'put',
    data
  })
}

export function deleteLDAPById(id) {
  return request({
    url: `/v2/sa/api/ldap-servers/${urlEncode(id)}`,
    method: 'delete'
  })
}

export function getLDAPUserById(id, query, mode) {
  return request({
    url: `/v2/sa/api/ldap-servers/${urlEncode(id)}/ldap-users`,
    method: 'get',
    params: {
      'keep-hierarchical': mode === 'tree',
      query: query
    }
  })
}

export function testLdap(id, data) {
  return request({
    url: `/v2/sa/api/ldap-servers/${urlEncode(id)}/ping`,
    method: 'post',
    data
  })
}

export function importLDAP(data) {
  return requestNoMessage({
    url: '/v2/sa/api/site-users',
    method: 'post',
    headers: {
      'Content-Type': COLLECTION
    },
    data
  })
}

export function updateLDAP(data) {
  return requestNoMessage({
    url: '/v2/sa/api/site-users',
    method: 'put',
    headers: {
      'Content-Type': COLLECTION
    },
    data
  })
}
