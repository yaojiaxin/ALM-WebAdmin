<template>
  <span class="mf-display-inherit">
    <icon-btn
      id="delete_parameter"
      :icon-title="$t('Delete')"
      icon-style="icon-delete"
      :is-disabled="selectedParameter['is-system']===undefined?true:selectedParameter['is-system']"
      @onClick="show"
    />
  </span>
</template>

<script>

import IconBtn from '@/components/BtnIcon/index'
import { deleteConfigurationParameter } from '@/api/configuration'

export default {
  name: 'DeleteParameter',
  components: { IconBtn },
  props: {
    selectedParameter: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  computed: {
    isDisabled: function() {
      return Boolean(this.selectedParameter['is-system'])
    }
  },
  methods: {
    show() {
      this.$mfConfirm({
        title: this.$t('configuration.DeleteParameter'),
        message: this.$t('configuration.DeleteParameterContent', { name: this.selectedParameter.name }),
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('OK'),
        onConfirm: async() => {
          await deleteConfigurationParameter(this.selectedParameter).then(response => {
            this.$message.success(this.$t('configuration.DeleteSuccess'))
            this.$emit('refreshTableData')
          }).catch(() => {
          })
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
.mf-modal /deep/ .ant-modal-content{
  width: 434px;
}

</style>
