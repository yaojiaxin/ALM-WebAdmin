<template>
  <span class="mf-display-inherit">
    <icon-btn
      id="a-icon-calendar"
      :is-disabled="isDisabled"
      :icon-title="$t('userManagement.userToolBar.setDeactivationDate')"
      icon-style="icon-calendar"
      @onClick="onIconButton"
    />

    <modal-confirm
      :message-obj="MessageObj"
      :visible="confirmVisible"
      :loading="confirmLoading"
      @onSubmit="confirmSubmit"
      @onReturn="confirmReturn"
    >
      <div style="margin-top: 20px; margin-right: 100px">
        <mf-date-picker
          v-model="deActiveDate"
          :default-value="deActiveDate"
          :disabled-date="disabledDate"
          :placeholder="$t('userManagement.userToolBar.setDateTitle')"
          value-format="YYYY-MM-DD"
        />
      </div>
    </modal-confirm>

    <modal-result
      :visible.sync="resultVisible"
      :result-list="resultUserList"
    />
  </span>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import ModalConfirm from '@/components/ModalConfirm/index'
import ModalResult from '@/components/ModalResult/index'
import { editUserNoMessage } from '@/api/user'
import moment from 'moment'
import { batchRequest } from '@/utils/packageRequest'
import { isAllEqual } from '@/utils/index'
import toolbarMixin from '@/views/user/userToolBar/components/toolbarMixin'

export default {

  name: 'SetDeactivation',
  components: { ModalConfirm, ModalResult, IconBtn },
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
      confirmVisible: false,
      confirmLoading: false,
      deActiveDate: undefined
    }
  },
  computed: {
    MessageObj: function() {
      return {
        title: this.$t('userManagement.userToolBar.setDeactivationDateTitle'),
        content: this.$t('userManagement.userToolBar.setDeactivationDateContent'),
        successMessage: this.$t('userManagement.userToolBar.setDeactivationDateSuccessMessage'),
        discard: this.$t('Cancel'),
        onSubmit: this.$t('OK'),
        onSuccessSubmit: this.$t('OK')
      }
    },
    isDisabled: function() {
      if (this.selectedUserList.length === 0) { return true }
      return !this.selectedUserList.some(item => {
        return item['is-active'] === true
      })
    }
  },
  watch: {
    confirmVisible: function(visible) {
      if (!visible) return
      if (!this.selectedUserList) return
      const { selectedUserList } = this
      const { length } = selectedUserList
      const firstSelectedDate = selectedUserList[0]['expire-date']
      this.$nextTick(() => {
        if (length === 1) {
          this.deActiveDate = firstSelectedDate || undefined
        } else if (length > 1) {
          if (isAllEqual(selectedUserList, 'expire-date')) {
            this.deActiveDate = firstSelectedDate
          } else {
            this.deActiveDate = undefined
          }
        }
      })
    }
  },
  methods: {
    disabledDate(current) {
      // Can not select days before today and today
      return current && current < moment().endOf('day')
    },

    confirmSubmit() {
      this.confirmLoading = true
      const selectList = this.selectedUserList.filter(item => { return item['is-active'] }).map(item => {
        return {
          ...item,
          'expire-date': this.deActiveDate ? moment(this.deActiveDate).format('YYYY-MM-DD') : '',
          'user-auth-data': undefined
        }
      })
      return batchRequest(selectList, (item, index) => {
        return editUserNoMessage({
          user: item
        })
      }, this.$t('userManagement.userToolBar.setDeactivationDateSuccessMessage')).then(res => {
        this.confirmVisible = false
        this.confirmLoading = false
        this.resultMessage(res)
      })
    },

    confirmReturn() {
      this.confirmVisible = false
    },

    onIconButton() {
      if (this.isDisabled) return
      this.confirmVisible = true
      this.deActiveDate = undefined
    }
  }
}
</script>

<style scoped>

</style>
