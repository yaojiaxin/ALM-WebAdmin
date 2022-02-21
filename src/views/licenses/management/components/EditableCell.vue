<template>
  <div class="editable-cell">
    <div v-show="editable" class="editable-cell-input-wrapper">
      <a-input-number
        :id="inputNumberId"
        ref="editableInputNumber"
        v-model="value"
        :max="LICENSESMAXLENGTH"
        class="input-number"
        :min="0"
        :formatter="limitNumber"
        :parser="limitNumber"
        @blur="check"
        @pressEnter="check"
      />
    </div>

    <span
      v-show="!editable"
      :ref="`cell-${tag}-${keys}`"
      :class="['editable-cell-text-wrapper', isSame && !noSaved ? value<=licensesMaxLength?'is-change':'red-border':'', exceed?'red-class':'']"
      :data-num="oldValue"
      @click="edit"
    >
      {{ value }}
    </span>
  </div>
</template>

<script>
import { LICENSESMAXLENGTH } from '@/store/const'
import { limitNumber } from '@/utils/validate'

export default {

  name: 'EditableCell',
  props: {
    text: {
      type: [String, Number],
      default: ''
    },
    licensesMaxLength: {
      type: Number,
      default: LICENSESMAXLENGTH
    },

    keys: {
      type: String,
      default: ''
    },
    exceed: {
      type: Boolean,
      default: false
    },
    hasShowOnly: {
      type: Boolean,
      default: false
    },
    nullIs0: {
      type: Boolean,
      default: true
    },
    tag: {
      type: String,
      default: ''
    },

    noSaved: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      LICENSESMAXLENGTH,
      value: this.text,
      oldValue: JSON.parse(JSON.stringify(this.text)),
      editable: false,
      isSame: false,
      inputNumberId: 'inputNumber' + '-' + this.tag + '-' + this.keys,
      limitNumber
    }
  },
  watch: {
    text(val, oldValue) {
      if (this.noSaved) {
        this.oldValue = val
      }
      this.value = val
    },
    noSaved(val) {
      if (val) {
        this.oldValue = this.value
        this.isSame = this.oldValue !== (this.value === null ? '' : this.value)
      }
    }
  },

  methods: {
    check() {
      this.editable = false
      if (this.value === null && this.nullIs0) { this.value = 0 }

      // Set the raw data for comparison
      // const ele = this.$refs[`cell-${this.tag}-${this.keys}`]
      // if (ele.dataset.num) {
      //   this.isSame = (ele.dataset.num * 1) !== (this.value * 1)
      // } else {
      //   this.isSame = !!this.value
      // }
      this.isSame = this.oldValue !== (this.value === null ? '' : this.value)
      this.$emit('update:noSaved', false)
      this.hasShowOnly ? this.$emit('change', { value: this.value, isChanged: this.isSame }) : this.$emit('change', this.value)
      this.$emit('saveChange')
    },
    edit() {
      this.editable = true
      this.$emit('saveChange')
      this.$nextTick(() => {
        this.$refs.editableInputNumber.focus()
      })
    }
  }
}
</script>

<style scoped lang="less">
.editable-cell {
  position: relative;
  height: 34px;
  width: 120px;
  border: 1px solid fade(#ffffff,0.01);
}
.editable-cell:hover{
  border: 1px solid #9B9B9D;
}
.input-number:hover{
  border: 1px solid #ffffff;
}
/deep/ .ant-input-number{
  width: 120px;
}

.editable-cell-input-wrapper,
.editable-cell-text-wrapper {
  height: 34px;
  //padding-right: 24px;
}

.editable-cell-text-wrapper {
  display: inline-block;
  width: 100px;
  padding-left:24px ;
  padding-top: 5px;

}
.editable-cell-icon,
.editable-cell-icon-check {
  position: absolute;
  right: 0;
  width: 20px;
  cursor: pointer;
}

.editable-cell-icon {
  line-height: 18px;
  display: none;
}

.editable-cell-icon-check {
  line-height: 28px;
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}

.editable-cell-icon:hover,
.editable-cell-icon-check:hover {
  color: #108ee9;
}

.editable-add-btn {
  margin-bottom: 8px;
}
.is-change:before{
  display:block;
  content:'';
  width:0;
  border-width:5px 5px 5px 5px;
  border-style:solid;
  border-color:#0079ef transparent transparent #0079ef;
  position:absolute;
  left:0;
  top:0;
}
.red-class{
  color: red;
  font-style: italic
}
.red-border{
  width: 120px;
  border: 1px solid red;
}
</style>
