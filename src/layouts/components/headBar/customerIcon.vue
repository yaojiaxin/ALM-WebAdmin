<template>
  <span>
    <span id="active-customer" class="active-customer customer_name" @click="onShowCustomerSelect">
      <i :class="['iconfont', 'customer-icon', activeCustomerClassName]" />{{ activeCustomerName }}
    </span>

    <mf-modal
      id="change-customers"
      :visible="visible"
      width="430px"
      :mask-closable="false"
      :cancel-text="$t('Cancel')"
      :ok-text="$t('OK')"
      :confirm-loading="submitLoading"
      @cancel="onCancel"
      @close="onCancel"
      @ok="onSaveActiveCustomers"
    >
      <span slot="title">
        {{ $t('customers.change_customer') }}
      </span>

      <div class="mf-subtitle mf-margin-b-24">{{ $t('customers.my_customer') }}</div>

      <p id="customer-name" class="customer_name">{{ myCustomerName }}</p>

      <div class="mf-subtitle mf-margin-b-24">{{ $t('customers.active_customer') }}</div>

      <mf-select
        id="customers-list"
        v-model="activeCustomer"
        :allow-clear="false"
        style="width:252px; margin-left: 14px"
        :min-width="252"
        :dropdown-menu-style="{ maxHeight: 137+ 'px' }"
        @input="onChangeCustomer"
      >
        <a-select-option
          v-for="item in customerList"
          :key="item['customer-id']"
          :value="item['customer-id']"
        >
          <i :class="['iconfont', 'tree-item-icon', item.icon]" />
          {{ item['customer-name'] }}
        </a-select-option>
      </mf-select>

    </mf-modal>
  </span>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'
import { resetRouter } from '@/router/index'
import { eventEmitter } from '@/views/project/event'

export default {
  name: 'CustomerIcon',
  data() {
    return {
      visible: false,
      submitLoading: false,

      activeCustomer: ''
    }
  },

  computed: {
    ...mapGetters(['activeCustomerId', 'permission', 'deniedFeature', 'customerList', 'customerId']),
    activeCustomerIdInt() {
      return parseInt(this.activeCustomerId)
    },

    myCustomerName() {
      const myCustomer = this.customerList.find(i => i['customer-id'] === this.customerId)

      return myCustomer ? myCustomer['customer-name'] : ''
    },

    activeCustomerName() {
      const activeCustomer = this.customerList.find(i => i['customer-id'] === this.activeCustomerIdInt)

      return activeCustomer ? activeCustomer['customer-name'] : ''
    },
    activeCustomerClassName() {
      const activeCustomer = this.customerList.find(i => i['customer-id'] === this.activeCustomerIdInt)

      return activeCustomer ? activeCustomer.icon : ''
    }
  },

  created() {
    // get customr list
    this.$store.dispatch('customer/getCustomers', true).then(customerList => {
      if (customerList) {
        this.activeCustomer = this.activeCustomerIdInt
        this.$store.commit('user/SET_ACTIVECUSTOMER', this.activeCustomer)
      }
    })
  },

  methods: {
    ...mapMutations({
      setCustomerId: 'user/SET_CUSTOMERID'
    }),
    onChangeCustomer(val) {
      this.activeCustomer = val
    },

    isNeedToSave() {
      return new Promise((resolve, reject) => {
        if (this.$store.getters.isPageChanged) {
          this.$mfConfirm({
            title: this.$t('confirm'),
            message: this.$t('changePageConfirm'),
            cancelText: this.$t('Cancel'),
            confirmText: this.$t('OK'),
            onConfirm: async() => {
              return resolve()
            },
            onCloseChange: reject
          })
        } else {
          resolve()
        }
      })
    },

    async onSaveActiveCustomers() {
      this.visible = false
      if (this.activeCustomerId * 1 !== this.activeCustomer * 1) {
        // Determines whether the current page needs to be saved
        try {
          await this.isNeedToSave()
          this.$store.commit('user/SET_ACTIVECUSTOMER', this.activeCustomer)
          // const role = await this.$store.dispatch('user/getRole')

          // change customer,reload permission and reload page
          const accessRoutes = await this.$store.dispatch('permission/generateRoutes', { permission: this.permission || [], deniedFeature: this.deniedFeature || [] })
          resetRouter()

          accessRoutes.forEach(item => {
            this.$router.matcher.addRoute(item)
            if (item.children && item.children.length > 0) {
              item.children.forEach(child => {
                this.$router.matcher.addRoute(item.name, child)
              })
            }
          })
          let path = ''

          if (accessRoutes.length > 1) {
            path = accessRoutes[0].children[0].path
          } else if (accessRoutes.length === 1) {
            path = 'mySettings'
          }
          if (path !== this.$route.path) {
            this.$router.push({ path })
          } else {
            eventEmitter.emit('changeView')
          }
          this.activeCustomer = parseInt(this.activeCustomerId)
        } catch (e) {
          this.activeCustomer = this.activeCustomerId
        }
      }
    },
    onShowCustomerSelect() {
      this.visible = true
    },
    onCancel() {
      this.visible = false
      this.activeCustomer = this.customerList.filter(item => item['customer-name'] === this.activeCustomerName)[0]['customer-id']
    }
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/variables.less';

.ant-divider, .ant-divider-vertical{
  margin: 0 15px;
  height: 18px;
  top: 0;
}
.customer-icon{
  margin-right: 5px;
  font-size: 18px;
}
.customer_name{
  margin-bottom: 24px;
  padding: 0 0 0 14px;
  font-family: MediumWeb;
}
.active-customer{
  color: @brand-blue;
  cursor: pointer;
}

/deep/ .ant-select-dropdown-menu{
  max-height:216px;
}
</style>
