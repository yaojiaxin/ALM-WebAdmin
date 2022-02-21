<template>
  <div class="mf-step">
    <div
      v-for="(item, index) in stepList"
      :key="index"
      :class="['step-item',( step === index)&&'step-active', (stepList.length === 4)&&'step-len4', (stepList.length === 3) ? type === 'sass' ? 'step-len3-sass':'step-len3':'', (stepList.length === 2)&&'step-len2']"
    >

      <div v-if="index !== stepList.length">
        <div class="step-line1" />
        <div class="step-line2" />
      </div>

      <span class="step-num">{{ index+1 }}</span>

      <p
        ref="stepName"
        :class="[
          'step-name',
          item.length > 20 &&
            (stepList.length === 4 || stepList.length === 5) &&
            isStepOver &&
            'step-over',
        ]"
        :title="item.name || item"
      >
        {{ item.name || item }}
      </p>

      <div v-if="index !== stepList.length-1" class="step-ta" />

    </div>
  </div>
</template>

<script>
export default {
  name: 'Index',

  props: {
    stepList: {
      type: Array,
      default: () => []
    },
    step: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      isStepOver: true
      // stepList: ['Choose Type', 'Add Details', 'Add Project Administrators', 'Select Extensions', 'Summary']
    }
  },

  mounted() {
    let count = 0
    this.$refs.stepName.map((item) => {
      if (item.className.indexOf('step-over') !== -1) {
        count++
      }
    })
    this.isStepOver = !(count > 1)
  }
}
</script>

<style scoped lang="less">
.mf-step{
  width: 100%;
  display: flex;
  height: 32px;
  margin-bottom: 10px;
  justify-content: space-between;
  //background-color: #f1f2f3;
  .step-item{
    // width:220px;
    display: flex;
    justify-content: center;
    background-color: #f1f2f3;
    position: relative;
    padding-right:20px;
    .step-num{
      display: inline-block;
      width: 20px;
      height: 20px;
      margin: 6px 0 0 6px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.2);
      text-align: center;
      line-height: 18px;
    }
    .step-name {
      max-width: 115px;
      height: 100%;
      padding-left: 5px;
      line-height: 32px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .step-over {
      max-width: 200px;
    }
    .step-line1{
      position: absolute;
      left: -16px;
      width: 0;
      height: 0;
      border-top: 16px solid #f1f2f3;
      border-left: 16px solid transparent;
    }
    .step-line2{
      position: absolute;
      left: -16px;
      top: 16px;
      width: 0;
      height: 0;
      border-bottom: 16px solid #f1f2f3;
      border-left: 16px solid transparent;
    }
    .step-ta{
      width: 0;
      height: 0;
      border-top: 16px solid transparent;
      border-left: 18px solid #f1f2f3;
      border-bottom: 16px solid transparent;
      position: absolute;
      right: -18px;
    }
  }
  .step-active{
    background-color: #0079ef;
    color: #fff;
    .step-num{
      color: #fff;
      border: 1px solid #fff;
    }
    .step-ta{
      border-left: 18px solid #0079ef;
    }
    .step-line1{
      border-top: 16px solid #0079ef;
    }
    .step-line2{
      border-bottom: 16px solid #0079ef;
    }
  }
  .step-len2{
    width:450px;
    .step-name{
      max-width:250px;
    }
  }
  .step-len3{
    width:300px;
    .step-name{
      max-width:200px;
    }
  }
  .step-len3-sass{
    width:310px;
    .step-name{
      max-width:210px;
    }
  }
  .step-len4{
    width:250px;
    .step-name{
      max-width:140px;
    }
    .step-over {
      max-width: 200px;
    }
  }
}
/* IE 10+ */
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  .mf-step{
    .step-num{
      line-height: 16px !important;
    }
    .step-name{
      line-height: 30px !important;
    }
  }
}
/* firefox */
@-moz-document url-prefix() {
  .mf-step{
    .step-num{
      line-height: 16px !important;
    }
    .step-name{
      line-height: 30px !important;
    }
  }
}
.step-item:last-child{
  padding-right: 10px;
}
</style>
