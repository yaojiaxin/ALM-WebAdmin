<template>
  <div>
    <div class="task-actions mf-margin-b-8">
      <a-button
        v-if="!isPause"
        id="pause"
        class="mf-btn-dashed"
        :disabled="isFinished || isAborting || task === 'unicode'"
        @click="onPause"
      >
        <i class="iconfont icon-Project-resume" />
        {{ $t('project.pause') }}</a-button>
      <a-button v-if="isPause" id="pause" class="mf-btn-dashed" :disabled="isFinished || isAborting" @click="onResume">
        <i class="iconfont icon-a-Project-pause" />
        {{ $t('project.resume') }}</a-button>
      <a-button id="abort" class="mf-btn-dashed mf-margin-l-8" :disabled="isFinished || isAborting || task === 'unicode'" @click="onAbort()">
        <i class="iconfont icon-Project-abort" />
        {{ $t('project.abort') }}</a-button>
      <a-button id="clearLog" class="mf-btn-dashed mf-margin-l-8" :disabled="messages.length === 0" @click="onClearLog">
        <i class="iconfont icon-Project-clear" />
        {{ $t('project.clear_log') }}</a-button>
      <a-button id="exportLog" class="mf-btn-dashed mf-margin-l-8" :disabled="messages.length === 0 || !isFinished" @click="onExportLog">
        <i class="iconfont icon-Configuration_export" />
        {{ $t('project.export_log') }}</a-button>
    </div>

    <div class="task-result">
      <div class="title">{{ $t('project.results') }}</div>
      <ul id="msgPanel" class="task-result-panel">
        <li
          v-for="(m, index) in messages"
          :key="index"
          :class="{'error': m.status === 'FAILED', 'important': m.type === 'error' || m.type === 'title'}"
        >
          <span v-html="m['message']" />
        </li>
      </ul>
    </div>

    <template v-if="!isFinished && !isAborting && Array.isArray(projects) ">
      <a-progress :percent="percent" status="active" :show-info="false" stroke-color="#0079EF" />

      <span>{{ actionName }} '{{ runningProject ? runningProject.name : '' }}'</span>
    </template>

  </div>
</template>

<script>
import { upgrade, getTaskStatus, pause, abort, verify, resume, repair, unicode, align } from '@/api/project'
import { mapGetters } from 'vuex'
import { downloadCsv } from '@/utils/downloadCsv'

export default {
  props: {
    task: {
      type: String,
      default: '',
      required: true
    },

    projects: {
      type: [Array, Object],
      default: null,
      required: true
    },

    runTaskImmediately: {
      type: Boolean,
      default: true
    },

    params: {
      type: Object,
      default: () => {
        return {
          'is-silent': false,
          isContinue: true
        }
      }
    }
  },

  data() {
    return {
      messages: [],

      isFinished: false,

      isPause: false,

      isAborting: false,

      runningProject: null,

      runningProjectIndex: -1,

      interval: 0,

      actionName: ''
    }
  },

  computed: {
    ...mapGetters(['selectTreeNode']),

    percent() {
      if (Array.isArray(this.projects)) {
        return ((this.runningProjectIndex + 1) / this.projects.length).toFixed(2) * 100
      }
      return 0
    }
  },

  watch: {
    messages() {
      const msgPanel = document.getElementById('msgPanel')
      this.$nextTick(function() {
        msgPanel.scrollTop = msgPanel.scrollHeight
      })
    }
  },

  mounted() {
    if (this.runTaskImmediately) {
      this.runTask()
    } else {
      this.isFinished = true
    }
  },

  methods: {
    async runTask(startIndex = 0) {
      this.isFinished = false
      if (Array.isArray(this.projects)) {
        let i = startIndex

        for (i; i < this.projects.length; i++) {
          if (this.isAborting) {
            break
          }
          this.runningProject = this.projects[i]
          this.runningProjectIndex = i
          try {
            await this.runCurrentTask(this.runningProject['domain-name'], this.runningProject.name, this.runningProject['is-active'])
          } catch (e) {
            if (!this.params.isContinue) {
              break
            }
          }
        }
      } else {
        this.runningProject = this.projects
        this.runCurrentTask(this.runningProject['domain-name'], this.projects.name, this.runningProject['is-active'])
      }
    },

    async runCurrentTask(domain, project, isOriginActive) {
      this.$emit('running')
      this.isFinished = false

      switch (this.task) {
        case 'upgrade':
          this.actionName = this.$t('project.upgrading')
          await this.upgradeProject(domain, project, isOriginActive)
          break

        case 'verify':
          this.actionName = this.$t('project.verifying')
          await this.verifyProject(domain, project)
          break

        case 'repair':
          this.actionName = this.$t('project.repairing')
          await this.repairProject(domain, project, isOriginActive)
          break

        case 'unicode':
          this.actionName = this.$t('project.converting')
          await this.unicodeProject(domain, project)
          break

        case 'align':
          this.actionName = this.$t('project.realigning')
          await this.alignProject(domain, project, isOriginActive)
          break

        default:
          break
      }
    },

    onFinishTask() {
      this.messages = []
      this.$emit('finished')
      clearInterval(this.interval)
    },

    // get task status and generate log
    getTaskStatus(domain, project) {
      return new Promise((resolve, reject) => {
        let currentQueryIsFinished = true
        let taskIsFinish = false

        const intervalGetStatus = () => {
          this.interval = setInterval(async() => {
            try {
              if (this.interval && !currentQueryIsFinished) {
                clearInterval(this.interval)
                this.interval = 0
                return
              }
              currentQueryIsFinished = false
              const res = await getTaskStatus({
                domain: domain,
                project
              })
              currentQueryIsFinished = true

              // Add messages based on the returned status
              const formatMessage = (item, res, index) => {
                const [finishStatus, status] = item.status.split('_')

                this.messages.push({ ...item, status, message: `${item['time-stamp']}  ${item.message}` })

                this.isAborting = false
                if (finishStatus === 'FINISH' && !status) { // finished successfully
                  clearInterval(this.interval)
                  taskIsFinish = true
                  this.isFinished = true
                  this.$emit('finished', this.runningProjectIndex)
                  this.messages.push({ message: this.$t('Finished'), type: 'title' })
                  resolve()
                } else if (finishStatus === 'FINISH' && status) { // finished error
                  clearInterval(this.interval)
                  taskIsFinish = true
                  this.isFinished = true
                  this.$emit('error', this.runningProjectIndex)
                  this.messages.push({ message: this.$t('Finished'), type: 'title' })

                  reject(item.message)
                } else if (finishStatus === 'QUESTION' && !this.params['is-silent']) { // error dialog
                  clearInterval(this.interval)
                  taskIsFinish = true
                  this.$mfConfirm({
                    title: item.message,
                    iconType: 'Error',
                    cancelText: this.$t('project.abort'),
                    confirmText: this.$t('Retry'),
                    message: `${item['time-stamp']}  ${res[index - 1].message}`,
                    onConfirm: () => {
                      this.onResume()
                    },
                    onCancelChange: () => {
                      this.abortTask()
                    }
                  })
                }
              }

              if (res['task-progress-messages'] && res['task-progress-messages']['task-progress-message']) {
                const message = res['task-progress-messages']['task-progress-message']

                if (Array.isArray(message)) {
                  message.forEach((i, index) => {
                    formatMessage(i, message, index)
                  })
                } else {
                  formatMessage(message)
                }
              }
              if (!taskIsFinish && !this.interval) {
                intervalGetStatus()
              }
            } catch (e) {
              clearInterval(this.interval)
              reject(e)
            }
          }, 1000)
        }

        intervalGetStatus()
      })
    },

    // upgrade task
    async upgradeProject(domain, project, isOriginActive) {
      this.messages.push({ message: `${this.$t('project.upgrading')} "${project}"...`, type: 'title' })

      await upgrade({
        domain,
        project,
        data: {
          'maintenance-task': {
            options: { 'is-silent': this.params['is-silent'], 'is-origin-active': isOriginActive }
          }
        }
      }).then(async() => {
        await this.getTaskStatus(domain, project)
      }).catch(e => {
        this.isFinished = true
        this.messages.push({ status: 'FAILED', message: e.response.data.QCRestException.Title })
        this.messages.push({ message: this.$t('Finished'), type: 'title' })
        this.$emit('finished', this.runningProjectIndex)
      })
    },

    async verifyProject(domain, project) {
      this.messages.push({ message: `${this.$t('project.verifying')} "${project}"...`, type: 'title' })
      await verify({
        domain,
        project,
        data: {
          'maintenance-task': {
            options: {
              'is-silent': this.params['is-silent'],
              'verify-mode': 'deep'
            }
          }
        }
      })
      await this.getTaskStatus(domain, project)
    },

    async repairProject(domain, project, isOriginActive) {
      this.messages.push({ message: `${this.$t('project.repairing')} "${project}"...`, type: 'title' })
      await repair({
        domain,
        project,
        data: {
          'maintenance-task': {
            options: { 'is-silent': this.params['is-silent'], 'is-origin-active': isOriginActive }
          }
        }
      })
      await this.getTaskStatus(domain, project)
    },

    async unicodeProject(domain, project) {
      try {
        this.messages.push({ message: `${this.$t('project.converting')} "${project}"...`, type: 'title' })
        await unicode({
          domain,
          project
        })
        this.isFinished = true
        this.isAborting = false
        this.messages.push({ message: `${this.$t('Finished')}` })
        this.$emit('finished')
      } catch (e) {
        this.isFinished = true
        this.isAborting = false
        this.$emit('finished')
      }
    },

    async alignProject(domain, project, isOriginActive) {
      this.messages.push({ message: `${this.$t('project.realigning')} "${project}"...`, type: 'title' })
      await align({
        domain,
        project,
        data: {
          'maintenance-task': {
            options: { 'is-silent': this.params['is-silent'], 'is-origin-active': isOriginActive }
          }
        }
      })
      await this.getTaskStatus(domain, project)
    },

    // pause task
    async onPause() {
      pause({
        domain: this.runningProject['domain-name'],
        project: this.runningProject.name
      }).then(() => {
        this.isPause = true
        this.messages.push({ message: `${this.$t('project.paused')}...`, type: 'title' })
        clearInterval(this.interval)
      })
    },

    onResume() {
      resume({
        domain: this.runningProject['domain-name'],
        project: this.runningProject.name
      }).then(() => {
        this.isPause = false
        this.messages.push({ message: `${this.$t('project.resumed')}...`, type: 'title' })
        this.getTaskStatus(this.runningProject['domain-name'], this.runningProject.name).then(() => {
          if (Array.isArray(this.projects)) {
            this.runTask(this.runningProjectIndex + 1)
          }
        })
      })
    },

    // abort task
    async onAbort(isClose, afterAbort) { // isclose: close dialog and abort task
      this.$mfConfirm({
        title: this.$t('confirm'),
        message: isClose ? this.$t('project.close_and_abort_confirm') : this.$t('project.abort_confirm'),
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('OK'),
        onConfirm: () => {
          if (!this.isFinished) {
            this.messages.push({ message: `${this.$t('project.aborting_task')}...`, type: 'title' })
            this.isAborting = true
          }

          return this.abortTask(afterAbort)
        }
      })
    },

    abortTask(afterAbort) {
      abort({
        domain: this.runningProject['domain-name'],
        project: this.runningProject.name
      }).then(() => {
        // MF requires that click operation can continue after 3s delay
        setTimeout(() => {
          this.isFinished = true
          this.isAborting = false
          this.messages.push({ message: `${this.$t('project.aborted')}`, type: 'title' })
          this.$emit('finished')
          clearInterval(this.interval)
          if (afterAbort) afterAbort()
        }, 3000)
      }).catch(() => {
        this.isFinished = true
        this.isAborting = false
        this.$emit('error')
      })
    },

    onClearLog() {
      this.messages = []
    },

    // export log
    onExportLog() {
      // origin log
      const originLog = this.messages.map(i => i.message).join('\n')

      // remove tag & special character
      const downloadLog =
        originLog
          .replace(/<br>/g, '')
          .replace(/<\/?i>/g, '')
          .replace(/&nbsp;/g, ' ')
      downloadCsv(downloadLog, 'log', 'text')

      // const element = document.createElement('a')
      // let message = ''
      // message = this.messages.map(i => i.message).join('\n')
      //
      // element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(message))
      // element.setAttribute('download', 'log')
      // element.style.display = 'none'
      // document.body.appendChild(element)
      // element.click()
      // document.body.removeChild(element)
    }

  }
}
</script>

<style lang="less" scoped>
.task-result{
  height: 395px;
  background-color: #F5F7F8;
  box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.1);
  border: 1px solid #DCDEDF;

  .title{
    display: flex;
    align-items: center;
    height: 45px;
    padding: 0 16px;
    background-color: #fff;
    border-bottom: 1px solid #DCDEDF;
    font-family: SemiboldWeb;
    font-size: 14px;
  }
}

.task-result-panel{
  padding: 16px 20px;
  margin: 0;
  height: 350px;
  overflow-y: auto;

  li{
    list-style: none;
    color: #323435;
    font-family: RegularWeb;
    font-size: 16px;

    &.error{
      color: #e5004c;
    }

    &.important{
      font-weight: 600;
      font-family: SemiboldWeb;
    }
  }
}
</style>
