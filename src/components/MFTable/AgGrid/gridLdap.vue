<template>
  <div class="ag-theme-alpine" style="position: relative;">
    <a-spin v-if="loading" :spinning="true" class="grid-spin" />
    <ag-grid-vue
      style="width: 100%;"
      class="ag-theme-alpine ag-table-small"
      :locale-text="$t('agGrid')"
      :style="{height: parseFloat(height) ? height + 'px' : height}"
      :grid-options="gridOptions"
      @grid-ready="onGridReady"
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
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model'
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping'
import { MenuModule } from '@ag-grid-enterprise/menu'
import { ClipboardModule } from '@ag-grid-enterprise/clipboard'
import { LicenseManager } from '@ag-grid-enterprise/core'
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ServerSideRowModelModule,
  RowGroupingModule,
  MenuModule,
  ClipboardModule
])

axios.get('./static/licenses/ag-grid.txt').then(res => {
  LicenseManager.setLicenseKey(res.data)
}).catch(() => {})

export default {
  components: { AgGridVue },

  props: {
    height: {
      type: [Number, String],
      default: 300
    },

    gridOptions: {
      type: Object,
      default: () => null
    },

    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      gridApi: null,
      columnApi: null
    }
  },

  methods: {
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      params.api.sizeColumnsToFit()
      this.$emit('on-grid-ready')
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
