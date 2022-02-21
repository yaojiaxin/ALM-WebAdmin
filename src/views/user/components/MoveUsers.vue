<template>
  <mf-modal
    id="user_sass_move_users"
    ref="sassMoveUser"
    :visible="visible"
    :confirm-loading="loading"
    :ok-text="$t('OK')"
    width="800px"
    @cancel="onCancel"
    @ok="onMoveUser"
  >

    <span slot="title">
      {{ $t('userManagement.MoveUsersCustomers') }}
    </span>

    <h5 class="move-user-h5">{{ $t('userManagement.SourceCustomerSaasSelectTargetCustomer', { customer: activeCustomerName }) }}</h5>

    <div class="mover-user-customers">
      <!-- <p class="customers-user-p">
        <i class="iconfont icon-UserSet customers-user-icon" />
        {{ $t('userManagement.MicroFocusSaaS') }}
      </p> -->

      <tree
        ref="customersTree"
        :data="customerTree"
        node-key="key"
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
      >
        <i slot="customers" class="iconfont icon-UserSet customers-user-icon" />
        <i slot="owner-active" class="iconfont icon-Customer tree-item-icon" />
        <i slot="owner-inactive" class="iconfont icon-Customer tree-item-icon" />
        <i slot="end-active" class="iconfont icon-customers tree-item-icon" />
        <i slot="end-inactive" class="iconfont icon-customers tree-item-icon" />
      </tree>
    </div>

  </mf-modal>
</template>

<script>
import Tree from '@/components/MFTree/tree'
import { mapGetters } from 'vuex'
import { updateMoveUsers } from '@/api/user'
import { errorMessage } from '@/utils'

export default {
  components: {
    Tree
  },
  props: {
    users: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      // treeData,
      currentNodeKey: '',
      selectCustomerId: null,

      customerTree: []
    }
  },

  computed: {
    ...mapGetters(['customerList', 'activeCustomerId', 'customerId']),
    activeCustomerName() {
      const customers = this.customerList

      if (customers && customers.length) {
        const customer = customers.find(item => item['customer-id'] === parseInt(this.activeCustomerId))

        return customer ? customer['customer-name'] : ''
      }
      return ''
    }
  },

  created() {
    this.$store.dispatch('customer/getCustomers').then(data => {
      this.$store.dispatch('customer/getCustomerTree', this.customerId).then(data => {
        this.customerTree = data
      })
    })
  },

  methods: {
    show() {
      this.visible = true
    },

    // click customer node
    onNodeClick(val) {
      this.selectCustomerId = val['customer-id']
    },

    onCancel() {
      this.visible = false
    },

    onMoveUser() {
      this.visible = false
      this.$mfConfirm({
        title: this.$t('userManagement.MoveUsersAnotherCustomers'),
        message: this.$t('userManagement.Selectedusermembershipprojectscurrentcustomer'),
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('OK'),
        onConfirm: this.submit
      })
    },

    submit() {
      if (this.selectCustomerId !== null) {
        const user = {
          users: {
            user: this.users
          }
        }
        return updateMoveUsers(this.selectCustomerId, user).then(res => {
          this.$message.success(this.$t('userManagement.user_move_success'))
          this.$emit('refreshUser')
        }).catch(error => {
          const resData = error.response && error.response.data
          let msg = ''
          if (resData.QCRestException.ExceptionProperties) {
            const errorMsgArr = resData.QCRestException.ExceptionProperties.ExceptionProperty.SaValue.BulkOperationResponse.BulkEntries.BulkEntry
            if (Array.isArray(errorMsgArr)) {
              msg = errorMsgArr.filter(item => item.Exception).map(item => item.Exception.Title).join('; ')
            } else {
              msg = errorMsgArr.Exception.Title
            }
          } else {
            msg = resData.QCRestException.Title
          }
          errorMessage(msg, resData.QCRestException.StackTrace)
        })
      }
    }

  }
}
</script>

<style lang="less" scoped>

.move-user-h5{
    position: relative;
    color: #333;
    font-weight: bold;
    font-size: 14px;
    line-height: 16px;
    height: 19px;
    padding-left: 16px;
    margin-bottom: 10px;
}

.move-user-h5::before{
    content: ' ';
    position: absolute;
    top: 44%;
    left: 0;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: #0075F3;
    border-radius: 50%;
}

.mover-user-customers{
    width: 100%;
    height: 300px;
    overflow: auto;
    box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(101, 102, 104, 0.16);
    padding: 18px 0 18px 24px;

    .customers-user-p{
      font-size: 16px;
      font-weight: 400;
      color: #323435;
      margin-bottom: 10px;

      .customers-user-icon{
        margin-right: 5px;
      }
    }

    .move-user-tree-two,.move-user-tree-three{
        padding-left: 25px;

    }

    .move-user-treetwo-show,.move-user-treethree-show{
        display: none;
    }

    .customer-name{
        height: 30px;
        line-height: 30px;
    }

    .customer-name:hover {
        color: #0073e7;
        cursor: pointer;
    }
}
</style>
