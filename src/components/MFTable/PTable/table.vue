<template>
  <div class="mf-table">
    <div
      ref="headerWrapper"
      class="mf-table_header-wrapper"
    >
      <table
        class="mf-table_header"
        cellspacing="0"
        cellpadding="0"
      >
        <colgroup>
          <col
            v-for="col in realColumn"
            :key="col.dataIndex"
            :name="'column_'+col.dataIndex"
            :width="col.width"
            :style="{width: col.width +'px', minWidth: col.width+'px'}"
          >
        </colgroup>
        <thead>
          <tr>
            <th v-for="column in realColumn" :key="column.dataIndex">
              <div class="cell">
                <span>{{ column.title }}</span>
              </div>
            </th>
          </tr>
        </thead>
      </table>
    </div>

    <div
      ref="bodyWrapper"
      class="mf-table_body-wrapper"
      :style="[bodyHeight]"
    >
      <table-body class="mf-table_body" :columns="realColumn" :data="data" />
      <div
        v-if="!data || data.length === 0"
        class="mf-table_empty"
      >
        <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
      </div>
      <!-- <table
        class="mf-table_body"
        cellspacing="0"
        cellpadding="0"
      >
        <colgroup>
          <col
            v-for="col in realColumn"
            :key="col.dataIndex"
            :name="'column_'+col.dataIndex"
            :width="col.width"
            :style="{width: col.width +'px', minWidth: col.width+'px'}"
          >
        </colgroup>
        <tbody>
          <tr v-for="tr in data" :key="tr.id">
            <td v-for="column in realColumn" :key="column.dataIndex" :class="'column_'+column.dataIndex">
              <div class="cell">
                {{ tr[column.dataIndex] }}
              </div>

            </td>
          </tr>
        </tbody>
      </table> -->
    </div>
  </div>
</template>

<script>
// import TableLayout from './models/table-layout'
import { throttle } from './models/utils'
// import TableHeader from './table-header'
import TableBody from './table-body'
import { Empty } from 'ant-design-vue'

export default {
  components: { TableBody },
  props: {
    columns: {
      type: Array,
      default: () => []
    },

    data: {
      type: Array,
      default: () => []
    },

    fit: {
      type: Boolean,
      default: true
    },

    height: {
      type: [String, Number],
      default: 0
    }
  },
  data() {
    // const layout = new TableLayout({
    //   table: this,
    //   fit: this.fit
    // })
    return {
      Empty,
      // layout,
      realColumn: []
    }
  },
  computed: {
    bodyHeight() {
      if (this.height) {
        const bodyHeight = parseInt(this.height)
        return {
          height: bodyHeight + 'px'
        }
      }
      return {}
    },
    bodyWrapper() {
      return this.$refs.bodyWrapper
    }
  },
  watch: {
    columns: function(val) {
      this.realColumn = val
      this.updateColumnsWidth()
    }
  },
  mounted() {
    this.bindEvents()
    this.updateColumnsWidth()
  },
  destroyed() {
    this.unbindEvents()
  },
  methods: {
    bindEvents() {
      const { headerWrapper } = this.$refs
      headerWrapper.scrollLeft = 0
      this.bodyWrapper.addEventListener('scroll', this.syncPostion, { passive: true })
    },
    unbindEvents() {
      this.bodyWrapper.removeEventListener('scroll', this.syncPostion, { passive: true })
    },

    syncPostion: throttle(20, function() {
      const { scrollLeft } = this.bodyWrapper
      const { headerWrapper } = this.$refs

      if (headerWrapper) headerWrapper.scrollLeft = scrollLeft
    }),

    updateColumnsWidth() {
      const bodyWidth = this.$el.clientWidth
      let allColumnWidth = 0

      this.columns.forEach(column => {
        allColumnWidth += column.width
      })

      if (allColumnWidth < bodyWidth) {
        const resetWidth = bodyWidth / this.columns.length
        this.realColumn = this.columns.map(item => {
          item.width = resetWidth
          return item
        })
      }
    }
  }
}
</script>

<style>
.mf-table{
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  flex: 1;
  width: 100%;
  max-width: 100%;
}

.mf-table::before{
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
}
.mf-table::after{
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 1px;
  height: 100%;
}
/* .el-table--border:after, .el-table--group:after, .el-table:before */

.mf-table{
  border: 1px solid #dcdedf;
}

.mf-table td, .mf-table th{
  min-width: 0;
  box-sizing: border-box;
  border-bottom: 1px solid #dcdedf;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
  padding: 9px 16px;
}

/* .mf-table td, .mf-table th{
  border-right: 1px solid #dcdedf;
} */

.mf-table th{
  overflow: hidden;
  color: rgba(0,0,0,.85);
  font-family: BoldWeb;
}

.mf-table .cell{
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
}
.mf-table th>.cell{
  display: inline-block;
  box-sizing: border-box;
  position: relative;
  vertical-align: middle;
  /* padding: 10px; */
  width: 100%;
}
.mf-table_header-wrapper{
  overflow: hidden;
  width: 100%;
  border-bottom: 1px solid #dcdedf;
}
.mf-table_header,.mf-table_body{
  table-layout: fixed;
  border-collapse:separate;
}

.mf-table_body-wrapper{
  overflow-x: auto;
  overflow-y: auto;
}
.mf-table_empty {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
}
</style>
