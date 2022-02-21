import {
  getAllDomains,
  getProjectsInDomains,
  // deleteProjectDomain,
  // deleteProject,
  // deActiveProject,
  // activeProject,
  updateProjectName
  // enableVersioning,
  // disableVersioning
} from '@/api/project'
import {
  setSelectedMenuItem,
  addTreeItem,
  setEditMenuItem,
  setShowMenuChild,
  // deleteTreeNode,
  searchTreeNodeParents,
  searchShowMenuChild,
  updateTreeNodeName,
  setTreeNodeVal,
  addProjectInDomain
} from '@/utils/tree'
import i18n from '@/locales'
import Vue from 'vue'

const state = {
  allDomain: [],
  selectedTreeNode: {},
  selectedTreeNodeType: 'domain',
  physicalDirectory: '',
  searchName: ''
}

const mutations = {
  SET_DOMAINS(state, val) {
    state.allDomain = val
  },

  getProjectsInDomain(state, { list, customId, type, domain }) {
    let targetList = []
    if (Array.isArray(list) && list.length) {
      targetList = list.map(item => { return { ...item, type: 'project', customId: `project-${item.id}`, edit: false } })
    } else {
      targetList = list ? [{ ...list, type: 'project', customId: `project-${list.id}`, edit: false }] : []
    }

    const template = []
    const project = []
    targetList.forEach(item => {
      if (item['project-type'] !== 'LabManagement') {
        if (item['is-template']) {
          template.push(item)
        } else {
          project.push(item)
        }
      }
    })

    if (domain) {
      state.allDomain = addProjectInDomain(state.allDomain, [project, template], domain)
    } else {
      const showChild = type === 'templates'
      const anotherId = `${customId.split('-')[0]}-${showChild ? 1 : 2}`
      const arr = showChild ? [anotherId, customId] : [customId, anotherId]
      state.allDomain = addTreeItem(state.allDomain, arr, [project, template], showChild)
    }
  },

  resetSearchName(state) {
    state.searchName = ''
  },

  selectedMenuItem(state, { type, customId, target }) {
    state.selectedTreeNode = target
    state.selectedTreeNodeType = type
    state.allDomain = setSelectedMenuItem(state.allDomain, customId)
    this.commit('setPhysicalDirectory', target['physical-directory'])
  },

  setShowMenuChild(state, customId) {
    state.allDomain = setShowMenuChild(state.allDomain, customId)
  },

  setSelectedTreeNode(state, val) {
    state.selectedTreeNode = val
    state.selectedTreeNodeType = val.type || 'domain'
  },

  setPhysicalDirectory(state, val) {
    state.physicalDirectory = val
  },

  setTreeItemEditStatus(state, { id, status }) {
    state.allDomain = setEditMenuItem(state.allDomain, id, status)
  },

  setItemTypeInit(state) {
    state.selectedTreeNodeType = 'domain'
  },

  // deleteDomain(state, domain) {
  //   state.allDomain = state.allDomain.filter(item => item.name !== domain)
  // },

  // deleteProjectInDomain(state, target) {
  //   state.allDomain = deleteTreeNode(state.allDomain, target.customId)
  // },

  searchTargetTreeNode(state, treeNode) {
    state.searchName = treeNode
    const ids = searchTreeNodeParents(state.allDomain, treeNode)
    state.allDomain = searchShowMenuChild(state.allDomain, ids)
  },

  SET_SELECTNODE_STATUS(state, { status, treeNode }) {
    if (!treeNode) {
      state.selectedTreeNode['is-active'] = status
    } else {
      if (treeNode.customId === state.selectedTreeNode.customId) {
        state.selectedTreeNode = { ...state.selectedTreeNode, 'is-active': status }
      }
    }
    state.allDomain = setTreeNodeVal(state.allDomain, treeNode ? treeNode.customId : state.selectedTreeNode.customId, status)
  },

  updateName(state, { newName, id }) {
    state.allDomain = updateTreeNodeName(state.allDomain, id, newName)
    if (state.selectedTreeNode.customId === id) {
      state.selectedTreeNode = { ...state.selectedTreeNode, name: newName }
    }
    // state.allDomain
  },

  SET_TREENODE_VALUE(state, { key, value, treeNode }) {
    if (treeNode.customId === state.selectedTreeNode.customId) {
      state.selectedTreeNode[key] = value
    }
    state.allDomain = setTreeNodeVal(state.allDomain, treeNode ? treeNode.customId : state.selectedTreeNode.customId, value, key)
  }
}

const actions = {
  getAllDomainsData({ commit }) {
    getAllDomains()
      .then(res => {
        let list = res.domains.domain
        list = Array.isArray(list) ? list : [list]

        const newList = list.map((item, i) => {
          const it = {
            ...item,
            selected: !i,
            type: 'domain',
            customId: `domain-${item.id}`,
            showChildren: false,
            showEditIcon: !i,
            edit: false,
            nodes: [
              {
                domainName: item.name,
                domainId: `domain-${item.id}`,
                name: 'Projects',
                id: item.name + '-1',
                customId: `${item.id}-1`,
                parentId: `${item.name}_project`,
                type: 'projects',
                selected: false,
                showChildren: false,
                edit: false,
                showEditIcon: false,
                'physical-directory': item['physical-directory']
              },
              {
                domainName: item.name,
                domainId: `domain-${item.id}`,
                name: 'Template Projects',
                id: item.name + '-2',
                parentId: `${item.name}-template`,
                customId: `${item.id}-2`,
                type: 'templates',
                selected: false,
                showChildren: false,
                edit: false,
                showEditIcon: false,
                'physical-directory': item['physical-directory']
              }
            ]
          }
          if (!i) {
            commit('setSelectedTreeNode', it)

            commit('setPhysicalDirectory', it['physical-directory'])
          }
          return it
        })
        commit('SET_DOMAINS', newList)
      })
  },

  getProjectInDomain({ commit }, { targetName, customId, type, domain }) {
    return getProjectsInDomains(targetName)
      .then(res => {
        const list = res.projects.project
        commit('getProjectsInDomain', { list, name: targetName, customId, type, domain })
        return !!list
      })
  },

  updateProjectName({ commit }, { domain, name, newName, id }) {
    updateProjectName({ domain, project: name, newName })
      .then(() => {
        commit('updateName', { newName, id })
        Vue.prototype.$message.success(i18n.tc('project.updateProjectSuccess'))
      })
  }

  // deleteDomain({ commit }, domainName) {
  //   return deleteProjectDomain(domainName)
  //     .then(() => {
  //       Vue.prototype.$message.success(i18n.tc('project.deleteDomainSuccess'))
  //       commit('deleteDomain', domainName)
  //     })
  // },

  // deleteProject({ commit }, target) {
  //   const { domain, project } = target
  //   return deleteProject({ domain, project })
  //     .then(() => {
  //       Vue.prototype.$message.success(i18n.tc('project.deleteProjectSuccess'))
  //       commit('deleteProjectInDomain', target)
  //     })
  // },

  // deactiveProject({ commit }, param) {
  //   return deActiveProject({
  //     domain: param.domain,
  //     project: param.project
  //   }).then(data => {
  //     commit('SET_SELECTNODE_STATUS', { status: data.project['is-active'], treeNode: param.treeNode })
  //     Vue.prototype.$message.success(i18n.tc('project.inactiveProjectSuccess'))
  //   }).catch(e => {
  //   })
  // },

  // activeProject({ commit }, param) {
  //   return activeProject({
  //     domain: param.domain,
  //     project: param.project
  //   }).then(data => {
  //     commit('SET_SELECTNODE_STATUS', { status: data.project['is-active'], treeNode: param.treeNode })
  //     Vue.prototype.$message.success(i18n.tc('project.activeProjectSuccess'))
  //   }).catch(e => {
  //   })
  // },

  // enableVersion({ commit }, param) {
  //   return enableVersioning({
  //     domain: param.domain,
  //     project: param.project
  //   }).then(data => {
  //     commit('SET_TREENODE_VALUE', { key: 'has-vcs-db', value: data.project['has-vcs-db'], treeNode: param.treeNode })
  //     Vue.prototype.$message.success(i18n.tc('project.enable_versioning_success'))
  //   })
  // },

  // disableVersion({ commit }, param) {
  //   return disableVersioning({
  //     domain: param.domain,
  //     project: param.project
  //   }).then(data => {
  //     commit('SET_TREENODE_VALUE', { key: 'has-vcs-db', value: data.project['has-vcs-db'], treeNode: param.treeNode })
  //     Vue.prototype.$message.success(i18n.tc('project.disable_versioning_success'))
  //   })
  // }
}

export default {
  state,
  mutations,
  actions
}
