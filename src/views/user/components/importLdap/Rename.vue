<template>
  <div class="grid-item">
    <a-input v-if="params.data.solution === 'rename'" v-model="params.data.rename" class="grid-input" size="small" @blur="checkName" />
  </div>
</template>

<script>
export default {
  methods: {
    checkName() {
      this.params.context.checkName(this.params.data)
    }
  }
}
</script>

<style scoped>
.grid-item {
  height: 100%;
  display: flex;
  align-items: center;
}
.grid-input {
  font-size: 14px;
  background: none;
}
</style>
