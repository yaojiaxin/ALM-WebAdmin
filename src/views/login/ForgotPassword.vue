<template>
  <mf-modal
    :visible="visible"
    :confirm-loading="loading"
    width="586px"
    :ok-text="$t('OK')"
    @cancel="onClose"
    @ok="onSubmit"
  >
    <span slot="title">
      {{ $t('forgot_my_password') }}
    </span>

    <mf-form
      ref="forgotPasswordForm"
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

      <a-form-model-item prop="email">
        <flat-input
          id="email_address"
          v-model="form.email"
          :max-length="85"
        >
          {{ $t('login.email_address') }}
        </flat-input>
      </a-form-model-item>

      <a-form-model-item prop="imageText">
        <flat-input
          id="enter_the_image_text"
          v-model="form.imageText"
        >
          {{ $t('login.enter_the_image_text') }}
        </flat-input>
      </a-form-model-item>

      <img :src="ck ? `${generateCaptchaImg}?ck=${ck}` : ''" alt="" @click="getImgCk">
      <span class="image-refresh">{{ $t('imageRefresh') }}</span>
    </mf-form>

  </mf-modal>
</template>

<script>
import FlatInput from '@/components/flastInput'
import { generateCaptchaCK, forgotPassword } from '@/api/common'
import { errorMessage } from '@/utils'

const generateCaptchaImg = '/qcbin/authentication-point/generateCaptchaImg'

export default {
  name: 'ForgotPassword',

  components: { FlatInput },

  data() {
    return {
      visible: false,
      loading: false,
      labelCol: { span: 0 },
      wrapperCol: { span: 24 },
      form: {
        loginName: '',
        email: '',
        imageText: ''
      },

      generateCaptchaImg,

      ck: '',

      rules: {
        loginName: [{ required: true, message: this.$t('login.login_name_required') }],
        email: [{ required: true, message: this.$t('login.email_address_required') },
          { type: 'email', message: this.$t('valid.email') }],
        imageText: [{ required: true, message: this.$t('login.enter_the_image_text_required') }]
      }

    }
  },

  methods: {
    show() {
      this.visible = true
      this.getImgCk()
    },
    getImgCk() {
      generateCaptchaCK().then(data => {
        this.ck = data.replace(/\r\n/g, '').replace(/\n/g, '')
      })
    },

    onClose() {
      this.visible = false
      this.$refs.forgotPasswordForm.$children[0].resetFields()
    },
    onSubmit() {
      this.$refs.forgotPasswordForm.$children[0].validate(valid => {
        if (valid) {
          this.loading = true
          forgotPassword({
            sspr: {
              username: this.form.loginName,
              'captcha-answer': this.form.imageText,
              ck: this.ck,
              email: this.form.email
            }
          }).then(data => {
            this.loading = false
            // this.visible = false
            // this.$refs.forgotPasswordForm.$children[0].resetFields()
            this.showMessageConfirm()
          }).catch((e) => {
            this.loading = false

            const resData = e.response && e.response.data

            if (resData.ExceptionProperties === null) {
              this.showMessageConfirm()
            } else {
              errorMessage(resData.Title, resData.StackTrace)
              this.getImgCk()
            }
          })
        }
      })
    },

    showMessageConfirm() {
      this.$mfConfirm({
        message: this.$t('login.ForgotPasswordSecureMessage'),
        isShowCancel: false,
        confirmText: this.$t('Close'),
        onConfirm: () => {
          this.visible = false
          this.$refs.forgotPasswordForm.$children[0].resetFields()
        }
      })
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
  .image-refresh{
    position:absolute;
    color: rgba(0, 0, 0, 0.45);
    margin-left: 16px;
    margin-top: 18px;
  }
</style>
