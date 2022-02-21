import { getProjectsInDomains } from '@/api/project.js'

export const getProjectListByDomain = (domain) => {
  return getProjectsInDomains(domain).then(res => {
    let projects = res.projects && res.projects.project

    projects = Array.isArray(projects) ? projects : [projects]

    return projects
  }).catch(() => [])
}
