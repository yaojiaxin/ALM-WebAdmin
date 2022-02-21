import i18n from '@/locales'
import {
  activeProject,
  createImportQCPProject,
  deActiveProject,
  getProjectDetail,
  getProjectsInDomains
} from '@/api/project'
// import { eventEmitter } from '@/views/project/event'

const siteMixin = {
  data() {
    return {
      visible: false,
      submitLoading: false,
      step: 0,
      childStep: 0,
      detailsStep: 2,
      chooseNum: 1,
      addDetailsForm: {},
      nextDisabled: false,
      customizationType: 2,
      copyFromType: '',
      summaryInfo: {},
      linkInfo: {},
      createParameter: {
        dbType: 3,
        projectType: 1,
        projectAdmins: [],
        extensions: [],
        extensionsInfo: [],
        activateProject: ['1'],
        administrators: []
      },
      titles: {
        CT: {
          name: i18n.tc('project.chooseType'),
          type: 'ChooseType'
        },
        AD: {
          name: i18n.tc('project.addDetails'),
          type: 'AddDetails'
        },
        SE: {
          name: i18n.tc('project.selectExtensions'),
          type: 'SelectExtensions'
        },
        SM: {
          name: i18n.tc('project.Summary'),
          type: 'MfSummary'
        },
        CZ: {
          name: i18n.tc('project.Customization'),
          type: 'Customization'
        },
        SP: {
          name: i18n.tc('project.SelectProject'),
          type: 'SelectProject'
        },
        SF: {
          name: i18n.tc('selectFile'),
          type: 'SelectFile'
        }
      },
      stepTitles: [i18n.tc('project.chooseType'), i18n.tc('project.addDetails'), i18n.tc('project.addProjectAdministrators'), i18n.tc('project.selectExtensions'), i18n.tc('project.Summary')]

    }
  },
  methods: {
    restModalDatas() {
      this.visible = false
      this.submitLoading = false
      this.nextDisabled = false
      this.step = 0
      this.childStep = 0
      this.createParameter = {
        dbType: 3,
        projectType: 1,
        projectAdmins: [],
        extensions: [],
        activateProject: ['1']
      }
    },
    show() {
      this.visible = true
      this.$store.dispatch('forge/getKey')
    },
    onClose(type) {
      type ? this.restModalData() : this.$mfConfirm({
        title: this.$t('confirm'),
        message: this.$t('project.are_you_sure_close_this_modal'),
        onConfirm: () => {
          this.restModalData()
        }
      })
      this.tempStep = 0
    },
    isShowWarningModal(param, pro, copyType = 'project') {
      if (pro.copyProjectIsActive) {
        this.$mfConfirm({
          title: this.$t('project.warning'),
          iconType: 'Warning',
          message: copyType === 'project' ? this.$t('project.inactive_copy_project') : this.$t('project.inactive_copy_template'),
          onConfirm: () => {
            return new Promise(resolve => {
              this.$mfConfirm({
                title: this.$t('project.warning'),
                iconType: 'Warning',
                message: copyType === 'project' ? this.$t('project.disconnect_active_users_project') : this.$t('project.disconnect_active_users_template'),
                onConfirm: () => {
                  this.submitLoading = true
                  return getProjectDetail({ domain: param['create-from-domain'], project: param['create-from-project'] }).then(res => {
                    param['create-from-status'] = res.project['is-active']
                    deActiveProject({ domain: param['create-from-domain'], project: param['create-from-project'] }).then(() => {
                      this.OnCreate(param, pro)
                    })
                  })
                }
              })
              resolve()
            })
          }
        })
      } else {
        this.submitLoading = true
        this.OnCreate(param, pro)
      }
    },
    async CreateImportProject(domain, parma) {
      const result = []
      let create = {}

      const [err, res] = await this.errCatch(createImportQCPProject, { domain: domain, data: parma })
      if (err) {
        create = { status: false, message: err.response.data.QCRestException.Title }
      } else if (res) {
        create = { status: true, message: this.$t('Succeeded') }
      }

      // active project api
      if (!err && parma['is-active']) {
        await activeProject({
          domain: domain,
          project: parma.name
        })
      }
      this.submitLoading = false
      this.visible = false

      // Select the newly added item after success
      // eventEmitter.emit('setTreeSelect', {
      //   data: {
      //     level: 3,
      //     data: { name: parma.name, key: `${res.project.id}`, 'domain-name': domain }
      //   },
      //   type: this.type
      // })
      result.push({ name: this.$t('project.CreateProject'), status: create.status, message: create.message })
      this.$emit('result', result)
      this.onClose(true)
    },
    isSameNameWarningModal(name) {
      this.$mfConfirm({
        title: this.$t('project.warning'),
        iconType: 'Warning',

        message: this.$t('project.name_already_exist', { type: 'project', name }),
        isShowCancel: false,
        confirmText: this.$t('OK')
      })
    },
    getProjectName(domain) {
      return getProjectsInDomains(domain).then(res => res.projects.project)
    },
    restModalData() {
      this.restModalDatas()
      this.createParameter.createType = this.type
    },
    async errCatch(fn, params) {
      return new Promise((resolve, reject) => {
        fn(params).then(res => {
          resolve([null, res])
        }).catch(e => {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject([e, null])
        })
      })
      // try {
      //   const res = await fn(params)
      //   return [null, res]
      // } catch (e) {
      //   return [e, null]
      // }
    }

  },
  watch: {
    step(val) {
      if (!val) {
        // is first step reset step title
        this.stepTitles = [this.$t('project.chooseType'), this.$t('project.addDetails'), this.$t('project.addProjectAdministrators'), this.$t('project.selectExtensions'), this.$t('project.Summary')]
      }
    }
  }
}

export default siteMixin
