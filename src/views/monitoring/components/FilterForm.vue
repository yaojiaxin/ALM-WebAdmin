<template>
  <!-- filter form -->
  <a-form-model
    ref="filterFrom"
    class="mf-filter-form"
    :class="['mf-filter-form', { filterFrom_dis: isShow }]"
    layout="inline"
    label-align="left"
    :model="filterInfoForm"
  >

    <!-- user name -->
    <a-row :gutter="24" class="filter-row">
      <a-col :sm="12" :lg="12" :xl="6">
        <a-form-model-item :label="$t('userManagement.UserName')" prop="loginName">
          <a-input
            id="filter-user-name"
            v-model="filterInfoForm.loginName"
          />
        </a-form-model-item>
      </a-col>

      <!-- context -->
      <a-col :sm="12" :lg="12" :xl="6">
        <a-form-model-item :label="$t('monitoring.Context')" prop="context">
          <mf-select
            id="filter-context"
            v-model="filterInfoForm.context"
          >
            <a-select-option v-for="item in contextList" :id="item['logical-id']" :key="item['logical-id']" :value="item['logical-id']">
              {{ item.value }}
            </a-select-option>
          </mf-select>
        </a-form-model-item>
      </a-col>

      <!-- operation -->
      <a-col :sm="12" :lg="12" :xl="6">
        <a-form-model-item :label="$t('monitoring.Operation')" prop="operation">
          <mf-select
            id="filter-operation"
            v-model="filterInfoForm.operation"
          >
            <a-select-option v-for="item in operationList" :id="item['logical-id']" :key="item['logical-id']" :value="item['logical-id']">
              {{ item.value }}
            </a-select-option>
          </mf-select>
        </a-form-model-item>
      </a-col>

      <!-- status -->
      <a-col :sm="12" :lg="12" :xl="6">
        <a-form-model-item :label="$t('status')" prop="status">
          <mf-select
            id="filter-status"
            v-model="filterInfoForm.status"
          >
            <a-select-option v-for="item in statusList" :id="item['logical-id']" :key="item['logical-id']" :value="item['logical-id']">
              {{ item.value }}
            </a-select-option>
          </mf-select>
        </a-form-model-item>
      </a-col>

      <!-- details -->
      <a-col :sm="12" :lg="12" :xl="6">
        <a-form-model-item :label="$t('Details')" prop="details">
          <a-input
            id="filter-details"
            v-model="filterInfoForm.details"
          />
        </a-form-model-item>
      </a-col>

      <!-- Source IP -->
      <a-col :sm="12" :lg="12" :xl="6">
        <a-form-model-item :label="$t('monitoring.Source IP')" prop="sourceIp">
          <a-input
            id="filter-source-IP"
            v-model="filterInfoForm.sourceIp"
          />
        </a-form-model-item>
      </a-col>

      <!-- Destination IP -->
      <a-col :sm="12" :lg="12" :xl="6">
        <a-form-model-item :label="$t('monitoring.Destination IP')" prop="destinationIp">
          <a-input
            id="filter-destination-IP"
            v-model="filterInfoForm.destinationIp"
          />
        </a-form-model-item>
      </a-col>

      <!-- ID -->
      <a-col :sm="12" :lg="12" :xl="6">
        <a-form-model-item :label="$t('monitoring.ID')" prop="id">
          <a-input-group class="inputNumberGroup">
            <a-input-number id="filter-start-id" v-model="filterInfoForm.id[0]" :formatter="limitNumber" :parser="limitNumber" :placeholder="$t('Start_ID')" />
            <span class="filter-id-separator" />
            <a-input-number id="filter-end-id" v-model="filterInfoForm.id[1]" :formatter="limitNumber" :parser="limitNumber" :placeholder="$t('End_ID')" :min="filterInfoForm.id[0]?filterInfoForm.id[0]+1:0" />
          </a-input-group>
        </a-form-model-item>

      </a-col>

      <!-- Date -->
      <a-col :sm="12" :lg="12" :xl="6">
        <a-form-model-item :label="$t('monitoring.Date')" prop="date" class="date-picker">
          <a-range-picker
            id="filter-date"
            v-model="filterInfoForm.date"
            :show-time="{ format: 'HH:mm' }"
            format="YYYY/MM/DD HH:mm"
            separator=""
            @ok="onDateOk"
          />
        </a-form-model-item>
      </a-col>
    </a-row>

    <div class="auditLog_filter_rowbtn">
      <a-form-model-item>
        <a-button
          id="audit-log-filter-clear-btn"
          class="mf-btn-dashed"
          style="margin-right:8px"
          @click="onResetFilterFrom"
        >
          {{ $t("clear") }}
        </a-button>
        <a-button id="audit-log-filter-fbtn" type="primary" @click="onFilterFunc">
          {{ $t("filter") }}
        </a-button>
      </a-form-model-item>
    </div>

  </a-form-model>
</template>

<script>
import MfSelect from '@/components/MFSelect'
import moment from 'moment'

export default {
  components: { MfSelect },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    contextList: {
      type: Array,
      default: () => []
    },
    operationList: {
      type: Array,
      default: () => []
    },
    statusList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      filterInfoForm: {
        loginName: '',
        details: '',
        sourceIp: '',
        destinationIp: '',
        operation: undefined,
        status: undefined,
        date: [],
        context: undefined,
        id: []
      }
    }
  },
  updated() {
    this.onShowBadge()
    this.$emit('filterDataChange', this.onFilterFunc(false))
  },
  methods: {
    onResetFilterFrom() {
      this.$refs.filterFrom.resetFields()
      this.$emit('onFormChange')
    },
    getID() {
      if (this.filterInfoForm.id[0] && this.filterInfoForm.id[1]) {
        return `>=${this.filterInfoForm.id[0]} AND <=${this.filterInfoForm.id[1]}`
      } else if (this.filterInfoForm.id[0] && !this.filterInfoForm.id[1]) {
        return `>=${this.filterInfoForm.id[0]}`
      } else if (!this.filterInfoForm.id[0] && this.filterInfoForm.id[1]) {
        return `<=${this.filterInfoForm.id[1]}`
      }
    },
    onFilterFunc(flag = true) {
      const filterData = {
        'login-name': this.filterInfoForm.loginName.trim() ? '\'*' + this.filterInfoForm.loginName.trim() + '*\'' : undefined,
        context: this.filterInfoForm.context,
        operation: this.filterInfoForm.operation,
        status: this.filterInfoForm.status,
        date: Array.isArray(this.filterInfoForm.date) && this.filterInfoForm.date.length > 0
          ? `>='${moment(this.filterInfoForm.date[0]).format('YYYY-MM-DD HH:mm:00')}' AND <='${moment(this.filterInfoForm.date[1]).format('YYYY-MM-DD HH:mm:00')}'`
          : undefined,
        details: this.filterInfoForm.details.trim() ? '"*' + this.filterInfoForm.details.trim() + '*"' : undefined,
        'src-ip': this.filterInfoForm.sourceIp.trim() ? '*' + this.filterInfoForm.sourceIp.trim() + '*' : undefined,
        'dst-ip': this.filterInfoForm.destinationIp.trim() ? '*' + this.filterInfoForm.destinationIp.trim() + '*' : undefined,
        id: this.getID()
      }
      const newFilterData = {}
      for (const key in filterData) {
        if (filterData[key] || filterData[key] === 0) {
          newFilterData[key] = filterData[key]
        }
      }
      if (flag) {
        this.$emit('onFormChange', newFilterData)
      } else {
        return newFilterData
      }
    },
    onDateOk(value) {
      this.filterInfoForm.date = value
    },
    onShowBadge() {
      if (Object.values(this.filterInfoForm).some(item => { return (!Array.isArray(item) && typeof (item) === 'string' && item.trim()) || item === 0 || (Array.isArray(item) && item.length > 0) })) {
        this.$parent.changeBadgeStatus(true)
      } else {
        this.$parent.changeBadgeStatus(false)
      }
    },
    limitNumber(value) {
      if (typeof value === 'string') {
        return !isNaN(Number(value)) ? value.replace(/^(0+)|[^\d]/g, '') : ''
      } else if (typeof value === 'number') {
        return !isNaN(value) ? String(value).replace(/^(0+)|[^\d]/g, '') : ''
      } else {
        return 0
      }
    }
  }
}
</script>

<style lang="less" scoped>
.auditLog_filter_rowbtn {
  text-align: right;
  .ant-col-16 {
    width: 100%;
  }
}
.date-picker /deep/  .ant-form-item-label-left{
  //min-width: 70px;
  display: inline-table;
}
.inputNumberGroup{
  /deep/ .ant-input-number{
    width: 40%;
    border: none;
    border-bottom: 1px solid #dcdedf;

    .ant-input-number-input {
      &::placeholder {
        text-align: center;
        font-size: 16px;
        font-weight: 400;
        line-height: 19px;
      }
    }
  }

  .filter-id-separator {
    display: inline-block;
    width: 10%;
    max-width: 20px;
    height: 1px;
    background-color: rgba(101, 102, 104, 0.65);
    margin: 0 5%;
  }
}
/deep/ .ant-calendar-range-picker-separator {
  width: 20px;
  height: 1px;
  vertical-align: middle;
  background-color: rgba(101, 102, 104, 0.65);
}

</style>
