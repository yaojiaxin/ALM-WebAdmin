<template>
  <div :style="'padding-bottom: 20px; overflow-y: auto; height: 100%'">
    <mf-form
      ref="attributesForm"
      layout="vertical"
      :model="form"
      class="mf-margin-l-24"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      style="padding: 0 24px 0 0"
      :rules="rules"
    >
      <div>
        <!-- General -->
        <div class="mf-subtitle mf-margin-b-24">{{ $t('customers.general') }}</div>

        <a-row :gutter="16">
          <a-col :span="8" :sm="12" :md="12" :lg="24" :xl="12" :xxl="8">
            <a-form-item :label="$t('userManagement.userToolBar.deleteSuccessTableTitle')">
              <a-input v-model="form['customer-name']" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="8" :sm="12" :md="12" :lg="24" :xl="12" :xxl="8">
            <a-form-item :label="$t('customers.tenant')">
              <a-input id="tenant-id" v-model="form['tenant-id']" :max-length="20" @change="onChangeTenant" />
            </a-form-item>
          </a-col>
          <a-col :span="8" :sm="12" :md="12" :lg="24" :xl="12" :xxl="8">
            <a-form-item :label="$t('status')">
              <a-input
                id="customer-status"
                :active-value="form['is-active'] ? 'Active':'Inactive'"
                :value="form['is-active']? $t('project.active'): $t('project.inactive')"
                disabled
                :style="{color: form['is-active']?'#1aac60':'#e5004c'}"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <div>
        <!-- Statistics -->
        <div class="mf-subtitle mf-margin-b-24">{{ $t('customers.statistics') }}</div>

        <a-row :gutter="16">
          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-item :label="$t('customers.number_of_domain')">
              <a-input v-model="form['domain-count']" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-item :label="$t('customers.number_of_project')">
              <a-input v-model="form['project-count']" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-item :label="$t('customers.number_of_user')">
              <a-input v-model="form['user-count']" disabled />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <div v-if="isSiteAdmin()">
        <!-- Quality Insight -->
        <div class="mf-subtitle mf-margin-b-24">{{ $t('customers.global_search') }}</div>

        <a-row :gutter="16">
          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8" style="margin: 0 0 32px 12px;">
            <a-button
              id="customer-quality-insight-btn"
              class="mf-btn-dashed"
              :disabled="!isSiteQualityInsightEnabled"
              @click="onQualityInsightBtnClick"
            >
              {{ qualityInsightBtnText }}
            </a-button>
          </a-col>
        </a-row>
      </div>

    </mf-form>

    <div style="padding:24px 24px 0 24px; border-top: 1px solid #DCDEDF">
      <!-- Recipients -->
      <div class="mf-subtitle mf-margin-b-24">{{ $t('customers.recipients_title') }}</div>

      <a-button
        v-if="isShowSaveBtn"
        id="add-recipients"
        type="primary"
        icon="plus"
        class="mf-margin-b-24"
        :disabled="recipientTableData.length>9"
        @click="onClickAddRecipients"
      >{{ $t('customers.add_recipients') }}</a-button>

      <a-table
        id="recipients-table"
        ref="recipientsTable"
        class="recipients-table"
        row-key="name"
        :scroll="{y: tableHeight}"
        :data-source="recipientTableData"
        :columns="columns"
        :pagination="false"
      >
        <!-- column title slots -->
        <template v-for="item in columns">
          <a-tooltip
            :slot="item.dataIndex"
            :key="item.dataIndex"
            :title="item.titleText"
          >
            <span class="table-column-title-text">{{ item.titleText }}</span>
          </a-tooltip>
        </template>

        <template slot="action" slot-scope="text, record, index">
          <icon-btn
            style="margin: 0 14px 0 0"
            icon-style="icon-edit"
            :icon-title="$t('customers.edit_recipients')"
            @onClick="() => onClickEditRecipients({text, record, index})"
          />
          <icon-btn
            style="margin: 0 14px 0 0"
            icon-style="icon-delete"
            :icon-title="$t('customers.delete_recipients')"
            @onClick="() => onClickDeleteRecipients({text, record, index})"
          />
        </template>
      </a-table>

      <!--  save button  -->
      <div v-if="isShowSaveBtn" class="foot-btn">
        <a-button id="restore-attributes" :disabled="isDisabled || submitting" style="margin-right: 8px;" class="mf-btn-dashed" @click="restoreAttributes"> {{ $t('Restore') }} </a-button>
        <a-button id="save-attributes" :loading="submitting" :disabled="isDisabled" type="primary" @click="onSaveClick"> {{ $t('Save') }} </a-button>
      </div>
    </div>

    <recipient-form ref="recipientForm" :customer-id="selectCustomerTreeNode && selectCustomerTreeNode['customer-id']" @reload="getRecipients" />

  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import RecipientForm from './RecipientForm'
import { deleteCustomerRecipients, getCustomerDetails, getCustomerRecipients, updateCustomerDetails } from '@/api/customers'
import { isSiteAdmin } from '@/utils/permission'
import { mapGetters } from 'vuex'
import { eventListener } from '@/views/project/event'
import { isChangeObjorArr, sorting, autoTableHeight } from '@/utils'
import { getIsLogin } from '@/utils/auth'

export default {
  name: 'Attributes',

  components: { IconBtn, RecipientForm },

  props: {
    selectedCustomerId: {
      type: [String, Number],
      default: 0
    },
    unsavedTabs: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      isDisabled: true,
      submitting: false,
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },

      form: {
        'customer-name': '',
        'tenant-id': '',
        'qis-enabled': false,
        'is-active': '',
        'domain-count': 0,
        'project-count': 0,
        'user-count': 0
      },

      rules: {
        'tenant-id': [
          { message: this.$t('the_length', { num: 20 }), trigger: 'blur', max: 20 }
        ]
      },

      recipientTableData: [],

      columns: [
        {
          titleText: this.$t('customers.recipient_name'),
          slots: { title: 'recipient-name' },
          dataIndex: 'recipient-name',
          key: 'name',
          ellipsis: true,
          sorter: (a, b) => sorting(a.name, b.name)
        },
        {
          titleText: this.$t('customers.email_Addresses'),
          slots: { title: 'recipient-emails' },
          dataIndex: 'recipient-emails',
          key: 'email',
          ellipsis: true
        },
        {
          titleText: this.$t('customers.actions'),
          slots: { title: 'operation' },
          dataIndex: 'operation',
          key: 'operation',
          width: 150,
          scopedSlots: { customRender: 'action' }
        }
      ],

      isInit: false,
      initForm: {},

      tableHeight: 100
    }
  },

  computed: {
    ...mapGetters(['selectCustomerTreeNode', 'customerId', 'activeCustomerId', 'isSiteQualityInsightEnabled']),
    isShowSaveBtn() {
      // have my customer permissions and now I'm selecting my customer
      if (this.checkPermission(['MY_CUSTOMER_CONTEXT_MY_CUSTOMER_ATTRIBUTES_UPDATE']) &&
          this.selectCustomerTreeNode &&
          this.selectCustomerTreeNode['customer-id'] === this.customerId * 1) {
        return true
      }
      // Customer that has my descendant customer authority and is currently selected that is not my customer
      return !!(this.checkPermission(['MY_CUSTOMER_CONTEXT_DESCENDANT_CUSTOMER_ATTRIBUTES_UPDATE']) &&
          this.selectCustomerTreeNode &&
          this.selectCustomerTreeNode['customer-id'] !== this.customerId * 1)
    },

    qualityInsightBtnText() {
      return this.form['qis-enabled']
        ? this.$t('project.disableQualityInsight')
        : this.$t('project.enableQualityInsight')
    }
  },

  watch: {
    selectCustomerTreeNode(val) {
      if (val && !this.isInit) {
        this.getCustomerAttrbutes()
        this.getRecipients()
      }
    },
    form: {
      handler: function(form) {
        this.isDisabled = isChangeObjorArr(form, this.initForm)
        if (!this.isDisabled) {
          this.$emit('update-unsaved-tabs', 'add', 'attributes')
          this.$store.dispatch('pageChange/pageChanged', { func: null, params: [] })
        } else {
          this.$emit('update-unsaved-tabs', 'remove', 'attributes')
          this.$nextTick(() => {
            if (this.unsavedTabs.length === 0) {
              this.$store.dispatch('pageChange/resetPageChanged')
            }
          })
        }
      },
      deep: true
    }
  },

  activated() {
    this.isInit = true
    this.getTableHeight()
  },

  created() {
    const _this = this
    eventListener.on('getCustomerDetails', function({ node, tab }) {
      _this.isInit = true
      _this.getCustomerAttrbutes()
      _this.getRecipients()
    })

    // only SA can do quality insight
    // if tools quality insight haven't been open, it needs to request
    if (isSiteAdmin() && this.isSiteQualityInsightEnabled === undefined) {
      this.$store.dispatch('qualityInsight/getIsSiteQualityInsightEnabled')
    }
  },

  mounted() {
    this.getTableHeight()
    window.addEventListener('resize', this.getTableHeight)
  },

  beforeDestroy() {
    eventListener.remove('getCustomerDetails')
    window.removeEventListener('resize', this.getTableHeight)
  },

  deactivated() {
    const isLogin = getIsLogin() ? JSON.parse(getIsLogin()) : false
    if (!this.isDisabled && this.$route.path === '/customers' && isLogin) {
      this.$message.warning(this.$t('warningNoSave'))
    }
  },

  methods: {
    isSiteAdmin,

    getTableHeight() {
      this.tableHeight = autoTableHeight(this.$refs.recipientsTable, 115, 0)
    },

    getCustomerAttrbutes() {
      getCustomerDetails({ id: this.selectCustomerTreeNode['customer-id'] })
        .then(this.handleCustomerDataResponse)
        .catch(() => {})
    },

    restoreAttributes() {
      this.getCustomerAttrbutes()
    },

    getRecipients() {
      getCustomerRecipients({ id: this.selectCustomerTreeNode['customer-id'] }).then(res => {
        let table = res['customer-recipients'] && res['customer-recipients']['customer-recipient']
        table = table ? Array.isArray(table) ? table : [table] : []
        table = table.map((item, index) => {
          return { ...item, name: index }
        })
        this.recipientTableData = table
      }).catch(() => {

      }).finally(() => {
        this.$nextTick(() => {
          this.getTableHeight()
        })
      })
    },

    onClickAddRecipients() {
      this.$refs.recipientForm.show()
    },

    onClickEditRecipients({ text, record, index }) {
      const emailArr = record['recipient-emails'].split(';')
      const editData = {
        name: record['recipient-name'],
        emails: emailArr.map((it, i) => {
          return {
            value: it,
            key: i
          }
        })
      }
      this.$refs.recipientForm.show(editData)
    },

    onClickDeleteRecipients({ record }) {
      this.$mfConfirm({
        title: this.$t('customers.delete_recipients'),
        message: this.$t('customers.delete_message', { name: record['recipient-name'] }),
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('OK'),
        onConfirm: async() => {
          await deleteCustomerRecipients({ customerId: this.selectCustomerTreeNode['customer-id'], recipientName: record['recipient-name'] }).then(res => {
            this.$message.success(this.$t('customers.deleteCustomerRecipientsSuccessfully'))
          })
          this.getRecipients()
        }
      })
    },

    // change tenant id
    onChangeTenant(e) {
      this.form = {
        ...this.form,
        'tenant-id': e.target.value
      }
    },

    onSaveClick() {
      this._onUpdateCustomerDetails()
    },

    _onUpdateCustomerDetails() {
      const postData = { ...this.form }
      updateCustomerDetails({ id: this.selectCustomerTreeNode['customer-id'], data: postData }).then((res) => {
        this.$message.success(this.$t('customers.attributes_update_successful'))
        this.submitting = false
        this.isDisabled = true
        this.handleCustomerDataResponse(res)
      }).catch(_ => {
        this.submitting = false
      })
    },

    onQualityInsightBtnClick() {
      this.$mfConfirm({
        message: this.form['qis-enabled']
          ? this.$t('customers.confirmDisableCustomerQuallityInsight')
          : this.$t('customers.confirmEnableCustomerQualityInsight'),
        onConfirm: () => {
          return updateCustomerDetails({
            id: this.selectCustomerTreeNode['customer-id'],
            data: { 'qis-enabled': !this.form['qis-enabled'] }
          })
            .then(res => {
              this.handleCustomerDataResponse(res)

              this.$message.success(this.$t(
                this.form['qis-enabled']
                  ? 'customers.enableQualityInsightSuccessfully'
                  : 'customers.disableQualityInsightSuccessfully'
              ))
            })
            .catch(console.log)
        }
      })
    },

    handleCustomerDataResponse(res) {
      this.form = res.customer
      this.initForm = JSON.parse(JSON.stringify(this.form))
    }
  }
}
</script>

<style scoped lang="less">

/deep/ .mf-button-dashed,.ant-btn-dashed:hover{
  color: #2795f5!important;
  background-color: #fff !important;
  border-color: #2795f5;
}

.mf-margin-l-24 /deep/ .ant-form-item-label{
  padding-right: 16px !important;
  label{
    display: block;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
}

</style>
