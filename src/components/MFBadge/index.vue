<template>
  <a-badge :offset="offset" :dot="badge" :number-style="numberStyle">
    <slot />
  </a-badge>
</template>

<script>
export default {
  props: {
    badge: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      offset: ['-14', '10'],
      numberStyle: { backgroundColor: '#faad14' }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
