<template>
  <div class="data-grid">
    <a-table
      id="data-grid_table"
      ref="dataGridTableRef"
      class="data-grid-table general-table"
      row-key="key"
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      :loading="loading"
      :scroll="{y: tableHeight}"
      @change="onTableChange"
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
  </div>
</template>

<script>
// import { downloadCsv } from '@/utils/downloadCsv'
import { sorting, autoTableHeight } from '@/utils'
import { PAGE_SIZE_25, PAGE_SIZE_LIST } from '@/store/const'
export default {
  props: {
    license: {
      type: Array,
      default: () => []
    },
    usageArr: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      tableColumns: [
        {
          titleText: this.$t('licenses.DATE'),
          slots: { title: 'date' },
          dataIndex: 'date',
          ellipsis: true,
          width: 120,
          sorter: (a, b) => a.date > b.date ? 1 : -1
        }
      ],
      pagination: {
        size: 'small',
        current: 1,
        defaultPageSize: PAGE_SIZE_25,
        showSizeChanger: true,
        showTotal: (total) => this.$t('totalItems') + ' ' + total,
        pageSizeOptions: PAGE_SIZE_LIST,
        onShowSizeChange: (current, pageSize) => { this.pageSize = pageSize }
      },
      dataList: [],
      dataNameList: [],
      tableHeight: 100
    }
  },
  computed: {
    columns: function() {
      const list = this.license.map(item => {
        return {
          titleText: item.name,
          slots: { title: item.id },
          dataIndex: item.id,
          sorter: (a, b) => sorting(a[item.id], b[item.id])
        }
      })
      list.forEach(i => {
        this.tableColumns.push(i)
      })
      return this.tableColumns
    }
  },
  mounted() {
    this.getLicenseUsage()
    this.getTableHeight()
    window.addEventListener('resize', this.getTableHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.getTableHeight)
  },
  methods: {
    onTableChange(pagination) {
      this.pagination.current = pagination.current
    },
    getLicenseUsage() {
      this.loading = true
      setTimeout(() => {
        this.dataList = this.usageArr.map((item, index) => {
          return {
            key: index + 1,
            date: item.date
          }
        })
        this.dataList.forEach(u => {
          const index = this.usageArr.findIndex(value => value.date === u.date)
          if (this.usageArr[index]['license-usage']) {
            this.usageArr[index]['license-usage'].forEach(l => {
              this.dataList[index][this.license.find(item => {
                return item.id === l['license-id']
              }).id] = l.peak
            })
          }
        })
        this.loading = false
        this.$nextTick(() => {
          this.getTableHeight()
        })
      }, 300)
    },
    getTableHeight() {
      this.tableHeight = autoTableHeight(this.$refs.dataGridTableRef)
    }
    // exportData() {
    //   this.dataNameList = this.usageArr.map((item, index) => {
    //     return {
    //       key: index + 1,
    //       date: item.date
    //     }
    //   })
    //
    //   this.dataNameList.forEach(u => {
    //     const index = this.usageArr.findIndex(value => value.date === u.date)
    //     if (this.usageArr[index]['license-usage']) {
    //       this.usageArr[index]['license-usage'].forEach(l => {
    //         this.dataNameList[index][this.license.find(item => {
    //           return item.id === l['license-id']
    //         }).name] = l.peak
    //       })
    //     }
    //   })
    //   downloadCsv(this.dataNameList, 'license')
    // }
  }
}
</script>

<style lang="less" scoped>

.data-grid{
  margin-top: -17px;
}

.data-grid-table{
  // height: calc(100vh - 205px);
  overflow: hidden;
}

.main-has-customer{
  .data-grid-table{
    // height: calc(100vh - 250px);
    overflow: hidden;
  }
}

.data-grid-table /deep/ .ant-table{
  box-shadow: 0 0 0 0 ;
  //.ant-table-body{
  //  border-top: 1px solid rgba(101, 102, 104, 0.16);
  //}
}

</style>
