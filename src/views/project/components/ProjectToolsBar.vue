<template>
  <!-- toolbar -->
  <div id="tool-bar" class="mf-tool-bar">

    <!--    <span class="title">{{ $t('project.PROJECTS') }}</span>-->

    <!-- refresh -->
    <icon-btn
      id="a-icon-refresh"
      style="width: 20px !important;"
      :is-disabled="projectType === 'LAB_PROJECT' && buttonDisabled"
      :icon-title="$t('refresh')"
      icon-style="icon-refresh"
      @onClick="onRefresh"
    />

    <a-divider
      v-if="checkPermission(['MY_CUSTOMER_CONTEXT_DOMAIN_CREATE','MY_CUSTOMER_CONTEXT_PROJECT_CREATE','MY_CUSTOMER_CONTEXT_PROJECT_CREATE'],
                            ['SWITCHED_CUSTOMER_CONTEXT_DOMAIN_CREATE','SWITCHED_CUSTOMER_CONTEXT_PROJECT_CREATE','SWITCHED_CUSTOMER_CONTEXT_PROJECT_CREATE']) && projectType !== 'LAB_PROJECT'"
      class="mf-vertical"
      type="vertical"
    />

    <!-- create domain icon button -->
    <create-domain
      v-if="checkPermission(['MY_CUSTOMER_CONTEXT_DOMAIN_CREATE'], ['SWITCHED_CUSTOMER_CONTEXT_DOMAIN_CREATE']) && projectType !== 'LAB_PROJECT'"
      @refresh="$emit('refresh')"
    />

    <!-- create project -->
    <create-project
      v-if="checkPermission(['MY_CUSTOMER_CONTEXT_PROJECT_CREATE'], ['SWITCHED_CUSTOMER_CONTEXT_PROJECT_CREATE']) && projectType !== 'LAB_PROJECT'"
      @refresh="$emit('refresh')"
    />

    <!-- create template -->
    <create-template
      v-if="checkPermission(['MY_CUSTOMER_CONTEXT_PROJECT_CREATE'],['SWITCHED_CUSTOMER_CONTEXT_PROJECT_CREATE']) && projectType !== 'LAB_PROJECT' && isNotDeniedFeature(['IMPORT_TEMPLATE_PROJECT'])"
    />

    <!-- delete -->
    <delete
      v-if="canShowDelete"
      @refresh="$emit('refresh')"
    />

    <a-divider v-if="isSiteAdmin() && nodeType === 'project' && projectType !== 'LAB_PROJECT'" class="mf-vertical" type="vertical" />

    <!-- project export -->
    <project-export v-if="isSiteAdmin() && nodeType === 'project' && projectType !== 'LAB_PROJECT'" :is-disabled="isCreateProcess || !isPingSucceed" />

    <!-- project import -->
    <Import v-if="isSiteAdmin() && projectType !== 'LAB_PROJECT' && isNotDeniedFeature(['IMPORT_PROJECT'])" @refresh="$emit('refresh')" />

    <a-divider
      v-if="isSiteAdmin() && nodeType === 'project' ||
        checkPermission(['MY_CUSTOMER_CONTEXT_PROJECT_ACTIVATION_STATUS_UPDATE'], ['SWITCHED_CUSTOMER_CONTEXT_PROJECT_ACTIVATION_STATUS_UPDATE'])"
      class="mf-vertical"
      type="vertical"
    />

    <!-- project restore -->
    <project-restore
      v-if="isSiteAdmin() && isNotDeniedFeature(['IMPORT_PROJECT'])"
      :is-disabled="projectType === 'LAB_PROJECT' && !buttonDisabled"
      :project-type="projectType"
      style="height: 28px"
      @refresh="$emit('refresh')"
    />

    <project-remove
      v-if="isSiteAdmin() && (nodeType === 'project' || projectType === 'LAB_PROJECT')"
      :is-disabled="isCreateProcess || buttonDisabled || !isPingSucceed || !isSameLabVersion"
      @refresh="$emit('refresh')"
    />

    <maintenance-project
      v-if="isSiteAdmin() && (nodeType === 'project' || projectType === 'LAB_PROJECT')"
      :is-disabled="isCreateProcess || buttonDisabled || !isPingSucceed || !isSameLabVersion"
      :show-recovery="showRecovery"
    />

    <maintenance-domain
      v-if="isSiteAdmin() && nodeType === 'domain' && projectType !== 'LAB_PROJECT'"
      :show-recovery="showRecovery"
    />

    <template v-if="nodeType === 'project' || projectType === 'LAB_PROJECT'">
      <project-toggle-status v-if="checkPermission(['MY_CUSTOMER_CONTEXT_PROJECT_ACTIVATION_STATUS_UPDATE'], ['SWITCHED_CUSTOMER_CONTEXT_PROJECT_ACTIVATION_STATUS_UPDATE'])" :is-disabled="isCreateProcess || buttonDisabled || !isSameVersion || !isPingSucceed || !isSameLabVersion" />

      <a-divider
        v-if="checkPermission(['MY_CUSTOMER_CONTEXT_PROJECT_VERSIONING_MANAGE'], ['SWITCHED_CUSTOMER_CONTEXT_PROJECT_VERSIONING_MANAGE'])||isSiteAdmin()"
        class="mf-vertical"
        type="vertical"
      />

      <icon-btn
        v-if="isSiteAdmin()"
        id="a-Icon-Project-Ping"
        class="mf-icon-margin-right-24"
        icon-style="icon-Project-Ping"
        :icon-title="$t('project.PingProject')"
        :is-disabled="isCreateProcess || buttonDisabled || !isPingSucceed"
        @onClick="onPingProject"
      >
        <span slot="btnName" class="btn-name">{{ $t('project.Ping') }}</span>
      </icon-btn>

      <project-toggle-version v-if="canShowToggleVersion" :is-disabled="isCreateProcess || !isSameVersion || !isPingSucceed || !isSameLabVersion" />

      <!-- <icon-btn icon-style="icon-RestoreProject" :icon-title="$t('project.projectrestore')" @onClick="$emit('restore')" /> -->

    </template>

  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import { PROJECT_STATUS } from '@/store/const'
import isProjectCanBeOperated from '../../project/components/mixins/isProjectCanBeOperated.js'
// import { validLetterBegin } from '@/utils/validate'
import CreateDomain from './ToolsComponents/CreateDomain'
import CreateProject from './ToolsComponents/createProject'
import CreateTemplate from './ToolsComponents/createTemplate'
import Import from './ToolsComponents/Import'
import ProjectRestore from './projectRestore/index'
import Delete from './delete/index'
import ProjectExport from './ProjectExport'
import ProjectRemove from './ProjectRemove'
import ProjectToggleStatus from './ProjectToggleStatus'
import ProjectToggleVersion from './ProjectToggleVersion'
import { getProjectsLimit, pingProject } from '@/api/project'
import { mapGetters } from 'vuex'
import { isSiteAdmin } from '@/utils/permission'
import MaintenanceProject from './maintenance/MaintenanceProject'
import MaintenanceDomain from './maintenance/MaintenanceDomain'
import { getParameterByParamNameRequestNoMessage } from '@/api/configuration'
import { errorMessage } from '@/utils'

export default {
  name: 'ProjectToolsBar',
  components: {
    IconBtn,
    CreateDomain,
    Import,
    Delete,
    ProjectRestore,
    ProjectExport,
    ProjectRemove,
    ProjectToggleStatus,
    ProjectToggleVersion,
    CreateProject,
    CreateTemplate,
    MaintenanceProject,
    MaintenanceDomain
  },
  props: {
    selectedUserList: {
      type: Array,
      default: function() {
        return []
      }
    },
    projectType: {
      type: String,
      default: null
    },
    buttonDisabled: {
      type: Boolean,
      default: false
    },
    isSameVersion: {
      type: Boolean,
      default: false
    },
    isPingSucceed: {
      type: Boolean,
      default: false
    },
    isSameLabVersion: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      PROJECT_STATUS,
      visible: false,
      assignProjectVisible: false,
      showRecovery: false
    }
  },
  computed: {
    ...mapGetters(['selectTreeNode']),
    nodeType() {
      if (this.selectTreeNode) {
        if (this.selectTreeNode.level === 3) {
          return 'project'
        } else if (this.selectTreeNode.level === 1) {
          return 'domain'
        }
      }
      return ''
    },
    isCreateProcess() {
      if (this.selectTreeNode && this.selectTreeNode.data && this.selectTreeNode.data.status) {
        const { status } = this.selectTreeNode.data
        return !isProjectCanBeOperated(status)
      }
      return false
    },
    isDisabled: function() {
      return this.selectedUserList.length === 0
    },
    canShowDelete() {
      if (this.checkPermission(['MY_CUSTOMER_CONTEXT_DOMAIN_DELETE'], ['SWITCHED_CUSTOMER_CONTEXT_DOMAIN_DELETE']) && this.nodeType === 'domain' && this.selectTreeNode && this.selectTreeNode.data.name !== 'DEFAULT') {
        return true
      }
      if (this.checkPermission(['MY_CUSTOMER_CONTEXT_PROJECT_DELETE'], ['SWITCHED_CUSTOMER_CONTEXT_PROJECT_DELETE']) && this.nodeType === 'project' && this.projectType !== 'LAB_PROJECT') {
        return true
      }
      return false
    },
    canShowToggleVersion() {
      const permission = this.checkPermission(['MY_CUSTOMER_CONTEXT_PROJECT_VERSIONING_MANAGE'], ['SWITCHED_CUSTOMER_CONTEXT_PROJECT_VERSIONING_MANAGE'])
      const projectType = this.projectType !== 'LAB_PROJECT'
      const deniedFeature = !(!this.isNotDeniedFeature(['VERSIONING']) && this.selectTreeNode && this.selectTreeNode.data && !this.selectTreeNode.data['has-vcs-db'])
      return permission && projectType && deniedFeature
    }
  },
  created() {
    if (isSiteAdmin()) {
      this.getRealignment()
    }
  },
  methods: {
    isSiteAdmin,
    async createProjectLimit(callback) {
      try {
        const res = await getProjectsLimit()
        if (res) {
          this.$mfConfirm({
            id: 'project_limit_warning',
            iconType: 'Warning',
            title: this.$t('project.warning'),
            message: res,
            isShowCancel: true,
            confirmText: this.$t('OK'),
            onConfirm: () => {
              callback()
            }
          })
        } else {
          callback()
        }
      } catch (error) {
        const res = error.response
        const resData = res.data
        if (res.status === 400) {
          this.$mfConfirm({
            id: 'project_exceed_warning',
            iconType: 'Error',
            title: this.$t('project.Error'),
            message: resData.QCRestException.Title,
            isShowCancel: false,
            confirmText: this.$t('OK')
          })
        }
      }
    },

    onPingProject() {
      const project = this.selectTreeNode.data

      pingProject({ domain: project['domain-name'], project: project.name }).then(() => {
        this.$message.success(this.$t('project.pingSuccess'))
      }).catch(() => {
        // this.$message.error(this.$t('project.pingError'))
      })
    },

    // Determine whether realignment can be displayed
    getRealignment() {
      getParameterByParamNameRequestNoMessage('SHOW_REALIGNMENT').then(data => {
        this.showRecovery = data['site-parameter'].value === 'Y'
      }).catch(error => {
        const resStatus = error.response.status
        const resData = error.response && error.response.data
        if (resData && resStatus !== 404 && resData.QCRestException) {
          errorMessage(resData.QCRestException.Title, resData.QCRestException.StackTrace)
        }
        this.showRecovery = false
      })
    },

    onRefresh() {
      if (this.$store.getters.isPageChanged) {
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('changePageConfirm'),
          cancelText: this.$t('Cancel'),
          confirmText: this.$t('OK'),
          onConfirm: () => {
            this.$store.dispatch('pageChange/resetPageChanged')
            this.$emit('refresh')
          }
        })
      } else {
        this.$emit('refresh')
      }
    }
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/variables.less';
.ant-modal-header{
  border-bottom: 1px solid red;
}

.mf-tool-bar{
  margin-top: 0;
  display: flex;
  align-items: center;
  height: 56px;
  background-color: @white;
  border-left:1px solid fade(#656668,16%);
  border-top:1px solid fade(#656668,16%);

  .title{
    font-size: 16px;
    font-family: MediumWeb;
  }
}
.mf-vertical{
  position: relative;
  margin-left: 0;
  margin-right: 24px;
  background: #979797;
  width: 1px;
  height: 20px;
  top: 1px;
}

.mf-vertical::after{
  content: " ";
  position: absolute;
  width: 1px;
  height: 20px;
  background-color: #979797;
}

.mf-tool-more{
  height: 32px;
  width: 97px;
  margin-right: 24px;
  margin-left: auto;
}

.mf-divider{
  background: @black;
  height: 9px;
  top: 0;
  margin: 0 9px;
}

.mf-btn-dropdown{
  display:flex;
  background-color: @white;
  border-radius: @border-radius;
  color: @black;
  padding: 0 16px 0 16px;
  right: 12px;
  align-items: center;
}

.mf-btn-dropdown:hover {
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
}

//mf-btn-dropdown 展开后的class
.ant-dropdown-open{
  background: fade(@black, 10%);
  border-color: @black;
  color: @black !important;
}

.a-icon-down{
  align-self:center;
}

.dropdown-menu-import {
  position: relative;
  .menu-import-content {
    display: none;
    width: 260px;
    position: absolute;
    top: 0;
    left: -260px;
    box-shadow: 1px 1px 2px 0 rgba(101, 102, 104, 0.3);
    background-color: #fff;
    .menu-import-item {
      margin: 0;
      padding: 5px 10px;
    }
  }
}

.dropdown-menu-import:hover .menu-import-content {
  display: block;
}

.dropdown-menu-import:hover .menu-import-content .menu-import-item:hover {
  background-color: #e6f7ff;
}

.mf-tool-bar /deep/ .tool-icon-btn{
  height: 28px !important;
  min-width: 20px !important;
  width: auto !important;
  padding: 0;
  margin-right: 24px;
  display: flex;
  align-items: center;

  .tool-icon-btn {
    margin-right: 0;
  }
}
.mf-tool-bar /deep/ .btn-name{
  display: block;
  height: 20px;
  margin-left: 10px;
  font-size: 16px ;
  font-family: MediumWeb,serif;
}
@media screen and (max-width: 1700px){
  .mf-tool-bar /deep/ .btn-name{
    display: none;
  }
}

</style>
