<template>
  <div class="app-servers-info-container-wrapper">
    <div class="mf-subtitle mf-margin-b-24 subtitle">
      <slot name="title" />
    </div>

    <slot name="content" />
  </div>
</template>

<style scoped lang="less">
.subtitle {
  margin-top: 24px;
}
</style>
