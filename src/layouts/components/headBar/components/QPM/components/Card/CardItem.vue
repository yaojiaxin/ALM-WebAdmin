<template>
  <div class="card-item">
    <!-- title -->
    <div class="card-item-title">
      <slot name="title" />
    </div>

    <!-- content -->
    <div class="card-item-content">
      <slot name="content" />
    </div>
  </div>
</template>

<style scoped lang="less">
.card-item-title {
  height: 16px;
  line-height: 16px;
  font-size: 14px;
  font-family: SemiBoldWeb;
  font-weight: 600;
  color: #000000;
  margin-bottom: 16px;
}
.card-item-content {
  padding-left: 22px;
  font-size: 16px;
  font-family: RegularWeb;
  font-weight: 400;
  color: #323435;
}
</style>
