<template>
  <div class="item-div">
    <a-input-number
      v-if="!params.data['is-template'] && params.data['project-type']!=='LabManagement'&&inputShow"
      ref="inputNumber"
      v-model="data"
      class="grid-input"
      auto-focus
      :formatter="limitNumber"
      :parser="limitNumber"
      @pressEnter="pressEnter"
      @blur.native.capture="changePriority"
    />
    <span
      v-else
      :class="['item-span',!params.data['is-template'] && params.data['project-type']!=='LabManagement'?'can-change':'']"
      @click="onclickItem"
    >
      {{ params.data.priority }}
    </span>
  </div>
</template>

<script>
import { limitNumber } from '@/utils/validate'

export default {
  name: 'ProjectUpdatePrioritizationInput',
  data() {
    return {
      inputShow: false,
      limitNumber,
      data: null
    }
  },
  methods: {
    changePriority() {
      this.inputShow = false
      this.params.data.priority = this.data
      this.params.context.changePriority(this.params)
    },
    pressEnter() {
      this.$refs.inputNumber.blur()
    },
    onclickItem() {
      this.inputShow = true
      this.data = this.params.data.priority
    }
  }
}
</script>

<style scoped lang="less">
.grid-input{
  //width: 250px;
  height: 30px;
  background: none;
}
.item-div{
  width: 250px;
  left: -16px;
}
/deep/ .ant-input-number-handler-wrap{
  display: none;
}
.item-span{
  display: inline-block;
  width: 100px;
}
.can-change:hover{
  //border: 1px;
  //border-style:solid;
  //border-color:#0079ef transparent transparent #0079ef;
}
</style>

