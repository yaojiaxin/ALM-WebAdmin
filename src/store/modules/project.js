import {
  getAllDomains,
  deActiveProject,
  activeProject
} from '@/api/project'
import i18n from '@/locales'
import Vue from 'vue'
import { eventEmitter } from '@/views/project/event'

const state = {
  domainList: [],

  selectTreeNode: {},

  selectDomain: null,

  domainHasProjects: false,

  domainHasSqlProjects: false,

  siteVersion: '',

  labVersion: ''
}

const mutations = {
  SET_SITEVERSION: (state, siteVersion) => {
    state.siteVersion = siteVersion
  },

  SET_LABVERSION: (state, labVersion) => {
    state.labVersion = labVersion
  },

  SET_DOMAINLIST: (state, domainList) => {
    state.domainList = domainList
  },

  SET_SELECTTREENODE: (state, treeNode) => {
    state.selectTreeNode = treeNode

    if (treeNode && treeNode.level === 1) {
      state.selectDomain = treeNode.data
    } else if (treeNode && treeNode.level === 3) {
      const project = treeNode.data

      if (project.domain) {
        state.selectDomain = project.domain
      } else {
        state.selectDomain = { name: project['domain-name'], id: project['domain-id'] }
      }
    }
  },

  SET_SELECTDOMAIN: (state, domain) => {
    state.selectDomain = domain
  },

  SET_HASPROJECTS: (state, domainHasProjects) => {
    state.domainHasProjects = domainHasProjects
  },

  SET_HASSQLPROJECTS: (state, domainHasSqlProjects) => {
    state.domainHasSqlProjects = domainHasSqlProjects
  }
}

const actions = {
  // get domains
  getDomainList({ commit, state }, isReload) {
    return new Promise((resolve, reject) => {
      // Loads when a reload is required or when the domain has no data
      if (isReload || state.domainList.length === 0) {
        getAllDomains().then(data => {
          let list = data.domains.domain
          list = Array.isArray(list) ? list : [list]
          commit('SET_DOMAINLIST', list)
          resolve(data)
        }).catch((e) => { reject(e) })
      } else {
        resolve()
      }
    })
  },

  deactiveProject({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      deActiveProject({
        domain: data['domain-name'],
        project: data.name
      }).then(res => {
        // commit('SET_SELECTTREENODE', { ...state.selectTreeNode, data: { ...res.project, key: state.selectTreeNode.data.key }})
        Vue.prototype.$message.success(i18n.tc('project.inactiveProjectSuccess'))
        eventEmitter.emit('updateProjectNode', res.project)
        eventEmitter.emit('updateLab', res.project)
        eventEmitter.emit('projectSelected', 'details')
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  },

  activeProject({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        activeProject({
          domain: data['domain-name'],
          project: data.name
        }).then(res => {
          // commit('SET_SELECTTREENODE', { ...state.selectTreeNode, data: { ...res.project, key: state.selectTreeNode.data.key }})

          Vue.prototype.$message.success(i18n.tc('project.activeProjectSuccess'))
          eventEmitter.emit('updateProjectNode', res.project)
          eventEmitter.emit('updateLab', res.project)
          eventEmitter.emit('projectSelected', 'details')
          resolve(res)
        }).catch(e => {
          reject(e)
        })
      } catch (e) {
        console.log(e)
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
