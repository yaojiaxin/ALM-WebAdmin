<template>
  <div class="mf-switch">
    <a-switch
      :loading="loading"
      :disabled="disabled"
      :checked="checked"
      @change="onChoice"
    />
  </div>
</template>

<script>
export default {
  name: 'MfSwitch',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    checked: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onChoice(checked) {
      this.$emit('onChange', checked)
    }
  }
}
</script>

<style lang="less">
  .mf-switch{
    .ant-switch{
      height: 2px;
      min-width: 26px;
      max-width: 26px;
    }
    .ant-switch::after{
      box-sizing: border-box;
      left: 0;
      top: -8px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
    }
    .ant-switch:not(.ant-switch-checked)::after{
      border: 2px solid #000;
    }
    .ant-btn{
      border-color: rgba(0, 0, 0, 0);
      background-color: rgba(0, 0, 0, 0);
    }
    .ant-btn:hover{
      box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    }
    .ant-switch:not(.ant-switch-disabled):hover::before, .ant-switch:not(.ant-switch-disabled):hover::after{
      width: 18px;
    }
    .anticon{
      top: -9px!important;
      left: -1px;
    }
    .ant-switch-checked .ant-switch-loading-icon{
      left: 26px;
    }
    .ant-switch-checked::after{
      left: 105%;
      background-color: #0079ef;
    }
    .ant-switch-checked{
      background-color: rgba(0, 0, 0, 0.2);
    }
  }
</style>
