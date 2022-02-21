<template>
  <mf-modal
    class="setting-change-password"
    :visible="visible"
    :confirm-loading="loading"
    width="586px"
    :ok-text="$t('OK')"
    @cancel="onClose"
    @ok="onSubmit"
  >
    <span slot="title">
      {{ $t('change_password') }}
    </span>

    <mf-form
      ref="changePasswordForm"
      :model="form"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :hide-required-mark="true"
      layout="vertical"
    >
      <a-form-model-item prop="loginName">
        <flat-input
          id="login_login_name"
          v-model="form.loginName"
          :max-length="30"
        >
          {{ $t('login.login_name') }}
        </flat-input>
      </a-form-model-item>

      <a-form-model-item prop="currentPassword">
        <flat-input
          id="login_current_password"
          v-model="form.currentPassword"
          type="password"
        >
          {{ $t('currentPassword') }}
        </flat-input>
      </a-form-model-item>

      <a-form-model-item prop="newPassword">
        <flat-input
          id="login_new_password"
          v-model="form.newPassword"
          type="password"
        >
          {{ $t('newPassword') }}
        </flat-input>
      </a-form-model-item>

      <a-form-model-item prop="confirmNewPassword" class="confirmPassword">
        <flat-input
          id="login_confirm_new_password"
          v-model="form.confirmNewPassword"
          type="password"
          @change="hideError"
        >
          {{ $t('confirmPassword') }}
        </flat-input>
        <error-msg ref="errorMsg" :item-class="'confirmPassword'" />
      </a-form-model-item>
    </mf-form>

  </mf-modal>
</template>

<script>
import FlatInput from '@/components/flastInput'
import { changePassword } from '@/api/common'
// import { Encrypt } from '@/utils/forge'
import ErrorMsg from '@/components/MFForm/ErrorMsg/ErrorMsg.vue'
import { errorMessage } from '@/utils'

export default {
  name: 'ChangePassword',

  components: { FlatInput, ErrorMsg },

  data() {
    const validPassword = (rule, value, callback) => {
      if (value !== this.form.newPassword) {
        callback(new Error(this.$t('rePasswordError')))
      } else {
        callback()
      }
    }
    return {
      visible: false,
      loading: false,
      labelCol: { span: 0 },
      wrapperCol: { span: 24 },
      form: {
        loginName: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      },

      rules: {
        loginName: [{ required: true, message: this.$t('login.login_name_required') }],
        // currentPassword: [{ required: true, message: this.$t('login.current_password_required') }],
        // newPassword: [{ required: true, message: this.$t('login.new_password_required') }],
        confirmNewPassword: [
          // { required: true, message: this.$t('login.confirm_new_password_required') },
          { validator: validPassword, trigger: 'blur' }]
      }

    }
  },

  methods: {
    show() {
      this.visible = true
    },
    onClose() {
      this.visible = false
      this.$refs.changePasswordForm.$children[0].resetFields()
      this.hideError()
    },
    onSubmit() {
      this.$refs.changePasswordForm.$children[0].validate(viald => {
        if (viald) {
          this.loading = true
          changePassword({
            sspr: {
              username: this.form.loginName,
              'new-password': this.form.newPassword,
              'old-password': this.form.currentPassword
            }
          }).then(() => {
            this.loading = false
            this.visible = false
            this.$refs.changePasswordForm.$children[0].resetFields()
            this.hideError()
            this.$message.success(this.$t('passwordChanged'))
          }).catch(e => {
            this.loading = false
            const resData = e.response && e.response.data
            const err = resData.ExceptionProperties
            if (err.length > 0 && err.find(item => item.Name === 'ErrorCode').StringValue === 'validator.error.password.not.meet.policy') {
              this.showError(err.find(item => item.Name === 'Detail').StringValue)
            } else {
              errorMessage(resData.Title, resData.StackTrace)
            }
          })
        } else {
          this.hideError()
        }
      })
    },

    showError(msg) {
      this.$refs.errorMsg.showError(msg)
    },

    hideError() {
      this.$refs.errorMsg.hideError()
    }
  }
}
</script>

<style lang="less" scoped>
  /deep/.ant-modal-wrap{
    z-index: 1000;
  }
  /deep/.ant-modal-body{
    padding-left: 54px;
    padding-right: 54px;
  }
  .setting-change-password /deep/ .ant-modal-body {
    max-height: 510px;
  }
</style>
