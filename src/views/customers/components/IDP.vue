<template>
  <div :style="'padding-left:24px;padding-bottom: 20px; overflow-y: auto; height: 100%'">

    <div class="mf-subtitle mf-margin-b-24">{{ $t('Details') }}</div>

    <!-- customer name -->
    <a-row :gutter="[0, 30]">
      <a-col :sm="5" :md="6" :lg="5" :xl="4" :xxl="3" class="label-color">
        <a-tooltip :title="$t('customers.customer_name')" placement="bottom">
          {{ $t('customers.customer_name') }}
        </a-tooltip>
      </a-col>
      <a-col :span="8" :sm="8" :md="8" :lg="8" :xl="8" :xxl="8">
        <a-input v-model="customerName" disabled />
      </a-col>
    </a-row>

    <!-- IDP id -->
    <a-row :gutter="[0, 30]">
      <a-col :sm="5" :md="6" :lg="5" :xl="4" :xxl="3" class="label-color">
        <a-tooltip :title="$t('customers.IDP_id')" placement="bottom">
          {{ $t('customers.IDP_id') }}
        </a-tooltip>
      </a-col>
      <a-col :span="16" :sm="12" :md="12" :lg="13" :xl="16" :xxl="16">
        <a-checkbox-group v-model="checkedList" class="checkbox-group" :options="plainOptions" />
      </a-col>
    </a-row>

    <!--  save button  -->
    <div class="foot-btn">
      <a-button id="restore-attributes" :disabled="saveBtnDisabled || submitting" style="margin-right: 8px;" class="mf-btn-dashed" @click="restoreIDP"> {{ $t('Restore') }} </a-button>

      <a-button
        :disabled="saveBtnDisabled"
        :loading="submitting"
        type="primary"
        @click="onSaveClick"
      > {{ $t('Save') }} </a-button>

    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { eventListener } from '@/views/project/event'
import { getCustomerIDPs, selectedCustomerIDPs, getAllIDPs } from '@/api/customers'
import { isChangeObjorArr } from '@/utils'
import { getIsLogin } from '@/utils/auth'

export default {
  name: 'IDP',

  props: {
    unsavedTabs: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      form: {},

      submitting: false,
      saveBtnDisabled: true,

      checkedList: [],
      initCheckedList: [],

      plainOptions: []
    }
  },

  computed: {
    ...mapGetters(['selectCustomerTreeNode']),
    customerName() {
      return this.selectCustomerTreeNode && this.selectCustomerTreeNode['customer-name']
    },

    customerId() {
      return this.selectCustomerTreeNode && this.selectCustomerTreeNode['customer-id']
    }
  },

  watch: {
    // customerName: {
    //   handler(val) {
    //     this.saveBtnDisabled = true
    //     this.customerId = val['customer-id']

    //     this.setSelectedIDPs()
    //   },
    //   immediate: true
    // },
    checkedList(checked) {
      this.saveBtnDisabled = isChangeObjorArr(checked, this.initCheckedList)
      if (!this.saveBtnDisabled) {
        this.$emit('update-unsaved-tabs', 'add', 'idp')
        this.$store.dispatch('pageChange/pageChanged', { func: null, params: [] })
      } else {
        this.$emit('update-unsaved-tabs', 'remove', 'idp')
        this.$nextTick(() => {
          if (this.unsavedTabs.length === 0) {
            this.$store.dispatch('pageChange/resetPageChanged')
          }
        })
      }
    }
  },

  created() {
    const _this = this
    this.getSelectedIDPs()
    eventListener.on('getCustomerDetails', function({ node, tab }) {
      _this.getSelectedIDPs()
    })
  },

  beforeDestroy() {
    eventListener.remove('getCustomerDetails')
  },

  deactivated() {
    const isLogin = getIsLogin() ? JSON.parse(getIsLogin()) : false
    if (!this.saveBtnDisabled && this.$route.path === '/customers' && isLogin) {
      this.$message.warning(this.$t('warningNoSave'))
    }
  },

  methods: {
    onSaveClick() {
      this.submitting = true
      selectedCustomerIDPs(this.customerId, {
        idps: this.checkedList.length > 0 ? {
          idp: this.checkedList.map(i => {
            return {
              'idp-name': i
            }
          })
        } : { idp: [] }
      }).then(() => {
        this.submitting = false
        this.$message.success(this.$t('customers.customerIDPSave'))
        this.getSelectedIDPs()
      }).finally(() => {
        this.submitting = false
        this.saveBtnDisabled = true
      })
    },
    restoreIDP() {
      this.getSelectedIDPs()
    },

    async getSelectedIDPs() {
      await getAllIDPs().then(res => {
        const idps = res.idps.idp || []
        this.plainOptions = Array.isArray(idps) ? idps.map(item => item['idp-name']) : [idps].map(item => item['idp-name'])
      })
      getCustomerIDPs(this.customerId).then(res => {
        let idps = res.idps.idp || []
        idps = Array.isArray(idps) ? idps : [idps]
        this.checkedList = idps.map(i => {
          return i['idp-name']
        })
        this.initCheckedList = JSON.parse(JSON.stringify(this.checkedList))
      })
    }
  }
}
</script>

<style scoped lang="less">
.label-color{
  color: rgba(0, 0, 0, 0.5);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.foot-btn{
  width: 100%;
  position: absolute;
  bottom: 0;
  right: 0;
  //width: calc(100% - 285px);
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid rgba(101, 102, 104, 0.16);
  background-color: #fff;
  z-index: 99;
}
.ant-row /deep/.ant-checkbox-group-item{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 80px !important;
}
.ant-row /deep/.ant-checkbox-group {
  max-width: 450px;
}

</style>
