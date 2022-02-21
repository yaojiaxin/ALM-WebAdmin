<template>
  <div id="user_projects" class="user-detail-projects">
    <div id="project_top" class="project-top">
      <a-button v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_PROJECTS_MEMBERSHIPS_UPDATE'],['SWITCHED_CUSTOMER_CONTEXT_USER_PROJECTS_MEMBERSHIPS_UPDATE'])" id="users-management-addbtn" type="primary" class="project-top-btn" @click="addProjects">
        <a-icon type="plus" style="color: #80bcf7" />
        {{ $t("userManagement.AddProjects") }}
      </a-button>
      <div class="project-top-right">
        <a-checkbox v-model="group" class="project-top-right-checkbox" @change="onChange">
          <span :title="$t('userManagement.groupByDomain')">{{ $t("userManagement.groupByDomain") }}</span>
        </a-checkbox>

        <a-input-search
          id="users_project_search"
          v-model="searchProjects"
          class="project-top-right-search"
          :placeholder="$t('inputSearchPlaceholder')"
          @search="onSearch"
        />

        <icon-btn
          id="a-icon-refresh"
          :is-disabled="false"
          :icon-title="$t('refresh')"
          icon-style="icon-refresh"
          class="project-refresh"
          @onClick="refreshProjects"
        />
      </div>
    </div>

    <a-table
      v-show="!group"
      id="user_projects_table"
      ref="userprojectstable"
      class="user-detail-projects-table user-project-autoheight general-table"
      row-key="id"
      :columns="columns"
      :data-source="userProjectsList"
      :loading="loading"
      :pagination="false"
    >
      <template slot="active" slot-scope="data">
        <icon-btn
          :icon-title="$t('project.removeProject')"
          icon-style="icon-delete"
          class="project-delete"
          @onClick="removeUserProject(data)"
        />
      </template>
    </a-table>

    <a-table
      v-show="group"
      id="parent_projects_table"
      class="user-detail-projects-table user-project-autoheight general-table"
      row-key="uid"
      :columns="parentColumns"
      :data-source="groupList"
      :pagination="false"
      :expanded-row-keys="groupExpandedRowKeys"
      @expand="projectGroupExpand"
    >
      <template slot="active" slot-scope="data">
        <icon-btn
          v-if="!data.icon&&checkPermission(['MY_CUSTOMER_CONTEXT_USER_PROJECTS_MEMBERSHIPS_UPDATE'],['SWITCHED_CUSTOMER_CONTEXT_USER_PROJECTS_MEMBERSHIPS_UPDATE'])"
          :icon-title="$t('project.removeProject')"
          icon-style="icon-delete"
          class="project-delete"
          @onClick="removeUserProject(data)"
        />
      </template>

    </a-table>

    <!-- add projects -->
    <projects-add-sass ref="projectsAdd" :user="user.toString()" :exclude="excludeProjects" @addProjectSucced="getUserProjects(user)" />

    <!-- <projects-operation ref="projectsOper" /> -->
    <!-- <modal-result
      :message-obj="MessageObj"
      :visible="resultVisible"
      :submit-show="true"
      :result-list="resultUserList"
      :columns="resultColumns"
      width="802px"
      @resultSubmitFunc="resultSubmitFunc"
      @resultReturnFunc="resultReturnFunc"
    /> -->
  </div>
</template>

<script>
import { getUserProject, deleteUserProject } from '@/api/user'
import IconBtn from '@/components/BtnIcon/index'
// import ModalResult from '@/components/ModalResult/index'
import projectsAddSass from '../components/ProjectsAddSass'
import { mapGetters } from 'vuex'
import { sorting, errorMessage } from '@/utils'
import { USER_PROJECTS, PAGE_SIZE_25, PAGE_SIZE_LIST } from '@/store/const'
export default {
  name: 'UserProject',
  components: {
    IconBtn,
    projectsAddSass
    // ModalResult
  },
  data() {
    return {
      userProjectsList: [],
      searchProjects: '',

      excludeProjects: [],

      loading: true,
      user: '',
      value: '',

      group: false,
      groupList: [],
      copyGroupList: [],
      copyUserProjectsList: [],

      deletelist: undefined,
      groupExpandedRowKeys: [],

      pagination: {
        size: 'small',
        current: 1,
        defaultPageSize: PAGE_SIZE_25,
        pageSize: PAGE_SIZE_25,
        showSizeChanger: true,
        pageSizeOptions: PAGE_SIZE_LIST,
        showSizeChange: (current, pageSize) => { this.pageSize = pageSize },
        showTotal: (total) =>
          this.$t('totalItems') + ' ' + total
      }
    }
  },
  computed: {
    ...mapGetters(['customerId', 'activeCustomerId']),
    columns() {
      return [{
        title: this.$t('DOMAIN'),
        dataIndex: 'domain-name',
        ellipsis: true,
        sorter: (a, b) => sorting(a['domain-name'], b['domain-name']),
        align: 'left'
      }, {
        title: this.$t('PROJECT'),
        dataIndex: 'name',
        ellipsis: true,
        sorter: (a, b) => sorting(a.name, b.name),
        align: 'left'
      }, {
        title: this.$t('ACTION'),
        scopedSlots: { customRender: 'active' },
        align: 'left'
      }]
    },

    parentColumns() {
      return [{
        title: this.$t('DOMAIN'),
        dataIndex: 'domainName',
        ellipsis: true,
        key: 'uid',
        align: 'left'
      },
      {
        title: this.$t('PROJECT'),
        dataIndex: 'name',
        ellipsis: true,
        // key: 'uid',
        align: 'left'
      },
      {
        title: this.$t('ACTION'),
        scopedSlots: { customRender: 'active' },
        align: 'left'
      }]
    },

    resultColumns() {
      return [{
        title: this.$t('domainName'),
        dataIndex: 'domainName',
        key: 'domainName',
        ellipsis: true,
        width: '20%'
      }, {
        title: this.$t('projectName'),
        dataIndex: 'projectName',
        key: 'projectName',
        ellipsis: true,
        width: '20%'
      }, {
        title: this.$t('userManagement.userToolBar.successTableStatus'),
        dataIndex: 'status',
        key: 'status',
        scopedSlots: { customRender: 'status' },
        ellipsis: true,
        width: '20%',
        align: 'center'
      }, {
        title: this.$t('userManagement.userToolBar.successTableMessage'),
        dataIndex: 'message',
        key: 'message',
        ellipsis: true
      }]
    }

  },

  watch: {
    userProjectsList: {
      handler() {
        this.projectGroupChange()
      },
      immediate: true,
      deep: true
    }
  },

  mounted() {
    document.getElementsByClassName('ant-table-body')[1].addEventListener('scroll', (event) => {
      // this.getDistance(event)
    })
    this.getUserProjects(this.user)
  },
  methods: {
    getUserProjects(userName) {
      this.loading = true
      this.userProjectsList = []
      if (userName) {
        this.user = userName
        getUserProject(userName).then(res => {
          if (res.projects) {
            if (res.projects.project instanceof Array) {
              this.userProjectsList = res.projects.project
            } else {
              this.userProjectsList.push(res.projects.project)
            }
          }
          this.userProjectsList = this.userProjectsList.filter(item => item.name !== USER_PROJECTS.LabProject)
          this.copyUserProjectsList = JSON.parse(JSON.stringify(this.userProjectsList))
          this.excludeProjects = this.userProjectsList.map(item => {
            return {
              name: item.name,
              'domain-name': item['domain-name'],
              'target-domain': item['domain-name'],
              'target-project': item.name
            }
          })
          this.loading = false
          this.$emit('getProjectFinsh', this.userProjectsList.length)
          this.searchProjects = ''
        }).catch(() => {
          this.loading = false
        })
      }
    },

    removeUserProject(data) {
      this.deletelist = data
      this.$mfConfirm({
        title: this.$t('project.removeProject'),
        message: this.$t('project.remove_project_message', { userName: this.user, projectName: data.name }),
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('remove'),
        onConfirm: this.onDeleteProjects
      })
    },

    onDeleteProjects() {
      this.deletelist.user = this.user
      this.deletelist['customer-id'] = this.activeCustomerId ? this.activeCustomerId : this.customerId
      return deleteUserProject(this.deletelist).then(res => {
        this.deletelist = undefined
        this.getUserProjects(this.user)
        this.$message.success(this.$t('project.removeProjectSuccess'))
      }).catch((e) => {
        return e.response.data.Title ? errorMessage(e.response.data.Title, e.response.data.StackTrace) : null
      })
    },

    getDistance(event) {
      const dom = event.target
      const scrollDistance = dom.scrollHeight - dom.scrollTop - dom.clientHeight
      if (scrollDistance <= 0) { // Equal to 0 indicates that we have reached the bottom, and we can request the interface
        // this.getUserProjects(this.user)
      }
    },

    onChange(e) {
      this.group = e.target.checked
      if (!this.group) return
      this.projectGroupChange()
    },

    checked(e) {
      this.group = e
    },

    // group by domain
    projectGroupChange() {
      if (this.group && this.userProjectsList.length > 0) {
        this.userProjectsList.forEach((item, index) => {
          const isClude = this.groupList.some(i => {
            return i.domainName === item['domain-name']
          })
          if (!isClude) {
            this.groupList.push({ uid: item.uid + new Date().getTime(), domainName: item['domain-name'], children: [], icon: true })
          }
        })
      } else {
        this.groupList = []
      }

      if (this.groupList.length === 0) return
      this.groupList.forEach(item => {
        const arra = this.userProjectsList.filter(i => {
          return i['domain-name'] === item.domainName
        })
        item.children = arra
      })
      this.copyGroupList = JSON.parse(JSON.stringify(this.groupList))
      this.groupExpandedRowKeys = []
      this.groupList.forEach(item => {
        this.groupExpandedRowKeys.push(item.uid)
      })
    },

    refreshProjects() {
      this.getUserProjects(this.user)
      this.searchProjects = ''
    },

    addProjects() {
      this.$refs.projectsAdd.show()
    },

    // search
    onSearch(value) {
      if (!this.group) {
        if (value === '') {
          this.userProjectsList = JSON.parse(JSON.stringify(this.copyUserProjectsList))
        } else {
          this.userProjectsList = JSON.parse(JSON.stringify(this.copyUserProjectsList))
          const array = this.userProjectsList.filter(item => {
            return item.name.toString().indexOf(value) > -1
          })

          this.userProjectsList = [...array]
        }
      } else {
        this.groupExpandedRowKeys = []
        if (value === '') {
          this.groupList = JSON.parse(JSON.stringify(this.copyGroupList))
        } else {
          this.groupList = JSON.parse(JSON.stringify(this.copyGroupList))
          this.groupList.forEach(item => {
            const arrayGroup = item.children.filter(i => {
              return i.name.toString().indexOf(value) > -1
            })
            item.children = [...arrayGroup]
          })
        }
        this.groupList.forEach(item => {
          this.groupExpandedRowKeys.push(item.uid)
        })
      }
    },

    // expanded
    projectGroupExpand(expanded, record) {
      if (expanded) {
        this.groupExpandedRowKeys.push(record.uid)
      } else {
        var i = this.groupExpandedRowKeys.findIndex(value => {
          return value === record.uid
        })
        if (i > -1) {
          this.groupExpandedRowKeys.splice(i, 1)
        }
      }
    }

  }
}
</script>

<style lang="less">
.user-detail-projects{
  .user-detail-projects-table{
      width: 100%;
      padding-right: 2px;
      margin-top: 8px;
}

.user-project-autoheight{
  height: calc(100vh - 190px);
  overflow-x: hidden;
}

.project-top{
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .project-top-btn {
    flex-shrink: 0;
    margin-right: 20px;
  }

  .project-top-right {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    .project-top-right-checkbox {
      display: block;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: calc(100% - 270px - 20px - 25px - 24px);
    }

    .project-top-right-search {
      width: 270px;
      margin-left: 24px;
      background: white;
      flex-shrink: 0;
    }
  }
}

.search-input{
  width: 270px;
  margin-left: 24px;
}

.project-refresh{
  margin-left: 25px;
  margin-right: 0;
  flex-shrink: 0;
}

.project-delete{
  margin-left: 14px;
}

.ant-input{
  background: white !important;
}

/deep/.ant-table-tbody > tr{
  background: white;
  // border-bottom: 0;
  // border-top: 0;
}

// #parent_projects_table .ant-table{
//   margin-top: 8px;
//   border: 1px solid #dcdedf;
// }

/deep/.ant-table-scroll{
  border-right: 1px solid #dcdedf;
}

}

</style>
