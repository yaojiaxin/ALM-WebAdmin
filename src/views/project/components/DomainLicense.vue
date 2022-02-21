<template>
  <div class="domain">
    <div class="domain-content">

      <div class="mf-subtitle mf-margin-b-24">{{ $t('customers.alm_license_assignments') }}</div>

      <div class="domain-cont">
        <a-table
          id="assignments-table"
          row-key="license-name"
          :data-source="assignmentList"
          :columns="columns"
          :pagination="false"
          :loading="loading"
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

          <template slot="assignment" slot-scope="text,record,index">
            <editable-cell
              ref="editableRef"
              :key="'assignment'"
              :keys="'assignment'"
              :text="text"
              :licenses-max-length="record.available"
              :tag="String('tag-'+record['license-id'])"
              @saveChange="saveChange"
              @change="onCellChange(index, $event)"
            />
          </template>

        </a-table>
      </div>

    </div>
    <div
      class="project-bottom-btn"
    >
      <a-button id="restore-attributes" :disabled="isDisabled || submitting" style="margin-right: 8px;" class="mf-btn-dashed" @click="getAssignmentsTable"> {{ $t('Restore') }} </a-button>
      <a-button id="saas-domain-save" :disabled="isSave" type="primary" :loading="submitting" @click="editSave">{{ $t('Save') }}</a-button>
    </div>
  </div>
</template>

<script>
import { getDomainLicense, updateDomainLicense } from '@/api/project'
import { mapGetters } from 'vuex'
import EditableCell from '@/views/licenses/management/components/EditableCell'
import { eventListener } from '../event'
import { isChangeObjorArr } from '@/utils'
import { getIsLogin } from '@/utils/auth'

export default {
  name: 'ProjectLicense',

  components: {
    EditableCell
  },

  props: {
    assignment: {
      type: Array,
      default: () => []
    },
    unsavedTabs: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      assignmentList: [],
      initAssignmentList: [],
      loading: false,
      submitting: false,
      isDisabled: false,
      isSave: true,
      columns: [
        {
          titleText: this.$t('userManagement.userToolBar.successTableTitle'),
          slots: { title: 'license-name' },
          dataIndex: 'license-name',
          key: 'license-name',
          ellipsis: true
        },
        {
          titleText: this.$t('customers.assignment'),
          slots: { title: 'assignment' },
          dataIndex: 'assignment',
          key: 'assignment',
          scopedSlots: { customRender: 'assignment' },
          ellipsis: true
        },
        {
          titleText: this.$t('customers.available'),
          slots: { title: 'available' },
          key: 'available',
          dataIndex: 'available',
          align: 'center',
          ellipsis: true
        }
      ],
      isArrayNoChange: true
    }
  },
  computed: {
    ...mapGetters(['selectTreeNode'])
  },

  watch: {
    assignmentList: {
      handler: function(list) {
        this.assignmentList = list
        if (!list.length) return
        this.isSave = isChangeObjorArr(list, this.initAssignmentList, 'assignment')

        this.isDisabled = isChangeObjorArr(list, this.initAssignmentList)
        if (!this.isDisabled) {
          this.$emit('update-unsaved-tabs', 'add', 'license')
          this.$store.dispatch('pageChange/pageChanged', { func: null, params: [] })
        } else {
          this.$emit('update-unsaved-tabs', 'remove', 'license')
          this.$nextTick(() => {
            if (this.unsavedTabs.length === 0) {
              this.$store.dispatch('pageChange/resetPageChanged')
            }
          })
        }
      },
      deep: true
    }
  },
  // activated() {
  //   this.getAssignmentsTable()
  // },

  created() {
    this.getAssignmentsTable()
    const _this = this
    eventListener.on('domainSelected', function(active) {
      if (_this.selectTreeNode.level === 1) {
        _this.getAssignmentsTable()
      }
    })
  },

  beforeDestroy() {
    eventListener.remove('domainSelected')
  },

  deactivated() {
    if (this.$store.getters.isPageChanged) {
      const isLogin = getIsLogin() ? JSON.parse(getIsLogin()) : false
      if (!this.isSave && this.$route.path === '/projects' && isLogin) {
        this.$message.warning(this.$t('warningNoSave'))
      }
    }
  },

  methods: {
    getAssignmentsTable() {
      this.loading = true
      this.assignmentList = []
      const node = this.selectTreeNode.data
      getDomainLicense(node.name).then(data => {
        const license = data.license['license-statuses']['license-status']
        const assignmentLists = Array.isArray(license) ? license : [license]
        this.assignmentList = assignmentLists.map(item => {
          return {
            ...item,
            assignment: item.assignment === -1 ? this.$t('licenses.unlimited') : item.assignment,
            available: item.available === -1 ? this.$t('licenses.unlimited') : item.available
          }
        })
        this.initAssignmentList = JSON.parse(JSON.stringify(this.assignmentList))
        this.loading = false
      })
        .catch(_ => { this.loading = false })
    },
    saveChange() {
      // this.isShowSave = false
    },
    editSave() {
      const node = this.selectTreeNode.data
      this.submitting = true
      updateDomainLicense(node.name, this.assignmentList).then((res) => {
        this.submitting = false
        this.$message.success(this.$t('project.save_assignment'))
        this.getAssignmentsTable()
      }).catch((e) => {
        this.submitting = false
      }).finally(() => {
        this.isSave = true
      })
    },
    onCellChange(index, value) {
      this.assignmentList[index].assignment = value
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";
.project-bottom-btn{
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 64px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-top: 1px solid fade(@dim-gray,16%);
  background-color: @white;
  margin-top: 120px;
}

.domain{
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 70%;
  height: 100%;
  padding: 20px 20px 60px 20px;
  overflow-y: auto;
}

.domain-cont{
  margin-bottom: 30px;
  /deep/ .ant-table-body{
    border-right: 1px solid rgba(101, 102, 104, 0.15)
  }
}

.domain-content{
  width: 100%;
  background: #ffffff;
}

</style>
