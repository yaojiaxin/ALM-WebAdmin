<template>
  <!--   create owner or customer modal -->
  <mf-modal
    :visible="visible"
    width="430px"
    :confirm-loading="loading"
    @ok="onCreateCustomer"
    @cancel="onCancelModal"
  >
    <span slot="title">
      {{ createTitle }}
    </span>
    <mf-form
      ref="addNameForm"
      :model="createForm"
      :rules="rules"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-model-item :label="$t('userManagement.Name')" prop="name">
        <a-input id="customer-name" v-model="createForm.name" :max-length="30" />
      </a-form-model-item>
      <a-form-model-item :label="$t('customers.tenant')" prop="tenantId">
        <a-input id="customer-tenant-id" v-model="createForm.tenantId" :max-length="20" />
      </a-form-model-item>
    </mf-form>
  </mf-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { addCustomer } from '@/api/customers'

export default {
  data() {
    return {
      loading: false,

      visible: false,

      createForm: {
        name: '',
        tenantId: ''
      },
      createTitle: '',

      rules: {
        name: [{ required: true, message: this.$t('customers.name_required') }
        // , {validator: validSpecialCharactHasChinese}
        ]
        // id: [{
        //   validator: validSpecialCharactHasChinese
        // }]
      },

      isOwner: false
    }
  },
  computed: {
    ...mapGetters(['selectCustomerTreeNode'])
  },
  methods: {

    show(isOwner) {
      this.visible = true
      this.isOwner = isOwner
      this.createTitle = isOwner ? this.$t('customers.create_owner') : this.$t('customers.create_customer')
    },

    onCreateCustomer() {
      this.$refs.addNameForm.$children[0].validate(async valid => {
        if (valid) {
          this.loading = true
          const { name, tenantId } = this.createForm
          const customerId = this.selectCustomerTreeNode['customer-id']

          try {
            const customer = await addCustomer({
              'customer-id': customerId,
              'customer-name': name,
              'tenant-id': tenantId,
              'is-owning-customer': this.isOwner,
              'is-active': true
            })
            // await this.getCustomersList()

            this.loading = false
            this.visible = false
            this.$refs.addNameForm.$children[0].resetFields()

            // if (customer['customer-id'] >= 0) {
            this.$message.success(this.$t('customers.Create_customers_successfully'))
            // } else {
            //   this.$message.error(this.$t('customers.InsufficientNumberOfPermits'))
            // }
            this.$emit('addedCustomer', customer)
          } catch (e) {
            this.loading = false
            this.$emit('addedCustomer')
            // this.getCustomersList()
          }
        }
      })
    },
    onCancelModal() {
      this.visible = false
      this.$refs.addNameForm.$children[0].resetFields()
    }
  }
}
</script>

<style scoped lang="less">
   /deep/ .has-error .ant-form-explain {
    font-size: 13px;
}
</style>
