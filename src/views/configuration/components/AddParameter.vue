<template>
  <span class="mf-display-inherit">
    <icon-btn
      id="add_parameter"
      :icon-title="$t('configuration.AddNewParameter')"
      icon-style="icon-AddParameter"
      @onClick="show"
    />
    <mf-modal
      class="add-parameter-modal"
      :visible="visible"
      :confirm-loading="loading"
      @cancel="onCancel"
      @ok="onSubmit"
    >
      <span slot="title">
        {{ $t('configuration.AddNewParameter') }}
        <mf-help-btn :help="ADD_NEW_PARAMETER" />
      </span>
      <mf-form
        ref="addRef"
        :label-col="{ span: 7 }"
        :wrapper-col="{ span: 16 }"
        class="add-form"
        :rules="addRules"
        :model="addForm"
      >
        <a-form-model-item :label="$t('configuration.Parameter')" prop="name">
          <a-input id="add_parameter_name" v-model="addForm.name" :max-length="80" />
        </a-form-model-item>
        <a-form-model-item :label="$t('configuration.Value')" prop="value">
          <a-input id="add_parameter_value" v-model="addForm.value" :max-length="2000" @blur="addFormValue" />
        </a-form-model-item>
        <a-form-model-item :label="$t('configuration.Description')" prop="description">
          <a-textarea id="add_parameter_description" v-model="addForm.description" :auto-size="{ minRows: 3, maxRows: 6 }" />
        </a-form-model-item>
      </mf-form>
    </mf-modal>
  </span>
</template>

<script>

import IconBtn from '@/components/BtnIcon/index'
import { addConfigurationParameter } from '@/api/configuration'
import { validSpecialCharact1 } from '@/utils/validate'
import { ADD_NEW_PARAMETER } from 'config/help'

export default {
  name: 'AddParameter',
  components: { IconBtn },
  data() {
    return {
      ADD_NEW_PARAMETER,
      visible: false,
      loading: false,
      addForm: {
        name: '',
        value: '',
        description: ''
      },
      addRules: {
        name: [
          { required: true, message: this.$t('configuration.nameRulesMessage'), trigger: 'blur' },
          { validator: validSpecialCharact1 }
        ],
        value: [
          { required: true, message: this.$t('configuration.valueRulesMessage'), trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    show() {
      this.visible = true
    },
    addFormValue() {
      this.addForm.value = this.addForm.value.replace(/(^\s*)|(\s*$)/g, '')
    },
    onSubmit() {
      // add Submit
      this.$refs.addRef.$children[0].validate(valid => {
        if (valid) {
          this.loading = true
          addConfigurationParameter({
            'site-parameter': this.addForm
          }).then(response => {
            this.$message.success(this.$t('configuration.AddSuccess'))
            this.$emit('refreshTableData', response['site-parameter'].name)
            this.$refs.addRef.$children[0].resetFields()
            this.visible = false
            this.loading = false
            // Popup prompt when is-metadata is false
            if (!(response['site-parameter']['is-metadata'])) {
              this.$mfConfirm({
                title: this.$t('configuration.Information'),
                iconType: 'Information',
                message: this.$t('configuration.AddClues', { name: response['site-parameter'].name }),
                confirmText: this.$t('OK'),
                isShowCancel: false
              })
            }
          }).catch(() => {
            this.loading = false
          })
        }
      })
    },

    onCancel() {
      this.visible = false
      this.$refs.addRef.$children[0].resetFields()
    }
  }
}
</script>

<style scoped lang="less">
.add-parameter-modal /deep/ .ant-modal-body{
  padding-bottom: 0;
}

</style>

