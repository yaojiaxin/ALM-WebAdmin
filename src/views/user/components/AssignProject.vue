<template>
  <div>
    <mf-modal
      id="assign_project_modal"
      :visible="visible"
      :confirm-loading="loading"
      :ok-text="okText"
      :cancel-text="cancelText"
      :next-disabled="nextDisabled"
      width="800px"
      @close="onClose"
      @cancel="onCancel"
      @ok="onAssignProject"
    >
      <span slot="title">
        {{ $t('userManagement.assignProjectToUsers.assignProject') }}
        <mf-help-btn :help="ASSIGN_PROJECT_USERS" />
      </span>

      <div v-show="step === 1">
        <mf-form
          id="assign_project_form"
          :form="form"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          style="width: 450px"
        >
          <span class="mf-subtitle">
            {{ $t('userManagement.assignProjectToUsers.SELECT_PROJECTS') }}
          </span>
          <a-form-item :label="$t('userManagement.assignProjectToUsers.projects')" prop="project">
            <a-tree-select
              id="assign_project_name"
              v-model="form.project"
              style="width: 100%"
              dropdown-class-name="project-tree-select"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :tree-data="treeData"
              :placeholder="$t('userManagement.Please_select')"
              :load-data="onLoadData"
              :tree-expanded-keys.sync="expandKeys"
              @select="selectProject"
            />
          </a-form-item>
        </mf-form>

        <span class="mf-subtitle">
          {{ $t('userManagement.assignProjectToUsers.GrantAndRemoveRoles') }}
        </span>

        <a-table
          id="assign_project_table"
          row-key="id"
          size="small"
          :scroll="usersRoles.length > 10 ? { y: calcModalTableHeight(163) } : {}"
          :columns="columns"
          :pagination="false"
          :data-source="usersRoles"
        >
          <template slot="groups" slot-scope="text, record, index">
            <a-select
              id="assign_table_select"
              v-model="usersRoles[index].groups"
              mode="multiple"
              :show-arrow="true"
              style="width: 100%"
              :get-popup-container="triggerNode => triggerNode.parentNode"
              @change="ChangeGroups"
            >
              <a-select-option
                v-for="item in projectGroups"
                :id="item['group-id']+item['group-name']"
                :key="item['group-id']+item['group-name']"
                :value="item['group-name']"
              >
                {{ item['group-name'] }}
              </a-select-option>
            </a-select>
          </template>
        </a-table>
      </div>

      <div v-show="step === 2">
        <span class="mf-subtitle">
          {{ $t('userManagement.assignProjectToUsers.SUMMARY_PAGE') }}
        </span>
        <a-table
          row-key="name"
          size="small"
          :scroll="{ y: calcModalTableHeight(78) }"
          :columns="summaryColumns"
          :pagination="false"
          :data-source="stempTableData"
        >
          <template slot="groups" slot-scope="groups">
            <a-tag v-for="i in groups" :key="i['group-name']">{{ i['group-name'] }}</a-tag>
          </template>
        </a-table>
      </div>
    </mf-modal>
    <modal-result
      width="800px"
      :visible.sync="resultVisible"
      :result-list="resultUserList"
      :columns="resultColumns"
      @cancel="onModalResultCancel"
      @ok="onModalResultCancel"
    />
  </div>
</template>

<script>
import { ASSIGN_PROJECT_USERS } from 'config/help'
import { mapGetters } from 'vuex'
import { getProjectsInDomains, getProjectGroups, getUserGroupsInProject, updateUserGroupsMsg, getAllUsersInProject, batchRemoveUsers } from '@/api/project'

import { addUserProject } from '@/api/user'
import ModalResult from '@/components/ModalResult/index'
import { calcModalTableHeight } from '@/utils'

export default {
  components: { ModalResult },
  props: {
    visible: {
      type: Boolean,
      default: false
    },

    selectUsers: {
      type: Array,
      default: () => { return [] }
    }
  },

  data() {
    return {
      loading: false,
      expandKeys: [],

      ASSIGN_PROJECT_USERS,

      // Assign project and role steps to selected users
      // 1: Select the project and set the roles
      // 2: Show user projects and roles
      // 3: Result list
      step: 1,

      usersRoles: [],
      copyUserRoles: [],

      labelCol: { span: 7 },
      wrapperCol: { span: 17 },

      form: {
        project: '',
        domain: ''
      },

      projectGroups: [],

      isChangeFinsh: false,
      stempTableData: [],

      isChange: false,

      treeData: [],

      allUsersInProject: [],

      resultVisible: false,
      MessageObj: {
        title: this.$t('userManagement.assignProjectToUsers.assignProject'),
        onSuccessSubmit: this.$t('OK')
      },
      resultUserList: [],
      resultColumns: [
        {
          title: this.$t('userManagement.userToolBar.successTableTitle'),
          dataIndex: 'name',
          key: 'name',
          slots: { title: 'customTitle' }
        },

        {
          title: this.$t('userManagement.userToolBar.successTableStatus'),
          dataIndex: 'status',
          key: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: this.$t('userManagement.userToolBar.successTableMessage'),
          dataIndex: 'message',
          key: 'message'
        }
      ],

      isGetUsersGroupsDown: false
    }
  },

  computed: {
    columns() {
      return [{
        title: this.$t('login.userName'),
        dataIndex: 'name',
        key: 'name'
      }, {
        title: this.$t('userManagement.FULL_NAME'),
        dataIndex: 'full-name',
        key: 'full-name',
        ellipsis: true
      }, {
        title: this.$t('userManagement.EMAIL'),
        dataIndex: 'email',
        key: 'email',
        ellipsis: true
      }, {
        title: this.$t('userManagement.userToolBar.GROUPS'),
        dataIndex: 'groups',
        key: 'groups',
        scopedSlots: { customRender: 'groups' }
      }]
    },
    summaryColumns() {
      return [{
        title: this.$t('login.userName'),
        dataIndex: 'name',
        key: 'name'
      }, {
        title: this.$t('PROJECT'),
        dataIndex: 'project',
        key: 'project'
      }, {
        title: this.$t('userManagement.userToolBar.STATUS'),
        dataIndex: 'status',
        key: 'status'
      }, {
        title: this.$t('userManagement.userToolBar.GROUPS'),
        dataIndex: 'groups',
        key: 'groups',
        scopedSlots: { customRender: 'groups' }
      }]
    },
    okText: function() {
      return this.step === 1 ? this.$t('Next') : this.$t('Finish')
    },

    cancelText: function() {
      return this.step === 1 ? this.$t('Cancel') : this.$t('back')
    },
    ...mapGetters([
      'domainList'
    ]),

    nextDisabled() {
      if (this.step === 1) {
        return !this.isGetUsersGroupsDown
      }

      return false
    }
  },

  watch: {
    visible: function(val) {
      if (val) {
        this.getUsersRoles()
        this.getDomains()
      } else {
        this.step = 1
        this.expandKeys = []
        this.isChange = false
      }
    }

  },
  mounted() {
    this.loading = false
  },

  methods: {
    calcModalTableHeight,

    onModalResultCancel() {
      this.resultVisible = false
      this.loading = false
    },

    getDomains() {
      this.treeData = []
      this.$store.dispatch('project/getDomainList', true).then(() => {
        this.treeData = this.domainList.map((item, index) => {
          return {
            title: item.name,
            key: `${index}`,
            value: item.name,
            customId: item.customId,
            selectable: false,
            children: []
          }
        })
      })
    },
    selectProject(value, node) {
      this.form.domain = node.dataRef.parentName
      this.form.project = value
      this.isChange = false

      getProjectGroups(this.form).then(res => {
        this.projectGroups = res.groups.group
      }).catch(() => {

      })

      this._getAllUsersInProject()
    },

    _getAllUsersInProject() {
      getAllUsersInProject(this.form).then(res => {
        this.allUsersInProject = []
        if (Array.isArray(res.users.user)) {
          this.allUsersInProject = res.users.user
        } else if (res.users.user) {
          this.allUsersInProject.push(res.users.user)
        } else {
          this.allUsersInProject = []
        }

        this.getUsersGroupsInproject(this.form)
      }).catch(() => {

      })
    },

    ChangeGroups() {
      this.isChange = true
      for (let index = 0; index < this.usersRoles.length; index++) {
        if (this.usersRoles[index].groups.length === this.copyUserRoles[index].groups.length) {
          const flag = this.copyUserRoles[index].groups.every(item => { return this.usersRoles[index].groups.includes(item) })
          this.usersRoles[index].status = flag ? this.$t('No Change') : this.$t('Edit')
        } else if (this.usersRoles[index].groups.length < this.copyUserRoles[index].groups.length) {
          this.usersRoles[index].status = this.$t('Delete')
        } else {
          this.usersRoles[index].status = this.$t('Add')
        }
      }
      this.usersRoles.forEach(item => {
        item.project = this.form.project
        item.domain = this.form.domain
      })
    },

    async onAssignProject() {
      if (this.step === 1) {
      // Check the selected data with the original data, and prompt if there is no change, otherwise skip to the second step
        this.usersRoles.forEach(item => {
          item.changes = { ...this.form, groups: item.groups, name: item.name, status: item.status }
        })

        this.isChangeFinsh = false
        this.isChangeFinsh = this.usersRoles.some(item => { return item.status !== this.$t('No Change') })

        this.stempTableData = []
        this.usersRoles.forEach(item => {
          const { groups, ...rest } = Object.assign({}, item.changes)
          this.stempTableData.push({ ...rest, groups: groups.map(item => { return { 'group-name': item } }) })
        })

        for (let i = 0; i < this.stempTableData.length; i++) {
          this.stempTableData.forEach((item, index) => {
            if (item.project === this.stempTableData[i].project && item.domain === this.stempTableData[i].domain && item.name === this.stempTableData[i].name && index !== i) {
              this.stempTableData.splice(i, 1)
            }
          })
        }

        if (this.isChangeFinsh && this.isChange) {
          this.step = 2
        } else {
          if (this.usersRoles.find((userRole) => userRole.groups.length > 0) == null) {
            this.$message.error(this.$t('userManagement.Assign_at_Least_One_Group'))
          } else {
            this.$message.error(this.$t('userManagement.NoChangeGroups'))
          }
          return false
        }
      } else {
        // Submit the data and display the resulting page
        this.loading = true

        // const needAddToProject = []

        // this.stempTableData.forEach(item => {
        //   item.user = item.name

        //   const istrue = this.allUsersInProject.some(i => {
        //     return i.name === item.name
        //   })

        //   if (!istrue) {
        //     needAddToProject.push(item)
        //   }
        // })

        // 'user' property is required...
        this.stempTableData.forEach(item => (item.user = item.name))
        const needAddToProject = this.stempTableData.filter(i => i.status !== this.$t('No Change'))

        if (needAddToProject.length > 0) {
          // add user to project
          this._addUserProject(needAddToProject)
        } else {
          // add groups to user
          this._updateGroups()
        }
      }
    },

    // add user to project
    _addUserProject(needAddToProject) {
      addUserProject(
        {
          domain: needAddToProject[0].domain,
          project: needAddToProject[0].project
        },
        JSON.parse(
          JSON.stringify({
            users: {
              user: needAddToProject.map(item => { return { name: item.user } })
            }
          }))).then(res => {
        // add groups to user
        this._updateGroups()
      }).finally(() => {
        // this.loading = false
      })
    },

    // add groups to user
    async _updateGroups() {
      const resList = []
      let index = 1
      const changesUser = this.stempTableData.filter(i => i.status !== this.$t('No Change'))
      for (const i of changesUser) {
        let operate = {}
        if (i.groups.length > 0) {
          await updateUserGroupsMsg(i).then(res => {
            operate = {
              key: index,
              name: i.name,
              status: true,
              message: i.groups.length > 1 ? this.$t('userManagement.assignProjectToUsers.multiSuccessMsg', { user: i.user, group: i.groups.map(item => { return item['group-name'] }).join(','), project: i.project, domain: i.domain })
                : this.$t('userManagement.assignProjectToUsers.successMsg', { user: i.user, group: i.groups.map(item => { return item['group-name'] }).join(','), project: i.project, domain: i.domain })
            }
          }).catch(e => {
            operate = {
              key: index,
              name: i.name,
              status: false,
              message: e.response.data.QCRestException.Title
            }
          })
        } else {
          await batchRemoveUsers({
            domain: i.domain,
            project: i.project,
            users: { user: [{ name: i.name }] }
          }).then(() => {
            operate = {
              key: index,
              name: i.name,
              status: true,
              message: this.$t('project.users.removeUserSuccess')
            }
          }).catch(e => {
            operate = {
              key: index,
              name: i.name,
              status: false,
              message: e.response.data.QCRestException.Title
            }
          })
        }

        index++
        resList.push(operate)
      }
      this.$emit('update:visible', false)
      this.resultUserList = resList
      this.resultVisible = true
      this.form.project = ''
      this.form.domain = ''
      this.projectGroups = []
      this.stempTableData = []
      // this.loading = false
    },

    onLoadData(treeNode) {
      return new Promise((resolve) => {
        const name = treeNode.dataRef.title
        setTimeout(() => {
          getProjectsInDomains(name).then((res) => {
            if (!res.projects.project) {
              return
            }
            let project = []
            Array.isArray(res.projects.project) ? project = res.projects.project : project.push(res.projects.project)
            project = project.filter(i => i['project-type'] !== 'LabManagement')
            const arr = []
            project.forEach((item, index) => {
              arr.push({
                title: item.name,
                key: treeNode.eventKey + '-' + index,
                value: item.name,
                isLeaf: true,
                parentName: name
              })
            })

            treeNode.dataRef.children = arr
          })
          resolve()
        }, 500)
      })
    },

    onCancel() {
      this.$emit('update:visible', false)
      this.form.project = ''
      this.form.domain = ''
      this.projectGroups = []
      this.loading = false
      this.stempTableData = []
    },

    onClose() {
      if (this.step === 2) {
        this.step = 1
      } else {
        this.$emit('update:visible', false)
        this.form.project = ''
        this.form.domain = ''
        this.projectGroups = []

        this.stempTableData = []
      }
      this.loading = false
    },

    getUsersRoles() {
      this.usersRoles = this.selectUsers.map(item => {
        return {
          ...item,
          groups: [],
          changes: {},
          status: '',
          project: '',
          domain: ''
        }
      })
    },

    async getUsersGroupsInproject(data) {
      this.isGetUsersGroupsDown = false

      this.copyUserRoles = []
      const newData = { ...data }
      for (const item of this.usersRoles) {
        newData.user = item.name

        const isInclude = this.allUsersInProject.some(i => {
          return i.name === item.name
        })

        if (isInclude) {
          await getUserGroupsInProject(newData).then(res => {
            item.groups = []
            if (Array.isArray(res.groups.group)) {
              let resGroups = []
              resGroups = res.groups.group.map(i => {
                return i['group-name']
              })
              item.groups = resGroups
            } else if (res.groups.group) {
              item.groups.push(res.groups.group['group-name'])
            } else {
              item.groups = []
            }
            this.copyUserRoles.push(JSON.parse(JSON.stringify(item)))
          }).catch(() => {

          })
        } else {
          item.groups = []
          this.copyUserRoles.push(JSON.parse(JSON.stringify(item)))
        }
      }

      this.isGetUsersGroupsDown = true
    }
  }
}
</script>

<style lang="less" scoped>

  #assign_project_modal /deep/ .ant-select-tree-treenode-switcher-open .ant-select-tree-treenode-switcher-close{
    display: none;
  }

</style>

<style lang="less">
.project-tree-select {
  overflow-x: hidden;

  .ant-select-tree-switcher.ant-select-tree-switcher_open,
  .ant-select-tree-switcher.ant-select-tree-switcher_close
  {
    display: inline;
    position: absolute;
    // width: calc(100% - 8px);
    width: 100%;
    // z-index: 100;
    text-align: left;
    height: 30px;
    padding: 3px 5px;
    left: 0;

    &:hover {
      background-color: rgba(0, 121, 239, 0.05);
    }
  }

  .ant-select-tree-switcher.ant-select-tree-switcher-noop {
    display: none;
  }

  .ant-select-switcher-icon {
    padding-left: 6px;
  }

  .ant-select-tree-node-content-wrapper.ant-select-tree-node-content-wrapper-open,
  .ant-select-tree-node-content-wrapper.ant-select-tree-node-content-wrapper-close,
  .ant-select-tree-node-content-wrapper.ant-select-tree-node-content-wrapper-normal
   {
    padding-left: 30px;
    width: 100%;
  }
}
</style>
