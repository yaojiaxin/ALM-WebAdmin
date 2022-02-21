import request from '@/utils/request'
import { urlEncode } from '@/utils'

export function getLastEventLogs() {
  return request({
    url: '/v2/sa/api/event-logs/last',
    method: 'get'
  })
}

export function downloadLogs({ domain, project, task }) {
  return request({
    url: `/v2/sa/api/domains/${domain}/projects/${urlEncode(project)}/maintenance-logs/project-${urlEncode(task)}`,
    method: 'get',
    responseType: 'blob'
  })
}

export function downloadProjectFile({ domain, project, filename, deleteFromServer = true }) {
  return request({
    url: `/v2/sa/api/domains/${domain}/projects/${urlEncode(project)}/exported-projects/${filename}?delete-from-server=${deleteFromServer}`,
    method: 'get',
    responseType: 'blob'
  })
}
