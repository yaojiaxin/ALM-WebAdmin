<template>
  <mf-modal
    id="licenses-overdue-modal"
    :visible="visible"
    :confirm-loading="false"
    width="802px"
    :one-btn="true"
    :destroy-on-close="true"
    :auto-focus-enter="true"
    @ok="closeModal"
    @cancel="closeModal"
  >
    <span slot="title" class="modal-title">
      <a-icon type="warning" theme="filled" class="icon-style" />
      <span style="align-self: center">{{ $t('project.warning') }}</span>
    </span>
    <div class="modal-table-title"> {{ $t('licenses.AssignmentsModal',{num:30}) }}</div>
    <a-table
      id="modal-table"
      class="modal-table"
      row-key="id"
      :loading="loading"
      :columns="modalColumns"
      :pagination="false"
      :data-source="modalList"
    >
      <template v-for="item in modalColumns">
        <a-tooltip
          :slot="item.dataIndex"
          :key="item.dataIndex"
          :title="item.titleText"
        >
          <span class="table-column-title-text">{{ item.titleText }}</span>
        </a-tooltip>
      </template>
      <span slot="display-name" slot-scope="text" :title="text">
        {{ text }}
      </span>
      <span slot="expiryStr" slot-scope="text,item" :title="text" :class="item.expired && 'red-style'">
        {{ text }}
      </span>
    </a-table>
  </mf-modal>
</template>

<script>
import { getLicensesStatus } from '@/api/license'
import { sorting, timeStampToString } from '@/utils'

export default {
  name: 'LicensesOverdueModal',
  data() {
    return {
      visible: false,
      loading: false,
      modalList: []
      // modalColumns: Object.freeze([{
      //   title: this.$t('licenses.LicensesName'),
      //   dataIndex: 'display-name',
      //   key: 'display-name'
      // }, {
      //   title: this.$t('licenses.ExpirationDate'),
      //   dataIndex: 'expiryStr',
      //   key: 'expiryStr'
      // }])
    }
  },
  computed: {
    modalColumns() {
      const columns = [
        {
          titleText: this.$t('licenses.LicensesName'),
          slots: { title: 'display-name' },
          dataIndex: 'display-name',
          key: 'display-name',
          scopedSlots: { customRender: 'display-name' },
          ellipsis: true,
          sorter: (a, b) => sorting(a['display-name'], b['display-name'])
          // sorter: true,
          // sortOrder: this.sortedInfo.columnKey === 'display-name' && this.sortedInfo.order
        },
        {
          titleText: this.$t('licenses.ExpirationDate'),
          slots: { title: 'expiryStr' },
          dataIndex: 'expiryStr',
          key: 'expiryStr',
          scopedSlots: { customRender: 'expiryStr' },
          ellipsis: true,
          sorter: (a, b) => {
            if (typeof a.expiry === 'string' && typeof b.expiry !== 'string') {
              return 1
            } else if (typeof b.expiry === 'string' && typeof a.expiry !== 'string') {
              return -1
            } else {
              return Number(a.expiry) > Number(b.expiry) ? 1 : -1
            }
          }
          // sorter: true,
          // sortOrder: this.sortedInfo.columnKey === 'expiryStr' && this.sortedInfo.order
        }
      ]
      return columns
    }
  },
  methods: {
    async getLicenses() {
      this.loading = true
      let isShow = false
      await getLicensesStatus().then((response) => {
        this.modalList = []
        let licenses = response['license-status'].license
        if (licenses) {
          if (!Array.isArray(licenses)) {
            licenses = [licenses]
          }
          const date = new Date().getTime() + 60 * 60 * 1000 * 24 * 30
          if (Array.isArray(licenses)) {
            licenses.forEach((item, index) => {
              if (item.expiry < date) {
                const item1 = {
                  'display-name': item['display-name'],
                  expiry: item.expiry
                }
                // Time stamp to String
                item1.expiryStr = timeStampToString(item1.expiry)
                item1.key = index
                // Filter hide expiration
                item1.expired = Date.parse(new Date()) > item1.expiry
                this.modalList.push(item1)
              }
            })
          }
        } else {
          isShow = true
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
      if (this.modalList.length > 0) {
        this.showModal()
      } else if (isShow) {
        this.$mfConfirm({
          message: this.$t('licenses.Your_license_key_is_expired'),
          isShowCancel: false,
          confirmText: this.$t('OK'),
          title: this.$t('warning'),
          iconType: 'Warning'
          // onCloseChange: () => this.checkPriorityValue(item),
          // onConfirm: () => this.checkPriorityValue(item)
        })
      }
    },
    showModal() {
      this.visible = true
      // this.visible && this.getLicenses()
    },
    closeModal() {
      this.visible = false
    }
  }
}
</script>

<style lang="less" scoped>
.icon-style{
  color: #FFB000;
  margin-right: 24px;
  font-size: 32px
}
.modal-title{
  display: flex;
}
.red-style{
  color: red;
}
</style>
