<template>
  <span class="disconnect-btn">
    <icon-btn
      id="a-icon-SendProj"
      :icon-title="$t('monitoring.send_proj')"
      icon-style="icon-SendProj"
      @onClick="onIconButton"
    />

    <connected-projects ref="sendproj" :text="sendText" @onMsgOpen="onMsgOpen" />

    <connected-send-msg ref="sendmsg" />

  </span>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import ConnectedProjects from '@/views/monitoring/components/ConnectedProjects'
import ConnectedSendMsg from '@/views/monitoring/components/ConnectedSendMsg'

export default {
  components: { ConnectedProjects, IconBtn, ConnectedSendMsg },
  data() {
    return {
      sendText: this.$t('monitoring.send')
    }
  },
  methods: {
    onIconButton() {
      this.$refs.sendproj.show()
      this.$refs.sendproj.getDomainProjects()
    },
    onMsgOpen(sendToEmail, showSendProject) {
      this.$refs.sendmsg.sendMsgShow(sendToEmail, showSendProject)
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
