<template>
  <a-drawer
    id="mf_drawer"
    class="mf-drawer"
    v-bind="$attrs"
    :mask-closable="$attrs.maskClosable || false"
    v-on="$listeners"
  >
    <template slot="title">
      <slot name="title" />
    </template>
    <slot />
  </a-drawer>
</template>

<script>
export default {

}
</script>

<style lang="less" >
.mf-drawer{

  .ant-drawer-header{
      // position: relative;
      // padding: 0;
      // margin-top: 16px;
      padding-bottom: 0;

    .ant-drawer-title{
      // height: 40px;
      // line-height: 40px;
      font-weight: bold;
      color: #000000;
      font-size: 18px;
      font-family: SemiboldWeb;

      a {
        font-weight: normal;
      }
    }

    .ant-drawer-close{
      font-size: 18px;
      // right: 33px;
      color: rgba(0, 0, 0, 0.45);
      // width: auto;
      // height: 40px;
      // line-height: 40px;
    }
  }
}
</style>
