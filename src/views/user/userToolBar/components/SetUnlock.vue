<template>
  <span class="mf-display-inherit">
    <icon-btn
      id="a-icon-unlock"
      :is-disabled="authType===AUTH_TYPE.SSO?true:isDisabled"
      :icon-title="$t('userManagement.userToolBar.unlock')"
      icon-style="icon-unlock"
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
import { userUnlock } from '@/api/user'
import { batchRequest } from '@/utils/packageRequest'
import { mapGetters } from 'vuex'
import { AUTH_TYPE } from '@/store/const.js'
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
      AUTH_TYPE
    }
  },
  computed: {
    ...mapGetters(['authType']),
    isDisabled: function() {
      if (this.selectedUserList.length === 0) return true
      return this.selectedUserList.some(item => {
        return item['is-locked'] === false
      })
    }
  },
  methods: {
    confirmSubmit() {
      return batchRequest(this.selectedUserList, (item, index) => {
        return userUnlock(item)
      }, this.$t('userManagement.userToolBar.unlockSuccessMessage')).then(res => {
        this.resultMessage(res)
      })
    },

    onIconButton() {
      if (this.isDisabled) return
      this.$mfConfirm({
        title: this.$t('userManagement.userToolBar.unlockTitle'),
        message: this.$t('userManagement.userToolBar.unlockContent'),
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
