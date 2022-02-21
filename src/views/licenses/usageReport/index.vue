<template>
  <div :class="['usage-report',usageReportOp]">
    <report-header ref="reportHeader" :icon="icon" :style="usageReportOp === 'usage-report-op'?'':'display: flex'" @refreshFilter="refreshFilter" @copy="copyCharts" @print="printCharts" @changeFilter="onFilterClick" @onTimeInterval="onTimeInterval" @export="exportData" />
    <usage-filter v-show="isShowFilter" ref="usageFilter" @onFilterChange="onFilterChange" @result="result" @iconChange="iconChange" />

    <div class="usage-content">
      <a-tabs default-active-key="1" @change="callback">
        <a-tab-pane key="1" :tab="$t('licenses.line_chart')">
          <a-spin class="spin" :spinning="lineChartLoading">
            <line-chart v-if="license.length>0" ref="lineChart" :height-num="heightNum" :is-show-filter="isShowFilter" :license="license" :usage-arr="usage" :last-time="lastTime" />
          </a-spin>
        </a-tab-pane>
        <a-tab-pane key="2" :tab="$t('licenses.data_grid')">
          <data-grid v-if="license.length>0" ref="dataGrid" :license="license" :usage-arr="usage" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
import UsageFilter from '@/views/licenses/usageReport/components/UsageFilter'
import ReportHeader from '@/views/licenses/usageReport/components/ReportHeader'
import LineChart from '@/views/licenses/usageReport/components/LineChart'
import DataGrid from '@/views/licenses/usageReport/components/DataGrid'
import { getLicensesUsageExport, getLicenseUsage, getLicenseUsageSaas } from '@/api/license'
import { throttle } from '@/utils'
import moment from 'moment'
import { getAllLicenses } from '@/api/connection'
import { SERVER_TYPE } from '@/store/const'
import { mapGetters } from 'vuex'
import { downloadCsv } from '@/utils/downloadCsv'
import { HELP_ON_THIS_PAGE } from 'config/help'
export default {
  components: {
    UsageFilter,
    ReportHeader,
    LineChart,
    DataGrid
  },
  data() {
    return {
      isShowFilter: false,
      lineChartLoading: false,
      icon: 'line',
      interval: 'DAYS',
      lastTime: 'Last Week',
      license: [],
      flag: false,
      usage: [],
      startDate: '',
      endDate: '',
      param: {},
      project: [],
      username: '',
      customer: 0,
      usageReportOp: '',
      licenseUsage: null,
      heightNum: 320
    }
  },
  computed: {
    ...mapGetters(['serverType', 'activeCustomerId'])
  },
  watch: {
    isShowFilter: function(val) {
      this.$nextTick(() => {
        this.$refs.dataGrid && this.$refs.dataGrid.getTableHeight()
      })
    }
  },
  created() {
    this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.licenses['License Usage Report'])
    this.getLicense()
    if (this.serverType === SERVER_TYPE.Saas) {
      this.$store.dispatch('customer/getCustomers').then(data => {
        this.customer = this.activeCustomerId
      })
    }
    if (this.serverType === SERVER_TYPE.OnPremise) {
      this.usageReportOp = 'usage-report-op'
      this.heightNum = 380
    }
  },
  mounted() {
    this.onTimeInterval(moment().subtract(6, 'days').format('YYYY-MM-DD'), moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'), 'DAYS')
    this.licenseUsage = this.serverType === SERVER_TYPE.OnPremise ? getLicenseUsage : getLicenseUsageSaas
  },
  methods: {
    result() {
      this.project = []
      this.username = ''
      this.$refs.usageFilter.filterResult()
    },
    iconChange(e) {
      this.$refs.reportHeader.changeBadgeStatus(e)
    },
    getLicense() {
      // getAllLicenses('is-assignable[Y]')
      getAllLicenses().then((res) => {
        // Get license data
        const license = res['site-licenses'].license
        let licenseArr = []
        Array.isArray(license) ? licenseArr = license : licenseArr.push(license)
        this.license = licenseArr
      })
    },
    onFilterClick() {
      this.isShowFilter = !this.isShowFilter
    },
    callback(key) {
      if (key === '2') {
        this.icon = 'data'
      } else {
        this.icon = 'line'
      }
    },

    // Modify the method triggered by the startdate and enddate option
    onTimeInterval: throttle(function(startDate, endDate, interval, intervalNum) {
      this.lineChartLoading = true
      this.startDate = startDate
      this.endDate = endDate
      if (this.$refs.lineChart) { this.$refs.lineChart.interval = intervalNum }

      this.interval = interval
      if (startDate === undefined && endDate === undefined) {
        this.param = {
          startDate: '',
          endDate: '',
          username: this.username,
          project: this.project,
          customer: this.customer
        }
      } else {
        this.param = {
          startDate: this.startDate,
          endDate: this.endDate,
          username: this.username,
          project: this.project,
          customer: this.customer
        }
      }

      this.flag = false
      this.licenseUsage(this.interval, this.param).then((res) => {
        this.parsingLicenseRes(res)
      }).finally(() => {
        this.lineChartLoading = false
      })
    }, 500),
    refreshFilter() {
      this.$refs.usageFilter.onFilterFunc()
    },

    // Modify the method triggered by the filter option
    onFilterChange(project, username = '') {
      this.lineChartLoading = true
      this.project = project === 'All' ? '' : project
      this.username = username === 'All' ? '' : username
      // saas only project, project is customer
      this.param.customer = project === 'All' ? '' : project
      this.param.username = this.username
      this.param.project = this.project
      this.licenseUsage(this.interval, this.param).then((res) => {
        this.parsingLicenseRes(res)
      }).finally(() => {
        this.lineChartLoading = false
      })
    },

    parsingLicenseRes(res) {
      const usage = res['license-usagess']['license-usages']
      let usageArr = []
      Array.isArray(usage) ? usageArr = usage : usageArr.push(usage)
      this.usage = usageArr
      this.$nextTick(() => {
        if (!this.$refs.dataGrid) {
          setTimeout(() => {
            this.$refs.lineChart.getAllLicenses()
          }, 0)
        } else {
          setTimeout(() => {
            this.$refs.lineChart.getAllLicenses()
            this.$refs.dataGrid.getLicenseUsage()
          }, 0)
        }
      })
    },

    // print chart method
    printCharts() {
      this.$refs.lineChart.printCharts()
    },

    // copy chart method
    copyCharts() {
      const isHttps = document.location.protocol === 'https:'
      const userAgent = navigator.userAgent
      const isChrome = userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1
      const isEdge = userAgent.indexOf('Edge') > -1
      if ((isChrome || isEdge) && isHttps) {
        this.$refs.lineChart.copyCharts()
      } else {
        this.$message.error(this.$t('licenses.copyMessage'))
      }
    },

    // export datagrid data
    exportData(type) {
      getLicensesUsageExport(this.interval, this.param, type).then(res => {
        downloadCsv(res, 'license', type)
      })

      // this.$refs.dataGrid.exportData()
    }
  }
}
</script>

<style lang="less" scoped>
.usage-report{
  min-height: 550px ;

  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  height: calc(100vh - 147px);
}
.usage-report-op{
  height: calc(100vh - 104px) !important;
  min-height: 700px !important;
  min-width: 760px !important;
}

.usage-content{
  background-color: #ffffff;
  box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(101, 102, 104, 0.16);
  flex-grow: 1;
}

/deep/ .ant-tabs-nav-container{
    padding-left: 24px;
    font-family: MediumWeb;
}
.usage-content /deep/ .ant-tabs-ink-bar{
  z-index: 0!important;
}
.spin{
  width: calc(100vw - 285px);
}
</style>
