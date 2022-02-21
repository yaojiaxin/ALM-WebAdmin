<template>
  <span class="mf-display-inherit">
    <icon-btn
      id="a-icon-password"
      :is-disabled="isDisabled"
      :icon-title="$t('userManagement.userToolBar.passWordReset')"
      icon-style="icon-password"
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
import { resetPassWord } from '@/api/user'
import { batchRequest } from '@/utils/packageRequest'
import toolbarMixin from '@/views/user/userToolBar/components/toolbarMixin'

export default {
  name: 'ResetPassword',
  components: { ModalResult, IconBtn },
  mixins: [toolbarMixin],
  props: {
    selectedUserList: {
      type: Array,
      default: function() {
        return []
      }
    },
    ldap: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    }
  },
  computed: {
    isDisabled: function() {
      return this.selectedUserList.length === 0 || this.ldap === true
    }
  },
  methods: {

    confirmSubmit() {
      return batchRequest(this.selectedUserList, (item, index) => {
        return resetPassWord(item)
      }, this.$t('userManagement.userToolBar.passWordResetSuccessMessage')).then(res => {
        this.resultMessage(res)
      })
    },

    onIconButton() {
      if (this.isDisabled) return
      this.$mfConfirm({
        title: this.$t('userManagement.userToolBar.passWordReset'),
        message: this.$t('userManagement.userToolBar.passWordResetContent'),
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
