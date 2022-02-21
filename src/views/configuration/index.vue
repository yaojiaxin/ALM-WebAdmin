<template>
  <div class="config-page">
    <configuration-tool-bar
      :selected-item="selectedItem"
      :parameters="tableData"
      :sorted-infos="sortedInfo"
      @refresh="refresh"
    />
    <!--    table-->
    <a-table
      id="parameter_table_body"
      ref="parameterRef"
      class="config-page-table"
      :pagination="false"
      row-key="name"
      :data-source="tableData"
      :columns="columns"
      :custom-row="rowClick"
      :loading="loading"
      :row-class-name="getClass"
      :scroll-to-first-row-on-change="true"
      :scroll="scrollTable"
      style="word-break: break-all;"
      bordered
      @scroll="test"
      @change="handleChange"
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

      <a id="parameter_table_item" slot="name" slot-scope="text,item" @click.capture="editLine(text,item)">
        {{ text }}
      </a>
      <span id="parameter_table_item_value" slot="value" slot-scope="text">
        {{ text }}
      </span>
      <span id="parameter_table_item_description" slot="description" slot-scope="text" :class="descriptionStyle">
        <a-tooltip :title="text">
          <span>{{ text }}</span>
        </a-tooltip>
      </span>
    </a-table>

    <!--edit -->
    <edit-parameter
      ref="editParameter"
      @refresh="getTableData"
      @cancelSelected="onCancelSelected"
    />

  </div>
</template>

<script>
import EditParameter from '@/views/configuration/components/EditParameter'
import { getConfigurationParameter } from '@/api/configuration'
import ConfigurationToolBar from '@/views/configuration/components/ConfigurationToolBar'
import { sorting } from '@/utils'
import { HELP_ON_THIS_PAGE } from 'config/help'
export default {
  name: 'Configuration',
  components: { EditParameter, ConfigurationToolBar },
  data() {
    return {
      // table
      loading: true,
      sortedInfo: {
        order: 'ascend',
        columnKey: 'name'
      },
      descriptionStyle: '',
      configurations: [],
      selectedItem: {},
      scrollTable: {
        x: 'max-content',
        y: 'calc(100vh - 200px)'
      },
      newName: null,
      visible: false,
      selectedRow: null,
      tableData: []
    }
  },
  computed: {
    columns() {
      const { sortedInfo } = this
      // sortedInfo = sortedInfo || {}
      // console.log('computedsortedInfo', sortedInfo)
      // console.log('computedsortedInfo.order', sortedInfo.order)
      return [
        {
          titleText: this.$t('configuration.PARAMETER'),
          slots: { title: 'name' },
          dataIndex: 'name',
          key: 'name',
          width: 550,
          scopedSlots: {
            customRender: 'name'
          },
          defaultSortOrder: 'ascend',
          sorter: (a, b) => sorting(a.name, b.name),
          sortDirections: ['descend', 'ascend'],
          sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order
        },
        {
          titleText: this.$t('configuration.VALUE'),
          slots: { title: 'value' },
          dataIndex: 'value',
          width: 200,
          key: 'value',
          scopedSlots: {
            customRender: 'value'
          },
          sortDirections: ['descend', 'ascend'],
          sorter: (a, b) => sorting(a.value, b.value),
          sortOrder: sortedInfo.columnKey === 'value' && sortedInfo.order
        },
        {
          titleText: this.$t('configuration.DESCRIPTION'),
          slots: { title: 'description' },
          dataIndex: 'description',
          key: 'description',
          width: 400,
          scopedSlots: {
            customRender: 'description'
          },
          sorter: (a, b) => sorting(a.description, b.description),
          sortDirections: ['descend', 'ascend'],
          sortOrder: sortedInfo.columnKey === 'description' && sortedInfo.order

        }
      ]
    }
  },
  created() {
    this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.configuration)
    this.$store.dispatch('forge/getKey')
    this.getTableData()
    var userAgent = navigator.userAgent
    const isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1
    const isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1
    this.descriptionStyle = (isIE || isIE11) ? 'description-ie-style' : 'description-style'
  },
  methods: {
    setAgeSort() {
      this.sortedInfo = {
        order: this.sortedInfo.order === 'descend' ? 'descend' : 'ascend',
        columnKey: 'name'
      }
    },
    test(e) {
      console.log(e)
    },
    handleChange(pagination, filters, sorter) {
      this.sortedInfo = sorter
      let compare
      const tableDatas = [...this.tableData]
      if (this.sortedInfo.order === 'descend') {
        compare = (a, b) => sorting(b[this.sortedInfo.columnKey], a[this.sortedInfo.columnKey])
        this.selectedRow = tableDatas.sort(compare).findIndex(item => {
          return item.name === this.selectedItem.name
        })
      } else if (this.sortedInfo.order === 'ascend') {
        compare = (a, b) => sorting(a[this.sortedInfo.columnKey], b[this.sortedInfo.columnKey])
        this.selectedRow = tableDatas.sort(compare).findIndex(item => {
          return item.name === this.selectedItem.name
        })
      } else {
        this.selectedRow = tableDatas.findIndex(item => {
          return item.name === this.selectedItem.name
        })
      }
    },
    rowClick(record, index) {
      const _this = this
      return {
        on: {
          click(event) {
            _this.selectedItem = record
            _this.selectedRow = index
          }
        }
      }
    },
    getClass(record, index) {
      return this.selectedRow === index ? 'selected' : ''
    },
    // get table data
    getTableData() {
      this.tableData = []
      this.loading = true
      getConfigurationParameter().then((response) => {
        this.loading = false
        if (Array.isArray(response['site-parameters']['site-parameter'])) {
          this.tableData = response['site-parameters']['site-parameter'].filter(item => {
            return item['is-visible']
          })
        } else {
          this.tableData.push(response['site-parameters'])
        }
        this.loading = false
        this.onCancelSelected()
        if (this.newName) {
          this.selectedRow = this.tableData.sort(this.sortedInfo.order === 'descend' ? (a, b) => sorting(b.name, a.name) : (a, b) => sorting(a.name, b.name)).findIndex(item => {
            return item.name === this.newName
          })
          this.selectedItem = this.tableData[this.selectedRow]
          this.$nextTick(() => {
            document.getElementsByClassName('selected')[0].scrollIntoView()
          })
        }

        return this.tableData
      }).catch(() => {
        this.loading = false
      })
    },
    editLine(text, item) {
      this.selectedItem = item
      this.$refs.editParameter.show(item)
    },
    onCancelSelected() {
      this.selectedRow = null
      this.selectedItem = {}
    },
    refresh(newName = null) {
      this.newName = newName
      this.setAgeSort()
      this.getTableData()
    }
  }
}
</script>

<style scoped lang="less">
.description-ie-style {
  //width: 350px;
  //width: calc((100vw - 288px) * 0.5);
  width: 100%;
  min-width: 380px;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
  display: inline-block;
}
.description-style{
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.config-page{
  width: 100%;
  border-top: 1px solid rgba(101, 102, 104, 0.16) !important;
  box-shadow: 2px 3px 0 #dcdedf;
  //margin-left: 1px;
  height: calc(100vh - 109px);
}

.main-has-customer{
  .config-page{
    height: calc(100vh - 152px);
  }
  .config-page-table /deep/ .ant-table-body {
    height: calc(100vh - 247px);
  }
}

.config-page-table{
  border: 0;
  width: 100%;
}

.config-page-table /deep/ .ant-table-body {
  height: calc(100vh - 205px);
}

/deep/ .selected{
  background-color: #E5F2FE;
  //border-left: 4px solid #0079ef;
  //margin-left: -4px;
}
/deep/.ant-table-body, /deep/.ant-table-header {
  table{
    border: 0;
  }
}
.config-page-table{
  /deep/.ant-table{
    box-shadow:0 0 0 rgba(0, 0, 0, 0.15) !important;
  }
  /deep/ .ant-table-hide-scrollbar{
    overflow-x:hidden !important;
    // ie title
    overflow-y:hidden !important;
    margin-bottom: 0 !important;
  }
  /deep/ .ant-table-body{
    -ms-overflow-x: hidden;
  }
  /deep/ .ant-table-row{
    word-break: break-all;
    word-wrap: break-word;
  }
  /deep/ .ant-table-row{
    white-space: break-spaces;
  }
}
/deep/ .ant-table-placeholder{
  // ie title
  display: none;
}

</style>
