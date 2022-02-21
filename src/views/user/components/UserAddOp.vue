<template>
  <mf-modal
    id="user_add_modal"
    :visible="visible"
    :confirm-loading="loading"
    width="800px"
    @cancel="onCancel"
    @ok="onAddUser"
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
      id="user_add_modal_form"
      ref="addUserForm"
      :model="form"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :rules="rules"
    >
      <a-form-model-item :label="$t('userManagement.UserName')" prop="name">
        <a-input id="user_add_name" v-model="form.name" :placeholder="$t('userManagement.Please enter')" :max-length="60" />
      </a-form-model-item>

      <a-form-model-item :label="$t('userManagement.FullName')" prop="fullName">
        <a-input id="user_add_fullName" v-model="form.fullName" :max-length="255" />
      </a-form-model-item>

      <!-- on-premise and sso -->
      <a-form-model-item v-if="authType===AUTH_TYPE.SSO" :label="$t('userManagement.idpName')" prop="idpName">
        <mf-select
          id="user_add_idpName"
          v-model="form.idpName"
          @change="resetIdentityKeyValidate"
        >
          <a-select-option v-for="item in idpsNames" :id="item" :key="item" :value="item">
            {{ item }}
          </a-select-option>
        </mf-select>
      </a-form-model-item>

      <!--      <a-form-model-item v-if="authType===AUTH_TYPE.SSO" :label="$t('userManagement.idpName')" prop="idpName">-->
      <!--        <a-input id="user_add_idpName" v-model="form.idpName" :max-length="25" />-->
      <!--      </a-form-model-item>-->

      <a-form-model-item v-if="authType===AUTH_TYPE.SSO" ref="identityKey" :label="$t('userManagement.identityKey')" :prop="form.idpName==='local'?'': 'identityKey'">
        <a-input id="user_add_identityKey" v-model="form.identityKey" :max-length="120" />
      </a-form-model-item>

      <!-- on-premise and LDAP -->
      <a-form-model-item v-if="ldap" :label="$t('userManagement.ldapAuthServer')" prop="ldapAuthServer">
        <mf-select id="user_add_op_las" v-model="form.ldapAuthServer">
          <a-select-option v-for="item in server" :id="item['ldap-id']" :key="item['ldap-id']" :value="item['ldap-id']">
            {{ item.label }}
          </a-select-option>
        </mf-select>
      </a-form-model-item>

      <a-form-model-item v-if="ldap" :label="$t('userManagement.domainAuthentication')" prop="domainAuth">
        <a-input id="user_add_domainAuth" v-model="form.domainAuth" :max-length="120" />
      </a-form-model-item>

      <a-form-model-item :label="$t('userManagement.Email')" prop="email">
        <a-input id="user_add_email" v-model="form.email" :max-length="254" />
      </a-form-model-item>

      <a-form-model-item :label="$t('userManagement.Phone')" prop="phone">
        <a-input id="user_add_phone" v-model="form.phone" :max-length="25" />
      </a-form-model-item>

      <a-form-model-item :label="$t('userManagement.Description')" prop="description">
        <a-textarea id="user_add_description" v-model="form.description" :max-length="1000" :auto-size="{ minRows: 3, maxRows: 6 }" />
      </a-form-model-item>

      <!--      <a-form-model-item :label="$t('userManagement.role')" prop="role">-->
      <!--        <mf-select id="uas_role" v-model="form.role">-->
      <!--          <a-select-option v-for="item in role" :id="item['role-id']" :key="item['role-id']" :value="item['role-name']">-->
      <!--            {{ item['role-name'] }}-->
      <!--          </a-select-option>-->
      <!--        </mf-select>-->
      <!--      </a-form-model-item>-->
    </mf-form>
  </mf-modal>
</template>

<script>
import { addUser } from '@/api/user'

import { mapGetters } from 'vuex'
import { ADD_USER } from 'config/help.js'
import { AUTH_TYPE, SERVER_TYPE } from '@/store/const.js'
import { getAllIDPsOp, getAllLDAPOp } from '@/api/customers'

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

      loading: false,
      visible: false,
      idpsNames: [],
      server: [],
      SERVER_TYPE,

      ADD_USER,

      form: {
        name: '',
        fullName: '',

        idpName: '',
        identityKey: '',

        ldapAuthServer: undefined,
        domainAuth: '',

        email: '',
        phone: '',
        description: ''
        // role: undefined
      },

      labelCol: { span: 7 },
      wrapperCol: { span: 17 },

      rules: {
        name: [{ required: true, message: this.$t('login.userName required') }, { validator: validateUserName }],
        email: [{ type: 'email', message: this.$t('valid.email') }],
        idpName: [{ required: true, message: this.$t('userManagement.idpName required') }],
        identityKey: [{ required: true, message: this.$t('userManagement.identityKey required') }],
        domainAuth: [{ required: true, message: this.$t('userManagement.domainAuthentication required') }]
      }
    }
  },

  computed: {
    ...mapGetters(['authType', 'serverType'])
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
      getAllIDPsOp().then(res => {
        const idps = res.idps.idp || []
        this.idpsNames = Array.isArray(idps) ? idps.map(item => item['idp-name']) : [idps].map(item => item['idp-name'])
      })
    },
    getLdapServerList() {
      getAllLDAPOp().then(res => {
        const ldaps = this.serverType === this.SERVER_TYPE.OnPremise ? res['ldap-servers']['ldap-server'] || [] : res.ldaps.ldap || []
        Array.isArray(ldaps) ? this.server = ldaps : this.server.push(ldaps)
      }).catch(() => {})
    },

    onAddUser() {
      this.$refs.addUserForm.$children[0].validate(valid => {
        if (valid) {
          this.loading = true
          const { domainAuth, ldapAuthServer, identityKey, idpName, fullName, ...rest } = { ...this.form }
          // const role = this.role.filter(item => item['role-name'] === this.form.role)
          const obj = {
            user: this.ldap
              ? {
                ...rest,
                'full-name': fullName,
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
                'is-active': true,
                'idp-name': idpName,
                'identity-key': identityKey
                // role: role[0]
              }
          }
          addUser(obj).then(res => {
            const addSuccessUser = res.user
            this.visible = false
            this.loading = false
            this.$message.success(this.$t('userManagement.user add success'))
            this.$refs.addUserForm.$children[0].resetFields()
            this.$emit('added', addSuccessUser)
          }).catch(_ => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    },

    onCancel() {
      this.$refs.addUserForm.$children[0].resetFields()
      this.visible = false
      this.server = []
    }
  }
}
</script>

<style>

</style>
