<template>
  <div :class="['mf-alert', type === 'warning' ? '' : 'bg-blue']">
    <a-icon v-if="type === 'warning'" type="warning" class="icon" />
    <a-icon v-else type="info-circle" class="icon" />
    {{ message }}
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'warning'
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.mf-alert{
  width: 100%;
  padding: 5px 24px 5px 0;
  line-height: 1.2;
  // height: 32px;
  color: @black;
  background-color: @yellow;
  font-size: 16px;
  font-family: RegularWeb;
  display: flex;
  align-items: center;

  .icon{
    margin: 0 24px;
  }
}
.bg-blue{
  background-color: @alert-blue;
}
</style>
