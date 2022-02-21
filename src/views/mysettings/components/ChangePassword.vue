<template>
  <div>
    <a-button id="my-setting-change-password" type="link" class="mf-btn-link-primary change-btn" @click="onShow">{{ $t('change_password') }}</a-button>

    <mf-modal
      id="setting_change_password"
      class="setting-change-password"
      :visible="visible"
      :confirm-loading="loading"
      width="525px"
      :ok-text="$t('OK')"
      @cancel="onCancel"
      @ok="onSave"
    >
      <span slot="title">
        {{ $t('change_password') }}
      </span>

      <mf-form
        ref="changePassword"
        :model="passwordForm"
        :rules="rules"
        :label-col="{ span: 10 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-form-model-item :label="$t('currentPassword')" prop="currentPassword" :wrapper-col="{ span: 14 }">
          <a-input id="currentPassword" v-model="passwordForm.currentPassword" class="change-input" type="password" />
        </a-form-model-item>
        <a-form-model-item prop="newPassword" :label="$t('newPassword')" :wrapper-col="{ span: 14 }">
          <a-input id="newPassword" v-model="passwordForm.newPassword" class="change-input" type="password" />
        </a-form-model-item>
        <a-form-model-item class="confirmPassword" prop="confirmPassword" :label="$t('confirmPassword')" :wrapper-col="{ span: 14 }">
          <a-input id="confirmPassword" v-model="passwordForm.confirmPassword" class="change-input" type="password" @change="hideError" />
          <error-msg ref="errorMsg" :item-class="'confirmPassword'" />
        </a-form-model-item>
      </mf-form>
    </mf-modal>
  </div>
</template>

<script>
import { putResources } from '@/api/mySetting'
import { Encrypt } from '@/utils/forge'
import ErrorMsg from '@/components/MFForm/ErrorMsg/ErrorMsg.vue'
import { errorMessage } from '@/utils'

export default {
  components: {
    ErrorMsg
  },
  props: {
    user: {
      type: Object,
      default: () => {
        return { name: '' }
      }
    }
  },
  data() {
    const validPassword = (rule, value, callback) => {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error(this.$t('rePasswordError')))
      } else {
        callback()
      }
    }
    return {
      visible: false,
      loading: false,

      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },

      rules: {
        // currentPassword: [{ required: 'true', message: this.$t('currentPasswordRequired') }],
        // newPassword: [{ required: 'true', message: this.$t('newPasswordRequired') }],
        confirmPassword: [
          // { required: 'true', message: this.$t('rePasswordRequired') },
          {
            validator: validPassword
          }]
      }
    }
  },

  methods: {
    onShow() {
      this.visible = true
      this.$store.dispatch('forge/getKey')
    },

    onCancel() {
      this.visible = false
      this.$refs.changePassword.$children[0].resetFields()
      this.hideError()
    },

    onSave() {
      this.$refs.changePassword.$children[0].validate(valid => {
        if (valid) {
          this.loading = true
          putResources({
            user: {
              ...this.user,
              'old-password': this.passwordForm.currentPassword ? Encrypt(this.passwordForm.currentPassword) : '',
              password: this.passwordForm.newPassword ? Encrypt(this.passwordForm.newPassword) : ''
            }
          }).then(data => {
            this.loading = false
            this.visible = false
            this.$refs.changePassword.$children[0].resetFields()
            this.hideError()
            this.$message.success(this.$t('passwordChanged'))
          }).catch(e => {
            this.loading = false
            const err = e.response.data.QCRestException.ExceptionProperties
            if (err && err.ExceptionProperty.find(item => item['@Name'] === 'ErrorCode')['@Value'] === 'validator.error.password.not.meet.policy') {
              this.showError(err.ExceptionProperty.find(item => item['@Name'] === 'Detail')['@Value'])
            } else {
              errorMessage(e.response.data.QCRestException.Title, e.response.data.QCRestException.StackTrace)
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
  .change-input{
    /*width: 230px;*/
  }

  .change-btn{
    margin-left: 24px;
  }

  .setting-change-password /deep/ .ant-modal-body {
    max-height: 510px;
  }
</style>
