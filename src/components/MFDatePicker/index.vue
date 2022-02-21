<template>
  <a-date-picker
    v-model="date"
    :default-value="defaultValue ? moment(defaultValue) : null"
    style="width: 100%"
    :class="{ 'mf-datepicker-readonly': readOnly }"
    v-bind="$attrs"
    :disabled="$attrs.disabled || readOnly"
    :format="$attrs.format || 'YYYY/MM/DD'"
    :placeholder="$t('selectDate') || $attrs.placeholder"
    :allow-clear="true"
    v-on="$listeners"
  />
</template>

<script>
import moment from 'moment'

export default {
  name: 'DatePicker',

  props: {
    readOnly: {
      type: Boolean,
      default: false
    },

    // eslint-disable-next-line vue/require-default-prop
    value: {
      type: [moment, String],
      default: null
    },

    // eslint-disable-next-line vue/require-default-prop
    defaultValue: {
      type: [moment, String],
      default: null
    }
  },

  data() {
    return {
      date: null,
      moment
    }
  },

  watch: {
    value: function(val) {
      this.date = typeof (val) === 'string' && val ? moment(val) : val || null
    },

    date: function(val) {
      this.$emit('input', val)
    }
  }
}
</script>

<style>

.mf-datepicker-readonly .ant-input{
  background-color: #fff;
}
.mf-datepicker-readonly .ant-input[disabled]{
  color: #000;
}
</style>
