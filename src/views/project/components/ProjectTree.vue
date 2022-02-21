<template>
  <tree
    ref="tree"
    lazy
    :load="load"
    :loaded="onLoaded"
    :current-node-key="currntNodeKey"
    :props="{ label: 'name', isLeaf: 'isLeaf' }"
    node-key="key"
    :draggable="true"
    :can-show-remove="false"
    :can-show-disabled="canShowDisabled"
    :class-name="className"
    :allow-drag="allowDrag"
    :allow-drop="allowDrop"
    @node-click="onNodeClick"
    @node-remove="onNodeRemove"
    @node-drag-end="onDragEnd"
  >
    <svg-icon slot="active" class="small-svg" icon-class="project-active" />
    <svg-icon slot="inactive" class="small-svg" icon-class="project-inactive" />
    <svg-icon slot="active-non-versioning" class="small-svg" icon-class="project-active-lock" />
    <svg-icon slot="inactive-non-versioning" class="small-svg" icon-class="project-inactive-lock" />

    <i slot="domain" class="iconfont icon-Icon-Domain" />
    <i slot="projects" class="iconfont icon-projects" />

  </tree>
</template>

<script>
import Tree from '@/components/MFTree/tree'
import { mapGetters } from 'vuex'
import { getProjectsInDomains, deleteProjectDomain, deleteProject, moveToNewDomain } from '@/api/project'
import { eventListener } from '../event'
import i18n from '@/locales'
import { DATABASE_TYPE } from '@/store/const'

const Projects = { name: i18n.tc('project.Projects'), type: 'Projects', slots: { icon: 'projects' }}
const Templates = { name: i18n.tc('project.TemplateProjects'), type: 'Templates', slots: { icon: 'projects' }}

let selectNode = null

export default {
  components: { Tree },

  data() {
    return {
      tmpChild: [],

      currntNodeKey: '',

      searchStr: '',

      searchCurrentNum: 0

      // addedNode: null
    }
  },

  computed: {
    ...mapGetters(['domainList', 'selectTreeNode'])
  },

  created() {
    const _this = this
    eventListener.on('updateProjectNode', function(data) {
      _this.updateTreeNode(data)
    })

    eventListener.on('removeProjectNode', function(data) {
      _this.$refs.tree.remove({ key: `${data.id}`, name: data.name })
    })

    // added project, selected the project
    eventListener.on('setTreeSelect', async function({ data, type }) {
      await new Promise(resolve => {
        _this.reload()
        resolve()
      })
      selectNode = data
      if (data.level === 3) {
        const addType = type === 'project' ? 'projects' : 'templates'
        _this.expandToSelectNode(data, addType)
      }
    })
    // eventListener.on('setNewSelectNode', function({ data, type }) {
    //   _this.addedNode = data
    // })
  },

  destroyed() {
    selectNode = null
  },

  methods: {
    allowDrag(node) {
      return node.level === 3
    },

    // allow the project to drop
    allowDrop(draggingNode, dropNode) {
      if (dropNode.level !== 3) {
        const domainName = draggingNode.data['domain-name']
        const key = dropNode.data.key
        if ((key === (domainName + 'projects')) || (key === (domainName + 'templates'))) {
          return false
        }

        if (dropNode.level === 2) {
          return (dropNode.data.type === 'Projects') === !draggingNode.data['is-template']
        }

        if (domainName !== key) {
          return true
        }
      }

      return false
    },

    async expandToSelectNode(data, addType) {
      await this.$nextTick()
      this.$refs.tree && this.$refs.tree.setExpandedKey([data.data['domain-name']], () => {
        this.$nextTick(function() {
          this.$refs.tree.setExpandedKey([data.data['domain-name'] + addType], () => {
            this.$nextTick(function() {
              this.$refs.tree.setCurrentNode({ key: `${data.data.key}` })
              if (this.$refs.tree.getCurrentNode()) {
                if (data.level === 3) {
                  this.$emit('select-project', this.$refs.tree.getCurrentNode().data)
                }
                this.$nextTick(function() {
                  this.$store.commit('project/SET_SELECTTREENODE', this.$refs.tree.getCurrentNode())
                })
              } else {
                this.$refs.tree.setCurrentNode({ key: data.parent.data['domain-name'] })
                this.$store.commit('project/SET_SELECTTREENODE', this.$refs.tree.getCurrentNode())
              }
            })
          }, true)
        })
      }, true)
    },

    // When the drag is finished, refresh the tree
    onDragEnd(draggingNode, dropNode) {
      let domainName = ''
      const projectName = draggingNode.data.name
      const projectId = draggingNode.data.id

      // Determine whether the dragged node is placed on the domain node or another node
      if (dropNode.level === 1) {
        domainName = dropNode.data.name
        selectNode = {
          level: 3,
          data: { name: projectName, key: `${projectId}`, 'domain-name': domainName }
        }
      } else {
        domainName = dropNode.data['domain-name']
        selectNode = {
          level: 3,
          data: { name: projectName, key: `${projectId}`, 'domain-name': domainName }
        }
      }
      // move project
      // if(draggingNode.data['domain-name'] !== )
      if (domainName !== draggingNode.data['domain-name']) {
        moveToNewDomain({
          domain: draggingNode.data['domain-name'],
          project: projectName,
          data: {
            domain: { name: domainName }
          }
        }).then(() => {
          this.reload()
        })
      }
    },

    className(node) {
      if (node.level === 1) {
        return 'domain-node'
      } else if (node.level === 3) {
        if (!node.data['has-vcs-db']) {
          return node.data['is-active'] ? 'active' : 'inactive'
        } else {
          return node.data['is-active'] ? 'active-non-versioning' : 'inactive-non-versioning'
        }
      }
    },

    // Whether the delete button can be displayed
    canShowRemove(node) {
      if (this.checkPermission(['MY_CUSTOMER_CONTEXT_DOMAIN_DELETE'], ['SWITCHED_CUSTOMER_CONTEXT_DOMAIN_DELETE']) && node.level === 1) {
        return true
      }
      if (this.checkPermission(['MY_CUSTOMER_CONTEXT_PROJECT_DELETE'], ['SWITCHED_CUSTOMER_CONTEXT_PROJECT_DELETE']) && node.level === 3) {
        return true
      }
      return false
    },
    canShowDisabled(node) {
      return node.data.name === 'DEFAULT'
    },

    removeDomain(data) {
      return deleteProjectDomain(data.name).then(() => {
        this.$refs.tree.remove({ key: data.name, name: data.name })
        this.$store.dispatch('project/getDomainList', true).then(() => {
          this.$refs.tree.setCurrentNode({ key: this.domainList[0].name })
          this.$store.commit('project/SET_SELECTTREENODE', this.$refs.tree.getCurrentNode())
        })

        this.$message.success(this.$t('project.deleteDomainSuccess'))
      })
    },

    removeProject(data) {
      return deleteProject({ domain: data['domain-name'], project: data.name }).then(() => {
        // 删除成功后刷新树和details
        this.$refs.tree.remove({ key: `${data.id}`, name: data.name })
        this.$refs.tree.setCurrentNode({ key: data['domain-name'] })

        this.$store.commit('project/SET_SELECTTREENODE', this.$refs.tree.getCurrentNode())
        this.$message.success(this.$t('project.deleteProjectSuccess'))
      })
    },

    // When the starting node deletes the event
    onNodeRemove(data, node) {
      if (node.level === 1) { // delete domain
        getProjectsInDomains(data.name).then(res => {
          if (res.projects && res.projects.project) {
            this.$message.error(this.$t('project.DeleteDomainHasProject', { domain: data.name }))
          } else {
            this.$mfConfirm({
              message: this.$t('project.delete_domain_message', { name: data.name }),
              onConfirm: () => { return this.removeDomain(data) }
            })
          }
        })
      } else if (node.level === 3) { // delete project
        this.$mfConfirm({
          message: this.$t(node.data['is-template'] ? 'project.delete_template_message' : 'project.delete_project_message', { name: data.name }),
          onConfirm: () => { return this.removeProject(data) }
        })
      }
    },

    _getProjectIconByStatus(status, versioning) {
      if (!versioning) {
        return status === true ? 'active' : 'inactive'
      } else {
        return status === true ? 'active-non-versioning' : 'inactive-non-versioning'
      }
    },

    resetSearchNum() {
      this.searchCurrentNum = 0
    },

    async setSearchStr(searchStr) {
      const searchResult = this.$refs.tree.onSearch(searchStr, this.searchCurrentNum)
      const isHasSearchProject = searchResult.isHasSearchProject
      const totalNum = searchResult.total
      if (!isHasSearchProject) {
        this.$message.error(this.$t('project.ProjectOrTemplateNotFound'))
      } else {
        await this.$emit('select-project', this.$refs.tree.getCurrentNode().data)
        this.$store.commit('project/SET_SELECTTREENODE', this.$refs.tree.getCurrentNode())
        if (this.searchCurrentNum + 1 === totalNum) {
          this.searchCurrentNum = 0
        } else {
          this.searchCurrentNum += 1
        }
      }
    },

    async updateTreeNode(data) {
      await this.$nextTick()
      this.$refs.tree && this.$refs.tree.updateCurrentNode({ ...data, key: `${data.id}`, slots: { icon: this._getProjectIconByStatus(data['is-active'], data['has-vcs-db']) }})
    },

    reload() {
      this.tmpChild = []
      selectNode = null
      this.$refs.tree && this.$refs.tree.reload()
    },

    // get projects by domain
    getProjectsByDomain(node, resolve) {
      return getProjectsInDomains(node.data.name).then(data => {
        const domainName = node.data.name

        if (data.projects && data.projects.project) {
          let list = data.projects.project
          const isExist = this.tmpChild.find(i => i.domainName === domainName)
          list = Array.isArray(list) ? list : [list]
          list = list.filter(i => i['project-type'] !== 'LabManagement')
          list = list.map(i => { return { ...i, domain: node.data } })
          const hasSql = list.filter(i => i['db-type'] === DATABASE_TYPE.MSSQL && !i['is-unicode']).length > 0

          this.$store.commit('project/SET_HASPROJECTS', list.length > 0)
          this.$store.commit('project/SET_HASSQLPROJECTS', hasSql)

          // domain is exist in tempchild
          if (!isExist) {
            this.tmpChild.push({ domainName, children: list })
          }

          if (list && list.length > 0) {
            if (resolve) {
              return resolve([{ ...Projects, key: domainName + 'projects', isLeaf: false, 'domain-name': domainName },
                { ...Templates, key: domainName + 'templates', isLeaf: false, 'domain-name': domainName }])
            }
          }
        } else {
          this.tmpChild.push({ domainName, children: [] })
          this.$store.commit('project/SET_HASPROJECTS', false)
          this.$store.commit('project/SET_HASSQLPROJECTS', false)
        }

        if (resolve) {
          return resolve([{ ...Projects, key: domainName + 'projects', isLeaf: true, 'domain-name': domainName },
            { ...Templates, key: domainName + 'templates', isLeaf: true, 'domain-name': domainName }])
        }
      })
    },

    // load the tree data
    load(node, resolve) {
      // load domain list
      if (node.level === 0) {
        this.$store.dispatch('project/getDomainList', true).then(() => {
          return resolve(this.domainList.map(i => { return { ...i, key: i.name, slots: { icon: 'domain' }} }))
        })
      }

      // load project
      if (node.level === 1) {
        return this.getProjectsByDomain(node, resolve)
      }

      // Fixed category folder
      if (node.level === 2) {
        const child = this.tmpChild.find(i => i.domainName === node.data['domain-name'])

        if (node.data.type === 'Projects') {
          return resolve(child.children.filter(i => i['is-template'] === false).map(i => { return { ...i, key: `${i.id}`, isLeaf: true, slots: { icon: this._getProjectIconByStatus(i['is-active'], i['has-vcs-db']) }} }))
        } else {
          return resolve(child.children.filter(i => i['is-template'] === true).map(i => { return { ...i, key: `${i.id}`, isLeaf: true, slots: { icon: this._getProjectIconByStatus(i['is-active'], i['has-vcs-db']) }} }))
        }
      }
    },

    // After loading data, select the first domain for the first time, otherwise select the newly added node
    onLoaded(node) {
      if (node.level === 0) {
        this.$nextTick(function() {
          if (!selectNode) {
            this.$refs.tree.setCurrentNode({ key: this.domainList[0].name })
            this.$store.commit('project/SET_SELECTTREENODE', this.$refs.tree.getCurrentNode())

            // If the node does not load child node data, the node directly loads data for menu-bar function interpretation
            if (!node.loaded) {
              this.$refs.tree.loadDataByNode(this.$refs.tree.getCurrentNode())
            }
          } else if (selectNode.level === 1) {
            try {
              this.$refs.tree.setCurrentNode({ key: selectNode.data.name })
              this.$store.commit('project/SET_SELECTTREENODE', this.$refs.tree.getCurrentNode())
              this.getProjectsByDomain(selectNode)
            } catch (e) {
              this.$refs.tree.setCurrentNode({ key: this.domainList[0].name })
              this.$store.commit('project/SET_SELECTTREENODE', this.$refs.tree.getCurrentNode())
              this.getProjectsByDomain(this.$refs.tree.getCurrentNode())
            }
          } else if (selectNode.level === 3) {
            this.expandToSelectNode(selectNode, selectNode.data['is-template'] ? 'templates' : 'projects')
          } else if (selectNode.level === 2) {
            this.expandToSelectNode(selectNode, selectNode.data.key.indexOf('templates') > -1 ? 'templates' : 'projects')
          }
        })
      }
    },

    async onNodeClick(data, node) {
      if (this.$store.getters.isPageChanged && this.selectTreeNode.data.key !== data.key) {
        this.$refs.tree.setCurrentNode({ key: this.selectTreeNode.data.key })
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('changePageConfirm'),
          cancelText: this.$t('Cancel'),
          confirmText: this.$t('OK'),
          onConfirm: () => {
            this.$refs.tree.setCurrentNode({ key: data.key })
            this.$store.dispatch('pageChange/resetPageChanged')
            this.doClick(data, node)
          }
        })
      } else {
        this.doClick(data, node)
      }
    },
    async doClick(data, node) {
      if (node.level === 3 && (!this.selectTreeNode || (this.selectTreeNode && this.selectTreeNode.data && this.selectTreeNode.data.id !== data.id))) {
        await this.$emit('select-project', node.data)
      }
      this.$store.commit('project/SET_SELECTTREENODE', node)

      if (node.expanded) {
        this.$refs.tree.setCollapseKeys([node.key])
      } else {
        this.$refs.tree.setExpandedKey([node.key])
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

/deep/ .domain-node{
  font-family: MediumWeb;
  height: 40px;
}
/deep/ .active{

}
/deep/ .inactive .mf-tree-node_label, /deep/ .inactive-non-versioning .mf-tree-node_label{
  color: fade(@black, 50);
}
.small-svg {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: -0.15rem;
}
</style>
