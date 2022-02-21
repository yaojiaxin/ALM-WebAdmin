<template>
  <a-spin :spinning="false">
    <a-layout>
      <div class="main-header">
        <app-header />
      </div>

      <a-layout class="main-wrapper" :has-sider="true">
        <side-menu v-if="isShowSide" class="side-container" :iscollapsed.sync="iscollapsed" />
        <div
          class="main-container"
          :class="`${ iscollapsed ? 'side-collapsed' : '' }${ isShowSide ? '' : ' main-container-bu' }${checkPermission(['CUSTOMER_CONTEXT_SWITCH']) ? ' main-has-customer': ''}`"
        >
          <div
            v-if="checkPermission(['CUSTOMER_CONTEXT_SWITCH'])"
            :class="`main-customer-wrapper ${isShowSide ? '' : 'no-side'}`"
          >
            {{ $t('activeCustomer') }}:<switch-customer />
            <a-divider type="vertical" />
            {{ $t('customers.my_customer') }}: <span id="my-customer" class="customer_name">{{ customerName }}</span>
          </div>
          <app-main />
        </div>
      </a-layout>

    </a-layout>
  </a-spin>
</template>

<script>
import SideMenu from './components/sideBar/sideMenu'
import AppHeader from './components/headBar/appHeader'
import AppMain from './components/appMain'
import { mapGetters } from 'vuex'
import SwitchCustomer from './components/headBar/customerIcon'

export default {
  components: { SideMenu, AppHeader, AppMain, SwitchCustomer },
  data() {
    return {
      iscollapsed: false
    }
  },
  computed: {
    ...mapGetters(['addRoutes', 'customerList', 'customerId']),

    isShowSide() {
      return this.addRoutes.length > 1
    },

    customerName() {
      const myCustomer = this.customerList.find(i => i['customer-id'] === this.customerId)

      return myCustomer ? myCustomer['customer-name'] : ''
    }
  }
}
</script>

<style lang="less" scoped>

.main-header {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 9;
}

.main-wrapper{
  display: flex;
  padding-top: 56px;
  overflow: hidden;
}

.main-container-bu{
  padding-left: 0px;
}

.main-customer-wrapper{
  position: fixed;
  left: 245px;
  right: 0;
  top: 56px;
  height: 45px;
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  font-size: 16px;
  border-bottom: 1px solid rgba(101, 102, 104, 0.16);
  z-index: 9;
  transition: ease-in;
}
.main-customer-wrapper.no-side{
  left: 0;
}
.side-collapsed{
  .main-customer-wrapper{
    left: 61px;
  }
}
.customer_name{
  font-family: MediumWeb;
  margin-left: 8px;
}

</style>
