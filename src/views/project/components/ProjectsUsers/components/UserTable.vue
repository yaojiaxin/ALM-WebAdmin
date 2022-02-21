<template>
  <a-spin :spinning="allLoading">
    <div class="user-table-tools">
      <a-checkbox :checked="checkAll" @change="onCheckAllChange">
        {{ `${$t('project.select_all')} ${allUserNumber}` }}
      </a-checkbox>
      <a-input-search
        v-model="searchVal"
        :placeholder="$t('inputSearchPlaceholder')"
        class="search-input"
        @search="onSearchTable"
      />
    </div>

    <div class="mf-user-table" :style="total=== 0 ? { 'padding-bottom': '50px' } : {}">
      <a-table
        id="project_user_table"
        class="mf-table-pagination general-table"
        style="margin-right: 2px"
        row-key="name"
        :columns="usersColumns"
        :data-source="usersList"
        :row-selection="rowSelection()"
        :pagination="pagination"
        :loading="loading"
        :scroll="type === 'project' ? {y:300} : {y:200}"
        size="small"
        @change="onUsersTableChange"
      />

      <a-button
        id="project_view_selected"
        class="mf-btn-dashed mf-selected-btn"
        :style="total=== 0 ? { top: 'calc(100% - 35px)' } : ''"
        :disabled="selectedCount === 0"
        @click="onViewSelected"
      >
        {{ $t('project.ViewSelected') }} <span class="count">({{ selectedCount }})</span>
      </a-button>

      <view-selected ref="selected" @saveSelected="onSetSelected" />
    </div>
  </a-spin>
</template>

<script>
import { getUsersNotInProject } from '@/api/project'
import { fetchUsersList } from '@/api/user'
import ViewSelected from './ViewSelected'
import { PAGE_SIZE_25 } from '@/store/const'
import { sorting } from '@/utils'

export default {
  components: { ViewSelected },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    showSave: {
      type: Boolean,
      default: false
    },
    exclude: {
      type: Array,
      default: () => []
    },
    projectId: {
      type: [String, Number],
      default: ''
    },

    type: { // get users or users in project, type: project, type: user
      type: String,
      default: 'project'
    }
  },

  data() {
    return {
      loading: false,
      allLoading: false,
      checkAll: false,

      searchVal: '',

      selectedRowKeys: [],

      usersList: [],

      selectedUsers: [],

      init: true,
      allUserNumber: 0,
      total: 0,
      excludeName: [],

      pagination: {
        size: 'small',
        current: 1,
        pageSize: PAGE_SIZE_25,
        total: 0,
        showSizeChanger: true,
        pageSizeOptions: ['25', '50', '100'],
        showQuickJumper: true
      }

      // lastPageSize: PAGE_SIZE_25
    }
  },

  computed: {
    usersColumns() {
      return [
        {
          title: this.$t('login.userName'),
          dataIndex: 'name',
          key: 'name',
          ellipsis: true,
          sorter: (a, b) => sorting(a.name, b.name)
        },
        {
          title: this.$t('userManagement.FULL_NAME'),
          dataIndex: 'full-name',
          key: 'full-name',
          ellipsis: true,
          sorter: (a, b) => sorting(a['full-name'], b['full-name'])
        }
      ]
    },

    selectedCount() {
      if (this.checkAll) {
        return this.selectedUsers.length
      } else {
        return this.selectedRowKeys.length
      }
    }
  },

  watch: {
    value(val) {
      this.selectedUsers = val
    },

    selectedUsers(val) {
      this.$emit('input', val)
    }
  },

  created() {
    this.getUserList()
    this.excludeNameList = this.exclude.map(item => { return item['@name'] })
  },

  methods: {
    async onViewSelected() {
      this.$refs.selected.show(this.selectedUsers)
    },

    onRestTransfer() {
      this.selectedUsers = []
      this.checkAll = false
    },

    getAllUsers(arr, startIndex) {
      const startPage = (startIndex - 1) * 100 + 1
      this.allLoading = true
      this.$emit('update:showSave', true)
      const getFun = this.type === 'project' ? getUsersNotInProject : fetchUsersList
      const params = this.type === 'project' ? [this.projectId, { startIndex: startPage, pageSize: 100, name: '' }]
        : [startPage, 100, '', true]

      return getFun.apply(this, params).then(data => {
        if (data && data.users && data.users['@total-results'] > 0) {
          let users = data.users.user
          this.allUserNumber = parseInt(data.users['@total-results']) - (this.type === 'project' ? 0 : this.excludeNameList.length)

          users = Array.isArray(users) ? users : [users]
          if (this.type === 'user' && this.excludeNameList.length > 0) {
            users = users.filter(item => this.excludeNameList.indexOf(item.name) === -1)
          }
          arr.push(...users)
          this.getAllUsers(arr, ++startIndex)
        } else {
          this.allLoading = false
          this.$emit('update:showSave', false)
        }
      }).catch(() => {
        this.allLoading = false
      })
    },

    getUserList() {
      this.loading = true
      const startIndex = (this.pagination.current - 1) * this.pagination.pageSize + 1

      const getFun = this.type === 'project' ? getUsersNotInProject : fetchUsersList
      const params = this.type === 'project' ? [this.projectId, { startIndex: startIndex, pageSize: this.pagination.pageSize, name: this.searchVal }]
        : [startIndex, this.pagination.pageSize, this.searchVal, true]

      getFun.apply(this, params).then(data => {
        this.loading = false
        let users = (data.users && data.users.user) || []

        users = Array.isArray(users) ? users : [users]
        this.pagination = Object.assign(this.pagination, { total: parseInt(data.users['@total-results']) })
        this.total = parseInt(data.users['@total-results'])
        if (this.init) {
          this.allUserNumber = parseInt(data.users['@total-results']) - (this.type === 'project' ? 0 : this.excludeNameList.length)
          this.init = false
        }
        this.usersList = users
      }).catch(() => {
        this.loading = false
      })
    },

    async onCheckAllChange(e) {
      this.$emit('update:test', true)
      this.checkAll = e.target.checked
      this.selectedRowKeys = []
      this.usersList = [...this.usersList]
      if (this.checkAll) {
        var data = []
        await this.getAllUsers(data, 1).then(() => {
          this.selectedUsers = data
        })
      } else {
        this.selectedUsers = []
      }
    },
    async onSearchTable() {
      this.pagination.current = 1
      this.getUserList()

      if (this.checkAll) {
        var data = []
        await this.getAllUsers(data, 1)
        this.selectedUsers = data
      }
    },

    onSelectionChange(selectedRowKeys, selectedRows) {
      const copy = JSON.parse(JSON.stringify(this.selectedUsers))
      this.selectedRowKeys = selectedRowKeys
      selectedRows.forEach(item => {
        if (!this.selectedUsers.find(i => i.name === item.name)) {
          this.selectedUsers.push(item)
        }
      })

      copy.forEach(item => {
        if (!selectedRowKeys.includes(item.name)) this.selectedUsers.splice(this.selectedUsers.findIndex(i => i.name === item.name), 1)
      })
      // if (selectedRowKeys.length === this.total) {
      //   this.checkAll = true
      //   this.selectedRowKeys = []
      //   this.usersList = [...this.usersList]
      // }
    },

    onUsersTableChange(pagination) {
      // if (this.lastPageSize !== pagination.pageSize) {
      //   this.selectedRowKeys = []
      // }
      // this.lastPageSize = pagination.pageSize
      const pager = { ...this.pagination }
      pager.current = pagination.current
      pager.pageSize = pagination.pageSize
      this.pagination = pager

      this.getUserList()
    },

    onSetSelected(data) {
      if (data.length !== parseInt(this.total)) {
        this.checkAll = false
        this.selectedRowKeys = data.map(i => i.name)
        this.usersList = [...this.usersList]
        this.selectedUsers = data
      }
    },

    rowSelection() {
      const _this = this
      // this.usersList = [...this.usersList]

      return {
        getCheckboxProps: record => ({
          props: {
            disabled: _this.checkAll || _this.excludeNameList.includes(record.name)
          }
        }),
        selectedRowKeys: _this.selectedRowKeys,
        onChange: _this.onSelectionChange
      }
    }
  }
}
</script>

<style scoped lang="less">
  .search-input{
    width: 280px;
  }

  .user-table-tools{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .user-table{
    padding-right: 5px;
  }

  .mf-selected-btn{
    position: absolute;
    top: calc( 100% - 45px);
  }
  .mf-user-table{
    position: relative;

    .count{
      font-family: RegularWeb;
      color: #0079ef;
      margin-left: 8px;
    }
  }
  /deep/ .ant-table-hide-scrollbar{
    overflow-y:hidden !important;
  }
</style>
