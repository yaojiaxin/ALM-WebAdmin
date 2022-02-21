<template>
  <span class="mf-display-inherit">
    <icon-btn
      id="a-icon-lock"
      :is-disabled="isDisabled"
      :icon-title="$t('userManagement.userToolBar.Lock')"
      icon-style="icon-Lock"
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
import { userLock } from '@/api/user'
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
      return this.selectedUserList.length === 0
    }
  },
  methods: {

    confirmSubmit() {
      return batchRequest(this.selectedUserList, (item, index) => {
        item.isActive = false
        return userLock(item)
      }, this.$t('userManagement.userToolBar.lockSuccessMessage')).then(res => {
        this.resultMessage(res)
      })
    },

    onIconButton() {
      if (this.isDisabled) return
      this.$mfConfirm({
        title: this.$t('userManagement.userToolBar.lockTitle'),
        message: this.$t('userManagement.userToolBar.lockContent'),
        iconType: 'Warning',
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
