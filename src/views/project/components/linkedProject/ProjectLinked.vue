<template>
  <mf-scroll ref="linkedProject" style="left: -1px">
    <div class="project-tab">
      <div class="project-top">
        <div>
          <a-button
            v-if="checkPermission(['MY_CUSTOMER_CONTEXT_TEMPLATE_LINKED_PROJECTS_LIST_UPDATE'], ['SWITCHED_CUSTOMER_CONTEXT_TEMPLATE_LINKED_PROJECTS_LIST_UPDATE'])"
            id="add-project"
            type="primary"
            icon="plus"
            class="remove-btn"
            :disabled="isCreateProcess || !isSameVersion"
            @click="onClickAddProject"
          >{{ $t('userManagement.AddProjects') }}</a-button>
          <a-button
            v-if="checkPermission(['MY_CUSTOMER_CONTEXT_TEMPLATE_LINKED_PROJECTS_LIST_UPDATE'], ['SWITCHED_CUSTOMER_CONTEXT_TEMPLATE_LINKED_PROJECTS_LIST_UPDATE'])"
            id="remove-project"
            class="mf-margin-l-24 mf-btn-dashed"
            :disabled="!selectedRowKeys.length || isCreateProcess || !isSameVersion"
            @click="onRemoveLink"
          >
            <i class="iconfont icon-delete" />
            {{ $t('project.RemoveProjects') }}
          </a-button>
        </div>
        <div class="project-top-right">
          <a-input-search
            id="search-projects"
            v-model="searchStr"
            style="width:180px;"
            :placeholder="$t('inputSearchPlaceholder')"
            @search="onRefresh"
          />

          <div class="linked-devide" />
          <icon-btn
            id="a-icon-refresh"
            :is-disabled="false"
            :icon-title="$t('refresh')"
            icon-style="icon-refresh"
            class="project-refresh"
            @onClick="onRefresh"
          />
        </div>
      </div>

      <mf-table
        id="linked_table"
        ref="linkedTable"
        class="linked-project-table"
        row-key="link-id"
        :columns="columns"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        :data="getTableData"
        :show-pagionation="false"
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
      </mf-table>

      <add-projects ref="project" :exclude-project="linkedProjects" @onAdded="onRefresh" />

      <modal-result
        width="802px"
        :visible="resultVisible"
        :submit-show="true"
        :result-list="resultUserList"
        :columns="resultColumns"
      />
    </div>
  </mf-scroll>
</template>

<script>
import { getLinkedProject, removeLinkedProject } from '@/api/project'
import { eventListener } from '../../event'
import IconBtn from '@/components/BtnIcon/index'
import ModalResult from '@/components/ModalResult/index'
import AddProjects from './AddProjects'
import MfScroll from '@/components/MFScroll/Scroll'
import { mapGetters } from 'vuex'
import { sorting } from '@/utils'
import { USER_PROJECTS } from '@/store/const'

export default {
  name: 'ProjectLinked',

  components: {
    IconBtn,
    ModalResult,
    AddProjects,
    MfScroll
  },
  props: {
    isCreateProcess: {
      type: Boolean,
      default: false
    },
    isSameVersion: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      searchStr: '',
      isShowFilter: true,

      resultVisible: false,

      linkedProjects: [],

      resultUserList: [],

      selectedRowKeys: [],

      columns: Object.freeze([
        {
          titleText: `${this.$t('DOMAIN')}`,
          slots: { title: 'target-domain' },
          dataIndex: 'target-domain',
          ellipsis: true
        },
        {
          titleText: `${this.$t('PROJECT')}`,
          slots: { title: 'target-project' },
          dataIndex: 'target-project',
          // sorter: (a, b) => String(a.project).length > String(b.project).length ? 1 : -1,
          sorter: (a, b) => sorting(a['target-project'], b['target-project']),
          sortDirections: ['descend', 'ascend'],
          ellipsis: true
        }
      ])
    }
  },
  computed: {
    ...mapGetters(['selectTreeNode']),
    resultColumns() {
      return [{
        title: this.$t('domainName'),
        dataIndex: 'domainName',
        key: 'domainName'

      }, {
        title: this.$t('projectName'),
        dataIndex: 'projectName',
        key: 'projectName',
        ellipsis: true

      }, {
        title: this.$t('userManagement.userToolBar.successTableStatus'),
        dataIndex: 'status',
        key: 'status',
        scopedSlots: { customRender: 'status' },
        ellipsis: true,
        align: 'center'

      }, {
        title: this.$t('userManagement.userToolBar.successTableMessage'),
        dataIndex: 'message',
        key: 'message',
        ellipsis: true,
        width: '50%'
      }]
    }
  },

  activated() {
    const _this = this
    // The listening subscription event is emitted
    eventListener.on('projectSelected', function(active) {
      if (active === 'linkedprojects' && _this.$refs.linkedTable) {
        _this.$refs.linkedTable.loadData()
      }
    })
  },

  methods: {

    onRefresh() {
      this.$refs.linkedTable.refresh()
    },

    refreshProjects() {
      this.searchStr = ''
    },

    // remove links
    onRemoveLink() {
      this.$mfConfirm({
        message: this.$t('project.isConfirmUnlinkProject'),
        iconType: 'Confirm',

        onConfirm: () => {
          const selectTemplate = this.selectTreeNode.data
          const params = this.selectedRowKeys.map((item, index) => {
            const sourceProject = this.linkedProjects.find(i => i['link-id'] === item)
            return {
              'link-id': item,
              'link-type': 'template',
              'target-domain': selectTemplate['domain-name'],
              'target-project': selectTemplate.name,
              'source-domain': sourceProject['target-domain'],
              'source-project': sourceProject['target-project']
            }
          })
          return removeLinkedProject({
            'project-links': {
              'project-link': params
            }
          }).then(() => {
            this.$message.success(this.$t('project.linkedRemoveSuccess'))
            this.$refs.linkedTable.refresh()
          })
        }
      })
    },

    onSelectChange(val) {
      this.selectedRowKeys = val
    },

    onClickAddProject() {
      this.$refs.project.onShow()
    },

    // get template linked project list
    getTableData() {
      this.selectedRowKeys = []
      const selectProject = this.selectTreeNode.data
      this.linkedProjects = []
      return getLinkedProject({
        'source-domain': selectProject['domain-name'],
        'source-project': selectProject.name
      }).then(data => {
        if (data['project-links']) {
          const list = data['project-links']['project-link']
          this.linkedProjects = Array.isArray(list) ? list : [list]
          this.linkedProjects = this.linkedProjects.filter(i => i['target-project'] !== USER_PROJECTS.LabProject)
          // is search list
          if (this.searchStr) {
            this.linkedProjects = this.linkedProjects.filter(i => (i['target-project']).toString().indexOf(this.searchStr + '') > -1)

            return new Promise((resolve, reject) => {
              return resolve(this.linkedProjects)
            })
          }
          return this.linkedProjects
        }
      }).catch(() => {
        return []
      })
    }
  }
}
</script>

<style lang="less" scoped>
.project-tab{
  padding-bottom: 24px;
}
.project-top{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 24px 0;
  background-color: #fff;
  .remove-btn{
    margin-left: 24px;
  }
  .project-top-right{
    display: flex;
    align-items: center;
    margin-right: 24px;
    button{
      margin-right: 10px;
    }
  }
}
.table-select{
  width: 200px;
}

#a-icon-delete{
  margin-right: 9px;
  color: #ffffff;
  font-size: 12px;
  width: 12px;
  height: 12px;
}

#a-icon-refresh{
  margin-right: 24px;
}

.linked-devide{
  width: 1px;
  height: 12px;
  background:#CCCCCC;
  margin-right: 23px;
  margin-left: 24px;
}

/deep/ .ant-tabs-tab{
  font-size: 18px;
  font-family: BoldWeb serif;
  font-weight: bold;
  color: #323435;
  line-height: 21px;
}
</style>
<style lang="less">
#linked_table{
  .ant-table-column-sorters::before{
    content: none !important;
  }
}
</style>
