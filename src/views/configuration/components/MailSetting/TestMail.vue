<template>
  <mf-modal
    :class="'test-mail'"
    :visible="testMailVisible"
    :confirm-loading="loading"
    :ok-text="$t('configuration.Send')"
    :next-disabled="!Boolean(mailForm.address)"
    @cancel="show"
    @ok="onSubmit"
  >
    <span slot="title">
      {{ $t('configuration.TestMail') }}
    </span>
    <mf-form
      ref="mailRef"
      :model="mailForm"
      :label-col="{ span: 11 }"
      :wrapper-col="{ span: 12 }"
      :rules="rules"
    >
      <a-form-model-item v-if="Boolean(mailForm.SMTP)" id="test_mail_server_name" prop="SMTP" :label="$t('configuration.ServerName')">
        {{ mailForm.SMTP }}
      </a-form-model-item>
      <a-form-model-item :label="$t('configuration.MailTo')" prop="address">
        <a-input id="test_mail_to" v-model="mailForm.address" type="text" />
      </a-form-model-item>
    </mf-form>
  </mf-modal>

</template>

<script>

import { sendTestEmails } from '@/api/email'

export default {
  name: 'TestMail',
  props: {
    testMailForm: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      testMailVisible: false,
      loading: false,
      rules: {
        address: [
          { required: true, message: this.$t('userManagement.emailRequired'), trigger: 'blur' },
          { type: 'email', message: this.$t('valid.email') },
          { message: this.$t('the_length', { num: 30 }), trigger: 'blur', max: 30 }
        ]
      },
      mailForm: {
        SMTP: this.testMailForm['mail-server-addr'],
        address: this.testMailForm['smtp-admin-mail']
      }
    }
  },
  methods: {
    show() {
      this.testMailVisible = !this.testMailVisible
      // Data replication
      if (this.testMailVisible) {
        this.mailForm = {
          SMTP: this.testMailForm['mail-server-addr'],
          address: this.testMailForm['smtp-admin-mail']
        }
      } else {
        this.$nextTick(() => {
          this.$refs.mailRef.$children[0].resetFields()
        })
      }
    },
    onSubmit() {
      this.loading = true
      const mailSetting = JSON.parse(JSON.stringify(this.testMailForm))
      mailSetting['smtp-password'] = undefined

      sendTestEmails({
        mail: {
          'mail-setting': mailSetting,
          'to-recipients': [this.mailForm.address.toString()]
        }
      }).then(response => {
        this.loading = false
        this.$emit('testMailSubmit', false)
        this.$message.success(this.$t('configuration.MailSentSuccessfully'))
      }).catch(e => {
        this.loading = false
        this.$emit('testMailSubmit', true)
      })
    }

  }
}
</script>

<style scoped lang="less">
.test-mail /deep/ .ant-modal-content{
  width: 434px !important;

}
.test-mail /deep/ .ant-modal-body{
  padding-bottom: 0;
}
</style>
