<template>
  <a-spin :spinning="spinning" class="mf-db-wrapper">
    <div class="mf-db-panel" :class="{'mf-db-panel-ie':isIE,'mf-db-panel-ie-tab':projectType==='LAB_PROJECT'}">
      <div class="mf-db-tree-panel" :style="mfDbTreePanelStyle">
        <tree
          :data="treeData"
          :expand-all="true"
          node-key="name"
          :props="{ label: 'name' }"
          :class-name="className"
          @node-click="onNodeClick"
        >
          <i slot="table" class="iconfont icon-TableIcon" />
        </tree>
      </div>

      <div class="mf-db-sql-panel mf-flex-1">
        <div class="mf-db-tools">
          <a-button id="download-to-CSV" type="primary" @click="onDownLoad"> <i class="iconfont icon-ProjectExport" /> {{ $t('project.db.downloadToCSV') }}</a-button>
          <a-button id="execute-SQL" type="primary" class="mf-margin-l-24" @click="onExecuted"> <i class="iconfont icon-Excute" />{{ $t('project.db.executeSQL') }}</a-button>
          <a-button id="clear-text" class="mf-btn-filter mf-margin-l-24" @click="onClear">{{ $t('project.db.clearText') }}</a-button>
        </div>

        <codemirror
          id="database-codemirror"
          :value="code"
          :options="cmOptions"
          class="mf-codemirror"
          @input="onCmCodeChange"
        />
      </div>
    </div>
    <div :class="databaseTableClass">
      <!--<p-table ref="databaseTable" :columns="columns" :data="tableData" />-->
      <mf-ag-grid
        ref="databaseTable"
        :size-to-fit="false"
        :columns="columns"
        :data-source="tableData"
        :height="tableHeight"
      />
    </div>

    <!-- <a-table
      :loading="loading"
      class="db-table mf-db-data-panel"
      row-key="id"
      :columns="columns"
      :data-source="tableData"
      :pagination="false"
      :scroll="{x: 1000, y: 300}"
    >
      <template v-for="(item,index) in columnsTitleArr">
        <a-tooltip :slot="'linkTitle'+index" :key="index" :title="item">
          {{ item }}
        </a-tooltip>
      </template>
    </a-table> -->
  </a-spin>
</template>

<script>
import { codemirror } from 'vue-codemirror'
// language
import 'codemirror/mode/sql/sql.js'
// import theme style
import 'codemirror/lib/codemirror.css'
import { getTables, runQuery, runQueryExport } from '@/api/project'
import { mapGetters } from 'vuex'
import Tree from '@/components/MFTree/tree'
import { downloadCsv } from '@/utils/downloadCsv'
import { eventListener } from '../../event'
// import PTable from '@/components/MFTable/PTable/table.vue'
import MfAgGrid from '@/components/MFTable/AgGrid/grid'
import { SHOW_TABLE_DATA } from '@/store/const'

export default {
  components: { codemirror, Tree, MfAgGrid },

  props: {
    projectType: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      treeData: [],
      replaceFields: {
        children: 'child',
        title: 'name'
      },
      code: ``,

      cmOptions: Object.freeze({
        mode: 'text/x-mysql',
        lineWrapping: true,
        lineNumbers: true // According to the line Numbers
      }),

      columns: [],

      tableData: [],
      databaseTableClass: [],

      tableDataAll: [],

      loading: false,

      tbName: '',

      spinning: false,

      columnsTitleArr: [],

      tableHeight: 300,
      treeHeight: '500px',
      isIE: false
    }
  },

  computed: {
    ...mapGetters(['selectTreeNode', 'collapsed']),
    mfDbTreePanelStyle() {
      return `height:${this.treeHeight}`
    }
  },

  watch: {
    collapsed(val) {
      this.getTableClass()
    }
  },

  activated() {
    this.code = ''
    this.columns = []
    this.$refs.databaseTable.setColumnDefs([])
    this.tableData = []
    this.tableDataAll = []
    this.getProjectTables()
  },

  created() {
    const _this = this
    var userAgent = navigator.userAgent
    const isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1
    const isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1
    const isWin = navigator.userAgent.toLowerCase().indexOf('win') > -1
    this.isIE = isIE || isIE11 || isWin
    this.getTableClass()
    // if (this.projectType === 'LAB_PROJECT') {
    //   this.databaseTableClass = ['databaseTable-lab', this.isIE ? 'databaseTable-ie-lab' : '']
    // } else {
    //   this.databaseTableClass = [this.isIE ? 'databaseTable-ie' : '']
    // }

    // The listening subscription event is emitted
    eventListener.on('projectSelected', function(active) {
      if (active === 'database') {
        _this.code = ''
        _this.columns = []
        _this.$refs.databaseTable.setColumnDefs([])
        _this.tableData = []
        _this.tableDataAll = []
        _this.getProjectTables()
      }
    })
  },

  mounted() {
    this.getTableHeight()
    window.addEventListener('resize', this.getTableHeight)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.getTableHeight)
  },

  methods: {
    getTableClass() {
      this.databaseTableClass = []
      if (this.collapsed) {
        if (this.projectType === 'LAB_PROJECT') {
          this.databaseTableClass = ['databaseTable-lab-collapsed', this.isIE ? 'databaseTable-ie-lab-collapsed' : '', 'databaseTable-collapsed']
        } else {
          this.databaseTableClass = [this.isIE ? 'databaseTable-ie-collapsed' : '', 'databaseTable-collapsed']
        }
      } else {
        if (this.projectType === 'LAB_PROJECT') {
          this.databaseTableClass = ['databaseTable-lab', this.isIE ? 'databaseTable-ie-lab' : '', 'databaseTable']
        } else {
          this.databaseTableClass = [this.isIE ? 'databaseTable-ie' : '', 'databaseTable']
        }
      }
    },
    getTableHeight() {
      const clientHeight = document.body.clientHeight
      const clientWidth = document.body.clientWidth
      const customerHeader = !this.checkPermission(['CUSTOMER_CONTEXT_SWITCH']) ? 45 : 0
      const labHeader = this.projectType === 'LAB_PROJECT' ? 60 : 0
      if (clientWidth > 1415) {
        this.tableHeight = clientHeight > 800 + labHeader ? `calc(100vh - 500px - ${labHeader}px + ${customerHeader}px)` : 300
        this.treeHeight = clientHeight > 800 + labHeader ? `calc(100vh - 285px - ${labHeader}px + ${customerHeader}px)` : '516px'
      } else if (clientWidth > 1080) {
        this.tableHeight = clientHeight > 1025 + labHeader ? `calc(100vh - 725px - ${labHeader}px + ${customerHeader}px)` : 300
        this.treeHeight = '200px'
      } else {
        this.tableHeight = clientHeight > 1060 + labHeader ? `calc(100vh - 760px - ${labHeader}px + ${customerHeader}px)` : 300
        this.treeHeight = '200px'
      }
    },

    className(node) {
      if (node.level === 1) {
        return 'db-node'
      }
    },

    // Set default SQL values when a node is clicked
    onNodeClick(data, node) {
      // Triggered only when the table is clicked
      if (node.level === 2) {
        this.tbName = data.name
        this.code = `SELECT * FROM ${this.tbName}`
        this.onExecute(SHOW_TABLE_DATA)
      }
    },

    // get project table
    getProjectTables() {
      const project = this.selectTreeNode.data
      this.spinning = true
      this.treeData = []
      getTables({
        domain: project['domain-name'],
        project: project.name
      }).then(res => {
        const arr = res['table-metadatas']['table-metadata'].map(i => { return { ...i, slots: { icon: 'table' }} })
        // transfer array to tree
        this.treeData = [{ name: res['table-metadatas']['@db-name'], children: arr }]
        this.spinning = false
      }).catch(() => {
        this.spinning = false
      })
    },
    onExecuted() {
      this.onExecute(SHOW_TABLE_DATA)
    },

    // execute sql
    onExecute(pageSize = null) {
      if (this.code) {
        const project = this.selectTreeNode.data
        this.spinning = true
        return new Promise((resolve, reject) => {
          runQuery({
            domain: project['domain-name'],
            project: project.name,
            data: { 'db-query': { 'sql-query': this.code }}
          }, pageSize).then(data => {
            this._initColumns(data['db-result']['column-labels'])
            this._initTableData(data['db-result'].rows)
            this.spinning = false
            resolve()
          }).catch((e) => {
            this.spinning = false
            reject(e)
          })
        })
      } else {
        this.$message.error(this.$t('project.db.noTextInQuery'))
      }
    },

    onCmCodeChange(newCode) {
      this.code = newCode
    },

    onDownLoad() {
      if (this.code) {
        const project = this.selectTreeNode.data
        this.spinning = true
        runQueryExport({
          domain: project['domain-name'],
          project: project.name,
          data: { 'db-query': { 'sql-query': this.code }}
        }).then(data => {
          downloadCsv(data, 'results', 'blobCsv')
          this.spinning = false
        }).catch((e) => {
          this.spinning = false
        })
      } else {
        this.$message.error(this.$t('project.db.noTextInQuery'))
      }
    },

    onClear() {
      this.code = ''
    },

    // render table columns
    _initColumns(columns) {
      if (columns && columns.entry) {
        columns = Array.isArray(columns.entry) ? columns.entry : [columns.entry]
        this.columnsTitleArr = []
        this.columns = columns.map(i => {
          this.columnsTitleArr.push(i.value)
          return {
            dataIndex: (i.key).toString(),
            // width: 100,
            // ellipsis: true,
            title: i.value,
            tooltipField: (i.key).toString(),
            width: i.value.length * 15
            // slots: { title: 'linkTitle' + i.key }
          }
        })
        this.$refs.databaseTable.setColumnDefs(this.columns)
      }
    },

    // init table data
    _initTableData(data) {
      this.tableData = []
      this.tableDataAll = []
      if (data && data.row) {
        let dataSourceAll = JSON.parse(JSON.stringify(Array.isArray(data.row) ? data.row : [data.row]))
        // let dataSource = Array.isArray(data.row) ? data.row : [data.row]
        // dataSource = dataSource.splice(0, 1000)
        dataSourceAll = dataSourceAll.map((i, index) => {
          const row = {}
          const entry = Array.isArray(i.entry) ? i.entry : [i.entry]
          entry.forEach(j => {
            row[j.key] = j.value
          })
          row.id = index

          return row
        })
        // dataSource = dataSource.map((i, index) => {
        //   const row = {}
        //   const entry = Array.isArray(i.entry) ? i.entry : [i.entry]
        //   entry.forEach(j => {
        //     row[j.key] = j.value
        //   })
        //   row.id = index
        //
        //   return row
        // })
        this.tableData = dataSourceAll
        this.tableDataAll = dataSourceAll

        if (this.tableDataAll.length >= SHOW_TABLE_DATA) {
          this.$message.warning(this.$t('project.db.no_less_than_max', { num: SHOW_TABLE_DATA }))
        } else {
          this.$message.info(this.$t('project.db.less_than_max', { num: this.tableDataAll.length }))
        }
      } else {
        this.tableData = []
        this.$message.info(this.$t('project.db.less_than_max', { num: this.tableDataAll.length }))
        this.tableDataAll = []
      }
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .db-node{
  font-family: MediumWeb;
}

.mf-db-wrapper{
  height: 100%;
  overflow: auto;
  /*padding-bottom: 24px;*/
}
.mf-project-tab /deep/ .ant-tabs-top-content {
  background-color: red;
  position: absolute;
}

.mf-db-tools{
  padding: 0 16px 12px 16px;
}

.mf-db-panel{
  display: flex;
  padding: 0 24px;
  height: 200px;
}

.mf-db-tree-panel{
  width: 300px;
  border: 1px solid #DCDEDF;
  overflow: auto;
}
.mf-db-data-panel{
  margin-top: 24px;
}
.databaseTable {
  padding: 16px 24px;
  width: calc(100vw - 889px);
  float: right;
}
.databaseTable-collapsed {
  padding: 16px 24px;
  width: calc(100vw - 889px + 175px);
  float: right;
}
.databaseTable-lab {
  width: calc(100vw - 606px);
}
.databaseTable-lab-collapsed {
  width: calc(100vw - 606px + 175px);
}
.ag-theme-alpine{
  min-width: 400px;
}
@media screen and (max-height: 796px) {
  .databaseTable-ie {
    width:  calc(100vw - 889px - 17px)!important;
  }
  .databaseTable-ie-collapsed {
    width:  calc(100vw - 889px - 17px + 175px)!important;
  }
}
@media screen and (max-height: 852px) {
  .databaseTable-ie-lab {
    width:  calc(100vw - 889px + 283px - 17px)!important;
  }
  .databaseTable-ie-lab-collapsed {
    width:  calc(100vw - 889px + 283px - 17px + 175px)!important;
  }
}
@media screen and (max-width: 1415px){
  .mf-db-panel{
    flex-direction: column;
    display: inline-block !important;
  }
  .mf-db-panel-ie{
    height: 400px;
    margin-bottom: 20px;
  }

  .databaseTable {
    padding: 16px 24px;
    width: calc(100vw - 577px);
    float: left;
  }
  .databaseTable-collapsed {
    padding: 16px 24px;
    width: calc(100vw - 577px + 180px);
    float: left;
  }
  .databaseTable-lab {
    //width: calc(100vw - 606px);
    width: 100%;
  }

  .mf-db-sql-panel{
    margin-top: 16px;
    min-height: 200px;
  }

  .mf-db-tools{
    padding-left: 0;
  }
  .mf-codemirror {
    margin-left: 0px;
  }
}
@media screen and (max-width: 1076px) {
  .mf-db-panel-ie{
    height: 430px;
    //margin-bottom: 24px;
  }
  .mf-db-panel-ie-tab{
    height: 400px;
    //margin-bottom: 24px;
  }
}
@media screen and (max-width: 1151px){
  .mf-db-data-panel{
    margin-top: 40px;
  }
  .mf-db-sql-panel{
    display: block;
  }
}
.mf-db-data-panel  /deep/.ant-table-hide-scrollbar{
  overflow-y: hidden !important;
}
//.mf-db-sql-panel{
//  display: flex;
//  flex-direction: column;
//}
</style>

<style lang="less">
.mf-codemirror{
  border: 1px solid #DCDEDF;
  /*border-left: none;*/
  margin-left: 16px;

  .CodeMirror{
    height: 154px;
    //width: calc(100% - 300px);
  }
}
</style>
