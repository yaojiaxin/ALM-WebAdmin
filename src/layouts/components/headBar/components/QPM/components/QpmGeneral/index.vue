<template>
  <div class="qpm-general">
    <card-container>
      <!-- Current Status -->
      <card-item>
        <template #title>{{ $t('tools.QPM.CurrentStatus.title') }}</template>

        <template #content>
          <span class="current-status-text">{{ currentStatus }}</span>
          <a-button
            id="qpm-change-current-status-btn"
            type="link"
            class="mf-btn-link-primary ml-8"
            :loading="isCurrStatusBtnLoading"
            @click="onCurrentStatusBtnClick"
          >
            {{ currentStatusBtnText }}
          </a-button>
        </template>
      </card-item>

      <!-- Refresh Status -->
      <card-item class="refresh-now">
        <template #title>{{ $t('tools.QPM.RefreshStatus.title') }}</template>

        <template #content>
          <a-radio-group v-model="isManualRefresh" @change="onRadioGroupChange">
            <!-- Manual Refresh -->
            <a-row>
              <a-col :span="24">
                <a-radio id="manual-refresh" :value="true">
                  <span :title="$t('tools.QPM.RefreshStatus.ManualRefresh')">
                    {{ $t('tools.QPM.RefreshStatus.ManualRefresh') }}
                  </span>
                </a-radio>

                <a-button
                  id="qpm-refresh-now-btn"
                  type="link"
                  class="mf-btn-link-primary ml-8"
                  :disabled="!isManualRefresh"
                  :loading="isRefreshNowBtnLoading"
                  @click="onRefreshNowBtnClick"
                >
                  {{ $t('tools.QPM.RefreshStatus.RefreshNow') }}
                </a-button>
              </a-col>
            </a-row>

            <!-- Automatically Refresh In -->
            <row-layout class="input-number-row refresh-now-content-second-row">
              <template #label>
                <a-radio
                  id="automatically-refresh-in"
                  :value="false"
                  class="auto-refresh-radio"
                >
                  <span
                    :title="
                      $t('tools.QPM.RefreshStatus.AutomaticallyRefreshIn')
                    "
                  >
                    {{ $t('tools.QPM.RefreshStatus.AutomaticallyRefreshIn') }}
                  </span>
                </a-radio>
              </template>

              <template #content>
                <qpm-input-number
                  id="qpm-refresh-interval-input-number"
                  ref="qpmRefreshIntervalInputNumberRef"
                  v-model="refreshInterval"
                  :min="QPM_BOUNDARY_CONDITION.qpmGeneral.refreshInterval.min"
                  :max="QPM_BOUNDARY_CONDITION.qpmGeneral.refreshInterval.max"
                  :disabled="isManualRefresh"
                  :unit="$t('tools.QPM.RefreshStatus.Seconds')"
                  :formatter="limitNumber"
                  :parser="limitNumber"
                  @pressEnter="onPressEnter"
                  @change="onRefreshIntervalChange"
                />
              </template>
            </row-layout>
          </a-radio-group>
        </template>
      </card-item>
    </card-container>
  </div>
</template>

<script>
import CardContainer from '../Card/CardContainer.vue'
import CardItem from '../Card/CardItem.vue'
import RowLayout from '../shared/RowLayout.vue'
import QpmInputNumber from '../shared/QpmInputNumber.vue'
import {
  QPMStatusFieldMap,
  QPMDataWrapperMap,
  QPMStatusMap,
  QPMFieldMap
} from '../../config/QPM.config.js'
import { getQPMStatus, updateQPMSettings } from '@/api/tools.js'
import {
  getRefreshInterval,
  setRefreshInterval
} from '../../utils/index.js'
import { limitNumber } from '@/utils/validate'
import { QPM_BOUNDARY_CONDITION } from '@/store/const.js'

export default {
  components: { CardContainer, CardItem, RowLayout, QpmInputNumber },

  emits: ['finish:statusRequest'],

  data() {
    return {
      QPM_BOUNDARY_CONDITION,
      limitNumber,

      QPMStatus: {
        [QPMStatusFieldMap.currentStatus]: QPMStatusMap.inactive,
        [QPMStatusFieldMap.isEnabled]: false
      },

      // refresh interval
      isManualRefresh: true,
      refreshInterval:
        QPM_BOUNDARY_CONDITION.qpmGeneral.refreshInterval.default,
      intervalId: null,

      isCurrStatusBtnLoading: false,
      isRefreshNowBtnLoading: false
    }
  },

  computed: {
    isEnabled() {
      return !!this.QPMStatus[QPMStatusFieldMap.isEnabled]
    },

    isActive() {
      return (
        this.QPMStatus[QPMStatusFieldMap.currentStatus] === QPMStatusMap.active
      )
    },

    // text to show in 'Current Status' row
    currentStatus() {
      const ableStatusStr = this.$t(
        this.isEnabled
          ? 'tools.QPM.CurrentStatus.Enabled'
          : 'tools.QPM.CurrentStatus.Disabled'
      )
      const activeStatusStr = this.$t(
        this.isActive
          ? 'tools.QPM.CurrentStatus.Active'
          : 'tools.QPM.CurrentStatus.Inactive'
      )
      return `${ableStatusStr}, ${activeStatusStr}`
    },

    currentStatusBtnText() {
      return this.$t(
        this.isEnabled
          ? 'tools.QPM.CurrentStatus.DisableCalculation'
          : 'tools.QPM.CurrentStatus.EnableCalculation'
      )
    }
  },

  watch: {
    refreshInterval(interval) {
      if (
        interval ===
        QPM_BOUNDARY_CONDITION.qpmGeneral.refreshInterval.isMenuRefresh
      ) {
        this.flushInterval()
      } else {
        this.createInterval()
      }
    }
  },

  created() {
    this.fetchQPMStatus(true)

    // search cookie to find whether there is on automatically refreshing
    const interval = getRefreshInterval()
    if (interval === -1) {
      this.isManualRefresh = true
      this.refreshInterval =
        QPM_BOUNDARY_CONDITION.qpmGeneral.refreshInterval.default
    } else {
      this.isManualRefresh = false
      this.refreshInterval = +interval
      this.createInterval()
    }
  },

  beforeDestroy() {
    this.flushInterval()
  },

  methods: {
    /**
     * @param isFirstRequest whether this method is called when the component created
     * @param isMenuRefresh whether this method is scalled after clicking refreshNow btn
     */
    fetchQPMStatus(isFirstRequest = false, isMenuRefresh = false) {
      if (isMenuRefresh) {
        this.changeIsRefreshNowBtnLoading(true)
      }

      getQPMStatus()
        .then(res => {
          this.QPMStatus =
            res?.[QPMDataWrapperMap.qpmSettings] || this.QPMStatus

          if (isMenuRefresh) {
            this.$message.success(
              this.$t('tools.QPM.RefreshStatus.refreshStatusSuccessfully')
            )
          }
        })
        .catch(console.log)
        .finally(() => {
          // after first request finished, notify $parent
          if (isFirstRequest) {
            this.$emit('finish:statusRequest')
          }

          if (isMenuRefresh) {
            this.changeIsRefreshNowBtnLoading(false)
          }
        })
    },

    onCurrentStatusBtnClick() {
      if (this.isEnabled) {
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('tools.QPM.CurrentStatus.confirmDisableCalcStatus'),
          cancelText: this.$t('no'),
          confirmText: this.$t('yes'),
          onConfirm: () => this.updateIsQPMEnabled(false)
        })
      } else {
        this.updateIsQPMEnabled(true)
      }
    },

    onRefreshNowBtnClick() {
      this.fetchQPMStatus(false, true)
    },

    onRefreshIntervalChange(value) {
      let ret = value

      if (
        !value ||
        value < QPM_BOUNDARY_CONDITION.qpmGeneral.refreshInterval.min
      ) {
        ret = QPM_BOUNDARY_CONDITION.qpmGeneral.refreshInterval.min
      } else if (
        value > QPM_BOUNDARY_CONDITION.qpmGeneral.refreshInterval.max
      ) {
        ret = QPM_BOUNDARY_CONDITION.qpmGeneral.refreshInterval.max
      }

      this.refreshInterval = value = ret
      setRefreshInterval(+value)
    },

    onPressEnter() {
      this.onRefreshIntervalChange(this.refreshInterval)
      this.$refs.qpmRefreshIntervalInputNumberRef.blur()
    },

    onRadioGroupChange(e) {
      const isManualRefresh = e.target.value
      let interval

      if (isManualRefresh) {
        interval =
          QPM_BOUNDARY_CONDITION.qpmGeneral.refreshInterval.isMenuRefresh
        this.flushInterval()
      } else {
        interval = this.refreshInterval
        this.createInterval()
      }

      setRefreshInterval(+interval)
    },

    updateIsQPMEnabled(isQPMEnabled) {
      this.QPMStatus[QPMStatusFieldMap.isEnabled] = isQPMEnabled
      const data = {
        [QPMDataWrapperMap.qpmGeneral]: {
          [QPMFieldMap.qpmGeneral.isEnabled]: isQPMEnabled
        }
      }

      this.changeIsCurrStatusBtnLoading(true)
      return updateQPMSettings(data)
        .then(res => {
          const isQpmEnabled =
            res?.[QPMDataWrapperMap.qpmSettings][QPMDataWrapperMap.qpmGeneral][
              QPMFieldMap.qpmGeneral.isEnabled
            ]
          this.QPMStatus[QPMStatusFieldMap.isEnabled] = isQpmEnabled

          this.$message.success(
            this.$t(
              `tools.QPM.CurrentStatus.${
                isQpmEnabled
                  ? 'enableCalculationSuccessfully'
                  : 'disableCalculationSuccessfully'
              }`
            )
          )
        })
        .catch(console.log)
        .finally(() => this.changeIsCurrStatusBtnLoading(false))
    },

    createInterval() {
      this.flushInterval()
      this.intervalId = setInterval(
        this.fetchQPMStatus,
        this.refreshInterval * 1000
      )
    },

    flushInterval() {
      clearInterval(this.intervalId)
    },

    changeIsCurrStatusBtnLoading(isCurrStatusBtnLoading) {
      this.isCurrStatusBtnLoading = isCurrStatusBtnLoading
    },

    changeIsRefreshNowBtnLoading(isRefreshNowBtnLoading) {
      this.isRefreshNowBtnLoading = isRefreshNowBtnLoading
    }
  }
}
</script>

<style scoped lang="less">
.qpm-general {
  span {
    height: 19px;
    line-height: 19px;
  }

  .ml-8 {
    margin-left: 8px;
  }

  .current-status-text {
    height: 32px;
    line-height: 32px;
  }

  /deep/ .ant-radio-group {
    width: 100%;
  }

  /deep/ .ant-radio-wrapper {
    margin-right: 0;

    span {
      padding-right: 0;
    }
  }

  .refresh-now {
    margin-top: 24px;

    .refresh-now-content-second-row {
      margin-top: 16px;
    }
  }

  .auto-refresh-radio {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    height: 32px;
    line-height: 32px;
  }
}
</style>
