<template>
  <modal-confirm
    id="add_ldap_modal"
    :has-icon="false"
    :message-obj="MessageObj"
    :visible="confirmVisible"
    :loading="confirmLoading"
    @onSubmit="onSubmitClick"
    @onReturn="isShow"
  >
    <mf-form
      id="add_ldap_form"
      ref="createRef"
      label-align="right"
      :model="createForm"
      class="general-setting-form"
      layout="horizontal"
      v-bind="formItemLayout"
      :rules="addRules"
    >
      <a-form-model-item :label="$t('userManagement.serverTitle')" prop="label">
        <a-input id="rule_form_name" v-model="createForm.label" />
      </a-form-model-item>

      <a-form-model-item prop="server">
        <span slot="label">
          {{ $t('userManagement.directoryProviderUrl') }}
        </span>
        <a-input id="rule_form_URL" v-model="createForm.server" @blur="urlNotSpace" />
      </a-form-model-item>
    </mf-form>

  </modal-confirm>
</template>
<script>
import ModalConfirm from '@/components/ModalConfirm/index'
// eslint-disable-next-line no-unused-vars
import { LDAP_DEFAULT_VALUES, LDAP_DEFAULT_VALUES_LDAP } from '@/store/const'
export default {

  name: 'AddLdapModal',
  components: { ModalConfirm },

  data() {
    return {
      confirmLoading: false,
      confirmVisible: false,
      MessageObj: {
        title: this.$t('userManagement.NewLdapServer'),
        content: '',
        successMessage: '',
        discard: this.$t('Cancel'),
        onSubmit: this.$t('OK'),
        onSuccessSubmit: this.$t('OK')
      },
      createForm: {
        label: '',
        server: ''
      },
      addRules: {
        server: [{ required: true, message: this.$t('LabelName_is_required', { labelName: this.$t('userManagement.directoryProviderUrl') }), trigger: 'blur' }],
        label: [{ required: true, message: this.$t('LabelName_is_required', { labelName: this.$t('userManagement.serverTitle') }), trigger: 'blur' }]
      },
      formItemLayout: {
        labelCol: { span: 10 },
        wrapperCol: { span: 14 }
      }
    }
  },
  methods: {
    isShow() {
      this.confirmVisible = !this.confirmVisible
      this.createForm = this.confirmVisible ? { label: '', server: '' } : this.createForm
    },
    urlNotSpace() {
      this.createForm.server = this.createForm.server.replace(/\s*/g, '')
    },
    onSubmitClick() {
      this.$refs.createRef.$children[0].validate(valid => {
        if (valid) {
          const defaultRuleForm = {
            ...LDAP_DEFAULT_VALUES,
            ...this.createForm
          }
          defaultRuleForm['search-criteria']['user-name'] = LDAP_DEFAULT_VALUES_LDAP
          this.$emit('addServer', defaultRuleForm)
          this.isShow()
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
</style>
