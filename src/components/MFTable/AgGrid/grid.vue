<template>
  <div class="ag-theme-alpine" style="position: relative;">
    <a-spin v-if="loading" :spinning="true" class="grid-spin" />
    <ag-grid-vue
      id="ag-grid-table"
      style="width: 100%;"
      :style="{height: parseFloat(height) ? height + 'px' : height}"
      :class="{'ag-theme-alpine': true, 'ag-table-small': size === 'small'}"
      :grid-options="gridOptions"
      :row-data="dataSource"
      :row-height="rowHeight"
      v-bind="$attrs"
      :locale-text="$t('agGrid')"
      @grid-ready="onGridReady"
      @selectionChanged="onSelectionChanged"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import axios from 'axios'
import '@ag-grid-community/core/dist/styles/ag-grid.css'
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css'
import { AgGridVue } from '@ag-grid-community/vue'
import { ModuleRegistry } from '@ag-grid-community/core'
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'
import { LicenseManager } from '@ag-grid-enterprise/core'
import { MenuModule } from '@ag-grid-enterprise/menu'
import { ClipboardModule } from '@ag-grid-enterprise/clipboard'
import { sorting } from '@/utils/index.js'
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  MenuModule,
  ClipboardModule
])

axios.get('./static/licenses/ag-grid.txt').then(res => {
  LicenseManager.setLicenseKey(res.data)
}).catch(() => {})

const createColumnDefs = columns =>
  columns.map(column => ({
    /** basic */
    headerName: column.title,
    field: column.dataIndex,
    colId: column.dataIndex,
    /** select */
    checkboxSelection: column.type === 'checkbox',
    headerCheckboxSelection: column.type === 'checkbox', // select all
    // headerCheckboxSelectionFilteredOnly: false, // selected filtered
    /** sort */
    sortable: !!column.sorter,
    sort: column.sorter ? column?.defaultSort?.order : null, // sort type: desc asc null
    unSortIcon: !!column.sorter,
    comparator: (a, b) => sorting(a, b),
    ...column
    // comparator: column.sorter
    /** cellRenderer */
    // cellRenderer: column?.customRender
  }))

export default {
  components: { AgGridVue },

  props: {
    options: {
      type: Object,
      default: () => null
    },
    columns: {
      type: Array,
      required: true
    },
    dataSource: {
      type: Array,
      required: true
    },

    height: {
      type: [Number, String],
      default: 300
    },
    CellEditingStoppedFunc: {
      type: Function,
      default() {
        return null
      }
    },

    rowSelection: {
      type: Array,
      default: () => []
    },
    sizeToFit: {
      type: Boolean,
      default: true
    },

    size: {
      type: String,
      default: 'default'
    },

    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      columnDefs: [],
      gridOptions: null,
      gridApi: null,
      columnApi: null,
      isInit: true
    }
  },

  computed: {
    rowHeight() {
      if (this.size === 'small') {
        return 32
      }
      return 42
    }
  },

  watch: {
    dataSource() {
      if (this.gridApi && this.isInit && this.sizeToFit) {
        this.isInit = false
        this.$nextTick(() => {
          this.gridApi.sizeColumnsToFit()
        })
      }
    }
  },

  beforeMount() {
    this.gridOptions = {
      ...this.options,
      columnDefs: createColumnDefs(this.columns),
      onCellEditingStopped: this.CellEditingStoppedFunc,
      rowHeight: this.rowHeight,
      defaultColDef: {
        resizable: true,
        lockVisible: true,
        suppressMenu: true
      },
      rowSelection: 'multiple',
      suppressRowClickSelection: true,
      tooltipShowDelay: 0
    }
    if (this.options && this.options.context && this.options.context.notContextMenuCol) {
      this.gridOptions.getContextMenuItems = (params) => {
        if (this.options.context.notContextMenuCol.indexOf(params.column.colDef.dataIndex) > -1) {
          return []
        } else {
          return [
            'copy',
            'copyWithHeaders',
            'paste'
          ]
        }
      }
    } else {
      this.gridOptions.getContextMenuItems = (params) => {
        return [
          'copy',
          'copyWithHeaders',
          'paste'
        ]
      }
    }
  },

  methods: {
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi

      params.api.sizeColumnsToFit()
    },
    restoreFromHardCoded(hardcodedFilter) {
      this.gridOptions.api.setFilterModel(hardcodedFilter)
    },
    onSelectionChanged() {
      const selected = this.gridApi.getSelectedNodes().map(item => item.data)
      this.$emit('update:rowSelection', selected)
    },
    deselectAll() {
      if (this.gridApi) {
        this.gridApi.deselectAll()
      }
    },
    setColumnDefs(columns) {
      if (this.gridApi) {
        this.gridApi.setColumnDefs(createColumnDefs(columns))
      }
    },
    sizeColumnsToFit() {
      if (this.gridApi) {
        this.gridApi.sizeColumnsToFit()
      }
    }
  }
}
</script>

<style lang="less">
@import '~@/styles/ag-grid.less';

.grid-spin.ant-spin {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background: rgba(255, 255, 255, 0.35);
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
