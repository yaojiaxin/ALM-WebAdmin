<template>
  <a-tabs v-model="tab" :default-active-key="activeTab" class="mf-project-tab" :class="{'mf-project-tab-lab': projectType === 'LAB_PROJECT','mf-project-tab-ie':isIE, 'mf-project-tab-lab-op': !checkPermission(['CUSTOMER_CONTEXT_SWITCH'])}" @change="callback">
    <a-tab-pane v-if="isSiteAdmin()" id="project_details" key="details" :tab="$t('Details')">
      <keep-alive>
        <project-detail-op v-if="activeTab === 'details'" ref="projectDetailOp" :active-tab="tab" :is-create-process="isCreateProcess" :project-type="projectType" :is-same-version="isSameVersion" />
      </keep-alive>
    </a-tab-pane>

    <a-tab-pane v-if="accessSaaSDetail" id="project_saas_details" key="details" :tab="$t('Details')">
      <keep-alive>
        <project-detail-saas v-if="activeTab === 'details'" ref="projectDetailOp" :is-create-process="isCreateProcess" :is-same-version="isSameVersion" />
      </keep-alive>
    </a-tab-pane>

    <a-tab-pane v-if="accessProjectUser" id="project_users" key="users" :tab="$t('Users')">
      <keep-alive>
        <projects-users v-if="activeTab === 'users'" ref="projectUsers" :active-tab="tab" :is-create-process="isCreateProcess" :project-type="projectType" :is-same-version="isSameVersion" />
      </keep-alive>
    </a-tab-pane>

    <a-tab-pane v-if="accessDataBase" id="project_database" key="database" :tab="$t('Database')">
      <keep-alive>
        <project-database v-if="activeTab === 'database'" :active-tab="tab" :project-type="projectType" />
      </keep-alive>
    </a-tab-pane>
    <a-tab-pane v-if="accessExtension && projectType !== 'LAB_PROJECT' && myCustomerIsRootCustomer()" id="project_extensions" key="extensions" :tab="$t('Extensions')">
      <keep-alive>
        <project-extensions v-if="activeTab === 'extensions'" :active-tab="tab" :is-create-process="isCreateProcess" :is-same-version="isSameVersion" />
      </keep-alive>
    </a-tab-pane>
    <a-tab-pane
      v-if="selectNodeType === 'template' && checkPermission(['MY_CUSTOMER_CONTEXT_TEMPLATE_LINKED_PROJECTS_LIST_VIEW'], ['SWITCHED_CUSTOMER_CONTEXT_TEMPLATE_LINKED_PROJECTS_LIST_VIEW'])"
      id="project_linkedprojects"
      key="linkedprojects"
      :tab="$t('linkedProject')"
    >
      <keep-alive>
        <project-linked v-if="activeTab === 'linkedprojects'" :active-tab="tab" :is-create-process="isCreateProcess" :is-same-version="isSameVersion" />
      </keep-alive>
    </a-tab-pane>
  </a-tabs>
</template>

<script>
import ProjectDetailOp from './ProjectDetail/ProjectDetailOP'
import ProjectsUsers from './ProjectsUsers/index'
import ProjectDatabase from './ProjectDatabse'
import ProjectExtensions from './ProjectExtensions'
import ProjectLinked from './linkedProject/ProjectLinked'
import { mapGetters } from 'vuex'
import ProjectDetailSaas from '@/views/project/components/ProjectDetail/ProjectDetailSaas'
import { SERVER_TYPE } from '@/store/const'
import isProjectCanBeOperated from '../../project/components/mixins/isProjectCanBeOperated.js'
import { isSiteAdmin, myCustomerIsRootCustomer } from '@/utils/permission'
import { eventListener } from '../event'
import { HELP_ON_THIS_PAGE } from 'config/help'

export default {
  components: { ProjectDetailOp, ProjectsUsers, ProjectDatabase, ProjectExtensions, ProjectLinked, ProjectDetailSaas },
  props: {
    activeTab: {
      type: String,
      default: 'details'
    },

    projectType: {
      type: String,
      default: null
    },

    isSameVersion: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      tab: this.activeTab,
      isIE: false
    }
  },
  computed: {
    ...mapGetters(['selectTreeNode', 'serverType']),

    selectNodeType() {
      return this.selectTreeNode && this.selectTreeNode.data['is-template'] ? 'template' : 'project'
    },

    isSaas() {
      return this.serverType === SERVER_TYPE.Saas
    },

    isCreateProcess() {
      if (this.selectTreeNode && this.selectTreeNode.data && this.selectTreeNode.data.status) {
        const { status } = this.selectTreeNode.data
        return !isProjectCanBeOperated(status)
      }
      return false
    },

    defaultTab() {
      if (isSiteAdmin() || this.accessSaaSDetail) {
        return 'details'
      } else if (this.accessProjectUser) {
        return 'users'
      } else if (this.accessDataBase) {
        return 'database'
      } else if (this.accessExtension) {
        return 'extensions'
      } else if (this.accessLinked) {
        return 'linkedprojects'
      } else {
        return 'details'
      }
    },

    accessSaaSDetail() {
      return !isSiteAdmin() && this.checkPermission(['MY_CUSTOMER_CONTEXT_PROJECT_DETAILS_VIEW'], ['SWITCHED_CUSTOMER_CONTEXT_PROJECT_DETAILS_VIEW'])
    },

    accessProjectUser() {
      return this.checkPermission(['MY_CUSTOMER_CONTEXT_USER_PROJECTS_MEMBERSHIPS_VIEW', 'MY_CUSTOMER_CONTEXT_USER_PROJECTS_MEMBERSHIPS_VIEW'])
    },

    accessDataBase() {
      return this.checkPermission(['DB_QUERY_ACCESS'])
    },

    accessExtension() {
      return this.checkPermission(['MY_CUSTOMER_CONTEXT_PROJECT_PC_EXTENSION_DETAILS_VIEW'], ['SWITCHED_CUSTOMER_CONTEXT_PROJECT_PC_EXTENSION_DETAILS_VIEW'])
    },

    accessLinked() {
      return this.checkPermission(['MY_CUSTOMER_CONTEXT_TEMPLATE_LINKED_PROJECTS_LIST_VIEW'], ['SWITCHED_CUSTOMER_CONTEXT_TEMPLATE_LINKED_PROJECTS_LIST_VIEW'])
    }
  },

  watch: {
    activeTab: function(val) {
      this.tab = val
    }
  },

  created() {
    this.$store.commit('helpPath/SET_HELPLINK', this.$route.path === '/projects' ? HELP_ON_THIS_PAGE.projects.project.details : HELP_ON_THIS_PAGE.lab.details)
    this.tab = this.defaultTab
    this.$emit('update:activeTab', this.defaultTab)
    var userAgent = navigator.userAgent
    const isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1
    const isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1
    var isEdge = userAgent.indexOf('Edge') > -1
    this.isIE = (isIE || isIE11) && !isEdge
  },

  beforeDestroy() {
    // this.$emit('update:activeTab', 'details')
    eventListener.remove('projectSelected')
  },

  methods: {
    isSiteAdmin,
    myCustomerIsRootCustomer,
    callback(key) {
      if (['details', 'users', 'database', 'extensions', 'linkedprojects'].includes(key)) { this.$store.commit('helpPath/SET_HELPLINK', this.$route.path === '/projects' ? HELP_ON_THIS_PAGE.projects.project[key] : HELP_ON_THIS_PAGE.lab[key]) }
      this.$emit('update:activeTab', key)
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";

</style>
<style lang="less" scoped>
  .mf-project-tab {
    height: 100%;
  }
  .mf-project-tab-lab /deep/ .ant-tabs-content {
    height: calc(100vh - 265px - 56px);
    flex: 0;
  }
  .mf-project-tab-lab.mf-project-tab-lab-op /deep/ .ant-tabs-content {
    height: calc(100vh - 265px - 61px + 45px);
  }
  .mf-project-tab-ie /deep/ .ant-tabs-top-content {
    position: absolute;
  }
</style>

