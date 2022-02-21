<template>
  <mf-modal
    id="project-update-prioritization-modal"
    :visible="visible"
    :has-spin="false"
    :confirm-loading="confirmLoading"
    width="802px"
    height="638px"
    :cancel-text="$t('Cancel')"
    :ok-text="$t('Save')"
    :next-disabled="isChange"
    @cancel="onCancel"
    @ok="onSubmit"
  >
    <span slot="title" class="modal-title">
      {{ $t('helpLinks.Project_Update_Prioritization') }}
      <mf-help-btn :help="PROJECT_UPDATE_PRIORITIZATION_HELP" />
    </span>

    <p class="bg-blue">
      <a-icon type="info-circle" class="icon" />
      <span>{{ $t('tools.projectUpdatePrioritizationTitle',{maxValue}) }}</span>
    </p>
    <a-row type="flex" justify="space-between">
      <a-col>
        <a-button id="restore_Default-btn" class="mf-btn-dashed" @click="onRestoreDefault">
          <i class="iconfont icon-Project-Restore" />
          <span>{{ $t('helpLinks.Restore_Default') }}</span>
        </a-button>
      </a-col>
      <a-col>
        <a-input-search
          id="users_search"
          v-model="searchValue"
          :placeholder="$t('inputSearchProjectNamePlaceholder')"
          style="width: 237px; margin-left: 13px"
          @search="onSearch"
        />
      </a-col>
    </a-row>
    <mf-ag-grid
      ref="gridTableRef"
      class="grid-table"
      size="small"
      :options="Options"
      :columns="columns"
      :data-source="projectList"
      :height="350"
    />

  </mf-modal>

</template>

<script>
import MfAgGrid from '@/components/MFTable/AgGrid/grid'
import { getProjectUpgradePriorities, putProjectUpgradePriorities } from '@/api/tools'
import { getConfigurationParameter } from '@/api/configuration'
import { PROJECT_UPDATE_PRIORITIZATION_HELP } from 'config/help'
import { AUTOMATIC_UPGRADE_PRIORITY_TOP_RANGE } from '@/store/const'

import projectUpdatePrioritizationInput from '@/layouts/components/headBar/components/projectUpdatePrioritizationInput.vue'
import { isChangeObjorArr } from '@/utils'

export default {
  name: 'ProjectUpdatePrioritizationModal',
  // eslint-disable-next-line vue/no-unused-components
  components: { MfAgGrid, projectUpdatePrioritizationInput },

  data() {
    return {
      visible: false,
      searchValue: '',
      projectList: [],
      oldProjectList: [],
      rowSelection: [],
      isChange: false,
      loading: false,
      maxValue: 100,
      confirmLoading: false,
      PROJECT_UPDATE_PRIORITIZATION_HELP,
      AUTOMATIC_UPGRADE_PRIORITY_TOP_RANGE,
      columns: Object.freeze([{
        dataIndex: 'domain-name',
        title: this.$t('userManagement.DOMAINNAME'),
        sorter: 'desc'
      }, {
        dataIndex: 'project-name',
        title: this.$t('userManagement.PROJECTNAME'),
        sorter: 'desc',
        filter: 'agTextColumnFilter'
      }, {
        dataIndex: 'priority',
        title: this.$t('tools.PRIORITY'),
        cellRenderer: 'projectUpdatePrioritizationInput',
        defaultSort: {
          order: 'asc'
        },
        sorter: 'desc',
        comparator: (a, b) => a > b ? 1 : -1
      }]),
      Options: {
        getRowNodeId: data => data['domain-name'] + data['project-name'],
        context: {
          changePriority: (row) => {
            this.changePriority(row)
          }
          // notContextMenuCol: ['priority']
        }
      }
    }
  },
  watch: {
    projectList: {
      handler(val) {
        this.isChange = isChangeObjorArr(this.projectList, this.oldProjectList)
      },
      deep: true
    }
  },

  methods: {
    changePriority(item) {
      if (this.maxValue < item.data.priority || item.data.priority < 1) {
        const message = this.maxValue < item.data.priority ? this.$t('tools.You_cannot_exceed_priority_max', { maxValue: this.maxValue }) : this.$t('tools.Value_cannot_be_less_than')

        // 7063 it needs to check before pop up dialog
        this.checkPriorityValue(item, item.value)
        this.$mfConfirm({
          message: message,
          isShowCancel: false,
          confirmText: this.$t('OK'),
          title: this.$t('warning'),
          iconType: 'Warning'
          // onCloseChange: () => this.checkPriorityValue(item),
          // onConfirm: () => this.checkPriorityValue(item)
        })
      } else {
        this.checkPriorityValue(item, item.data.priority)
      }
    },

    onCancel() {
      this.visible = false
    },
    onSubmit() {
      // this.visible = false
      this.confirmLoading = true
      const ProjectUpdatePrioritiesData = this.projectList.filter(item => {
        if (!item['is-template'] && item['project-type'] !== 'LabManagement') {
          item.priority = Number(item.priority)
          return item
        }
      })

      const data = {
        'project-upgrade-priorities': {
          // '@total-results': ProjectUpdatePrioritiesData.length,
          'project-upgrade-priority': ProjectUpdatePrioritiesData.length > 1 ? ProjectUpdatePrioritiesData : ProjectUpdatePrioritiesData[0]
        }
      }
      this.loading = true
      putProjectUpgradePriorities(data).then(res => {
        this.onGetProjectUpgradePriorities()
        this.$message.success(this.$t('tools.Project_updated_successfully'))
        // console.log(res)
      }).finally(() => (this.confirmLoading = false))
    },
    onShow() {
      this.visible = true
      this.maxValue = 100
      this.loading = true
      this.projectList = []
      this.onGetProjectUpgradePriorities()

      getConfigurationParameter().then(response => {
        const parameters = response['site-parameters']['site-parameter']
        if (Array.isArray(parameters)) {
          const hasItem = parameters.find((item) => {
            return item.name === this.AUTOMATIC_UPGRADE_PRIORITY_TOP_RANGE
          })
          this.maxValue = hasItem ? hasItem.value : this.maxValue
        }
      })
    },
    onGetProjectUpgradePriorities() {
      getProjectUpgradePriorities().then(res => {
        this.projectList = res['project-upgrade-priorities']['project-upgrade-priority']
        this.projectList = this.projectList ? Array.isArray(this.projectList) ? this.projectList : [this.projectList] : []
        this.oldProjectList = JSON.parse(JSON.stringify(this.projectList))
        this.loading = false
      })
    },
    onRestoreDefault() {
      this.$mfConfirm({
        message: this.$t('tools.restore_all_projects_message'),
        confirmText: this.$t('OK'),
        cancelText: this.$t('Cancel'),
        onConfirm: async() => {
          const ProjectUpdatePrioritiesData = this.projectList.filter(item => {
            if (!item['is-template'] && item['project-type'] !== 'LabManagement') {
              item.priority = this.maxValue
              return item
            }
          })
          const data = {
            'project-upgrade-priorities': {
              'project-upgrade-priority': ProjectUpdatePrioritiesData.length > 1 ? ProjectUpdatePrioritiesData : ProjectUpdatePrioritiesData[0]
            }
          }
          this.loading = true
          await putProjectUpgradePriorities(data).then(res => {
            this.onGetProjectUpgradePriorities()
          })
        }
      })
    },
    onSearch() {
      this.$refs.gridTableRef.restoreFromHardCoded(
        {
          'project-name': {
            type: 'contains',
            filter: this.searchValue
          }
        }
      )

      // var hardcodedFilter = {
      //   country: {
      //     type: 'set',
      //     values: ['Ireland', 'United States'],
      //   },
      //   age: { type: 'lessThan', filter: '30' },
      //   athlete: { type: 'startsWith', filter: 'Mich' },
      //   date: { type: 'lessThan', dateFrom: '2010-01-01' },
      // };
    },

    checkPriorityValue(item, val) {
      const node = this.$refs.gridTableRef.gridOptions.api.getRowNode(`${item.data['domain-name']}${item.data['project-name']}`)
      node.setDataValue('priority', val)
      item.data.priority = val
    }
  }
}
</script>

<style scoped lang="less">
@import "~@/styles/variables.less";
.modal-title{
  font-size: 18px;
}
.modal-clues{
  font-weight: 600;
  line-height: 19px;
  font-family: MediumWeb;
  margin-bottom: 23px;
}
.grid-table{
  margin-top: 20px;
}
/deep/ .ant-modal-body{
  padding-top: 0;
}
.bg-blue{
  width: auto;
  display: flex;
  align-items: center;
  background-color: @alert-blue;
  margin-left: -24px;
  margin-right: -24px;
}
.icon{
  margin: 0 18px;
  margin-left: 21px;
}
.icon-Project-Restore{
  font-size: 16px;
}
/deep/ .ag-cell-focus{
  border:0 !important;
}

</style>
