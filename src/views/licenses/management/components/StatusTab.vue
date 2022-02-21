<template>
  <div class="status-tabs">

    <div class="licenses-management-tab-tool">
      <a-dropdown :trigger="['click']" class="status-header-item">
        <a class="ant-dropdown-link" @click="e => e.preventDefault()">
          <span>{{ $t("licenses.ModifyLicenses") }} </span>
          <a-icon type="down" class="a-icon-down" />
        </a>

        <a-menu id="dropdown-menu" slot="overlay">
          <a-menu-item>
            <a
              id="menu-license-upload"
              @click="showUpload"
            >{{ $t("licenses.UploadLicense") }}</a>
          </a-menu-item>
          <a-menu-item>
            <a
              id="menu-license-paste"
              @click="showPaste"
            >{{ $t("licenses.PasteLicense") }}</a>
          </a-menu-item>
          <a-menu-item>
            <a
              id="menu-license-remove"
              @click="showRemove"
            >{{ $t("licenses.ClearLicensing") }}</a>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
      <span class="vertical-divider" />
      <a-button
        id="license-portal"
        target="_blank"
        type="link"
        :href="LAUNCH_LICENSING_PORTAL"
        class="license-portal-btn status-header-item"
      >
        <i style="font-size: 16px" class="iconfont icon-LaunchLicensing" />
        <!--        {{ $t("licenses.LaunchLicensingPortal") }}-->
        <a target="_Blank" :href="LAUNCH_LICENSING_PORTAL">{{ $t("licenses.LaunchLicensingPortal") }}</a>
      </a-button>
      <span class="vertical-divider" />
      <a-checkbox id="license-hide-expired1" :checked="hideExpiredLicense" class="hide-checkbox status-header-item" @change="handleChange">
        {{ $t("licenses.HideExpiredLicense") }}
      </a-checkbox>
      <span class="vertical-divider" />
      <!-- refresh -->
      <icon-btn
        id="license-refresh1"
        class="refresh-btn"
        :icon-title="$t('refresh')"
        icon-style="icon-refresh"
        style="top: 3px"
        @onClick="getTableData"
      />

      <mf-help-btn class="licenses-question-icon" :help="LICENSE_STATUS" />
    </div>

    <div class="status-table-title">
      <span class="edition-data" style="margin-right: 24px">
        <span class="edition-data-label">{{ $t("licenses.EditionData") }}</span>
        <span>{{ edition }}</span>
      </span>
      <span class="model-data">
        <span class="model-data-label">{{ $t("licenses.ModelData") }}</span>
        <span>{{ pattern }}</span>
      </span>
    </div>

    <!-- table -->
    <a-table
      ref="licenseStatusRef"
      class="status-table general-table"
      :show-pagionation="true"
      :data-source="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="false"
      table-layout="fixed"
      :row-class-name="getClass"
      :scroll="{ y: tableHeight }"
      @change="onUsersTableChange"
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
    </a-table>

    <import-license ref="importLicenseModal" @getTableData="getTableData" />

  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import importLicense from './StatusTabModal'
import { deleteLicenses, getLicensesStatus } from '@/api/license'
import { timeStampToString, sorting, autoTableHeight } from '@/utils'
import { LAUNCH_LICENSING_PORTAL, LICENSE_STATUS } from 'config/help'
import { PAGE_SIZE_25, PAGE_SIZE_LIST } from '@/store/const'

export default {
  name: 'StatusTab',
  components: { IconBtn, importLicense },
  props: {
    isUpLicenses: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      LICENSE_STATUS,
      LAUNCH_LICENSING_PORTAL,
      pagination: {
        size: 'small',
        current: 1,
        defaultPageSize: PAGE_SIZE_25,
        pageSize: PAGE_SIZE_25,
        showSizeChanger: true,
        showTotal: (total) =>
          this.$t('totalItems') + ' ' + total,
        pageSizeOptions: PAGE_SIZE_LIST,
        onShowSizeChange: (current, pageSize) => { this.pageSize = pageSize }
      },

      // pagination: {
      //   size: 'small',
      //   current: 1,
      //   defaultPageSize: PAGE_SIZE_25,
      //   pageSize: PAGE_SIZE_25,
      //   showSizeChanger: true,
      //   pageSizeOptions: PAGE_SIZE_LIST,
      //   showSizeChange: (current, pageSize) => { this.pageSize = pageSize },
      //   showTotal: (total) =>
      //     this.$t('totalItems') + ' ' + total
      // },

      loading: false,
      fileList: [],
      formData: [],
      tableData: [],
      pattern: '',
      edition: '',
      hideExpiredLicense: false,
      columns: Object.freeze([
        {
          titleText: this.$t('licenses.LICENSE_NAME'),
          slots: { title: 'display-name' },
          dataIndex: 'display-name',
          // scopedSlots: {
          //   customRender: 'display-name'
          // },
          sorter: (a, b) => sorting(a['display-name'], b['display-name'])
        },
        {
          titleText: this.$t('licenses.NAMED'),
          slots: { title: 'is-named' },
          dataIndex: 'is-named',
          // scopedSlots: {
          //   customRender: 'is-named'
          // },
          sorter: (a, b) => sorting(a['is-named'], b['is-named'])
        },
        {
          titleText: this.$t('licenses.EXPIRATION_DATE'),
          slots: { title: 'expiryStr' },
          dataIndex: 'expiryStr',
          // scopedSlots: {
          //   customRender: 'expiryStr'
          // },
          sorter: (a, b) => sorting(a.expiryStr, b.expiryStr)
        },
        {
          titleText: this.$t('licenses.IN_USE'),
          slots: { title: 'used' },
          dataIndex: 'used',
          // scopedSlots: {
          //   customRender: 'used'
          // },
          sorter: (a, b) => sorting(a.used, b.used)
        },
        {
          titleText: this.$t('licenses.MAX'),
          slots: { title: 'quota' },
          dataIndex: 'quota',
          // scopedSlots: {
          //   customRender: 'quota'
          // },
          sorter: (a, b) => {
            if (typeof a.quota === 'string' && typeof b.quota !== 'string') {
              return 1
            } else if (typeof b.quota === 'string' && typeof a.quota !== 'string') {
              return -1
            } else {
              return Number(a.quota) > Number(b.quota) ? 1 : -1
            }
          }
          // sorter: (a, b) => sorting(b.quota, a.quota)

        }
      ]),
      tableHeight: 100
    }
  },
  mounted() {
    this.getTableData()
    window.addEventListener('resize', this.getTableHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.getTableHeight)
  },
  methods: {
    handleChange() {
      // Hide the overdue
      this.hideExpiredLicense = !this.hideExpiredLicense
    },
    upLicenses(status) {
      this.$emit('update:isUpLicenses', status)
    },

    onUsersTableChange(pagination, sorter) {
      // paging
      this.sortedInfo = sorter
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
      // this.getTableData()
    },

    getClass(record) {
      // Modify color after expiration
      return !record.expired ? '' : this.hideExpiredLicense ? 'expired' : 'use-false'
    },

    getTableData() {
      // Get Status of Licenses
      this.loading = true
      return getLicensesStatus().then((response) => {
        this.edition = response['license-status'].edition
        this.pattern = response['license-status'].model
        this.loading = false
        this._licenseStampToString(response['license-status'].license)

        this.$nextTick(() => {
          this.getTableHeight()
        })
      }).catch(() => {
        this.loading = false
      })
    },

    _licenseStampToString(items) {
      this.tableData = []
      if (items && !Array.isArray(items)) {
        items = [items]
      }
      if (Array.isArray(items)) {
        items.forEach((item, index) => {
          const item1 = { ...item }
          // Time stamp to String
          item1.expiryStr = timeStampToString(item1.expiry)
          item1.key = index
          // Filter hide expiration
          item1.expired = Date.parse(new Date()) > item1.expiry
          if (item1.quota === -1) {
            item1.quota = this.$t('licenses.unlimited')
          }
          // max: 2099-12-31 23:59:59
          if (item1.expiry >= 4102329599000) {
            item1.expiryStr = this.$t('licenses.unlimited')
          }
          this.tableData.push(item1)
        })
      }
    },

    showUpload() {
      // if (this.isDisabled) return
      this.$refs.importLicenseModal.UploadVisible = true
      // this.UploadVisible = true
    },
    showPaste() {
      // if (this.isDisabled) return
      this.$refs.importLicenseModal.PasteVisible = true
      this.$nextTick(() => {
        this.$refs.importLicenseModal.$refs.licensePasteInput.focus()
      })
      // this.PasteVisible = true
    },
    showRemove() {
      this.$mfConfirm({
        title: this.$t('licenses.DeleteAllLicenses'),
        message: this.$t('licenses.DeleteAllLicensesMessage'),
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('OK'),
        onConfirm: () => {
          deleteLicenses().then(res => {
            this.upLicenses(true)
            this.getTableData()
          }).then(e => {
          })
        }
      })
    },
    getTableHeight() {
      if (this.tableData.length > 0) {
        this.tableHeight = autoTableHeight(this.$refs.licenseStatusRef, 0)
      } else {
        this.tableHeight = autoTableHeight(this.$refs.licenseStatusRef, 49)
      }
    }
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/variables.less';

.status-tabs{
  // box-shadow: 2px 2px 0 fade(@black, 15%) !important;
  padding: 24px;
  /deep/ .ant-table-body{
    // height:calc(100vh - 395px) !important;
    // max-height:calc(100vh - 395px) !important;
  }
}

.ant-dropdown-link {
  color: @black;
}
.license-portal-btn{
  padding: 0;
  color: @w3C-compliant;
}
.status-tool /deep/ .icon-refresh{
  font-size: 12px;
}
.status-table-title{
  height: 48px;
  line-height: 48px;
  font-size: 14px;
  // color: #959595;
  padding-left: 16px;
  border-left:1px solid @ant-tooltip-border;
  border-top:1px solid @ant-tooltip-border;

  background-color: @white;
  box-shadow: 2px 0 0 fade(@black, 15%);

  .edition-data-label,
  .model-data-label {
    font-weight: bold;
  }
}

.hide-checkbox {
  padding-right: 0;
  margin-right: 0;
}

.vertical-divider {
  height: 16px;
  padding-left: 16px;
  border-right: 1px solid @silver;
}

/deep/ .use-false{
  color: fade(#656668,20%);
}

/deep/ .expired{
  display: none;
}
/deep/ .ant-checkbox + span {
  padding-right: 0;
}
</style>
