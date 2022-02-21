<template>
  <a-row type="flex">
    <a-col flex="auto">
      {{ $t('activeCustomer') }}
      <a-dropdown
        :trigger="['click']"
      >
        <a class="ant-dropdown-link" @click="e => e.preventDefault()">
          Hover me <a-icon type="down" />
        </a>
        <a-menu slot="overlay">
          <a-menu-item>
            <a href="javascript:">1st menu item</a>
          </a-menu-item>
          <a-menu-item>
            <a href="javascript:">2nd menu item</a>
          </a-menu-item>
          <a-menu-item>
            <a href="javascript:">3rd menu item</a>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </a-col>
    <a-col flex="auto">
      {{ $t('activeCustomer') }}
    </a-col>

  </a-row>
</template>

<script>
export default {
}
</script>

<style scoped lang="less">
.ant-col{
//color: @white;
  width: auto;
  display: flex;
  align-items: center;
  justify-content:  flex-start;
  height: 56px;
  padding-left: 12px;
}

.ant-dropdown-link.ant-dropdown-trigger{
  padding-left: 12px;
}

</style>
