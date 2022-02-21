import request from '@/utils/request'
import requestNoMessage from '@/utils/packageRequest'
import { urlEncode, addSingleQuotesForParam } from '@/utils'
import { isSiteAdmin } from '@/utils/permission'

const COLLECTION = 'application/json-collection'

// get a project
export function getProjectDetail(params, hasCustomer) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(params.domain)}/projects/${urlEncode(params.project)}`,
    method: 'get',
    params: { 'extra-fields': `quality-insight-status${isSiteAdmin() ? ',maintenance-state' : ''}` },
    headers: {
      'has-customer': hasCustomer,
      'customer-id': 0
    }
  })
}

export function getAllDomains() {
  return request({
    url: '/v2/sa/api/domains',
    method: 'get'
  })
}

export function getProjectsLimit() {
  return requestNoMessage({
    url: '/v2/sa/api/projects/pre-check',
    method: 'post'
  })
}

export function getDomain(domain) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}`,
    method: 'get'
  })
}

export function updateDomain(domain, data) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}`,
    method: 'put',
    data: { domain: data }
  })
}

export function getProjectsInDomains(domain) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects`,
    method: 'get'
  })
}

export function getLabProject() {
  return requestNoMessage({
    url: `/v2/sa/api/domains/DEFAULT/projects`,
    method: 'get'
  })
}

export function createProjectDomain(param) {
  return request({
    url: '/v2/sa/api/domains',
    method: 'post',
    data: param
  })
}

export function deleteProjectDomain(domain) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}`,
    method: 'delete'
  })
}

export function deleteProject({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}`,
    method: 'delete'
  })
}

export function activeProject({ domain, project }, hasCustomer) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/activate`,
    method: 'put',
    headers: {
      'has-customer': hasCustomer,
      'customer-id': 0
    }
  })
}

export function deActiveProject({ domain, project }, hasCustomer) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/deactivate`,
    method: 'put',
    headers: {
      'has-customer': hasCustomer,
      'customer-id': 0
    }
  })
}

// Update a project
export function updateProject({ domain, project, data }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}`,
    method: 'put',
    data: { project: data }
  })
}

export function getAllUsersInProject({ domain, project, params }, startIndex, pageSize, sort, isFilterAdmin) {
  const users = isFilterAdmin ? 'admin-users' : 'users'

  params = addSingleQuotesForParam(params)

  if (startIndex && pageSize) {
    return request({
      url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/${users}?start-index=${urlEncode(startIndex)}&page-size=${urlEncode(pageSize)}`,
      method: 'get',
      params: {
        'extra-fields': 'group',
        query: params,
        'order-by': sort.order ? `{${sort.field}[${sort.order}]}` : undefined

      }
    })
  } else {
    return request({
      url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/${users}`,
      method: 'get',
      params: {
        'extra-fields': 'group',
        query: params,
        'order-by': sort && sort.order ? `{${sort.field}[${sort.order}]}` : undefined
      }
    })
  }
}

// Returns a list of all the extensions in ALM
export function getSiteExtensions() {
  return request({
    url: `/v2/sa/api/extensions`,
    method: 'get'
  })
}

// Returns the list of enabled extensions of the specified project.
export function getExtensionsInProject({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/extensions`,
    method: 'get'
  })
}

// Enables an extension for the specified project
export function EnableExtension(data) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(data.domain)}/projects/${urlEncode(data.project)}/extensions`,
    method: 'post',
    data: data.extension,
    params: { 'is-async-mode': true },
    headers: {
      'Content-Type': COLLECTION
    }
  })
}

export function restoreProject(data, form) {
  return requestNoMessage({
    url: `/v2/sa/api/domains/${urlEncode(form.domain)}/projects/restore`,
    method: 'post',
    data
  })
}

// get project groups
export function getProjectGroups({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/groups`,
    method: 'get'
  })
}

export function updateUserGroups({ domain, project, user, groups }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/users/${urlEncode(user)}/groups`,
    method: 'put',
    data: { groups: { group: groups }}
  })
}

export function updateUserGroupsMsg({ domain, project, user, groups }) {
  return requestNoMessage({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/users/${urlEncode(user)}/groups`,
    method: 'put',
    data: { groups: { group: groups }}
  })
}

export function getUserGroupsInProject({ domain, project, user }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/users/${urlEncode(user)}/groups`,
    method: 'get'
  })
}

export function deleteUserProject({ domain, project, user }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/users`,
    method: 'delete',
    data: { users: { user: user }}
  })
}

export function CreateEmptyProject({ data, domain }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects`,
    method: 'post',
    data: {
      'create-project': data
    }
  })
}

export function getAProject({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}`,
    method: 'get'
  })
}

export function createImportQCPProject({ domain, data }) {
  const formData = new FormData()
  for (const key in data) {
    if (data[key]) {
      formData.append(key, data[key])
    }
  }
  return requestNoMessage({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/import`,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
}

export function getAllDBServers() {
  return request({
    url: `/v2/sa/api/db-servers`,
    method: 'get'
  })
}

export function getDBServersInfo(id) {
  return request({
    url: `/v2/sa/api/db-servers/${urlEncode(id)}`,
    method: 'get'
  })
}

export function getTableSpaces(id, data) {
  return request({
    url: `/v2/sa/api/db-servers/${urlEncode(id)}/collect-tablespace-info`,
    method: 'post',
    data: {
      'db-server': data || {}
    }
  })
}

export function updateProjectName({ domain, project, newName }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}`,
    method: 'put',
    data: {
      project: {
        name: newName
      }
    }
  })
}

export function exportProject({ domain, project, isOriginActive }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/export`,
    method: 'post',
    data: {
      'create-project': {
        'is-async-mode': true,
        'is-origin-active': isOriginActive
      }
    }
    // responseType: 'blob'
  })
}

// Remove a project
export function removetProject({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/remove`,
    method: 'delete'
  })
}

export function getLinkedProject(params) {
  const query = []

  for (const key in params) {
    query.push(`${key}[${params[key]}]`)
  }
  return request({
    url: `/v2/sa/api/project-links`,
    method: 'get',
    params: {
      query: `{${query.join(';')}}`
    }
  })
}

export function addLinkedProject(data) {
  return request({
    url: `/v2/sa/api/project-links`,
    method: 'post',
    data,
    headers: {
      Accept: '*/*'
    }
  })
}

export function removeLinkedProject(data) {
  return request({
    url: `/v2/sa/api/project-links`,
    method: 'delete',
    data
  })
}

export function enableVersioning({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/enable-versioning`,
    method: 'put'
  })
}

export function disableVersioning({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/disable-versioning`,
    method: 'put'
  })
}

export function pingProject({ domain, project }, data) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/ping`,
    method: 'post',
    data
  })
}

export function getCopyOptions({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/copy-options`,
    method: 'get'
  })
}

export function getTables({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/tables`,
    method: 'get'
  })
}

export function runQuery({ domain, project, data }, pageSize = null) {
  const url = pageSize !== null ? `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/run-query/?page-size=${pageSize}` : `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/run-query`
  return request({
    url: url,
    method: 'post',
    data
  })
}

export function runQueryExport({ domain, project, data }) {
  const url = `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/run-query/export`
  return request({
    url: url,
    method: 'post',
    responseType: 'blob',
    data
  })
}

export function getDomainLicense(domain) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/licenses`,
    method: 'get'
  })
}

export function enableQualityInsight(domain, project) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/enable-quality-insight`,
    method: 'put'
  })
}

export function disableQualityInsight(domain, project) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/disable-quality-insight`,
    method: 'put'
  })
}

export function batchRemoveUsers({ domain, project, users }) {
  return request({
    url: `/v2/sa/api/domains/${domain}/projects/${project}/users`,
    method: 'delete',
    data: users
  })
}

export function addUserToTDADMINGroup({ domain, project, data }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/admin-users`,
    method: 'post',
    data
  })
}

export function moveToNewDomain({ domain, project, data }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/move`,
    method: 'post',
    data
  })
}

export function updateDomainLicense(domain, data) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/licenses`,
    method: 'put',
    data: {
      license: {
        'license-statuses': {
          'license-status': data
        }
      }
    }
  })
}

export function getUsersNotInProject(projectId, { startIndex, pageSize, name }) {
  const query = `{users-projects.project-id[${projectId}];users-projects.inclusive-filter[false]}`

  return request({
    url: `/v2/sa/api/site-users`,
    method: 'get',
    params: {
      'start-index': startIndex,
      'page-size': pageSize,
      query: name ? `{users-projects.project-id[${projectId}];users-projects.inclusive-filter[false];name['*${name}*']}` : query
    }
  })
}

export function promoteRepoGc({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/promote-repo-gc`,
    method: 'post'
  })
}

export function postponeRepoGc({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/postpone-repo-gc`,
    method: 'post'
  })
}

export function rebuildTextSearch({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/rebuild-text-index`,
    method: 'post'
  })
}

export function upgrade({ domain, project, data }) {
  return requestNoMessage({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/maintenance/upgrade`,
    method: 'post',
    data
  })
}

export function getTaskStatus({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/maintenance/read-status`,
    method: 'get'
  })
}

export function pause({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/maintenance/pause`,
    method: 'post'
  })
}

export function resume({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/maintenance/resume`,
    method: 'post'
  })
}

export function abort({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/maintenance/abort`,
    method: 'post'
  })
}

export function verify({ domain, project, data }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/maintenance/verify`,
    method: 'post',
    data
  })
  // verify-mode: only for verify; verify-mode:deep
}

export function repair({ domain, project, data }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/maintenance/repair`,
    method: 'post',
    data
  })
}

export function unicode({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/maintenance/convert-to-unicode`,
    method: 'post'
  })
}

export function align({ domain, project, data }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/maintenance/align`,
    method: 'post',
    data
  })
}

export function autoMail(data) {
  return request({
    url: `/v2/sa/api/mails/auto-mail`,
    method: 'post',
    data: { project: data }
  })
}

export function getSearchLanguage({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/search-languages`,
    method: 'get'
  })
}

export function runNow({ domain, project }) {
  return request({
    url: `/v2/sa/api/domains/${urlEncode(domain)}/projects/${urlEncode(project)}/calculate-qpm-now`,
    method: 'post'
  })
}
