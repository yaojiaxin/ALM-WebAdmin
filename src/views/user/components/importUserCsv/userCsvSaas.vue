<template>
  <mf-form
    v-if="isShow"
    ref="csvSaasForm"
    :model="form"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
    :rules="rules"
  >
    <!-- name -->
    <a-form-model-item :label="$t('userManagement.UserName')" prop="name">
      <mf-select
        id="csv_name"
        v-model="form.name"
      >
        <a-select-option v-for="item in formData" :id="item" :key="item" :value="item">
          {{ item }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <!-- full name -->
    <a-form-model-item :label="$t('userManagement.FullName')" prop="fullName">
      <mf-select
        id="user_csv_fullName"
        v-model="form.fullName"
      >
        <a-select-option v-for="item in formData" :id="item" :key="item" :value="item">
          {{ item }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <!--    <a-form-model-item :label="$t('userManagement.Password')" prop="password">-->
    <!--      <mf-select-->
    <!--        id="user_csv_password"-->
    <!--        v-model="form.password"-->
    <!--      >-->
    <!--        <a-select-option v-for="item in formData" :id="item" :key="item" :value="item">-->
    <!--          {{ item }}-->
    <!--        </a-select-option>-->
    <!--      </mf-select>-->
    <!--    </a-form-model-item>-->

    <!-- email -->
    <a-form-model-item :label="$t('userManagement.Email')" prop="email">
      <mf-select
        id="user_csv_email"
        v-model="form.email"
      >
        <a-select-option v-for="item in formData" :id="item" :key="item" :value="item">
          {{ item }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <!-- phone -->
    <a-form-model-item :label="$t('userManagement.Phone')" prop="phone">
      <mf-select
        id="user_csv_phone"
        v-model="form.phone"
      >
        <a-select-option v-for="item in formData" :id="item" :key="item" :value="item">
          {{ item }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <!-- description -->
    <a-form-model-item :label="$t('userManagement.Description')" prop="description">
      <mf-select
        id="user_csv_description"
        v-model="form.description"
      >
        <a-select-option v-for="item in formData" :id="item" :key="item" :value="item">
          {{ item }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <!-- request id -->
    <a-form-model-item :label="$t('userManagement.RequestID')" prop="requestId">
      <mf-select
        id="user_csv_requestId"
        v-model="form.requestId"
      >
        <a-select-option v-for="item in formData" :id="item" :key="item" :value="item">
          {{ item }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <!-- saas and LDAP -->
    <!-- ldap server -->
    <a-form-model-item v-if="isLdap" :label="$t('userManagement.ldapAuthServer')" prop="ldapAuthServer">
      <mf-select
        id="user_csv_ldapServer"
        v-model="form.ldapAuthServer"
      >
        <a-select-option v-for="item in formData" :id="item" :key="item" :value="item">
          {{ item }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <!-- ldap domain -->
    <a-form-model-item v-if="isLdap" :label="$t('userManagement.domainAuthentication')" prop="domainAuth">
      <mf-select
        id="user_csv_ldapDomain"
        v-model="form.domainAuth"
      >
        <a-select-option v-for="item in formData" :id="item" :key="item" :value="item">
          {{ item }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <!-- saas and sso -->
    <!-- idp id -->
    <a-form-model-item v-if="authType===AUTH_TYPE.SSO" :label="$t('userManagement.idpName')" prop="idpName">
      <mf-select
        id="user_csv_idpId"
        v-model="form.idpName"
      >
        <a-select-option v-for="item in formData" :id="item" :key="item" :value="item">
          {{ item }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <!-- identity key -->
    <a-form-model-item v-if="authType===AUTH_TYPE.SSO" :label="$t('userManagement.Identity Key')" prop="identityKey">
      <mf-select
        id="user_csv_identityKey"
        v-model="form.identityKey"
      >
        <a-select-option v-for="item in formData" :id="item" :key="item" :value="item">
          {{ item }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <a-form-model-item prop="notification">
      <a-checkbox id="user_csv_notification" :checked="form.notification" @change="form.notification=!form.notification">{{ $t('userManagement.sendNotifications') }}</a-checkbox>
    </a-form-model-item>

    <a-form-model-item prop="isUpdate">
      <a-checkbox id="user_csv_isUpdaten" :checked="form.isUpdate" @change="form.isUpdate=!form.isUpdate">{{ $t('userManagement.UserUpdateAllowed') }}</a-checkbox>
    </a-form-model-item>
  </mf-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { AUTH_TYPE } from '@/store/const.js'
import { isLDAP } from '@/utils/permission.js'

export default {
  name: 'CsvSaasForm',
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    isSaving: {
      type: Boolean,
      default: false
    },

    formData: {
      type: Array,
      default: function() {
        return []
      }
    }
  },

  data() {
    return {
      AUTH_TYPE,

      form: {
        name: '',
        fullName: undefined,
        // password: undefined,
        email: '',
        phone: undefined,
        description: undefined,
        requestId: undefined,
        notification: false,
        isUpdate: false,

        ldapAuthServer: '',
        domainAuth: '',

        idpName: '',
        identityKey: ''
      },

      labelCol: { span: 7 },
      wrapperCol: { span: 17 },

      rules: {
        name: [{ required: true, message: this.$t('login.userName required') }],
        email: [{ required: true, message: this.$t('userManagement.emailRequired') }],

        // ldap
        // ldapAuthServer: [{ required: true, message: this.$t('userManagement.ldapAuthServer required') }],
        domainAuth: [{ required: true, message: this.$t('userManagement.domainAuthentication required') }],

        // sso
        idpName: [{ required: true, message: this.$t('userManagement.idpName required') }],
        identityKey: [{ required: true, message: this.$t('userManagement.identityKey required') }]
      }
    }
  },

  computed: {
    ...mapGetters(['authType']),
    isLdap() {
      return isLDAP()
    }
  },

  methods: {
    onAddusers() {
      this.$emit('update:isSaving', true)
      this.$emit('saveSaasForm', this.form)
    },
    resetForm() {
      const origin = {
        name: '',
        fullName: undefined,
        // password: undefined,
        email: '',
        phone: undefined,
        description: undefined,
        requestId: undefined,
        notification: false,
        isUpdate: false,

        ldapAuthServer: '',
        domainAuth: '',

        idpName: '',
        identityKey: ''
      }
      this.form = { ...origin }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
