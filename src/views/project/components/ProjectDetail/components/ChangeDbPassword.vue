<template>
  <mf-modal
    id="project_change_db_password"
    :visible="visible"
    :confirm-loading="loading"
    width="435px"
    :ok-text="$t('OK')"
    @cancel="onCancel"
    @ok="onSave"
  >
    <span slot="title">
      {{ $t('project.changeDBPassword') }}
      <mf-help-btn :help="CHANGE_DB_PASSWORD" />
    </span>

    <mf-form
      ref="changePassword"
      :model="passwordForm"
      :rules="rules"
      :label-col="{ span: 9 }"
      :wrapper-col="{ span: 15 }"
    >
      <a-form-model-item :label="$t('newPassword')" prop="password">
        <a-input id="dbPassword" v-model.trim="passwordForm.password" type="password" :max-length="40" />
      </a-form-model-item>
      <a-form-model-item prop="rePassword" :label="$t('rePassword')">
        <a-input id="reDbPassword" v-model.trim="passwordForm.rePassword" type="password" :max-length="40" />
      </a-form-model-item>
    </mf-form>
  </mf-modal>
</template>

<script>
import { CHANGE_DB_PASSWORD } from 'config/help'
import { updateProject } from '@/api/project'
import { mapGetters } from 'vuex'
import { Encrypt } from '@/utils/forge'
// import { DEFAULT_PASSWORD } from '@/store/const'

export default {
  data() {
    const validPassword = (rule, value, callback) => {
      if (value !== this.passwordForm.password) {
        callback(new Error(this.$t('rePasswordError')))
      } else {
        callback()
      }
    }
    return {
      visible: false,
      loading: false,
      CHANGE_DB_PASSWORD,

      passwordForm: {
        password: '',
        rePassword: ''
      },

      rules: {
        // password: [{ required: true, message: this.$t('newPasswordRequired') }],
        rePassword: [{
          validator: validPassword
        }]
      }
    }
  },

  computed: {
    ...mapGetters(['selectTreeNode'])
  },

  methods: {
    onShow() {
      this.visible = true
      this.$store.dispatch('forge/getKey')
    },

    onCancel() {
      this.$refs.changePassword.$children[0].resetFields()
      this.visible = false
    },

    onSave() {
      this.$refs.changePassword.$children[0].validate(valid => {
        if (valid) {
          this.loading = true

          const selectTreeNode = this.selectTreeNode.data
          updateProject({
            domain: selectTreeNode['domain-name'],
            project: selectTreeNode.name,
            data: {
              'db-user-pass': this.passwordForm.password != null ? Encrypt(this.passwordForm.password) : ''
            }
          }).then(data => {
            this.loading = false
            this.visible = false
            this.$message.success(this.$t('project.change_db_pass_success'))
          }).catch(() => {
            this.loading = false
          }).finally(() => {
            this.$refs.changePassword.$children[0].resetFields()
          })
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
/deep/ .has-error .ant-form-explain {
  text-align: left;
}
</style>
