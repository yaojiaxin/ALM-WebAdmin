<template>
  <span class="disconnect-btn">
    <icon-btn
      id="a-icon-DisconnectProj"
      :icon-title="$t('monitoring.disconnect_from_proj')"
      icon-style="icon-DisconnectProj"
      @onClick="onIconButton"
    />

    <connected-projects ref="disconnectproj" :text="disconnectText" @refresh="refresh" />

  </span>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import ConnectedProjects from '@/views/monitoring/components/ConnectedProjects'

export default {
  components: { ConnectedProjects, IconBtn },
  data() {
    return {
      disconnectConfirm: false,
      disconnectText: this.$t('monitoring.disconnect')
    }
  },
  computed: {

  },
  methods: {
    onIconButton() {
      this.$refs.disconnectproj.show()
      this.$refs.disconnectproj.getDomainProjects()
    },
    refresh() {
      this.$emit('refresh')
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
