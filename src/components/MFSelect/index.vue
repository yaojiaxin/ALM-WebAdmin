<template>
  <a-select
    :value="data"
    :allow-clear="allowClear"
    :disabled="disabled"
    v-bind="$attrs"
    :filter-option="filterOption"
    :mode="$attrs.mode"
    :placeholder="placeholder"
    :default-active-first-option="false"
    :get-popup-container="triggerNode => triggerNode.parentNode"
    :show-search="true"
    option-filter-prop="children"
    v-on="$listeners"
    @change="onChange"
  >
    <slot />
  </a-select>
</template>

<script>
export default {
  name: 'MfSelect',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number, Array],
      default: undefined
    },
    allowClear: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      data: ''
    }
  },
  watch: {
    value: function(val) {
      this.data = val
    },

    data: function(val) {
      this.$emit('input', val)
      this.$emit('change', val)
    }
  },
  mounted() {
    this.data = this.value
  },
  methods: {
    onChange(val, option) {
      this.$emit('input', val)
      this.$emit('change', val, option)
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children.find(item => item.tag === undefined).text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    }
  }
}
</script>

<style lang="less" scoped></style>
