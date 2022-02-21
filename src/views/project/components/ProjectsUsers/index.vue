<template>
  <div class="mf-user-wrapper">
    <div class="user-tab">
      <div class="user-top">
        <div class="user-top-left">
          <a-button
            id="add-user"
            type="primary"
            icon="plus"
            class="mf-margin-l-24"
            :disabled="isCreateProcess || !isSameVersion"
            @click="onClickAddUser"
          >{{ $t("project.users.add") }}</a-button>

          <a-button
            id="remove-user"
            class="mf-margin-l-24 mf-btn-dashed"
            :disabled="
              !selectedRowKeys.length || isCreateProcess || !isSameVersion
            "
            @click="onRemoveUsers"
          >
            <i class="iconfont icon-delete" />
            {{ $t("project.users.remove") }}</a-button>
        </div>

        <div class="user-top-right">
          <div class="show-admin">
            <a-checkbox v-model="isShowAdminOnly" @change="onChangeAdmin()">
              {{ $t("project.users.showProjectAdminOnly") }}
            </a-checkbox>
          </div>
          <mf-badge :badge="hasSearch" class="user-filter-btn" color="#FFB100">
            <a-button id="users-management-filterbtn" class="mf-btn-filter" @click="onFilterClick">
              <i :class="['iconfont',filterIcon]" />
              {{ $t("filter") }}
            </a-button>
          </mf-badge>
        </div>
      </div>
      <filter-search
        ref="filterSearchRef"
        :has-search.sync="hasSearch"
        :groups="groups"
        @onShowFilter="onShowFilter"
        @onSearch="onSearch"
      />
      <a-table
        ref="usersTable"
        :class="[
          'project-table',
          'general-table',
          showFilter ? 'short-project-table' : '',
        ]"
        row-key="name"
        :loading="loading"
        :columns="columns"
        :row-selection="{
          selectedRowKeys: selectedRowKeys,
          onChange: onSelectChange,
        }"
        :data-source="projectUsers"
        :pagination="pagination"
        :scroll-to-first-row-on-change="true"
        :scroll="{ x: projectType !== 'LAB_PROJECT' ? 700 : 0, y: tableHeight }"
        @change="onUsersTableChange"
      >
        <!-- column title slots -->
        <template v-for="item in columns">
          <a-tooltip
            :slot="item.dataIndex"
            :key="item.dataIndex"
            :title="item.titleText"
          >
            <span class="table-column-title-text">{{ item.titleText }}</span>
          </a-tooltip>
        </template>

        <template slot="group" slot-scope="text, record">
          <a-select
            id="table_select"
            mode="multiple"
            :show-arrow="true"
            class="table-select"
            :value="record.group && record.group.map((i) => i['group-name'])"
            :disabled="!isSameVersion"
            @change="(value) => onGroupsChange(record, value)"
          >
            <a-select-option v-for="item in groups" :key="item['group-name']">
              {{ item["group-name"] }}
            </a-select-option>
          </a-select>
        </template>
      </a-table>
    </div>

    <add-users
      ref="addUsers"
      :project-id="selectProject ? selectProject.id : ''"
      :exclude="projectUsers"
      :groups="groups"
      @onSaved="onSaved"
    />

    <modal-result :visible.sync="resultVisible" :result-list="resultUserList" />
  </div>
</template>

<script>
import FilterSearch from './FilterSearch'
import {
  getAllUsersInProject,
  getProjectGroups,
  updateUserGroups,
  batchRemoveUsers
} from '@/api/project'
import { eventListener } from '../../event'
import AddUsers from './AddUsers'
import ModalResult from '@/components/ModalResult/index'
// import { batchRequest } from '@/utils/packageRequest'
import { mapGetters } from 'vuex'
import { autoTableHeight } from '@/utils'
import { PAGE_SIZE_25 } from '@/store/const'
import MfBadge from '@/components/MFBadge'

export default {
  name: 'ProjectsUsers',

  components: { FilterSearch, AddUsers, ModalResult, MfBadge },
  props: {
    isCreateProcess: {
      type: Boolean,
      default: false
    },
    projectType: {
      type: String,
      default: null
    },
    isSameVersion: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      resultVisible: false,
      isShowAdminOnly: false,
      SearchParams: null,
      sort: '',
      selectedRowKeys: [],
      filterIcon: 'icon-spread',
      pagination: {
        total: 0,
        size: 'small',
        current: 1,
        pageSize: PAGE_SIZE_25,
        showSizeChanger: true,
        pageSizeOptions: ['25', '50', '100'],
        showTotal: (total) => this.$t('totalItems') + ' ' + total
      },
      showFilter: false,

      projectUsers: [],
      projectUsersBackup: [],

      resultUserList: [], // Batch operation results

      groups: [],

      localeOption: {
        itemUnit: this.$t('project.users.selected_users'),
        itemsUnit: this.$t('project.users.all_users')
      },

      columns: Object.freeze([
        {
          titleText: `${this.$t('login.userName')}`,
          slots: { title: 'name' },
          dataIndex: 'name',
          key: 'name',
          scopedSlots: { customRender: 'userName' },
          sorter: true,
          sortDirections: ['descend', 'ascend']
          // sorter: (a, b) => sorting(a.name, b.name),
        },
        {
          titleText: `${this.$t('userManagement.FULL_NAME')}`,
          slots: { title: 'full-name' },
          dataIndex: 'full-name',
          ellipsis: true,
          sorter: true,
          sortDirections: ['descend', 'ascend']
        },
        {
          titleText: this.$t('userManagement.EMAIL'),
          slots: { title: 'email' },
          dataIndex: 'email',
          key: 'email',
          sorter: true,
          sortDirections: ['descend', 'ascend']
        },
        {
          titleText: `${this.$t('project.users.GROUPS')}`,
          slots: { title: 'group' },
          dataIndex: 'group',
          width: '390px',
          scopedSlots: { customRender: 'group' }
        }
      ]),
      tableHeight: 100,
      hasSearch: false
    }
  },
  computed: {
    ...mapGetters(['selectTreeNode']),

    selectProject: function() {
      return this.selectTreeNode && this.selectTreeNode.data
    }
  },

  created() {
    const _this = this

    // The listening subscription event is emitted
    eventListener.on('projectSelected', function(active) {
      if (active === 'users') {
        _this.selectedRowKeys = []
        _this.getUserTable()
      }
    })
  },

  mounted() {
    this.getTableHeight()
    window.addEventListener('resize', this.getTableHeight)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.getTableHeight)
  },

  activated() {
    this.selectedRowKeys = []
    this.getUserTable()
  },

  methods: {
    getTableHeight() {
      this.tableHeight = autoTableHeight(this.$refs.usersTable)
    },

    onRemoveUsers() {
      this.$mfConfirm({
        title: this.$t('confirm'),
        message: this.$t('project.users.removeUsers', {
          num: this.selectedRowKeys.length
        }),
        onConfirm: this.removeUsers
      })
    },

    onFilterClick() {
      this.$refs.filterSearchRef.onFilterClick()
    },

    onSearch(params) {
      this.SearchParams = params
      this.pagination.current = 1
      this.getUserTable()

      // if (params) {
      //   this.projectUsers = JSON.parse(JSON.stringify(this.projectUsersBackup))
      //   this.projectUsers = this.projectUsers.filter(item => {
      //     let isSearch = true
      //     isSearch = params.name ? item.name.toLocaleUpperCase().includes(params.name.toLocaleUpperCase()) : isSearch
      //     isSearch = isSearch ? params.fullName ? item['full-name'].toLocaleUpperCase().includes(params.fullName.toLocaleUpperCase()) : isSearch : isSearch
      //     isSearch = isSearch ? params.email ? item.email.toLocaleUpperCase().includes(params.email.toLocaleUpperCase()) : isSearch : isSearch
      //     isSearch = isSearch ? params.groups ? item.group.some(group => { return group['group-name'] === params.groups }) : isSearch : isSearch
      //     return isSearch
      //   })
      // }
    },

    onChangeAdmin() {
      if (this.isShowAdminOnly) this.pagination.current = 1
      this.getUserTable()
    },

    // batch remove users
    removeUsers(user) {
      const users =
        user ||
        this.selectedRowKeys.map((item) => {
          return { name: item }
        })

      return batchRemoveUsers({
        domain: this.selectProject['domain-name'],
        project: this.selectProject.name,
        users: { user: users }
      }).then(() => {
        this.$message.success(this.$t('project.users.removeUserSuccess'))
        this.selectedRowKeys = []
        this.pagination.current = 1
        this.getUserTable()
      })
    },
    onClickAddUser() {
      this.$refs.addUsers.onShow()
    },
    onShowFilter(value) {
      this.showFilter = value
      this.$nextTick(() => {
        this.getTableHeight()
      })
    },

    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },

    onSaved() {
      this.pagination.current = 1
      this.getUserTable()
    },

    // get project groups
    getGroups() {
      getProjectGroups({
        domain: this.selectProject['domain-name'],
        project: this.selectProject.name
      }).then((data) => {
        let groups = (data.groups && data.groups.group) || []
        groups = Array.isArray(groups) ? groups : [groups]
        this.groups = groups
      })
    },

    // get users in project
    getUserTable() {
      this.loading = true
      const startIndex =
        (this.pagination.current - 1) * this.pagination.pageSize + 1
      this.getGroups()
      return getAllUsersInProject(
        {
          domain: this.selectProject['domain-name'],
          project: this.selectProject.name,
          params: this.SearchParams
        },
        startIndex,
        this.pagination.pageSize,
        this.sort,
        this.isShowAdminOnly
      )
        .then((data) => {
          this.loading = false
          if (data.users && data.users.user) {
            this.projectUsers = Array.isArray(data.users.user)
              ? data.users.user
              : [data.users.user]
            this.packUserGroup()
            this.projectUsersBackup = JSON.parse(
              JSON.stringify(this.projectUsers)
            )
            this.pagination.total = parseInt(data.users['@total-results'])
            return this.projectUsers
          } else {
            this.projectUsers = []
            this.pagination.total = 0
            return []
          }
        })
        .catch(() => {
          this.loading = false
          return []
        })
        .finally(() => {
          this.$nextTick(() => {
            this.getTableHeight()
          })
        })
    },

    packUserGroup() {
      this.projectUsers = this.projectUsers.map((item) => {
        return {
          ...item,
          group: item.group
            ? Array.isArray(item.group)
              ? item.group
              : [item.group]
            : []
        }
      })
    },

    onUsersTableChange(pagination, _, sorter) {
      this.selectedRowKeys = []
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
      this.sort = sorter
      this.sort.order = sorter.order
        ? sorter.order === 'ascend'
          ? 'ASC'
          : 'DESC'
        : ''
      this.getUserTable()
    },

    // update user groups
    onGroupsChange(record, value) {
      if (value.length > 0) {
        updateUserGroups({
          domain: this.selectProject['domain-name'],
          project: this.selectProject.name,
          user: record.name,
          groups: value.map((item) => {
            return { 'group-name': item }
          })
        }).then(async(res) => {
          this.$message.success(
            this.$t('project.users.updateUserGroupSuccess')
          )
          record.group = Array.isArray(res.groups.group)
            ? res.groups.group
            : [res.groups.group]
          await this.getUserTable()
          // When only admin is displayed, remove admin group until projectUsers is no data, and the paging will be reduced by one
          if (
            this.isShowAdminOnly &&
            !this.projectUsers.length &&
            this.pagination.current !== 1
          ) {
            this.pagination.current = this.pagination.current - 1
            this.getUserTable()
          }
        })
      } else {
        this.$mfConfirm({
          iconType: 'Warning',
          title: this.$t('project.users.updateUserGroupErrorTitle'),
          message: this.$t('project.users.updateUserGroupError'),
          cancelText: this.$t('Cancel'),
          confirmText: this.$t('OK'),
          onConfirm: () => {
            return this.removeUsers([{ name: record.name }])
          }
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.mf-user-wrapper {
  height: 100%;
  //overflow: auto;
  left: -1px;
}
.user-top {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap:wrap;
  padding: 8px 0 24px 0;
  background-color: #fff;
}

.user-top-right{
  display:flex;
  align-items: center;
}

.user-filter-btn{
  margin:0 20px;
}

.show-admin {
  margin-top: 8px;
  margin-left:24px;
}

// .project-table /deep/ .ant-pagination-options-size-changer .ant-select-selection{
//   border: 1px solid #9B9B9D;
//   background-color: #ffffff;
//   height: 32px;
//   padding-top: 4px;
//   &:hover{
//     border: 1px solid #0073E7;
//   }
// }
/*.project-table /deep/ .ant-table-body {*/
/*  max-height: calc(100vh - 465px);*/
/*}*/
/*.short-project-table /deep/ .ant-table-body {*/
/*  max-height: calc(100vh - 525px) !important;*/
/*}*/
/*.mf-project-tab-lab .project-table /deep/ .ant-table-body {*/
/*  height: calc(100vh - 465px - 61px);*/
/*}*/
/*.mf-project-tab-lab .short-project-table /deep/ .ant-table-body {*/
/*  max-height: calc(100vh - 525px - 61px) !important;*/
/*}*/

.table-select {
  width: 370px;
}

.user-table {
  margin-top: 24px;
  border-left: none;
}

.user-tab {
  padding-bottom: 24px;
  position: relative;
}
/deep/ .ant-table-hide-scrollbar {
  overflow-y: hidden !important;
}
/deep/ .ant-table-placeholder {
  //display: none !important;
}
</style>
