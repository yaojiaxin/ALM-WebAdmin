<template>
  <div class="connected-users">
    <div class="connected-header">
      <div class="connected-left">
        <span class="connected-txt">
          {{ $t('monitoring.CONNECTED_USERS') }}
        </span>

        <div class="connected-btn-group">
          <confirm-disconnect :empty="isSelectedEmpty" :selected="send" @endDisconnect="refreshConnect(false)" />

          <send-msg :empty="isSelectedEmpty" :users="sendToEmail" :show="showReceive" @refresh="refreshConnect(false)" />

          <disconnect-projects :empty="isSelectedEmpty" @refresh="refreshConnect" />

          <send-projects />

          <connected-refresh @startRefresh="startRefresh" @refreshConnect="refreshConnect(false)" />

          <a-dropdown :trigger="['click']">
            <template #overlay>
              <a-menu>
                <a-menu-item id="a-group-by-project" key="1" @click="onChangeGroup(1)">{{ $t('monitoring.group_by_project') }}</a-menu-item>
                <a-menu-item id="a-group-by-user" key="2" @click="onChangeGroup(2)">{{ $t('monitoring.group_by_user') }}</a-menu-item>
                <a-menu-item id="a-group-clear" key="3" @click="onChangeGroup(3)">{{ $t('monitoring.clear_all') }}</a-menu-item>
              </a-menu>
            </template>
            <a-tooltip
              :title="$t('monitoring.Groups')"
            >
              <a-button
                id="a-group-by"
                class="tool-dropdown-btn"
                type="link"
              >
                <i class="iconfont icon-GroupBy tool-dropdown-btn-i" />
                <i class="iconfont icon-CaretDown tool-dropdown-btn-i tool-CaretDown-btn-i" />
              </a-button>
            </a-tooltip>
          </a-dropdown>
        </div>
      </div>

      <div class="filter-btn">
        <mf-badge :badge="isBadge">
          <a-button
            id="connected-filter-btn"
            class="mf-btn-filter"
            :disabled="filterDisable"
            @click="onFilterClick"
          >
            <i :class="['iconfont',filterIcon]" />
            {{ $t("filter") }}
          </a-button>
        </mf-badge>
      </div>
    </div>
    <connected-filter
      v-show="isShowFilter"
      ref="connectedFilterRef"
      :filter-disable="filterDisable"
      @filterConnect="filterConnect"
    />
    <div class="right-table">
      <a-table
        v-show="!groupUser && !groupProject"
        id="connect-user-tboday"
        ref="connectUserTable"
        class="connected-users_table general-table"
        row-key="id"
        :scroll="{y: userTableHeight}"
        :columns="columns"
        :data-source="originList"
        :row-selection="{selectedRowKeys:selectedRowKeys,onChange:onSelectionChange}"
        :pagination="pagination"
        :loading="loading"
        @change="onUsersTableChange"
      >
        <!-- column title slots -->
        <template v-for="(item,index) in columnsTitleArr">
          <a-tooltip :slot="item" :key="index" :title="item">
            <span class="table-column-title-text">{{ item }}</span>
          </a-tooltip>
        </template>

        <template slot="is-on" slot-scope="isOn">
          <span v-if="isOn" class="users-active_style">On</span>
          <span v-else>-</span>
        </template>
      </a-table>
    </div>
    <div class="right-table">
      <a-table
        v-show="groupProject || groupUser"
        id="connect-group-tboday"
        ref="connectGroupTable"
        class="connected-users_table general-table"
        row-key="id"
        :scroll="{y: groupTableHeight}"
        :columns="groupColumns"
        :data-source="groupList"
        :row-selection="rowSelection"
        :pagination="false"
        :loading="loading"
        :indent-size="10"
        :expanded-row-keys.sync="expandedRowKeys"
        @expand="groupExpand"
      >
        <!-- column title slots -->
        <template v-for="(item,index) in columnsTitleArr">
          <a-tooltip :slot="item" :key="index" :title="item">
            <span class="table-column-title-text">{{ item }}</span>
          </a-tooltip>
        </template>

        <template slot="domain" slot-scope="domain, record">
          <span @click="groupExpandByName(record)">{{ domain }}</span>
        </template>

        <template slot="is-on" slot-scope="isOn">
          <span v-if="isOn" class="users-active_style">On</span>
          <span v-else>-</span>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script>
import { mixinTableTreeSelect } from './components/mixins/mixinTableTreeSelect'
import ConnectedFilter from '@/views/monitoring/components/ConnectedFilter'
import ConfirmDisconnect from '@/views/monitoring/components/ConfirmDisconnect'
import SendMsg from './components/SendMsg.vue'
import DisconnectProjects from './components/DisconnectProjects.vue'
import SendProjects from './components/SendProjects.vue'
import ConnectedRefresh from './components/ConnectedRefresh.vue'
import { getAllSessions, getGroupSessions, groupBySessions } from '@/api/connection'
import { getAllLicensesType } from '@/api/license'
import { PAGE_SIZE_25, PAGE_SIZE_LIST } from '@/store/const'
import transformGroup from './components/ConnectedGroupBy'
import MfBadge from '@/components/MFBadge'
import moment from 'moment'
import { HELP_ON_THIS_PAGE } from 'config/help'
import { autoTableHeight } from '@/utils'

export default {
  components: {
    ConnectedFilter,
    ConfirmDisconnect,
    SendMsg,
    DisconnectProjects,
    SendProjects,
    ConnectedRefresh,
    MfBadge
  },
  mixins: [mixinTableTreeSelect],
  data() {
    return {
      timer: null,
      isSelectedEmpty: true,
      isShowFilter: false,
      groupUser: false,
      groupProject: false,
      filterIcon: 'icon-spread',
      sendToList: [],
      sendToUserList: [],
      sort: 'DESC',
      sortedInfo: {
        order: 'descend',
        columnKey: 'domainName'
      },
      filterData: {},
      loading: false,
      send: '',
      sendToEmail: '',
      pagination: {
        size: 'small',
        current: 1,
        pageSize: PAGE_SIZE_25,
        showSizeChanger: true,
        showTotal: (total) =>
          this.$t('totalItems') + ' ' + total,
        pageSizeOptions: PAGE_SIZE_LIST,
        onShowSizeChange: (current, pageSize) => { this.pageSize = pageSize }
      },
      param: {
        current: 1,
        pageSize: PAGE_SIZE_25
      },
      expandedRowKeys: [],
      selectedRowKeys: [],
      selectedRows: [],
      originList: [],
      groupList: [],
      showReceive: '',
      groupRowKeys: [],
      selectedGroupList: [],
      licenseUsages: [],
      isBadge: false,
      filterDisable: false,
      columnsTitleArr: [
        this.$t('DOMAIN'),
        this.$t('monitoring.project_name'),
        this.$t('login.userName'),
        this.$t('monitoring.host'),
        this.$t('monitoring.login_time'),
        this.$t('monitoring.last_action'),
        this.$t('monitoring.client_type'),
        this.$t('monitoring.licenses_in_use')
      ],
      userTableHeight: 100,
      groupTableHeight: 100
    }
  },
  computed: {
    columnList: function() {
      return this.licenseUsages.map(item => {
        this.columnsTitleArr.push(item['license-type'])
        return {
          slots: { title: item['license-type'] },
          dataIndex: item['license-type'],
          ellipsis: true,
          width: '10%',
          scopedSlots: { customRender: 'is-on' }
        }
      })
    },
    columns: function() {
      return [{
        slots: { title: this.$t('DOMAIN') },
        dataIndex: 'domainName',
        width: '15%',
        ellipsis: true,
        sorter: true,
        // defaultSortOrder: 'descend',
        sortDirections: ['descend', 'ascend'],
        sortOrder: this.sortedInfo.columnKey === 'domainName' && this.sortedInfo.order
      }, {
        slots: { title: this.$t('monitoring.project_name') },
        dataIndex: 'projectName',
        ellipsis: true,
        sorter: true,
        sortOrder: this.sortedInfo.columnKey === 'projectName' && this.sortedInfo.order
      }, {
        slots: { title: this.$t('login.userName') },
        dataIndex: 'userName',
        ellipsis: true,
        sorter: true,
        sortOrder: this.sortedInfo.columnKey === 'userName' && this.sortedInfo.order
      }, {
        slots: { title: this.$t('monitoring.host') },
        dataIndex: 'host',
        ellipsis: true,
        sorter: true,
        sortOrder: this.sortedInfo.columnKey === 'host' && this.sortedInfo.order
      }, {
        slots: { title: this.$t('monitoring.login_time') },
        dataIndex: 'loginTime',
        ellipsis: true,
        customRender: (text) => {
          return moment(text).format('YYYY/MM/DD HH:mm:ss')
        }
      }, {
        slots: { title: this.$t('monitoring.last_action') },
        dataIndex: 'lastAction',
        ellipsis: true,
        customRender: (text) => {
          return moment(text).format('YYYY/MM/DD HH:mm:ss')
        }
      }, {
        slots: { title: this.$t('monitoring.client_type') },
        dataIndex: 'clientType',
        ellipsis: true,
        sorter: true,
        sortOrder: this.sortedInfo.columnKey === 'clientType' && this.sortedInfo.order
      }, {
        slots: { title: this.$t('monitoring.licenses_in_use') },
        dataIndex: 'licensesInUse',
        ellipsis: true,
        children: this.columnList
      }]
    },
    groupColumns: function() {
      return [{
        slots: { title: this.$t('DOMAIN') },
        dataIndex: 'domainName',
        scopedSlots: { customRender: 'domain' },
        width: '20%'
      }, {
        slots: { title: this.$t('monitoring.project_name') },
        dataIndex: 'projectName',
        ellipsis: true
      }, {
        slots: { title: this.$t('login.userName') },
        dataIndex: 'userName',
        ellipsis: true
      }, {
        slots: { title: this.$t('monitoring.host') },
        dataIndex: 'host',
        ellipsis: true
      }, {
        slots: { title: this.$t('monitoring.login_time') },
        dataIndex: 'loginTime',
        ellipsis: true
      }, {
        slots: { title: this.$t('monitoring.last_action') },
        dataIndex: 'lastAction',
        ellipsis: true
      }, {
        slots: { title: this.$t('monitoring.client_type') },
        dataIndex: 'clientType',
        ellipsis: true
      }, {
        slots: { title: this.$t('monitoring.licenses_in_use') },
        dataIndex: 'licensesInUse',
        ellipsis: true,
        children: this.columnList
      }]
    },
    disconnectObj: function() {
      return {
        title: this.$t('monitoring.confirm_disconnection'),
        content: this.$t('monitoring.disconnectContent'),
        discard: this.$t('no'),
        onSubmit: this.$t('yes')
      }
    },
    rowSelection() {
      return {
        // getCheckboxProps: record => ({
        //   props: {
        //     disabled: record.domainName.indexOf('PROJECT') > -1 || record.domainName.indexOf('USERNAME') > -1 || record.domainName.indexOf('DOMAIN') > -1, // Column configuration not to be checked
        //     name: record.name
        //   }
        // }),
        selectedRowKeys: this.groupRowKeys,
        onSelectAll: this.onSelectAll,
        onSelect: this.onSelect,
        // onChange: this.onGroupSelect,
        columnTitle: ' ',
        getCheckboxProps: record => ({
          props: {
            disabled: record.disabled
          }
        })
      }
    }
  },
  watch: {
    isShowFilter: function(val) {
      this.$nextTick(() => {
        if (!this.groupUser && !this.groupProject) {
          this.getUserTableHeight()
        } else {
          this.getGroupTableHeight()
        }
      })
    }
  },
  created() {
    this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.monitoring['Connected Users'])

    this.columnsTitleArr = [
      this.$t('DOMAIN'),
      this.$t('monitoring.project_name'),
      this.$t('login.userName'),
      this.$t('monitoring.host'),
      this.$t('monitoring.login_time'),
      this.$t('monitoring.last_action'),
      this.$t('monitoring.client_type'),
      this.$t('monitoring.licenses_in_use')
    ]
    this.getAllLicenses()
  },
  mounted() {
    this.getUserTableHeight()
    this.getAllList()
    window.addEventListener('resize', this.getUserTableHeight)
    window.addEventListener('resize', this.getGroupTableHeight)
  },
  beforeDestroy() {
    clearInterval(this.timer)
    this.timer = null
    window.removeEventListener('resize', this.getUserTableHeight)
    window.removeEventListener('resize', this.getGroupTableHeight)
  },
  methods: {
    getUserTableHeight() {
      this.userTableHeight = autoTableHeight(this.$refs.connectUserTable)
    },
    getGroupTableHeight() {
      this.groupTableHeight = autoTableHeight(this.$refs.connectGroupTable, 26, 0)
    },
    // get licenses
    getAllLicenses() {
      getAllLicensesType('is-assignable[Y]').then((res) => {
        const license = res['site-licenses'].license
        if (license) {
          let licenseArr = []
          Array.isArray(license) ? licenseArr = license : licenseArr.push(license)
          this.licenseUsages = licenseArr.map(item => {
            return {
              'license-type': item.name
            }
          })
        }
      }).finally(() => {
        this.$nextTick(() => {
          this.getUserTableHeight()
        })
      })
    },

    // get all connected users
    getAllList(clear = true, prevSelectedLoginIds = []) {
      let arr = []
      this.loading = true
      const startIndex = (this.param.current - 1) * this.param.pageSize + 1
      const pageSize = this.param.pageSize
      const data = clear ? {} : { ...this.filterData }
      const sort = this.sort || ''
      let sortColumnKey = ''
      switch (this.sortedInfo.columnKey) {
        case 'domainName':
          sortColumnKey = 'domain'
          break
        case 'projectName':
          sortColumnKey = 'project'
          break
        case 'userName':
          sortColumnKey = 'login-session.username'
          break
        case 'host':
          sortColumnKey = 'login-session.host'
          break
        case 'clientType':
          sortColumnKey = 'login-session.client-type'
          break
      }
      getAllSessions(startIndex, pageSize, data, sort, sortColumnKey).then((res) => {
        this.loading = false
        const pagination = { ...this.pagination }
        pagination.total = parseInt(res['site-connections']['@total-results'])
        this.pagination = pagination
        // Determine if it is an array
        if (res['site-connections']['site-connection']) {
          Array.isArray(res['site-connections']['site-connection']) ? (arr = res['site-connections']['site-connection'])
            : (arr.push(res['site-connections']['site-connection']))
        }

        this.originList = arr.map((item, index) => {
          return {
            id: index + 1,
            loginId: item['login-session-id'],
            domainName: item.domain,
            projectName: item.project,
            userName: item.username,
            host: item.host,
            loginTime: item['login-time'],
            lastAction: item['last-action'],
            clientType: item['client-type']
          }
        })

        arr.forEach((a, index) => {
          const licenseData = a['license-usage'] ? (Array.isArray(a['license-usage']) ? a['license-usage'] : [a['license-usage']]) : null
          if (licenseData) {
            licenseData.forEach(l => {
              this.originList[index][l['license-label']] = true
            })
          }
        })

        // remain checkbox select
        if (prevSelectedLoginIds.length > 0) {
          const currLoginIds = this.originList.map(item => item.loginId)
          const currSelectedRowKeys = []

          prevSelectedLoginIds.forEach(loginId => {
            const index = currLoginIds.indexOf(loginId)
            if (index !== -1) {
              currSelectedRowKeys.push(this.originList[index].id)
            }
          })

          this.selectedRowKeys = currSelectedRowKeys
          this.isSelectedEmpty = this.selectedRowKeys.length === 0
        }
      }).catch(() => {
        this.loading = false
      }).finally(() => {
        this.$nextTick(() => {
          this.getUserTableHeight()
        })
      })
    },

    // get different groupby value(user,project)
    getGroupList(num) {
      let group = ''
      if (num === 1) {
        group = 'project'
      } else if (num === 2) {
        group = 'username'
      }
      this.groupList = []
      this.loading = true
      groupBySessions(group).then((req) => {
        const res = req.GroupByHeaders.GroupByHeader
        // Process how the interface retrieves Group By data
        this.groupList = transformGroup(res)
        this.loading = false
      }).catch(() => {
        this.loading = false
      }).finally(() => {
        this.$nextTick(() => {
          this.getGroupTableHeight()
        })
      })
    },

    // table change event
    onSelectionChange(selectedRowKeys, selectedRows) {
      this.selectedList = selectedRows
      this.selectedRowKeys = selectedRowKeys
      this.selectedList.length ? this.isSelectedEmpty = false : this.isSelectedEmpty = true
      this.sendToList = []
      this.sendToUserList = []
      this.selectedList.forEach(item => {
        this.sendToList.push(item.loginId)
        this.sendToUserList.push(item.userName)
      })
      this.sendToEmail = `login-session.username[${[...new Set(this.sendToUserList)].toString().replace(/,/g, ' OR ')}]`
      this.showReceive = [...new Set(this.sendToUserList)].toString()
      this.send = `login-session.login-session-id[${this.sendToList.toString().replace(/,/g, ' OR ')}]`
    },

    // show filter or not
    onFilterClick() {
      this.isShowFilter = !this.isShowFilter
    },

    filterConnect(e) {
      this.pagination.current = 1
      this.param.current = 1
      e ? this.filterData = e : this.filterData = {}
      this.getAllList(false, this.getPrevSelectedLoginIds())
      clearInterval(this.timer)
      this.timer = null
    },

    // Show badge dot or not
    changeBadgeStatus(e) {
      this.isBadge = e
    },

    // when use Groups By Project / Groups By User
    // hide and reset filter form, disable Filter btn
    disableFilter() {
      this.isShowFilter = false
      this.$refs.connectedFilterRef.resetFilter()
    },

    // change table status(users, projects)
    onChangeGroup(num) {
      if ((num === 1 || num === 2) && this.groupList.length > 0) {
        this.expandedRowKeys = null
      }
      this.groupProject = false
      this.groupUser = false
      this.filterDisable = false

      if (num === 1) {
        this.groupUser = false
        this.groupProject = true
        this.getGroupList(num)
        this.filterDisable = true

        this.disableFilter()
      } else if (num === 2) {
        this.groupUser = true
        this.groupProject = false
        this.getGroupList(num)
        this.filterDisable = true

        this.disableFilter()
      } else {
        this.pagination.current = 1
        this.param.current = 1
        this.getAllList()
      }
      this.isSelectedEmpty = true
      this.selectedRowKeys = []
      this.selectedList = []
      this.groupRowKeys = []
      this.send = ''
      this.sendToEmail = ''
      this.showReceive = ''
      this.$nextTick(() => {
        this.getUserTableHeight()
        this.getGroupTableHeight()
      })
    },

    // page refresh
    startRefresh(value) {
      clearInterval(this.timer)
      this.timer = null
      const seconds = value * 1000
      this.timer = setInterval(() => {
        this.loading = true
        this.send = ''
        this.sendToEmail = ''

        this.refreshConnect(false)

        setTimeout(() => {
          this.loading = false
        }, 1000)
      }, seconds)
    },

    // refresh groupby kind
    refreshConnect(needReturnToFirst = true) {
      if ((this.groupProject || this.groupUser) && this.groupList.length > 0) {
        this.expandedRowKeys = null
      }
      if (this.groupProject) {
        this.groupRowKeys = []
        this.getGroupList(1)
      } else if (this.groupUser) {
        this.groupRowKeys = []
        this.getGroupList(2)
      } else {
        this.$refs.connectedFilterRef.restoreFilter({ ...this.filterData })
        if (needReturnToFirst) {
          this.doCommonRefresh()
        } else {
          this.doRemainRefresh()
        }
      }
    },

    // show first page after request (vm mounted/disconnect from domains/projects)
    doCommonRefresh() {
      this.selectedRowKeys = []
      this.isSelectedEmpty = true
      this.param.current = 1
      this.pagination.current = 1
      this.sort = 'DESC'
      this.sortedInfo = {
        order: 'descend',
        columnKey: 'domainName'
      }
      this.getAllList()
    },

    // show results remaining filter/sort/check... after request (refresh/disconnect)
    doRemainRefresh() {
      // whether to change pagination
      if (this.isLastPage()) {
        // disconnect whole page (maybe the last)
        this.goToPreviousPage()
      }

      this.getAllList(false, this.getPrevSelectedLoginIds())
    },

    isLastPage() {
      return Math.ceil((this.pagination.total || 0) / this.pagination.pageSize) === this.pagination.current
    },

    goToPreviousPage() {
      if (this.param.current > 1) {
        this.param.current -= 1
        this.pagination.current = this.param.current
      } else {
        this.param.current = this.pagination.current = 1
      }
    },

    // record selectedRowLoginIds to compare with data after new request
    getPrevSelectedLoginIds() {
      return this.selectedRowKeys.map(key => this.originList?.[key - 1]?.loginId) || []
    },

    // groupby(users, projects) select table row
    onGroupSelect(selectedRowKeys, selectedRows) {
      this.selectedGroupList = selectedRows
      this.groupRowKeys = selectedRowKeys
      this.send = ''
      this.sendToEmail = ''
      let userList = []
      let idList = []
      let projectList = []
      let domainList = []
      let showList = []
      const tempDomain = []
      const tempProject = []
      const tempUser = []
      const tempId = []
      selectedRows.forEach(item => {
        if (item.domainName.indexOf('DOMAIN') > -1 && this.groupProject) {
          const s = item.domainName.match(/(DOMAIN: )(.*)/)[2]
          domainList.push(s)
          tempDomain.push(s)
          showList.push(s)
        } else if (item.domainName.indexOf('PROJECT') > -1 && this.groupProject) {
          const p = item.domainName.match(/(PROJECT: )(.*)/)[2]
          projectList.push(p)
          tempProject.push(p)
          showList.push(p)
        } else if (item.domainName.indexOf('USERNAME') > -1 && this.groupUser) {
          userList.push(item.name)
          tempUser.push(item.name)
          showList.push(item.name)
        } else {
          idList.push(item.loginId)
          // userList.push(item.userName)
          // tempUser.push(item.userName)
          tempId.push(item.loginId)
          showList.push(item.userName)
        }
      })
      // console.log(domainList)
      // console.log(projectList)
      // console.log(userList)
      // console.log(idList)
      domainList = `domain[${domainList.toString().replace(/,/g, ' OR ')}]`
      projectList = `project[${projectList.toString().replace(/,/g, ' OR ')}]`
      userList = `login-session.username[${[...new Set(userList)].toString().replace(/,/g, ' OR ')}]`
      idList = `login-session.login-session-id[${idList.toString().replace(/,/g, ' OR ')}]`
      showList = [...new Set(showList)].toString()
      // console.log(domainList)
      // console.log(projectList)
      // console.log(userList)
      // console.log(showList)
      if (this.groupProject) {
        tempDomain.length ? this.send += `${domainList};` : this.send += ''
        tempProject.length ? this.send += `${projectList};` : this.send += ''
        tempId.length ? this.send += `${idList};` : this.send += ''
        tempDomain.length ? this.sendToEmail = `${domainList};` : this.sendToEmail = ''
        tempProject.length ? this.sendToEmail += `${projectList};` : this.sendToEmail += ''
        tempUser.length ? this.sendToEmail += `${userList};` : this.sendToEmail += ''
        this.showReceive = showList
      } else if (this.groupUser) {
        tempId.length ? this.send += `${idList};` : this.send += ''
        tempUser.length ? this.send += `${userList};` : this.send += ''
        tempId.length ? this.sendToEmail += `${idList};` : this.sendToEmail += ''
        tempUser.length ? this.sendToEmail += `${userList};` : this.sendToEmail += ''
        this.showReceive = showList
      }
      this.selectedGroupList.length ? this.isSelectedEmpty = false : this.isSelectedEmpty = true
    },
    onUsersTableChange(pagination, _, sorter) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize

      this.param.current = pagination.current
      this.param.pageSize = pagination.pageSize
      this.sort = sorter.order ? (sorter.order === 'ascend' ? 'ASC' : 'DESC') : ''
      this.sortedInfo = sorter
      this.getAllList(false)
    },

    //  get groupby data asynchronously
    groupExpandByName(record) {
      if (this.expandedRowKeys.indexOf(record.id) === -1) {
        this.expandedRowKeys.push(record.id)
        this.groupExpand(true, record)
      } else {
        this.expandedRowKeys.splice(this.expandedRowKeys.indexOf(record.id), 1)
        this.groupExpand(false, record)
      }
    },
    groupExpand(expanded, record) {
      if (record.domainName.indexOf('PROJECT') > -1 || record.domainName.indexOf('USER') > -1) {
        let data = {}
        if (this.groupProject) {
          data = {
            group: 'project',
            value: record.name
          }
        } else if (this.groupUser) {
          data = {
            group: 'user',
            value: record.name
          }
        }
        let arr = []
        if (record.children.length === 0) {
          getGroupSessions(data).then((res) => {
            // Determine if it is an array
            if (res['site-connections']['site-connection']) {
              Array.isArray(res['site-connections']['site-connection']) ? (arr = res['site-connections']['site-connection'])
                : (arr.push(res['site-connections']['site-connection']))
              record.children = arr.map(item => {
                return {
                  id: record.id + item.domain + item.project + item.username + item['login-session-id'],
                  loginId: item['login-session-id'],
                  domainName: item.domain,
                  projectName: item.project,
                  userName: item.username,
                  host: item.host,
                  loginTime: item['login-time'],
                  lastAction: item['last-action'],
                  clientType: item['client-type'],
                  isChecked: false,
                  disabled: !!record.isChecked
                }
              })
              // parent if checked, the children must be disabled
              if (record.isChecked) {
                this.defaultChildCheck(record.children)
              }
              arr.forEach((a, index) => {
                const licenseData = a['license-usage'] ? (Array.isArray(a['license-usage']) ? a['license-usage'] : [a['license-usage']]) : null
                if (licenseData) {
                  licenseData.forEach(l => {
                    record.children[index][l['license-label']] = true
                  })
                }
              })
            }
          })
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/variables.less';
  .connected-header{
    width: 100%;
    height: 57px;
    border: 1px solid rgba(101, 102, 104, 0.16);
    box-shadow: 2px 0 0 #dcdedf;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #ffffff;
  }

  .connected-left{
    display: flex;
    align-items: center;
    margin-left: 24px;
  }

  .connected-txt{
    font-family: MediumWeb, serif;
    font-size: 16px;
    font-weight: 500;
    color: #000000;
    line-height: 19px;
  }

  .connected-users_table {
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
    }

    .users-active_style::before {
      background: #1aac60;
    }

    ///deep/ .ant-select-selection{
      // border: 1px solid #9B9B9D;
      // background-color: #ffffff;
      // height: 32px;
      // padding-top: 4px;
      // &:hover{
      //   border: 1px solid #0073E7;
      // }
    //}
  }

  .connected-btn-group{
    padding-left: 30px;
  }

  .filter-btn{
    margin-right: 24px;
  }

  .connected-btn{
    margin-left: 24px;
  }

  .connected-users /deep/.ant-table{
    overflow: auto;
  }
</style>
