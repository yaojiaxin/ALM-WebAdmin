<template>
  <mf-modal
    id="quality-insight-modal"
    :visible="visible"
    width="802px"
    destroy-on-close
    :next-disabled="isSaveBtnDisabled"
    :confirm-loading="isSaveBtnLoading"
    @ok="onSave"
    @cancel="doClose"
  >
    <template #title>
      <span>
        {{ $t('tools.qualityInsight.settings') }}
        <mf-help-btn :help="QUALITY_INSIGHT_SETTINGS" />
      </span>
    </template>

    <template #default>
      <a-spin :spinning="!isDataRequestFinished">
        <mf-form
          id="quality-insight-form"
          ref="qualityInsightFormRef"
          layout="horizontal"
          class="qis-form"
          :model="qualityInsightInfo"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :rules="rules"
        >
          <!-- status -->
          <a-row class="qis-row">
            <a-form-model-item :label="$t('tools.qualityInsight.status')">
              <a-switch
                id="quality-insight-status-switch"
                v-model="qualityInsightInfo[fieldMap.status]"
                @click="onSwitchClick"
              />
            </a-form-model-item>
          </a-row>

          <!-- server -->
          <a-row class="qis-row qis-server-row">
            <!-- search url -->
            <a-form-model-item
              :label="$t('tools.qualityInsight.server')"
              class="qis-server-url-formitem"
              :prop="fieldMap.searchServerUrl"
            >
              <a-input
                id="quality-insight-server-input"
                v-model="qualityInsightInfo[fieldMap.searchServerUrl]"
                :placeholder="Placeholders.QUALITY_INSIGHT_SERVER"
                :disabled="!qualityInsightInfo[fieldMap.status]"
              />
            </a-form-model-item>

            <!-- test connection btn -->
            <a-button
              id="quality-insight-server-test-connection"
              class="mf-btn-link-primary qis-server-test-connection"
              type="link"
              :disabled="!qualityInsightInfo[fieldMap.status]"
              :loading="isTestConnectionBtnLoading"
              @click="onTestConnection"
            >
              {{ $t('tools.qualityInsight.testConnection') }}
            </a-button>
          </a-row>

          <!-- userName -->
          <a-row class="qis-row">
            <a-form-model-item
              :label="$t('tools.qualityInsight.userName')"
              :prop="fieldMap.searchServerUser"
              class="quality-insight-user-name"
            >
              <mf-select
                id="quality-insight-user-name-select"
                v-model="qualityInsightInfo[fieldMap.searchServerUser]"
                class="qis-user-select"
                :loading="isUserSelectLoading"
                :allow-clear="false"
                :disabled="!qualityInsightInfo[fieldMap.status]"
                :placeholder="$t('tools.qualityInsight.selectUserName')"
                :dropdown-menu-style="{ maxHeight: 132 + 'px' }"
                @dropdownVisibleChange="onDropdownVisibleChange"
                @popupScroll="onSelectScroll"
                @search="onSelectSearch"
              >
                <a-select-option
                  v-for="user in isSearchMode ? searchUserList : userList"
                  :key="user.name"
                  :value="user.name"
                >
                  {{ user.name }}
                </a-select-option>
              </mf-select>
            </a-form-model-item>
          </a-row>
        </mf-form>
      </a-spin>
    </template>
  </mf-modal>
</template>

<script>
import { QUALITY_INSIGHT_SETTINGS } from 'config/help.js'
import {
  getQualityInsightSettings,
  testQISearchServerConnection,
  updateQualityInsightSettings
} from '@/api/tools.js'
import { fetchUsersList } from '@/api/user'
import {
  dataWrapperMap,
  fieldMap,
  Placeholders,
  userFieldMap,
  createQualityInsightInfo
} from './config/qualityInsight.config.js'
import {
  useSelectScroll,
  ScrollingLoadSettings,
  throttle
} from './utils/index.js'
import { isChangeObjorArr } from '@/utils/index.js'
import {
  updateSaveBtnStatusStrategies,
  strategyMap
} from './config/strategy.js'

export default {
  data() {
    return {
      visible: false,

      // config & static
      QUALITY_INSIGHT_SETTINGS,
      Placeholders,
      fieldMap,
      labelCol: { span: 12 },
      wrapperCol: { span: 12 },

      // initial data
      initialQualityInsightInfo: {},

      // data to show
      qualityInsightInfo: createQualityInsightInfo(undefined),

      // user data
      userList: [],
      searchUserList: [],
      totalUserCount: 0,
      fetchedUserCount: 0,
      fetchCount: ScrollingLoadSettings.FETCH_COUNT,
      isUserListFirstLoaded: true,
      isSearchMode: false,

      // action status
      isUserSelectLoading: false,
      isUserFirstValidate: true,

      isSaveBtnDisabled: true,
      isSaveBtnLoading: false,

      isTestConnectionBtnLoading: false,

      isDataRequestFinished: false,

      // form validator rules
      rules: {
        [fieldMap.searchServerUrl]: [
          {
            type: 'string',
            required: true,
            message: this.$t(
              'tools.qualityInsight.qualityInsightServerValidate'
            )
          }
        ],
        [fieldMap.searchServerUser]: [
          {
            required: true,
            validator: this.validateUser()
          }
        ]
      },

      onSaveStrategies: {
        [strategyMap.FALSE_FLASE]: this.doClose,
        [strategyMap.FALSE_TRUE]: () =>
          this.updateQualityInsightSettingsInfo(this.qualityInsightInfo),
        [strategyMap.TRUE_FALSE]: () =>
          this.updateQualityInsightSettingsInfo(createQualityInsightInfo('')),
        [strategyMap.TRUE_TRUE]: () =>
          this.updateQualityInsightSettingsInfo(this.qualityInsightInfo)
      }
    }
  },

  computed: {
    statusString() {
      return `${(!!this.initialQualityInsightInfo[
        fieldMap.status
      ]).toString()}-${(!!this.qualityInsightInfo[fieldMap.status]).toString()}`
    }
  },

  watch: {
    statusString: {
      handler: function(newValue) {
        this.changeIsSaveBtnDisabled(
          !!updateSaveBtnStatusStrategies?.[newValue](
            this.initialQualityInsightInfo,
            this.qualityInsightInfo
          )
        )
      }
    },

    qualityInsightInfo: {
      handler: function(info) {
        if (this.statusString === strategyMap.FALSE_FLASE) {
          this.changeIsSaveBtnDisabled(true)
        } else {
          this.changeIsSaveBtnDisabled(
            isChangeObjorArr(info, this.initialQualityInsightInfo)
          )
        }
      },
      deep: true
    }
  },
  methods: {
    show() {
      this.changeVisible(true)
      this.isUserFirstValidate = true
      this.getQualityInsightSettingsInfo()
    },

    doClose() {
      this.changeVisible(false)
      this.changeIsSaveBtnDisabled(true)
      this.isUserFirstValidate = false
      this.resetUserListParams()
    },

    onSave() {
      if (
        this.statusString === strategyMap.FALSE_FLASE ||
        this.statusString === strategyMap.TRUE_FALSE
      ) {
        this.onSaveStrategies[this.statusString]()
      } else {
        this.$refs.qualityInsightFormRef.$children[0].validate(valid => {
          if (valid) {
            this.onSaveStrategies[this.statusString]()
          }
        })
      }
    },

    resetUserListParams() {
      this.isUserListFirstLoaded = true
      this.userList = []
      this.fetchedUserCount = 0
      this.totalUserCount = 0
      this.isSearchMode = false
      this.searchUserList = []
    },

    changeVisible(isVisible) {
      this.visible = isVisible
    },

    changeIsSaveBtnDisabled(isSaveBtnDisabled) {
      this.isSaveBtnDisabled = isSaveBtnDisabled
    },

    changeIsSaveBtnLoading(isSaveBtnLoading) {
      this.isSaveBtnLoading = isSaveBtnLoading
    },

    changeIsTestConnectionBtnLoading(isTestConnectionBtnLoading) {
      this.isTestConnectionBtnLoading = isTestConnectionBtnLoading
    },

    changeUserSelectLoading(isUserSelectLoading) {
      this.isUserSelectLoading = isUserSelectLoading
    },

    changeIsDataRequestFinished(isDataRequestFinished) {
      this.isDataRequestFinished = isDataRequestFinished
    },

    onTestConnection() {
      this.$refs.qualityInsightFormRef.$children[0].validateField(
        fieldMap.searchServerUrl,
        errorMsg => {
          if (!errorMsg) {
            const data = {
              [fieldMap.searchServerUrl]: this.qualityInsightInfo[
                fieldMap.searchServerUrl
              ]
            }

            this.changeIsTestConnectionBtnLoading(true)
            testQISearchServerConnection(data)
              .then(res =>
                this.$message.success(
                  this.$t('tools.qualityInsight.testConnectionSucceed')
                )
              )
              .catch(console.log)
              .finally(() => this.changeIsTestConnectionBtnLoading(false))
          }
        }
      )
    },

    getQualityInsightSettingsInfo() {
      this.changeIsDataRequestFinished(false)
      getQualityInsightSettings()
        .then(res => {
          this.initialQualityInsightInfo = res[dataWrapperMap.qualityInsight]

          if (!this.initialQualityInsightInfo[fieldMap.status]) {
            this.qualityInsightInfo = createQualityInsightInfo(undefined)
          } else {
            if (
              this.initialQualityInsightInfo[fieldMap.searchServerUrl] === '' &&
              this.initialQualityInsightInfo[fieldMap.searchServerUser] === ''
            ) {
              this.initialQualityInsightInfo = createQualityInsightInfo('')
              this.qualityInsightInfo = createQualityInsightInfo(undefined)
            } else {
              if (
                typeof this.initialQualityInsightInfo[
                  fieldMap.searchServerUrl
                ] !== 'string'
              ) {
                this.initialQualityInsightInfo[
                  fieldMap.searchServerUrl
                ] = String(
                  this.initialQualityInsightInfo[fieldMap.searchServerUrl]
                )
              }
              this.qualityInsightInfo = { ...this.initialQualityInsightInfo }
            }
          }

          this.commitIsSiteQualityInsightEnabled(this.initialQualityInsightInfo)
        })
        .finally(() => this.changeIsDataRequestFinished(true))
    },

    updateQualityInsightSettingsInfo(qualityInsightInfo) {
      this.changeIsSaveBtnLoading(true)
      updateQualityInsightSettings(qualityInsightInfo)
        .then(res => {
          this.$message.success(this.$t('tools.qualityInsight.saveSucceed'))
          this.commitIsSiteQualityInsightEnabled(
            res[dataWrapperMap.qualityInsight]
          )
        })
        .catch(console.log)
        .finally(() => {
          this.changeIsSaveBtnLoading(false)
          this.doClose()
        })
    },

    getUserList(startIndex) {
      if (this.isUserSelectLoading === true) return
      if (this.isSearchMode) return
      this.fetchUsers({ startIndex, fetchCount: this.fetchCount }, res => {
        const users = res?.[dataWrapperMap.users]?.[dataWrapperMap.user]
        let userList = users ? (Array.isArray(users) ? users : [users]) : []

        this.fetchedUserCount += userList.length
        // filter active user
        userList = userList.filter(user => user && user[userFieldMap.isActive])

        this.userList = this.userList.concat(userList)
        this.totalUserCount =
          res?.[dataWrapperMap.users]?.[dataWrapperMap.totalUserCount] ||
          this.totalUserCount
      })
    },

    onDropdownVisibleChange(open) {
      if (open && this.isUserListFirstLoaded) {
        this.getUserList(this.fetchedUserCount + 1, this.fetchCount)
        this.isUserListFirstLoaded = false
      }
    },

    validateUser() {
      return (rule, value, callback) => {
        if (this.isUserFirstValidate && value === undefined) {
          this.isUserFirstValidate = false
        } else if (!this.isUserFirstValidate) {
          if (!value) {
            callback(
              new Error(this.$t('tools.qualityInsight.userNameValidate'))
            )
          }
        }
        callback()
      }
    },

    onSelectScroll(event) {
      useSelectScroll(event, this.onSelectScrollCallback)
    },

    onSelectScrollCallback() {
      if (this.fetchedUserCount > this.totalUserCount) return
      this.getUserList(this.fetchedUserCount + 1)
    },

    onSwitchClick(checked) {
      if (!checked) {
        this.$refs.qualityInsightFormRef.$children[0].clearValidate()
      }
    },

    onSelectSearch: throttle(function(value) {
      if (value === '') {
        this.isSearchMode = false
        this.searchUserList = []
      } else {
        this.fetchUsers(
          {
            startIndex: 1,
            fetchCount: 'max',
            param: this.getFetchParam(value)
          },
          res => {
            const users = res?.[dataWrapperMap.users]?.[dataWrapperMap.user]
            let userList = users ? (Array.isArray(users) ? users : [users]) : []
            userList = userList.filter(
              user => user && user[userFieldMap.isActive]
            )

            this.searchUserList = userList
            this.isSearchMode = true
          }
        )
      }
    }, ScrollingLoadSettings.SEARCH_INTERVAL),

    fetchUsers(fetchParams, onFulfill) {
      if (typeof fetchParams !== 'object') {
        throw new Error('invalid fetch params')
      }

      const { startIndex, fetchCount, param } = fetchParams
      const defaultFetchSort = 'ASC'

      this.changeUserSelectLoading(true)
      fetchUsersList(startIndex, fetchCount, param, false, defaultFetchSort)
        .then(onFulfill)
        .finally(() => this.changeUserSelectLoading(false))
    },

    getFetchParam(value) {
      return `{*[*${value.trim()}*]}`
    },

    commitIsSiteQualityInsightEnabled(initialInfo) {
      this.$store.commit(
        'qualityInsight/SET_IS_SITE_QUALITY_INSIGHT_ENABLED',
        !!initialInfo?.[fieldMap.status]
      )
    }
  }
}
</script>

<style scoped lang="less">
/deep/ .ant-modal-title span {
  color: #323435;
}

.qis-form {
  padding-top: 32px;
}

.qis-row {
  /deep/ .ant-row.ant-form-item {
    height: 32px;
    line-height: 32px;

    .ant-form-item-label {
      width: 195px;
      height: 32px;
      line-height: 32px;
      padding-left: 16px;
    }

    .ant-form-item-control-wrapper {
      height: 32px;
      line-height: 32px;
      flex: 1;

      .ant-form-item-control {
        height: 32px;
        line-height: 32px;
      }

      .qis-user-select {
        width: 230px;
      }
    }
  }
}

.qis-row {
  height: 56px;
}

.qis-server-row {
  display: flex;

  .qis-server-url-formitem {
    display: flex;
    flex: 1;
  }
}

/deep/ .ant-select-selection__placeholder {
  color: rgba(0, 0, 0, 0.2);
}

// /deep/ .ant-select-dropdown {
//   left: 233px !important;
// }

// @media screen and (max-width: 700px) {
//   /deep/ .ant-select-dropdown {
//     left: 0 !important;
//   }
// }
</style>
