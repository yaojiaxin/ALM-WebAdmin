<template>
  <a-spin :spinning="isPinging || loadDomain" class="mf-project-wrapper mf-box-shadow">

    <project-tools-bar
      class="mf-project-tools"
      :is-same-version="isSameVersion"
      :is-ping-succeed="isPingSucceed"
      :is-same-lab-version="isSameLabVersion"
      @refresh="onRefreshTree"
      @result="onGetResultList"
    />

    <div class="mf-project-panel mf-panel-height">
      <div class="mf-project-tree-panel">
        <span class="search-input none-select">
          <a-input-search
            id="pro-search-project"
            ref="searchProjectRef"
            v-model="search"
            :placeholder="$t('inputSearchPlaceholder')"
            @search="onSearchTreeNode"
          />
        </span>
        <div ref="scrollbar" class="mf-tree-wrapper">
          <project-tree ref="projectTree" @select-project="selectProject" />
        </div>
      </div>

      <div class="mf-project-content">
        <keep-alive>
          <!-- When the type is Domain or Folder -->
          <div v-if="selectNodeType !== 'project' && selectNodeType !== 'template'" class="mf-domain-detail">

            <!-- op sa show -->
            <domain-info v-if="isShowDomainInfo" :active-tab.sync="activeDomainTab" @load="load" />

            <div
              v-if="(selectNodeType === 'Projects' || selectNodeType === 'Templates') && isSaas"
              class="mf-subtitle mf-margin-l-24"
              style="margin-top: 24px"
            >
              {{ $t('project.selectTips') }}
            </div>
          </div>
        </keep-alive>

        <div class="project-info">
          <div v-if="!isPinging && !isPingSucceed && accessProjectDetail" class="project-connection-failed">
            <a-empty>
              <img slot="image" alt src="../../assets/project-connection-failed.png">
              <span slot="description" class="content">{{ $t('project.project_connection_failed') }}</span>
            </a-empty>
          </div>
          <template v-if="!isPinging && isPingSucceed && accessProjectDetail">
            <!-- project or template infos(details, db, extension, users) -->
            <keep-alive>
              <project-info
                v-if="selectNodeType === 'project' || selectNodeType === 'template'"
                ref="projectInfo"
                :active-tab.sync="activeTab"
                :type="selectNodeType"
                :is-same-version="isSameVersion"
              />
            </keep-alive>
          </template>
        </div>

      </div>

      <!-- <project-restore ref="projectRestore" /> -->
      <modal-result :result-list="resultList" :closable="false" :visible="resultVisible" @ok="onHiddenResult" />

    </div>

  </a-spin>
</template>

<script>
import ProjectToolsBar from '@/views/project/components/ProjectToolsBar'
import ProjectInfo from './components/ProjectInfo'
import ModalResult from '@/components/ModalResult/index'
import { mapGetters } from 'vuex'
import { eventListener, eventEmitter } from './event'
import { SERVER_TYPE } from '@/store/const'
import isProjectCanBeOperated from '../project/components/mixins/isProjectCanBeOperated.js'
import ProjectTree from './components/ProjectTree'
import DomainInfo from './components/DomainInfo'
import { HELP_ON_THIS_PAGE } from 'config/help'
import { pingProject, getExtensionsInProject, getLabProject } from '@/api/project'
import { getSiteVersion } from '@/api/application'
import { isSiteAdmin } from '@/utils/permission'

export default {
  components: {
    ProjectToolsBar,
    ProjectTree,
    ProjectInfo,
    ModalResult,
    DomainInfo
  },
  provide() {
    return {
      projectTree: this
    }
  },

  data() {
    return {
      SERVER_TYPE,
      search: '',

      lastSearch: '',

      submitingDomain: false,

      activeTab: 'details',

      activeDomainTab: undefined,

      resultVisible: false,

      resultList: [],

      isPinging: false,

      isPingSucceed: false,

      isSameVersion: false,

      isSameLabVersion: false,

      loadDomain: false
    }
  },

  computed: {
    ...mapGetters(['selectTreeNode', 'serverType', 'siteVersion', 'labVersion']),

    selectNodeType() {
      if (this.selectTreeNode && this.selectTreeNode.data) {
        if (this.selectTreeNode.level === 1) {
          return 'domain'
        } else if (this.selectTreeNode.level === 2) {
          return this.selectTreeNode.data.type
        } else {
          return this.selectTreeNode.data['is-template'] ? 'template' : 'project'
        }
      } else {
        return ''
      }
    },

    isSaas() {
      return this.serverType === SERVER_TYPE.Saas
    },

    isOp() {
      return this.serverType === SERVER_TYPE.OnPremise
    },

    isShowDomainInfo() {
      if (this.isOp) {
        return this.selectNodeType === 'domain' || (this.selectNodeType === 'Projects' || this.selectNodeType === 'Templates')
      } else {
        return this.selectNodeType === 'domain'
      }
    },

    accessProjectDetail() {
      return isSiteAdmin() || (!isSiteAdmin() && this.checkPermission(['MY_CUSTOMER_CONTEXT_PROJECT_DETAILS_VIEW'], ['SWITCHED_CUSTOMER_CONTEXT_PROJECT_DETAILS_VIEW']))
    }
  },

  watch: {
    selectTreeNode: function(val) {
      if (val) {
        if (this.selectNodeType === 'domain' || (this.selectNodeType === 'Projects' || this.selectNodeType === 'Templates')) {
          this.$nextTick(function() {
            eventEmitter.emit('domainSelected', this.activeDomainTab)
          })
        } else if (this.selectNodeType === 'project' || this.selectNodeType === 'template') {
          if (this.selectNodeType === 'project' && this.activeTab === 'linkedprojects') {
            this.activeTab = 'details'
          }
          eventEmitter.emit('projectSelected', this.activeTab)
        }
      }
    },
    selectNodeType: function(val) {
      if (this.isSaas) {
        val === 'Projects' && this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.projects.project.project)
        val === 'Templates' && this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.projects.project.template)
      }
    }
  },

  beforeDestroy() {
    this.unloadEvent()
    this.$store.commit('project/SET_SELECTDOMAIN', null)
    // this.activeDomainTab = undefined
  },

  created() {
    this.getSiteVersion()
    this.getLabVersion()
  },

  methods: {
    unloadEvent() {
      this.$store.commit('project/SET_SELECTTREENODE', null)
      eventListener.remove('projectSelected')
      eventListener.remove('domainSelected')
    },
    onSearchTreeNode(val) {
      if (this.lastSearch !== val) {
        this.$refs.projectTree.resetSearchNum()
      }
      this.$refs.projectTree.setSearchStr(val)
      this.lastSearch = val
    },

    showTest() {
      this.$refs.transfer.onShow()
    },

    // refresh project tree
    onRefreshTree(isReload) {
      const Tree = this.$refs.projectTree
      Tree.resetSearchNum()
      Tree.addedNode = null
      const { selectTreeNode } = this
      if (selectTreeNode && selectTreeNode.level === 3) {
        const parentData = selectTreeNode.parent.data
        const type = parentData.key.indexOf('templates') > -1 ? 'template' : 'project'
        eventEmitter.emit('setTreeSelect', {
          data: selectTreeNode,
          type
        })
      } else if (selectTreeNode && selectTreeNode.level === 2) {
        const type = selectTreeNode.data.key.indexOf('templates') > -1 ? 'template' : 'project'
        eventEmitter.emit('setTreeSelect', {
          data: selectTreeNode,
          type
        })
      } else if (selectTreeNode && selectTreeNode.level === 1) {
        eventEmitter.emit('setTreeSelect', {
          data: selectTreeNode,
          type: 'domain'
        })
      } else {
        Tree.reload(isReload)
      }
    },
    onGetResultList(list) {
      this.resultList = list
      this.resultVisible = true
    },

    onHiddenResult() {
      this.resultVisible = false
    },

    selectProject(data) {
      if (this.accessProjectDetail) {
        this.isPinging = true
        this.isPingSucceed = false
        this.isSameVersion = false
        pingProject({ domain: data['domain-name'], project: data.name }).then(() => {
          this.isPingSucceed = true
          if (isProjectCanBeOperated(data.status) && data.version !== this.siteVersion) { // if the status is not normal, there is no need to compare the versions
            this.$message.info(this.$t('project.upgradeProjectInfo', { wrongVersion: data.version, rightVersion: this.siteVersion }))
          } else {
            this.isSameVersion = true
          }
          this.checkLabVersion(data)
        }).catch(() => {
        }).finally(() => {
          this.isPinging = false
        })
      }
    },

    getSiteVersion() {
      getSiteVersion().then(res => {
        const siteVersion = `${res['site-version']['major-version']}.${res['site-version']['minor-version'] < 10 ? res['site-version']['minor-version'] + '0' : res['site-version']['minor-version']}`
        this.$store.commit('project/SET_SITEVERSION', siteVersion)
      })
    },

    getLabVersion() {
      getLabProject().then(data => {
        if (data.projects && data.projects.project) {
          let list = data.projects.project
          list = Array.isArray(list) ? list : [list]
          if (list.find(i => i['project-type'] === 'LabManagement')) {
            const labVersion = list.find(i => i['project-type'] === 'LabManagement').version
            this.$store.commit('project/SET_LABVERSION', labVersion)
          }
        }
      })
    },

    checkLabVersion(project) {
      this.isSameLabVersion = true
      if (isSiteAdmin()) {
        getExtensionsInProject({
          domain: project['domain-name'],
          project: project.name
        }).then(data => {
          if (data.extensions) {
            const projectExtensions = data.extensions && data.extensions.extension
            const extensionList = Array.isArray(projectExtensions) ? projectExtensions : [projectExtensions]
            const labExtension = extensionList.find(item => item.name === 'PCPROJECT')
            if (isProjectCanBeOperated(project.status) && labExtension && this.labVersion !== labExtension.version) { // if the status is not normal, there is no need to compare the versions
              this.$message.info(this.$t('project.upgradeLabInfo'))
              this.isSameLabVersion = false
            }
          }
        }).catch(() => {
        })
      }
    },

    load(status) {
      this.loadDomain = status
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.mf-project-tools{
  margin-top: 0;
  border: 1px solid fade(@dim-gray,16%);
  padding: 0 24px;
}
.mf-project-wrapper{
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
  overflow: hidden;

  /deep/ .ant-spin {
    max-height: unset;
  }
}

.mf-project-panel{
  display: flex;
  flex-direction: row;
  // height: calc(100vh - 160px);
}
// .main-has-customer .mf-project-panel{
//   height: calc(100vh - 203px);
// }

.mf-project-tree-panel{
  width: 285px;
  background-color: @white;
  border: 1px solid fade(@dim-gray,16%);
  border-top: none;
  display: flex;
  flex-direction: column;

  .search-input{
    padding: 24px 24px 20px 20px;
  }

  .mf-tree-wrapper{
    width: 100%;
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0%;
    margin-right: -24px;
    overflow-y: auto;
  }
}

.mf-project-content{
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
  position: relative;
  background-color: @white;
  border-right:1px solid fade(@dim-gray,16%);
  border-bottom: 1px solid fade(@dim-gray,16%);
  width: 100%;
  overflow: hidden;
}

.mf-domain-detail{
  height: 100%;
  overflow-y: auto;
}

.project-info {
  width: 100%;
  height: 100%;

  /deep/ .ant-spin {
    max-height: 100%;
  }
  /deep/ .ant-spin-container {
    height: 100%;
  }

  .project-connection-failed {
    display: flex;
    width: 100%;
    height: 100%;

    .ant-empty {
      margin: auto;
      padding: 10px 0 100px;

      .content {
        font-size: 16px;
        font-weight: 500;
        color: #747577;
        line-height: 22px;
      }

      /deep/ .ant-empty-image {
        height: 263px;
      }
    }
  }
}
</style>
