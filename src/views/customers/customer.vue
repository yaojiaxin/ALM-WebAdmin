<template>
  <div class="customer-page mf-box-shadow">
    <customer-tools :customer-tree="customerTree" @refresh="() => onReloadTree(true, selectCustomerTreeNode)" @reloadTree="(node) => onReloadTree(true, node)" />

    <div :class="['customer-content', (!checkPermission(['MY_CUSTOMER_CONTEXT_MY_CUSTOMER_ATTRIBUTES_UPDATE']) || !checkPermission(['MY_CUSTOMER_CONTEXT_MY_CUSTOMER_LICENSE_UPDATE']))&&'customer-content-not-update']">

      <div class="customer-tree">
        <tree
          ref="customersTree"
          :data="customerTree"
          node-key="customer-id"
          :current-node-key="currentNodeKey"
          :can-show-remove="false"
          :expand-all="true"
          :props="{
            children: 'sub-customers',
            label: 'customer-name',
            disabled: 'disabled',
            key: 'customer-id',
            isLeaf: 'isLeaf'
          }"
          @node-click="onNodeClick"
          @node-remove="onNodeRemove"
        >
          <svg-icon slot="owner-inactive" icon-class="owner-customer-inactive" />
          <svg-icon slot="owner-active" icon-class="owner-customer-active" />
          <svg-icon slot="end-inactive" icon-class="end-customer-inactive" />
          <svg-icon slot="end-active" icon-class="end-customer-active" />
          <i slot="customers" class="iconfont icon-CustomerSetting tree-item-icon" />
        </tree>

      </div>

      <div :class="['customer-right-tab', 'customer-right-tab-padding-bottom', (!checkPermission(['MY_CUSTOMER_CONTEXT_MY_CUSTOMER_ATTRIBUTES_UPDATE']) || !checkPermission(['MY_CUSTOMER_CONTEXT_MY_CUSTOMER_LICENSE_UPDATE']))&&'customer-right-tab-no-save']">
        <a-tabs v-model="tab" default-active-key="attributes" @change="onTabChange">
          <a-tab-pane v-if="isShowAttr" key="attributes" :tab="$t('customers.attributes')">
            <keep-alive>
              <attributes v-if="tab === 'attributes'" :unsaved-tabs="unsavedTabs" @update-unsaved-tabs="updateUnsavedTabs" />
              <!-- <Attributes
                :selected-customer-id="selectedID"
                @addRecipients="addRecipients"
              /> -->
            </keep-alive>
          </a-tab-pane>

          <a-tab-pane v-if="isShowLicense" key="license" :tab="$t('customers.license')">
            <keep-alive>
              <License v-if="tab === 'license'" ref="license" :unsaved-tabs="unsavedTabs" @update-unsaved-tabs="updateUnsavedTabs" />
            </keep-alive>
          </a-tab-pane>

          <a-tab-pane v-if="isShowLDAP" key="ldap" :tab="$t('customers.customers_LDAP')">
            <keep-alive>
              <LDAP v-if="tab === 'ldap'" :unsaved-tabs="unsavedTabs" @update-unsaved-tabs="updateUnsavedTabs" />
              <!-- <LDAP @showSaveBtn="onSetSaveBtnIsShow" /> -->
            </keep-alive>
          </a-tab-pane>

          <a-tab-pane v-if="isShowIDP" key="idp" :tab="$t('customers.customers_IDP')">
            <keep-alive>
              <IDP v-if="tab === 'idp'" :unsaved-tabs="unsavedTabs" @update-unsaved-tabs="updateUnsavedTabs" />
              <!-- <IDP @showSaveBtn="onSetSaveBtnIsShow" /> -->
            </keep-alive>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CustomerTools from './components/CustomerTools'
import Tree from '@/components/MFTree/tree'
import Attributes from '@/views/customers/components/Attributes'
import LDAP from '@/views/customers/components/LDAP'
import IDP from '@/views/customers/components/IDP'
import License from '@/views/customers/components/License'
import { ROOT_CUSTOMER_ID } from '@/store/const'
import { eventEmitter, eventListener } from '@/views/project/event'
import { deleteCustomer } from '@/api/customers'
import { HELP_ON_THIS_PAGE } from 'config/help'

export default {
  components: { CustomerTools, Tree, Attributes, License, LDAP, IDP },

  data() {
    return {
      tab: 'attributes',

      customerTree: [],

      currentNodeKey: '',

      currentNode: null,

      unsavedTabs: []
    }
  },

  computed: {
    ...mapGetters(['selectCustomerTreeNode', 'activeCustomerId', 'customerId']),
    isShowAttr() {
      if (this.checkPermission(['MY_CUSTOMER_CONTEXT_MY_CUSTOMER_ATTRIBUTES_READ']) && this.checkPermission(['MY_CUSTOMER_CONTEXT_DESCENDANT_CUSTOMER_ATTRIBUTES_READ'])) {
        return true
      } else if (this.checkPermission(['MY_CUSTOMER_CONTEXT_MY_CUSTOMER_ATTRIBUTES_READ']) && !this.checkPermission(['MY_CUSTOMER_CONTEXT_DESCENDANT_CUSTOMER_ATTRIBUTES_READ'])) {
        return this.selectCustomerTreeNode && this.selectCustomerTreeNode['customer-id'] * 1 === parseInt(this.customerId)
      } else if (!this.checkPermission(['MY_CUSTOMER_CONTEXT_MY_CUSTOMER_ATTRIBUTES_READ']) && this.checkPermission(['MY_CUSTOMER_CONTEXT_DESCENDANT_CUSTOMER_ATTRIBUTES_READ'])) {
        return this.selectCustomerTreeNode && this.selectCustomerTreeNode['customer-id'] * 1 !== parseInt(this.customerId)
      }
      return false
    },

    isShowLicense() {
      if (this.checkPermission(['MY_CUSTOMER_CONTEXT_MY_CUSTOMER_LICENSE_READ']) && this.checkPermission(['MY_CUSTOMER_CONTEXT_DESCENDANT_CUSTOMER_LICENSE_READ'])) {
        return true
      } else if (this.checkPermission(['MY_CUSTOMER_CONTEXT_MY_CUSTOMER_LICENSE_READ']) && !this.checkPermission(['MY_CUSTOMER_CONTEXT_DESCENDANT_CUSTOMER_LICENSE_READ'])) {
        return this.selectCustomerTreeNode && this.selectCustomerTreeNode['customer-id'] * 1 === parseInt(this.customerId)
      } else if (!this.checkPermission(['MY_CUSTOMER_CONTEXT_MY_CUSTOMER_LICENSE_READ']) && this.checkPermission(['MY_CUSTOMER_CONTEXT_DESCENDANT_CUSTOMER_LICENSE_READ'])) {
        return this.selectCustomerTreeNode && this.selectCustomerTreeNode['customer-id'] * 1 !== parseInt(this.customerId)
      }

      return false
    },

    isShowLDAP() {
      return this.checkPermission(['CUSTOMER_LDAP_MANAGEMENT'])
    },

    isShowIDP() {
      return this.checkPermission(['CUSTOMER_IDP_MANAGEMENT'])
    }
  },

  watch: {
    unsavedTabs: function(val) {
      if (val.length === 0) {
        this.$store.dispatch('pageChange/resetPageChanged')
      }
    }
  },

  created() {
    this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.customers.attributes)
  },

  mounted() {
    // this.getCustomerTree()
    this.onReloadTree(true)
    this.reInitTab()
  },

  beforeDestroy() {
    eventListener.remove('getCustomerDetails')
  },

  methods: {
    reInitTab() {
      if (this.isShowAttr) {
        if (this.isShowLicense && this.tab === 'license') {
          this.tab = 'license'
        } else {
          this.tab = 'attributes'
        }
      } else if (this.isShowLicense) {
        this.tab = 'license'
      } else if (this.isShowLDAP) {
        this.tab = 'ldap'
      } else if (this.isShowIDP) {
        this.tab = 'idp'
      }
    },
    getCustomerTree() {
      this.$store.dispatch('customer/getCustomerTree').then(data => {
        this.customerTree = data
        this.$store.commit('customer/SET_CUSTOMERTREENODE', this.customerTree[0])

        this.$nextTick(function() {
          this.currentNode = this.customerTree[0]
          this.$refs.customersTree.setCurrentNode(this.currentNode)
          this.reInitTab()
          if (this.isShowAttr || this.isShowLicense || this.isShowLDAP || this.isShowIDP) {
            eventEmitter.emit('getCustomerDetails', { node: this.currentNode, tab: this.tab })
          }
        })
      })
    },

    onRefresh() {
      this.getCustomerTree()
    },

    onReloadTree(isSetDefault, node) {
      this.$store.dispatch('customer/getCustomers', true).then(() => {
        this.$store.dispatch('customer/getCustomerTree').then(data => {
          this.customerTree = data

          if (isSetDefault) {
            this.$nextTick(function() {
              if (node) {
                this.currentNode = node
              } else {
                this.currentNode = this.customerTree[0]
              }

              this.$store.commit('customer/SET_CUSTOMERTREENODE', this.currentNode)
              this.$refs.customersTree.setCurrentNode(this.currentNode)
              if (this.isShowAttr || this.isShowLicense || this.isShowLDAP || this.isShowIDP) {
                eventEmitter.emit('getCustomerDetails', { node: this.currentNode, tab: this.tab })
              }
            })
          } else {
            this.$store.commit('customer/SET_CUSTOMERTREENODE', this.customerTree[0])
          }
        })
      })
    },

    canShowRemove(node) {
      return String(node.data['customer-id']) !== String(ROOT_CUSTOMER_ID) &&
          String(node.data['customer-id']) !== String(this.activeCustomerId) &&
      this.checkPermission(['MY_CUSTOMER_CONTEXT_DESCENDANT_CUSTOMER_DELETE'])
    },

    onNodeClick(data, node) {
      if (this.$store.getters.isPageChanged && this.selectCustomerTreeNode['customer-id'] !== data['customer-id']) {
        this.$refs.customersTree.setCurrentNode(this.selectCustomerTreeNode)
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('changePageConfirm'),
          cancelText: this.$t('Cancel'),
          confirmText: this.$t('OK'),
          onConfirm: () => {
            this.$refs.customersTree.setCurrentNode(data)
            this.$store.dispatch('pageChange/resetPageChanged')
            this.doClick(data, node)
          }
        })
      } else {
        this.doClick(data, node)
      }
    },

    doClick(data, node) {
      this.$store.commit('customer/SET_CUSTOMERTREENODE', data)
      this.reInitTab()
      this.$nextTick(function() {
        if (this.isShowAttr || this.isShowLicense || this.isShowLDAP || this.isShowIDP) {
          eventEmitter.emit('getCustomerDetails', { node: this.currentNode, tab: this.tab })
        }
      })
    },

    onNodeRemove(data, node) {
      this.$mfConfirm({
        message: this.$t('customers.delete_customer_hint'),
        onConfirm: async() => {
          await deleteCustomer({ customerId: data['customer-id'] }).then((res) => {
            this.$message.success(this.$t('customers.Delete_customers_successfully'))
            this.onReloadTree(true)
          })
        }
      })
    },

    onTabChange() {
      if (['attributes', 'license'].includes(this.tab)) { this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.customers[this.tab]) }
    },

    updateUnsavedTabs(type, tab) {
      if (type === 'add') {
        this.unsavedTabs.push(tab)
        this.unsavedTabs = [...new Set(this.unsavedTabs)]
      } else {
        this.unsavedTabs = this.unsavedTabs.filter(item => item !== tab)
      }
    }
  }
}

</script>

<style scoped lang="less">
@import "~@/styles/variables.less";
.customer-page{
  width: 100%;
  background-color: @white;
}

.customer-content{
  position: relative;
  width: 100%;
  height: calc(100vh - 203px);
  display: flex;
  border-left:1px solid fade(#656668,16%);
}

.customer-tree{
  width: 285px;
  min-width: 285px;
  height: auto;
  overflow: auto;
  border-right: 1px solid fade(#656668,16%);
}

.customer-right-tab{
  position: relative;
  flex: 1;
  width: 100%;
  overflow: hidden;
  /deep/ .ant-tabs-nav-container{
    padding-left: 24px;
    font-family: MediumWeb;
    height: 45px;
  }
  /deep/.ant-tabs-content{
    height: calc(100vh - 259px);
    flex: 1 1 auto;
    padding-bottom: 60px;
  }
}
.customer-right-tab-no-save{
  /deep/.ant-tabs-content {
    // height: calc(100vh - 220px);
  }
}
.customer-right-tab-padding-bottom{
  padding-bottom: 64px;
}
.customer-content-not-update{
  // height: calc(100vh - 203px);
}

</style>

<style lang="less">
.customer-page {
  .foot-btn{
    width: 100%;
    height: 64px;
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 0 24px 0 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    border-top: 1px solid rgba(101, 102, 104, 0.16);
    background-color: #fff;
    z-index: 99;
  }
}
</style>
