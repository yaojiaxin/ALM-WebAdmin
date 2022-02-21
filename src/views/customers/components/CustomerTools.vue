<template>
  <div class="customers-bar">
    <span class="customers-title">
      {{ $t('customers.customers') }}
    </span>

    <!-- refresh -->
    <icon-btn
      id="a-icon-refresh"
      style="margin-left: 24px; "
      :is-disabled="false"
      :icon-title="$t('refresh')"
      icon-style="icon-ConnectRefresh"
      @onClick="onRefresh"
    />

    <!--   create owner   -->
    <icon-btn
      v-if="isShowOwnerCreate"
      id="a_icon_create_owner"
      class="iconAddOwnerStyle"
      :is-disabled="false"
      :icon-title="$t('customers.new_owner')"
      icon-style="icon-AddOwner"
      @onClick="onCreateClick"
    />

    <!--   create end customer   -->
    <icon-btn
      v-if="isShowEndCreate"
      id="a_icon_create_customer"
      :is-disabled="false"
      :icon-title="$t('customers.new_end_customer')"
      icon-style="icon-AddCustomer"
      @onClick="onCreateClick(1)"
    />

    <!--   active customer   -->
    <icon-btn
      v-if="isShowAcitveCusotmer"
      id="a_icon_active_customer"
      :is-disabled="customerStatus"
      :icon-title="$t('project.Activate Customer')"
      icon-style="icon-activeproject"
      @onClick="onToggleStatus"
    />

    <!--   inactive customer   -->
    <icon-btn
      v-if="isShowInactiveCustomer "
      id="a_icon_inactive_customer"
      :is-disabled="!customerStatus"
      :icon-title="$t('project.Deactivate Customer')"
      icon-style="icon-deactive"
      @onClick="onToggleStatus"
    />

    <!-- delete -->
    <icon-btn
      v-if="isShowDelete"
      id="a-icon-delete"
      icon-style="icon-delete"
      :icon-title="$t('Delete')"
      @onClick="onDelete"
    />

    <create-customer ref="createCustomer" @addedCustomer="$emit('reloadTree')" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import IconBtn from '@/components/BtnIcon/index'
import CreateCustomer from './CreateCustomer'
import { ROOT_CUSTOMER_ID } from '@/store/const'
import { activateCustomer, deactivateCustomer, deleteCustomer } from '@/api/customers'

export default {
  components: { IconBtn, CreateCustomer },

  props: {
    customerTree: {
      type: [Array],
      default: () => []
    }
  },

  computed: {
    ...mapGetters(['selectCustomerTreeNode', 'activeCustomerId']),
    isShowOwnerCreate() {
      if (this.activeCustomerId === ROOT_CUSTOMER_ID &&
      this.selectCustomerTreeNode &&
      this.selectCustomerTreeNode['customer-id'] === ROOT_CUSTOMER_ID &&
      this.checkPermission(['MY_CUSTOMER_CONTEXT_CHILD_CUSTOMER_CREATE'], ['SWITCHED_CUSTOMER_CONTEXT_CUSTOMER_CREATE'])) {
        return true
      }
      return false
    },

    isShowEndCreate() {
      if (this.selectCustomerTreeNode && this.customerTree.length > 0) {
        return this.selectCustomerTreeNode['is-owning-customer'] &&
              this.selectCustomerTreeNode['customer-id'] === this.customerTree[0]['customer-id'] &&
              this.checkPermission(['MY_CUSTOMER_CONTEXT_CHILD_CUSTOMER_CREATE'], ['SWITCHED_CUSTOMER_CONTEXT_CUSTOMER_CREATE'])
      }
      return false
    },

    isShowAcitveCusotmer() {
      if (this.customerTree.length > 0 && this.selectCustomerTreeNode) {
        return String(this.selectCustomerTreeNode['customer-id']) !== String(this.activeCustomerId) &&
        this.checkPermission(['MY_CUSTOMER_CONTEXT_DESCENDANT_CUSTOMER_ACTIVATION_STATUS_UPDATE'])
      }

      return false
    },

    isShowInactiveCustomer() {
      if (this.customerTree.length > 0 && this.selectCustomerTreeNode) {
        return String(this.selectCustomerTreeNode['customer-id']) !== String(this.activeCustomerId) &&
        this.checkPermission(['MY_CUSTOMER_CONTEXT_DESCENDANT_CUSTOMER_ACTIVATION_STATUS_UPDATE'])
      }
      return false
    },

    customerStatus() {
      return this.selectCustomerTreeNode['is-active']
    },

    isShowDelete() {
      return this.selectCustomerTreeNode && String(this.selectCustomerTreeNode['customer-id']) !== String(ROOT_CUSTOMER_ID) &&
        String(this.selectCustomerTreeNode['customer-id']) !== String(this.activeCustomerId) &&
        this.checkPermission(['MY_CUSTOMER_CONTEXT_DESCENDANT_CUSTOMER_DELETE'])
    }
  },

  methods: {

    onCreateClick(type) {
      this.$refs.createCustomer.show(!type)
    },

    onToggleStatus() {
      const customerStatus = this.selectCustomerTreeNode['is-active']

      this.$mfConfirm({
        message: customerStatus ? this.$t('customers.set_is_deactivate') : this.$t('customers.set_is_active'),
        onConfirm: () => this.toggleStatus()
      })
    },

    toggleStatus() {
      const customerStatus = this.selectCustomerTreeNode['is-active']
      const fnChangeStatus = customerStatus ? deactivateCustomer : activateCustomer

      return fnChangeStatus(this.selectCustomerTreeNode['customer-id']).then(res => {
        this.$emit('reloadTree', res.customer)
        if (!customerStatus) {
          this.$message.success(this.$t('customers.set_active_successfully'))
        } else {
          this.$message.success(this.$t('customers.set_inactive_successfully'))
        }
      }).catch(() => {

      })
    },

    onDelete() {
      this.$mfConfirm({
        message: this.$t('customers.delete_customer_hint'),
        onConfirm: async() => {
          await deleteCustomer({ customerId: this.selectCustomerTreeNode['customer-id'] }).then((res) => {
            this.$message.success(this.$t('customers.Delete_customers_successfully'))
            this.$emit('reloadTree')
          })
        }
      })
    },

    onRefresh() {
      if (this.$store.getters.isPageChanged) {
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('changePageConfirm'),
          cancelText: this.$t('Cancel'),
          confirmText: this.$t('OK'),
          onConfirm: () => {
            this.$store.dispatch('pageChange/resetPageChanged')
            this.$emit('refresh')
          }
        })
      } else {
        this.$emit('refresh')
      }
    }
  }
}
</script>

<style scoped lang="less">
@import "~@/styles/variables.less";

.customers-bar{
  height: 56px;
  border-bottom:1px solid fade(#656668,16%);
  padding-left: 24px;
  display: flex;
  align-items: center;
  background-color: @white;
  border-left:1px solid fade(#656668,16%);
  border-top:1px solid fade(#656668,16%);
  box-shadow: 2px 0 0 @gray;
  .customers-title{
    font-size: 16px;
    height: 56px;
    line-height: 58px;
    font-family: MediumWeb;
  }
}
</style>
