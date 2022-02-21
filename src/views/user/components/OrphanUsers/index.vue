<template>
  <mf-modal
    id="orphan-users-modal"
    ref="orphanUsersRef"
    :visible="visible"
    :confirm-loading="loading"
    :ok-text="$t('OK')"
    width="900px"
    @cancel="onCancel"
    @ok="onOk"
  >
    <span slot="title">{{ $t('userManagement.OrphanUsers') }}</span>

    <h5 class="orphan-user-h5">{{ $t('userManagement.useselectionboxselectcustomerassociateusebuttonassign') }}</h5>

    <div class="orphan-users-header">

      <a-tree-select
        v-if="customerTree.length"
        v-model="orphanCustomer"
        style="width: 30%"
        show-search
        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
        :tree-data="customerTree"
        :search-placeholder="$t('userManagement.search_placeholder')"
        class="tree-orphan-select"
        @select="selectChange"
      >
        <template slot="icon-CustomerSetting" slot-scope="text">
          <!--          <i slot="customers" class="iconfont icon-CustomerSetting tree-item-icon" />-->
          <i class="iconfont icon-CustomerSetting customers-user-icon" />
          {{ text.value }}
        </template>

        <template slot="icon-owner_customer" slot-scope="text">
          <i class="iconfont icon-owner_customer tree-item-icon" />
          {{ text.value }}
        </template>

        <template slot="icon-end_customer" slot-scope="text">
          <i class="iconfont icon-end_customer tree-item-icon" />
          {{ text.value }}
        </template>
      </a-tree-select>

      <div>
        <a-button type="link" :disabled="!orphanCustomer" @click="setAssign">
          {{ $t('userManagement.AssignOrphansToCustomer') }}
        </a-button>

        <a-button type="link" :disabled="!orphanCustomer" @click="removeAssign">
          {{ $t('userManagement.RemoveAssignment') }}
        </a-button>

        <a-button type="link" :disabled="!selectedRowKeys.length" @click="onUserProject">
          {{ $t('userManagement.UserProjects') }}
        </a-button>
      </div>
    </div>

    <a-table
      class="orphanTable"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      :columns="columns"
      :data-source="tableList"
      :pagination="pagination"
      row-key="name"
      :loading="tableLoading"
      size="small"
      :scroll="{y: 300}"
      @change="onTableChange"
    />

    <orphan-user-projects v-if="selectedRowKeys.length" ref="OrphanUserProjects" :users="selectedRowKeys" @show="show" />
  </mf-modal>
</template>

<script>
import OrphanUserProjects from './orphanUserProjects'
import { getOrphanUsers, updateOrphanUsers } from '@/api/user'
import { copyCustomersTree } from '@/utils/customer'
import { mapGetters } from 'vuex'
import { PAGE_SIZE_25 } from '@/store/const'

export default {
  components: {
    OrphanUserProjects
  },

  data() {
    return {
      visible: false,
      loading: false,
      tableLoading: false,
      orphanCustomer: '',
      tableList: [],
      selectedRowKeys: [],
      customerList: [],
      customerTree: [],
      selectedRows: [],

      pagination: {
        total: 0,
        size: 'small',
        current: 1,
        pageSize: PAGE_SIZE_25,
        showSizeChanger: true,
        pageSizeOptions: ['25', '50', '100'],
        showTotal: (total) =>
          this.$t('totalItems') + ' ' + total

      }
    }
  },

  computed: {
    ...mapGetters(['customerId']),
    columns() {
      const columns = [
        {
          title: this.$t('userManagement.LOGIN_NAME'),
          dataIndex: 'name',
          key: 'name',
          ellipsis: true
        },
        {
          title: this.$t('userManagement.FULL_NAME'),
          dataIndex: 'full-name',
          key: 'full-name',
          ellipsis: true
        },
        {
          title: this.$t('userManagement.EMAIL'),
          dataIndex: 'email',
          key: 'email',
          ellipsis: true
        },
        {
          title: this.$t('userManagement.PHONE_NUMBER'),
          key: 'phone',
          dataIndex: 'phone',
          ellipsis: true
        },
        {
          title: this.$t('userManagement.DOMAINS'),
          dataIndex: 'domain-name',
          key: 'domain-name',
          ellipsis: true
        },
        {
          title: this.$t('userManagement.POSSIBLE_CUSTOMERS'),
          dataIndex: 'customer-name',
          key: 'customer-name',
          ellipsis: true
        },
        {
          title: this.$t('userManagement.ASSIGN_TO_CUSTOMER'),
          dataIndex: 'assign-customer',
          key: 'assign-customer',
          ellipsis: true
        }
      ]
      return columns
    }
  },

  created() {
    this.$store.dispatch('customer/getCustomers').then(data => {
      this.$store.dispatch('customer/getCustomerTree', this.customerId).then(data => {
        this.customerTree = copyCustomersTree(data)
      })
    })
  },

  methods: {
    show() {
      this.visible = true
      // this.selectedRows = []
      // this.selectedRowKeys = []
      this.getTableList()
    },

    onCancel() {
      this.visible = false
      this.selectedRowKeys = []
      this.orphanCustomer = ''
    },

    onOk() {
      this.loading = true
      const arr = []
      this.tableList.forEach(item => {
        if (item['assign-customer']) {
          const customer = this.customerList.filter(i => i['customer-name'] === item['assign-customer'])
          arr.push(
            {
              id: item.id,
              name: item.name,
              domains: {
                'domain-name': item['domain-name'],
                'customer-name': item['customer-name']
              },
              email: item.email,
              'full-name': item['full-name'],
              phone: item.phone,
              'customer-id': customer[0]['customer-id']
            }
          )
        }
      })

      const user = {
        'orphan-users': {
          'orphan-user': arr
        }
      }
      if (arr.length) {
        updateOrphanUsers(user).then(res => {
          this.visible = false
          this.loading = false
          this.selectedRowKeys = []
          this.orphanCustomer = ''
          this.$message.success(this.$t('userManagement.assign_customer_success'))
          // this.getTableList()
          this.$emit('refreshUser')
        }).catch(() => {
          this.loading = false
        })
      } else {
        this.$message.warning(this.$t('userManagement.assignProjectToUsers.assign_project_warning'))
        this.loading = false
      }
    },

    setAssign() {
      if (this.selectedRowKeys.length) {
        const selectRows = this.tableList.filter(i => this.selectedRowKeys.includes(i.name))
        const hasCustomersUsers = selectRows.filter(i => i['customer-name'])
        const notFitCustomer = hasCustomersUsers.filter(i => i['customer-name'] !== this.orphanCustomer)

        if (notFitCustomer.length > 0) {
          this.$message.error(this.$t('userManagement.assign_customer_error', { name: notFitCustomer[0].name }))
        }
        this.tableList.forEach(item => {
          if (this.selectedRowKeys.includes(item.name) && !notFitCustomer.find(i => i.name === item.name)) {
            item['assign-customer'] = this.orphanCustomer
          }
        })
      }
    },

    removeAssign() {
      if (this.selectedRowKeys.length) {
        this.tableList.forEach(item => {
          // const index = this.selectedRowKeys.findIndex(i => i === item.name)
          // if (index >= 0) {
          //   this.tableList[index]['assign-customer'] = ''
          // }
          this.selectedRowKeys.forEach(s => {
            if (s === item.name) {
              item['assign-customer'] = ''
            }
          })
        })
      }
    },

    removeRepeat(arr) {
      const set = new Set(arr)
      return Array.from(set)
    },

    getTableList() {
      this.tableLoading = true
      const startIndex = (this.pagination.current - 1) * this.pagination.pageSize + 1

      getOrphanUsers({
        'start-index': startIndex,
        'page-size': this.pagination.pageSize
      }).then(res => {
        if (res['orphan-users']['orphan-user']) {
          let orphanList = []
          Array.isArray(res['orphan-users']['orphan-user']) ? orphanList = res['orphan-users']['orphan-user']
            : orphanList.push(res['orphan-users']['orphan-user'])

          this.tableList = orphanList.map(item => {
            const customerName = item.domains ? (Array.isArray(item.domains.domain)
              ? this.removeRepeat(item.domains.domain.map(item => item['customer-name'])).join(';')
              : item.domains.domain['customer-name']) : ''
            return {
              ...item,
              'domain-name': item.domains ? (Array.isArray(item.domains.domain)
                ? item.domains.domain.map(item => item['domain-name']).join(';')
                : item.domains.domain['domain-name']) : '',
              'customer-name': customerName,
              'assign-customer': ''
              // Reset Customer to the selected user that meets the criteria
              // 'assign-customer': (this.orphanCustomer && this.selectedRowKeys.includes(item.name) && customerName === this.orphanCustomer) || !customerName ? this.orphanCustomer : ''
            }
          })
          this.pagination.total = parseInt(res['orphan-users']['@total-results'])
        } else {
          this.tableList = []
        }
        this.tableLoading = false
      }).catch(() => {
        this.tableLoading = false
      })
    },

    onTableChange(pagination) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
      this.selectedRowKeys = []
      this.getTableList()
    },

    onUserProject() {
      // this.visible = false // it will make all components disappear
      this.$refs.OrphanUserProjects.show()
      this.$refs.OrphanUserProjects.getTableList(this.selectedRowKeys)
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    selectChange(value, node, extra) {
      this.customerList.push(
        {
          'customer-id': node.dataRef.key,
          'customer-name': node.dataRef.value
        }
      )
      this.customerList = [...new Set(this.customerList)]
    }
  }
}
</script>

<style lang="less" scoped>
.orphan-user-h5{
    position: relative;
    color: #333;
    font-weight: bold;
    font-size: 14px;
    line-height: 16px;
    // height: 19px;
    padding-left: 16px;
    margin-bottom: 10px;
}

.orphan-user-h5::before{
    content: ' ';
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: #0075F3;
    border-radius: 50%;
}

.orphan-users-header{
  margin-bottom: 16px;
  display: flex;
}

/deep/ .ant-select-dropdown-search .ant-select-search__field{
  font-family: RegularWeb;
  border: none;
  border-bottom: 1px solid #dcdedf;
  padding: 4px 0;
}

.orphanTable /deep/ .ant-table-thead > tr > th .ant-table-column-title{
  // word-wrap: break-word;
  word-break:keep-all;
  white-space: normal;
}

</style>
