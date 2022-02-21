<template>
  <mf-modal
    :visible="visible"
    width="434px"
    :confirm-loading="confirmLoading"
    @ok="onSaveRecipient"
    @cancel="onCancelModal"
  >
    <span slot="title">
      {{ isEdit ? $t('customers.edit_recipients') : $t('customers.add_recipients') }}
    </span>

    <mf-form
      ref="addRecipientsForm"
      :model="recipientsForm"
      :rules="recipientsRules"
    >
      <a-form-model-item
        :label="$t('userManagement.Name')"
        prop="name"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 15 }"
      >
        <a-input id="recipients-name" v-model="recipientsForm.name" :max-length="30" :disabled="isEdit" />
      </a-form-model-item>
      <a-form-model-item
        v-for="(email, index) in recipientsForm.emails"
        :key="email.key"
        v-bind="formItemLayout"
        :class="index && 'email_item_p33'"
        :label="!index ? $t('customers.email_addresses') : ''"
        :prop="'emails.' + index + '.value'"
        :rules="[
          {
            required: true,
            message: $t('customers.email_required'),
            trigger: 'blur',
          },
          { type: 'email', message: $t('valid.email') }
        ]"
      >
        <a-input
          :id="'emails-' + index + '-value'"
          v-model="email.value"
          :placeholder="$t('customers.please_add_email')"
          style="margin-right: 8px;"
        />
        <a-icon
          v-if="recipientsForm.emails.length > 1"
          class="dynamic-delete-button"
          type="close"
          :disabled="recipientsForm.emails.length === 1"
          @click="removeEmailAddresses(email)"
        />
      </a-form-model-item>
      <a-form-model-item v-bind="formItemLayoutWithOutLabel">
        <a-col>
          <a-button
            id="add-email-addresses"
            type="link"
            class="mf-btn-link-primary add-email-btn"
            :disabled="recipientsForm.emails.length>4"
            @click="addEmailAddresses"
          >
            <a-icon type="plus" />
            {{ $t('customers.add_email') }}
          </a-button>
        </a-col>
      </a-form-model-item>

    </mf-form>
  </mf-modal>
</template>

<script>
import { addCustomerRecipients, updateCustomerRecipients } from '@/api/customers'

export default {
  props: {
    customerId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      isEdit: false,
      confirmLoading: false,
      formItemLayout: {
        labelCol: { span: 8 },
        wrapperCol: { span: 15 }
      },
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          xs: { span: 24, offset: 0 },
          sm: { span: 20, offset: 4 }
        }
      },
      recipientsForm: {
        name: '',
        emails: [
          {
            value: '',
            key: new Date().getTime()
          }
        ]
      },
      recipientsRules: {
        name: [{ required: true, message: this.$t('customers.name_required') }
        // , {validator: validSpecialCharact}
        ],
        email: [{ required: true, message: this.$t('customers.email_required') },
          { type: 'email', message: this.$t('valid.email') }]
      }
    }
  },

  methods: {
    show(data) {
      if (data) {
        this.recipientsForm = data
        this.isEdit = true
      } else {
        this.recipientsForm = {
          name: '',
          emails: [
            {
              value: '',
              key: new Date().getTime()
            }
          ]
        }
        this.isEdit = false
      }
      this.visible = true
    },

    onSaveRecipient() {
      this.$refs.addRecipientsForm.$children[0].validate(valid => {
        if (valid) {
          const { emails = [], name } = this.recipientsForm
          const arr = emails.map(item => item.value)
          const removeDuplicate = [...new Set(arr)]
          let email = ''
          removeDuplicate.forEach((it, index) => {
            if (index === (removeDuplicate.length - 1)) {
              email += it
            } else {
              email += it + ';'
            }
          })

          this.confirmLoading = true
          if (!this.isEdit) {
            addCustomerRecipients({ email, name, customerId: this.customerId })
              .then(res => {
                this.confirmLoading = false
                this.visible = false
                this.$message.success(this.$t('customers.addCustomerRecipientsSuccessfully'))
                this.$refs.addRecipientsForm.$children[0].resetFields()
                this.$emit('reload')
              }).catch(_ => {
                this.confirmLoading = false
              })
          } else {
            updateCustomerRecipients({ customerId: this.customerId, recipientName: name, data: { 'recipient-name': name, 'recipient-emails': email }}).then(() => {
              this.confirmLoading = false
              this.visible = false
              this.$emit('reload')
              this.$refs.addRecipientsForm.$children[0].resetFields()
              this.$message.success(this.$t('customers.editCustomerRecipientsSuccessfully'))
            }).catch(_ => {
              this.confirmLoading = false
            })
          }
        }
      })
    },

    onCancelModal() {
      this.visible = false
      this.$refs.addRecipientsForm.$children[0].resetFields()
    },

    addEmailAddresses() {
      this.recipientsForm.emails.push({
        value: '',
        key: new Date().getTime()
      })
    },

    removeEmailAddresses(item) {
      const index = this.recipientsForm.emails.indexOf(item)
      if (index !== -1) {
        this.recipientsForm.emails.splice(index, 1)
      }
    }
  }
}
</script>

<style scoped lang="less">
.email_item_p33 /deep/ .ant-form-item-control-wrapper{
  margin-left: 33.33%;
}
.dynamic-delete-button{
  font-size: 12px;
  position: absolute;
  right: -12px;
  top: 5px;
  color: #0079EF;
}
.add-email-btn{
  float: right;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
