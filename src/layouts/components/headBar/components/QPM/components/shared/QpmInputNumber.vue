<template>
  <div class="qpm-input-number">
    <!-- number input -->
    <a-input-number
      ref="inputNumberRef"
      :value="value"
      v-bind="$attrs"
      v-on="$listeners"
    />

    <!-- unit text -->
    <template v-if="unit !== ''">
      <span class="unit">
        {{ unit }}
      </span>
    </template>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change'
  },

  props: {
    value: {
      type: [Number, String],
      default: 0
    },
    unit: {
      type: String,
      default: ''
    }
  },

  methods: {
    focus() {
      this.$refs.inputNumberRef.focus()
    },

    blur() {
      this.$refs.inputNumberRef.blur()
    }
  }
}
</script>

<style scoped lang="less">
/deep/ .ant-input-number {
  width: 120px;
}

.unit {
  margin-left: 16px;
}
</style>
