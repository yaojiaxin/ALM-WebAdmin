<template>
  <mf-modal
    id="user_add_saas_modal"
    :visible="visible"
    :confirm-loading="loading"
    width="800px"
    @cancel="onCancel"
    @ok="onAddSaasUser"
  >
    <span slot="title">
      {{ $t('userManagement.AddNewUser') }}
      <a
        class="mf-help"
        target="_blank"
        :title="$t('Help')"
        :href="ADD_USER"
      >
        <a-icon type="question-circle" />
      </a>
    </span>

    <mf-form
      id="add_saas_user_form"
      ref="addSaasUserForm"
      :model="form"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :rules="rules"
    >
      <a-form-model-item :label="$t('userManagement.UserName')" prop="name">
        <a-input id="user_add_saas_name" v-model="form.name" :placeholder="$t('userManagement.Please enter')" :max-length="60" />
      </a-form-model-item>

      <a-form-model-item :label="$t('userManagement.FullName')" prop="fullName">
        <a-input id="user_add_saas_fullName" v-model="form.fullName" :max-length="255" />
      </a-form-model-item>

      <!-- saas and alm -->

      <a-form-model-item :label="$t('userManagement.RequestID')" prop="requestId">
        <a-input id="user_add_saas_requestId" v-model="form.requestId" :max-length="30" />
      </a-form-model-item>

      <a-form-model-item :label="$t('userManagement.Email')" prop="email">
        <a-input id="user_add_saas_email" v-model="form.email" :max-length="254" />
      </a-form-model-item>

      <a-form-model-item :label="$t('userManagement.sendNotification')" prop="notification">
        <a-checkbox id="user_add_saas_notification" :checked="form.notification" @change="form.notification=!form.notification" />
      </a-form-model-item>

      <a-form-model-item :label="$t('userManagement.Phone')" prop="phone">
        <a-input id="user_add_saas_phone" v-model="form.phone" :max-length="25" />
      </a-form-model-item>

      <!-- saas and LDAP -->
      <a-form-model-item v-if="ldap" :label="$t('userManagement.ldapAuthServer')" prop="ldapAuthServer">
        <mf-select id="user_add_op_las" v-model="form.ldapAuthServer">
          <a-select-option v-for="item in server" :id="item['ldap-id']" :key="item['ldap-id']" :value="item['ldap-id']">
            {{ item['ldap-name'] }}
          </a-select-option>
        </mf-select>
      </a-form-model-item>

      <a-form-model-item v-if="ldap" :label="$t('userManagement.domainAuthentication')" prop="domainAuth">
        <a-input id="user_add_saas_ldapDomain" v-model="form.domainAuth" :max-length="120" />
      </a-form-model-item>

      <!-- saas and sso -->
      <a-form-model-item v-if="authType===AUTH_TYPE.SSO" :label="$t('userManagement.idpName')" prop="idpName">
        <mf-select
          id="user_add_saas_idpId"
          v-model="form.idpName"
          @change="resetIdentityKeyValidate"
        >
          <a-select-option v-for="item in idpsNames" :id="item" :key="item" :value="item">
            {{ item }}
          </a-select-option>
        </mf-select>
      </a-form-model-item>

      <!--      <a-form-model-item v-if="authType===AUTH_TYPE.SSO" :label="$t('userManagement.idpName')" prop="idpName">-->
      <!--        <a-input id="user_add_saas_idpId" v-model="form.idpName" :max-length="25" />-->
      <!--      </a-form-model-item>-->

      <a-form-model-item v-if="authType===AUTH_TYPE.SSO" ref="identityKey" :label="$t('userManagement.identityKey')" :prop="form.idpName==='local'?'':'identityKey'">
        <a-input id="user_add_saas_identityKeypId" v-model="form.identityKey" :max-length="120" />
      </a-form-model-item>

      <a-form-model-item :label="$t('userManagement.Description')" prop="description">
        <a-textarea id="user_add_saas_description" v-model="form.description" :max-length="1000" :auto-size="{ minRows: 3, maxRows: 6 }" />
      </a-form-model-item>

      <!-- <a-form-model-item :label="$t('userManagement.Customer')" prop="customer">
        <mf-select id="uas_customer" v-model="form.customer">
          <a-select-option id="uas_customer_option1" value="1">
            customer
          </a-select-option>
        </mf-select>
      </a-form-model-item> -->

      <!--      <a-form-model-item :label="$t('userManagement.role')" prop="role">-->
      <!--        <mf-select id="uas_role" v-model="form.role">-->
      <!--          <a-select-option v-for="item in role" :id="item['role-id']" :key="item['role-id']" :value="item['role-name']">-->
      <!--            {{ item['role-name'] }}-->
      <!--          </a-select-option>-->
      <!--        </mf-select>-->
      <!--      </a-form-model-item>-->

      <!-- <a-form-model-item :label="$t('administrator')" prop="isAdmin">
        <a-radio-group id="user_add_siteadmin" v-model="form.isAdmin">
          <a-radio id="ua_siteadmin_options1" :value="1">
            {{ $t('yes') }}
          </a-radio>
          <a-radio id="ua_siteadmin_options2" :value="2">
            {{ $t('no') }}
          </a-radio>
        </a-radio-group>
      </a-form-model-item> -->
    </mf-form>
  </mf-modal>
</template>

<script>
import { addUser } from '@/api/user'
import { mapGetters } from 'vuex'
import { AUTH_TYPE, SERVER_TYPE } from '@/store/const.js'
import { getCustomerIDPs, getCustomerLDAPs } from '@/api/customers'
import { ADD_USER } from 'config/help'
import { validateUserName } from '@/utils/validate'

export default {
  props: {
    ldap: {
      type: Boolean,
      default: false
    },
    role: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      AUTH_TYPE,
      server: [],
      SERVER_TYPE,
      ADD_USER,
      loading: false,
      visible: false,
      idpsNames: [],

      form: {
        name: '',
        fullName: '',
        email: '',
        phone: '',
        description: '',
        requestId: '',
        notification: false,
        // isAdmin: 2,
        // customer: undefined,
        // role: undefined,

        ldapAuthServer: undefined,
        domainAuth: '',

        idpName: '',
        identityKey: ''
      },

      labelCol: { span: 7 },
      wrapperCol: { span: 17 },

      rules: {
        name: [{ required: true, message: this.$t('login.userName required') }, { validator: validateUserName }],
        email: [{ required: true, message: this.$t('userManagement.emailRequired') },
          { type: 'email', message: this.$t('valid.email') }],
        // ldapAuthServer: [{ required: true, message: this.$t('userManagement.ldapAuthServer required') }],
        domainAuth: [{ required: true, message: this.$t('userManagement.domainAuthentication required') }],
        idpName: [{ required: true, message: this.$t('userManagement.idpName required') }],
        identityKey: [{ required: true, message: this.$t('userManagement.identityKey required') }]
      }
    }
  },

  computed: {
    ...mapGetters(['activeCustomerId', 'authType', 'serverType'])
  },

  methods: {
    show() {
      this.visible = true
      if (this.authType === AUTH_TYPE.SSO) {
        this.getCustomer()
      }
      if (this.ldap) {
        this.getLdapServerList()
      }
    },
    resetIdentityKeyValidate() {
      this.$refs.identityKey.clearValidate()
    },
    getCustomer() {
      getCustomerIDPs(this.activeCustomerId).then(res => {
        const idps = res.idps.idp || []
        this.idpsNames = Array.isArray(idps) ? idps.map(item => item['idp-name']) : [idps].map(item => item['idp-name'])
      })
    },
    getLdapServerList() {
      getCustomerLDAPs(this.activeCustomerId).then(res => {
        const ldaps = this.serverType === this.SERVER_TYPE.OnPremise ? res['ldap-servers']['ldap-server'] || [] : res.ldaps.ldap || []
        Array.isArray(ldaps) ? this.server = ldaps : this.server.push(ldaps)
      }).catch(() => {})
    },

    onAddSaasUser() {
      this.$refs.addSaasUserForm.$children[0].validate(valid => {
        if (valid) {
          this.loading = true
          const { domainAuth, ldapAuthServer, identityKey, idpName, fullName, requestId, notification, ...rest } = { ...this.form }
          // const role = this.role.filter(item => item['role-name'] === this.form.role)

          const obj = {
            user: this.ldap
              ? {
                ...rest,
                'full-name': fullName,
                'request-id': requestId,
                'send-notification': notification,
                'is-active': true,
                'idp-name': idpName,
                'identity-key': identityKey,
                // role: role[0],
                'user-auth-data': {
                  'user-dn': domainAuth,
                  'user-id': 0,
                  'server-id': ldapAuthServer
                }
              }
              : {
                ...rest,
                'full-name': fullName,
                'request-id': requestId,
                'send-notification': notification,
                'is-active': true,
                'idp-name': idpName,
                'identity-key': identityKey,
                role: { 'role-name': 'Basic User', 'rol-id': 1 }
              }
          }

          addUser(obj).then(res => {
            const addSuccessUser = res.user
            this.visible = false
            this.loading = false
            this.$message.success(this.$t('userManagement.user add success'))
            this.$refs.addSaasUserForm.$children[0].resetFields()
            this.$emit('addSaased', addSuccessUser)
          }).catch(_ => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    },

    onCancel() {
      this.$refs.addSaasUserForm.$children[0].resetFields()
      this.visible = false
      this.server = []
    }
  }
}
</script>

<style>

</style>
