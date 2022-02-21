<template>
  <div id="drawer_right">
    <div class="content">
      <!--  general setting  -->
      <div id="general_setting" class="general-setting">
        <div class="title mf-h5">
          {{ $t('userManagement.GeneralSetting') }}
        </div>
        <mf-form
          id="general_setting_form"
          ref="generalForm"
          label-align="right"
          :model="ruleForm"
          class="general-setting-form"
          v-bind="formItemLayout"
          :rules="generalRules"
        >
          <a-form-model-item :label="$t('userManagement.serverName')" prop="label">
            <a-input id="server_name" v-model="ruleForm.label" :disabled="disabled" />
          </a-form-model-item>
          <a-form-model-item prop="server" class="has-help-span">
            <span slot="label" :title="$t('userManagement.directoryProviderUrl')" class="with-icon">
              <span class="only-text">
                {{ $t('userManagement.directoryProviderUrl') }}
              </span>
              <a-tooltip :title="$t('userManagement.DirectoryProviderURLTooltip')" placement="bottom">
                <a-icon type="question-circle" />
              </a-tooltip>
            </span>
            <a-input id="directory_provider_url" v-model="ruleForm.server" :disabled="disabled" @blur="urlNotSpace" />
          </a-form-model-item>

          <a-form-model-item prop="LDAPValue" class="has-help-span">
            <span slot="label" :title="$t('userManagement.LDAP')" class="with-icon">
              <span class="only-text">
                {{ $t('userManagement.LDAP') }}
              </span>
              <a-tooltip
                :title="$t('userManagement.AuthenticationTooltip')"
                :overlay-style="{'white-space': 'pre-line'}"
                placement="bottom"
              >
                <a-icon type="question-circle" />
              </a-tooltip>
            </span>
            <a-radio-group id="LDAP_radio" v-model="ruleForm['auth-type']" :disabled="disabled" default-value="NONE" name="radioGroup" @change="LDAPChange">
              <a-radio id="radio_anonymous" class="margin-l-0" :value="'NONE'">
                {{ $t('userManagement.anonymous') }}
              </a-radio>
              <a-radio id="radio_smiple" :value="'SIMPLE'" style="margin-left: 0 !important;">
                {{ $t('userManagement.Simple') }}
              </a-radio>
            </a-radio-group>
          </a-form-model-item>

          <a-form-model-item prop="principal" :label="$t('userManagement.AuthenticationPrincipal')">
            <a-input
              id="authentication_pricipal"
              v-model="ruleForm.principal"
              :disabled="disabled || ruleForm['auth-type']===undefined || ruleForm['auth-type'] === 'NONE'"
            />
          </a-form-model-item>

          <a-form-model-item
            :label="$t('userManagement.authenticationCredentials')"
            prop="credentials"
          >
            <a-input-password
              id="authentication_credentials"
              v-model="ruleForm.credentials"
              :disabled="disabled || ruleForm['auth-type']===undefined || ruleForm['auth-type'] === 'NONE'"
              :max-length="84"
            />
          </a-form-model-item>

          <a-form-model-item prop="lwsso">
            <span slot="label" :title="$t('userManagement.Use_LWSSO')">
              <a-checkbox id="user_ldap_lwsso" :disabled="disabled" :checked="isShowSSO" class="margin-l-0" @change="onChange">
                {{ $t('userManagement.Use_LWSSO') }}
              </a-checkbox>
            </span>
            <a-textarea
              v-show="isShowSSO"
              id="use_lwsso"
              v-model="ruleForm['sso-name']"
              class="textareaStyle"
              :rows="3"
            />
          </a-form-model-item>

        </mf-form>
      </div>

      <!--  DATA RETRIEVING SETTING  -->
      <div id="data_retrieving_setting" class="general-setting">
        <div class="title mf-h5">
          {{ $t('userManagement.DataRetrievingSetting') }}
        </div>
        <mf-form
          id="data_retrieving_setting_form"
          ref="DataForm"
          label-align="right"
          :model="ruleForm"
          class="general-setting-form"
          :rules="dataRules"
          v-bind="formItemLayout"
        >

          <a-form-model-item prop="base" class="has-help-span">
            <span slot="label" :title="$t('userManagement.DirectoryBase')" class="with-icon">
              <span class="only-text">
                {{ $t('userManagement.DirectoryBase') }}
              </span>
              <a-tooltip :title="$t('userManagement.DirectoryBaseTooltip')" placement="bottom">
                <a-icon type="question-circle" />
              </a-tooltip>
            </span>
            <a-input id="directory_base" v-model="ruleForm.base" :disabled="disabled" />
          </a-form-model-item>

          <a-form-model-item prop="filter" class="has-help-span">
            <span slot="label" :title="$t('userManagement.baseFilter')" class="with-icon">
              <span class="only-text">
                {{ $t('userManagement.baseFilter') }}
              </span>
              <a-tooltip :title="$t('userManagement.BaseFilterTooltip')" placement="bottom">
                <a-icon type="question-circle" />
              </a-tooltip>
            </span>
            <a-input id="base_filter" v-model="ruleForm.filter" :disabled="disabled" :max-length="255" />
          </a-form-model-item>

          <a-form-model-item prop="search-limit" class="has-help-span">
            <span slot="label" :title="$t('userManagement.resultRecordLimit')" class="with-icon">
              <span class="only-text">
                {{ $t('userManagement.resultRecordLimit') }}
              </span>
              <a-tooltip :title="$t('userManagement.ResultRecordLimitTooltip')" placement="bottom">
                <a-icon type="question-circle" />
              </a-tooltip>
            </span>
            <!--            <a-input id="result_record_limit" v-model="ruleForm['search-limit']"  />-->
            <a-input-number
              id="limit-number-input"
              v-model="ruleForm['search-limit']"
              :disabled="disabled"
              :min="100"
              :max="10000"
              :formatter="limitNumber"
              :parser="limitNumber"
              style="width: 279px;"
            />
          </a-form-model-item>
          <a-form-model-item prop="timeout">
            <span slot="label" :title="$t('userManagement.timeout')">
              {{ $t('userManagement.timeout') }}
              <a-tooltip :title="$t('userManagement.TimeoutTooltip')" placement="bottom">
                <a-icon type="question-circle" />
              </a-tooltip>
            </span>
            <!--            <a-input id="timeout" v-model="ruleForm.timeout"  />-->
            <a-input-number
              id="timeout-number-input"
              v-model="ruleForm.timeout"
              :disabled="disabled"
              :min="0"
              :max="1000000000"
              :formatter="limitNumber"
              :parser="limitNumber"
              style="width: 279px;"
            />
          </a-form-model-item>
        </mf-form>
      </div>

      <!--  FIELD MAPPING SETTING  -->
      <div id="field_mapping_setting" class="general-setting">
        <div class="title mf-h5">
          {{ $t('userManagement.FieldMappingSetting') }}
          <a-tooltip :title="$t('userManagement.FieldMappingSettingTooltip',{'default':radioValue===1?$t('userManagement.forActiveDirectory'):$t('userManagement.userToolBar.LDAP')})" placement="right">
            <a-icon type="question-circle" />
          </a-tooltip>
        </div>
        <mf-form
          id="field_mapping_setting_form"
          ref="searchForm"
          label-align="right"
          :model="searchCriteria"
          class="general-setting-form"
          v-bind="formItemLayout"
          :rules="addRules"
        >
          <a-form-model-item prop="user-name" :label="$t('userManagement.UserName')">
            <a-input id="user_name" v-model="searchCriteria['user-name']" :disabled="disabled" />
          </a-form-model-item>

          <a-form-model-item prop="full-name" :label="$t('userManagement.FullName')">
            <a-input id="full_name" v-model="searchCriteria['full-name']" :disabled="disabled" />
          </a-form-model-item>

          <a-form-model-item prop="description" :label="$t('userManagement.Description')">
            <a-input id="description" v-model="searchCriteria.description" :disabled="disabled" />
          </a-form-model-item>

          <a-form-model-item prop="email" :label="$t('userManagement.Email')">
            <a-input id="email" v-model="searchCriteria.email" :disabled="disabled" />
          </a-form-model-item>

          <a-form-model-item :label="$t('userManagement.PhoneLabel')" prop="phone">
            <a-input id="phone" v-model="searchCriteria.phone" :disabled="disabled" />
          </a-form-model-item>

          <a-form-model-item prop="useDefaultValues" :label-col="{ span: 23 }" class="has-help-span">
            <span slot="label" :title="$t('userManagement.useDefaultValues')" class="with-icon">
              <a-checkbox id="user_ldap_defaultvalue" v-model="useDefaultValues" :disabled="disabled" class="margin-l-0 only-text">
                {{ $t('userManagement.useDefaultValues') }}
              </a-checkbox>
              <a-tooltip :title="$t('userManagement.UseDefaultValuesTooltip')" placement="right">
                <a-icon type="question-circle" />
              </a-tooltip>
            </span>
          </a-form-model-item>

          <a-form-model-item prop="radioGroup" :wrapper-col="{ span: 23 }">
            <a-radio-group id="radioGroup" v-model="radioValue" name="radioGroup" :disabled="!useDefaultValues" @change="changeRadioValue">
              <a-radio id="user_win_ad" :value="1">
                {{ $t('userManagement.forActiveDirectory') }}
              </a-radio>
              <a-radio id="user_ldap" :value="2">
                {{ $t('userManagement.userToolBar.LDAP') }}
              </a-radio>
            </a-radio-group>
          </a-form-model-item>
        </mf-form>
      </div>
    </div>

    <div class="foot-btn">
      <a-button id="ldap_edit_cancel" class="mf-btn-dashed" @click="onClosed">{{ $t("Cancel") }}</a-button>
      <a-button id="ldap_edit_test" :disabled="disabled" :loading="testConnectionLoading" class="mf-btn-dashed" style="margin-left: 8px" @click="onTestLdao">{{ $t("testConnection") }}</a-button>
      <a-button
        id="user_edit_save"
        type="primary"
        style="margin-left: 8px"
        :disabled="isChange"
        @click="onSave"
      >
        {{ $t("Save") }}
      </a-button>
    </div>

  </div>
</template>

<script>

// import { validSpecialCharact } from '@/utils/validate'

import { putLDAPById, testLdap } from '@/api/user'
import { limitNumber } from '@/utils/validate'
import {
  LDAP_DEFAULT_VALUES,
  LDAP_DEFAULT_VALUES_ACTIVE_DIRECTORY,
  LDAP_DEFAULT_VALUES_LDAP,
  LDAP_DEFAULT_VALUES_SEARCH_CRITERIA
} from '@/store/const'
import { Encrypt } from '@/utils/forge'
import { isChangeObjorArr } from '@/utils'

export default {
  name: 'DrawerRight',
  props: {
    ruleForm: {
      type: Object,
      default: function() {
        return {}
      }
    },
    oldRuleForm: {
      type: Object,
      default: function() {
        return {}
      }
    },
    searchCriteria: {
      type: Object,
      default: function() {
        return {}
      }
    },
    disabled: {
      type: Boolean,
      default: true
    },
    isChange: {
      type: Boolean,
      default: false
    },
    ruleRadioValue: {
      type: [Number, Object],
      default: undefined
    }
  },
  data() {
    return {
      formItemLayout: {
        labelCol: { span: 11 },
        wrapperCol: { span: 13 }
      },
      testConnectionLoading: false,
      useDefaultValues: false,
      radioValue: null,
      limitNumber,
      // LDAPValue: 1,
      isShowSSO: false,
      // ruleForm: {
      //   'ldap-id': 0,
      //   label: 'string',
      //   server: 'string',
      //   timeout: 0,
      //   'auth-type': 'NONE',
      //   principal: 'string',
      //   credentials: 'string',
      //   base: 'string',
      //   filter: 'string',
      //   'search-limit': 0,
      //   'sso-name': 'string',
      //   'search-criteria': {
      //     'user-name': 'string',
      //     email: 'string',
      //     'full-name': 'string',
      //     phone: 'string',
      //     description: 'string'
      //   }
      // },
      authenticationDisabled: true,
      addRules: {
        'user-name': [{ required: true, message: this.$t('LabelName_is_required', { labelName: this.$t('userManagement.UserName') }), trigger: 'blur' }]
      },
      dataRules: {
        'search-limit': [{ required: true, message: this.$t('LabelName_is_required', { labelName: this.$t('userManagement.resultRecordLimit') }), trigger: 'blur' }],
        timeout: [{ required: true, message: this.$t('LabelName_is_required', { labelName: this.$t('userManagement.timeout') }), trigger: 'blur' }]
      },
      generalRules: {
        label: [{ required: true, message: this.$t('LabelName_is_required', { labelName: this.$t('userManagement.serverName') }), trigger: 'blur' }],
        server: [{ required: true, message: this.$t('LabelName_is_required', { labelName: this.$t('userManagement.directoryProviderUrl') }), trigger: 'blur' }]
      }
    }
  },
  watch: {
    ruleRadioValue: function(val) {
      this.radioValue = val
      this.useDefaultValues = Boolean(val)
    },
    searchCriteria: {
      handler(val) {
        if (isChangeObjorArr(val, {
          ...LDAP_DEFAULT_VALUES_SEARCH_CRITERIA,
          'user-name': LDAP_DEFAULT_VALUES_ACTIVE_DIRECTORY
        })) {
          this.radioValue = 1
          this.useDefaultValues = true
        } else if (isChangeObjorArr(val, {
          ...LDAP_DEFAULT_VALUES_SEARCH_CRITERIA,
          'user-name': LDAP_DEFAULT_VALUES_LDAP
        })) {
          this.radioValue = 2
          this.useDefaultValues = true
        } else {
          this.radioValue = 0
          this.useDefaultValues = false
        }
      },
      deep: true
    }
  },
  methods: {
    // deactivated() {
    //   if (!this.isSave) {
    //     this.$message.warning(this.$t('warningNoSave'))
    //   }
    // },
    onTestLdao() {
      this.testConnectionLoading = true
      const ruleFormData = this.ruleForm['auth-type'] === 'NONE' ? { ...this.ruleForm, credentials: '', principal: '' } : { ...this.ruleForm, credentials: Encrypt(this.ruleForm.credentials) }
      if (!this.ruleForm.credentials && this.ruleForm.principal === this.oldRuleForm.principal) {
        delete ruleFormData.credentials
        delete ruleFormData.principal
      }

      testLdap(this.ruleForm['ldap-id'], { 'ldap-server': ruleFormData }).then(res => {
        this.$message.success(this.$t('testConnectionSuccess'))
      }).finally(() => {
        this.testConnectionLoading = false
      })
    },
    onChange(e) {
      this.isShowSSO = !this.isShowSSO
      if (!this.isShowSSO) this.ruleForm['sso-name'] = ''
      // console.log(e)
    },
    urlNotSpace() {
      this.ruleForm.server = this.ruleForm.server.replace(/\s*/g, '')
    },
    changeRadioValue(e) {
      const defaultRuleForm = {
        ...LDAP_DEFAULT_VALUES,
        'ldap-id': this.ruleForm['ldap-id'],
        label: this.ruleForm.label,
        server: this.ruleForm.server,
        'auth-type': this.ruleForm['auth-type'],
        'sso-name': this.ruleForm['sso-name'],
        principal: this.ruleForm.principal,
        credentials: this.ruleForm.credentials,
        'search-limit': this.ruleForm['search-limit'],
        timeout: this.ruleForm.timeout
      }
      defaultRuleForm['search-criteria'] = JSON.parse(JSON.stringify(LDAP_DEFAULT_VALUES_SEARCH_CRITERIA))
      defaultRuleForm['search-criteria']['user-name'] = e.target.value === 1 ? LDAP_DEFAULT_VALUES_ACTIVE_DIRECTORY : LDAP_DEFAULT_VALUES_LDAP
      this.$emit('restRuleForm', defaultRuleForm, false)
    },

    LDAPChange(e) {
      this.authenticationDisabled = this.ruleForm['auth-type'] === 'NONE'
    },
    onClosed() {
      this.$emit('onClosed')
    },
    onSave(changeFunc = null) {
      let isTrue = false
      this.$refs.searchForm.$children[0].validate(search => {
        this.$refs.generalForm.$children[0].validate(general => {
          this.$refs.DataForm.$children[0].validate(data => {
            isTrue = search && general && data
            if (search && general && data) {
              this.ruleForm['search-criteria'] = this.searchCriteria
              this.ruleForm['sso-name'] = this.isShowSSO ? this.ruleForm['sso-name'] : ''
              const ruleFormData = this.ruleForm['auth-type'] === 'NONE' ? { ...this.ruleForm } : { ...this.ruleForm, credentials: this.ruleForm.credentials ? Encrypt(this.ruleForm.credentials) : this.ruleForm.credentials }
              if (this.ruleForm['auth-type'] === 'NONE') {
                delete ruleFormData.credentials
                delete ruleFormData.principal
              } else {
                if (!this.ruleForm.credentials && this.ruleForm.principal === this.oldRuleForm.principal) {
                  delete ruleFormData.credentials
                  delete ruleFormData.principal
                }
              }

              putLDAPById({ 'ldap-server': ruleFormData }, this.ruleForm['ldap-id']).then(res => {
                this.$emit('restRuleForm', res['ldap-server'])
                this.radioValue = res['ldap-server']['search-criteria']['user-name'] === LDAP_DEFAULT_VALUES_LDAP ? 2 : res['ldap-server']['search-criteria']['user-name'] === LDAP_DEFAULT_VALUES_ACTIVE_DIRECTORY ? 1 : null
                this.useDefaultValues = Boolean(this.radioValue)
                this.$message.success(this.$t('userManagement.userToolBar.Save_successfully'))
                changeFunc && changeFunc()
              }).catch(e => {
                // this.$message.error(this.$t('userManagement.userToolBar.Save_successfully'))
              })
            }
          })
        })
      })
      return isTrue
    }
  }
}
</script>

<style scoped lang="less">
.content {
  height: calc(100vh - 183px);
  margin-left: 24px;
  padding-right: 35px;
  overflow: auto;
}
.general-setting{
  border: 1px #DCDEDF solid;
  margin-bottom: 24px;
}
.general-setting /deep/ .ant-input {
  border-bottom: 1px solid fade(#656668,60%);
}
.general-setting /deep/  .ant-input-disabled {
  border-bottom: 1px solid #dcdedf !important;
}
.title{
  padding: 16px 0 13px 24px;
  border-bottom: 1px #DCDEDF solid;
}
.general-setting-form{
  padding: 14px 24px 24px 14px;
}
.general-setting /deep/ .ant-form-item{
  margin-bottom: 10px;
}
.textareaStyle {
  margin-top: 10px;
}
.textareaStyle /deep/ .ant-input {
  border-bottom: 1px solid #dcdedf !important;
}
.margin-l-0 {
  margin-left: 0;
}
.foot-btn{
  width: 100%;
  position: absolute;
  bottom: 0;
  right: 0;
  //width: calc(100% - 285px);
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid rgba(101, 102, 104, 0.16);
  background-color: #fff;
  z-index: 99;
}
</style>
