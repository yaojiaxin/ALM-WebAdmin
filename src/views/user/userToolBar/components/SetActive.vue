<template>
  <span class="mf-display-inherit">
    <icon-btn
      id="a-icon-active"
      :is-disabled="isDisabled"
      :icon-title="$t('userManagement.userToolBar.activeUser')"
      icon-style="icon-active"
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
import { activeUsers } from '@/api/user'
import { batchRequest } from '@/utils/packageRequest'
import toolbarMixin from '@/views/user/userToolBar/components/toolbarMixin'

export default {
  name: 'SetActive',
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
        return item['is-active'] === true
      })
    }
  },
  methods: {
    confirmSubmit() {
      return batchRequest(this.selectedUserList, (item, index) => {
        return activeUsers(item)
      }, this.$t('userManagement.userToolBar.activeSuccessMessage')).then(res => {
        this.resultMessage(res)
      })
    },

    onIconButton() {
      if (this.isDisabled) return
      this.$mfConfirm({
        iconType: 'Warning',
        title: this.$t('userManagement.userToolBar.activeUserTitle'),
        message: this.$t('userManagement.userToolBar.activeUserContent'),
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
