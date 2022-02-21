<template>
  <span>
    <icon-btn
      id="a-icon-SendMsg"
      :is-disabled="empty"
      :icon-title="$t('monitoring.send_message')"
      icon-style="icon-MonitoringSendMessage"
      @onClick="onIconButton"
    />

    <connected-send-msg ref="sendmsg" :send="users" :show="show" @refresh="refresh" />

  </span>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import ConnectedSendMsg from '@/views/monitoring/components/ConnectedSendMsg'

export default {
  components: { ConnectedSendMsg, IconBtn },
  props: {
    empty: {
      type: Boolean,
      default: true
    },
    users: {
      type: String,
      default: ''
    },
    show: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      disconnectConfirm: false
    }
  },
  methods: {
    onIconButton() {
      this.$refs.sendmsg.showSendMsg()
    },
    refresh() {
      this.$emit('refresh')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
