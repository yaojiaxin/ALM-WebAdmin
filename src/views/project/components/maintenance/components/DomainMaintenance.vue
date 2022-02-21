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

    <div v-if="step === 1">
      <template v-if="type !== 3 && type !== 5">
        <div class="mf-subtitle mf-margin-b-8">{{ settings }}</div>

        <div class="mf-settings-panel">
          <div class="mf-settings-item">
            <div class="mf-title mf-margin-b-8">{{ mode }}</div>
            <a-checkbox :checked="isSilent" @change="(e) => isSilent = e.target.checked">
              {{ $t('project.run_in_silent_mode') }}
            </a-checkbox>
            <a-checkbox :checked="isContinue" style="margin: 0" @change="(e) => isContinue = e.target.checked">
              {{ $t('project.continue_to_next_project_if_upgrade_failed') }}
            </a-checkbox>
          </div>

          <div class="mf-settings-item">
            <div class="mf-title">{{ afterAction }}</div>

            <a-radio-group v-model="afterUpgrade">
              <a-radio :value="1">
                {{ $t('project.leave_all_projects_deactivated') }}
              </a-radio>
              <a-radio v-if="type !== 4" :value="2">
                {{ $t('project.activate_only_currently_active_projects') }}
              </a-radio>
              <a-radio :value="3">
                {{ $t('project.activate_all_projects') }}
              </a-radio>
            </a-radio-group>
          </div>
        </div>
      </template>

      <div class="mf-subtitle mf-margin-b-8">{{ selectProjects }}</div>
      <project-table ref="projectTable" :row-selection.sync="rowSelection" :sql="type === 3" />
    </div>

    <div v-else>
      <run-task
        ref="runTask"
        :projects="rowSelection"
        :params="{
          'is-silent': isSilent,
          isContinue: isContinue
        }"
        :task="task"
        @running="onRunning"
        @error="onError"
        @finished="onFinished"
      />
    </div>
  </mf-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { deActiveProject, activeProject } from '@/api/project'
import MfAlert from '@/components/MFAlert'
import RunTask from './RunTask'
import ProjectTable from './ProjectTable'
import { eventEmitter } from '../../../event'
import { UPGRADE_PROJECT, VERIFY_PROJECT, REPAIR_PROJECT, CONVERT_TO_UNICODE, REALIGN_REPOSITORY } from 'config/help'

export default {
  components: { MfAlert, RunTask, ProjectTable },

  data() {
    return {
      visible: false,
      loading: false,

      step: 1,

      afterUpgrade: 2,

      isContinue: true,

      isSilent: false,

      isRunning: false,

      rowSelection: [],

      copyRow: [],

      /*
      1: upgrade
      2: repair
      3: unicode
      4: realign
       */
      type: 1,

      title: this.$t('project.upgrade_domain'),
      okText: this.$t('project.upgrade_projects'),
      settings: this.$t('project.upgrade_settings'),
      mode: this.$t('project.upgrade_mode'),
      afterAction: this.$t('project.after_the_upgrade'),
      selectProjects: this.$t('project.select_projects_to_upgrade'),
      task: 'upgrade',
      message: this.$t('project.upgrade_settings_message'),
      helpLink: UPGRADE_PROJECT
    }
  },
  computed: {
    ...mapGetters(['selectTreeNode']),

    nextDisabled() {
      return (this.step === 1 && this.rowSelection.length === 0) || (this.step === 2 && this.isRunning)
    }
  },

  watch: {
    rowSelection: function(val) {
      this.copyRow = JSON.parse(JSON.stringify(val))
    },

    type: function(val) {
      switch (val) {
        case 1:
          this.title = this.$t('project.upgrade_domain')
          this.okText = this.$t('project.upgrade_projects')
          this.settings = this.$t('project.upgrade_settings')
          this.mode = this.$t('project.upgrade_mode')
          this.afterAction = this.$t('project.after_the_upgrade')
          this.selectProjects = this.$t('project.select_projects_to_upgrade')
          this.task = 'upgrade'
          this.message = this.$t('project.upgrade_settings_message')
          this.helpLink = UPGRADE_PROJECT
          break
        case 2:
          this.title = this.$t('project.repair_domain')
          this.okText = this.$t('project.repair_projects')
          this.settings = this.$t('project.repair_settings')
          this.mode = this.$t('project.repair_mode')
          this.afterAction = this.$t('project.after_the_repair')
          this.selectProjects = this.$t('project.select_projects_to_repair')
          this.task = 'repair'
          this.message = this.$t('project.repair_settings_message')
          this.helpLink = REPAIR_PROJECT
          break
        case 3:
          this.title = this.$t('project.convert_to_unicode_domain')
          this.okText = this.$t('project.convert_to_unicode')
          this.settings = this.$t('project.convert_to_unicode_settings')
          this.message = this.$t('project.convert_to_unicode_message')
          this.selectProjects = this.$t('project.select_projects_to_unicode')
          this.task = 'unicode'
          this.helpLink = CONVERT_TO_UNICODE
          break
        case 4:
          this.title = this.$t('project.realign_domain')
          this.message = this.$t('project.realign_settings_message')
          this.mode = this.$t('project.realign_mode')
          this.afterAction = this.$t('project.after_the_realign')
          this.selectProjects = this.$t('project.select_projects_to_realign')
          this.okText = this.$t('project.realign_repository')
          this.settings = this.$t('project.realign_settings')
          this.task = 'align'
          this.afterUpgrade = -1
          this.helpLink = REALIGN_REPOSITORY
          break
        case 5:
          this.title = this.$t('project.verify_domain')
          this.okText = this.$t('project.verify_projects')
          this.message = this.$t('project.verify_settings_message')
          this.selectProjects = this.$t('project.select_projects_to_verify')
          this.task = 'verify'
          this.helpLink = VERIFY_PROJECT
          break
      }
    }
  },

  methods: {
    show(type) { // 1: upgrade 2: repair
      this.type = type

      this.visible = true
      this.$nextTick(function() {
        this.$refs.projectTable.getProjects()
      })
    },

    onOk() {
      const activedProjects = this.rowSelection.filter(i => i['is-active'])
      const data = this.selectTreeNode.data

      // can not upgrade active project
      if (this.step === 1) {
        // when it's to verify, the project remains active status before and after verifying
        if (activedProjects.length > 0 && this.type !== 5) {
          this.$mfConfirm({
            message: this.$t('project.upgrade_deactivate_confirm'),
            cancelText: this.$t('no'),
            confirmText: this.$t('OK'),
            onConfirm: async() => {
              try {
                for (let i = 0; i < activedProjects.length; i++) {
                  await deActiveProject({ domain: data.name, project: activedProjects[i].name }).then(res => {
                    eventEmitter.emit('updateProjectNode', res.project)
                  })
                  // this.rowSelection[this.rowSelection.findIndex(j => j.id === activedProjects[i].id)]['is-active'] = false
                }
                this.step = 2
                // eventEmitter.emit('setTreeSelect', this.selectTreeNode)
              } catch (e) {
                console.log(e)
              }
            }
          })
        } else {
          this.step = 2
        }
      } else {
        this.$refs.runTask.runTask(0)
      }
    },

    onCancelModal() {
      if (this.step === 1) {
        this.resetVal()
      } else {
        if (this.type === 3) { // convert to unicode not sync
          this.resetVal()
        } else {
          if (this.isRunning) {
            this.$refs.runTask.onAbort(true, () => {
              this.resetVal()
            })
          } else {
            this.resetVal()
          }
        }
      }
    },

    // Resets the value of a parameter
    resetVal() {
      this.step = 1
      this.rowSelection = []
      this.afterUpgrade = 2
      this.isContinue = true
      this.isSilent = false
      this.visible = false
    },

    onRunning() {
      this.isRunning = true

      if (this.type === 3) {
        this.loading = true
      }
    },

    onError(runIndex) {
      // if (runIndex > -1 && runIndex === this.rowSelection.length - 1) {
      this.isRunning = false
      this.loading = false
      // }
    },

    onFinished(runIndex) {
      this.isRunning = false
      this.loading = false

      if (this.type === 5) return

      let oldActived = []
      const data = this.selectTreeNode.data

      if (runIndex > -1 && runIndex === this.rowSelection.length - 1) {
        // 2: Activate only currently active projects
        oldActived = this.rowSelection.filter(i => i['is-active'])

        // 3: Activate all projects
        // oldActived = this.rowSelection

        // After the execution, set the project status based on the configuration values

        if (this.afterUpgrade === 2) {
          oldActived.forEach(item => {
            activeProject({ domain: data.name, project: item.name }).then(res => {
              eventEmitter.emit('updateProjectNode', res.project)
            })
          })
        } else if (this.afterUpgrade === 3) {
          this.rowSelection.forEach(item => {
            activeProject({ domain: data.name, project: item.name }).then(res => {
              eventEmitter.emit('updateProjectNode', res.project)
            })
          })
        }
      }
    }
  }
}
</script>

<style scoped lang="less">
.mf-settings-panel{
  display: flex;
  padding: 16px;
  border: 1px solid rgba(101, 102, 104, 0.16);
  box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
  margin-bottom: 24px;
}

.mf-settings-item{
  flex: 1 1 auto;

  .mf-title{
    font-family: RegularWeb;
    font-size: 16px;
    color: #323435;
  }

  label {
    display: block;
  }
}
</style>
