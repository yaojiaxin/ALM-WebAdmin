<template>
  <mf-modal
    id="add_empty_project_modal"
    :visible="visible"
    width="800px"
    :mask-closable="false"
    :ok-text="okText"
    :confirm-loading="confirmLoading"
    class="mf-stepform-modal"
    :next-disabled="nextDisabled"
    :destroy-on-close="true"
    @cancel="onClose"
    @close="onClose"
    @ok="onNext"
  >

    <span
      slot="title"
      class="title-slot"
    >
      <span>{{ modalTitle }}</span>
      <mf-help-btn :help="helpLink" />
    </span>

    <mf-step :step="currentStep - 1" :step-list="stepList" />

    <template>
      <keep-alive :include="keepAliveComponent">
        <template v-if="currentStep === 1 && showChooseType">
          <div class="mf-step-content" style="align-items:center">
            <div class="mf-step-type">
              <div class="mf-subtitle mf-margin-b-8">{{ title }}</div>
              <a-radio-group :value="createType" class="mf-block-radio mf-margin-l-14 center-content" @change="onChange">
                <a-radio v-for="item in creationStep" :id="'create-'+creationType+'-' + item.value" :key="item.value" :value="item.value">
                  {{ item.title }}
                </a-radio>
              </a-radio-group>
            </div>
          </div>
        </template>

        <component
          :is="currentComponent"
          v-else
          ref="currComponent"
          :child-components="currentChoose.children"
          :component-name="currentChoose.componentName"
          :create-type="createType"
          :creation-type="creationType"
          :form-data="formData"
          :props="currentChoose.props"
        />
      </keep-alive>
    </template>

    <template v-if="currentStep > 1" slot="footer">
      <a-button
        id="cancel_btn"
        type="link"
        class="mf-btn-dashed"
        :disabled="confirmLoading"
        @click="onBack"
      >
        {{ $t('back') }}
      </a-button>
    </template>

    <modal-confirm
      id="import-puid-already-exists-can-continue-import"
      :message-obj="MessageObj"
      :visible="appendVisible"
      :loading="appendLoading"
      :btn-loading="btnLoading"
      :size="'auto'"
      :auto-focus-enter="true"
      @onSubmit="appendSubmit('REPLACE')"
      @onReturn="appendReturn"
    >
      <a-button id="import-puid-already-exists-continue-import" slot="btn" type="primary" :loading="appendLoading && btnLoading === 2" :disabled="appendLoading && btnLoading !== 2" @click="appendSubmit('APPEND')">{{ $t('project.Append') }}</a-button>
    </modal-confirm>

  </mf-modal>
</template>

<script>
import MfStep from '@/components/MFStep'
import Summary from './Summary'
import Customization from './Customization'
// eslint-disable-next-line import/no-duplicates
import MultiStep from './MultiStep'
// eslint-disable-next-line import/no-duplicates
import MultiStep1 from './MultiStep'
import SelectFile from './SelectFile'
import ProjectForm from './ProjectForm'
import { deActiveProject } from '@/api/project'
import ModalConfirm from '@/components/ModalConfirm/index'
import { showTaskReminder, errorMessage } from '@/utils'

export default {
  components: { ModalConfirm, MfStep, Summary, Customization, MultiStep, MultiStep1, SelectFile, ProjectForm },

  props: {
    modalTitle: {
      type: String,
      default: ''
    },

    title: {
      type: String,
      default: ''
    },

    creationStep: {
      type: Array,
      default: () => []
    },

    // The creation type of the entire process
    creationType: {
      type: String,
      default: ''
    },

    helpLink: {
      type: String,
      default: ''
    },

    showChooseType: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      visible: false,

      confirmLoading: false,

      nextDisabled: false,

      currentStep: 1,

      createType: 1,

      firstChooseType: 1,

      keepAliveComponent: [],

      formData: null,

      isSkipLabValid: false,
      skipParams: { 'skip-validations': 'Y', 'skip-lab-projects-validation': 'Y' },

      appendVisible: false,
      appendLoading: false,
      btnLoading: 0,
      MessageObj: {
        title: this.$t('confirm'),
        discard: this.$t('Cancel'),
        onSubmit: this.$t('project.Replace'),
        func: undefined,
        isNext: undefined
      }
    }
  },

  computed: {
    okText() {
      if (this.currentStep < this.stepList.length) {
        return this.$t('Next')
      } else {
        return this.$t('Create')
      }
    },

    stepList() {
      return this.creationStep.find(i => i.value === this.createType).steps
    },

    currentChoose() {
      return this.stepList[this.currentStep - 1]
    },

    currentComponent() {
      return this.currentChoose.component
    }
  },

  watch: {
    createType: function(val) {
      if (this.currentStep === 1 && this.keepAliveComponent.length === 0) {
        this.firstChooseType = val
      }
    }
  },

  methods: {
    show() {
      this.visible = true
      if (!this.showChooseType) {
        this.resetKeepAlive()
      }
    },

    onChange(e) {
      this.createType = e.target.value
    },

    onClose() {
      if (this.currentStep > 1) {
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('project.are_you_sure_close_this_modal'),
          onConfirm: () => {
            this.visible = false
            this.currentStep = 1
            this.createType = 1
            this.keepAliveComponent = []
            this.formData = null
            this.isSkipLabValid = false
          }
        })
      } else {
        this.visible = false
        this.currentStep = 1
        this.createType = 1
        this.keepAliveComponent = []
        this.formData = null
        this.isSkipLabValid = false
      }
    },

    onBack() {
      this.isSkipLabValid = false
      try {
        if (this.$refs.currComponent.back()) {
          this.currentStep--
        }
      } catch (e) {
        this.currentStep--
      }
    },

    resetKeepAlive() {
      const keyName = this.currentComponent

      // keep-alive component
      if ((!this.keepAliveComponent.includes(keyName)) && keyName) {
        this.keepAliveComponent.push(keyName)
      }
    },

    async onNext() {
      if (this.currentStep === 1 && this.showChooseType) {
        // Switch the process to clear the component cache
        if (this.firstChooseType !== this.createType) {
          this.keepAliveComponent = []
          this.formData = null
          await this.$nextTick() // avoid clear the component cache failed
        }
        this.currentStep++
        this.resetKeepAlive()
      } else {
        // Whether the current component can proceed to the next step
        this.confirmLoading = true
        try {
          const isNext = await this.$refs.currComponent.next()

          if (isNext.continue) {
          // Func is executed if it is the last step
            if (this.currentStep === this.stepList.length) {
              this.formData = { ...this.formData, ...isNext.data }

              await this.isDeactiveProject()
              const func = this.creationStep.find(i => i.value === this.createType)

              if (func) {
                try {
                // this.confirmLoading = true

                  await this.doFunc(func, isNext, {})
                } catch (e) {
                  this.confirmLoading = false
                  this.handleImportFailed(e, func, isNext)
                }
              }
            } else {
              this.currentStep++
              this.firstChooseType = this.createType
              this.formData = { ...this.formData, ...isNext.data }
              this.resetKeepAlive()
              this.confirmLoading = false
            }
          } else {
            this.confirmLoading = false
          }
        } catch (e) {
          this.confirmLoading = false
        }
      }
    },

    // Check whether the copied project is active
    isDeactiveProject() {
      return new Promise((resolve, reject) => {
        if (this.formData.copyIsActive) {
          this.$mfConfirm({
            id: 'is_inactive_project',
            title: this.$t('project.warning'),
            iconType: 'Warning',
            message: this.createType === 3 ? this.$t('project.inactive_copy_project') : this.$t('project.inactive_copy_template'),
            onConfirm: () => {
              return deActiveProject({ domain: this.formData['create-from-domain'], project: this.formData['create-from-project'] }).then(() => {
                resolve()
              }).catch((e) => {
                reject(e)
              })
            },
            onCancelChange: () => {
              reject(new Error())
            },
            onCloseChange: () => {
              reject(new Error())
            }
          })
        } else {
          resolve()
        }
      })
    },

    async doFunc(func, isNext, extraData) {
      extraData['is-origin-active'] = this.formData.copyIsActive
      const data = { ...this.formData, ...isNext.data, ...extraData, 'is-async-mode': true }
      await func.runFuc({ data: data, domain: this.formData.domain })
      this.confirmLoading = false
      this.visible = false
      this.currentStep = 1
      this.createType = 1
      this.keepAliveComponent = []
      this.formData = null
      this.isSkipLabValid = false

      // this.$mfConfirm({
      //   id: 'project_sync_infomation',
      //   title: this.$t('Information'),
      //   iconType: 'Information',
      //   message: this.$t('operationInProcessWarning'),
      //   isShowCancel: false,
      //   confirmText: this.$t('OK')
      // })

      // show task reminder
      showTaskReminder(this.$store, true)
    },

    handleImportFailed(e, func, isNext) {
      if (e.response.data.QCRestException.Id === 'qccore.request-conflict') {
        const errorInfo = e.response.data.QCRestException.ExceptionProperties.ExceptionProperty
        switch (errorInfo.find(item => item['@Name'] === 'ErrorCode')['@Value']) {
          case 'PUID.Already.Exist':
            this.$mfConfirm({
              id: 'import-puid-already-exists',
              title: this.$t('confirm'),
              message: errorInfo.find(item => item['@Name'] === 'Detail')['@Value'] + this.$t('project.importErrorPUIDAlreadyExists'),
              cancelText: this.$t('Cancel'),
              confirmText: this.$t('OK'),
              onConfirm: async() => {
                try {
                  this.confirmLoading = true
                  let extraData = { 'continue-mode': 'REPLACE' }
                  if (this.isSkipLabValid) {
                    extraData = { ...extraData, ...this.skipParams }
                  }
                  await this.doFunc(func, isNext, extraData)
                  this.$emit('refresh')
                } catch (err) {
                  this.confirmLoading = false
                  this.handleImportFailed(err, func, isNext)
                }
              }
            })
            break
          case 'import.project.lab.conflict':
            this.$mfConfirm({
              id: 'import-request-conflict',
              title: this.$t('confirm'),
              message: this.$t('project.importErrorRequestConflict'),
              cancelText: this.$t('Cancel'),
              confirmText: this.$t('OK'),
              onConfirm: async() => {
                try {
                  this.confirmLoading = true
                  this.isSkipLabValid = true
                  await this.doFunc(func, isNext, this.skipParams)
                } catch (err) {
                  this.confirmLoading = false
                  this.handleImportFailed(err, func, isNext)
                }
              }
            })
            break
          case 'PUID.Already.Exist.Can.Continue.Import':
            this.appendVisible = true
            this.MessageObj.content = errorInfo.find(item => item['@Name'] === 'Detail')['@Value']
            this.MessageObj.func = func
            this.MessageObj.isNext = isNext
            break
          default:
            this.$message.error(errorInfo.find(item => item['@Name'] === 'Detail')['@Value'])
            break
        }
      } else {
        errorMessage(e.response.data.QCRestException.Title, e.response.data.QCRestException.StackTrace)
      }
    },

    async appendSubmit(type) {
      this.appendLoading = true
      this.btnLoading = type === 'REPLACE' ? 1 : 2
      try {
        this.confirmLoading = true
        let extraData = { 'continue-mode': type }
        if (this.isSkipLabValid) {
          extraData = { ...extraData, ...this.skipParams }
        }
        await this.doFunc(this.MessageObj.func, this.MessageObj.isNext, extraData)
        this.$emit('refresh')
      } catch (err) {
        this.confirmLoading = false
        this.handleImportFailed(err, this.MessageObj.func, this.MessageObj.isNext)
      }
      this.appendReturn()
    },

    appendReturn() {
      this.appendLoading = false
      this.btnLoading = 0
      this.appendVisible = false
      this.MessageObj = {
        title: this.$t('confirm'),
        discard: this.$t('Cancel'),
        onSubmit: this.$t('project.Replace'),
        func: undefined,
        isNext: undefined
      }
    }
  }
}
</script>

<style lang="less">
.mf-project-step{
  .ant-steps-item-wait{
    padding-left: 20px;
  }
}
/deep/.ant-steps-item{
  flex: unset!important;
}

.mf-step-content{
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  flex: 1;
  height: 350px;
  /deep/ .ant-form{
    width: 100%;
  }
}
.step-form{
  width: 420px;
  margin: 0 auto;
}

.title-slot {
  display: flex;
  align-items: center;

 .mf-help {
    display: flex;
    align-items: center;
  }
}
</style>
