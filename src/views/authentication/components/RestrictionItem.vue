<template>

  <div class="right-cont-item">
    <div v-serverType="[SERVER_TYPE.Saas]">
      <a-checkbox v-if="param.isMandatory && isSwitchRootCustomer" :disabled="!checkPermission(['MY_CUSTOMER_CONTEXT_POLICIES_MANAGE'],['SWITCHED_CUSTOMER_CONTEXT_POLICIES_MANAGE'])" checked class="checkbox" @change="mandatoryChange" />
      <a-checkbox v-else-if="param.isMandatory && !isSwitchRootCustomer" v-model="param.checked" :disabled="!checkPermission(['MY_CUSTOMER_CONTEXT_POLICIES_MANAGE'],['SWITCHED_CUSTOMER_CONTEXT_POLICIES_MANAGE'])" class="checkbox" @change="onChange" />
      <a-checkbox v-else v-model="param.checked" :disabled="!checkPermission(['MY_CUSTOMER_CONTEXT_POLICIES_MANAGE'],['SWITCHED_CUSTOMER_CONTEXT_POLICIES_MANAGE'])" class="checkbox" @change="onChange" />
    </div>

    <div v-serverType="[SERVER_TYPE.OnPremise]">
      <a-checkbox v-model="param.checked" class="checkbox" @change="onChange" />
    </div>
    <div class="restriction">
      <span v-for="(item, index) in arr" :key="index">
        <span v-if="arr.length === 2 && index !== arr.length - 1">
          {{ item }}
          <a-input-number
            v-model="param.parameters"
            :disabled="!param.checked||!checkPermission(['MY_CUSTOMER_CONTEXT_POLICIES_MANAGE'],['SWITCHED_CUSTOMER_CONTEXT_POLICIES_MANAGE'])"
            :formatter="limitNumber"
            :parser="limitNumber"
            class="inputNumber"
            :min="0"
            :max="999"
            @change="onChange"
          />
        </span>
        <span v-else-if="arr.length !== 2 && index !== arr.length - 1">
          {{ item }}
          <a-input-number
            v-model="param.parameters[index].param"
            :disabled="!param.checked||!checkPermission(['MY_CUSTOMER_CONTEXT_POLICIES_MANAGE'],['SWITCHED_CUSTOMER_CONTEXT_POLICIES_MANAGE'])"
            :formatter="limitNumber"
            :parser="limitNumber"
            class="inputNumber"
            :min="0"
            :max="999"
            @change="onChange"
          />
        </span>
        <span v-else>{{ item }}</span>
      </span>
    </div>
    <!--    <div v-else class="restriction">-->
    <!--      <span>-->
    <!--        <span>-->
    <!--          {{ arr[0] }}-->
    <!--          <a-input-number v-model="param.parameters[0].param" :disabled="!param.checked||!checkPermission(['MY_CUSTOMER_CONTEXT_POLICIES_MANAGE'],['SWITCHED_CUSTOMER_CONTEXT_POLICIES_MANAGE'])" :formatter="limitMin" :parser="limitMin" class="inputNumber" :min="0" :max="passwordMax" @change="onChangeMin" />-->
    <!--        </span>-->
    <!--        <span>-->
    <!--          {{ arr[1] }}-->
    <!--          <a-input-number v-model="param.parameters[1].param" :disabled="!param.checked||!checkPermission(['MY_CUSTOMER_CONTEXT_POLICIES_MANAGE'],['SWITCHED_CUSTOMER_CONTEXT_POLICIES_MANAGE'])" :formatter="limitMax" :parser="limitMax" class="inputNumber" :min="passwordMin" :max="999" @change="onChangeMax" />-->
    <!--        </span>-->
    <!--        <span>{{ arr[2] }}</span>-->
    <!--      </span>-->
    <!--    </div>-->
  </div>
</template>

<script>
import { SERVER_TYPE } from '@/store/const.js'
// import { mapGetters } from 'vuex'
import { isSwitchRootCustomer } from '@/utils/customer.js'
export default {
  props: {
    validator: {
      type: String,
      default: ''
    },

    value: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      SERVER_TYPE,

      isMandatory: false,

      param: this.value,

      arr: [],

      passwordMin: 0,
      passwordMax: 999,
      isSwitchRootCustomer: isSwitchRootCustomer()

    }
  },
  watch: {
    param: {
      handler: function(val) {
        this.$emit('input', val)
      },
      deep: true
    },

    value: function(val) {
      this.param = val
    }
  },

  created() {
    if (this.validator) {
      this.getStr(this.validator, this.arr)
    }
  },

  methods: {
    // limit number to positive integer and zero
    limitNumber(value) {
      if (typeof value === 'string') {
        return !isNaN(Number(value)) ? value.replace(/\./g, '') : null
      } else if (typeof value === 'number') {
        return !isNaN(value) ? String(value).replace(/\./g, '') : 0
      } else {
        return 0
      }
    },
    limitMin(value) {
      if (typeof value === 'string') {
        const filter = !isNaN(Number(value)) ? value.replace(/\./g, '') : ''
        return Number(filter) > 999 ? 999 : filter
      } else if (typeof value === 'number') {
        const filter = !isNaN(value) ? String(value).replace(/\./g, '') : ''
        return Number(filter) > 999 ? 999 : filter
      } else {
        return 0
      }
    },
    limitMax(value) {
      if (typeof value === 'string') {
        const filter = !isNaN(Number(value)) ? value.replace(/\./g, '') : ''
        return Number(filter) < 0 ? 0 : filter
      } else if (typeof value === 'number') {
        const filter = !isNaN(value) ? String(value).replace(/\./g, '') : ''
        return Number(filter) < 0 ? 0 : filter
      } else {
        return 0
      }
    },
    onChangeMin(value) {
      if (value == null || value === '') {
        this.passwordMin = 0
      } else {
        this.passwordMin = !isNaN(Number(value)) ? Number(value) : 0
      }
    },

    onChangeMax(value) {
      if (value == null || value === '') {
        this.passwordMax = 999
      } else {
        this.passwordMax = !isNaN(Number(value)) ? Number(value) : 999
      }
    },

    // divide string before '$p' and after '$p'
    getStr(str, arr) {
      const index = str.indexOf('$p')
      if (index > -1) {
        const start = str.substring(0, index)
        arr.push(start)

        str = str.substring(index + 3, str.length)

        return this.getStr(str, arr)
      } else {
        arr.push(str)
        return arr
      }
    },

    mandatoryChange(e) {
      this.$message.error(this.$t('authentication.mandatory_info'))
    },

    onChange(e) {
      this.$emit('change', e)
    }

  }
}
</script>

<style lang="less" scoped>
.right-cont-item{
  display: flex;
  margin-top: 13px;
  text-overflow: ellipsis;
  line-clamp: 1;
  word-break: keep-all;
  line-height: 40px;

  @media screen and(-ms-high-contrast:active),(-ms-high-contrast:none){
    /*兼容IE11*/
    .checkbox{
      margin-right: 24px;
      margin-top: 9px;
    }
  }

  .checkbox{
    margin-right: 24px;
  }

}
</style>
