<template>
  <mf-modal
    id="projectPlanningAndTrackingModal"
    :visible="visible"
    class="qpm-modal"
    width="802px"
    destroy-on-close
    :next-disabled="isSaveBtnDisabled"
    :confirm-loading="isSaveBtnLoading"
    @ok="onSave"
    @cancel="beforeClose"
  >
    <template #title>
      <span>
        {{ $t('tools.QPM.title') }}
        <mf-help-btn :help="PROJECT_PLANNING_AND_TRACKING" />
      </span>
    </template>

    <template #default>
      <a-spin :spinning="isRequestsFinished">
        <mf-form>
          <!-- general -->
          <qpm-general @finish:statusRequest="onStatusRequestFinished" />

          <!-- scheduling -->
          <qpm-scheduling
            v-model="QPMSettings[QPMDataWrapperMap.qpmScheduling]"
          />

          <!-- purge -->
          <qpm-purge v-model="QPMSettings[QPMDataWrapperMap.qpmPurge]" />

          <!-- advanced -->
          <qpm-advanced
            ref="qpmAdvancedRef"
            v-model="QPMSettings[QPMDataWrapperMap.qpmAdvanced]"
            @trigger:enableSave="onEnableSave"
          />
        </mf-form>
      </a-spin>
    </template>
  </mf-modal>
</template>

<script>
import QpmGeneral from './components/QpmGeneral/index.vue'
import QpmScheduling from './components/QpmScheduling/index.vue'
import QpmPurge from './components/QpmPurge/index.vue'
import QpmAdvanced from './components/QpmAdvanced/index.vue'
import { PROJECT_PLANNING_AND_TRACKING } from 'config/help.js'
import { getQPMSettings, updateQPMSettings } from '@/api/tools.js'
import { QPMDataWrapperMap, QPMFieldMap } from './config/QPM.config.js'
import { isChangeObjorArr } from '@/utils/index.js'
import { QPM_BOUNDARY_CONDITION } from '@/store/const.js'

export default {
  components: { QpmGeneral, QpmScheduling, QpmPurge, QpmAdvanced },

  data() {
    return {
      visible: false,
      PROJECT_PLANNING_AND_TRACKING,
      QPMDataWrapperMap,

      initialQPMSettings: {},
      QPMSettings: {
        [QPMDataWrapperMap.qpmScheduling]: {
          [QPMFieldMap.qpmScheduling.isAutoRun]: null,
          [QPMFieldMap.qpmScheduling.startTime]: '',
          [QPMFieldMap.qpmScheduling.recurrence]: null,
          [QPMFieldMap.qpmScheduling.isAbortCalc]: null,
          [QPMFieldMap.qpmScheduling.calcDurationLimit]: null
        },
        [QPMDataWrapperMap.qpmPurge]: {
          [QPMFieldMap.qpmPurge.periodDays]:
            QPM_BOUNDARY_CONDITION.qpmPurge.periodDays.min,
          [QPMFieldMap.qpmPurge.rowsLimit]: null
        },
        [QPMDataWrapperMap.qpmAdvanced]: {
          [QPMFieldMap.qpmAdvanced.engineCount]:
            QPM_BOUNDARY_CONDITION.qpmAdvanced.engineCount.min,
          [QPMFieldMap.qpmAdvanced.engineThrottle]:
            QPM_BOUNDARY_CONDITION.qpmAdvanced.engineThrottle.min,
          [QPMFieldMap.qpmAdvanced.timeoutSeconds]: null,
          [QPMFieldMap.qpmAdvanced.intervalMillisec]: null
        }
      },

      isSaveBtnDisabled: true,
      isSaveBtnLoading: false,

      isAdvancedOverrided: null,

      // helper to add content loading
      isDataRequestFinished: false,
      isStatusRequestFinished: false
    }
  },

  computed: {
    isRequestsFinished() {
      return !(this.isDataRequestFinished && this.isStatusRequestFinished)
    }
  },

  watch: {
    QPMSettings: {
      handler: function(newSettings) {
        if (this.isAdvancedOverrided === null) {
          this.isSaveBtnDisabled = isChangeObjorArr(
            newSettings,
            this.initialQPMSettings
          )
        }
      },
      deep: true
    }
  },

  methods: {
    show() {
      this.changeVisible(true)
      getQPMSettings()
        .then(res => this.handleResponse(res))
        .catch(console.log)
        .finally(() => this.changeIsDataRequestFinished(true))
    },

    doClose() {
      this.changeVisible(false)
      this.initialQPMSettings = this.QPMSettings = {}
      this.isAdvancedOverrided = null
      this.isDataRequestFinished = false
      this.isStatusRequestFinished = false
    },

    beforeClose() {
      if (!this.isSaveBtnDisabled) {
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('tools.QPM.confirmCancelWithoutSave'),
          cancelText: this.$t('no'),
          confirmText: this.$t('yes'),
          onConfirm: this.doClose
        })
      } else {
        this.doClose()
      }
    },

    beforeSave() {
      if (!this.isAdvancedOverrided) {
        this.QPMSettings[
          QPMDataWrapperMap.qpmAdvanced
        ] = this.initialQPMSettings[QPMDataWrapperMap.qpmAdvanced]
      }
      this.changeIsSaveBtnLoading(true)
    },

    onSave() {
      this.beforeSave()
      updateQPMSettings(this.QPMSettings)
        .then(res =>
          this.handleResponse(res, () =>
            this.$message.success(this.$t('tools.QPM.saveSuccessfully'))
          )
        )
        .finally(() => {
          this.changeIsSaveBtnLoading(false)
          this.doClose()
        })
    },

    changeVisible(visible) {
      this.visible = visible
    },

    changeIsSaveBtnLoading(isSaveBtnLoading) {
      this.isSaveBtnLoading = isSaveBtnLoading
    },

    changeIsDataRequestFinished(isDataRequestFinished) {
      this.isDataRequestFinished = isDataRequestFinished
    },

    changeIsStatusRequestFinished(isStatusRequestFinished) {
      this.isStatusRequestFinished = isStatusRequestFinished
    },

    handleResponse(res, callback = null) {
      this.initialQPMSettings = res?.[QPMDataWrapperMap.qpmSettings] || {}

      if (this.initialQPMSettings[QPMDataWrapperMap.qpmGeneral]) {
        delete this.initialQPMSettings[QPMDataWrapperMap.qpmGeneral]
      }
      this.QPMSettings = JSON.parse(JSON.stringify(this.initialQPMSettings))

      callback && callback()
    },

    onEnableSave(isOverrided) {
      this.isSaveBtnDisabled = false
      this.isAdvancedOverrided = isOverrided
    },

    onStatusRequestFinished() {
      this.changeIsStatusRequestFinished(true)
    }
  }
}
</script>

<style scoped lang="less">
/deep/ .ant-modal-body {
  padding-top: 8px;
}
</style>

<style lang="less">
.qpm-modal {
  .input-number-row {
    height: 32px;
    line-height: 32px;
  }

  .mf-select-row {
    height: 24px;
    line-height: 24px;
  }

  .qpm-content-sub-row {
    margin-top: 16px;

    .qpm-content-sub-label {
      padding-left: 24px;
    }
  }

  .ant-form label {
    margin-left: 0;
  }

  .ant-form-item,
  .ant-form-item-label,
  .ant-form-item-control-wrapper {
    height: 32px;
    line-height: 32px;
  }

  .ant-form-item-control {
    height: 32px;
    line-height: 32px;
  }
}
</style>
