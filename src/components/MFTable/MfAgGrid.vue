<template>
  <ag-grid-vue
    style="width: 100%; height: 100%;"
    class="ag-theme-alpine"
    :grid-options="gridOptions"
    :row-data="rows"
    v-bind="$attrs"
    @grid-ready="onGridReady"
    @sort-changed="sortChange"
    @selection-changed="onSelectionChanged"
    v-on="$listeners"
  />
</template>

<script>
import { AgGridVue } from 'ag-grid-vue'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

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
    unSortIcon: !!column.sorter
    // comparator: column.sorter
    /** cellRenderer */
    // cellRenderer: column?.customRender
  }))

export default {
  name: 'MfAgGrid',
  components: {
    AgGridVue
  },
  props: {
    columns: {
      type: Array,
      required: true
    },
    rows: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      gridOptions: null,
      gridApi: null,
      columnApi: null
    }
  },
  computed: {
    sortConfig() {
      const hasSort = this.columns.filter(i => i.sorter)
      const defaultSort = this.columns.find(i => i.defaultSort)
      const sort = { trigger: 'cell' }

      if (defaultSort) {
        sort.defaultSort = {
          field: defaultSort.dataIndex,
          order: defaultSort.defaultSort.order
        }
        sort.orders = ['desc', 'asc', null]
      }

      return hasSort.length > 0 ? sort : null
    }
  },
  beforeMount() {
    this.gridOptions = {
      columnDefs: createColumnDefs(this.columns),
      defaultColDef: {
        resizable: true
      },
      rowSelection: 'multiple'
    }
  },
  mounted() {
    this.gridApi = this.gridOptions.api
    this.columnApi = this.gridOptions.columnApi
  },
  methods: {
    onSelectionChanged() {
      this.$emit('checkbox-change', this.gridApi.getSelectedRows())
    },
    onGridReady() {
      this.gridApi.sizeColumnsToFit()
    },
    sortChange(event) {
      // todo: 怎么确定点击排序的是哪一列
      console.log(event)
      console.log((this.sorter.order = this.columnApi.getColumnState()))
      this.sorter.order = this.columnApi.getColumnState()[0].sort
      this.sorter.columnKey = this.columnApi.getColumnState()[0].colId
      // this.$emit(
      //   'change',
      //   this.paginationMf ? this.paginationMf : this.pagination,
      //   null,
      //   this.sorter
      // )
    }
  }
}
</script>

<style lang="less"></style>
