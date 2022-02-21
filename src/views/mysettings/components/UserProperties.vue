<template>
  <div class="user-properties" :style="checkPermission(['CUSTOMER_CONTEXT_SWITCH'])?'height:calc(100vh - 205px);':'height:calc(100vh - 161px);'">
    <div class="sub-tit">
      <span class="mf-subtitle">
        {{ $t('mysetting.userProperties') }}
      </span>

    </div>

    <div class="property-cont-wrapper">
      <div class="property-cont">
        <mf-form
          id="my_setting_modal_form"
          ref="mysettingForm"
          :model="form"
          :rules="rules"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-form-model-item :label="$t('mysetting.UserName')" prop="name">
            <a-input id="user_add_name" v-model.trim="form.name" :disabled="true" class="setting-input" :max-length="30" />
          </a-form-model-item>

          <a-form-model-item :label="$t('mysetting.FullName')" prop="fullName">
            <a-input id="user_add_fullName" v-model="form.fullName" class="setting-input" :max-length="255" />
          </a-form-model-item>

          <a-form-model-item class="password-item" :label="$t('mysetting.PassWord')" prop="fullName">
            <a-input id="user_add_passWord" value="123456" disabled type="password" class="setting-input" />
            <change-password
              v-if="isChangePasswordAllowed"
              ref="password"
              :user="{...initForm}"
            />
          </a-form-model-item>

          <a-form-model-item :label="$t('mysetting.Email')" prop="email">
            <a-input id="user_add_email" v-model="form.email" class="setting-input" :max-length="85" />
          </a-form-model-item>

          <a-form-model-item :label="$t('mysetting.Phone')" prop="phone">
            <a-input id="user_add_phone" v-model="form.phone" class="setting-input" />
          </a-form-model-item>

          <a-form-model-item :label="$t('mysetting.Role')" prop="role">
            <a-input id="user_add_role" v-model="form.role" :disabled="true" class="setting-input" :max-length="25" />
          </a-form-model-item>

          <a-form-model-item :label="$t('mysetting.Date')" prop="date">
            <a-input id="user_add_date" v-model="form.date" :disabled="true" class="setting-input" :max-length="25" />
          </a-form-model-item>

          <a-form-model-item :label="$t('mysetting.Description')" prop="description">
            <a-textarea id="user_add_description" v-model="form.description" class="setting-area" :max-length="1000" :auto-size="{ minRows: 3, maxRows: 6 }" />
          </a-form-model-item>
        </mf-form>
      </div>
    </div>
    <div class="footer-btn">

      <a-button
        id="restore-settings"
        :disabled="isChange"
        style="margin-right: 8px;"
        class="mf-btn-dashed"
        @click="onRestoreSettings"
      >
        {{ $t('Restore') }}
      </a-button>

      <a-button id="savePolicy" type="primary" :disabled="isChange" :loading="loading" @click="putUserResources">
        {{ $t('Save') }}
      </a-button>
    </div>

  </div>
</template>

<script>
import ChangePassword from './ChangePassword'
import { getResources, putResources } from '@/api/mySetting'
import { mapGetters } from 'vuex'
import { AUTH_TYPE, SERVER_TYPE } from '@/store/const'
import { isChangeObjorArr, errorMessage } from '@/utils'

export default {
  components: {
    ChangePassword
  },
  data() {
    return {
      form: {
        name: '',
        SERVER_TYPE,
        fullName: '',
        email: '',
        phone: '',
        role: '',
        date: '',
        description: ''
      },
      isChangePasswordAllowed: false,
      initForm: {},
      isChange: true,
      labelCol: { span: 10 },
      wrapperCol: { span: 12 },
      loading: false,
      userResources: '',
      rules: {
        email: [
          { type: 'email', message: this.$t('valid.email') },
          { type: 'email', required: this.isSaas, message: this.$t('valid.emailRequired') }
        ]
      },
      AUTH_TYPE,
      isSaas: false
    }
  },
  computed: {
    ...mapGetters(['authType', 'canChangePassword']),

    canChangePwd() {
      return this.canChangePassword || this.authType === AUTH_TYPE.SSO
    }
  },
  watch: {
    form: {
      handler: function(form) {
        this.isChange = isChangeObjorArr(form, this.initForm)
        if (!this.isChange) {
          this.$store.dispatch('pageChange/pageChanged', { func: null, params: [] })
        } else {
          this.$store.dispatch('pageChange/resetPageChanged')
        }
      },
      deep: true
    }
  },

  beforeCreate() {
    this.isSaas = this.$store.state.user.serverType === SERVER_TYPE.Saas
  },

  mounted() {
    this.$nextTick(function() {
      if (this.$refs.scrollbar) {
        this.$refs.scrollbar.calculateSize()
      }
    })
    this.getUserResources()
  },
  methods: {
    handleRes(res) {
      const userResources = res.user
      this.form = {
        name: userResources.name,
        fullName: userResources['full-name'],
        email: userResources.email,
        phone: userResources.phone,
        role: userResources.role ? userResources.role['role-name'] : '',
        date: userResources['expire-date'],
        description: userResources.description
      }
      this.isChangePasswordAllowed = userResources['is-change-password-allowed']
      this.initForm = JSON.parse(JSON.stringify(this.form))
    },
    onChangePassword() {
      this.$refs.password.onShow()
    },
    getUserResources() {
      getResources().then(res => {
        this.handleRes(res)
      })
    },
    putUserResources() {
      this.$refs.mysettingForm.$children[0].validate(valid => {
        if (valid) {
          const formData = {
            description: this.form.description,
            email: this.form.email,
            'expire-date': this.form.date,
            'full-name': this.form.fullName,
            name: this.form.name,
            phone: this.form.phone
          }
          this.loading = true
          putResources({ user: formData }).then(res => {
            this.handleRes(res)
            this.$message.success(this.$t('mysetting.mySettingChangeSuccess'))
          }).catch(e => {
            errorMessage(e.response.data.QCRestException.Title, e.response.data.QCRestException.StackTrace)
          }).finally(() => {
            this.loading = false
            this.isChange = true
          })
        }
      })
    },
    onRestoreSettings() {
      this.getUserResources()
      this.$refs.mysettingForm.$children[0].clearValidate()
    }
  }
}
</script>

<style lang="less" scoped>
  .user-properties{
    background: #FFFFFF;
    box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(101, 102, 104, 0.16);
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  .sub-tit{
    margin-top: 24px;
    margin-left: 24px;
    height: 28px;
  }

  .property-cont-wrapper {
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;

    .property-cont{
      width: 500px;
      margin-left: 28px;
      margin-top: 24px;
    }
  }

  .setting-input{
    width: 277px;
  }

  /deep/ .ant-form-item-control-wrapper{
    width: 277px;
  }
  .password-item{
    /deep/ .ant-form-item-children{
      display: flex;
      width: 450px;
    }
  }
  .footer-btn{
    display: flex;
    justify-content: flex-end;
    align-items: center;
    //position: fixed;
    bottom: 0;
    right: 0;
    //width: 760px;
    height: 64px;
    padding-right: 24px;
    background: #fff;
    border-top: 1px solid #DCDEDF;
  }
</style>
