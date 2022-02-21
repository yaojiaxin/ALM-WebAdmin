<template>
  <div class="mf-project-wrapper mf-box-shadow">
    <a-spin :spinning="loading || isPinging" class="project-info">
      <project-tools-bar
        :project-type="'LAB_PROJECT'"
        :button-disabled="!labManagementInfo"
        :is-same-version="isSameVersion"
        :is-ping-succeed="isPingSucceed"
        class="mf-project-tools"
        @refresh="getLabProject"
      />
      <div class="mf-project-panel mf-panel-height">
        <div v-if="!loading && !isPinging && !labManagementInfo" class="mf-project-nodata">
          <a-empty>
            <img slot="image" alt src="../../assets/no-data.png">
            <span slot="description" class="content">{{ $t('labManagement.nodata') }}</span>
          </a-empty>
        </div>

        <div v-if="!loading && !isPinging && !isPingSucceed && labManagementInfo" class="mf-project-nodata">
          <a-empty>
            <img slot="image" alt src="../../assets/project-connection-failed.png">
            <span slot="description" class="content">{{ $t('project.project_connection_failed') }}</span>
          </a-empty>
        </div>

        <div v-if="!loading && !isPinging && isPingSucceed && labManagementInfo" class="mf-project-content">
          <div class="mf-project-title">
            <span class="name">{{ labManagementInfo ? labManagementInfo.name : '' }}</span>
            <span v-if="isActive" class="status">{{ $t('project.active') }}</span>
            <span v-else class="status deactive">{{ $t('project.inactive') }}</span>
          </div>
          <!-- project infos(details, db, users) -->
          <keep-alive>
            <project-info
              ref="projectInfo"
              :active-tab.sync="activeTab"
              :type="selectNodeType"
              :is-same-version="isSameVersion"
              :project-type="'LAB_PROJECT'"
            />
          </keep-alive>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import ProjectToolsBar from '../project/components/ProjectToolsBar'
import ProjectInfo from '../project/components/ProjectInfo'
import { mapGetters } from 'vuex'
import { getProjectsInDomains, pingProject } from '@/api/project'
import { HELP_ON_THIS_PAGE } from 'config/help'
import isProjectCanBeOperated from '../project/components/mixins/isProjectCanBeOperated.js'
import { eventListener } from '../project/event'

export default {
  components: {
    ProjectToolsBar,
    ProjectInfo
  },

  data() {
    return {
      activeTab: 'details',
      loading: false,
      isPinging: false,
      isPingSucceed: false,
      isSameVersion: false,
      labManagementInfo: false
    }
  },

  computed: {
    ...mapGetters(['selectTreeNode', 'serverType', 'siteVersion']),
    isActive: function() {
      return this.selectNode['is-active']
    },

    selectNode() {
      return this.selectTreeNode ? this.selectTreeNode.data : {}
    },

    selectNodeType() {
      return 'project'
    }
  },

  created() {
    this.getLabProject()
    const _this = this
    eventListener.on('updateLab', function(data) {
      _this.$store.commit('project/SET_SELECTTREENODE', { data: data })
    })
    this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.lab.details)
  },

  beforeDestroy() {
    eventListener.remove('updateLab')
    this.unloadEvent()
    this.$store.commit('project/SET_SELECTDOMAIN', null)
  },

  methods: {
    getLabProject() {
      this.loading = true
      this.labManagementInfo = false
      this.$store.commit('project/SET_LABVERSION', '')
      getProjectsInDomains('DEFAULT').then(data => {
        if (data.projects && data.projects.project) {
          let list = data.projects.project
          list = Array.isArray(list) ? list : [list]
          list = list.filter(i => i['project-type'] === 'LabManagement')
          if (list && list.length > 0) {
            this.labManagementInfo = list[0]
            this.$store.commit('project/SET_LABVERSION', list[0].version)
            this.onPingProject(list[0])
          }
        }
      }).finally(() => {
        this.loading = false
      })
    },
    onPingProject(data) {
      this.isPinging = true
      this.isPingSucceed = false
      this.isSameVersion = false
      pingProject({ domain: data['domain-name'], project: data.name }).then(() => {
        this.isPingSucceed = true
        this.$store.commit('project/SET_SELECTTREENODE', { data: data })
        if (isProjectCanBeOperated(data.status) && data.version !== this.siteVersion) { // if the status is not normal, there is no need to compare the versions
          this.$message.info(this.$t('project.upgradeProjectInfo', { wrongVersion: data.version, rightVersion: this.siteVersion }))
        } else {
          this.isSameVersion = true
        }
      }).finally(() => {
        this.isPinging = false
      })
    },
    unloadEvent() {
      this.$store.commit('project/SET_SELECTTREENODE', null)
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
}
.mf-project-panel{
  display: flex;
  flex-direction: row;
  width: 100%;
  border-left: 1px solid fade(@dim-gray,16%);
  background: @white;
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

.mf-project-title {
  display: flex;
  align-items: center;
  padding: 0 25px;
  margin: 12px 0 9px;
  height: 40px;

  .name {
    font-size: 18px;
    line-height: 40px;
    font-weight: 600;
  }

  .status {
    position: relative;
    font-size: 14px;
    color: #fff;
    line-height: 16px;
    height: 18px;
    background: #1AAC60;
    border-radius: 12px;
    padding: 0 12px 0 16px;
    margin-left: 12px;
  }

  .status.deactive {
    background: #E5004C;
  }

  .status::before {
    position: absolute;
    left: 7px;
    top: 7px;
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 3px;
    background: #fff;
  }
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

  .mf-project-nodata {
    display: flex;
    width: 100%;
    height: 100%;
    border-bottom: 1px solid fade(@dim-gray,16%);

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
