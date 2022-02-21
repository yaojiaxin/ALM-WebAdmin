<template>
  <div class="users-management">
    <a-row type="flex" justify="space-between">
      <a-col>
        <a-button id="users-management-addbtn" v-serverType="[SERVER_TYPE.OnPremise]" type="primary" @click="addUser">
          <a-icon type="plus" style="color: #80bcf7" />
          {{ $t("userManagement.addUser") }}
        </a-button>
        <a-button v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_CREATE'],['SWITCHED_CUSTOMER_CONTEXT_USER_CREATE'])" id="users-management-addbtn" v-serverType="[SERVER_TYPE.Saas]" type="primary" @click="addSaasUser">
          <a-icon type="plus" style="color: #80bcf7" />
          {{ $t("userManagement.addUser") }}
        </a-button>
      </a-col>
      <a-col>
        <mf-badge :badge="isBadge">
          <a-button id="users-management-filterbtn" class="mf-btn-filter" @click="onFilterClick">
            <i :class="['iconfont',filterIcon]" />
            {{ $t("filter") }}
          </a-button>
        </mf-badge>
        <a-input-search
          id="users_search"
          v-model="searchUser"
          :placeholder="$t('inputSearchPlaceholder')"
          style="width: 237px; margin-left: 13px"
          @search="onSearch"
        />
      </a-col>
    </a-row>

    <!-- filter from -->
    <filter-form ref="filterForm" :is-show-filter="isShowFilter" :role="roleList" :policy="policyList" @getUsersList="getUsersList" @filterUser="filterUSers" />

    <!-- tool -->
    <userToolBar
      :selected-user-list="selectedArray"
      :ldap="isLdap"
      :role="roleList"
      :policy="policyList"
      @refresh="updateTable"
    />

    <!-- users table -->
    <div class="right-table">
      <a-table
        id="users-management_table"
        ref="usersTable"
        class="users-management_table general-table"
        row-key="id"
        :scroll="{y: tableHeight}"
        :columns="usersColumns"
        :data-source="usersList"
        :row-selection="{selectedRowKeys:selectedRowKeys,onChange:onSelectionChange}"
        :pagination="pagination"
        :loading="loading"
        @change="onUsersTableChange"
      >
        <!-- column title slots -->
        <template v-for="item in usersColumns">
          <a-tooltip
            :slot="item.dataIndex"
            :key="item.dataIndex"
            :title="item.titleText"
          >
            <span class="table-column-title-text">{{ item.titleText }}</span>
          </a-tooltip>
        </template>

        <a
          slot="name"
          slot-scope="text,item"
          :title="text"
          @click.prevent="onShowUserDetail(text,item)"
        >{{ text }}</a>
        <template slot="is-active" slot-scope="isActive">
          <span v-if="isActive" class="users-active_style"> {{ $t('userManagement.Active') }}</span>
          <span v-else class="users-nactive_style">{{ $t('userManagement.Inactive') }}</span>
        </template>
      </a-table>
    </div>

    <!--add user-->
    <user-add-op v-if="serverType === SERVER_TYPE.OnPremise" ref="userAdd" class="user-add-op-modal" :role="roleList" :ldap="isLdap" @added="addUserGetUsersList" />

    <user-add-saas v-if="serverType === SERVER_TYPE.Saas" ref="saasUserAdd" class="user-add-saas-modal" :role="roleList" :ldap="isLdap" @addSaased="addUserGetUsersList" />

    <user-detail ref="userDetail" :role="roleList" :policy="policyList" :ldap="isLdap" @reloadTable="updateTable" />

  </div>
</template>

<script>
import { fetchUsersList } from '@/api/user'
import userToolBar from './userToolBar/index'
import userAddOp from './components/UserAddOp'
import UserDetail from './components/UserDetail'
import FilterForm from './filterForm'
import { replaceDateLine } from '@/utils/validate.js'
import userAddSaas from './components/UserAddSaas'
import { SERVER_TYPE, PAGE_SIZE_25, AUTH_TYPE, PAGE_SIZE_LIST } from '@/store/const.js'
import { mapGetters } from 'vuex'
import MfBadge from '@/components/MFBadge'
// eslint-disable-next-line no-unused-vars
import { getParameterByParamName } from '@/api/configuration'
import { getRoles } from '@/api/role'
import { getAllPolicies } from '@/api/authentication'
// import { getAllLDAPOp, getAllLDAPSaas } from '@/api/customers'
import { HELP_ON_THIS_PAGE } from 'config/help'
import { autoTableHeight } from '@/utils'

export default {
  components: {
    userToolBar,
    userAddOp,
    UserDetail,
    FilterForm,
    userAddSaas,
    MfBadge
  },

  data() {
    return {
      AUTH_TYPE,
      SERVER_TYPE,
      getAllLDAP: null,
      // filter
      filterIcon: 'icon-spread',
      isShowFilter: true,
      isBadge: false,
      userFilterData: {},

      // table
      usersList: [],
      loading: true,
      sort: '',
      sortedInfo: {
        // order: 'ascend',
        // columnKey: 'name'
      },
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
      },
      // queryParam: {
      //   current: 1,
      //   pageSize: PAGE_SIZE
      // },
      // handle list
      selectedArray: [],
      addSuccessUser: null,
      selectedRowKeys: [],
      searchUser: '',
      roleList: [],
      policyList: [],
      ldapServerList: [],
      tableHeight: 100
    }
  },
  computed: {
    ...mapGetters(['serverType', 'customerId', 'activeCustomerId']),
    usersColumns() {
      let columns = [
        {
          titleText: this.$t('login.userName'),
          slots: { title: 'name' },
          dataIndex: 'name',
          key: 'name',
          scopedSlots: { customRender: 'name' },
          ellipsis: true,
          sorter: true,
          sortOrder: this.sortedInfo.columnKey === 'name' && this.sortedInfo.order
        },
        {
          titleText: this.$t('userManagement.FULL_NAME'),
          slots: { title: 'full-name' },
          dataIndex: 'full-name',
          key: 'full-name',
          ellipsis: true
        },
        {
          titleText: this.$t('userManagement.EMAIL'),
          slots: { title: 'email' },
          dataIndex: 'email',
          key: 'email',
          ellipsis: true
        },
        {
          titleText: this.$t('userManagement.ACTIVATION_STATUS'),
          slots: { title: 'is-active' },
          dataIndex: 'is-active',
          key: 'is-active',
          scopedSlots: { customRender: 'is-active' },
          ellipsis: true
        },
        {
          titleText: this.$t('userManagement.AUTO_DEACTIVATION_DATE'),
          slots: { title: 'expire-date' },
          dataIndex: 'expire-date',
          ellipsis: true,
          key: 'expire-date',
          customRender: (text) => {
            return replaceDateLine(text, /-/g, '/')
          }
        }, {
          titleText: this.$t('userManagement.lock'),
          slots: { title: 'is-locked' },
          dataIndex: 'is-locked',
          customRender: (text) => {
            return text === true ? this.$t('yes') : this.$t('no')
          }
        }, {
          titleText: this.$t('userManagement.ROLE'),
          slots: { title: 'role' },
          dataIndex: 'role',
          ellipsis: true,
          customRender: (text) => {
            if (text) {
              return text['role-name']
            }
          }
        }
      ]

      if (this.checkPermission(['MY_CUSTOMER_CONTEXT_USER_POLICY_SET'], ['SWITCHED_CUSTOMER_CONTEXT_USER_POLICY_SET'])) {
        columns = [...columns, {
          titleText: this.$t('userManagement.pwdPolicy'),
          slots: { title: 'policy' },
          dataIndex: 'policy',
          ellipsis: true,
          customRender: (text) => {
            if (text) {
              return text['policy-name']
            }
          }
        }]
      }
      return columns
    },
    // Determine if it is an LDAP environment
    isLdap() {
      return this.checkPermission(['LDAP_DETAILS'], ['SWITCHED_CUSTOMER_LDAP_DETAILS'])
    }
  },
  watch: {
    isShowFilter: function(val) {
      this.$nextTick(() => {
        this.getTableHeight()
      })
    },
    usersList: function(val) {
      if (this.pagination.current !== 1 && val.length === 0) {
        this.pagination.current -= 1
        this.updateTable()
      }
    }
  },
  mounted() {
    this.getUsersList()
    this.getRoleList()
    this.getPolicyList()
    // if (this.isLdap) {
    //   this.getLdapServerList()
    // }
    this.getTableHeight()
    window.addEventListener('resize', this.getTableHeight)
  },
  destroyed() {
    window.removeEventListener('resize', this.getTableHeight)
  },
  created() {
    this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.user)
  },
  methods: {
    getTableHeight() {
      this.tableHeight = autoTableHeight(this.$refs.usersTable)
    },
    getPolicyList() {
      getAllPolicies().then(res => {
        if (res.policies.policy) {
          Array.isArray(res.policies.policy) ? this.policyList = res.policies.policy : this.policyList.push(res.policies.policy)
        }
      }).catch(() => {

      })
    },
    getRoleList() {
      getRoles({
        query: '{has-permission[N]}'
      }).then(data => {
        if (data.roles.role) {
          Array.isArray(data.roles.role) ? this.roleList = data.roles.role : this.roleList.push(data.roles.role)
        }
      }).catch(() => {})
    },
    // getLdapServerList() {
    // this.getAllLDAP = this.serverType === SERVER_TYPE.Saas ? getAllLDAPSaas : getAllLDAPOp
    //   this.getAllLDAP().then(res => {
    //     const ldaps = this.serverType === this.SERVER_TYPE.OnPremise ? res['ldap-servers']['ldap-server'] || [] : res.ldaps.ldap || []
    //     Array.isArray(ldaps) ? this.ldapServerList = ldaps : this.ldapServerList.push(ldaps)
    //   }).catch(() => {})
    // },
    // Click to open the Op add user
    addUser() {
      this.$refs.userAdd.show()
    },

    // Click to open the Saas add user
    addSaasUser() {
      this.$refs.saasUserAdd.show()
    },

    // Click to open the filter options
    onFilterClick() {
      this.isShowFilter = !this.isShowFilter
    },
    addUserGetUsersList(addSuccessUser) {
      this.addSuccessUser = addSuccessUser
      this.updateTable()
    },
    // Get usertable data
    getUsersList(clear = true) {
      this.loading = true
      const startIndex = (this.pagination.current - 1) * this.pagination.pageSize + 1
      const pageSize = this.pagination.pageSize
      const data = clear ? {} : this.handleUserFilterData()
      const sort = this.sort || ''
      fetchUsersList(startIndex, pageSize, data, false, sort)
        .then((response) => {
          this.loading = false
          this.usersList = []
          const pagination = { ...this.pagination }
          pagination.total = parseInt(response.users['@total-results'])
          this.pagination = pagination
          if (response.users.user) {
            Array.isArray(response.users.user) ? this.usersList = response.users.user : this.usersList.push(response.users.user)
          }
          if (this.addSuccessUser) {
            const userIndex = this.usersList.findIndex(item => {
              return item.name === this.addSuccessUser.name
            })
            if (userIndex !== -1) {
              this.usersList.splice(userIndex, 1)
            }
            this.usersList.unshift(this.addSuccessUser)
            this.usersList.length > PAGE_SIZE_25 && this.usersList.pop()
            this.addSuccessUser = null
          }
        })
        .catch(() => {
          this.loading = false
        })
        .finally(() => {
          this.$nextTick(() => {
            this.getTableHeight()
          })
        })
      this.selectedArray = []
      this.selectedRowKeys = []
    },
    onUsersTableChange(pagination, _, sorter) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
      // this.queryParam.current = pagination.current
      // this.queryParam.pageSize = pagination.pageSize
      this.sort = sorter.order ? (sorter.order === 'ascend' ? 'ASC' : 'DESC') : ''
      this.sortedInfo = sorter
      this.getUsersList(false)
    },

    // Update usertable data
    updateTable() {
      // this.queryParam.current = 1
      // this.pagination.current = 1
      // this.sort = ''
      // this.sortedInfo = {
      // order: 'ascend',
      // columnKey: 'name'
      // }

      // clear form filter
      this.$refs.filterForm.onFilterUser()
      // this.getUsersList()
    },
    // Click user details drawer
    onShowUserDetail(userName, item) {
      this.$refs.userDetail.show(userName, item.id)
    },
    onSelectionChange(selectedRowKeys, selectedRows) {
      this.selectedArray = selectedRows
      this.selectedRowKeys = selectedRowKeys
    },

    async filterUSers(e) {
      // this.queryParam.current = 1
      // this.pagination.current = 3

      e ? this.userFilterData = e : this.userFilterData = {}
      await this.getUsersList(false)
    },

    // Show badge dot or not
    changeBadgeStatus(e) {
      this.isBadge = e
    },
    onSearch(value) {
      // this.queryParam.current = 1
      this.pagination.current = 1
      this.userFilterData = value
      // this.$refs.filterForm.setSearch(value)
      this.$refs.filterForm.isSearch = true
      this.getUsersList(false)
    },
    handleUserFilterData() {
      let data = ''
      if (typeof (this.userFilterData) === 'string') {
        data = this.searchUser.trim() ? `{*[*${this.searchUser.trim()}*]}` : undefined
      } else if (typeof (this.userFilterData) === 'object') {
        const query = []
        const obj = { ...this.userFilterData }
        for (const key in obj) {
          if (key === 'role') {
            query.push(`${key}.${Object.keys(obj[key])}[${Object.values(obj[key])}]`)
          } else if (key === 'policy') {
            query.push(`usse.${Object.keys(obj[key])}[${Object.values(obj[key])}]`)
          } else if (key === 'is-locked') {
            query.push(`usse.${key}[${obj[key]}]`)
          } else {
            query.push(`${key}[${obj[key]}]`)
          }
        }
        data = `{${query.join(';')}}`
      }
      return data
    }
  }
}
</script>

<style lang="less" scoped>
.users-management /deep/ .ant-table-hide-scrollbar{
  // ie title
  overflow-y:hidden !important;
  //overflow:hidden !important;
  margin-right: 21px !important;
}
.users-management {
  width: 100%;

  .users-management_table {

    /deep/ .ant-pagination li {
      margin-right: 0px !important;
    }

    .users-active_style {
      position: relative;
      color: #1aac60;
      padding-left: 14px;
    }

    .users-nactive_style {
      position: relative;
      color: #231ca5;
      padding-left: 14px;
    }

    .users-nactive_style::before,
    .users-active_style::before {
      display: inline-block;
      position: absolute;
      top: 45%;
      left: 0;
      content: " ";
      width: 6px;
      height: 6px;
      background: #231ca5;
      border-radius: 50%;
      // transform: translateY(-50%);
    }

    .users-active_style::before {
      background: #1aac60;
    }
  }
}
</style>
<style lang="less" >
#users_search.ant-input {

  background: transparent;
}

.users-management {

  .ant-form-inline .ant-form-item {
    margin-bottom: 24px;
  }

//   .ant-table-thead > tr > th, .ant-table-tbody > tr > td {
//   word-wrap: break-word;
// }

// .ant-table-tbody > tr > td {
//   overflow: hidden;
//   text-overflow: ellipsis;
//   white-space: nowrap;
// }

}

.users-table{
  width: 100%;
  height: calc(100vh - 220px);
  overflow: auto;
}

</style>

<style lang="less">
.user-add-op-modal,
.user-add-saas-modal {
  .ant-modal-body {
    overflow-x: hidden;
  }
}
</style>
