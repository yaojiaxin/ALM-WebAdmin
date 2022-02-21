<template>
  <a-spin :spinning="userEditLoading">
    <mf-form
      id="edit_user_form"
      ref="editUserForm"
      :model="form"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-model-item :label="$t('userManagement.UserName')" prop="name">
            <a-input
              id="user_edit_name"
              v-model="form.name"
              :placeholder="$t('userManagement.Please enter')"
              :max-length="30"
              :disabled="true"
            />
          </a-form-model-item>
        </a-col>

        <a-col :span="12">
          <a-form-model-item :label="$t('userManagement.FullName')" prop="fullName" class="useredit-formitem">
            <a-input id="user_edit_fullName" v-model="form.fullName" :max-length="255" />
          </a-form-model-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-model-item :label="$t('userManagement.activationStatus')" prop="isActive">
            <a-radio-group
              id="user_edit_active"
              v-model="form.isActive"
              :disabled="!checkPermission(['MY_CUSTOMER_CONTEXT_USER_ACTIVATION_STATUS_UPDATE'],['SWITCHED_CUSTOMER_CONTEXT_USER_ACTIVATION_STATUS_UPDATE'])"
              name="isActive"
            >
              <a-radio id="user_edit_isactive" :value="true">
                {{ $t('userManagement.Active') }}
              </a-radio>
              <a-radio id="user_edit_isNotactive" :value="false">
                {{ $t('userManagement.Inactive') }}
              </a-radio>
            </a-radio-group>
          </a-form-model-item>
        </a-col>
        <a-col v-show="form.isActive" :span="12">
          <a-form-model-item :label="$t('userManagement.autoDeactivationDate')" prop="expireDate" class="useredit-formitem">
            <mf-date-picker
              id="user_edit_Autodiactive_date"
              v-model="form.expireDate"
              :default-value="form.expireDate"
              :disabled="!checkPermission(['MY_CUSTOMER_CONTEXT_USER_ACTIVATION_STATUS_UPDATE'],['SWITCHED_CUSTOMER_CONTEXT_USER_ACTIVATION_STATUS_UPDATE'])"
              :disabled-date="disabledDate"
              value-format="YYYY-MM-DD"
            />
          </a-form-model-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <!-- on saas -->
        <a-col v-serverType="[SERVER_TYPE.Saas]" :span="12">
          <a-form-model-item :label="$t('userManagement.locked')" prop="locked">
            <a-input
              id="user_edit_locked"
              v-model="form.locked"
              :max-length="30"
              :disabled="true"
            />
          </a-form-model-item>
        </a-col>
        <a-col v-serverType="[SERVER_TYPE.Saas]" :span="12">
          <a-form-model-item
            :label="$t('userManagement.role')"
            prop="role"
            :class="{ 'useredit-formitem': isSaas}"
          >
            <!-- <mf-select id="user_edit_role" v-model="form.role" v-serverType="[SERVER_TYPE.OnPremise]">
              <a-select-option id="select_role1" value="none">
                {{ $t('userManagement.none') }}
              </a-select-option>
              <a-select-option id="select_role2" value="admin">
                {{ $t('userManagement.site_admin') }}
              </a-select-option>
            </mf-select> -->
            <mf-select id="user_edit_saas_role" v-model="roleName" :disabled="roleDisabled">
              <!--            <mf-select id="user_edit_saas_role" v-model="roleName" :disabled="!checkPermission(['ADMIN_ACCESS']) || form.name === userName">-->
              <a-select-option v-for="item in role" :id="item['role-id']" :key="item['role-id']" :value="item['role-name']">
                <a-tooltip
                  :title="item['role-name']"
                >
                  {{ item['role-name'] }}
                </a-tooltip>
              </a-select-option>
            </mf-select>
          </a-form-model-item>
        </a-col>
      </a-row>

      <!-- IDP Formitem -->
      <a-row v-if="isSSO" :gutter="16">
        <a-col :span="12">
          <a-form-model-item
            :label="$t('userManagement.idpName')"
            prop="idpName"
          >
            <mf-select id="user_add_idpName" v-model="form.idpName" @change="resetIdentityKeyValidate">
              <a-select-option v-for="item in idpsNames" :id="item" :key="item" :value="item">
                {{ item }}
              </a-select-option>
            </mf-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item ref="identityKey" :label="$t('userManagement.identityKey')" :prop="form.idpName==='local'?'':'identityKey'" class="useredit-formitem">
            <a-input v-model="form.identityKey" :max-length="120" />
          </a-form-model-item>
        </a-col>
      </a-row>

      <!-- LDAP Formitem -->
      <a-row v-if="ldap" :gutter="16">
        <a-col :span="12">
          <a-form-model-item :label="$t('userManagement.ldapAuthServer')" prop="ldapAuthServer">
            <mf-select
              v-if="isOp"
              id="user_add_op_las"
              v-model="form.ldapAuthServer"
              :allow-clear="false"
            >

              <a-select-option v-for="item in server" :id="item['ldap-id']" :key="item['ldap-id']" :value="item['ldap-id']">
                {{ item.label }}
              </a-select-option>
            </mf-select>

            <mf-select
              v-if="isSaas"
              id="user_add_op_las"
              v-model="form.ldapAuthServer"
              :allow-clear="false"
            >
              <a-select-option v-for="item in server" :id="item['ldap-id']" :key="item['ldap-id']" :value="item['ldap-id']">
                {{ item['ldap-name'] }}
              </a-select-option>
            </mf-select>

          </a-form-model-item>
        </a-col>
        <a-col :span="12">

          <a-form-model-item :label="$t('userManagement.domainAuthentication')" prop="domainAuth">
            <a-input id="user_add_domainAuth" v-model="form.domainAuth" :max-length="120" />
          </a-form-model-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-model-item
            :label="$t('userManagement.Email')"
            prop="email"
            :rules="[
              { required: isSaas, message: $t('valid.emailRequired')},
              { type: 'email', message: $t('valid.email') }]"
          >
            <a-input id="user_edit_email" v-model="form.email" :max-length="85" :disabled="compareRoleId" />
          </a-form-model-item>
        </a-col>

        <a-col :span="12">
          <a-form-model-item :label="$t('userManagement.Phone')" prop="phone" class="useredit-formitem">
            <a-input id="user_edit_phone" v-model="form.phone" :max-length="25" />
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <!--        <a-col v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_POLICY_SET'],['SWITCHED_CUSTOMER_CONTEXT_USER_POLICY_SET'])" :span="12">-->
        <a-col :span="12">
          <a-form-model-item :label="$t('userManagement.policy')" prop="policy">
            <mf-select
              id="user_edit_policy"
              v-model="form.policy"
              :disabled="!(checkPermission(
                ['ADMIN_ACCESS'],
              )||checkPermission(
                ['MY_CUSTOMER_CONTEXT_USER_POLICY_SET'],
                ['SWITCHED_CUSTOMER_CONTEXT_USER_POLICY_SET'],
              )) || (roleId === 2 && clickRoleId === 10)"
            >
              <a-select-option
                v-for="item in policy"
                :id="item['policy-name']"
                :key="item['policy-id']"
                :value="item['policy-name']"
              >
                {{ item['policy-name'] }}
              </a-select-option>
            </mf-select>
          </a-form-model-item>
        </a-col>

        <a-col v-serverType="[SERVER_TYPE.OnPremise]" :span="12">
          <a-form-model-item :label="$t('userManagement.role')" prop="role" class="useredit-formitem">
            <mf-select id="user_edit_op_role" v-model="roleName" :disabled="roleDisabled">
              <a-select-option v-for="item in role" :id="item['role-id']" :key="item['role-id']" :value="item['role-name']">
                {{ item['role-name'] }}
              </a-select-option>
            </mf-select>
          </a-form-model-item>
        </a-col>

        <!-- <a-col v-serverType="[SERVER_TYPE.Saas]" :span="12">
          <a-form-model-item :label="$t('userManagement.Customer')" prop="customer">
            <mf-select id="ud_saas_customer" v-model="form.customer">
              <a-select-option id="uds_customer_option1" value="1">
                customer
              </a-select-option>
            </mf-select>
          </a-form-model-item>
        </a-col> -->
      </a-row>

      <!-- <a-row :gutter="16">
        <a-col :span="12">
          <a-form-model-item :label="$t('administrator')" prop="isAdmin">
            <a-radio-group id="user_detail_siteadmin" v-model="form.isAdmin">
              <a-radio id="ud_siteadmin_options1" :value="1">
                {{ $t('yes') }}
              </a-radio>
              <a-radio id="ud_siteadmin_options2" :value="2">
                {{ $t('no') }}
              </a-radio>
            </a-radio-group>
          </a-form-model-item>
        </a-col>
      </a-row> -->

      <a-form-model-item
        :label="$t('userManagement.Description')"
        prop="description"
        class="description-formitem"
      >
        <a-textarea id="user_edit_description" v-model="form.description" :max-length="1000" :auto-size="{ minRows: 4, maxRows: 8 }" />
      </a-form-model-item>
    </mf-form>
  </a-spin>
</template>

<script>
import { getUser, editUser } from '@/api/user'
import moment from 'moment'
import { SERVER_TYPE, AUTH_TYPE, ROLE } from '@/store/const.js'
import { mapGetters } from 'vuex'
import { getLocalStorage } from '@/utils/auth'
import { isCustomerAdmin, isSiteAdmin } from '@/utils/permission'
import { getAllIDPsOp, getCustomerIDPs } from '@/api/customers'
import { isChangeObjorArr, errorMessage } from '@/utils'

export default {
  props: {
    isEdit: { // whether the form is editable
      type: Boolean,
      default: false
    },

    isSaving: {
      type: Boolean,
      default: false
    },

    isChange: {
      type: Boolean,
      default: true
    },

    userEditLoading: {
      type: Boolean,
      default: false
    },
    ldap: {
      type: Boolean,
      default: false
    },
    role: {
      type: Array,
      default: () => []
    },
    policy: {
      type: Array,
      default: () => []
    },
    server: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      isCustomerAdmin,
      userName: getLocalStorage('ALM_UserName'),
      SERVER_TYPE,
      AUTH_TYPE,
      loading: false,
      visible: false,

      roleName: undefined,
      clickRoleId: '',
      idpsNames: [],
      form: {
        name: '',
        fullName: '',
        email: '',
        phone: '',
        description: '',
        isActive: true,
        locked: '',
        expireDate: undefined,
        idpName: '',
        identityKey: '',
        ldapAuthServer: undefined,
        ldapAuthServerNoName: undefined,
        domainAuth: '',
        // isAdmin: 2,
        customer: undefined,
        policy: undefined
      },
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },

      initForm: {},
      initRoleName: undefined,
      isFormNoChange: true,
      isRoleNameNoChange: true,

      rules: {
        name: [{ required: true, message: this.$t('login.userName required') }],
        domainAuth: [{ required: true, message: this.$t('userManagement.domainAuthentication required') }],
        idpName: [{ required: true, message: this.$t('userManagement.idpName required') }],
        identityKey: [{ required: true, message: this.$t('userManagement.identityKey required') }]
      },

      disabledDate(current) {
        return current && current < moment().endOf('day')
      }

    }
  },
  computed: {
    ...mapGetters(['serverType', 'activeCustomerId', 'authType', 'roleId', 'authenticationType']),

    isOp() {
      return this.serverType === SERVER_TYPE.OnPremise
    },
    readonly() {
      return !this.isEdit
    },
    roleDisabled() {
      if (this.isSaas) {
        return !(this.checkPermission(['ADMIN_ACCESS']) && this.clickRoleId !== ROLE.SiteAdmin)
      } else {
        if (isSiteAdmin()) {
          if (this.userName.toUpperCase() === this.form.name.toUpperCase()) { // op sa cannot remove self role
            return true
          } else {
            return !this.checkPermission(['ADMIN_ACCESS'])
          }
        } else {
          return !(this.checkPermission(['ADMIN_ACCESS']) && this.clickRoleId !== ROLE.SiteAdmin)
        }
      }
    },

    isSaas() {
      return this.serverType === SERVER_TYPE.Saas
    },

    isSSO() {
      return this.authType === AUTH_TYPE.SSO
    },
    compareRoleId() {
      if (this.roleId === 10) {
        return false
      } else if (this.roleId === 2 && this.clickRoleId === 10) {
        return true
      } else return (this.roleId !== 2 && this.roleId !== 10) && (this.clickRoleId === 2 || this.clickRoleId === 10)
    },
    isChangeEdit() {
      return this.isFormNoChange && this.isRoleNameNoChange
    }
  },

  watch: {
    form: {
      handler: function(form) {
        const { initForm } = this
        form.expireDate = form.expireDate ? moment(form.expireDate).format('YYYY-MM-DD') : ''
        initForm.expireDate = initForm.expireDate ? moment(initForm.expireDate).format('YYYY-MM-DD') : ''
        this.isFormNoChange = isChangeObjorArr(form, this.initForm)
      },
      deep: true
    },
    roleName: function(name) {
      this.isRoleNameNoChange = name + '' === this.initRoleName + ''
    },
    isChangeEdit: function(change) {
      this.$emit('update:isChange', change)
    },
    server: function(arr) {
      if (!arr.find(item => item['ldap-id'] === this.form.ldapAuthServer)) {
        this.form.ldapAuthServer = ''
      }
    }
  },

  methods: {
    resetIdentityKeyValidate() {
      this.$refs.identityKey.clearValidate()
    },
    getCustomer() {
      if (this.authType === AUTH_TYPE.SSO) {
        if (this.serverType === SERVER_TYPE.OnPremise) {
          getAllIDPsOp().then(res => {
            const idps = res.idps.idp || []
            this.idpsNames = Array.isArray(idps) ? idps.map(item => item['idp-name']) : [idps].map(item => item['idp-name'])
          })
        } else if (this.serverType === SERVER_TYPE.Saas) {
          getCustomerIDPs(this.activeCustomerId).then(res => {
            const idps = res.idps.idp || []
            this.idpsNames = Array.isArray(idps) ? idps.map(item => item['idp-name']) : [idps].map(item => item['idp-name'])
          })
        }
      }
    },
    async getUserDetail(userName) {
      this.$emit('update:userEditLoading', true)
      await this.getCustomer()
      getUser(userName).then(data => {
        const { user } = data
        this.$nextTick(() => {
          this.form.name = user.name
          this.form.isActive = user['is-active']
          this.form.locked = user['is-locked'] === true ? 'Yes' : 'No'
          this.form.fullName = user['full-name']
          this.form.email = user.email
          this.form.phone = user.phone
          this.form.description = user.description
          this.form.expireDate = user['expire-date'] ? user['expire-date'] : undefined
          this.roleName = user.role ? user.role['role-name'] : undefined
          this.clickRoleId = user.role ? user.role['role-id'] : ''
          this.form.policy = user.policy['policy-name']
          this.form.idpName = (user['idp-name'] === '' || this.idpsNames.find(item => item === user['idp-name'])) ? user['idp-name'] : (user['idp-name'] + this.$t('userManagement.idpNameInvalid'))
          this.form.identityKey = user['identity-key']
          this.form.ldapAuthServer = user?.['user-auth-data']?.['server-id']
          if (this.form.ldapAuthServer === -1 || this.form.ldapAuthServer === -2 || !this.server.find(item => item['ldap-id'] === this.form.ldapAuthServer)) {
            this.form.ldapAuthServer = ''
          }
          this.form.ldapAuthServerNoName = user?.['user-auth-data']?.['server-id']
          this.form.domainAuth = user?.['user-auth-data']?.['user-dn']
          this.initForm = JSON.parse(JSON.stringify(this.form))
          this.initRoleName = this.roleName
        })
        this.$emit('update:userEditLoading', false)
      }).catch(e => {
        errorMessage(e.QCRestException.Title, e.QCRestException.StackTrace)
        this.$emit('update:userEditLoading', false)
      })
    },

    onResetForm() {
      this.roleName = undefined
      this.initRoleName = undefined
      this.$refs.editUserForm.$children[0].resetFields()
    },

    onSaveForm(userId) {
      this.$refs.editUserForm.$children[0].validate(valid => {
        if (valid) {
          this.$emit('update:isSaving', true)
          const { expireDate, fullName, isActive, policy, idpName, identityKey, ldapAuthServer, ldapAuthServerNoName, domainAuth, ...rest } = { ...this.form }
          const role = this.role.find(item => item['role-name'] === this.roleName)
          const poliyItem = this.policy.find(item => item['policy-name'] === policy)
          editUser({
            user: {
              ...rest,
              'idp-name': idpName.replace(this.$t('userManagement.idpNameInvalid'), ''),
              'identity-key': identityKey,
              'full-name': fullName,
              'expire-date': expireDate ? moment(expireDate).format('YYYY-MM-DD') : '',
              'is-active': isActive,
              policy: poliyItem || {},
              role: role || { 'role-id': '' },
              'user-auth-data': {
                'server-id': ldapAuthServer === '' ? ldapAuthServerNoName : ldapAuthServer,
                'user-dn': domainAuth,
                'user-id': userId
              }
            }
          }).then(_ => {
            this.$emit('update:isSaving', false)
            this.$emit('saved')
            this.$message.success(this.$t('userManagement.user edit success'))
          }).catch(_ => {
            this.$emit('update:isSaving', false)
          })
        }
      })
    }
  }
}
</script>

<style>
.useredit-formitem, .description-formitem{
  display: flex;
}
.useredit-formitem .ant-form-item-label{
  width: 160px;
}
.description-formitem .ant-form-item-label{
  width: 130px;
}
.useredit-formitem .ant-form-item-control-wrapper, .description-formitem .ant-form-item-control-wrapper{
  flex: 1;
}

</style>
