
<template>
  <mf-modal
    :visible="visible"
    class="task-modal"
    :confirm-loading="false"
    width="802px"
    :has-spin="false"
    :cancel-text="$t('Close')"
    @cancel="onCancel"
    @ok="onOk"
  >
    <span slot="title" class="modal-title">
      {{ $t('taskStatus.TASKStatus') }}
    </span>
    <div class="task-modal-body">
      <div class="task-modal-head">
        <a-form style="width:95%" :label-col="{ span: 9 }" :wrapper-col="{ span: 15 }">
          <a-row>
            <a-col :span="8">
              <a-form-item
                :label="$t('taskStatus.Status')"
              >
                <mf-select
                  id="task-status-statusType"
                  v-model="filterForm.status"
                  :allow-clear="false"
                >
                  <a-select-option
                    v-for="(item, key) in statusType"
                    :key="key"
                    :value="item.value"
                    :title="item.label"
                  >
                    {{ item.label }}
                  </a-select-option>
                </mf-select>
              </a-form-item></a-col>
            <a-col :span="8">
              <a-form-item
                :label="$t('taskStatus.Type')"
              >
                <mf-select id="task-status-type" v-model="filterForm.type" :allow-clear="false">
                  <a-select-option v-for="(item,index) in type" :key="index" :value="item.value" :title="item.label">
                    {{ item.label }}
                  </a-select-option>
                </mf-select>
              </a-form-item></a-col>
            <a-col :span="8">
              <a-form-item
                :label="$t('taskStatus.Domain')"
              >
                <mf-select id="task-status-domainType" v-model="filterForm['domain-name']" :allow-clear="false">
                  <a-select-option v-for="(item,index) in domainType" :key="index" :value="item.value" :title="item.label">
                    {{ item.label }}
                  </a-select-option>
                </mf-select>
              </a-form-item></a-col>
          </a-row>
        </a-form>
        <div class="task-all-wrap" @click="isAllEnabled&&onClear()">
          <i style="font-size:24px" :class="['iconfont',isAllEnabled?'icon-TaskStatus-AllEnable':'icon-TaskStatus-AllDisabled'] " />
        </div>
      </div>
      <div class="task-modal-content">
        <div class="task-modal-content-top">
          <a-row type="flex" justify="space-between">
            <a-col>
              <a-button id="refresh" @click="onRefresh">
                <i class="iconfont icon-refresh" />
                {{ $t('taskStatus.Refresh') }}
              </a-button>
            </a-col>
            <a-col>
              <a-input-search
                id="project_name_search"
                v-model="filterForm['project-name']"
                :placeholder="$t('inputSearchProjectNamePlaceholder')"
                style="width: 237px; margin-left: 13px"
                @search="onSearch"
              />
            </a-col>
          </a-row>
        </div>
        <div class="task-modal-content-body">
          <mf-ag-grid
            v-if="taskVisible"
            ref="taskStatusGrid"
            class="grid-table"
            :columns="taskColumns"
            :options="options"
            :data-source="filterResult"
            :loading="loading"
            :height="350"
            size="small"
          />
        </div>
        <p class="recordText none-select">{{ $t('taskStatus.RecordLastDays') }}</p>
      </div>
    </div>
  </mf-modal>
</template>
<script>
import MfAgGrid from '@/components/MFTable/AgGrid/grid'
import { getLastEventLogs } from '@/api/taskStatus'
import { taskType, taskStatusType, MAP_TASK_TYPE } from './config/type'
import { isSiteAdmin } from '@/utils/permission'
import { timeStampToString, uniqueArr } from '@/utils'
import { mapGetters } from 'vuex'
import TaskActions from './TaskActions.vue'

export default {
  components: {
    MfAgGrid,
    // eslint-disable-next-line vue/no-unused-components
    TaskActions
  },
  props: {
    taskVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      form: {},
      loading: false,
      filterForm: {
        'domain-name': this.$t('taskStatus.type.All'),
        status: this.$t('taskStatus.statusType.All'),
        type: this.$t('taskStatus.type.All'),
        'project-name': ''
      },
      statusType: taskStatusType,
      type: taskType,
      domainType: [],
      eventList: [],
      filterResult: [],
      options: {
        context: {
          // notContextMenuCol: ['action']
        }
      }
    }
  },
  computed: {
    ...mapGetters(['serverType']),
    isAllEnabled() {
      return this.filterForm.status !== this.$t('taskStatus.type.All') ||
      this.filterForm['domain-name'] !== this.$t('taskStatus.type.All') ||
      this.filterForm.type !== this.$t('taskStatus.type.All')
    },
    taskColumns() {
      let columns = [{
        dataIndex: 'type',
        title: this.$t('taskStatus.TYPE'),
        width: 120,
        sorter: 'desc'
      }, {
        dataIndex: 'project-name',
        title: this.$t('taskStatus.PROJECT'),
        width: 120,
        sorter: 'desc'
      }, {
        dataIndex: 'domain-name',
        title: this.$t('taskStatus.DOMAIN'),
        width: 120,
        sorter: 'desc'
      }, {
        dataIndex: 'status',
        title: this.$t('taskStatus.STATUS'),
        width: 120,
        sorter: 'desc',
        cellRenderer: (params) => {
          const statusClass = params.value === 'Success'
            ? 'task-success'
            : params.value === 'Fail'
              ? 'task-fail' : 'task-processing'
          return `<div class="task-status ${statusClass}">${params.data.statusLabel}</div>`
        }
      }, {
        dataIndex: 'time',
        title: this.$t('taskStatus.TIME'),
        minWidth: 160,
        width: 160,
        sorter: 'desc'
      }, {
        dataIndex: 'action',
        title: this.$t('taskStatus.ACTION'),
        minWidth: 90,
        width: 90,
        cellRenderer: 'TaskActions'
      }]
      columns = isSiteAdmin() ? columns : columns.filter(item => item.dataIndex !== 'action')

      // add tooltip
      columns.forEach(column => column.dataIndex !== 'action' && (column.tooltipField = column.dataIndex))

      return Object.freeze(columns)
    }
  },
  watch: {
    taskVisible: {
      handler(visible) {
        this.visible = visible
        if (visible) {
          this.onEventLogs()
        }
      }
    },
    filterForm: {
      handler(filterForm) {
        this.onFilter(filterForm, this.eventList)
      },
      deep: true
    }
  },
  methods: {
    onEventLogs() {
      this.loading = true
      getLastEventLogs().then(res => {
        let list = res.events.event
        list = list ? Array.isArray(list) ? list : [list] : []
        if (list.length) {
          list.forEach(item => {
            const interKey = MAP_TASK_TYPE[item.action].replace(/\s+/g, '_')
            item.type = this.$t(`taskStatus.type.${interKey}`)
            item.statusLabel = this.$t(`taskStatus.statusType.${item.status}`)
            item['project-name'] = item['project-name'] + ''
            item.time = timeStampToString(item['creation-date'], true)
          })
        }
        this.eventList = list
        this.onFilter(this.filterForm, this.eventList)
        this.getDomains(list)
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    getDomains(list) {
      const names = uniqueArr(list.map((item) => item['domain-name']))
      this.domainType = names.map(name => {
        return { label: name, value: name }
      })
      this.domainType.unshift({ value: this.$t('taskStatus.statusType.All'), label: this.$t('taskStatus.statusType.All') })
    },

    onSearch() {
      this.onFilter(this.filterForm, this.eventList)
    },

    onRefresh() {
      // this.onClear()
      this.onEventLogs()
    },

    onFilter(filterForm, tableData) {
      const isAll =
        filterForm.status === this.$t('taskStatus.statusType.All') &&
        filterForm['domain-name'] === this.$t('taskStatus.type.All') &&
        filterForm.type === this.$t('taskStatus.type.All') &&
        filterForm['project-name'] === ''
      if (isAll) {
        this.filterResult = tableData
      } else {
        const tempFilter = {}
        for (const key in filterForm) {
          tempFilter[key] = filterForm[key] === this.$t('taskStatus.type.All') ? '' : filterForm[key]
        }
        this.filterResult = this.packFilter(tempFilter, tableData)
      }
    },

    packFilter(tempFilter, tableData) {
      const result = tableData.filter(item => {
        let matchProjectName = true
        let matchStatus = true
        let matchType = true
        let matchDomain = true
        if (tempFilter.status) {
          matchStatus = item.statusLabel === tempFilter.status
        }
        if (tempFilter.type) {
          matchType = item.type.toString() === tempFilter.type.toString()
        }
        if (tempFilter['domain-name']) {
          matchDomain = item['domain-name'].toString() === tempFilter['domain-name'].toString()
        }
        if (tempFilter['project-name']) {
          matchProjectName = (item['project-name'].toString().toLowerCase().indexOf(tempFilter['project-name'].toString().toLowerCase()) >= 0)
        }
        return matchProjectName && matchStatus && matchType && matchDomain
      })
      return result
    },

    onClear() {
      for (const key in this.filterForm) {
        this.filterForm[key] = this.$t('taskStatus.type.All')
        this.filterForm['project-name'] = ''
      }
      this.filterResult = this.eventList
    },

    onOk() {
      this.onCancel()
    },

    onCancel() {
      this.visible = false
      this.onClear()
      this.$emit('update:taskVisible', false)
    }
  }
}
</script>
<style lang="less" scoped>
  // task modal
.task-modal{
   /deep/ .ant-modal-body{
     padding:12px 0 0 0;
   }
   /deep/ .mf-btn-Save{
      display:none
   }
   .recordText{
     color:rgba(0,0,0,.75);
     margin:5px 0
   }
}

.task-modal-head{
   display:flex;
   padding:0 24px;
   margin-bottom:16px;
   border-bottom:1px solid #DCDEDF;
   /deep/ .ant-form-item{
     width:220px;
   }
   /deep/ .icon-TaskStatus-AllEnable{
     cursor:pointer;
     color: #0079ef;
   }
   /deep/ .icon-TaskStatus-AllDisabled{
     cursor:not-allowed;
     color:rgba(0, 0, 0, 0.2);
  }
  .task-all-wrap{
    width:20px;
    height:40px;
    line-height:40px;
    margin-left:20px;
  }
}

.task-modal-content{
  padding:0 24px;
}

.task-modal-content-top{
   /deep/ .ant-btn{
     font-size:16px;
     border: 1px solid #000000;
     display:flex;
     align-items: center;
  }
  /deep/ .ant-btn:hover, .ant-btn:focus{
     color:#000
  }
  /deep/ .ant-btn i{
     font-size:18px
  }
}

.task-modal-content-body{
   margin-top:16px;
   /deep/ .ag-cell span{
     width:100%;
     display:inline-block;
   }
  /deep/ .task-status{
     width:100%;
     overflow:hidden;
     text-overflow:ellipsis;
  }
  /deep/ .task-status:before{
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 8px;
    border-radius: 50%;
    margin-bottom:1px;
  }
  /deep/ .task-success:before{
    background-color: #1AAC60;
  }
  /deep/ .task-fail:before{
    background-color: #E5004C;
  }
  /deep/ .task-processing:before{
    background-color: #0075f3;
  }
}
</style>

