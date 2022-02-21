<template>
  <a class="name-link" @click="showDetail">
    <i v-if="params.data.canExpand" class="iconfont icon-projects" />
    <i v-else class="iconfont icon-UserSetting" />
    {{ params.data['user-name'] }}
  </a>
</template>

<script>
export default {
  methods: {
    showDetail() {
      this.params.context.showDetail(this.params.data)
    }
  }
}
</script>

<style lang="less" scoped>
.name-link {
  position: relative;
  padding-left: 20px;
  i {
    font-size: 16px;
    position: absolute;
    left: 0;
  }
}
</style>
