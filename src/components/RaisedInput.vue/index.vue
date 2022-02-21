<template>
  <div :class="computedClasses" class="regularclass">
    <a-input
      :id="id"
      v-model="currentValue"
      :type="type"
      :name="name"
      :placeholder="fillPlaceHolder"
      :disabled="disabled"
      :max-length="maxLength"
      :allow-clear="allowClear"
      :size="size"
      @focus="handleMdFocus"
      @blur="handleMdBlur"
      @input="handleModelInput"
      @change="handlechange"
      @pressEnter="handlepressEnter"
    />
  </div>
</template>

<script>
export default {
  name: 'RaisedInput',
  props: {
    name: String,
    placeholder: String,
    disabled: {
      type: Boolean,
      default: false
    },
    id: String,
    value: [String, Number],
    maxLength: Number,
    type: {
      type: String,
      default: 'text'
    },
    allowClear: {
      type: Boolean
    },
    size: {
      type: String,
      default: 'default'
    },
    iconslot: String,
    icontype: String,
    iconstyle: String
  },
  data() {
    return {
      fillPlaceHolder: null,
      currentValue: this.value,
      focus: false
    }
  },
  computed: {
    computedClasses() {
      return {
        'material--active': this.focus,
        'material--disabled': this.disabled,
        'material--raised': Boolean(this.currentValue)
      }
    }
  },
  watch: {
    value(newValue) {
      this.currentValue = newValue
    }
  },
  methods: {
    handlepressEnter(e) {
      const value = event.target.value
      this.$emit('pressEnter', e)
      if (this.$parent.$options.componentName === 'AlFormItem') {
        if (this.validateFieldsEvent) {
          this.$parent.$emit('el.form.change', [value])
        }
      }
    },
    handlechange(e) {
      const value = event.target.value
      this.$emit('change', value)
      if (this.$parent.$options.componentName === 'AlFormItem') {
        if (this.validateFieldsEvent) {
          this.$parent.$emit('el.form.change', [value])
        }
      }
    },
    handleModelInput(event) {
      const value = event.target.value
      this.$emit('input', value)
      if (this.$parent.$options.componentName === 'AlFormItem') {
        if (this.validateFieldsEvent) {
          this.$parent.$emit('el.form.change', [value])
        }
      }
    },
    handleMdFocus(event) {
      this.focus = true
      this.$emit('focus', event)
      if (this.placeholder && this.placeholder !== '') {
        this.fillPlaceHolder = this.placeholder
      }
    },
    handleMdBlur(event) {
      this.focus = false
      this.$emit('blur', event)
      this.fillPlaceHolder = null
      if (this.$parent.$options.componentName === 'AFormItem') {
        if (this.validateFieldsEvent) {
          this.$parent.$emit('el.form.blur', [this.currentValue])
        }
      }
    }
  }
}
</script>

<style scoped lang="less">
.regularclass {
  .ant-input {
    border: none;
    border-bottom: 1px solid rgba(101, 102, 104, 0.65);
    border-radius: 0;
    font-size: 16px;
    color: #000;
    padding: 8px 0;
  }
  .ant-input:focus {
    box-shadow: none;
  }
  .ant-input:hover {
    border-bottom: 1px solid rgb(101, 102, 104);
  }
}
.material--active.regularclass {
  .ant-input:hover {
    border-bottom: 1px solid rgb(0, 121, 239);
  }
  .ant-input {
    border-bottom: 1px solid rgb(0, 121, 239);
  }
}
.material--disabled.regularclass {
  .ant-input:hover {
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  }
  .ant-input {
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  }
}
</style>
