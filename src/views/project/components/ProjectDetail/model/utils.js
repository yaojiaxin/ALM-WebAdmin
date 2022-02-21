import { getLinkedProject } from '@/api/project'

export const getLinkedByType = (isTemplate, domain, project) => {
  let param = {}

  if (isTemplate) {
    param = {
      'source-domain': domain,
      'source-project': project,
      link: 'Project'
    }
  } else {
    param = {
      'target-domain': domain,
      'target-project': project,
      'link-type': 'Template'
    }
  }

  return new Promise((resolve, reject) => {
    getLinkedProject(param).then(data => {
      if (data['project-links']) {
        // Returns columns if the link is Tempalte, domain\project otherwise
        if (isTemplate) {
          const links = data['project-links']['project-link']
          resolve(Array.isArray(links) ? links : [links])
        } else {
          const linked = data['project-links']['project-link']
          resolve(`${linked['source-domain']} \\ ${linked['source-project']}`)
        }
      } else {
        resolve(isTemplate ? [] : 'N/A')
      }
    }).catch(e => {
      reject(e)
    })
  })
}

// move project to new domain
export const moveProject = (oldDomain, newDomain) => {

}
