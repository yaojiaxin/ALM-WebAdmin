<template>
  <div class="named-licenses-tabs">

    <div class="named-licenses-tab-tool">

      <a-button id="license-AddUserbtn" :disabled="!param.type" type="primary" class="add-user-btn" @click="addUser">
        <a-icon :disabled="!param.type" type="plus" />
        {{ $t("userManagement.addUser") }}
      </a-button>

      <a-checkbox id="license-hide-expired2" class="hide-checkbox" @change="checkboxChange">
        <span style="padding-left: 8px">{{ $t('licenses.HideExpiredLicense') }}</span>
      </a-checkbox>
      <!-- refresh -->
      <icon-btn
        id="license-refresh3"
        :icon-title="$t('refresh')"
        icon-style="icon-refresh"
        @onClick="getTableData"
      />
      <a-button id="license-Removebtn" :disabled="!selectedRowKeys.length" class="mf-btn-dashed" @click="removeUsers">
        <i class="iconfont icon-delete" />
        <span>{{ $t('remove') }}</span>
      </a-button>
    </div>

    <div class="license-status">
      <div class="left-license-status">
        <div class="license-status-title">
          {{ $t('licenses.license_status') }}
        </div>

        <a-table
          id="license-status-table"
          ref="namedLicenseStatusRef"
          class="left-table"
          :pagination="false"
          :data-source="tableData"
          :columns="columns"
          :loading="loading"
          :row-class-name="getClass"
          :custom-row="rowClick"
          :scroll="{ y: leftTableHeight }"
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

          <span
            id="namedLicenseStatusRef_item"
            slot="name"
            slot-scope="text"
            :title="text"
          >{{ text }}
          </span>
        </a-table>
      </div>

      <div class="right-assigned-users">
        <div class="assigned-users-title">
          <span style="font-weight: bold;">
            {{ $t('licenses.assigned_users') }}
          </span>
          <mf-help-btn :help="LICENSE_ASSIGNED_USERS" />
        </div>

        <a-table
          id="assigned-users"
          ref="assignedUsersRef"
          :data-source="existingUsers"
          :columns="assignedUsersTableColumns"
          class="left-table left-table-item"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange, getCheckboxProps:getCheckboxProps }"
          :pagination="false"
          row-key="@name"
          :row-class-name="getAssignedUsersClass"
          :get-checkbox-props="getCheckboxProps"
          :scroll="{ y: existingUsers.length > 0 ? rightTableHeight : 0 }"
        >
          <!-- column title slots -->
          <template v-for="item in assignedUsersTableColumns">
            <a-tooltip
              :slot="item.dataIndex"
              :key="item.dataIndex"
              :title="item.titleText"
            >
              <span class="table-column-title-text">{{ item.titleText }}</span>
            </a-tooltip>
          </template>
        </a-table>
      </div>

    </div>

    <add-user-modal
      v-show="param.type"
      ref="addUserRef"
      :param="param"
      :existing-users="existingUsers"
      @getLicenseQuotas="getLicenseQuotas"
    />
  </div>

</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import AddUserModal from '@/views/licenses/management/components/AddUserModal'
import { getLicensesQuotas, updateLicensesQuotas } from '@/api/license'
import { sorting, timeStampToString, autoTableHeight } from '@/utils'
import { LICENSE_ASSIGNED_USERS } from 'config/help'

export default {
  name: 'NamedLicensesTab',
  components: { IconBtn, AddUserModal },
  data() {
    return {
      LICENSE_ASSIGNED_USERS,
      loading: false,
      selectedRow: null,
      selectedRowKeys: [],
      assignedSave: true,
      hideExpiredLicense: false,
      isSave: false,
      users: [],
      selectedItem: '',
      param: {
        type: '',
        expiry: ''
      },
      dataSource: [],
      tableData: [],
      existingUsers: [],
      assignedUsersTableColumns: [
        {
          titleText: this.$t('login.userName'),
          slots: { title: '@name' },
          dataIndex: '@name',
          // width: '30%',
          // scopedSlots: { customRender: 'userName' },
          width: 140,
          sorter: (a, b) => sorting(a['@name'], b['@name'])

        },
        {
          titleText: this.$t('licenses.FULL_NAME'),
          slots: { title: '@full-name' },
          dataIndex: '@full-name',
          // scopedSlots: { customRender: 'fullName' },
          width: 140,
          sorter: (a, b) => sorting(a['@full-name'], b['@full-name'])

        },
        {
          titleText: this.$t('licenses.ASSIGNMENT_TIME'),
          slots: { title: 'assignment-time-str' },
          dataIndex: 'assignment-time-str',
          // scopedSlots: { customRender: 'assignmentTime' },
          width: 180,
          sorter: (a, b) => sorting(a['assignment-time-str'], b['assignment-time-str'])

        },
        {
          titleText: this.$t('licenses.REASSIGNMENT_TIME'),
          slots: { title: 'reassignment-time-str' },
          dataIndex: 'reassignment-time-str',
          // scopedSlots: { customRender: 'reassignmentTime' },
          width: 180,
          sorter: (a, b) => sorting(a['reassignment-time-str'], b['reassignment-time-str'])

        }
      ],
      columns: Object.freeze([
        {
          titleText: this.$t('licenses.LICENSE_NAME'),
          slots: { title: 'display-name' },
          dataIndex: 'display-name',
          // scopedSlots: {
          //   customRender: 'name'
          // },
          width: 140,
          sorter: (a, b) => sorting(a['display-name'], b['display-name'])
        },
        {
          titleText: this.$t('licenses.EXPIRATION_DATE'),
          slots: { title: 'expiryStr' },
          dataIndex: 'expiryStr',
          // scopedSlots: {
          //   customRender: 'date'
          // },
          width: 180,
          sorter: (a, b) => sorting(a.expiryStr, b.expiryStr)

        },
        {
          titleText: this.$t('licenses.IN_USE'),
          slots: { title: 'assigned' },
          dataIndex: 'assigned',
          // scopedSlots: {
          //   customRender: 'assigned'
          // },
          width: 100,
          sorter: (a, b) => sorting(a.assigned, b.assigned)

        },
        {
          titleText: this.$t('licenses.MAX'),
          slots: { title: 'quota' },
          dataIndex: 'quota',
          // scopedSlots: {
          //   customRender: 'max'
          // },
          width: 100,
          sorter: (a, b) => sorting(a.quota, b.quota)

        }
      ]),
      leftTableHeight: 100,
      rightTableHeight: 100
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
    rowClick(record, index) {
      const _this = this
      return {
        on: {
          click(event) {
            _this.selectedItem = record
            _this.getLicenseQuotas()
            _this.tableData.forEach(item => {
              item.selected = item.name === record.name
            })
            _this.selectedRow = index
          }
        }
      }
    },
    updateLeftLicenses() {
      getLicensesQuotas().then((res) => {
        if (!Array.isArray(res['license-quotas']['license-quota']) && res['license-quotas']['license-quota']) {
          this.dataSource = [res['license-quotas']['license-quota']]
        } else {
          this.dataSource = res['license-quotas']['license-quota']
        }
        this.loading = false
        this._licenseStampToString(this.dataSource)

        this.$nextTick(() => {
          this.getTableHeight()
        })
      })
    },
    getAssignedUsersClass(record, index) {
      // Distinguish expired licenses
      if (record['reassignment-time'] !== -1 && record['reassignment-time'] > Date.parse(new Date())) {
        return 'use-false'
      }
    },
    getCheckboxProps(record) {
      return {
        props: { disabled: record['reassignment-time'] !== -1 && record['reassignment-time'] > Date.parse(new Date()) }
      }
    },
    getClass(record, index) {
      const classList = []
      if (record.expired) {
        classList.push(this.hideExpiredLicense ? 'expired' : 'use-false')
      }
      if (this.selectedRow === index) {
        classList.push('selected')
      }
      return classList
    },
    addUser() {
      this.$refs.addUserRef.show()
    },
    checkboxChange() {
      this.hideExpiredLicense = !this.hideExpiredLicense
      this.selectedRow = null
      this.existingUsers = []
      this.param = { type: '', expiry: '' }
      this.$nextTick(() => {
        this.getTableHeight()
      })
    },
    getTableData() {
      this.loading = true
      this.selectedRow = null
      this.existingUsers = []
      this.param = { type: '', expiry: '' }
      this.updateLeftLicenses()
    },

    _licenseStampToString(items) {
      this.tableData = []
      if (items && !Array.isArray(items)) {
        items = [items]
      }
      if (Array.isArray(items)) {
        items.forEach((item, index) => {
          const item1 = { ...item }
          item1.rawExpiry = item1.expiry
          // converts the timestamp to a string
          item1.expiryStr = timeStampToString(item1.expiry)
          item1.key = index
          item1.expired = Date.parse(new Date()) > item1.rawExpiry
          // max: 2099-12-31 23:59:59
          if (item1.expiry >= 4102329599000) {
            item1.expiryStr = this.$t('licenses.unlimited')
          }
          this.tableData.push(item1)
        })
      }
    },
    onSelectChange(selectedRowKeys) {
      // get checkbox checked keys
      this.selectedRowKeys = selectedRowKeys
    },
    getLicenseQuotas() {
      this.selectedRowKeys = []
      this.param = {
        type: this.selectedItem.name,
        expiry: this.selectedItem.rawExpiry
      }

      getLicensesQuotas(this.param).then((res) => {
        this.existingUsers = res.users ? res.users.user : []
        this.existingUsers = !Array.isArray(this.existingUsers) && this.existingUsers ? [this.existingUsers] : this.existingUsers
        if (Array.isArray(this.existingUsers)) {
          this.existingUsers.forEach(item => {
            item['assignment-time-str'] = timeStampToString(item['assignment-time'])
            item['reassignment-time-str'] = item['reassignment-time'] === -1 ? this.$t('licenses.Reassignable') : timeStampToString(item['reassignment-time'])
            item.name = item['@name']
          })
        }
        this.$nextTick(() => {
          this.getTableHeight()
        })
      })
      this.updateLeftLicenses()
    },
    addAssignUser(record) {
      this.users.push(record)
      this.users = [...new Set(this.users)]
    },
    removeUsers() {
      this.$mfConfirm({
        title: this.$t('licenses.SiteManagement'),
        message: this.$t('licenses.removeUsersMessage'),
        confirmText: this.$t('yes'),
        onConfirm: this.removeUsersSubmit
      })
    },
    removeUsersSubmit() {
      // Filtering deleted data
      this.selectedRowKeys.forEach(item => {
        const userIndex = this.existingUsers.findIndex(user => {
          return user['@name'] === item
        })
        this.existingUsers.splice(userIndex, 1)
      })
      this.selectedRowKeys = []

      updateLicensesQuotas(this.param, {
        users: {
          user: this.existingUsers
        }
      }).then((res) => {
        this.updateLeftLicenses()
        // this.getLicenseQuotas(this.selectedItem)
      })
    },
    getTableHeight() {
      this.leftTableHeight = autoTableHeight(this.$refs.namedLicenseStatusRef, 68, 0)
      this.rightTableHeight = autoTableHeight(this.$refs.assignedUsersRef, 68, 0, true)
    }
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/variables.less';
.add-user-btn{
  font-size: 14px;
  margin-right: 24px;
  margin-left: 24px;
}

.named-licenses-tab-tool{
  height: 56px;
  //line-height: 48px;
  padding-top: 24px;
  background-color: @white;
}
.license-status{
  margin: 24px;
  display: flex;
  overflow-x: scroll;
  border: 1px solid #DCDEDF;

  /deep/ .ant-table-body {
    overflow-x: hidden !important;
    overflow-y: scroll !important;
  }
}
.named-licenses-tool{
  height: 56px;
  border-bottom: 1px solid fade(#656668,16%);
  padding-top:12px;
}
.left-license-status{
  background-color: @white !important;
  border-right: 1px solid #DCDEDF;
  // border-left: 1px solid #DCDEDF;
  // flex: 2 0 40%;
  flex-grow: 2;
  // flex-shrink: 0;
  // flex-basis: 40%;
}
.license-status-title{
  height: 57px;
  // border-bottom: 1px solid #DCDEDF;
  // border-top: 1px solid #DCDEDF;
  font-family: MediumWeb,serif;
  padding-left: 24px;
  line-height: 57px;
  font-weight: bold;
  font-size: 14px;
}
.left-table /deep/ .ant-table {
  border-left: none;
  // border-top: none;
  // height: auto;
  box-shadow: 0 2px 0 fade(@black, 15%);
}

/deep/ .ant-table-selection-column{
  padding: 8px 16px !important;
}

.right-assigned-users{
  // flex: 3 0 60%;
  flex-grow: 3;
  // flex-shrink: 0;
  // flex-basis: 60%;
  // box-shadow: 2px 0 0 fade(@black, 15%);
  // border-right: 1px solid #DCDEDF;
  // border-left: 1px solid #DCDEDF !important;
}
.assigned-users-title{
  // border-bottom: 1px solid #DCDEDF;
  // border-top: 1px solid #DCDEDF;
  display: flex ;

  font-family: MediumWeb,serif;
  padding-left: 40px;
  line-height: 57px;
  height: 57px;
  position: relative;

  font-size: 14px;
  background-color: @white !important;
}
.assigned-users-title::before{
  content: ' ';
  position: absolute;
  top: 53%;
  left: 24px;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: #0075F3;
  border-radius: 50%;
}
.question-icon{
  margin-left: 10px;
  font-size: 14px;
  color: #656668;
}
.named-licenses-tool /deep/ .icon-refresh{
  font-size: 12px;
}
.mf-btn-dashed{
  font-size: 14px;
  float: right;
  margin-right: 24px;
  height: 32px !important;
  //margin-top: 8px;
  //font-weight: bold;
}
.named-licenses-tabs /deep/ .ant-checkbox-wrapper{
  font-size: 16px;
}
/deep/ .selected{
  background-color: #E5F2FE;
  //border-left: 4px solid #0079ef;
  //margin-left: -4px;
}
/deep/ .use-false{
  color: fade(#656668,20%);
}

.footer-save{
  height: 64px;
  width: 100%;
  background-color: @white;
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px 0 0;
  box-shadow: 0 2px 0 0 fade(@black, 15%);
}
/deep/ .expired{
  display: none;
}

</style>
