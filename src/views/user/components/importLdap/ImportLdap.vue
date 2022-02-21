<template>
  <mf-drawer
    placement="right"
    :visible="visible"
    width="760"
    :drawer-style="{ position: 'relative' }"
    @close="onClose"
  >
    <!-- title -->
    <span slot="title">
      {{ $t('userManagement.userToolBar.IUFLDT') }}
      <mf-help-btn :help="IMPORT_LDAP_USER_TREE" />
    </span>

    <div class="tree-over-height">
      <mf-form ref="importLdapForm" class="import-ldap-form" :model="form">

        <!-- server -->
        <a-form-model-item class="form-item-top" :label="$t('sever')" :label-col="{ span: 3 }" :wrapper-col="{ span: 6 }" prop="server">
          <a-select id="import_ldap_server" v-model="form.server" class="sever-select" @change="changeServer()">
            <a-select-option v-for="item in ldapServers" :key="item['ldap-id']" :value="item['ldap-id']" :title="item.label">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <!-- filter -->
        <div class="form-item-bottom">
          <a-form-model-item :label="$t('userManagement.FilterMode')" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" prop="searchMode">
            <a-radio-group id="import_ldap_filter_mode" v-model="form.searchMode" @change="changeMode">
              <a-radio value="basic">
                {{ $t('userManagement.BasicFilter') }}
              </a-radio>
              <a-radio value="advance" style="margin-left: 40px;">
                {{ $t('userManagement.AdvanceFilter') }}
              </a-radio>
            </a-radio-group>
          </a-form-model-item>
          <a-form-model-item :label="$t('userManagement.DirectoryBase')" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" prop="baseShow">
            <a-input id="import_ldap_directory_base" v-model="form.baseShow" disabled style="width: 60%;" />
          </a-form-model-item>
          <a-form-model-item class="inline-input-and-btn has-help-span" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" :prop="form.searchMode === 'basic' ? 'keyword' : 'filter'">
            <span slot="label" :title="form.searchMode === 'basic' ? $t('userManagement.FilterByKeyword') : $t('userManagement.FILTER')" class="with-icon">
              <span class="only-text">{{ form.searchMode === 'basic' ? $t('userManagement.FilterByKeyword') : $t('userManagement.FILTER') }}</span>
              <a-tooltip placement="top" :title="form.searchMode === 'basic' ? $t('userManagement.FilterByKeywordTooltip') : $t('userManagement.FilterTooltip')">
                <a-icon type="question-circle" />
              </a-tooltip>
            </span>
            <a-input v-if="form.searchMode === 'basic'" id="import_ldap_filter_by_keyword" v-model="form.keyword" class="inline-input">
              <clear-icon slot="suffix" :value="form.keyword" @clear="form.keyword = ''" />
            </a-input>
            <div v-else class="filter-input">
              <a-tooltip placement="top" :title="(form.filter ? '&' : '') + form.baseFilter">
                <span id="import_ldap_base_filter" ref="base-filter" class="base-filter">{{ (form.filter ? '&' : '') + form.baseFilter }}</span>
              </a-tooltip>
              <a-input id="import_ldap_filter" v-model="form.filter" @blur="checkFilter">
                <clear-icon slot="suffix" :value="form.filter" @clear="form.filter = ''" />
              </a-input>
            </div>
            <span class="inline-btn">
              <a-button id="import_ldap_apply" type="primary" @click="onApply">{{ $t('Apply') }}</a-button>
              <a-button id="import_ldap_reset" class="mf-btn-dashed" style="margin-left: 8px;" @click="onShowLdapServerTree">{{ $t('userManagement.userToolBar.Reset') }}</a-button>
            </span>
          </a-form-model-item>
          <a-form-model-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
            <span id="import_ldap_filter-criteria" class="filter-criteria">
              <span class="label">{{ $t('userManagement.FilterCriteria') }}:</span>
              <a-tooltip placement="topLeft">
                <span slot="title">
                  {{ $t('userManagement.directoryBase') }}='{{ form.filterCriteria.directoryBase }}';
                  {{ $t('filter') }}='{{ (form.filterCriteria.group === '' ? '' : '&') + form.filterCriteria.filter + form.filterCriteria.group }}';
                  {{ $t('userManagement.Keyword') }}='{{ form.filterCriteria.keyword }}';
                </span>
                <span class="item">
                  {{ $t('userManagement.directoryBase') }}='
                  <span class="value">{{ form.filterCriteria.directoryBase }}</span>
                  ';
                </span>
                <span class="item">
                  {{ $t('filter') }}='
                  <span class="value">{{ (form.filterCriteria.group === '' ? '' : '&') + form.filterCriteria.filter + form.filterCriteria.group }}</span>
                  ';
                </span>
                <span class="item">
                  {{ $t('userManagement.Keyword') }}='
                  <span class="value">{{ form.filterCriteria.keyword }}</span>
                  ';
                </span>
              </a-tooltip>
            </span>
          </a-form-model-item>
        </div>

      </mf-form>

      <!-- table -->
      <div class="table-box">

        <!-- tree -->
        <div v-show="form.isTreeData">
          <mf-ag-grid-ldap
            id="import_ldap_tree"
            ref="ldapGridTree"
            :height="tableHeight"
            :loading="loading"
            :grid-options="gridOptions"
            @on-grid-ready="gridReady"
            @row-selected="onRowSelected"
            @row-group-opened="onRowGroupOpened"
          />
        </div>

        <!-- list -->
        <div v-show="!form.isTreeData">
          <mf-ag-grid
            id="import_ldap_list"
            ref="ldapGrid"
            size="small"
            :columns="userColumns"
            :data-source="userList"
            :height="tableHeight"
            :loading="loading"
            :row-selection.sync="rowSelection"
          />
        </div>
      </div>
    </div>

    <!-- button -->
    <div v-show="visible" id="import_ldap_btn" class="user-drawer-tool" style="width: 760px;">
      <a-button id="import_ldap_cancel" class="mf-btn-dashed" @click="onClose">{{ $t("Cancel") }}</a-button>
      <a-button
        id="import_ldap_import"
        type="primary"
        style="margin-left: 8px"
        :disabled="selectedUserNum === 0"
        @click="onImportUser"
      >
        {{ $t("import") }}
      </a-button>
    </div>

    <!-- user detail -->
    <mf-modal id="import_ldap_user_details_modal" class="details_modal" :visible="detailVisible" :one-btn="true" @cancel="onOk" @ok="onOk">

      <!-- title -->
      <span slot="title">
        {{ $t('userManagement.LDAP_user_details') }}
      </span>

      <!-- table -->
      <mf-ag-grid
        id="import_ldap_user_details_list"
        size="small"
        :columns="detailColumns"
        :data-source="detailList"
        :options="{ domLayout: 'autoHeight' }"
        :height="'auto'"
      />
      <!--<a-table :data-source="detailList" row-key="name" :columns="detailColumns" :pagination="false" />-->

    </mf-modal>

    <!-- conflict -->
    <handle-conflict ref="handleConflict" :import-list="importList" :update-list="updateList" :conflict-list="conflictList" @ok="onOkConflict" />

    <!-- summary -->
    <operation-complete ref="operationComplete" :complete-list="completeList" @ok="importComplete" />

  </mf-drawer>
</template>

<script>
import HandleConflict from '@/views/user/components/importLdap/HandleConflict'
import OperationComplete from '@/views/user/components/importLdap/OperationComplete'
import HeaderCheckbox from '@/views/user/components/importLdap/HeaderCheckbox'
import NameLink from '@/views/user/components/importLdap/NameLink'
import TreeLoadingRow from '@/views/user/components/importLdap/TreeLoadingRow'
import MfAgGrid from '@/components/MFTable/AgGrid/grid'
import MfAgGridLdap from '@/components/MFTable/AgGrid/gridLdap'
import { mixinImport } from './mixins/mixinImport'
import { debounce, sorting } from '@/utils/index.js'

import { IMPORT_LDAP_USER_TREE } from 'config/help'

import { getAllLDAP, getLDAPById, getLDAPUserById, importLDAP, testLdap } from '@/api/user'
import ClearIcon from '@/components/MFForm/ClearIcon/ClearIcon'

export default {
  name: 'ImportUserTree',

  components: {
    ClearIcon,
    MfAgGrid,
    MfAgGridLdap,
    HandleConflict,
    OperationComplete,
    // eslint-disable-next-line vue/no-unused-components
    HeaderCheckbox,
    // eslint-disable-next-line vue/no-unused-components
    NameLink,
    // eslint-disable-next-line vue/no-unused-components
    TreeLoadingRow
  },

  mixins: [mixinImport],

  data() {
    return {
      IMPORT_LDAP_USER_TREE,

      loading: false,
      visible: false,

      ldapServers: [],
      currentServer: {
        connection: false
      },
      form: {
        isTreeData: true,
        server: '', // Server
        searchMode: 'basic', // Filter Mode
        base: '', // Directory Base
        baseShow: '',
        keyword: '', // Filter By Keyword
        baseFilter: '', // Filter
        filter: '', // Filter(customer input)
        filterCriteria: { // Filter Criteria after apply
          directoryBase: '',
          filter: '',
          keyword: '',
          group: ''
        }
      },
      baseFilterWidth: 0, // set width to show 'form.baseFilter' and 'form.filter' inline
      tableHeight: 100,

      reloadData: false, // if grid ready is after init data, gridApi.setServerSideDatasource() is undefined, set and watch 'reloadData' to retry
      gridOptions: {
        columnDefs: [
          {
            headerName: '',
            checkboxSelection: true,
            headerComponent: 'HeaderCheckbox',
            pinned: 'left',
            lockPinned: true, // not possible to drag the column out of the pinned section
            width: 52,
            sortable: false
          }, {
            field: 'user-name',
            hide: true // autoGroupColumn 'user-name' sort need column 'user-name'
          }, {
            headerName: this.$t('userManagement.FULL_NAME'),
            field: 'full-name',
            width: 130,
            tooltipField: 'full-name',
            lockPinned: true,
            comparator: (a, b) => sorting(a, b)
          }, {
            headerName: this.$t('userManagement.DESCRIPTION'),
            field: 'description',
            width: 140,
            tooltipField: 'description',
            lockPinned: true,
            comparator: (a, b) => sorting(a, b)
          }, {
            headerName: this.$t('userManagement.EMAIL'),
            field: 'email',
            width: 100,
            tooltipField: 'email',
            lockPinned: true,
            comparator: (a, b) => sorting(a, b)
          }, {
            headerName: this.$t('userManagement.PHONE'),
            field: 'phone',
            width: 105,
            tooltipField: 'phone',
            lockPinned: true,
            comparator: (a, b) => sorting(a, b)
          }
        ],
        defaultColDef: {
          resizable: true,
          sortable: true,
          unSortIcon: true,
          lockVisible: true, // stop individual columns from been made visible or hidden via the UI
          suppressMenu: true // disable menu
        },
        autoGroupColumnDef: {
          headerName: this.$t('login.userName'),
          field: 'user-name',
          width: 180,
          tooltipField: 'user-name',
          lockPinned: true,
          cellRendererParams: {
            // checkbox: true,
            innerRenderer: 'NameLink'
          },
          comparator: (a, b) => sorting(a, b)
        },
        rowHeight: 32,
        loadingCellRenderer: 'TreeLoadingRow', // loading and error
        suppressContextMenu: false, // disable right click menu
        getContextMenuItems: (params) => {
          return [
            'copy',
            'copyWithHeaders',
            'paste'
          ]
        },
        rowSelection: 'multiple',
        suppressRowClickSelection: true, // do not select when rowClick
        // isRowSelectable: function(rowNode) {
        //   return !rowNode.data.canExpand
        // },
        rowModelType: 'serverSide',
        // serverSideStoreType: 'partial',
        treeData: true,
        animateRows: true,
        // isServerSideGroupOpenByDefault: function (params) { // default open
        //     return params.rowNode.level < 2;
        // },
        isServerSideGroup: function(dataItem) { // is row expandable
          return true // dataItem.canExpand
        },
        getServerSideGroupKey: function(dataItem) { // params.request.groupKeys in setServerSideDatasource.getRows
          return dataItem['distinguished-name']
        },
        context: {
          setHeader: 0,
          setAll: (flag) => {
            if (this.$refs.ldapGridTree.gridApi) {
              this.$refs.ldapGridTree.gridApi.forEachNode(node => {
                if (node.data) {
                  node.setSelected(flag)
                }
              })
            }
          },
          showDetail: (data) => {
            this.detailVisible = true
            this.detailList = [...data.attributes, ...[{ name: this.$t('userManagement.DN'), values: data['distinguished-name'] }]]
          }
        }
      },
      treeDataNumber: 0, // loaded users' number in table tree
      treeSelectedUser: [], // selected users' in table tree

      userColumns: Object.freeze([
        {
          title: '',
          type: 'checkbox',
          pinned: 'left',
          lockPinned: true,
          width: 52,
          maxWidth: 52,
          minWidth: 52
        }, {
          dataIndex: 'user-name',
          title: this.$t('login.userName'),
          sorter: 'desc',
          width: 180,
          tooltipField: 'user-name',
          lockPinned: true
        }, {
          dataIndex: 'full-name',
          title: this.$t('userManagement.FULL_NAME'),
          sorter: 'desc',
          width: 130,
          tooltipField: 'full-name',
          lockPinned: true
        }, {
          dataIndex: 'description',
          title: this.$t('userManagement.DESCRIPTION'),
          sorter: 'desc',
          width: 140,
          tooltipField: 'description',
          lockPinned: true
        }, {
          dataIndex: 'email',
          title: this.$t('userManagement.EMAIL'),
          sorter: 'desc',
          width: 100,
          tooltipField: 'email',
          lockPinned: true
        }, {
          dataIndex: 'phone',
          title: this.$t('userManagement.PHONE'),
          sorter: 'desc',
          width: 105,
          tooltipField: 'phone',
          lockPinned: true
        }
      ]),
      userList: [], // users in table list
      rowSelection: [], // selected users in table list

      detailVisible: false,
      detailColumns: Object.freeze([
        {
          title: this.$t('userManagement.ATTRIBUTE'),
          dataIndex: 'name',
          width: 450,
          tooltipField: 'name'
        },
        {
          title: this.$t('userManagement.VALUES'),
          dataIndex: 'values',
          tooltipField: 'values'
        }
      ]),
      detailList: [],

      importList: [], // users need importing
      updateList: [], // users need updating
      completeList: [],
      conflictList: []
    }
  },

  computed: {
    selectedUserNum() {
      if (this.form.isTreeData) {
        return this.treeSelectedUser.length
      } else {
        return this.rowSelection.length
      }
    }
  },

  methods: {
    // show import drawer
    show() {
      this.visible = true
      this.getAllLdap()
      this.$nextTick(() => {
        this.tableHeight = `calc(100vh - ${document.getElementsByClassName('form-item-bottom')[0].clientHeight}px - 273px)`
      })
    },

    // close import drawer
    onClose() {
      if (this.$refs.ldapGridTree.gridApi) {
        this.clearTreeData()
      }
      this.$refs.importLdapForm.$children[0].resetFields()
      this.ldapServers = []
      this.currentServer = {
        connection: false
      }
      this.visible = false
    },

    // get ldap list
    getAllLdap() {
      getAllLDAP().then(res => {
        const ldapServers = res['ldap-servers']['ldap-server']
        this.ldapServers = Array.isArray(ldapServers) ? ldapServers : ldapServers ? [ldapServers] : []
        if (this.ldapServers.length === 0) {
          this.form.server = ''
          this.$message.info(this.$t('userManagement.userToolBar.LDAP_servers_are_not_configured'))
        } else {
          this.form.server = this.ldapServers[0]['ldap-id']
          this.changeServer()
        }
      }).catch(() => {
      })
    },

    clearTreeData() {
      this.userList = []
      this.treeDataNumber = 0
      this.gridOptions.context.setHeader = 0
      this.$refs.ldapGridTree.gridApi.forEachNode(node => {
        node.setSelected(false)
      })
      // const rowsToRemove = []
      // this.$refs.ldapGridTree.gridApi.forEachNode(node => {
      //   rowsToRemove.push(node.data)
      // })
      // this.$refs.ldapGridTree.gridApi.applyServerSideTransaction({ remove: rowsToRemove })
      this.$refs.ldapGridTree.gridApi.setServerSideDatasource({
        getRows: params => {
          params.success({
            rowData: []
          })
        }
      })
    },

    // change server
    changeServer() {
      getLDAPById(this.form.server).then(res => {
        this.currentServer = res['ldap-server']
        this.form.searchMode = 'basic'
        this.form.keyword = ''
        this.form.base = this.currentServer.base
        this.form.baseShow = this.currentServer.base === '' ? this.$t('userManagement.Empty') : this.currentServer.base
        this.form.filter = ''
        this.form.baseFilter = this.currentServer.filter
        this.form.filterCriteria = {
          directoryBase: this.currentServer.base,
          filter: this.currentServer.filter,
          keyword: '',
          group: ''
        }
        if (this.$refs.ldapGridTree.gridApi) {
          this.clearTreeData()
        }
        this.testConnection()
      }).catch(() => {
      })
    },

    // test connection before request data
    testConnection() {
      this.loading = true
      testLdap(this.form.server).then(res => {
        this.currentServer.connection = true
        this.onShowLdapServerTree()
      }).catch(() => {
        this.currentServer.connection = false
        this.loading = false
      })
    },

    // change filter mode
    changeMode() {
    },

    // blur filter
    checkFilter() {
      if (this.form.filter.length > 0) {
        if (this.form.filter[0] !== '(') {
          this.form.filter = `(${this.form.filter})`
        }
      } else {
        this.form.filter = ''
      }
    },

    // apply filter to request data
    onApply() {
      if (!this.currentServer.connection) {
        return false
      }
      if (this.form.searchMode === 'basic') {
        if (!this.form.keyword) {
          this.$message.warning(this.$t('userManagement.EnterKeywordToSearch'))
        } else {
          this.form.filter = ''
          this.onShowLdapServerList('basic')
        }
      } else {
        this.form.keyword = ''
        this.onShowLdapServerList('advance')
      }
    },

    // show user tree
    onShowLdapServerTree() {
      if (!this.currentServer.connection) {
        return false
      }
      this.form.keyword = ''
      this.form.filter = ''
      this.form.filterCriteria.keyword = ''
      this.form.filterCriteria.group = ''
      this.form.isTreeData = true
      if (this.$refs.ldapGridTree.gridApi) {
        this.clearTreeData()
        this.$refs.ldapGridTree.gridApi.setServerSideDatasource(this.ServerSideDataSource())
      } else {
        this.reloadData = true
      }
    },

    // retry gridApi.setServerSideDatasource() after grid ready
    gridReady() {
      if (this.reloadData) {
        this.clearTreeData()
        this.$refs.ldapGridTree.gridApi.setServerSideDatasource(this.ServerSideDataSource())
      }
    },

    // get user tree
    ServerSideDataSource() {
      return {
        getRows: params => {
          this.loading = true
          const parentList = params.parentNode.data ? JSON.parse(JSON.stringify(params.parentNode.data)) : null
          const filter = this.form.baseFilter
          const base = params.request.groupKeys.length > 0 ? params.request.groupKeys[params.request.groupKeys.length - 1] : this.form.base

          getLDAPUserById(this.form.server, `{filter['${filter}'];base['${base}']}`, 'tree').then(res => {
            const dataList = this.handleUser(res, true, parentList)

            // set table tree
            params.success({
              rowData: dataList
            })

            // count loaded node to compare selected all or not
            this.treeDataNumber += dataList.length

            // if parentNode selected, select childrenNodes after load
            if (params.parentNode.selected) {
              const childrenNodes = params.parentNode.childStore ? params.parentNode.childStore.allRowNodes : []
              childrenNodes.forEach(item => {
                item.setSelected(true)
              })
            }
          }).catch(() => {
            params.fail()
          }).finally(() => {
            this.loading = false
          })
        }
      }
    },

    // show user list
    onShowLdapServerList(mode) {
      this.loading = true
      this.form.isTreeData = false
      this.userList = []
      this.rowSelection = []
      let filter = ''
      if (mode === 'basic') {
        filter += `{filter['(|`
        filter += `(${this.currentServer['search-criteria']['user-name']}=*${this.form.keyword}*)`
        filter += `(${this.currentServer['search-criteria']['full-name']}=*${this.form.keyword}*)`
        filter += `(${this.currentServer['search-criteria'].description}=*${this.form.keyword}*)`
        filter += `(${this.currentServer['search-criteria'].email}=*${this.form.keyword}*)`
        filter += `(${this.currentServer['search-criteria'].phone}=*${this.form.keyword}*)`
        filter += `)']}`

        this.form.filterCriteria.keyword = this.form.keyword
        this.form.filterCriteria.group = ''
      } else {
        filter = `{filter['${this.form.filter ? this.form.filter : this.form.baseFilter}']}`

        this.form.filterCriteria.keyword = ''
        this.form.filterCriteria.group = this.form.filter
      }

      getLDAPUserById(this.form.server, filter, 'list').then(res => {
        this.userList = this.handleUser(res, false)
        this.$nextTick(() => {
          this.$refs.ldapGrid.sizeColumnsToFit()
        })
      }).catch(() => {
      }).finally(() => {
        this.loading = false
      })
    },

    // format user
    handleUser(res, isTree, parentList) {
      // show limit prompt
      if (isTree && res['search-results']['total-results'] >= this.currentServer['search-limit']) {
        this.$message.info(this.$t('userManagement.MoreThanLDAPSetting', { num: this.currentServer['search-limit'] }))
      }

      const dataList =
        res['search-results']['total-results'] > 0
          ? (Array.isArray(res['search-results']['search-result']) ? res['search-results']['search-result'] : [res['search-results']['search-result']])
          : []
      dataList.forEach(item => {
        const fistInDN = item['distinguished-name'].split(',')[0]
        const attributes = item.attributes ? (Array.isArray(item.attributes) ? item.attributes : [item.attributes]) : []

        item.attributes = attributes
        item['user-name'] = this.matchValue(attributes, 'user-name', fistInDN.substring(fistInDN.indexOf('=') + 1, fistInDN.length))
        item['full-name'] = this.matchValue(attributes, 'full-name', '')
        item.description = this.matchValue(attributes, 'description', '')
        item.email = this.matchValue(attributes, 'email', '')
        item.phone = this.matchValue(attributes, 'phone', '')

        item.canExpand = !this.matchValue(attributes, 'user-name', false) // to judge node whether able to expand no not
        item.parentList = parentList ? [...parentList.parentList, ...[parentList['distinguished-name']]] : [] // (parentList + 'distinguished-name') is unique, 'distinguished-name' is not
      })
      return dataList
    },

    matchValue(attributes, key, undefinedValue) {
      return attributes.find(it => it.name === this.currentServer['search-criteria'][key])
        ? attributes.find(it => it.name === this.currentServer['search-criteria'][key]).values
        : undefinedValue
    },

    // select one
    // groupSelectsChildren is not possible in the Server-Side Row Model because the children for a group may not be loaded into the grid
    // node.setSelected() will invoke this method
    onRowSelected(e) {
      // only the first level nodes have no parentNode
      const parentNode = this.$refs.ldapGridTree.gridApi.getRenderedNodes().find(item => item.data && [...item.data.parentList, ...[item.data['distinguished-name']]].join('-') === e.data.parentList.join('-'))

      // select
      if (e.node.selected) {
        // if brotherNodes all selected, set parentNode selected
        if (parentNode) {
          const brotherNodes = parentNode.childStore.allRowNodes
          if (brotherNodes.length === brotherNodes.filter(item => item.selected).length) {
            parentNode.setSelected(true)
          }
        }

        // set childrenNodes selected
        const childrenNodes = e.node.childStore ? e.node.childStore.allRowNodes : []
        childrenNodes.forEach(item => {
          item.setSelected(true)
        })
      }

      // deselect
      if (!e.node.selected) {
        // set parentNode deselected
        if (parentNode) {
          parentNode.setSelected(false)
        }

        // if childrenNodes all selected, set childrenNodes deselected
        const childrenNodes = e.node.childStore ? e.node.childStore.allRowNodes : []
        if (childrenNodes.length === childrenNodes.filter(item => item.selected).length) {
          childrenNodes.forEach(item => {
            item.setSelected(false)
          })
        }
      }

      // node.setSelected() will invoke this method, no need to set headerCheckbox and get selected users every time, improve performance
      this.setHeaderAndGetSelected()
    },

    setHeaderAndGetSelected: debounce(function() {
      // set headerCheckbox selected / deselected
      if (this.treeDataNumber > 0 && this.treeDataNumber === this.$refs.ldapGridTree.gridApi.getSelectedNodes().length) {
        this.gridOptions.context.setHeader = 1
      } else {
        if (this.$refs.ldapGridTree.gridApi.getSelectedNodes().length > 0) {
          this.gridOptions.context.setHeader = 0.5
        } else {
          this.gridOptions.context.setHeader = 0
        }
      }

      // get selected users
      this.treeSelectedUser = this.$refs.ldapGridTree.gridApi.getSelectedNodes().filter(item => item.data.attributes.find(it => it.name === this.currentServer['search-criteria']['user-name'])).map(item => { return item.data })
    }, 100),

    // expand tree node
    onRowGroupOpened(e) {
      // Gets all failed server side loads to retry, not support single node
      // if (e.expanded) {
      //   this.$refs.ldapGridTree.gridApi.retryServerSideLoads()
      // }
    },

    // close detail
    onOk() {
      this.detailVisible = false
    },

    // show confirm import
    onImportUser() {
      this.$mfConfirm({
        title: this.$t('confirm'),
        iconType: 'Confirm',
        message: this.$t('userManagement.tree_continue_info', { num: this.selectedUserNum }),
        onConfirm: this.onOkConfirm
      })
    },

    // submit confirm import
    onOkConfirm() {
      this.importList = []
      this.updateList = []
      this.completeList = []
      this.conflictList = []
      if (this.form.isTreeData) {
        this.importList = this.treeSelectedUser
      } else {
        this.importList = this.rowSelection
      }
      this.importList = this.importList.map(item => {
        return {
          name: item['user-name'],
          'full-name': item['full-name'],
          email: item.email,
          description: item.description,
          phone: item.phone,
          role: { 'role-name': 'Basic User', 'role-id': 1 },
          'user-auth-data': {
            'server-id': this.currentServer['ldap-id'],
            'user-dn': item['distinguished-name']
          }
        }
      })
      return this.import()
    },

    // import
    import() {
      return importLDAP({ users: { user: this.importList }}).then(res => {
        // all users can be import
        const result = Array.isArray(res.users.user) ? res.users.user : [res.users.user]
        this.completeList = this.handleRequestSucceedList(result)
        this.$refs.operationComplete.show()
        this.$emit('refresh')
      }).catch(e => {
        let resultList = e.response.data.QCRestException.ExceptionProperties.ExceptionProperty.SaValue.BulkOperationResponse.BulkEntries.BulkEntry
        resultList = Array.isArray(resultList) ? resultList : [resultList]
        if (resultList.find(item => item.Exception && (item.Exception.Id === 'qccore.entity-already-exists' || item.Exception.Id === 'qccore.request-conflict'))) {
          // have same user / same user name conflict
          this.conflictList = this.handleRequestConflictList(this.importList, resultList)
          this.$nextTick(() => {
            this.$refs.handleConflict.show()
          })
        } else {
          // have other error(eg: no email), import no error users
          this.completeList = this.handleRequestFailedList(resultList)
          this.$refs.operationComplete.show()
          this.$emit('refresh')
        }
      })
    },

    // submit handle conflict
    onOkConflict(isComplete, list, updateList, conflictList) {
      if (isComplete) {
        this.completeList = list
        this.$refs.operationComplete.show()
        this.$emit('refresh')
      } else {
        this.importList = list
        this.updateList = updateList
        this.conflictList = conflictList
        this.$nextTick(() => {
          this.$refs.handleConflict.show()
        })
      }
    },

    // import complete
    importComplete() {
      if (this.form.isTreeData) {
        this.$refs.ldapGridTree.gridApi.forEachNode(node => {
          node.setSelected(false)
        })
        this.gridOptions.context.setHeader = 0
      } else {
        this.$refs.ldapGrid.deselectAll()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.tree-user-hi {
  margin-left: 10px;
  color: #656668;
}

.mf-drawer /deep/ .ant-drawer-body {
  padding: 0;
  background: #F5F7F8;
}

.tree-over-height{
  height: calc(100vh - 38px - 65px - 56px);
  overflow-x: hidden;

  .ant-form-item {
    margin-bottom: 16px;
    /deep/ label {
      margin-left: 0;
    }
  }

  .form-item-top {
    background: #fff;
    padding: 24px;
    margin-bottom: 0;
  }

  .form-item-bottom {
    padding: 14px 24px 0;
    /deep/ input {
      background: none;
    }
  }

  .table-box {
    padding: 0 24px 24px;
  }
}

.details_modal /deep/ .ant-modal {
  width: 800px !important;

  .ant-table-tbody > tr > td, .ant-table-thead > tr > th {
    word-break: break-word;
  }
}

.complete_modal /deep/ .ant-modal {
  width: 800px !important;
}

.inline-input-and-btn {
  /deep/ .ant-form-item-children {
    display: flex;
    justify-content: space-between;
  }
  .inline-input {
    max-width: 60%;
  }
  .inline-btn {
    margin-left: 10px;
    display: inline-flex;
    flex-shrink: 0;
  }
}

.filter-input {
  width: 60%;
  display: inline-flex;
  align-items: baseline;

  .base-filter {
    max-width: 50%;
    color: #747577;
    flex-shrink: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.filter-criteria {
  width: 100%;
  display: block;
  font-size: 14px;
  color: #747577;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .label {
    color: #000;
  }

  .item {
    margin-left: 5px;
  }

  .value {
    color: #000;
  }
}
.import-ldap-form {

  /deep/ .ant-form-item-label {
    line-height: 32px;
  }

  /deep/ .ant-form-item-control {
    line-height: 32px;
  }

  /deep/ .ant-form-item:last-child {
    margin-bottom: 8px;
  }
}
</style>
