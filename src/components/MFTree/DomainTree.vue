<template>
  <div>
    <a-input-search
      id="search-user"
      class="search-input"
      :placeholder="$t('inputSearchPlaceholder')"
      @search="onSearch"
    />
    <div style="height: 300px; overflow: auto">
      <a-tree
        show-icon
        block-node
        :checkable="true"
        :load-data="onLoadTreeNode"
        :expanded-keys="expandedKeys"
        :checked-keys="checkedKeys"
        :auto-expand-parent="autoExpandParent"
        :tree-data="treeData"
        class="mf-domain-tree"
        @expand="onExpand"
        @check="onCheck"
      >
        <i slot="domain" class="item-icon iconfont icon-Icon-Domain" style="margin:0 5px" />
        <i slot="project" class="item-icon iconfont icon-project" style="margin:0 5px" />
        <i slot="projects" class="item-icon iconfont icon-projects" style="margin:0 5px" />
        <i slot="user" class="item-icon iconfont icon-User" style="margin:0 5px" />

        <template slot="title" slot-scope="{ title }">
          <span v-if="searchValue && title.toString().toLowerCase().indexOf(searchValue.toString().toLowerCase()) > -1">
            {{ title.toString().substr(0, title.toString().toLowerCase().indexOf(searchValue.toString().toLowerCase())) }}
            <span style="color: #f50"> {{ title.toString().substr(title.toString().toLowerCase().indexOf(searchValue.toString().toLowerCase()),
                                                                  title.toString().toLowerCase().indexOf(searchValue.toString().toLowerCase()) + searchValue.length) }}</span>
            {{ title.toString().substr(title.toString().toLowerCase().indexOf(searchValue.toString().toLowerCase()) + searchValue.length) }}
          </span>
          <span v-else>{{ title }}</span>
        </template>
      </a-tree>

    </div>

  </div>
</template>

<script>
import { getProjectsInDomains, getAllUsersInProject } from '@/api/project'
import { mapGetters } from 'vuex'

const dataList = []
const generateList = data => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i]
    const key = node.key
    dataList.push({ key, title: node.name })
    if (node.children) {
      generateList(node.children)
    }
  }
}
// generateList(gData)

const getParentKey = (key, tree) => {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children)
      }
    }
  }
  return parentKey
}

export default {
  props: {
    // You need to exclude items when loading the domain tree
    exclude: {
      type: Array,
      default: () => []
    },

    checkedData: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {

      expandedKeys: [],

      checkedKeys: [],

      searchValue: '',

      treeData: [],

      checkedNodes: [],

      autoExpandParent: false,

      keys: []
    }
  },

  computed: {
    ...mapGetters(['domainList', 'selectTreeNode']),

    domainTree: function() {
      return this.domainList.map(item => {
        return {
          key: item.name + '',
          title: item.name,
          slots: { icon: 'domain' },
          type: 'domain',
          checked: false,
          isLeaf: false,
          name: item.name,
          checkable: false,
          class: 'mf-domain-node',
          scopedSlots: { title: 'title' }
        }
      })
    }
  },
  watch: {
    checkedNodes: {
      handler: function(val) {
        this.$emit('update:checkedData', val)
      },
      deep: true
    },

    checkedData: {
      handler: function(val) {
        if (val === []) {
          this.checkedKeys = []
          this.keys = []
        }
      },
      deep: true
    },

    treeData: function(val) {
      generateList(val)
    },

    // Node Disable that needs to be excluded
    exclude: function(val) {
      const copyTreeData = JSON.parse(JSON.stringify(this.treeData))

      const resetTree = (treeData, value) => {
        for (let i = 0; i < treeData.length; i++) {
          const node = treeData[i]
          const key = node.name

          if (value.find(j => j.name === key)) {
            node.disabled = true
          }

          if (node.children) {
            resetTree(node.children, value)
          }
        }
      }

      if (val && val.length > 0) {
        resetTree(copyTreeData, val)
        this.treeData = copyTreeData
      }
    }
  },

  created() {
    this.treeData = this.domainTree
    // generateList(this.treeData)
  },

  methods: {
    onCheck(checkedKeys, { checked, checkedNodes, node, event }) {
      this.checkedKeys = checkedKeys
      this.checkedNodes = checkedNodes.map(i => {
        if (i.type === 'user') {
          this.keys.push(i.key.split(':')[2])
        } else {
          this.keys.push(i.key)
        }
        return { ...i.data.props, loaded: node.loaded }
      })
    },

    reset() {
      this.expandedKeys = []
      this.checkedKeys = []
      this.checkedNodes = []
      this.keys = []
    },

    onLoadTreeNode(node) {
      return new Promise(resolve => {
        const nodeInfo = node.dataRef

        if (nodeInfo.type === 'project' || nodeInfo.type === 'template') {
          this.getUserNode(node).then(() => {
            resolve()
          }).catch(() => {
            resolve()
          })
        } else if (nodeInfo.type === 'domain') {
          this.getProjectNode(node).then(() => {
            resolve()
          }).catch(() => {
            resolve()
          })
        } else {
          resolve()
        }
      })
    },

    // get user node data
    getUserNode(node) {
      const nodeInfo = node.dataRef
      return getAllUsersInProject({
        domain: nodeInfo.domain,
        project: nodeInfo.title
      }).then(data => {
        if (data.users && data.users.user) {
          const res = Array.isArray(data.users.user) ? data.users.user : [data.users.user]
          node.dataRef.children = res.map(item => {
            return {
              key: nodeInfo.domain + ':' + nodeInfo.title + ':' + item.id,
              title: item.name,
              type: 'user',
              slots: { icon: 'user' },
              scopedSlots: { title: 'title' },
              checked: nodeInfo.checked,
              checkable: true,
              disabled: this.exclude.findIndex(i => i.name === item.name) > -1,
              isLeaf: true,
              name: item.name,
              class: 'mf-user-node',
              data: item
            }
          })
          this.treeData = [...this.treeData]
        }
      })
    },

    // get project node data
    getProjectNode(node) {
      const nodeInfo = node.dataRef
      return getProjectsInDomains(nodeInfo.title).then(res => {
        const template = []
        const projects = []
        let response = []

        if (res.projects && res.projects.project) {
          response = Array.isArray(res.projects.project) ? res.projects.project : [res.projects.project]
          response = response.filter(i => i['project-type'] !== 'LabManagement')
        }
        // default node (projects and templates)
        const defaultNode = (type, children) => {
          const setNode = {
            key: `${node.eventKey}-${type}`,
            type: type === 'projects' ? 'projects' : 'templates',
            title: type === 'projects' ? this.$t('project.Projects') : this.$t('project.TemplateProjects'),
            isLeaf: !children,
            checked: false,
            slots: { icon: 'projects' },
            scopedSlots: { title: 'title' },
            checkable: false,
            children: children || [],
            class: 'mf-template-type-node'
          }

          if (children) {
            setNode.children = children
          }
          return setNode
        }
        if (response && response.length === 0) {
          node.dataRef.children = [defaultNode('projects'), defaultNode('templates')]
          this.treeData = [...this.treeData]
        } else {
          const selectProject = this.selectTreeNode.data
          response.forEach(item => {
            const resNode = {
              key: item.id,
              title: item.name,
              name: item.name,
              type: item['is-template'] ? 'template' : 'project',
              checked: false,
              disabled: (item.name === selectProject.name && item['domain-name'] === selectProject['domain-name']), // Exclude itself from being unclickable
              domain: nodeInfo.title,
              isLeaf: false,
              slots: { icon: 'project' },
              scopedSlots: { title: 'title' },
              checkable: true,
              class: 'mf-project-node',
              data: item
            }
            if (item['is-template']) {
              template.push(resNode)
            } else {
              projects.push(resNode)
            }
          })

          node.dataRef.children = [defaultNode('projects', projects), defaultNode('template', template)]
          this.treeData = [...this.treeData]
        }
      })
    },

    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },

    onSearch(val) {
      const expandedKeys = dataList
        .map(item => {
          if (item.title && item.title.toString().toLowerCase().indexOf(val.toString().toLowerCase()) > -1) {
            return getParentKey(item.key, this.treeData)
          }
          return null
        })
        .filter((item, i, self) => item && self.indexOf(item) === i)
      Object.assign(this, {
        expandedKeys,
        searchValue: val,
        autoExpandParent: true
      })
    }
  }

}
</script>

<style>

</style>
