<template>
  <div class="grid-item">
    <a-select v-model="params.data.solution" class="grid-select" size="small" @change="changeSolution">
      <a-select-option value="skip">{{ $t('userManagement.skip') }}</a-select-option>
      <a-select-option value="update">{{ $t('userManagement.update') }}</a-select-option>
      <a-select-option v-if="params.mode === 'same-user-name'" value="rename" @click="handleRepeatedClick">{{ $t('userManagement.auto_rename') }}</a-select-option>
    </a-select>
  </div>
</template>

<script>

export default {
  methods: {
    changeSolution() {
      if (!(this.params.mode === 'same-user-name' && this.params.data.solution === 'rename')) {
        this.params.data.autoRename = ''
        this.params.data.rename = ''
      }
    },
    handleRepeatedClick() {
      this.params.context.rename(this.params.data)
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
.grid-select {
  width: 160px;
  font-size: 14px;
}
</style>
