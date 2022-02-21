<template>
  <div :class="computedClasses" class="material-input__component">
    <div :class="iconslot === 'prefix' ? 'iconClass' : ''" class="defaultClass">
      <label class="labelclass">
        <slot />
      </label>
      <a-input
        :id="id"
        ref="inputRef"
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
        @input="handleInput"
        @change="handleInput"
        @pressEnter="handlepressEnter"
      >
        <a-icon :slot="iconslot" :type="icontype" :style="iconstyle" />
      </a-input>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FlatInput',
  props: {
    name: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: ''
    },
    maxLength: {
      type: Number,
      default: 100
    },
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
    iconslot: {
      type: String,
      default: ''
    },
    icontype: {
      type: String,
      default: ''
    },
    iconstyle: {
      type: String,
      default: ''
    },
    autoFocus: {
      type: Boolean,
      default: false
    }
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
  mounted() {
    if (this.autoFocus) {
      this.$refs.inputRef.focus()
    }
  },
  methods: {
    handlepressEnter(e) {
      this.$emit('pressEnter', e)
    },
    handleInput(event) {
      const value = event.target.value
      this.$emit('input', value)
      this.$emit('change', value)
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
    }
  }
}
</script>

<style  lang="less">

.material-input__component {
  position: relative;
  display: inline-block;
  width: 100%;
  margin-top: 20px;

  .defaultClass {
    position: relative;

    .ant-input {
      border: none;
      border-bottom: 1px solid rgba(101, 102, 104, 0.65);
      border-radius: 0;
      padding: 8px 0;
      font-size: 16px;
      color: #000;
      outline: none;
    }

    .ant-input:focus {
      box-shadow: none;
    }

    .labelclass {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 1;
      font-weight: normal;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.55);
      transition: 0.3s ease all;
      margin-left: 0;
    }
  }
  .defaultClass.iconClass {
    position: relative;
    .labelclass {
      left: 30px;
      top: 3px;
    }
  }
  .defaultClass {
    .ant-input-affix-wrapper:hover {
      .ant-input {
        border-bottom: 1px solid rgb(101, 102, 104);
      }
    }
  }
  .defaultClass:hover {
    .labelclass {
      top: -4px;
    }
    .ant-input {
      border-bottom: 1px solid rgb(101, 102, 104);
    }
  }
}
// value
.material-input__component.material--raised {
  .defaultClass {
    .labelclass {
      top: -26px;
      left: 0;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
    }
  }
  .defaultClass.iconClass {
    .ant-input {
      padding: 8px 30px;
    }
    .labelclass {
      left: 30px;
    }
  }
}

// focus
.material-input__component.material--active {
  .defaultClass {
    .ant-input {
      border-bottom: 1px solid rgb(0, 121, 239);
    }
    .ant-input-affix-wrapper:hover {
      .ant-input {
        outline: none;
        border-bottom: 1px solid rgb(0, 121, 239);
      }
    }
    .labelclass {
      top: -26px;
      left: 0;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
    }
  }
  .defaultClass.iconClass {
    .ant-input {
      padding: 8px 30px;
    }
    .ant-input:focus {
      box-shadow: none;
    }
    .labelclass {
      left: 30px;
    }
  }
}
// disabled
.material-input__component.material--disabled {
  .defaultClass {
    .ant-input {
      border-bottom: 1px solid rgba(0, 0, 0, 0.2);
      outline: none;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.2);
      padding: 12px 0;
    }
    .ant-input-affix-wrapper:hover {
      .ant-input {
        outline: none;
        border-bottom: 1px solid rgba(0, 0, 0, 0.2);
      }
    }
    .labelclass {
      top: -26px;
      left: 0;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
    }
  }
  .defaultClass.iconClass {
    .ant-input {
      padding: 12px 30px;
    }
    .labelclass {
      left: 30px;
    }
  }
}

// error
.has-error .material-input__component .ant-input{
  border-bottom: 1px solid #e5004c;
}
</style>
