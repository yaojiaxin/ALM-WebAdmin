import request from '@/utils/request'
import { urlEncode } from '@/utils'

// Get permissions metadata.
export function getPermissionMeta() {
  return request({
    url: `/v2/sa/api/permissions/metadata`,
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: `/v2/sa/api/roles`,
    method: 'post',
    data: { role: data }
  })
}

export function copyRole(data) {
  return request({
    url: `/v2/sa/api/roles/${urlEncode(data.copyId)}/copy`,
    method: 'post',
    data: { role: data.role }
  })
}

export function updateRole(data) {
  return request({
    url: `/v2/sa/api/roles/${data['role-id']}`,
    method: 'put',
    data: { role: data }
  })
}

export function getRoles(params) {
  return request({
    url: `/v2/sa/api/roles`,
    method: 'get',
    params
  })
}

export function getRoleDetail(roleId) {
  return request({
    url: `/v2/sa/api/roles/${urlEncode(roleId)}`,
    method: 'get'
  })
}

export function deleteRole(roleId) {
  return request({
    url: `/v2/sa/api/roles/${urlEncode(roleId)}`,
    method: 'delete'
  })
}
