<template>
  <span v-if="params.data.status">
    <a-icon type="check-circle" theme="filled" style="color: #1AAC60" />
  </span>
  <span v-else>
    <a-icon type="close-circle" theme="filled" style="color: #E5004C" />
  </span>
</template>

<script>
export default {
}
</script>

<style scoped>

</style>
