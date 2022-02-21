<template>
  <section class="login-layout">
    <div style="width:35%;height:100%;min-height:100vh" />
    <div class="login-layout-content">
      <div class="login-form-wrapper">
        <div class="login-icon-wrapper">
          <div class="login-wa">ALM</div>
          <div class="login-icon-plus" />
          <img src="../../assets/application.svg" alt="logo" class="login-application-icon">
        </div>

        <div class="login-formbox">
          <h1 class="mf-h1">{{ $t('WEB_ADMINISTRATION') }}</h1>
          <mf-form
            ref="loginForm"
            :model="form"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :hide-required-mark="true"
            :rules="rules"
          >
            <a-form-model-item prop="username" :class="{'has-error': loginFailTxt}">
              <flat-input
                id="login_username"
                v-model="form.username"
                auto-focus
                @keyup.enter.native="submitLogin"
              >
                {{ $t('login.userName') }}
              </flat-input>
            </a-form-model-item>

            <a-form-model-item prop="password" :class="{'has-error': loginFailTxt}">
              <flat-input
                id="login_password"
                v-model="form.password"
                type="password"
                @keyup.enter.native="submitLogin"
              >
                {{ $t('login.password') }}
              </flat-input>
            </a-form-model-item>

            <a-form-model-item>
              <span v-if="loginFailTxt" class="has-error bottom-error">
                <i class="anticon anticon-close-circle">
                  <svg viewBox="64 64 896 896" data-icon="close-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" class="">
                    <path
                      d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6
                    448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3
                    118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5
                    359a8.32 8.32 0 0 1-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512
                    464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9
                    5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"
                    />
                  </svg>
                </i>

                <span style="word-break: normal;">{{ loginFailTxt }}</span>
              </span>
              <a-button
                id="login_button"
                type="primary"
                style="float: right"
                :loading="loading"
                @click="submitLogin"
              >{{ $t('login.login') }}</a-button>
            </a-form-model-item>
            <div class="login-bottom">
              <div v-if="canChangePwd" class="change-password" @click.stop="onShowChangePasswordModal"> {{ $t('change_my_password') }}</div>
              <div v-if="canChangePwd && (isSsprEnabled || isSaas)" class="change-password" @click.stop="onShowForgotPasswordModal"> {{ $t('forgot_my_password') }}</div>
              <div v-if="canChangePwd && (isSsprEnabled || isSaas)" class="change-password" @click.stop="onShowForgotNameModal"> {{ $t('login.ForgotLogin') }}</div>
              <!--              <div class="change-password"><a @click.stop="onShowChangePasswordModal">{{ $t('change_my_password') }}</a></div>-->

              <!--              <div v-if="isSsprEnabled" class="change-password" @click="onShowForgotPasswordModal">{{ $t('forgot_my_password') }}</div>-->

              <!--              <div v-if="isSsprEnabled" class="change-password" @click="onShowForgotNameModal">{{ $t('login.ForgotLogin') }}</div>-->
            </div>

          </mf-form>
        </div>
      </div>
    </div>
    <change-password v-if="canChangePwd" ref="changePasswordRef" />
    <forgot-password v-if="canChangePwd && (isSsprEnabled || isSaas)" ref="forgotPasswordRef" />
    <forgot-name v-if="canChangePwd && (isSsprEnabled || isSaas)" ref="forgotNameRef" />
    <div class="logo" />
  </section>
</template>

<script>
import FlatInput from '@/components/flastInput'
import ChangePassword from './ChangePassword'
import ForgotPassword from './ForgotPassword'
import ForgotName from './ForgotName'
import { mapGetters } from 'vuex'
import { SERVER_TYPE, AUTH_TYPE } from '@/store/const'
// import { decoratorLoading } from '@/utils/decorator'

export default {
  components: { FlatInput, ChangePassword, ForgotPassword, ForgotName },
  data() {
    return {
      AUTH_TYPE,
      form: {
        username: '',
        password: ''
      },
      labelCol: { span: 0 },
      wrapperCol: { span: 24 },

      rules: {
        username: [{ required: true, message: this.$t('login.userName required') }]
        // password: [{ required: true, message: this.$t('login.password required') }]
      },

      loading: false,

      loginFailTxt: ''
    }
  },
  computed: {
    ...mapGetters(['isSsprEnabled', 'serverType', 'canChangePassword']),

    canChangePwd() {
      return this.canChangePassword || this.authType === AUTH_TYPE.SSO
    },

    isSaas() {
      return this.serverType === SERVER_TYPE.Saas
    }
  },
  watch: {
    form: {
      handler: function() {
        this.loginFailTxt = null
      },
      deep: true
    }
  },
  methods: {
    onShowChangePasswordModal() {
      this.$refs.changePasswordRef.show()
    },
    onShowForgotPasswordModal() {
      this.$refs.forgotPasswordRef.show()
    },
    onShowForgotNameModal() {
      this.$refs.forgotNameRef.show()
    },

    submitLogin() {
      this.$refs.loginForm.$children[0].validate(valid => {
        if (valid) {
          this.loading = true
          this.loginFailTxt = null
          const form = JSON.parse(JSON.stringify(this.form))
          form.password = form.password.split('').map(e => { return `<![CDATA[${e}]]>` }).join('')
          this.$store.dispatch('user/login', form).then(() => {
            this.loading = false
          }).catch(res => {
            this.loading = false
            if (res.response) {
              const resData = res.response.data
              this.loginFailTxt = resData.Title
            }
          })
        } else {
          return false
        }
      })
    }
  }

}
</script>

<style lang="less" scoped>
.login-layout {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  flex-direction: row;
  display: flex;
  flex: auto;
  min-height: 100vh;
  height: 100%;
  //overflow: hidden;

  .login-layout-content {
    display: flex;
    // height: 100vh;
    width: 65%;
    align-items: center;
    background-image: url(../../assets/login-bg.jpg);
    background-size: cover;
    background-repeat: no-repeat;

    .login-formbox {
      padding: 30px 55px;
      width: max-content;
      min-width: 585px;
      height: 488px;
      background: #fff;
      box-shadow: 5px 5px 0px 0px rgba(0, 0, 0, 0.25);
      border-radius: 3px;
      position: relative;
      left: -100px;
      top: 168px;

      h1 {
        color: #323435;
      }
      .login-bottom{
        height: 120px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      .change-password{
        width: auto;
        line-height: 20px;
        margin-bottom: 24px;
        cursor: pointer;
        color: #0079EF;
      }
    }
  }
}

.login-form-wrapper{
  position: relative;
  display: flex;
  flex-direction: row;
  left: -320px;
  // height: 533px;
  min-height: 680px;
}
.login-icon-wrapper{
  position: relative;
  width: 320px;
  min-width: 320px;
  height: 340px;
}

.login-wa{
  position: absolute;
  right: 0;
  display: flex;
  width: 210px;
  height: 168px;
  background: #004272;
  border-radius: 1px;
  font-size: 90px;
  color: #fff;
  align-items: center;
  justify-content: center;
  font-family: "BoldWeb";
}

.login-icon-plus{
  position: absolute;
  right: 154px;
  top: 74px;
  width: 208px;
  height: 170px;
  background: url(../../assets/login-plus-icon.png);
}

.login-application-icon{
  width: 120px;
  height: 82px;
}

.login-application-icon{
  position: absolute;
  top: 257px;
  right: 239px;
}

.logo{
  width: 134px;
  height: 32px;
  position: fixed;
  bottom: 35px;
  left: 35px;
  background: url(../../assets/logo-mf.png);
}

.has-error{
  color: #e5004c;
  font-size: 14px;

  i{
    margin-right: 8px;
  }
}
.bottom-error{
  position: absolute;
  width: 370px;
  overflow: hidden;
  line-height: 16px;
  display: flex;
  align-items: center;
  word-break: break-all;
}
</style>
