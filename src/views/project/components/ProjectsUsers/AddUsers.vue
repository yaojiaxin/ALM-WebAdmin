<template>
  <mf-modal
    :visible="visible"
    :width="800"
    :confirm-loading="confirmLoading"
    :destroy-on-close="true"
    :next-disabled="showSave || isCanSave"
    @cancel="onClose"
    @ok="onOk"
  >
    <a-tabs v-model="tab" default-active-key="table" class="mf-modal-tab">
      <a-tab-pane key="table" :tab="$t('project.add_from_the_users_list')">
        <a-spin :spinning="loading" style="overflow: hidden">
          <!-- <transfer ref="transfer" v-model="selectedUsers" :exclude="[]" :project-id="projectId" /> -->
          <user-table ref="transfer" v-model="selectedUsers" :show-save.sync="showSave" :project-id="projectId" />
        </a-spin>

      </a-tab-pane>
      <a-tab-pane key="tree" :tab="$t('project.copy_from_another_project')">
        <domain-tree ref="domainTree" :checked-data.sync="checkedNodes" :exclude="exclude" />
      </a-tab-pane>
    </a-tabs>
  </mf-modal>
</template>

<script>
import { addUserProject } from '@/api/user'
import { getAllUsersInProject, updateUserGroups } from '@/api/project'
import DomainTree from '@/components/MFTree/DomainTree'
import UserTable from './components/UserTable'
// import Transfer from '@/components/MFTransfer/UserTableTransfer'

export default {

  components: { DomainTree, UserTable },
  props: {
    // You need to exclude items when loading the user list
    exclude: {
      type: Array,
      default: () => []
    },

    // Groups of the current project
    groups: {
      type: Array,
      default: () => []
    },

    projectId: {
      type: [String, Number],
      default: ''
    }
  },

  data() {
    return {
      visible: false,
      loading: false,
      showSave: false,

      tab: 'table',

      confirmLoading: false,

      selectedUsers: [],

      checkedNodes: []
    }
  },
  computed: {
    // The button is not clickable when no data is selected
    isCanSave() {
      if (this.tab === 'table') {
        return this.selectedUsers.length === 0
      } else {
        return this.checkedNodes.length === 0
      }
    }
  },

  methods: {
    onShow() {
      this.visible = true
    },

    onClose() {
      this.tab = 'table'
      this.$refs.transfer.onRestTransfer()
      if (this.$refs.domainTree) {
        this.$refs.domainTree.reset()
      }
      this.checkedNodes = []
      this.visible = false
    },

    // add users to project
    onOk() {
      this.confirmLoading = true
      let users = []
      if (this.tab === 'tree') {
        Promise.all(this.checkedNodes.map(async(item) => {
          return this.getProjectUsers(item, users)
        })).then(() => {
          this.batchSaveUsers(users)
        })
      } else {
        users = this.selectedUsers
        this.batchSaveUsers(users)
      }
    },

    // Handle saving the users to the project
    async batchSaveUsers(users) {
      const selectProject = this.$store.getters.selectTreeNode.data

      try {
        await addUserProject({
          domain: selectProject['domain-name'],
          project: selectProject.name
        }, JSON.parse(JSON.stringify({
          users: { user: users.map(item => { return { name: item.name } }) }
        })))

        // If you Copy From Another Project, then you need to Copy the user's groups
        if (this.tab === 'tree') {
          for (let i = 0; i < users.length; i++) {
            const item = users[i]
            let groups = Array.isArray(item.group) ? item.group : [item.group]
            groups = this.groups.filter(i => groups.find(j => j['group-name'] === i['group-name']))
            await updateUserGroups({
              domain: selectProject['domain-name'],
              project: selectProject.name,
              user: item.name,
              groups: groups.map(item => { return { 'group-name': item['group-name'] } })
            })
          }
        }
        this.confirmLoading = false
        this.visible = false
        this.onClose()
        this.$message.success(this.$t('project.users.addUserSuccess'))
        this.$emit('onSaved')
      } catch (e) {
        console.log(e.message)
        this.confirmLoading = false
      }
    },

    getProjectUsers(node, users) {
      // When the selected node is Project and no child node data has been loaded
      if (node.type === 'project' && !node.loaded) {
        return getAllUsersInProject({
          domain: node.domain,
          project: node.name
        }).then(data => {
          if (data.users && data.users.user) {
            const res = Array.isArray(data.users.user) ? data.users.user : [data.users.user]
            let excludeNext = res.filter(x => this.exclude.findIndex(i => i.name === x.name) === -1)

            excludeNext = excludeNext.filter(x => users.findIndex(i => i.name === x.name) === -1)
            if (excludeNext) {
              users.push(...excludeNext)
            } else {
              return []
            }
          }
        }).catch(() => {
        })
      } else {
        if (node.type === 'user' && !users.find(i => i.name === node.name)) {
          return users.push({
            name: node.name,
            group: node.data.group
          })
        }
      }
    }
  }
}
</script>

<style>
</style>
