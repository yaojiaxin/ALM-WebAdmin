<template>
  <span class="disconnect-btn">
    <icon-btn
      id="a-icon-Disconnect"
      :is-disabled="empty"
      :icon-title="$t('monitoring.disconnect')"
      icon-style="icon-Disconnect"
      @onClick="onIconButton"
    />

  </span>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import { disconnectSessions } from '@/api/connection'

export default {
  components: { IconBtn },
  props: {
    empty: {
      type: Boolean,
      default: true
    },
    selected: {
      type: String,
      default: ''
    }
  },
  data() {
    return {

    }
  },
  methods: {
    disconnectSubmit() {
      // handle this.selected to seperate requests (domain/project/user)
      let selects = []
      // single choice
      if (!this.selected.includes(';')) {
        selects = [this.selected]
      } else {
        // multi choices
        selects = this.selected.split(';').slice(0, -1)
      }

      const promises = []
      selects.forEach(select => select !== '' && promises.push(disconnectSessions(`${select};`)))
      Promise.all(promises).then(res => {
        this.$message.success(this.$t('monitoring.disconnectSuccessfully'))
        this.$emit('endDisconnect')
        this.disconnectConfirm = false
      }).catch(console.log)
    },
    onIconButton() {
      this.$mfConfirm({
        title: this.$t('monitoring.confirm_disconnection'),
        message: this.$t('monitoring.disconnectContent'),
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('OK'),
        onConfirm: this.disconnectSubmit
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .disconnect-btn{
    width: 19px;
    height: 21px;
  }

</style>
