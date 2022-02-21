<template>
  <div id="to_user_email">
    <mf-form
      id="to_user_form"
      ref="ruleForm"
      label-align="right"
      v-bind="formItemLayout"
      :model="ruleForm"
      :rules="rules"
      @click="onClose"
    >
      <a-form-model-item :label="$t('userManagement.recipientTitle')" prop="to" class="mf-margin-bottom">
        <a-input id="users_form_to" v-model="ruleForm.to" disabled />
      </a-form-model-item>
      <a-form-model-item
        :label="$t('userManagement.subject')"
        prop="subject"
        class="mf-margin-bottom"
      >
        <a-input id="users_form_subject" v-model="ruleForm.subject" />
      </a-form-model-item>
      <a-form-model-item
        :label="$t('message')"
        prop="message"
        class="mf-margin-bottom message-item"
      >
        <m-f-editor v-model="ruleForm.message" :menubar="false" :height="342" :width="593" />
      </a-form-model-item>
    </mf-form>
    <drawer-footer
      :form="ruleForm"
      :user="true"
      :submit="$t('userManagement.Send')"
      :cancel="$t('Cancel')"
      :is-change.sync="isChangeUser"
      @click="onClose"
    />
  </div>
</template>

<script>
import DrawerFooter from '@/views/user/components/SendEmail/components/DrawerFooter'
import MFEditor from '@/components/MFEditor/index'
import { isChangeObjorArr } from '@/utils'

export default {
  name: 'ToUsers',
  components: { DrawerFooter, MFEditor },
  props: {
    selectedUserList: {
      type: Array,
      default: function() {
        return []
      }
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ruleForm: {
        to: '',
        subject: '',
        message: ''
      },
      initForm: {},
      formItemLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
      },
      emails: [],
      isChangeUser: true,
      rules: {
        to: [{ required: true, message: this.$t('userManagement.Project_is_required') }],
        subject: [{ required: true, message: this.$t('userManagement.Subject_is_required') }]
      }
    }
  },
  watch: {
    ruleForm: {
      handler: function(form) {
        this.isChangeUser = isChangeObjorArr(form, this.initForm)
      },
      deep: true
    }
  },
  deactivated() {
    if (!this.isChangeUser && this.visible) {
      this.$message.warning(this.$t('warningNoSave'))
    }
  },
  mounted() {
    this.selectedUserList.forEach((item) => {
      this.ruleForm.to = this.ruleForm.to + `${item.name},`
      this.emails.push(item.email)
    })
    // this.ruleForm.message = this.emails[0]
    this.ruleForm.to = this.ruleForm.to.substring(0, this.ruleForm.to.length - 1)
    this.initForm = JSON.parse(JSON.stringify(this.ruleForm))
  },
  methods: {
    onClose() {
      this.$emit('onClosed')
    },

    // Verify that the input box is empty
    validateValue() {
      let bool
      this.$refs.ruleForm.$children[0].validate(valid => {
        valid ? bool = true : bool = false
      })
      return bool
    }
  }
}
</script>

<style lang="less" scoped>
.message-item{
  margin-top: 28px;
}
.mf-editor /deep/ .w-e-text-container{
  z-index: 0!important;
}
.mf-editor /deep/ .w-e-toolbar{
  z-index: 0!important;
}
</style>
