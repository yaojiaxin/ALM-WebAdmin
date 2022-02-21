<template>
  <div>
    <mf-modal
      ref=""
      class="mail-setting-modal"
      :visible="visible"
      :ok-text="$t('Next')"
      :confirm-loading="false"
      @cancel="onSmtpSettingCancel"
      @ok="onSmtpSettingSubmit"
    >
      <span slot="title">
        {{ $t('configuration.MailSettings') }}
        <mf-help-btn :help="MAIL_SETTINGS" />
      </span>

      <a-radio-group v-model="value">
        <a-radio id="conf_smtp" class="a-radio" value="configureSmtp">
          {{ $t('configuration.ConfigureSmtp') }}
        </a-radio>
        <a-radio id="conf_autodiscovery" class="a-radio" value="autodiscovery" style="margin-top: 21px">
          {{ $t('configuration.CredentialsForAutodiscovery') }}
        </a-radio>
      </a-radio-group>

      <mf-form
        v-show="value==='autodiscovery'"
        ref="autodiscoverys"
        class="credentials-form"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 15 }"
        :model="autodiscoveryForm"
        :rules="rules"
      >
        <a-form-model-item :label="$t('configuration.EmailAddress')" prop="address">
          <a-input id="mail-setting-email-address" v-model="autodiscoveryForm.address" class="input-style" :placeholder="$t('configuration.EmailAddressInput')" />
        </a-form-model-item>
        <a-form-model-item :label="$t('configuration.Password')">
          <a-input-password id="mail-setting-email-password" v-model="autodiscoveryForm.password" class="input-style" :placeholder="$t('configuration.Mail_account_password')" />
        </a-form-model-item>
      </mf-form>

    </mf-modal>

    <configure-smtp-setting-manually
      ref="ConfigureSmtpSettingRef"
      @MailSetting="show"
      @refresh="$emit('refresh')"
    />
  </div>
</template>

<script>

import ConfigureSmtpSettingManually from './ConfigureSmtpSettingManually'
import { editMailSettingDiscover } from '@/api/configuration'
import { MAIL_SETTINGS } from 'config/help'

export default {
  name: 'MailSetting',
  components: { ConfigureSmtpSettingManually },
  data() {
    return {
      MAIL_SETTINGS,
      ConfirmVisible: false,
      visible: false,
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px'
      },
      rules: {
        address: [{ type: 'email', message: this.$t('valid.email') }]
      },
      // value configureSmtp:Configure SMTP settings manually,
      // value 2: Credentials for autodiscovery
      value: 'configureSmtp',
      autodiscoveryForm: {
        address: '',
        password: ''
      },
      cacheForm: {}
    }
  },
  methods: {
    show(value) {
      if (typeof (value) === 'object') {
        const { type, form } = value
        this.visible = !this.visible
        this.value = type || 'configureSmtp'
        this.cacheForm = form
      } else {
        this.visible = !this.visible
        this.value = value || 'configureSmtp'
        this.cacheForm = {}
      }
    },
    onSmtpSettingSubmit() {
      if (this.value === 'configureSmtp') {
        // Configure SMTP settings manually
        if (Object.keys(this.cacheForm).length === 0) {
          this.$refs.ConfigureSmtpSettingRef.show(null, this.value)
        } else {
          this.$refs.ConfigureSmtpSettingRef.show(this.cacheForm, this.value)
        }
        this.visible = false
      } else {
        this.$refs.autodiscoverys.$children[0].validate(async valid => {
          if (valid) {
            this.visible = false
            editMailSettingDiscover({
              'auto-discover': {
                address: this.autodiscoveryForm.address,
                password: this.autodiscoveryForm.password
              }
            }).then(response => {
              this.$refs.ConfigureSmtpSettingRef.show({
                'mail-method': response['mail-method'],
                'mail-server-addr': response['mail-server-addr'],
                'mail-server-port': response['mail-server-port'],
                'smtp-username': response['smtp-username'],
                'smtp-password': response['smtp-password'],
                'smtp-auth-attr': response['smtp-auth-attr'],
                'secure-type': response['secure-type'],
                'smtp-admin-mail': response['smtp-admin-mail']
              }, this.value)
            }).catch(e => {
              this.$mfConfirm({
                message: this.$t('configuration.CredentialsContent'),
                onConfirm: this.onConfirmSubmit,
                onCancelChange: () => {
                  this.ConfirmVisible = false
                  // this.$refs.autodiscoverys.$children[0].resetFields()
                  this.autodiscoveryForm = {
                    address: '',
                    password: ''
                  }
                }
              })
            })
          }
        })
      }
    },
    onSmtpSettingCancel() {
      this.visible = false
    },
    onConfirmSubmit() {
      this.ConfirmVisible = false
      this.$refs.ConfigureSmtpSettingRef.show(null, this.value)
    }
  }
}
</script>

<style scoped lang="less">
.mail-setting-modal /deep/ .ant-modal-content{
    width: 580px !important;
}

.credentials-form{
  width: 360px;
  margin: 24px 0 24px 16px;
}
.a-radio {
  display: block;
  height: 30px;
  line-height: 30px
}
.input-style{
  width: 360px;
}

</style>
