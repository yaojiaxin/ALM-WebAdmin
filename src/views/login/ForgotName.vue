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
      {{ $t('login.ForgotLogin') }}
    </span>

    <mf-form
      ref="forgotNameForm"
      :model="form"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :hide-required-mark="true"
      layout="vertical"
    >

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
import { generateCaptchaCK, forgotUserName } from '@/api/common'
import { errorMessage } from '@/utils'

const generateCaptchaImg = '/qcbin/authentication-point/generateCaptchaImg'

export default {
  name: 'ForgotName',
  components: { FlatInput },

  data() {
    return {
      visible: false,
      loading: false,
      labelCol: { span: 0 },
      wrapperCol: { span: 24 },
      form: {
        email: '',
        imageText: ''
      },
      generateCaptchaImg,

      ck: '',

      rules: {
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
      this.$refs.forgotNameForm.$children[0].resetFields()
    },
    onSubmit() {
      this.$refs.forgotNameForm.$children[0].validate(valid => {
        if (valid) {
          this.loading = true
          forgotUserName({
            sspr: {
              'captcha-answer': this.form.imageText,
              ck: this.ck,
              email: this.form.email
            }
          }).then(data => {
            this.visible = false
            this.loading = false
            this.$refs.forgotNameForm.$children[0].resetFields()
          }).catch(e => {
            this.loading = false
            const resData = e.response && e.response.data

            errorMessage(resData.Title, resData.StackTrace)
            this.getImgCk()
          })
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

