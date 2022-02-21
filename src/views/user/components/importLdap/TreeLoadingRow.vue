<template>
  <span v-if="params.node.failedLoad" class="loadingRow">
    {{ $t('agGrid.loadingErr') }}
  </span>
  <span v-else class="loadingRow">
    <a-icon class="load-icon" type="loading" />{{ $t('agGrid.loadingOoo') }}
  </span>
</template>

<script>
export default {
}
</script>

<style scoped>
.loadingRow {
  padding-left: 72px;
}
.load-icon {
  font-size: 12px;
  padding-right: 15px;
}
</style>
