<template>
  <div :class="['report-header',reportHeaderOp]">
    <div class="header-left">
      <div class="header-title">
        <span class="title-txt">
          {{ $t('licenses.LICENSES') }}
        </span>
      </div>

      <div v-if="icon==='line'" class="icon-group">
        <icon-btn
          id="a-icon-clone"
          :icon-title="$t('licenses.clone')"
          icon-style="icon-licensesCopy"
          @onClick="copyCharts"
        />

        <icon-btn
          id="a-icon-print-graph"
          :icon-title="$t('licenses.portrait')"
          icon-style="icon-Print"
          @onClick="printCharts"
        />
      </div>

      <div v-else class="icon-group export">
        <a-dropdown :trigger="['click']">
          <template #overlay>
            <a-menu>
              <a-menu-item v-if="isSiteAdmin()" key="1" @click="exportData('text/plain')">{{ $t('licenses.text_format') }}</a-menu-item>
              <a-menu-item v-if="isSiteAdmin()" key="2" @click="exportData('multipart/form-data')">{{ $t('licenses.excel_sheet') }}</a-menu-item>
              <a-menu-item v-if="isSiteAdmin()" key="3" @click="exportData('application/msword')">{{ $t('licenses.word_document') }}</a-menu-item>
              <a-menu-item v-if="isSiteAdmin()" key="4" @click="exportData('text/html')">{{ $t('licenses.html_document') }}</a-menu-item>
              <a-menu-item key="5" @click="exportData('text/csv')">{{ $t('licenses.export_to_csv') }}</a-menu-item>
            </a-menu>
          </template>
          <a-button
            class="tool-dropdown-btn"
            type="link"
          >
            <i class="iconfont icon-Export tool-dropdown-btn-i" />
            <i class="iconfont icon-CaretDown tool-dropdown-btn-i tool-CaretDown-btn-i" />
          </a-button>
        </a-dropdown>
      </div>

      <div v-serverType="[SERVER_TYPE.OnPremise]" class="radio-group">
        <mf-select
          v-model="lastTime"
          :allow-clear="false"
          class="lastTimeSelect"
          @change="lastTimeChange"
        >
          <a-select-option v-for="item in lastTimeList" :key="item.value" :value="item.value">
            {{ item.name }}
          </a-select-option>
        </mf-select>
      </div>

      <div v-serverType="[SERVER_TYPE.Saas]" class="radio-group">
        <mf-select
          v-model="lastTime"
          class="lastTimeSelect"
          @change="lastTimeChange"
        >
          <a-select-option v-for="item in lastTimeList" :key="item.value" :value="item.value">
            {{ item.name }}
          </a-select-option>
        </mf-select>
      </div>

      <div v-serverType="[SERVER_TYPE.OnPremise]" class="date-group">
        <a-range-picker
          :default-value="[start_date, end_date]"
          :value="[start_date, end_date]"
          :disabled="disabled"
          :allow-clear="false"
          @change="onChange"
        >
          <a-icon slot="suffixIcon" type="calendar" :class="[disabled?'disabled-color': '']" />
        </a-range-picker>
      </div>
    </div>

    <div class="header-right">
      <div v-serverType="[SERVER_TYPE.OnPremise]" class="interval-group">
        <mf-select
          v-model="interval"
          class="lastTimeSelect"
          :allow-clear="false"
          @change="intervalChange"
        >
          <a-select-option v-for="item in intervalList" :key="item.interval" :value="item.interval" :disabled="item.disabled">
            {{ item.value }}
          </a-select-option>
        </mf-select>
      </div>

      <div class="filter-refresh-group">

        <div class="filter-btn">
          <mf-badge :badge="isBadge">
            <a-button id="connected-filter-btn" class="mf-btn-filter" @click="onFilterClick">
              <i :class="['iconfont','icon-spread']" />
              {{ $t("filter") }}
            </a-button>
          </mf-badge>
        </div>

        <div class="usage-devide" />

        <icon-btn
          id="a-icon-refresh"
          :is-disabled="false"
          :icon-title="$t('refresh')"
          icon-style="icon-refresh"
          class="project-refresh"
          @onClick="refreshFilter"
        />
      </div>
    </div>

  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import { SERVER_TYPE } from '@/store/const'

import moment from 'moment'
import { mapGetters } from 'vuex'
import { isSiteAdmin } from '@/utils/permission'
import MfBadge from '@/components/MFBadge/index'
export default {
  components: {
    IconBtn,
    MfBadge
  },
  props: {
    icon: {
      default: 'line',
      type: String
    }
  },
  data() {
    return {
      isSiteAdmin,
      isBadge: false,

      SERVER_TYPE,
      interval: 'DAYS',
      intervalList: [
        {
          interval: 'DAYS',
          value: this.$t('licenses.Daily'),
          disabled: false
        },
        {
          interval: 'WEEKS',
          value: this.$t('licenses.Weekly'),
          disabled: false
        },
        {
          interval: 'MONTHS',
          value: this.$t('licenses.Monthly'),
          disabled: false
        },
        {
          interval: 'YEARS',
          value: this.$t('licenses.Yearly'),
          disabled: false
        }
      ],
      lastTimeList: [],
      lastTime: '',
      reportHeaderOp: '',
      start_date: moment().subtract(6, 'days'),
      end_date: moment(new Date(), 'YYYY-MM-DD'),
      disabled: true,
      intervalNum: 0
    }
  },
  computed: {
    ...mapGetters(['serverType'])
  },
  created() {
    if (this.serverType === SERVER_TYPE.OnPremise) this.reportHeaderOp = 'report-header-op'
  },
  mounted() {
    this.getLastTimeList()
  },
  methods: {
    getLastTimeList() {
      if (this.serverType === SERVER_TYPE.Saas) {
        this.lastTimeList = [
          { value: 'LastWeek', name: this.$t('licenses.LastWeek') },
          { value: 'LastTwoWeeks', name: this.$t('licenses.LastTwoWeeks') },
          { value: 'LastMonth', name: this.$t('licenses.LastMonth') },
          { value: 'LastTwoMonths', name: this.$t('licenses.LastTwoMonths') },
          { value: 'LastThreeMonths', name: this.$t('licenses.LastThreeMonths') },
          { value: 'LastSixMonths', name: this.$t('licenses.LastSixMonths') }
        ]
        this.lastTime = 'LastWeek'
      } else {
        this.lastTimeList = [
          { value: 'Last7Days', name: this.$t('licenses.Last7Days') },
          { value: 'Last5Weeks', name: this.$t('licenses.Last5Weeks') },
          { value: 'Last12Months', name: this.$t('licenses.Last12Months') },
          { value: 'AllDays', name: this.$t('licenses.AllDays') },
          { value: 'CustomPeriod', name: this.$t('licenses.CustomPeriod') }
        ]
        this.lastTime = 'Last7Days'
      }
    },
    onFilterClick() {
      this.$emit('changeFilter')
    },
    changeBadgeStatus(e) {
      this.isBadge = e
    },

    // print charts methods
    printCharts() {
      this.$emit('print')
    },

    // clone charts methods
    copyCharts() {
      this.$emit('copy')
    },

    // export table data methods
    exportData(type) {
      this.$emit('export', type)
    },
    // Choose different time periods
    lastTimeChange(value) {
      this.end_date = moment(new Date(), 'YYYY-MM-DD')
      this.disabled = true
      this.intervalList[0].disabled = true
      this.interval = 'DAYS'
      this.intervalNum = 0

      switch (value) {
        // OP
        case 'Last5Weeks':
          this.start_date = moment().subtract(5, 'weeks')
          this.intervalList[0].disabled = false
          this.interval = 'WEEKS'
          break
        case 'Last12Months':
          this.start_date = moment().subtract(1, 'years')
          this.interval = 'WEEKS'
          break
        case 'AllDays':
          this.start_date = undefined
          this.end_date = undefined
          this.intervalList[0].disabled = false
          break
        case 'CustomPeriod':
          this.start_date = moment().subtract(4, 'days')
          this.disabled = false
          this.intervalList[0].disabled = false
          break
        case 'Last7Days':
          this.intervalList[0].disabled = false
          this.start_date = moment().subtract(6, 'days')
          break
        // saas
        case 'LastWeek':
          this.start_date = moment().subtract(1, 'weeks').add(1, 'days')
          break
        case 'LastTwoWeeks':
          this.start_date = moment().subtract(2, 'weeks').add(1, 'days')
          break
        case 'LastMonth':
          this.intervalNum = 1
          this.start_date = moment().subtract(1, 'months').add(1, 'days')
          break
        case 'LastTwoMonths':
          this.intervalNum = 2
          this.start_date = moment().subtract(2, 'months').add(1, 'days')
          break
        case 'LastThreeMonths':
          this.intervalNum = 6
          this.start_date = moment().subtract(3, 'months').add(1, 'days')
          break
        case 'LastSixMonths':
          this.intervalNum = 14
          this.start_date = moment().subtract(6, 'months').add(1, 'days')
          break
      }

      if (this.start_date === undefined && this.end_date === undefined) {
        this.$emit('onTimeInterval', this.start_date, this.end_date, this.interval, this.intervalNum)
      } else {
        this.$emit('onTimeInterval', moment(this.start_date).format('YYYY-MM-DD'), moment(this.end_date).format('YYYY-MM-DD'), this.interval, this.intervalNum)
      }
    },

    // Choose custom period and choose startdate and enddate
    onChange(dates) {
      this.start_date = dates[0]
      this.end_date = dates[1]
      const date = moment().subtract(6, 'months').unix()
      const date_start = moment(dates[0]).unix()
      if (date_start < date) {
        this.intervalList[0].disabled = true
        this.interval = 'WEEKS'
      }
      this.$emit('onTimeInterval', moment(this.start_date).format('YYYY-MM-DD'), moment(this.end_date).format('YYYY-MM-DD'), this.interval, this.intervalNum)
    },
    refreshFilter() {
      this.$emit('refreshFilter')
    },
    // refresh() {
    //   this.intervalNum = 0
    //   this.start_date = moment().subtract(6, 'days')
    //   this.end_date = moment(new Date(), 'YYYY-MM-DD')
    //   this.disabled = true
    //   this.interval = 'DAYS'
    //   this.$emit('onTimeInterval', moment(this.start_date).format('YYYY-MM-DD'), moment(this.end_date).format('YYYY-MM-DD'), this.interval, this.intervalNum)
    //   this.$emit('result')
    //   if (this.serverType === SERVER_TYPE.Saas) {
    //     this.lastTime = 'LastWeek'
    //   } else {
    //     this.lastTime = 'Last7Days'
    //   }
    // },

    // Choose time interval
    intervalChange() {
      this.$emit('onTimeInterval', moment(this.start_date).format('YYYY-MM-DD'), moment(this.end_date).format('YYYY-MM-DD'), this.interval, this.intervalNum)
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/variables.less';
  .report-header{
    line-height: 40px;
    //min-height: 57px;
    //max-height: 114px !important;
    padding-top: 10px;
    padding-bottom: 10px;
    border: 1px solid rgba(101, 102, 104, 0.16);
    border-bottom:0 ;
    //display: flex;
    align-items: center;
    background: #ffffff;
    box-shadow: 2px 2px 0 0 rgba(0, 0, 0, 0.15);
    justify-content: space-between;
    //overflow: hidden;
    flex-flow: wrap;
  }

  .header-left{
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    flex-wrap: wrap;
  }

  .header-right{
    display: flex;
    align-items: center;
  }
@media screen and (min-width: 1650px){
  .header-left{
    float: left;
  }
  .header-right{
    float: right;
  }
}

  .header-title{
    margin-left: 24px;
  }

  .title-txt{
    font-size: 16px;
    font-family: MediumWeb, serif;
    font-weight: 500;
    color: #000000;
    line-height: 19px;
  }

.icon-group{
  display: flex;
  align-items: center;
  margin-left: 24px;
  margin-right: 10px;
}

.export{
  margin-right: 79px;
}

.radio-group{
  font-size: 14px;
  font-weight: 500;
  color: #0073E7;
  line-height: 16px;
  flex-shrink: 0;
  width: 200px;
}

.span-group{
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.span-group-item{
  font-size: 14px;
  font-family: MediumWeb, serif;
  font-weight: 500;
  color: #000000;
  line-height: 16px;
  cursor: pointer;
  padding-left: 24px;
  &:hover{
    color: #0073E7;
    transition: .3s all ease-in;
  }
}

.checked{
  color: #0073E7;
}

.date-group{
  width: 240px;
  margin-left: 30px;
  flex-shrink: 0;
  min-width: 90px;
  display: flex;
  align-items: center;
}

.filter-refresh-group{
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 45px;
}

.usage-devide{
  width: 1px;
  height: 12px;
  background:#CCCCCC;
  margin-right: 23px;
  margin-left: 24px;
}

.filter-btn {
  min-width: 96px;
  padding: 0;
}

.lastTimeSelect{
  width: 100%;
}

.date-tit{
  margin-left: 20px;
  margin-right: 20px;
}

.interval-group{
  width: 230px;
  margin-left: 20px;
  margin-top: -3px;
}

.disabled-color{
  color: rgba(0, 0, 0, 0.2)
}
</style>
