<template>
  <div class="mf-input-wrapper">
    <a-input id="role_input_0001" v-model.trim="input" :max-length="30" :placeholder="$t('role.RoleName')" class="input" />
    <a-icon id="role_ok_0001" type="check" class="green mf-icon-btn" @click="onSave" />
    <a-icon id="role_cancel_0001" type="close" class="mf-icon-btn" @click="onCancel" />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      input: ''
    }
  },
  watch: {
    value: function(val) {
      this.input = val
    },
    input: function(val) {
      this.$emit('input', val)
    }
  },
  methods: {
    onSave() {
      this.$emit('ok')
      this.input = ''
    },

    onCancel() {
      this.input = ''
      this.$emit('input', '')
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped lang="less">
.mf-input-wrapper{
  // margin-bottom: 8px;

  .input{
    width: 205px;
  }
    i{
    font-size: 12px;
  }
}

.mf-icon-btn{
  margin-left: 8px;
  &:hover{
    cursor: pointer;
  }
}
</style>
