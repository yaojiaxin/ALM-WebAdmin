<template>
  <a-tooltip
    :title="iconTitle"
    :overlay-class-name="tooltipStyleClass"
  >
    <a-button
      :id="btnId"
      class="tool-icon-btn"
      type="link"
      :disabled="isDisabled"
      @click.stop="$emit('onClick')"
    >
      <i v-if="!isIconFont" class="tool-icon-btn-i" :class="['iconfont', iconStyle]" />
      <a-icon v-else class="tool-icon-btn-i" :type="iconStyle" />
      <slot name="btnName" class="btn-name" />
    </a-button>
  </a-tooltip>
</template>

<script>
export default {
  props: {
    isDisabled: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    iconTitle: {
      type: String,
      default: ''
    },
    iconStyle: {
      type: String,
      default: ''
    },
    btnId: {
      type: String,
      default: ''
    },
    isIconFont: {
      type: Boolean,
      default: false
    },
    tooltipStyleClass: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/variables.less';

.tool-icon-btn{
  height: 28px !important;
  min-width: 20px !important;
  width: 20px;
  padding: 0;
  margin-right: 24px;
}
.tool-icon-btn-i{
  margin: 0;
  width: 20px;
  height: 28px;
  color: #323435;
  font-size: 22px;
}
/deep/ .btn-name{
  color: #323435;
}
.tool-icon-btn:hover,.tool-icon-btn-i:focus{
  i{
    color: #0073e7;
  }
  /deep/ .btn-name{
    color: #0073e7;
  }
}
.tool-icon-btn[disabled=disabled] {
  color:@disabled-color;
  cursor:not-allowed ;
  pointer-events: auto;
  .tool-icon-btn-i{
    color: rgba(0,0,0,.2);
  }
  /deep/ .btn-name{
  color: rgba(0,0,0,.2);
}
}
</style>
<style lang="less">
.tooltip-style {
  /deep/ .ant-tooltip-inner{
    min-width: 130px !important;
  }
}
</style>
