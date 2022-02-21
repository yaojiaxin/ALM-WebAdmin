<template>
  <div class="mf-tree">
    <tree-menu :nodes="tree" :depth="0" />
  </div>
</template>

<script>
import TreeMenu from './TreeMenu'

export default {
  components: { TreeMenu },
  props: {
    tree: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="less" scoped>

</style>
