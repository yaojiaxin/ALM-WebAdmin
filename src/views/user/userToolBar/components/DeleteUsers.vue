<template>
  <span class="mf-display-inherit">
    <icon-btn
      id="a-icon-delete"
      :is-disabled="isDisabled"
      :icon-title="$t('userManagement.userToolBar.deleteUsers')"
      icon-style="icon-delete"
      @onClick="onIconButton"
    />

    <modal-result
      :visible.sync="resultVisible"
      :result-list="resultUserList"
      :is-show-cancel="false"
      :ok-text="$t('Close')"
    >
      <a-button id="export_after_delete_user" slot="footer" class="mf-btn-dashed" @click="successSubmit">{{ $t('userManagement.userToolBar.successSubmit') }}</a-button>
    </modal-result>
  </span>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import ModalResult from '@/components/ModalResult/index'
import { deleteUsers } from '@/api/user'
import { downloadCsv } from '@/utils/downloadCsv'
import { batchRequest } from '@/utils/packageRequest'
import toolbarMixin from '@/views/user/userToolBar/components/toolbarMixin'

export default {
  name: 'DeleteUsers',
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
        return deleteUsers(item.name)
      }, this.$t('userManagement.userToolBar.deleteSuccessMessage')).then(res => {
        this.resultMessage(res)
      })
    },

    onIconButton() {
      if (this.isDisabled) return
      this.$mfConfirm({
        title: this.$t('userManagement.userToolBar.deleteUserTitle'),
        iconType: 'Warning',
        message: this.$t('userManagement.userToolBar.deleteUserContent'),
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('Delete'),
        onConfirm: this.confirmSubmit
      })
    },
    successSubmit() {
      downloadCsv(this.resultUserList)
      this.resultVisible = false
    }
  }
}
</script>

<style scoped>

</style>
