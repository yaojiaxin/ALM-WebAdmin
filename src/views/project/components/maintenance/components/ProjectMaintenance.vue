<template>
  <mf-modal
    :visible="visible"
    width="802px"
    :confirm-loading="loading"
    :ok-text="okText"
    :cancel-text="$t('Close')"
    :next-disabled="nextDisabled"
    @ok="onOk"
    @cancel="onCancelModal"
  >
    <span slot="title">{{ title }}
      <mf-help-btn :help="helpLink" />
    </span>

    <mf-alert
      :message="message"
      style="margin: 0 -24px 24px -24px; width: auto"
      class="mf-margin-b-24"
      type="info"
    />

    <template v-if="type !== 5 && type !== 3">
      <div class="mf-subtitle mf-margin-b-8">{{ settings }}</div>
      <div class="mf-settings-panel">
        <span class="mf-title mf-margin-b-8">{{ mode }}</span>
        <a-checkbox :checked="isSilent" @change="(e) => isSilent = e.target.checked">
          {{ $t('project.run_in_silent_mode') }}
        </a-checkbox>
      </div>
    </template>

    <run-task
      ref="runTask"
      :projects="project"
      :params="{
        'is-silent': isSilent
      }"
      :run-task-immediately="false"
      :task="task"
      @running="onRunning"
      @error="onError"
      @finished="onFinished"
    />
  </mf-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import MfAlert from '@/components/MFAlert'
import RunTask from './RunTask'
import { deActiveProject, activeProject } from '@/api/project'
import { eventEmitter } from '@/views/project/event'
import { UPGRADE_PROJECT, VERIFY_PROJECT, REPAIR_PROJECT, CONVERT_TO_UNICODE, REALIGN_REPOSITORY } from 'config/help'
import { showTaskReminder } from '@/utils'

export default {
  components: { MfAlert, RunTask },
  inject: {
    projectTree: {
      default: ''
    }
  },
  data() {
    return {
      visible: false,

      loading: false,

      isSilent: false,
      isRunning: false,
      /*
      1: upgrade
      2: repair
      3: unicode
      4: realign
       */
      type: 1,

      title: this.$t('project.UpgradeProject'),
      okText: this.$t('project.UpgradeProject'),
      settings: this.$t('project.upgrade_settings'),
      mode: this.$t('project.upgrade_mode'),
      task: 'upgrade',
      message: this.$t('project.upgrade_settings_message'),
      helpLink: UPGRADE_PROJECT,

      // if true, show task reminder
      hasMaintained: false,
      isOriginActive: false
    }
  },

  computed: {
    ...mapGetters(['selectTreeNode']),
    project() {
      return this.selectTreeNode ? this.selectTreeNode.data : {}
    },

    nextDisabled() {
      return this.isRunning
    }
  },

  watch: {
    type: function(val) {
      if (val === 1) {
        this.title = this.$t('project.UpgradeProject')
        this.okText = this.$t('project.UpgradeProject')
        this.settings = this.$t('project.upgrade_settings')
        this.mode = this.$t('project.upgrade_mode')
        this.task = 'upgrade'
        this.message = this.$t('project.upgrade_settings_message')
        this.helpLink = UPGRADE_PROJECT
      } else if (val === 2) {
        this.title = this.$t('project.RepairProject')
        this.okText = this.$t('project.RepairProject')
        this.settings = this.$t('project.repair_settings')
        this.mode = this.$t('project.repair_mode')
        this.afterAction = this.$t('project.after_the_repair')
        this.selectProjects = this.$t('project.select_projects_to_repair')
        this.task = 'repair'
        this.message = this.$t('project.repair_settings_message')
        this.helpLink = REPAIR_PROJECT
      } else if (val === 3) {
        this.title = this.$t('project.convert_project_to_unicode')
        this.okText = this.$t('project.convert_to_unicode')
        this.settings = this.$t('project.convert_to_unicode_settings')
        this.message = this.$t('project.convert_to_unicode_message')
        this.selectProjects = this.$t('project.select_projects_to_unicode')
        this.helpLink = CONVERT_TO_UNICODE
        this.task = 'unicode'
      } else if (val === 4) {
        this.title = this.$t('project.realign_project')
        this.message = this.$t('project.realign_settings_message')
        this.mode = this.$t('project.realign_mode')
        this.okText = this.$t('project.realign_project')
        this.settings = this.$t('project.realign_settings')
        this.task = 'align'
        this.helpLink = REALIGN_REPOSITORY
        this.afterUpgrade = -1
      } else if (val === 5) {
        this.title = this.$t('project.VerifyProject')
        this.message = this.$t('project.verify_settings_message')
        this.okText = this.$t('project.VerifyProject')
        this.task = 'verify'
        this.helpLink = VERIFY_PROJECT
      }
    }
  },

  methods: {
    show(type) {
      this.type = type
      this.visible = true
      this.isOriginActive = this.selectTreeNode.data['is-active']
    },

    onRunning() {
      this.isRunning = true

      if (this.type === 3) {
        this.loading = true
      }
    },

    onError() {
      this.isRunning = false
      this.loading = false

      // if error, task will not be done and task status has no record
      this.hasMaintained = false
    },

    onFinished() {
      this.isRunning = false
      this.loading = false

      // Reset project status
      // project remain active status before and after verifying
      if (this.isOriginActive && this.type !== 5 && this.type !== 3) {
        activeProject({ domain: this.project['domain-name'], project: this.project.name }).then(data => {
          // this.$store.commit('project/SET_SELECTTREENODE', { ...this.selectTreeNode, data: { ...data.project, key: this.selectTreeNode.data.key }})
          // eventEmitter.emit('updateProjectNode', { ...data.project, key: this.selectTreeNode.data.key })
          eventEmitter.emit('projectSelected', 'details')
        })
      } else {
        eventEmitter.emit('projectSelected', 'details')
      }

      // convert to unicode refresh project
      // if (this.type === 3) {
      //   this.$store.commit('project/SET_SELECTTREENODE', { ...this.selectTreeNode, data: { ...this.selectTreeNode.data, 'is-unicode': true }})
      //   eventEmitter.emit('updateProjectNode', { ...this.selectTreeNode.data, 'is-unicode': true })
      // }
    },

    onOk() {
      this.hasMaintained = true

      const project = this.selectTreeNode.data

      // when it's to verify, the project remains active status before and after verifying
      if (project['is-active'] && this.type !== 5) {
        this.$mfConfirm({
          message: this.$t('project.deactiveProjectConfirm'),
          cancelText: this.$t('no'),
          confirmText: this.$t('OK'),
          onConfirm: () => {
            return deActiveProject({ domain: project['domain-name'], project: project.name }).then((data) => {
              // this.$store.commit('project/SET_SELECTTREENODE', { ...this.selectTreeNode, data: { ...data.project, key: this.selectTreeNode.data.key }})
              // eventEmitter.emit('updateProjectNode', { ...data.project })
              eventEmitter.emit('projectSelected', 'details')
              this.$refs.runTask.runTask()
            })
          }
        })
      } else {
        this.$refs.runTask.runTask()
      }
    },

    onCancelModal() {
      if (this.isRunning) {
        this.$mfConfirm({
          message: this.$t('project.close_window_confirm'),
          cancelText: this.$t('no'),
          confirmText: this.$t('OK'),
          onConfirm: () => {
            this.visible = false
            this.isSilent = false
            this.isOriginActive = false // if task do not finished, no need to reactivate
            this.doShowTaskReminder()
            this.$refs.runTask.onFinishTask()
            // if (this.projectTree.$refs.projectTree) {
            //   this.projectTree.$refs.projectTree.reload() // reload project tree
            // }
          }
        })
      } else {
        this.visible = false
        this.isSilent = false
        this.isOriginActive = false
        this.$refs.runTask.onClearLog()
        // this.doShowTaskReminder()
      }
    },

    doShowTaskReminder() {
      // if the project has been maintained, show task reminder
      if (this.hasMaintained === true) {
        showTaskReminder(this.$store, true)
        this.hasMaintained = false
      }
    }
  }
}
</script>

<style scoped>
.mf-settings-panel{
  display: flex;
  padding: 16px;
  border: 1px solid rgba(101, 102, 104, 0.16);
  box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
  margin-bottom: 24px;
}
.mf-title{
  font-family: RegularWeb;
  font-size: 16px;
  color: #323435;
  margin-right: 16px;
}
</style>
