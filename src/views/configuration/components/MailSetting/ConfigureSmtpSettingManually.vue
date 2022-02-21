<template>
  <mf-modal
    class="smtp-setting"
    :visible="visible"
    :confirm-loading="confirmLoading"
    @cancel="onPrevious"
    @ok="smtpSubmit"
  >
    <span id="mail_setting_title" slot="title">
      {{ $t('configuration.MailSettings') }}
      <mf-help-btn :help="MAIL_SETTINGS" />
    </span>

    <div class="smtp-account-style ">
      {{ $t('configuration.SmtpAccountSetting') }}
    </div>
    <div class="form-title mf-h5 csv-h5">
      {{ $t('configuration.ServerInformation') }}
    </div>

    <mf-form
      ref="mailSettingRef"
      v-model="mailSettingForm"
      class="mail-setting-form"
      :label-col="{ span: 11 }"
      :wrapper-col="{ span: 12 }"
    >
      <a-form-model-item :label="$t('configuration.AccountType')">
        <!--    mf-select    -->
        <mf-select id="mail_setting_account_type" v-model="mailSettingForm['mail-method']" default-value="smtp">
          <a-select-option value="smtp">
            {{ $t('configuration.SMTP') }}
          </a-select-option>
        </mf-select>
      </a-form-model-item>

      <a-form-model-item :label="$t('configuration.Address')" prop="smtp-admin-mail">
        <a-input id="mail_setting_address" v-model="mailSettingForm['smtp-admin-mail']" type="text" />
      </a-form-model-item>
      <a-form-model-item label=" ">
        <!--   TestEmailSetting     -->
        <a-button id="mail_setting_test" class="test-email-setting" @click="onTestMail">
          {{ $t('configuration.TestEmailSetting') }}
        </a-button>
        <a-tooltip
          :title="$t('configuration.TestEmailSettingTooltip')"
          placement="right"
        >
          <a-icon class="question-icon" type="question-circle" />
        </a-tooltip>
        <div v-if="warningFillShow" id="mail_setting_test_warning" style="line-height: 19px">
          <a-icon type="warning" theme="filled" style="color: #FFB000" />
          {{ $t('configuration.TestEmailSettingWarning') }}
        </div>
      </a-form-model-item>

      <a-form-model-item :label="$t('configuration.OutgoingMailSmtp')">
        <a-input id="mail_setting_SMTP" v-model="mailSettingForm['mail-server-addr']" type="text" />
      </a-form-model-item>

      <a-form-model-item :label="$t('configuration.OutgoingMailPot')">
        <a-input-number id="mail_setting_port" v-model="mailSettingForm['mail-server-port']" />
      </a-form-model-item>

      <!--   Use the following type of encrypted connection   -->
      <a-form-model-item :label="$t('configuration.FollowingType')">
        <mf-select id="mail_setting_following_type" v-model="mailSettingForm['secure-type']" :allow-clear="false" @change="followingTypeChange">
          <a-select-option v-if="!isSaas" id="None" value="none">
            {{ $t('configuration.none') }}
          </a-select-option>

          <a-select-option id="SSL" value="SSL">
            {{ $t('configuration.SSL') }}
          </a-select-option>
          <a-select-option id="TLS" value="STARTTLS">
            {{ $t('configuration.StartTLS') }}
          </a-select-option>
        </mf-select>
      </a-form-model-item>

      <a-form-model-item class="model-item-checkbox">
        <a-checkbox id="mail-setting_req_auth" :checked="mailSettingForm['smtp-auth-attr']" @change="authenticationChange">
          {{ $t('configuration.RequiresAuthentication') }}
        </a-checkbox>
      </a-form-model-item>
      <div :class="['form-title', 'mf-h5', 'csv-h5',mailSettingForm['smtp-auth-attr']?'':'title-disabled']">
        {{ $t('configuration.LogonInformation') }}
      </div>
      <!--   Authentication is true  -->
      <a-form-model-item :label="$t('configuration.UserName')">
        <a-input
          id="mail_setting_username"
          v-model="mailSettingForm['smtp-username']"
          type="text"
          :disabled="!mailSettingForm['smtp-auth-attr']"
        />
      </a-form-model-item>
      <a-form-model-item :label="$t('configuration.Password')">
        <a-input-password
          id="mail_setting_password"
          v-model.trim="mailSettingForm['smtp-password']"
          :disabled="!mailSettingForm['smtp-auth-attr']"
          @input="changePassword"
        />
      </a-form-model-item>

    </mf-form>
    <a-button
      id="icon-modal-cancel"
      slot="footer"
      key="previous"
      type="button"
      class="mf-btn-dashed"
      :disabled="confirmLoading"
      @click="smtpBack"
    >
      {{ $t('configuration.Previous') }}
    </a-button>

    <test-mail
      ref="testMailRef"
      :test-mail-form="mailSettingForm"
      @testMailSubmit="testMailSubmit"
    />

  </mf-modal>

</template>

<script>

import TestMail from '@/views/configuration/components/MailSetting/TestMail'
import { MAIL_SETTINGS } from 'config/help'
import { editMailSetting, getMailSetting } from '@/api/configuration'
import { DEFAULT_PASSWORD, SERVER_TYPE } from '@/store/const'
import { Encrypt } from '@/utils/forge'
import { isChangeObjorArr } from '@/utils'
import { mapGetters } from 'vuex'

export default {
  name: 'ConfigureSmtpSettingManually',
  components: { TestMail },
  data() {
    return {
      MAIL_SETTINGS,
      visible: false,
      confirmLoading: false,
      mailSettingForm: {
        'mail-method': 'SMTP',
        'smtp-admin-mail': '',
        'mail-server-addr': '',
        'mail-server-port': 25,
        'smtp-username': '',
        'smtp-password': '',
        'secure-type': 'none',
        'smtp-auth-attr': false
      },
      oldMailSettingForm: {},
      testMailVisible: false,
      warningFillShow: false,
      settingType: undefined,
      isChangedPassword: false
    }
  },
  computed: {
    ...mapGetters(['serverType']),
    isSaas() {
      return this.serverType === SERVER_TYPE.Saas
    }
  },
  watch: {
    mailSettingForm: {
      handler: function(val) {
        this.warningFillShow = !isChangeObjorArr(val, this.oldMailSettingForm)
      },
      deep: true
    }
  },
  created() {
    this.mailSettingForm['secure-type'] = this.isSaas ? 'SSL' : 'none'
  },

  methods: {
    show(mailSettingItem, settingType) {
      this.settingType = settingType
      this.visible = true
      this.warningFillShow = false
      this.isChangedPassword = false
      if (mailSettingItem) {
        this.mailSettingForm = mailSettingItem
      } else {
        this.getMailSettings()
      }
    },
    changePassword() {
      this.isChangedPassword = true
    },
    getMailSettings() {
      getMailSetting().then(response => {
        const mailSetting = response['mail-setting']
        this.mailSettingForm = {
          'mail-method': 'SMTP',
          'smtp-admin-mail': mailSetting['smtp-admin-mail'],
          'mail-server-addr': mailSetting['mail-server-addr'],
          'mail-server-port': mailSetting['mail-server-port'],
          'smtp-username': mailSetting['smtp-username'] ? mailSetting['smtp-username'] : '',
          'smtp-password': DEFAULT_PASSWORD,
          'secure-type': mailSetting['secure-type'],
          'smtp-auth-attr': mailSetting['smtp-auth-attr']
        }
        this.mailSettingForm['smtp-password'] = this.mailSettingForm['smtp-username'] ? this.mailSettingForm['smtp-password'] : ''
        this.oldMailSettingForm = JSON.parse(JSON.stringify(this.mailSettingForm))
      }).catch(e => {
        // console.log(error)
      })
    },
    smtpSubmit() {
      this.confirmLoading = true
      let password = ''
      if (!this.mailSettingForm['smtp-auth-attr']) {
        //  Authentication is true
        this.mailSettingForm['smtp-username'] = undefined
        this.mailSettingForm['smtp-password'] = undefined
      } else {
        password = this.mailSettingForm['smtp-password']
      }

      editMailSetting({
        'mail-setting': { ...this.mailSettingForm, 'smtp-password': this.isChangedPassword ? Encrypt(password) : undefined }
      }).then(response => {
        this.confirmLoading = false
        this.visible = false
        this.$message.success(this.$t('configuration.EditSuccess'))
        this.$emit('refresh')
      }).catch(e => {
        this.confirmLoading = false
      })
    },
    smtpBack() {
      // back
      this.visible = false
      this.$emit('MailSetting', { type: this.settingType, form: this.mailSettingForm })
    },
    authenticationChange() {
      this.mailSettingForm['smtp-auth-attr'] = !this.mailSettingForm['smtp-auth-attr']
    },
    followingTypeChange(value) {
      this.mailSettingForm['secure-type'] = value
    },
    onPrevious() {
      this.visible = false
    },
    testMailSubmit(testBool) {
      this.$refs.testMailRef.show()
      // this.warningFillShow = testBool
    },
    onTestMail() {
      this.$refs.testMailRef.show()
    }
  }
}
</script>

<style scoped lang="less">
.smtp-setting /deep/ .ant-modal-content{
  width: 802px !important;
  left: -140px;
}
.smtp-setting /deep/ .ant-modal-body{
  margin-right: 7px;
  height: auto !important;
}
.smtp-account-style{
  color: #000000;
  margin-bottom: 24px;
}

.form-title{
  margin-bottom: 16px;
  font-size: 14px !important;
}
.mail-setting-form /deep/ .ant-form-item{
  margin-left: 16px;
}
.mail-setting-form /deep/ .ant-form-item-control{
  //width: 277px;
  //margin-left: 16px;
}
.mail-setting-form /deep/ .ant-input-number{
  width: 277px;
}
.test-email-setting{
  margin-top: 12px;
  border:2px solid #000000;
}
.test-email-setting:focus{
  color: #000000;
}
.title-disabled{
  color: fade(#000000,20%);
}

.title-disabled::before{
  background: #CCCCCC;
}

.item-disabled{
  color: fade(#000000,45%);
}

.question-icon{
  margin-left: 10px;
  margin-top: 10px;
}
.model-item-checkbox{
  margin-left: 0;
  /deep/ .ant-form-item-control{
    min-width:  400px;
  }
  /deep/ .ant-form-item-control-wrapper{
    width: 100%;
  }
}
.model-item-checkbox
.test-modal /dee/ .ant-modal-content{
  width: 434px !important;
}
</style>
