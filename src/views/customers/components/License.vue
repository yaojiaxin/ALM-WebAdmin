<template>
  <div :style="'padding-bottom: 20px; overflow-y: auto; height: 100%'">
    <mf-form
      ref="attributesForm"
      layout="horizontal"
      :model="form"
      class="mf-margin-l-24"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      style="padding: 0 24px 0 0"
    >
      <div>
        <!-- license general -->
        <div class="mf-subtitle mf-margin-b-24">{{ $t('customers.general') }}</div>
        <a-row :gutter="16">
          <a-col :span="12" :sm="24" :md="24" :lg="24" :xl="12" :xxl="9">
            <a-form-item :label="$t('customers.license_expiration_date')">
              <mf-date-picker
                v-show="isFormateDate"
                id="customers-license-date"
                v-model="form.date"
                :default-value="form.date"
                :disabled="isRootCustomer"
                value-format="MM/DD/YYYY"
                @change="onDateChange"
              />
              <a-input v-if="!isFormateDate" :value="$t('customers.unlimited')" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-item :label="$t('customers.projects_limit')">
              <a-input id="license-limit" v-model="form.limit" :disabled="isRootCustomer" :max="MAXLENGTH" @change="onLimitChange" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </mf-form>

    <div v-if="checkPermission(['SAAS_ALM_LICENSE_VIEW'])" style="padding: 24px 24px 0 24px;border-top: 1px solid #DCDEDF">
      <div class="mf-subtitle mf-margin-b-24">{{ $t('customers.alm_license_assignments') }}</div>
      <mf-table
        id="assignments-table"
        ref="licenceTable"
        class="customers-licenses-assignment-table"
        row-key="name"
        :loading="tableLoading"
        :show-pagionation="false"
        :data="getCustomerLicense"
        :columns="isRootCustomer ? rootColumns : columns"
      >
        <!-- column title slots -->
        <template v-for="item in isRootCustomer ? rootColumns : columns">
          <a-tooltip
            :slot="item.dataIndex"
            :key="item.dataIndex"
            :title="item.titleText"
          >
            <span class="table-column-title-text">{{ item.titleText }}</span>
          </a-tooltip>
        </template>

        <template slot="assignment" slot-scope="text,record,index">
          <editable-cell
            v-if="record.key!=='alm_lic_type_402'"
            ref="editableRef"
            :key="'assignment'"
            :text="text"
            :keys="'assignment'"
            :licenses-max-length="record.total"
            :tag="String('tag-'+record.key)"
            :no-saved.sync="saveBtnDisabled"
            @change="onAssignmentItemChange($event, record, index)"
          />
          <span v-if="record.key==='alm_lic_type_402'" class="editable-cell-text-wrapper">{{ text }}</span>
        </template>

      </mf-table>
    </div>

    <!--  save button  -->
    <div v-if="checkPermission(['MY_CUSTOMER_CONTEXT_MY_CUSTOMER_LICENSE_UPDATE', 'MY_CUSTOMER_CONTEXT_DESCENDANT_CUSTOMER_LICENSE_UPDATE'])" :loading="submitting" class="foot-btn">
      <a-button id="restore-attributes" :disabled="isDisabled || submitting" style="margin-right: 8px;" class="mf-btn-dashed" @click="restoreLiceses"> {{ $t('Restore') }} </a-button>
      <a-button id="save-license" :disabled="saveBtnDisabled" type="primary" :loading="submitting" @click="onSaveClick"> {{ $t('Save') }} </a-button>
    </div>

  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import { MAXLENGTH } from '@/store/const'
import EditableCell from '@/views/licenses/management/components/EditableCell'
import { eventListener } from '@/views/project/event'
import { getCustomerLicenses, updateCustomerLicenses } from '@/api/customers'
import { isChangeObjorArr } from '@/utils'
import { getIsLogin } from '@/utils/auth'

export default {
  name: 'License',
  components: {
    EditableCell
  },
  props: {
    unsavedTabs: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      MAXLENGTH,
      licenseTableData: [],
      saveBtnDisabled: true,
      changeLicence: true,
      tableLoading: false,
      submitting: false,
      first: true,
      isDisabled: true,
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      hasError: [],
      hasEdit: [],
      form: {
        date: null,
        limit: '',
        licenses: []
      },
      initForm: {},
      isFormateDate: false,
      rootColumns: [
        {
          titleText: this.$t('userManagement.userToolBar.successTableTitle'),
          slots: { title: 'name' },
          dataIndex: 'name',
          key: 'name',
          ellipsis: true
        },
        {
          titleText: this.$t('customers.assignment'),
          slots: { title: 'assignment' },
          dataIndex: 'assignment',
          key: 'assignment',
          ellipsis: true
        }
      ],
      columns: [
        {
          titleText: this.$t('userManagement.userToolBar.successTableTitle'),
          slots: { title: 'name' },
          dataIndex: 'name',
          key: 'name',
          ellipsis: true
        },
        {
          titleText: this.$t('customers.assignment'),
          slots: { title: 'assignment' },
          dataIndex: 'assignment',
          key: 'assignment',
          scopedSlots: { customRender: 'assignment' },
          ellipsis: true
        },
        {
          titleText: this.$t('customers.available'),
          slots: { title: 'available' },
          key: 'operation',
          dataIndex: 'available',
          ellipsis: true
        }
      ]
    }
  },

  computed: {
    ...mapGetters(['selectCustomerTreeNode', 'activeCustomerId']),
    isRootCustomer() {
      if (this.selectCustomerTreeNode) {
        return this.selectCustomerTreeNode['customer-id'] === parseInt(this.activeCustomerId)
      }
      return false
    }

    // isFormateDate() {
    //   if (this.form.date) {
    //     return this.isDate(this.form.date)
    //   }
    //   return false
    // }
  },

  watch: {
    form: {
      handler(form) {
        if (this.hasError.length) return
        const { initForm } = this
        form.date = form.date ? moment(form.date).format('MM/DD/YYYY') : ''
        initForm.date = initForm.date ? moment(initForm.date).format('MM/DD/YYYY') : ''
        this.saveBtnDisabled = isChangeObjorArr(form, initForm)
        // if (!this.first) {
        //   this.saveBtnDisabled = false
        // }
        // this.$emit('showSaveBtn', { show: true, data: val, tab: 'licence' })
        this.isDisabled = isChangeObjorArr(form, this.initForm)
        if (!this.isDisabled) {
          this.$emit('update-unsaved-tabs', 'add', 'license')
          this.$store.dispatch('pageChange/pageChanged', { func: null, params: [] })
        } else {
          this.$emit('update-unsaved-tabs', 'remove', 'license')
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
    // this.saveBtnDisabled = true
    this.first = true
  },

  created() {
    this.getCustomerLicense()
    const _this = this
    eventListener.on('getCustomerDetails', function({ node, tab }) {
      _this.saveBtnDisabled = true
      _this.first = true
      if (_this.$refs.licenceTable) {
        _this.$refs.licenceTable.refresh()
      }
      _this.getCustomerLicense()
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
    _setFormData(license) {
      this.form.date = license['expiration-date']
      this.form.limit = license['projects-limit'] === -1 ? this.$t('customers.unlimited') : license['projects-limit']
      let licenseStatus = license['license-statuses']['license-status']
      licenseStatus = licenseStatus ? (Array.isArray(licenseStatus) ? licenseStatus : [licenseStatus]) : []
      this.isFormateDate = this.form.date && this.isDate(this.form.date)

      this.form.licenses = licenseStatus.map(item => {
        return {
          ...item,
          key: item['license-id'],
          name: item['license-name'],
          available: item.available === -1 ? this.$t('licenses.unlimited') : item.available,
          assignment: item.assignment === -1 ? this.$t('licenses.unlimited') : item.assignment,
          total: (item.available * 1) + (item.assignment * 1)
        }
      })
    },
    restoreLiceses() {
      this.getCustomerLicense()
      if (this.$refs.licenceTable) {
        this.$refs.licenceTable.refresh()
      }
    },

    getCustomerLicense() {
      this.tableLoading = true
      this.saveBtnDisabled = true
      return getCustomerLicenses(this.selectCustomerTreeNode['customer-id']).then(res => {
        const license = res.license
        this.saveBtnDisabled = true
        this.tableLoading = false
        this._setFormData(license)
        this.initForm = JSON.parse(JSON.stringify(this.form))
        return this.form.licenses
      }).catch(() => {
        this.tableLoading = false
      })
    },

    onAssignmentItemChange(val, record, index) {
      const { total } = record
      const INDEX = this.hasError.indexOf(index)
      const EDITINDEX = this.hasEdit.indexOf(index)
      if (this._myIsNaN(val)) {
        INDEX > -1 && this.hasError.splice(INDEX, 1)
        const available = total - (val * 1)
        record.available = available >= 0 ? available : 0
        record.assignment = val
        this.form.licenses = this.form.licenses.map(item => {
          if (item['license-id'] === record.key) {
            item.assignment = val
          }
          return item
        })

        // this.form = { ...this.form, licenses: this.licenceTable }
      } else {
        INDEX === -1 && this.hasError.push(index)
      }
      EDITINDEX === -1 && this.hasEdit.push(index)

      this.first = false
    },
    _myIsNaN(value) {
      return typeof value === 'number' && !isNaN(value)
    },
    onDateChange(date, string) {
      // this.form = {
      //   ...this.form,
      //   date: string
      // }
      this.first = false
    },
    onLimitChange(e) {
      // this.form.limit = e.target.value
      this.first = false
    },
    isNumber(value) {
      const reg = /^([0-9]+\.?[0-9]*|-[0-9]+\.?[0-9]*)$/
      return reg.test(String(value).trim())
    },
    onSaveClick() {
      this.submitting = true
      let date = typeof this.form.date === 'object' ? moment(this.form.date).format('MM/DD/YYYY') : this.form.date

      date = date.split('/')
      // const arr = [...this.form.date.split('/').reverse()]
      // [arr[0], arr[1]] = [arr[1], arr[0]]

      const data = {
        ...this.form,
        limit: this.isNumber(this.form.limit)
          ? this.form.limit
          : this.form.limit === this.$t('customers.unlimited') || this.form.limit.toLowerCase() === 'unlimited'
            ? '-1'
            : '-99',
        // date: arr.join('-')
        // date: `${arr[2]}-${arr[1]}-${arr[0]}`
        date: date.join('-')
      }
      data.licenses = data.licenses.map(i => {
        if (i.assignment === this.$t('licenses.unlimited')) {
          return {
            ...i,
            assignment: -1,
            available: -1
          }
        } else {
          return i
        }
      })

      updateCustomerLicenses(this.selectCustomerTreeNode['customer-id'], data).then(res => {
        this.onRefresh()
        this.$message.success(this.$t('customers.licence_update_successful'))

        this.submitting = false
        this.first = true
        this.saveBtnDisabled = true
        this._setFormData(res.license)
        this.getCustomerLicense()
      }).catch(_ => {
        this.submitting = false
        this.onRefresh()
      })
    },
    onRefresh() {
      this.changeLicence = false
      this.hasEdit = []
      this.hasError = []
      // this.getCustomerLicense().then(() => {
      //   this.changeLicence = true
      // })
      // setTimeout(() => {
      //   this.changeLicence = true
      //   // this.$refs.licenceTable && this.$refs.licenceTable.refresh()
      // }, 100)
    },
    isDate(date) {
      const REG = /^\d{1,2}\b\/\d{1,2}\b\/\d{4}\b/
      return REG.test(date)
    }
  }
}
</script>

<style scoped lang="less">
/deep/ .ant-form-item-control .ant-input-number{
  width: 100%;
}
.show-error{
  border-color:red
}
.assignment-box{
  position: relative;
  .assignment-is-change{
    position: absolute;
    top: 0;
    left: 0;
    display: inline-block;
    width:0;
    height:0;
    border-top: 10px solid red;
    border-right: 10px solid transparent;
    z-index: 9;
  }
}

.editable-cell-text-wrapper {
  height: 34px;
  display: inline-block;
  width: 100px;
  padding-left:24px ;
  padding-top: 5px;

}
</style>
