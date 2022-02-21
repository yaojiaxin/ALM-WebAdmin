<template>
  <div class="mf-check-panel">
    <div class="mf-check-title-wrapper">
      <a-checkbox :indeterminate="indeterminate" :checked="checkAll" :disabled="disabledAll" @change="onCheckAllChange">
        <div class="mf-check-title">{{ $t('login.userName') }}</div>
        <div class="mf-check-title">{{ $t('userManagement.FULL_NAME') }}</div>
      </a-checkbox>
    </div>
    <div ref="checkListWrapper" class="mf-check-list-wrapper">
      <a-checkbox
        v-for="(item, index) in data"
        :key="item.id"
        class="mf-check-item"
        :checked="item.checked"
        :disabled="item.disabled"
        @change="(e) => { onChange(e, item, index) }"
      >
        <div class="mf-check-name-wrapper">
          <span class="mf-check-name">{{ item.name }}</span>
          <span class="mf-check-name">{{ item['full-name'] }}</span>
        </div>

      </a-checkbox>
      <!-- <a-checkbox-group v-model="selected" :options="data" class="mf-check-list" :name="name" @change="onChange">
        <div slot="label" slot-scope="option" class="mf-check-item">
          <span class="mf-check-name">{{ option.name }}</span>
          <span class="mf-check-name">{{ option['full-name'] }}</span>
        </div>
      </a-checkbox-group> -->
    </div>
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: () => []
    },

    value: {
      type: Array,
      default: () => []
    },
    disabledAll: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      indeterminate: false,

      checkAll: false,

      selected: this.value,

      checkedList: []
    }
  },

  watch: {
    value: function(val) {
      this.resetCheckStatus(val)
      this.selected = val
    },

    selected: function(val) {
      this.resetCheckStatus(val)
      this.$emit('input', val)
    },

    data: function(val) {
      this.resetCheckStatus(this.selected)
    }
  },

  mounted() {
    this.bindEvent()
  },

  // beforeDestroy() {
  //   this.unbindEvent()
  // },

  methods: {
    isChecked(item) {
      return this.selected.findIndex(i => i.name === item.name) > -1
    },
    resetCheckStatus(checkedList) {
      this.indeterminate = checkedList.length > 0 && checkedList.length < this.data.length
      this.checkAll = checkedList.length === this.data.length && this.data.length !== 0

      if (checkedList.length > this.data.length) {
        const diffrent = this.data.find(i => !checkedList.includes(i.value))

        if (!diffrent) {
          this.checkAll = true
        } else {
          this.indeterminate = true
        }
      }
    },

    onCheckAllChange(e) {
      if (e.target.checked) {
        this.$emit('checked', this.selected)
      } else {
        this.$emit('unchecked', this.data.filter(i => !i.disabled))
      }
      const copyData = JSON.parse(JSON.stringify(this.data))
      Object.assign(this, {
        selected: e.target.checked ? copyData : copyData.filter(i => i.disabled),
        indeterminate: false,
        checkAll: e.target.checked
      })
      this.data.forEach((i, index) => this.$set(this.data, index, { ...i, checked: e.target.checked }))
    },

    onChange(e, value, index) {
      if (e.target.checked) {
        this.selected.push(value)
        this.$set(this.data, index, { ...value, checked: true })
        this.$emit('checked', this.selected)
      } else {
        this.$set(this.data, index, { ...value, checked: false })
        this.$emit('unchecked', [value])
        this.selected.splice(index, 1)
      }
    },

    bindEvent() {
      const checkListWrapper = this.$refs.checkListWrapper
      let scrollTop = 0

      checkListWrapper.addEventListener('scroll', () => {
        // const isBottom = (checkListWrapper.scrollHeight - checkListWrapper.scrollTop - 1) === checkListWrapper.clientHeight
        const isBottom = (checkListWrapper.clientHeight + checkListWrapper.scrollTop) >= (checkListWrapper.scrollHeight - 5)
        const isHorizontal = scrollTop === checkListWrapper.scrollTop

        if (isBottom && !isHorizontal && checkListWrapper.scrollTop !== 0) {
          this.$emit('load')
        }
        if (!isHorizontal) {
          scrollTop = checkListWrapper.scrollTop
        }
      })
    },

    unbindEvent() {
      const checkListWrapper = this.$refs.checkListWrapper
      checkListWrapper.removeEventListener('scroll')
    }
  }
}
</script>

<style scoped lang="less">
.mf-check-panel{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.mf-check-title-wrapper, .mf-check-item{
  padding: 9px 16px;
  border-bottom: 1px solid rgba(101, 102, 104, 0.16);
}
.mf-check-title,.mf-check-name{
  box-sizing: border-box;
  display: inline-block;
  padding: 0 16px;
}
.mf-check-title{
  width: 135px;
  font-size: 14px;
  font-family: BoldWeb;
}

.mf-check-name{
  width: 128px;
  font-size: 16px;
}

.mf-check-list-wrapper{
  flex: 1;
  overflow: auto;
}
.mf-check-item{
  width: 100%;
}
// .mf-check-list {
  // width: 100%;
.mf-check-list-wrapper{
  /deep/ .ant-checkbox-wrapper + .ant-checkbox-wrapper{
    margin: 0;
  }
}

  .mf-check-name-wrapper{
    display: inline-block;
  }
// }
</style>
