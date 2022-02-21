<template>
  <div class="app-servers-content-wrapper">
    <mf-form
      id="app-servers-content-form"
      ref="contentFormRef"
      class="content-form"
      layout="horizontal"
      :model="form"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :rules="rules"
    >
      <!-- general settings -->
      <app-servers-info-container id="app-server-general-settings">
        <template #title>
          <span>{{ $t('servers.GeneralSettings') }}</span>
        </template>

        <template #content>
          <a-row :gutter="16">
            <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
              <a-form-model-item :label="$t('servers.Address')">
                <a-input v-model="form.address" disabled />
              </a-form-model-item>
            </a-col>
          </a-row>
        </template>
      </app-servers-info-container>

      <!-- client SA PPaT -->
      <app-servers-info-container
        v-for="category in isNotDeniedFeature(['QUALITY_PROJECT_MANAGEMENT']) ? [...logCategories, ...logCategoriesPPaT] : logCategories"
        :id="'app-server-' + category.name.toLowerCase()"
        :key="category.name"
      >
        <template #title>
          <span>{{ category.title }}</span>
        </template>

        <template #content>
          <log-file-settings
            :value="form[category.name]"
            :prop-prefix="category.name"
          />
        </template>
      </app-servers-info-container>

      <!-- miscellaneous -->
      <app-servers-info-container id="app-server-miscellaneous">
        <template #title>
          <span>{{ $t('servers.Miscellaneous') }}</span>
        </template>

        <template #content>
          <a-row :gutter="16">
            <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
              <a-form-model-item
                :label="$t('servers.MaximumDatabaseConnections')"
                prop="maxDatabaseConnections"
              >
                <a-input-number
                  ref="maxDatabaseConnectionsRef"
                  v-model="form.maxDatabaseConnections"
                  :min="APP_SERVER_BOUNDARY_CONDITION.DatabaseConnections.min"
                  :max="APP_SERVER_BOUNDARY_CONDITION.DatabaseConnections.max"
                  :formatter="limitNumber"
                  :parser="limitNumber"
                  @pressEnter="checkMaxDatabaseConnections"
                />
              </a-form-model-item>
            </a-col>
          </a-row>
        </template>
      </app-servers-info-container>
    </mf-form>

    <!-- btn group -->
    <div class="btn-group">
      <!-- restore btn -->
      <a-button
        id="app-servers-restore-btn"
        class="mf-btn-dashed restore-btn"
        :disabled="isBtnDisabled"
        @click="onRestore"
      >
        {{ $t('Restore') }}
      </a-button>

      <!-- save btn -->
      <a-button
        id="app-servers-save-btn"
        type="primary"
        class="save-btn"
        :loading="isBtnLoading"
        :disabled="isBtnDisabled"
        @click="onSave"
      >
        {{ $t('Save') }}
      </a-button>
    </div>
  </div>
</template>

<script>
import AppServersInfoContainer from './components/AppServersInfoContainer.vue'
import LogFileSettings from './components/LogFileSettings.vue'
import { dataWrapperMap, fieldMap } from '../../config/appServers.config.js'
import { DealServerData, strategyMap } from '../../util/index.js'
import { getAppServer, updateAppServer } from '@/api/servers.js'
import { isChangeObjorArr } from '@/utils/index.js'
import { limitNumber } from '@/utils/validate'
import { APP_SERVER_BOUNDARY_CONDITION } from '@/store/const.js'

export default {
  components: { AppServersInfoContainer, LogFileSettings },

  emits: ['trigger:restore'],

  data() {
    return {
      APP_SERVER_BOUNDARY_CONDITION,
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      limitNumber,

      // form info
      initialForm: {},
      form: {
        id: null,
        address: null,
        name: null,
        isActive: false,
        serverType: '',
        maxDatabaseConnections: null,
        [strategyMap.client]: {
          LogLevel: '',
          LogLines: null,
          LogDays: null,
          LogFileLocation: ''
        },
        [strategyMap.SA]: {
          LogLevel: '',
          LogLines: null,
          LogDays: null,
          LogFileLocation: ''
        },
        [strategyMap.PPaT]: {
          LogLevel: '',
          LogLines: null,
          LogDays: null,
          LogFileLocation: ''
        }
      },

      isBtnDisabled: true,
      isBtnLoading: false,

      isOnRequest: false,

      // info category list
      logCategories: [
        {
          name: strategyMap.client,
          title: this.$t('servers.ClientLogFileSettings')
        },
        {
          name: strategyMap.SA,
          title: this.$t('servers.SiteAdministrationLogFileSettings')
        }
      ],
      logCategoriesPPaT: [
        {
          name: strategyMap.PPaT,
          title: this.$t('servers.ProjectPlanningandTrackingLogFileSettings')
        }
      ],

      // validate rules
      rules: {
        // client
        [strategyMap.client + '.' + 'LogLines']: [
          { validator: this.validateLogLines(strategyMap.client) }
        ],
        [strategyMap.client + '.' + 'LogFileLocation']: [
          { required: true, validator: this.validateLogFileLocation }
        ],

        // sa
        [strategyMap.SA + '.' + 'LogLines']: [
          { validator: this.validateLogLines(strategyMap.SA) }
        ],
        [strategyMap.SA + '.' + 'LogFileLocation']: [
          { required: true, validator: this.validateLogFileLocation }
        ],

        // ppat
        [strategyMap.PPaT + '.' + 'LogLines']: [
          { validator: this.validateLogLines(strategyMap.PPaT) }
        ],
        [strategyMap.PPaT + '.' + 'LogFileLocation']: [
          { required: true, validator: this.validateLogFileLocation }
        ],

        // max-handler
        maxDatabaseConnections: [
          {
            validator: this.validateMaxDatabaseConnections
          }
        ]
      }
    }
  },
  watch: {
    form: {
      handler: function(newForm) {
        this.isBtnDisabled = isChangeObjorArr(newForm, this.initialForm)
        this.updateBtnDisabled(this.isBtnDisabled)

        if (!this.isBtnDisabled) {
          this.$store.dispatch('pageChange/pageChanged', {
            func: null,
            params: []
          })
        } else {
          this.$store.dispatch('pageChange/resetPageChanged')
        }
      },
      deep: true
    }
  },

  methods: {
    commitServerData() {
      this.$refs.contentFormRef.$children[0].validate(valid => {
        if (valid) {
          const updatedServerData = DealServerData.getOriginEntireForm(
            this.form
          )

          this.updateBtnLoading(true)
          updateAppServer(updatedServerData[fieldMap.id], updatedServerData)
            .then(res => {
              this.dealForm(res)
              this.$message.success(this.$t('servers.ServerUpdateSuccessfully'))
            })
            .catch(console.log)
            .finally(() => this.updateBtnLoading(false))
        }
      })
    },

    dealForm(res) {
      this.initialForm = DealServerData.getCustomEntireForm(
        res[dataWrapperMap.server]
      )
      this.form = JSON.parse(JSON.stringify(this.initialForm))
    },

    updateBtnLoading(isBtnLoading) {
      this.isBtnLoading = isBtnLoading
    },

    updateBtnDisabled(isBtnDisabled) {
      this.isBtnDisabled = isBtnDisabled
    },

    getAppServerInfo(serverId, isSideMenuClick = false) {
      // !isisSideMenuClick means to refresh serverList
      if (!isSideMenuClick) {
        // if there is a request that is onFulflled, don't request again
        if (this.isOnRequest) return
        // if the id passed in is the same as the id watched, don't request again
        if (serverId === this.selectedServerId) return
      }

      getAppServer(serverId)
        .then(res => {
          this.isOnRequest = true
          this.dealForm(res)
        })
        .catch(console.log)
        .finally(() => {
          this.$refs.contentFormRef.$children[0].clearValidate()
          this.isOnRequest = false
        })
    },

    validateMaxDatabaseConnections(rule, value, callback) {
      if (
        !value ||
        value < APP_SERVER_BOUNDARY_CONDITION.DatabaseConnections.min
      ) {
        this.form.maxDatabaseConnections =
          APP_SERVER_BOUNDARY_CONDITION.DatabaseConnections.min
      }

      if (value > APP_SERVER_BOUNDARY_CONDITION.DatabaseConnections.max) {
        this.form.maxDatabaseConnections =
          APP_SERVER_BOUNDARY_CONDITION.DatabaseConnections.max
      }

      callback()
    },

    validateLogFileLocation(rule, value, callback) {
      if (!value) {
        callback(new Error(this.$t('servers.validateLogFileLocationIsEmpty')))
      }

      if (/[\*\?\"\<\>\|]{1,}/g.test(value)) {
        callback(new Error(this.$t('servers.validateLogFileLocationCharacter')))
      }

      callback()
    },

    validateLogLines(category) {
      return (rule, value, callback) => {
        if (!value || value < APP_SERVER_BOUNDARY_CONDITION.LogLines.min) {
          this.form[category].LogLines =
            APP_SERVER_BOUNDARY_CONDITION.LogLines.min
        }

        if (value > APP_SERVER_BOUNDARY_CONDITION.LogLines.max) {
          this.form[category].LogLines =
            APP_SERVER_BOUNDARY_CONDITION.LogLines.max
        }

        callback()
      }
    },

    checkMaxDatabaseConnections() {
      this.$refs.contentFormRef.$children[0].validateField(
        'maxDatabaseConnections'
      )
      this.$refs.maxDatabaseConnectionsRef.blur()
    },

    onSave() {
      this.commitServerData()
    },

    onRestore() {
      this.$emit('trigger:restore')
    }
  }
}
</script>

<style scoped lang="less">
.app-servers-content-wrapper {
  width: 100%;
  height: 100%;
  background: #ffffff;
  padding: 0 0 0 24px;
  overflow: hidden;
  position: relative;

  .content-form {
    padding-right: 50px;
    height: calc(100% - 64px);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .btn-group {
    width: 100%;
    height: 64px;
    line-height: 64px;
    border-top: 1px solid rgba(101, 102, 104, 0.16);
    position: absolute;
    left: 0;
    bottom: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .restore-btn {
      margin-right: 8px;
    }

    .save-btn {
      margin-right: 24px;
    }
  }
}
</style>

<style lang="less">
.app-servers-info-container-wrapper {
  .ant-row .ant-form-item,
  .ant-col,
  .ant-col.ant-form-item-label,
  .ant-col.ant-form-item-label label,
  .ant-form-item-control-wrapper,
  .ant-form-item-control {
    height: 32px;
    line-height: 32px;
  }

  .ant-row .ant-form-item {
    margin: 0;
  }

  .ant-col {
    margin-bottom: 24px;
  }
}
</style>
