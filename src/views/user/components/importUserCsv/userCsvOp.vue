<template>
  <mf-form
    v-if="isShow"
    ref="csvOpForm"
    :model="form"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
    :rules="rules"
    class="csv-opfrom"
  >
    <!-- name -->
    <a-form-model-item :label="$t('userManagement.UserName')" prop="name">
      <mf-select
        id="user_csv_username"
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
        id="user_csv_fullname"
        v-model="form.fullName"
      >
        <a-select-option v-for="item in formData" :id="item" :key="item" :value="item">
          {{ item }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <!-- email -->
    <a-form-model-item :label="$t('userManagement.Email')" prop="email">
      <mf-select
        id="user_csv_mail"
        v-model="form.email"
      >
        <a-select-option v-for="item in formData" :id="item" :key="item" :value="item">
          {{ item }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <!-- sso -->
    <!-- identity key -->
    <a-form-model-item v-if="authType===AUTH_TYPE.SSO" :label="$t('userManagement.Identity Key')" prop="identityKey">
      <mf-select
        id="user_csv_opidentityKey"
        v-model="form.identityKey"
      >
        <a-select-option v-for="item in formData" :id="item" :key="item" :value="item">
          {{ item }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <!-- idp provider name -->
    <a-form-model-item v-if="authType===AUTH_TYPE.SSO" :label="$t('userManagement.idpName')" prop="idpName">
      <mf-select
        id="user_csv_op_idpName"
        v-model="form.idpName"
      >
        <a-select-option v-for="item in formData" :id="item" :key="item" :value="item">
          {{ item }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>
    <!-- sso -->

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

    <!-- ldap -->
    <!-- ldap server -->
    <a-form-model-item v-if="isLdap" :label="$t('userManagement.ldapAuthServer')" prop="ldapAuthServer">
      <a-input id="user_add_ldapAuthServer" v-model="form.ldapAuthServer" :max-length="25" />
    </a-form-model-item>

    <!-- ldap domain -->
    <a-form-model-item v-if="isLdap" :label="$t('userManagement.domainAuthentication')" prop="domainAuth">
      <a-input id="user_add_domainAuth" v-model="form.domainAuth" :max-length="25" />
    </a-form-model-item>
  </mf-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { AUTH_TYPE } from '@/store/const.js'
import { isLDAP } from '@/utils/permission.js'

export default {
  name: 'CsvOpForm',
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
        email: undefined,
        phone: undefined,
        description: undefined,

        idpName: '',
        identityKey: '',

        ldapAuthServer: '',
        domainAuth: ''
      },

      labelCol: { span: 7 },
      wrapperCol: { span: 17 },

      rules: {
        name: [{ required: true, message: this.$t('login.userName required') }],
        // email: [{ type: 'email', message: this.$t('valid.email') }],

        // ldap
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
      this.$emit('saveOpForm', this.form)
    },
    resetForm() {
      const origin = {
        name: '',
        fullName: undefined,
        email: undefined,
        phone: undefined,
        description: undefined,

        idpName: '',
        identityKey: '',

        ldapAuthServer: '',
        domainAuth: ''
      }
      this.form = { ...origin }
    }
  }
}
</script>

<style lang="less" scoped>

.csv-opfrom /deep/ .ant-form-item {
  margin-bottom: 24px;
}
</style>
