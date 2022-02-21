<template>
  <mf-drawer
    :visible="visible"
    width="760"
    @close="onCloseDrawer"
  >
    <span slot="title">
      {{ $t('configuration.EditParameter') }}
      <mf-help-btn :help="EDIT_PARAMETER" />
    </span>

    <mf-form
      ref="editRef"
      :model="editForm"
      :rules="ruleValidate"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 18 }"
    >
      <span class="mf-h5">{{ editForm.name }}</span>
      <a-form-model-item :label="$t('configuration.Value')" prop="value">
        <a-input id="add_parameter_value" ref="valueRef" v-model="editForm.value" :max-length="2000" :type="editForm['is-encrypted']?'password':''" @blur="addFormValue" />
      </a-form-model-item>
      <!--   is show password   -->
      <a-form-model-item v-show="editForm['is-encrypted']" prop="confirmValue" :label="$t('configuration.confirmValue')">
        <a-input id="add_parameter_confirm-value" v-model="editForm.confirmValue" :max-length="2000" type="password" />
      </a-form-model-item>
      <a-form-model-item :label="$t('userManagement.Description')" prop="description">
        <a-textarea
          id="add_parameter_description"
          v-model="editForm.description"
          auto-size
          style="min-height: 230px"
        />
      </a-form-model-item>
    </mf-form>

    <div v-show="visible" class="config-page-btns">
      <a-button id="parameter_edit_cancel" class="mf-btn-dashed" @click="onCloseDrawer">{{ $t("Cancel") }}</a-button>
      <a-button
        id="parameter_edit_save"
        type="primary"
        style="margin-left: 8px"
        :loading="isSavingLoading"
        :disabled="isChange"
        @click="onSubmitEdit"
      >
        {{ $t("Save") }}
      </a-button>
    </div>
  </mf-drawer>
</template>

<script>
import { editConfigurationParameter } from '@/api/configuration'
import { EDIT_PARAMETER } from 'config/help'
import { isChangeObjorArr } from '@/utils'

export default {
  name: 'EditParameter',
  data() {
    const isNull = 'null'
    const valueRulesValidate = (rule, value, callback) => {
      if (value.toLowerCase() === isNull) {
        callback(new Error(this.$t('configuration.valueRulesValidatorMessage')))
      } else {
        callback()
      }
    }
    // Verify duplicate password
    const validate = (rule, value, callback) => {
      if (value !== this.editForm.value) {
        callback(new Error(this.$t('configuration.validateMessage')))
      } else {
        callback()
      }
    }

    return {
      EDIT_PARAMETER,
      visible: false,
      item: '',
      isSavingLoading: false,
      ruleValidate: {
        value: [
          {
            required: true,
            message: this.$t('configuration.valueRulesMessage'),
            trigger: 'blur'
          },
          {
            validator: valueRulesValidate
          }
        ],
        confirmValue: [
          { required: true, validator: validate, trigger: 'blur' }
        ],
        description: []
      },
      isChange: true,
      editForm: {},
      initEditForm: {}
    }
  },
  watch: {
    editForm: {
      handler: function(form) {
        if (!this.editForm['is-encrypted']) {
          this.editForm.confirmValue = this.editForm.value
        }
        this.isChange = isChangeObjorArr(form, this.initEditForm)
      },
      deep: true
    }
  },
  methods: {
    show(item) {
      const ob = { ...item, confirmValue: '' }
      ob.value = ob['is-encrypted'] ? '' : item.value
      ob.confirmValue = ob['is-encrypted'] ? '' : item.value
      this.editForm = ob
      this.visible = true
      this.initEditForm = JSON.parse(JSON.stringify(this.editForm))
      this.$nextTick(() => {
        this.$refs.valueRef.focus()
      })
    },
    addFormValue() {
      this.editForm.value = this.editForm['is-encrypted'] ? this.editForm.value : String(this.editForm.value).replace(/(^\s*)|(\s*$)/g, '')
    },
    onCloseDrawer() {
      this.visible = false
      this.$refs.editRef.$children[0].resetFields()
      this.$emit('cancelSelected')
    },
    onSubmitEdit() {
      this.$refs.editRef.$children[0].validate(valid => {
        if (valid) {
          this.isSavingLoading = true
          editConfigurationParameter({
            'site-parameter': this.editForm
          }, this.editForm.name).then(() => {
            this.$emit('refresh')
            this.isSavingLoading = false
            this.$message.success(this.$t('configuration.EditSuccess'))
            this.visible = false
          }).catch(() => {
            this.isSavingLoading = false
            this.$emit('cancelSelected')
          }).finally(() => {
            this.isChange = true
          })
        } else {
          return false
        }
      })
    }
  }
}

</script>

<style scoped lang="less">
/deep/ .ant-drawer-wrapper-body {
  height: calc(100% - 122px);
}

.tree-user-hi{
  color: #656668;
}
.config-page-btns{
  display: flex;
  justify-content: flex-end;
  position: fixed;
  bottom: 0;
  right: 0;
  width: 760px;
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #DCDEDF;
}
</style>
