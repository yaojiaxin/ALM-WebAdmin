<template>
  <div class="app-servers-tools-bar">
    <!-- refresh -->
    <icon-btn
      id="app-servers-refresh-btn"
      class="icon-btn-style"
      :is-disabled="false"
      :icon-title="$t('refresh')"
      icon-style="icon-refresh"
      @onClick="onRefresh"
    />
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index.vue'

export default {
  components: { IconBtn },

  emits: ['trigger:refresh'],

  methods: {
    onRefresh() {
      this.$emit('trigger:refresh')
    }
  }
}
</script>

<style scoped lang="less">
.app-servers-tools-bar {
  height: 57px;
  line-height: 57px;
  border-bottom: solid 1px rgba(101, 102, 104, 0.16);

  .icon-btn-style {
    margin: 0 0 0 19px;
  }
}
</style>
