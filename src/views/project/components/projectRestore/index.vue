<template>
  <div class="mf-display-inherit">
    <icon-btn
      id="a-icon-retoreProject"
      icon-style="icon-Project-Restore"
      :icon-title="$t('project.projectRestore')"
      :is-disabled="isDisabled"
      style="width: 20px !important; "
      @onClick="restoreProjectShow"
    />

    <mf-modal
      id="restore_project_modal"
      :visible="visible"
      width="800px"
      :mask-closable="false"
      :cancel-text="$t('Cancel')"
      :ok-text="okText"
      class="mf-stepform-modal"
      :confirm-loading="loading"
      @cancel="onClose"
      @ok="onOk"
    >
      <span slot="title">
        {{ $t('project.Restore Project') }}
        <mf-help-btn :help="RESTORE_PROJECT" />
      </span>
      <mf-alert type="info" :message="$t('project.restoreProjectNote')" />

      <mf-form
        ref="restoreProjectform"
        :model="form"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        :rules="rules"
        class="step-form"
      >
        <a-form-model-item :label="$t('project.dbidfilelocation')" prop="file">
          <a-upload
            id="restore_project_upload"
            :before-upload="beforeUpload"
            :custom-request="customRequest"
            accept=".xml"
            :file-list="fileList"
            :remove="removeFile"
            @change="onChange"
          >
            <div v-if="isIE" :class="uploadDisabled ? 'disable' : ''">
              <a-button :disabled="uploadDisabled"> {{ $t('project.browse') }} </a-button>
            </div>
            <a-button v-else :disabled="uploadDisabled"> {{ $t('project.browse') }} </a-button>

          </a-upload>
        </a-form-model-item>

        <a-form-model-item :label="$t('project.restoreIntoDomain')" prop="domain">
          <mf-select id="restore_project_domain" v-model="form.domain" :allow-clear="false" :disabled="projectType === 'LAB_PROJECT'" style="width: 65%;">
            <a-select-option
              v-for="item in domains"
              :id="item.id"
              :key="item.id"
              :value="item.name"
            >
              {{ item.name }}
            </a-select-option>
          </mf-select>
        </a-form-model-item>

        <a-form-model-item v-if="isShow" :label="$t('projectName')" style="margin-bottom: 0">
          {{ showFileContent['PROJECT_NAME'] }}
        </a-form-model-item>
      </mf-form>

      <mf-form
        v-if="isShow"
        ref="showRestorProjectDetails"
        :label-col="labelColShow"
        :wrapper-col="wrapperColShow"
        :model="showFileContent"
        class="step-form-ex show-retore-form"
      >
        <a-form-model-item :label="$t('project.DatabaseType')" prop="DB_TYPE">
          {{ showFileContent['DB_TYPE']|databaseType }}
        </a-form-model-item>

        <a-form-model-item :label="$t('project.DatabaseName')" prop="DB_NAME">
          {{ showFileContent['DB_NAME'] }}
        </a-form-model-item>

        <a-form-model-item :label="$t('project.DatabaseServer')" prop="DBSERVER_NAME">
          {{ showFileContent['DBSERVER_NAME'] }}
        </a-form-model-item>

        <a-form-model-item :label="$t('project.VersionControl')" prop="PR_HAS_VCSDB">
          {{ showFileContent['PR_HAS_VCSDB'] }}
        </a-form-model-item>

        <a-form-model-item
          :title="showFileContent['PHYSICAL_DIRECTORY']"
          :label="$t('project.ProjectDirectory')"
          prop="PHYSICAL_DIRECTORY"
        >
          {{ showFileContent['PHYSICAL_DIRECTORY'] }}
        </a-form-model-item>
      </mf-form>
    </mf-modal>

    <!-- Warning -->

    <mf-modal-confirm
      :visible="warnVisible"
      :message-obj="messageObj"
      icon-type="Warning"
      :auto-focus-enter="true"
      @onReturn="onCloseWarning"
      @onSubmit="onWarningOk"
    >
      <!--      <a-checkbox class="restore-project-check" @change="onWarningChange">-->
      <!--        {{ $t('project.warningDialogAgain') }}-->
      <!--      </a-checkbox>-->
    </mf-modal-confirm>
  </div>
</template>

<script>
import MfAlert from '@/components/MFAlert'
import { mapGetters } from 'vuex'
import { xml2Obj, file2Url, errorMessage } from '@/utils'
import { restoreProject, getProjectsInDomains } from '@/api/project'
import { getAllDbServersWithoutMessage } from '@/api/servers'
// import axios from 'axios'
import IconBtn from '@/components/BtnIcon/index'
import { RESTORE_PROJECT } from 'config/help'
import isProjectCanBeOperated from '../../../project/components/mixins/isProjectCanBeOperated.js'

export default {
  components: { MfAlert, IconBtn },
  props: {
    isDisabled: {
      type: Boolean,
      default: false
    },
    projectType: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      RESTORE_PROJECT,
      visible: false,

      fileList: [],

      okText: this.$t('project.Restore'),

      labelCol: { span: 6 },
      wrapperCol: { span: 13 },
      labelColShow: { span: 7 },
      wrapperColShow: { span: 17 },
      form: {
        file: '',
        domain: 'DEFAULT'
      },
      rules: {
        file: [{ required: true, message: this.$t('project.FileIsRequired') }],
        domain: [{ required: true, message: this.$t('project.domainIsRequired') }]
      },

      showFileContent: {},
      isShow: false,
      isIE: false,

      loading: false,
      warnVisible: false,
      isShowDialogAgain: false,
      messageObj: {
        title: this.$t('project.warning'),
        content: this.$t('project.restoreProjectWarning'),
        discard: this.$t('Cancel'),
        onSubmit: this.$t('OK')
      },

      uploadDisabled: false,
      nextDisabled: true
    }
  },

  computed: {
    ...mapGetters({
      domains: 'domainList',
      siteVersion: 'siteVersion',
      selectDomain: 'selectDomain',
      selectTreeNode: 'selectTreeNode'
    })

  },

  watch: {
    visible(val) {
      if (val) {
        this.fileList = []
        this.form.domain = this.projectType !== 'LAB_PROJECT' ? (this.selectTreeNode.level === 1 ? this.selectDomain.name : this.selectTreeNode.data['domain-name']) : 'DEFAULT'
      }
    }
  },
  created() {
    var userAgent = navigator.userAgent
    const isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1
    const isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1
    this.isIE = isIE || isIE11
  },

  methods: {
    restoreProjectShow() {
      this.visible = true
    },

    onClose() {
      this.visible = false
      this.isShow = false
      this.uploadDisabled = false
      this.nextDisabled = true
      this.form.file = ''
      this.$refs.restoreProjectform.$children[0].resetFields()
    },
    test() {
      console.log('asdasd')
    },

    async onOk() {
      try {
        const valid = await this.$refs.restoreProjectform.$children[0].validate()
        if (valid) {
          // Check whether the current domain has a project with the same name
          const res = await getProjectsInDomains(this.form.domain)
          const allProject = res.projects.project
          let isSame = false

          if (Array.isArray(allProject)) {
            isSame = Boolean(allProject.filter(it => String(it.name) === String(this.showFileContent.PROJECT_NAME)).length)
          } else {
            isSame = allProject ? String(allProject.name) === this.showFileContent.PROJECT_NAME : false
          }

          if (isSame) {
            this.$mfConfirm({
              title: this.$t('project.warning'),
              iconType: 'Warning',
              message: this.$t('project.name_already_exist', { type: 'project', name: this.showFileContent.PROJECT_NAME }),
              isShowCancel: false,
              confirmText: this.$t('OK')
            })
          } else {
            if (this.showFileContent.PROJECT_TYPE === 'LabManagement') {
              this.$mfConfirm({
                title: this.$t('confirm'),
                message: this.$t('project.restoreLab'),
                cancelText: this.$t('no'),
                confirmText: this.$t('yes'),
                onConfirm: () => {
                  this.getDbInfo(`{name[${this.showFileContent.DBSERVER_NAME}];type[${parseInt(this.showFileContent.DB_TYPE)}]}`)
                }
              })
            } else {
              this.getDbInfo(`{name[${this.showFileContent.DBSERVER_NAME}];type[${parseInt(this.showFileContent.DB_TYPE)}]}`)
            }
          }
        } else {
          return false
        }
      } catch (e) {
        // console.log(e)
      }
    },

    onCloseWarning() {
      this.warnVisible = false
    },

    onWarningOk() {
      this.loading = true
      this.warnVisible = false
      const restoreDatas = {
        'restore-project': {
          'db-server-name': this.showFileContent.DBSERVER_NAME,
          'db-name': this.showFileContent.DB_NAME,
          'db-type': parseInt(this.showFileContent.DB_TYPE),
          name: this.showFileContent.PROJECT_NAME,
          'physical-directory': this.showFileContent.PHYSICAL_DIRECTORY,
          'db-connstr-format': this.showFileContent.DB_CONNSTR_FORMAT,
          'db-user-pass': this.showFileContent.DB_USER_PASS,
          'is-template': this.showFileContent.IS_TEMPLATE === 'Y',
          'project-type': this.showFileContent.PROJECT_TYPE,
          description: this.showFileContent.DESCRIPTION,
          'is-db-native-auth': this.showFileContent.DB_NATIVE_AUTHENTICATION,
          'pr-has-vcsdb': this.showFileContent.PR_HAS_VCSDB,
          'users-quota': this.showFileContent.USERS_QUOTA,
          'pr-is-active': this.showFileContent.PR_IS_ACTIVE,
          'saq-is-active': this.showFileContent.SAQ_IS_ACTIVE,
          'pr-language': this.showFileContent.PR_LANGUAGE,
          uid: this.showFileContent.PROJECT_UID,
          'pr-is-unicode': this.showFileContent.PR_IS_UNICODE,
          'pr-smart-repository-enabled': this.showFileContent.PR_SMART_REPOSITORY_ENABLED,
          'pr-is-qpm-auto-calc-enabled': this.showFileContent.PR_IS_QPM_AUTO_CALC_ENABLED
        }
      }
      this.tryRestore(restoreDatas, this.form)
    },

    tryRestore(restoreDatas, formDatas) {
      restoreProject(restoreDatas, formDatas).then(res => {
        this.visible = false
        this.isShow = false
        this.uploadDisabled = false
        this.nextDisabled = true
        this.form.file = ''
        this.$message.success(this.$t('project.restore_create_ok'))
        if (isProjectCanBeOperated(res.project.status) && res.project.version !== this.siteVersion) { // if the status is not normal, there is no need to compare the versions
          this.$message.info(this.$t('project.upgradeProjectInfo', { wrongVersion: res.project.version, rightVersion: this.siteVersion }))
        }
        this.loading = false
        // TODO 更新tree
        this.$emit('refresh')
      }).catch(e => {
        this.loading = false
        if (e.response.data.QCRestException.Id === 'qccore.request-conflict') {
          const errorInfo = e.response.data.QCRestException.ExceptionProperties.ExceptionProperty
          switch (errorInfo.find(item => item['@Name'] === 'ErrorCode')['@Value']) {
            case 'PUID.Already.Exist':
              this.$mfConfirm({
                id: 'puid-already-exists',
                title: this.$t('confirm'),
                message: errorInfo.find(item => item['@Name'] === 'Detail')['@Value'] + this.$t('project.restore_PUID_conflict'),
                cancelText: this.$t('Cancel'),
                confirmText: this.$t('OK'),
                onConfirm: async() => {
                  try {
                    this.loading = true
                    restoreDatas['restore-project']['replace-project'] = true
                    await this.tryRestore(restoreDatas, formDatas)
                    this.$emit('refresh')
                  } catch (err) {
                    this.loading = false
                    errorMessage(err.response.data.QCRestException.Title, err.response.data.QCRestException.StackTrace)
                  }
                }
              })
              break
            default:
              this.$message.error(errorInfo.find(item => item['@Name'] === 'Detail')['@Value'])
              break
          }
        } else {
          errorMessage(e.response.data.QCRestException.Title, e.response.data.QCRestException.StackTrace)
        }
      })
    },

    getDbInfo(params) {
      getAllDbServersWithoutMessage(params).then(data => {
        if (data['db-servers']['db-server']['is-text-search-enabled']) {
          this.warnVisible = true
        } else {
          this.$mfConfirm({
            title: this.$t('warning'),
            iconType: 'Warning',
            message: this.$t('project.restoreProjectConfirm'),
            cancelText: this.$t('no'),
            confirmText: this.$t('yes'),
            onConfirm: () => {
              this.warnVisible = true
            }
          })
        }
      }).catch(() => {
        this.$message.error(this.$t('project.restoreDbNotExist'))
      })
    },

    onWarningChange(e) {
      this.isShowDialogAgain = e.target.checked
    },

    beforeUpload(file) {
      if (this.fileList.length) return false
      const reg = /\.(xml)(\?.*)?$/
      return new Promise((resolve, reject) => {
        if (reg.test(file.name)) {
          this.fileList = [...this.fileList, file]
          resolve()
        } else {
          this.$message.error(this.$t('PleaseUploadTheCorrectFileFormat', { fileType: '.xml' }))
          reject(new Error(this.$t('PleaseUploadTheCorrectFileFormat', { fileType: '.xml' })))
        }
      })
    },

    onChange(info) {
      if (info.file.status === 'done') {
        this.uploadDisabled = true
        this.nextDisabled = false
        this.form.file = 'file'
      }
    },

    customRequest(param) {
      // const file = param.file
      // var URL = window.URL || window.webkitURL
      // // 通过 file 生成目标 url
      // var imgURL = URL.createObjectURL(file)
      // axios.get(imgURL).then(data => {
      //   param.onSuccess()
      //   this.showFileContent = xml2Obj(data.data)
      //   // console.log(xml2Obj(data.data))
      // }).catch(() => {})

      file2Url(param).then(data => {
        param.onSuccess()
        this.showFileContent = xml2Obj(data.data)
        this.isShow = true
      }).catch(() => {})
    },

    removeFile() {
      this.uploadDisabled = false
      this.nextDisabled = true
      this.form.file = ''
      this.isShow = false
      this.showFileContent = {}
      this.fileList = []
    }
  }

}
</script>

<style lang="less" scoped>

.disable {
  pointer-events: none;
  background-color: #d9d9d9;
  color: rgba(0,0,0,0.5);
}
.step-form{
  width: 656px;
  margin: 0 auto;
  margin-top: 24px;
}

.step-form-ex{
  width: 504px;
  margin-left: 224px;
}

.restore-project-check{
    margin: 24px 0;
}

.restore-project-h2{
    font-size: 14px;
    font-weight: 400;
    color: #666666;
}

/deep/ .show-retore-form .ant-form-item{
   margin-bottom: 0px;
  //  text-overflow: ellipsis;
  //   overflow: hidden;
  //   white-space: nowrap;
  //  display: -webkit-box;
  //  -webkit-line-clamp: 1;
  //  word-break: keep-all;
}

/deep/ .show-retore-form .ant-form-item-control {
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  line-height: 22px;

//  display: -webkit-box;
//  -webkit-box-orient: vertical;
//  -webkit-line-clamp: 1;
//  word-break: keep-all;

}

/deep/ .show-retore-form .ant-form-item-label {
  line-height: 22px;
}

/deep/ .show-retore-form label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.5);
}

/deep/ .show-retore-form label::before {
  display: inline-block;
  content: '';
  width: 4px;
  height: 4px;
  background: #737373;
  margin-right: 10px;
  margin-bottom: 3px;
}
</style>
