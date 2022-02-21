<template>
  <div class="audit-log">
    <div class="audit-header">
      <div class="header-left">
        <span class="audit-txt">
          {{ $t('monitoring.AUDITLOG') }}
        </span>

        <icon-btn
          id="a-icon-Export"
          :icon-title="$t('export')"
          icon-style="icon-MonitoringExportCsv"
          class="audit-export"
          @onClick="onExportButton"
        />
      </div>
      <mf-badge :badge="isBadge">
        <a-button id="audit-log-filter-btn" class="mf-btn-filter filter-btn" @click="onFilterClick">
          <i :class="['iconfont',filterIcon]" />
          {{ $t('filter') }}
        </a-button>
      </mf-badge>
    </div>

    <filter-form
      v-show="isShowFilter"
      ref="filterForm"
      :context-list="contextList"
      :operation-list="operationList"
      :status-list="statusList"
      @onFormChange="onFilterChange"
      @filterDataChange="filterDataChange"
    />

    <!-- audit-log table -->
    <div class="right-table">
      <a-table
        ref="auditTable"
        class="audit-log-table general-table"
        row-key="id"
        :scroll="{y: tableHeight}"
        :data-source="auditList"
        :columns="columns"
        :pagination="pagination"
        :loading="loading"
        @change="onAuditTableChange"
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

        <a slot="name" slot-scope="text">{{ text }}</a>
        <template slot="buildOptionText" slot-scope="props">
          <span v-if="props.value !== '50'">全部</span>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
// eslint-disable-next-line no-unused-vars
import { getAuditsExport, getAudits, getDropdownFilterData } from '@/api/monitoring'
import FilterForm from '@/views/monitoring/components/FilterForm'
import MfBadge from '@/components/MFBadge'
import IconBtn from '@/components/BtnIcon/index'
import { PAGE_SIZE_25 } from '@/store/const'
import { downloadCsv } from '@/utils/downloadCsv'
import { HELP_ON_THIS_PAGE } from 'config/help'
import { autoTableHeight, errorMessage } from '@/utils'
export default {
  components: { FilterForm, MfBadge, IconBtn },
  data() {
    return {
      // filter
      filterIcon: 'icon-spread',
      isShowFilter: false,
      isBadge: false,
      filterData: {},
      nowFilterData: {},
      // table
      loading: false,
      auditList: [],
      pagination: {
        size: 'small',
        current: 1,
        defaultPageSize: PAGE_SIZE_25,
        showSizeChanger: true,
        showTotal: (total) =>
          this.$t('totalItems') + ' ' + total,
        pageSizeOptions: ['25', '50', '100'],
        onShowSizeChange: (current, pageSize) => { this.pageSize = pageSize }
      },
      queryParam: {
        current: 1,
        pageSize: PAGE_SIZE_25
      },
      contextList: [],
      operationList: [],
      statusList: [],
      sort: 'DESC',
      sortColumnKey: 'id',
      tableHeight: 100
    }
  },
  computed: {
    columns: function() {
      return [
        {
          titleText: this.$t('monitoring.ID'),
          slots: { title: 'id' },
          dataIndex: 'id',
          key: 'id',
          ellipsis: true,
          sorter: true,
          defaultSortOrder: 'descend',
          sortDirections: ['descend', 'ascend']
        }, {
          titleText: this.$t('monitoring.DATE'),
          slots: { title: 'date' },
          dataIndex: 'date',
          key: 'date',
          ellipsis: true,
          sorter: true,
          customRender: (text) => {
            return moment(parseInt(text)).format('YYYY/MM/DD HH:mm:ss')
          }
        }, {
          titleText: this.$t('login.userName'),
          slots: { title: 'login-name' },
          dataIndex: 'login-name',
          key: 'login-name',
          ellipsis: true,
          sorter: true
        }, {
          titleText: this.$t('monitoring.CONTEXT'),
          slots: { title: 'context' },
          dataIndex: 'context',
          key: 'context',
          ellipsis: true,
          sorter: true
        }, {
          titleText: this.$t('monitoring.OPERATION'),
          slots: { title: 'operation' },
          dataIndex: 'operation',
          key: 'operation',
          ellipsis: true,
          sorter: true
        }, {
          titleText: this.$t('monitoring.DETAILS'),
          slots: { title: 'details' },
          dataIndex: 'details',
          key: 'details',
          ellipsis: true,
          sorter: true
        }, {
          titleText: this.$t('monitoring.STATUS'),
          slots: { title: 'status' },
          dataIndex: 'status',
          key: 'status',
          ellipsis: true,
          sorter: true
        }, {
          titleText: this.$t('monitoring.SOURCEIP'),
          slots: { title: 'src-ip' },
          dataIndex: 'src-ip',
          key: 'src-ip',
          ellipsis: true,
          sorter: true
        }, {
          titleText: this.$t('monitoring.DESTINATIONIP'),
          slots: { title: 'dst-ip' },
          dataIndex: 'dst-ip',
          key: 'dst-ip',
          ellipsis: true,
          sorter: true
        }]
    }
  },
  watch: {
    isShowFilter: function(val) {
      this.$nextTick(() => {
        this.getTableHeight()
      })
    }
  },
  created() {
    this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.monitoring['Audit Log'])
  },
  mounted() {
    this.getAuditLogList()
    this.getDropdownFilterList()
    this.getTableHeight()
    window.addEventListener('resize', this.getTableHeight)
  },
  destroyed() {
    window.removeEventListener('resize', this.getTableHeight)
  },
  methods: {
    getTableHeight() {
      this.tableHeight = autoTableHeight(this.$refs.auditTable)
    },
    getAuditLogList() {
      this.loading = true
      const startIndex = (this.queryParam.current - 1) * this.queryParam.pageSize + 1
      const pageSize = this.queryParam.pageSize
      const data = this.handleParams({ ...this.filterData })
      const sort = this.sort || ''
      const sortColumnKey = this.sortColumnKey
      getAudits(startIndex, pageSize, data, sort, sortColumnKey).then(res => {
        this.loading = false
        this.auditList = []
        this.pagination = { ...this.pagination, total: parseInt(res['audit-logs']['@total-results']) }
        if (res['audit-logs']['audit-log']) {
          if (Array.isArray(res['audit-logs']['audit-log'])) {
            this.auditList = res['audit-logs']['audit-log']
          } else {
            this.auditList.push(res['audit-logs']['audit-log'])
          }
        }
      }).catch(() => {
        this.loading = false
      }).finally(() => {
        this.$nextTick(() => {
          this.getTableHeight()
        })
      })
    },
    onAuditTableChange(pagination, _, sorter) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize

      this.queryParam.current = pagination.current
      this.queryParam.pageSize = pagination.pageSize
      this.sort = sorter.order ? (sorter.order === 'ascend' ? 'ASC' : 'DESC') : ''
      this.sortColumnKey = sorter.columnKey
      this.getAuditLogList()
    },
    // Show badge dot or not
    changeBadgeStatus(e) {
      this.isBadge = e
    },
    onFilterClick() {
      this.isShowFilter = !this.isShowFilter
    },
    onFilterChange(e) {
      this.pagination.current = 1
      this.pagination.pageSize = PAGE_SIZE_25

      this.queryParam.current = 1
      this.queryParam.pageSize = PAGE_SIZE_25
      e ? this.filterData = e : this.filterData = {}
      this.getAuditLogList()
    },
    filterDataChange(e) {
      e ? this.nowFilterData = e : this.nowFilterData = {}
    },
    onExportButton() {
      const data = this.handleParams({ ...this.nowFilterData })
      getAuditsExport(data, this.sort, this.sortColumnKey).then(res => {
        // this.$message.success(this.$t('monitoring.exportMessage'))
        downloadCsv(res, 'auditLog', 'blobCsv')
      }).catch(err => {
        errorMessage(err.response.data.QCRestException.Title, err.response.data.QCRestException.StackTrace)
      })
    },
    getDropdownFilterList() {
      getDropdownFilterData().then(res => {
        if (res.metadata.name === 'audits' && Array.isArray(res.metadata.fields)) {
          const data = res.metadata.fields
          for (const item of data) {
            if (item.name === 'Context') {
              this.contextList = item.items
            } else if (item.name === 'Operation') {
              this.operationList = item.items
            } else if (item.name === 'Status') {
              this.statusList = item.items
            }
          }
        }
      }).catch(() => {})
    },
    handleParams(params) {
      let data = ''
      const query = []
      const obj = { ...params }
      for (const key in obj) {
        query.push(`${key}[${obj[key]}]`)
      }
      data = `{${query.join(';')}}`
      return data
    }
  }
}
</script>

<style lang="less" scoped>
  .audit-log{
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .audit-header{
    width: 100%;
    height: 57px;
    background: #ffffff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid rgba(101, 102, 104, 0.16);
    box-shadow: 2px 0 0 #dcdedf;
    padding-right: 24px;
  }

  .audit-export{
    margin-left: 24px;
  }

  .audit-txt{
    margin-left: 24px;
    font-family: MediumWeb, serif;
    font-size: 16px;
    font-weight: 500;
    color: #000000;
    line-height: 19px;
  }

  .audit-log-table {
    /deep/ .ant-pagination li {
      margin-right: 0px !important;
    }
  }

</style>
