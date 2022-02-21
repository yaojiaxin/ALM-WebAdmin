<template>
  <mf-drawer
    placement="right"
    :visible="visible"
    width="500"
    class="authentication-setting-drawer"
    :drawer-style="{ position: 'relative' }"

    @close="onClose"
  >
    <span slot="title">
      {{ $t('userManagement.AuthenticationSettings') }}
      <mf-help-btn :help="AUTHENTICATION_SETTING" />
    </span>

    <div id="authtt_settype" class="mf-subtitle authtt-settype">{{ $t('userManagement.userToolBar.authenticationType') }}</div>
    <a-radio-group id="radio_group" v-model="type" class="multi-line-radio" @change="onChange">
      <a-radio id="auth_type_alm" :style="radioStyle" value="QualityCenter" :disabled="authType===AUTH_TYPE.SSO">
        <span class="has-authtt-help-icon">{{ $t('userManagement.userToolBar.ALM') }}</span>

        <a-tooltip placement="top">
          <template slot="title">
            <span>{{ $t('userManagement.userToolBar.ALM Tooltip') }}</span>
          </template>
          <a-icon type="question-circle" />
        </a-tooltip>

      </a-radio>
      <a-radio id="auth_type_ldap" :style="radioStyle" value="LDAP" :disabled="authType===AUTH_TYPE.SSO">
        <span class="has-authtt-help-icon">{{ $t('userManagement.userToolBar.LDAP') }}</span>

        <a-tooltip placement="right">
          <template slot="title">
            <span>{{ $t('userManagement.userToolBar.LDAP Tooltip') }}</span>
          </template>
          <a-icon type="question-circle" />
        </a-tooltip>

      </a-radio>
      <a-radio id="auth_type_extauth" :style="radioStyle" value="External">
        {{ $t('userManagement.userToolBar.externalAuthentication') }}
        <!--        <a-button :disabled="type !== 'External'" :class="['authtt-advanset-btn',{blockborder:type===3}]" @click="showSetting=!showSetting">{{ $t('userManagement.userToolBar.advancedSetting') }}</a-button>-->
      </a-radio>
    </a-radio-group>

    <template v-if="type==='External' && showSetting">
      <div class="type-select-box">
        <p style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="$t('userManagement.userToolBar.authenticationType')">{{ $t('userManagement.userToolBar.authenticationType') }}</p>
        <mf-select id="type_select" v-model="form['field-type']" :allow-clear="false" class="type-select">
          <a-select-option id="auth_type_extauth_list_mailname" value="EMAIL+NAME">
            {{ $t('userManagement.userToolBar.E+N') }}
          </a-select-option>
          <a-select-option id="auth_type_extauth_list_mail" value="EMAIL">
            {{ $t('userManagement.userToolBar.email') }}
          </a-select-option>
          <a-select-option id="auth_type_extauth_list_name" value="NAME">
            {{ $t('userManagement.userToolBar.name') }}
          </a-select-option>
        </mf-select>
      </div>
      <div class="type-textarea-box">
        <p style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="$t('userManagement.userToolBar.pattern')"> {{ $t('userManagement.userToolBar.pattern') }}</p>
        <a-textarea id="type_textarea" v-model="form['field-pattern']" class="type-textarea" />
      </div>
    </template>

    <div v-show="visible" id="user_drawer_tool" class="user-drawer-tool">
      <a-button id="user_edit_cancel" class="mf-btn-dashed" :disabled="isSaving" @click="onClose">{{ $t("Cancel") }}</a-button>
      <a-button
        id="user_edit_save"
        type="primary"
        style="margin-left: 8px"
        :loading="isSaving"
        @click="onSaveUser"
      >
        {{ $t("OK") }}
      </a-button>
    </div>
  </mf-drawer>
</template>

<script>
import MfSelect from '@/components/MFSelect/index'
import { mapGetters } from 'vuex'
// eslint-disable-next-line no-unused-vars
import { AUTH_TYPE, ROOT_CUSTOMER_ID, SERVER_TYPE } from '@/store/const.js'
import { getAuthenticationSettings, updateAuthenticationSettings, getAllLDAP } from '@/api/user'
import { AUTHENTICATION_SETTING } from 'config/help'
// eslint-disable-next-line no-unused-vars
import { getAllLDAPSaas, selectedCustomerLDAPs } from '@/api/customers'

export default {
  components: { MfSelect },
  data() {
    return {
      AUTHENTICATION_SETTING,
      AUTH_TYPE,

      visible: false,
      showSetting: false,
      isSaving: false,
      type: 'QualityCenter',
      form: {
        'field-type': 'EMAIL+NAME',
        'field-pattern': ''
      },

      radioStyle: {
        display: 'block',
        minHeight: '32px',
        lineHeight: '32px'
      }

    }
  },

  computed: {
    ...mapGetters(['authType', 'serverType'])
  },

  methods: {
    getAuthenticationSettingsType() {
      getAuthenticationSettings().then(res => {
        this.type = res['authentication-settings'].authentication
        console.log('res[\'authentication-settings\']', res['authentication-settings'])
        this.form['field-type'] = res['authentication-settings']['field-type'] ? res['authentication-settings']['field-type'] : 'EMAIL+NAME'
        this.form['field-pattern'] = res['authentication-settings']['field-pattern']
      }).catch(() => {

      })
    },

    onChange(e) {
      if (e.target.value === 'External') {
        this.showSetting = true
      }
    },

    onClose() {
      this.visible = false
    },

    async onSaveUser() {
      if (this.type === 'LDAP') {
        const servers = await getAllLDAP()
        if (servers['ldap-servers'] === '') {
          // this.$mfConfirm({
          //   title: this.$t('Error'),
          //   isShowCancel: false,
          //   iconType: 'Error',
          //   message: this.$t('userManagement.userToolBar.LDAP_servers_are_not_configured'),
          //   confirmText: this.$t('OK')
          // })
          this.$message.error(this.$t('userManagement.userToolBar.LDAP_servers_are_not_configured'))
          return
        }
      }

      this.isSaving = true
      const settingsData = { authentication: this.type, ...this.form }
      updateAuthenticationSettings(settingsData).then(response => {
        if (this.type === 'LDAP' && this.serverType === SERVER_TYPE.Saas) {
          getAllLDAPSaas().then(res => {
            if (res.ldaps) {
              const selectedCustomerData = { ldaps: { ldap: Array.isArray(res.ldaps.ldap) ? res.ldaps.ldap : [res.ldaps.ldap] }}
              selectedCustomerLDAPs(ROOT_CUSTOMER_ID, selectedCustomerData).then(res => {
              })
            }
          })
        }
        this.isSaving = false
        this.$message.success(this.$t('configuration.EditSuccess'))
        this.visible = false
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }).catch(() => {
        this.isSaving = false
      })
    },

    show() {
      this.visible = true
      this.getAuthenticationSettingsType()
    }
  }
}
</script>

<style lang="less" scoped>
.type-select-box{
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 20px;
  p{
    width: 140px;
    height: 30px;
    line-height: 30px;
    margin: 0;
  }
  .type-select{
    height: 30px;
    width: 260px;
  }
}
.type-textarea-box{
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-top: 20px;
  p{
    width: 140px;
    margin:0;
    height: 30px;
    line-height: 30px;
  }
  .type-textarea{
    width: 260px;
  }
}

.authtt-settype{
  height: 19px;
  font-size: 14px;
  font-weight: bold;
  color: #333333;
  line-height: 16px;
  margin-bottom: 20px;
}

.authtt-advanset-btn{
  border: 2px solid #ccc;
}

.has-authtt-help-icon{
  margin-right: 10px;
}

.blockborder{
  border-color: #000;
}
</style>
<style lang="less">
.authentication-setting-drawer{

  .ant-radio-group{
    padding-left: 10px;
  }

  .user-drawer-tool{
    width: 500px;
  }

  .ant-drawer-header .ant-drawer-title {
    font-weight: bold;
  }
}
</style>
