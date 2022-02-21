<template>
  <span class="mf-display-inherit">
    <icon-btn
      id="a-icon-deactive"
      :is-disabled="isDisabled"
      :icon-title="$t('userManagement.userToolBar.deactivateUser')"
      icon-style="icon-deactive"
      @onClick="onIconButton"
    />

    <modal-result
      :visible.sync="resultVisible"
      :result-list="resultUserList"
    />
  </span>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import ModalResult from '@/components/ModalResult/index'
import { deActiveUsers } from '@/api/user'
import { batchRequest } from '@/utils/packageRequest'
import toolbarMixin from '@/views/user/userToolBar/components/toolbarMixin'

export default {
  name: 'SetUnlock',
  components: { ModalResult, IconBtn },
  mixins: [toolbarMixin],
  props: {
    selectedUserList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
    }
  },
  computed: {
    isDisabled: function() {
      if (this.selectedUserList.length === 0) return true
      return this.selectedUserList.some(item => {
        return item['is-active'] === false
      })
    }
  },
  methods: {
    confirmSubmit() {
      return batchRequest(this.selectedUserList, (item, index) => {
        return deActiveUsers(item)
      }, this.$t('userManagement.userToolBar.deactivateSuccessMessage')).then(res => {
        this.resultMessage(res)
      })
    },

    onIconButton() {
      if (this.isDisabled) return

      this.$mfConfirm({
        title: this.$t('userManagement.userToolBar.deactivateUserTitle'),
        iconType: 'Warning',
        message: this.$t('userManagement.userToolBar.deactivateUserContent'),
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('OK'),
        onConfirm: this.confirmSubmit
      })
    }
  }
}
</script>

<style scoped>

</style>
