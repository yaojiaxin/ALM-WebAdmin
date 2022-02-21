<template>
  <a
    class="mf-help"
    target="_blank"
    :title="$t('Help')"
    :href="help"
  >
    <i class="iconfont icon-help" />
  </a>
</template>

<script>
export default {
  name: 'HelpBtn',
  props: {
    help: {
      type: String,
      default: ''
    }
  }

}
</script>

<style lang="less" scoped>
</style>
