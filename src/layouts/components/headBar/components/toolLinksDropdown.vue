<template>
  <div>
    <a-dropdown
      :trigger="['click']"
      placement="bottomRight"
      class="mf-header-userSetting"
    >
      <a id="a-tool" @click="e => e.preventDefault()">
        <a-tooltip :title="$t('Tools')">
          <span class="icon iconfont icon-tools" />
        </a-tooltip>
        <a-icon type="down" :style="{'padding-left': '8px'}" />
      </a>
      <a-menu slot="overlay">
        <a-menu-item
          v-for="(item,index) in toolLinks"
          :key="index"
        >
          <a v-if="item['isLink']" :id="`a-link-${index}`" :href="item['link']" target="_blank">{{ item['name'] }}</a>
          <a v-if="!item['isLink']" :id="`a-link-${index}`" target="_blank" @click="()=>openToolModal(item['link'])">{{ item['name'] }}</a>
        </a-menu-item>
        <a-menu-item v-if="isNotDeniedFeature(['QUALITY_PROJECT_MANAGEMENT'])">
          <a id="a-link-7" target="_blank" @click="()=>openToolModal('Project_Planning_and_Tracking')">{{ $t('helpLinks.Project_Planning_and_Tracking') }}</a>
        </a-menu-item>
      </a-menu>
    </a-dropdown>

    <licenses-overdue-modal ref="licensesOverdue" />
    <QualityInsightModal ref="qualityInsightModalRef" />
    <projectUpdatePrioritizationModal ref="PrioritizationRef" />
    <advisorModal ref="advisorRef" />
    <collectInformationModal ref="collectInformationRef" :select-tree-node="selectTreeNode" />
    <ProjectPlanningAndTrackingModal ref="ProjectPlanningAndTrackingModalRef" />
  </div>

</template>

<script>
import {
  ALM_Robot,
  SSO_Configuration
} from 'config/help'
import projectUpdatePrioritizationModal from '@/layouts/components/headBar/components/projectUpdatePrioritizationModal'
import QualityInsightModal from '@/layouts/components/headBar/components/QualityInsight'
import advisorModal from '@/layouts/components/headBar/components/advisorModal'
import collectInformationModal from '@/layouts/components/headBar/components/collectInformationModal'
import ProjectPlanningAndTrackingModal from '@/layouts/components/headBar/components/QPM'
import licensesOverdueModal from '@/layouts/components/headBar/components/licensesOverdueModal'
import { testTypeService } from '@/api/tools'
import { mapGetters } from 'vuex'

export default {
  name: 'ToolLinksDropdown',
  components: {
    projectUpdatePrioritizationModal,
    QualityInsightModal,
    advisorModal,
    collectInformationModal,
    ProjectPlanningAndTrackingModal,
    licensesOverdueModal
  },
  data() {
    return {
      toolLinks: [
        { name: this.$t('helpLinks.Collect_Information'), link: 'Collect_Information' },
        { name: this.$t('helpLinks.Set_Project_Update_Priorities'), link: 'Set_Project_Update_Priorities' },
        { name: this.$t('helpLinks.Update_Test_Types'), link: 'Update_Test_Types' },
        { name: this.$t('helpLinks.ALM_Advisor'), link: 'ALM_Advisor' },
        { name: this.$t('helpLinks.ALM_Robot'), isLink: true, link: ALM_Robot },
        { name: this.$t('helpLinks.Quality_Insight'), link: 'Quality_Insight' },
        { name: this.$t('helpLinks.SSO_Configuration'), isLink: true, link: SSO_Configuration }
        // { name: this.$t('helpLinks.QC_Sense'), link: 'QC_Sense' },
        // { name: this.$t('helpLinks.Project_Planning_and_Tracking'), link: 'Project_Planning_and_Tracking' }
      ]
    }
  },
  computed: {
    ...mapGetters(['selectTreeNode'])

  },
  created() {
    this.toolModals = {
      Collect_Information: () => this.$refs.collectInformationRef.onShow(),
      Update_Test_Types: this.onUpdateTestTypes,
      Quality_Insight: () => this.$refs.qualityInsightModalRef.show(),
      Set_Project_Update_Priorities: () => { this.$refs.PrioritizationRef.onShow() },
      ALM_Advisor: () => { this.$refs.advisorRef.onShow() },
      Project_Planning_and_Tracking: () => { this.$refs.ProjectPlanningAndTrackingModalRef.show() }
    }
  },
  methods: {
    openToolModal(link) {
      this.toolModals[link] && this.toolModals[link]()
    },
    onUpdateTestTypes() {
      this.$mfConfirm({
        message: this.$t('tools.onUpdateTestTypes'),
        confirmText: this.$t('OK'),
        onConfirm: async() => {
          await testTypeService().then(res => {
            this.$message.success(res['custom-test-type']['update-result'])
          })
        }
      })
    }
  }

}
</script>

<style scoped lang="less">
.mf-header-userSetting{
  display: flex;
  align-items: center;
  font-size: 16px;
  color: white;
}
</style>
