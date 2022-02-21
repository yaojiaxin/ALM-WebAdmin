<template>
  <div class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" :class="{ 'ag-checked' : isChecked === 1}">
    <!--, 'ag-indeterminate' : isChecked === 0.5-->
    <!--parent node not support indeterminate, so keep unite-->
    <input :checked="isChecked === 1" class="ag-input-field-input ag-checkbox-input" type="checkbox" @click="changeSelected">
  </div>
</template>

<script>
export default {
  data() {
    return {
      isChecked: 0
    }
  },
  watch: {
    'params.context.setHeader'(flag) {
      this.isChecked = flag
    }
  },
  methods: {
    changeSelected() {
      if (this.isChecked === 1) {
        this.isChecked = 0
      } else {
        this.isChecked = 1
      }
      this.params.context.setHeader = this.isChecked
      this.params.context.setAll(this.isChecked === 1)
    }
  }
}
</script>

<style scoped>

</style>
