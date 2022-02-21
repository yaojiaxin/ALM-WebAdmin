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

    <!-- LDAP servers -->
    <a-row :gutter="[0, 30]">
      <a-col :sm="5" :md="6" :lg="5" :xl="4" :xxl="3" class="label-color">
        <a-tooltip :title="$t('customers.LDAP_servers')" placement="bottom">
          {{ $t('customers.LDAP_servers') }}
        </a-tooltip>
      </a-col>
      <a-col :span="16" :sm="12" :md="12" :lg="13" :xl="16" :xxl="16">
        <a-checkbox-group v-model="checkedList" :options="plainOptions" />
      </a-col>
    </a-row>

    <!--  save button  -->
    <div class="foot-btn">
      <a-button id="restore-attributes" :disabled="saveBtnDisabled || submitting" style="margin-right: 8px;" class="mf-btn-dashed" @click="restoreLDAP"> {{ $t('Restore') }} </a-button>

      <a-button :loading="submitting" :disabled="saveBtnDisabled" type="primary" @click="onSaveClick"> {{ $t('Save') }} </a-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { eventListener } from '@/views/project/event'
import { getCustomerLDAPs, selectedCustomerLDAPs, getAllLDAPSaas, getAllLDAPOp } from '@/api/customers'
import { isChangeObjorArr } from '@/utils'
import { SERVER_TYPE } from '@/store/const'
import { getIsLogin } from '@/utils/auth'
export default {
  name: 'LDAP',

  props: {
    unsavedTabs: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      submitting: false,
      saveBtnDisabled: true,
      getAllLDAP: null,
      checkedList: [],
      initCheckedList: [],
      ldaps: [],
      SERVER_TYPE,
      plainOptions: [],
      selectedCustomer: []
    }
  },

  computed: {
    ...mapGetters(['selectCustomerTreeNode', 'serverType']),
    customerName() {
      return this.selectCustomerTreeNode && this.selectCustomerTreeNode['customer-name']
    },

    customerId() {
      return this.selectCustomerTreeNode && this.selectCustomerTreeNode['customer-id']
    }
  },

  watch: {
    checkedList(checked) {
      this.saveBtnDisabled = isChangeObjorArr(checked, this.initCheckedList)
      if (!this.saveBtnDisabled) {
        this.$emit('update-unsaved-tabs', 'add', 'ldap')
        this.$store.dispatch('pageChange/pageChanged', { func: null, params: [] })
      } else {
        this.$emit('update-unsaved-tabs', 'remove', 'ldap')
        this.$nextTick(() => {
          if (this.unsavedTabs.length === 0) {
            this.$store.dispatch('pageChange/resetPageChanged')
          }
        })
      }
    }
  },

  created() {
    this.getAllLDAP = this.serverType === SERVER_TYPE.Saas ? getAllLDAPSaas : getAllLDAPOp
    const _this = this
    this.getCustomerLDAP()
    eventListener.on('getCustomerDetails', function({ node, tab }) {
      _this.getCustomerLDAP()
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
    getCustomerLDAP() {
      getCustomerLDAPs(this.customerId).then(res => {
        let ldaps = res.ldaps.ldap || []
        ldaps = Array.isArray(ldaps) ? ldaps : [ldaps]
        this.checkedList = ldaps.map(i => {
          return i['ldap-id']
        })
        this.initCheckedList = JSON.parse(JSON.stringify(this.checkedList))
      })
      if (this.serverType === SERVER_TYPE.Saas) {
        getAllLDAPSaas().then(res => {
          const ldaps = res.ldaps.ldap || []
          // this.plainOptions = Array.isArray(ldaps) ? ldaps.map(item => item.label) : [ldaps].map(item => item.label)
          this.plainOptions = Array.isArray(ldaps) ? ldaps.map(item => {
            return { label: item['ldap-name'], value: item['ldap-id'] }
          }) : [ldaps].map(item => {
            return { label: item['ldap-name'], value: item['ldap-id'] }
          })
          this.ldaps = Array.isArray(ldaps) ? ldaps : [ldaps]
        })
      } else {
        getAllLDAPOp().then(res => {
          const ldaps = res['ldap-servers']['ldap-server'] || []
          this.plainOptions = Array.isArray(ldaps) ? ldaps.map(item => {
            return { label: item.label, value: item['ldap-id'] }
          }) : [ldaps].map(item => {
            return { label: item.label, value: item['ldap-id'] }
          })
          this.ldaps = Array.isArray(ldaps) ? ldaps : [ldaps]
        })
      }
    },
    restoreLDAP() {
      this.getCustomerLDAP()
    },

    onSaveClick() {
      this.submitting = true
      this.selectedCustomer = {
        ldaps: this.checkedList.length > 0 ? {
          ldap: this.checkedList.map(i => {
            return {
              'ldap-id': i
            }
          })
        } : { ldap: [] }
      }

      selectedCustomerLDAPs(this.customerId, this.selectedCustomer).then(() => {
        this.$message.success(this.$t('customers.customerLDAPSave'))
        this.getCustomerLDAP()
      }).finally(() => {
        this.submitting = false
        this.saveBtnDisabled = true
      })
    }
  }
}
</script>

<style scoped lang="less">
.label-color{
  color: rgba(0, 0, 0, 0.5)
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
