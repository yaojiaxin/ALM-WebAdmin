<template>
  <a-spin :spinning="loading" class="mf-spin" :class="{'mf-padding-bt-65': updateAble, 'mf-spin-lab': projectType === 'LAB_PROJECT', 'mf-spin-lab-op': !checkPermission(['CUSTOMER_CONTEXT_SWITCH'])}">

    <div ref="detailScroll" class="mf-project-detail-panel">
      <mf-form
        ref="projectForm"
        class="project-form"
        layout="horizontal"
        :model="form"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        style="padding-bottom: 24px"
        :rules="rules"
      >
        <!-- general -->
        <div v-if="projectType !== 'LAB_PROJECT'" class="mf-subtitle mf-margin-b-24">{{ $t('customers.general') }}</div>
        <a-row v-if="projectType !== 'LAB_PROJECT'" :gutter="16">
          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-model-item :label="$t('Domain')">
              <mf-select id="domain-list" v-model="form['domain-name']" :allow-clear="false" :disabled="isCreateProcess">
                <a-select-option v-for="item in domainList" :key="item.id" :value="item.name" :title="item.name">
                  {{ item.name }}
                </a-select-option>
              </mf-select>
            </a-form-model-item>
          </a-col>

          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-model-item :label="$t('projectName')" prop="name">
              <a-tooltip
                v-if="isCreateProcess"
                placement="topLeft"
                :title="form['name']"
              >
                <span>
                  <a-input id="project-name-with-tooltip" v-model.trim="form['name']" :max-length="30" :disabled="isCreateProcess" />
                </span>
              </a-tooltip>
              <a-input v-else id="project-name" v-model.trim="form['name']" :max-length="30" :disabled="isCreateProcess" />
            </a-form-model-item>
          </a-col>

          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-model-item :label="$t('project.project_status')">
              <a-tooltip
                placement="topLeft"
                :title="$t(PROJECT_STATUS[form.status])"
              >
                <span>
                  <a-input
                    id="customer-status"
                    :active-value="isActive?$t('project.active'):$t('project.inactive')"
                    :value="$t(PROJECT_STATUS[form.status])"
                    disabled
                    :style="{color: isActive?'#1aac60':'#e5004c'}"
                  />
                </span>
              </a-tooltip>
            </a-form-model-item>
          </a-col>

          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-model-item :label="$t('project.createdFromDomain')">
              <a-tooltip
                placement="topLeft"
                :title="form['create-from-domain']"
              >
                <span>
                  <a-input v-model="form['create-from-domain']" disabled />
                </span>
              </a-tooltip>
            </a-form-model-item>
          </a-col>

          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-model-item :label="$t('project.createdFromProject')">
              <a-tooltip
                placement="topLeft"
                :title="form['create-from-project']"
              >
                <span>
                  <a-input v-model="form['create-from-project']" disabled />
                </span>
              </a-tooltip>
            </a-form-model-item>
          </a-col>
        </a-row>

        <!-- project database -->
        <div class="mf-subtitle mf-margin-b-24">{{
          selectNodeType === 'project' ? $t('project.ProjectDatabase') : $t('project.TemplateDatabase') }}
        </div>

        <a-row :gutter="16">
          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-model-item :label="$t('project.DatabaseType')">
              <a-tooltip
                placement="topLeft"
                :title="form['db-type']"
              >
                <span>
                  <a-input v-model="form['db-type']" disabled />
                </span>
              </a-tooltip>
            </a-form-model-item>
          </a-col>
          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-model-item :label="$t('project.databaseName')">
              <a-tooltip
                placement="topLeft"
                :title="form['db-name']"
              >
                <span>
                  <a-input v-model="form['db-name']" disabled />
                </span>
              </a-tooltip>
            </a-form-model-item>
          </a-col>
          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-model-item :label="$t('project.databaseServer')">
              <a-tooltip
                placement="topLeft"
                :title="form['db-server-name']"
              >
                <span>
                  <a-input v-model="form['db-server-name']" disabled />
                </span>
              </a-tooltip>
            </a-form-model-item>
          </a-col>
          <!-- </a-row>

          <a-row :gutter="16"> -->
          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-model-item :label="$t('project.maintenanceState')">
              <a-tooltip
                placement="topLeft"
                :title="form['maintenance-state']"
              >
                <span>
                  <a-input v-model="form['maintenance-state']" disabled />
                </span>
              </a-tooltip>
            </a-form-model-item>
          </a-col>
          <!-- </a-row>

          <a-row :gutter="16"> -->
          <a-col :span="16" :sm="24" :md="24" :lg="24" :xl="24" :xxl="16">
            <a-form-model-item prop="db-connstr-format" class="mf-form-item-16span" :label="$t('project.connectionString')">
              <span class="connection">
                <a-tooltip
                  placement="topLeft"
                  :title="form['db-connstr-format']"
                >
                  <span class="mf-flex-1">
                    <a-input v-model="form['db-connstr-format']" style="min-width: 200px" disabled />
                  </span>
                </a-tooltip>
                <a-button type="link" class="mf-btn-link-primary mf-margin-l-24" :disabled="isCreateProcess" @click="onTestConnection">{{ $t('project.changeConnectionString') }}</a-button>
              </span>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col v-if="projectType !== 'LAB_PROJECT'" :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-model-item :label="$t('project.versioning')">
              <a-tooltip
                placement="topLeft"
                :title="versioning"
              >
                <span>
                  <a-input id="project-versioning" v-model="versioning" disabled />
                </span>
              </a-tooltip>
            </a-form-model-item>
          </a-col>

          <a-col :span="16" :sm="24" :md="24" :lg="24" :xl="24" :xxl="16">

            <a-form-model-item :label="$t('project.projectDirectory')" class="mf-form-item-16span">
              <a-tooltip
                placement="topLeft"
                :title="form['physical-directory']"
              >
                <span>
                  <a-input v-model="form['physical-directory']" disabled />
                </span>
              </a-tooltip>
            </a-form-model-item>

          </a-col>

          <a-col v-if="projectType !== 'LAB_PROJECT'" :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-model-item :label="$t('project.unicodeSupported')">
              <a-tooltip
                placement="topLeft"
                :title="form['is-unicode']"
              >
                <span>
                  <a-input v-model="form['is-unicode']" disabled />
                </span>
              </a-tooltip>
            </a-form-model-item>
          </a-col>
          <a-col v-if="dbType === DATABASE_TYPE.Oracle" :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-model-item :label="$t('project.dbUserPassword')">
              <a-button type="link" class="mf-btn-link-primary" :disabled="isCreateProcess" @click="onChangePassword">{{ $t('change_password') }}</a-button>
            </a-form-model-item>
          </a-col>
          <!-- </a-row>

          <a-row :gutter="16"> -->

          <a-col :span="16" :sm="24" :md="24" :lg="24" :xl="24" :xxl="16">
            <a-form-model-item :label="$t('project.searchLanguage')" class="mf-form-item-16span">
              <mf-select
                v-model="form['search-language']"
                :disabled="!isTextSearchEnabled"
                :allow-clear="false"
                style="width: 150px"
              >
                <a-select-option v-for="(item, index) in searchLanguageList" :key="index" :value="item">
                  {{ item }}
                </a-select-option>
              </mf-select>
              <a-button
                type="link"
                :disabled="!isTextSearchEnabled"
                class="mf-btn-link-primary mf-margin-l-24"
                @click="onSearchLanguage"
              >{{ $t('project.textSearch') }}</a-button>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-model-item :label="$t('project.exceptionFile')" class="mf-form-item-16span mf-form-item-24span">
              <a-tooltip
                v-if="isCreateProcess"
                placement="topLeft"
                :title="form['exception-file']"
              >
                <span>
                  <a-input v-model="form['exception-file']" :disabled="isCreateProcess" :placeholder="$t('project.exceptionFilePlaceholder')" />
                </span>
              </a-tooltip>
              <a-input v-else v-model="form['exception-file']" :disabled="isCreateProcess" :placeholder="$t('project.exceptionFilePlaceholder')" />
            </a-form-model-item>
          </a-col>
        </a-row>

        <!-- repository cleanup -->
        <a-collapse v-model="activeCollapse" class="mf-collapse" style="margin: 0 -24px 0 -38px;">
          <a-collapse-panel v-if="projectType !== 'LAB_PROJECT'" key="1">
            <template slot="header">
              <span class="mf-subtitle">{{ $t('project.repositoryCleanup') }}</span>
            </template>
            <a-button type="link" class="mf-btn-link-primary" :disabled="!isActive || form['smart-repository-enabled'] === 'N'" :loading="cleaning" @click="handlerRepo"> {{ form['smart-repository-gc-last-run-time'] === 0 ? $t('project.postponeRepositoryCleanup') : $t('project.promoteRepositoryCleanup') }} </a-button>

          </a-collapse-panel>

          <!-- project planning and tracking -->
          <a-collapse-panel v-if="projectType !== 'LAB_PROJECT' && isNotDeniedFeature(['QUALITY_PROJECT_MANAGEMENT'])" key="2" :disabled="false">
            <template slot="header">
              <span class="mf-subtitle">{{ $t('project.projectPlanningAndTracking') }}</span>
            </template>
            <a-checkbox v-model="form['is-qpm-auto-calc-enabled']" :disabled="calculating" @change="onCalculationChange"> {{ $t('project.automaticCalculationsState') }} </a-checkbox>
            <a-button type="link" class="mf-btn-link-primary mf-margin-l-24" :disabled="isRunNowDisabled" :loading="running" @click="runNow">{{ $t('project.runNow') }}</a-button>
          </a-collapse-panel>

          <!-- Quality Insight -->
          <a-collapse-panel v-if="projectType !== 'LAB_PROJECT'" key="3">
            <template slot="header">
              <span id="project-quality-insight-title" class="mf-subtitle">{{ $t('project.qualityInsight') }}</span>
            </template>

            <quality-insight
              :qis-can-be-enabled="form['qis-can-be-enabled']"
              :qis-is-enabled="form['qis-is-enabled']"
              :is-create-process="isCreateProcess"
              :is-same-version="isSameVersion"
              @update:qualityInsight="updateQualityInsight"
            />
          </a-collapse-panel>

          <!-- Miscellaneous -->
          <a-collapse-panel key="4">
            <template slot="header">
              <span class="mf-subtitle">{{ $t('project.miscellaneous') }}</span>
            </template>

            <a-form-model-item>
              <a-checkbox v-model="form['is-auto-mail-enabled']" class="mf-margin-l-24" :disabled="isCreateProcess"> {{ $t('project.sendEmailAutomatically') }} </a-checkbox>
              <a-button type="link" class="mf-btn-link-primary" :disabled="!isActive || !isSameVersion" :loading="sending" @click="sendAutoMail">{{ $t('project.sendEmail') }}</a-button>
            </a-form-model-item>

            <a-form-model-item v-if="selectNodeType === 'project' && projectType !== 'LAB_PROJECT'" :label="$t('project.linkedToTemplate')" class="mf-flex-formitem fix-width">
              {{ linkedTemplate }}
            </a-form-model-item>

            <a-form-model-item v-if="selectNodeType === 'template'" :label="$t('project.linkProject')" class="mf-flex-formitem fix-width">
              {{ linkedNumber }}
            </a-form-model-item>

            <a-form-model-item :label="$t('project.user_quota')" class="mf-flex-formitem fix-width">
              <a-radio-group v-model="isLimited" name="userQuota" :disabled="isCreateProcess" @change="onLimitedChange">
                <a-radio id="pro-Quota-unlimted" :value="false">
                  {{ $t('project.unlimitedConnections') }}
                </a-radio>
                <a-radio id="pro-Quota-limtedMax" :value="true">
                  {{ $t('project.maximum') }}
                </a-radio>
              </a-radio-group>
              <a-input-number
                id="input-number"
                v-model="maximum"
                :disabled="!isLimited||isCreateProcess"
                :min="0"
                :max="MAX_CONNECTIONS"
                :formatter="limitNumber"
                :parser="limitNumber"
              /> {{ $t('project.connections') }}
            </a-form-model-item>

            <a-form-model-item :label="$t('userManagement.Description')" class="description-form-item">
              <a-textarea id="description-textarea" v-model="form.description" :auto-size="{ minRows: 2}" :disabled="isCreateProcess" />
            </a-form-model-item>
            <!--            <div class="mf-project-form-item">-->
            <!--              <label class="mf-project-form-label ant-form-item-label">{{ $t('userManagement.Description') }}</label>-->

            <!--              <div class="mf-project-form-content">-->
            <!--                <a-textarea id="description-textarea-bak" v-model="form.description" :auto-size="{ minRows: 2}" :disabled="isCreateProcess" />-->
            <!--              </div>-->
            <!--            </div>-->
          </a-collapse-panel>
        </a-collapse>
      </mf-form>
    </div>
    <div v-if="updateAble" class="mf-project-tool">
      <a-button id="project-restore" :disabled="isSave || submitting" style="margin-right: 8px;" class="mf-btn-dashed" @click="restoreProject"> {{ $t('Restore') }} </a-button>
      <a-button id="project-save" :disabled="isSave" type="primary" :loading="submitting" @click="onSaveProject"> {{ $t('Save') }} </a-button>
    </div>

    <change-db-password ref="changePassword" />

    <test-connection ref="testConnetion" @ok="onChangeConnectionOk" @onChangeConnection="(connection) => form['db-connstr-format'] = connection" />
  </a-spin>
</template>

<script>
import { getProjectDetail, promoteRepoGc, postponeRepoGc, rebuildTextSearch, autoMail, getSearchLanguage, runNow, updateProject } from '@/api/project'
import { getAllDbServers } from '@/api/servers'
import { DATABASE_TYPE, MAX_CONNECTIONS, PROJECT_STATUS, USER_PROJECTS } from '@/store/const'
import { eventListener, eventEmitter } from '../../event'
import ChangeDbPassword from './components/ChangeDbPassword'
import TestConnection from './components/TestConnection'
import QualityInsight from './components/QualityInsight'
// import { getLinkedByType } from './model/utils'
import projectMixin from './model/projectDetail'
import { limitNumber, validateName } from '@/utils/validate'
import { isSiteAdmin } from '@/utils/permission'
import { isChangeObjorArr } from '@/utils'
import { getIsLogin } from '@/utils/auth'
import { getQPMStatus } from '@/api/tools.js'
import { mapGetters } from 'vuex'

export default {
  components: { ChangeDbPassword, TestConnection, QualityInsight },
  inject: {
    projectTree: {
      default: ''
    }
  },
  mixins: [projectMixin],
  props: {
    activeTab: {
      type: String,
      default: 'details'
    },
    isCreateProcess: {
      type: Boolean,
      default: false
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
      limitNumber,

      loading: false,
      sending: false,
      cleaning: false,
      running: false,
      calculating: false,

      DATABASE_TYPE,

      PROJECT_STATUS,

      labelCol: { span: 10 },
      wrapperCol: { span: 14 },

      MAX_CONNECTIONS,
      isLimited: false,
      maximum: 0,

      dbType: 3,

      form: {
        name: '',
        'domain-name': '',
        'db-type': '',
        'db-name': '',
        'db-server-name': '',
        'create-from-domain': '',
        'create-from-project': '',
        'db-connstr-format': '',
        'is-unicode': 'N',
        'physical-directory': '',
        'search-language': '',
        status: '',
        'exception-file': '',
        'is-auto-mail-enabled': false,
        'is-active': false,
        'is-qpm-auto-calc-enabled': false,
        'users-quota': -1,
        'has-vcs-db': 0,
        description: '',
        'smart-repository-enabled': 'N',
        'smart-repository-gc-last-run-time': 0,
        'qis-can-be-enabled': false,
        'qis-is-enabled': false
      },
      searchLanguageList: [],
      isTextSearchEnabled: false,
      initForm: {},
      initMaximum: 0,
      initIsLimited: false,
      isLimitedNoChange: true,
      isFormNoChange: true,
      isMaximumNoChange: true,

      activeCollapse: this.projectType !== 'LAB_PROJECT' ? [] : ['4'],
      rules: {
        name: [{ required: true, message: this.$t('project.projectName_required') }, { validator: validateName }]
      },
      init: true,
      isQpmEnabled: false
    }
  },

  computed: {
    ...mapGetters(['selectTreeNode']),
    isSave() {
      return this.isFormNoChange && this.isLimitedNoChange && this.isMaximumNoChange
    },
    isRunNowDisabled() {
      return this.isQpmEnabled ? (!this.isActive || !this.isSameVersion) : true
    }
  },

  watch: {
    form: {
      handler: function(form) {
        const oriParams = JSON.parse(JSON.stringify(this.initForm))
        const curParams = JSON.parse(JSON.stringify(form))
        delete oriParams['is-qpm-auto-calc-enabled']
        delete curParams['is-qpm-auto-calc-enabled']
        this.isFormNoChange = isChangeObjorArr(curParams, oriParams)
        if (!this.isFormNoChange) {
          this.$store.dispatch('pageChange/pageChanged', { func: null, params: [] })
        } else {
          this.$store.dispatch('pageChange/resetPageChanged')
        }
      },
      deep: true
    },
    isLimited(limited) {
      this.isLimitedNoChange = limited === this.initIsLimited
    },
    maximum(num) {
      this.isMaximumNoChange = num === this.initMaximum
    }
  },

  mounted() {
    const _this = this
    if (this.selectTreeNode) {
      this.getProjectDetail()
    }
    // The listening subscription event is emitted
    eventListener.on('projectSelected', function(active) {
      if (_this.selectTreeNode && active === 'details') {
        _this.getProjectDetail()
      }
    })
  },

  beforeDestroy() {
    eventListener.remove('projectSelected')
  },

  activated() {
    if (this.init) {
      this.init = false
    } else {
      if (this.selectTreeNode && this.selectTreeNode.data.name !== this.initForm.name) {
        this.getProjectDetail()
      }
    }
  },

  deactivated() {
    if (this.$store.getters.isPageChanged) {
      const isLogin = getIsLogin() ? JSON.parse(getIsLogin()) : false
      if (!this.isSave && isLogin && ((this.projectType === 'LAB_PROJECT' && this.$route.path === '/lab') || (this.projectType !== 'LAB_PROJECT' && this.$route.path === '/projects'))) {
        this.$message.warning(this.$t('warningNoSave'))
      }
    }
  },

  methods: {

    onLimitedChange(e) {
      if (!e.target.value) {
        this.maximum = 0
      }
    },

    // get project details
    getProjectDetail() {
      this.loading = true
      const selectTreeNode = this.selectTreeNode && this.selectTreeNode.data
      getProjectDetail({ domain: selectTreeNode['domain-name'], project: selectTreeNode.name }).then(data => {
        this.loading = false
        for (const key in this.form) {
          this.form[key] = data.project[key]
        }

        this.form['db-type'] = data.project['db-type'] === DATABASE_TYPE.MSSQL ? this.$t('MS-SQL') : this.$t('Oracle')
        this.dbType = data.project['db-type']
        this.form['has-vcs-db'] = data.project['has-vcs-db'] ? 1 : 0
        this.form['is-unicode'] = data.project['is-unicode'] ? this.$t('project.Y') : this.$t('project.N')
        this.isLimited = data.project['users-quota'] !== -1

        if (isSiteAdmin()) {
          this.form['maintenance-state'] = data.project['maintenance-state'] ? data.project['maintenance-state'] : ''
        }

        if (this.isLimited) {
          this.maximum = data.project['users-quota']
        } else {
          this.maximum = 0
        }

        // get linked
        this.getLinked(data.project['is-template'], data.project['domain-name'], data.project.name)
        this.initForm = JSON.parse(JSON.stringify(this.form))

        this.initIsLimited = this.isLimited

        this.getDbInfo(`{name[${data.project['db-server-name']}];type[${data.project['db-type']}]}`)

        eventEmitter.emit('updateProjectNode', data.project) // if the details are updated, update the tree
      }).catch(e => {
        this.loading = false
      }).finally(() => {
        this.isFormNoChange = this.isLimitedNoChange = this.isMaximumNoChange = true
        if (this.isNotDeniedFeature(['QUALITY_PROJECT_MANAGEMENT'])) {
          getQPMStatus()
            .then(res => {
              this.isQpmEnabled = !!res?.['qpm-settings']?.['is-qpm-enabled']
              if (this.isQpmEnabled === false && this.form['is-qpm-auto-calc-enabled'] === true) {
                this.calculationChange(false, false)
              }
            })
            .catch(console.log)
        }
      })
      getSearchLanguage({ domain: selectTreeNode['domain-name'], project: selectTreeNode.name }).then(data => {
        this.searchLanguageList = data['search-languages']['search-language'] ? (Array.isArray(data['search-languages']['search-language']) ? data['search-languages']['search-language'] : [data['search-languages']['search-language']]) : []
      }).catch(() => {})
    },

    getDbInfo(params) {
      getAllDbServers(params).then(data => {
        this.isTextSearchEnabled = data['db-servers']['db-server']['is-text-search-enabled']
      }).catch(() => {})
    },

    restoreProject() {
      this.$refs.projectForm.$children[0].resetFields()
      this.getProjectDetail()
    },

    onSearchLanguage() {
      this.$mfConfirm({
        message: this.$t('project.enableSearchLanguageConfirm'),
        onConfirm: () => {
          const selectTreeNode = this.selectTreeNode && this.selectTreeNode.data
          return rebuildTextSearch({ domain: selectTreeNode['domain-name'], project: selectTreeNode.name }).then(() => {
            this.$message.success(this.$t('project.enableSearchLanguageSuccess'))
          }).catch(() => {

          })
        }
      })
    },

    // change db password
    onChangePassword() {
      this.projectIsActive(true).then(() => {
        this.$refs.changePassword.onShow()
      })
    },

    onTestConnection() {
      const selectTreeNode = this.selectTreeNode && this.selectTreeNode.data
      const isLabProject = this.form.name === USER_PROJECTS.LabProject
      this.projectIsActive(true, isLabProject).then(() => {
        this.$refs.testConnetion.onShow({
          connection: this.form['db-connstr-format'],
          name: this.form['db-server-name'],
          type: this.dbType,
          'domain-name': selectTreeNode['domain-name'],
          project: selectTreeNode.name
        })
      })
    },

    onChangeConnectionOk(connstr) {
      this.form['db-connstr-format'] = connstr
      this.initForm['db-connstr-format'] = connstr
    },

    // calculation
    onCalculationChange() {
      if (!this.form['is-qpm-auto-calc-enabled']) {
        this.$mfConfirm({
          message: this.$t('project.confirmDailyCalculations'),
          onConfirm: () => {
            return this.calculationChange(false)
          },
          onCancelChange: () => {
            this.form['is-qpm-auto-calc-enabled'] = true
          }
        })
      } else {
        return this.calculationChange(true)
      }
    },

    calculationChange(flag, showMessage = true) {
      this.calculating = true
      const selectTreeNode = this.selectTreeNode && this.selectTreeNode.data
      return updateProject({
        domain: selectTreeNode['domain-name'],
        project: selectTreeNode.name,
        data: {
          'is-qpm-auto-calc-enabled': flag
        }
      }).then(data => {
        this.form['is-qpm-auto-calc-enabled'] = data.project['is-qpm-auto-calc-enabled']
        this.initForm['is-qpm-auto-calc-enabled'] = data.project['is-qpm-auto-calc-enabled']
        showMessage && this.$message.success(flag ? this.$t('project.calculationEnableSuccessfully') : this.$t('project.calculationDisableSuccessfully'))
      }).catch(() => {
      }).finally(() => {
        this.calculating = false
      })
    },

    handlerRepo() {
      this.cleaning = true
      const selectTreeNode = this.selectTreeNode && this.selectTreeNode.data
      if (this.form['smart-repository-gc-last-run-time'] === 0) {
        postponeRepoGc({ domain: selectTreeNode['domain-name'], project: selectTreeNode.name }).then(() => {
          this.updateAttr('smart-repository-gc-last-run-time')
        }).catch(() => {
          this.cleaning = false
        })
      } else {
        promoteRepoGc({ domain: selectTreeNode['domain-name'], project: selectTreeNode.name }).then(() => {
          this.updateAttr('smart-repository-gc-last-run-time')
        }).catch(() => {
          this.cleaning = false
        })
      }
    },

    updateAttr(attr) {
      const selectTreeNode = this.selectTreeNode && this.selectTreeNode.data
      getProjectDetail({ domain: selectTreeNode['domain-name'], project: selectTreeNode.name }).then(data => {
        this.form[attr] = data.project[attr]
        this.initForm[attr] = data.project[attr]
      }).catch(() => {
      }).finally(() => {
        this.cleaning = false
      })
    },

    sendAutoMail() {
      this.sending = true
      const selectTreeNode = this.selectTreeNode && this.selectTreeNode.data

      autoMail({
        'domain-name': selectTreeNode['domain-name'],
        name: selectTreeNode.name
      }).then(() => {
        this.sending = false
      }).catch(() => {
        this.sending = false
      })
    },

    runNow() {
      this.running = true
      const selectTreeNode = this.selectTreeNode && this.selectTreeNode.data
      runNow({ domain: selectTreeNode['domain-name'], project: selectTreeNode.name }).then(data => {
        this.$message.success(this.$t('project.runNowSuccessfully'))
      }).catch(() => {
      }).finally(() => {
        this.running = false
      })
    },

    updateQualityInsight(qisCanBeEnabled, qisIsEnabled) {
      this.form['qis-can-be-enabled'] = qisCanBeEnabled
      this.form['qis-is-enabled'] = qisIsEnabled

      this.initForm['qis-can-be-enabled'] = qisCanBeEnabled
      this.initForm['qis-is-enabled'] = qisIsEnabled
    }
  }
}
</script>
<style scoped lang="less" >
@media (min-width: 1600px) {
  .project-form [class~='ant-col'] > div {
    min-height: 45px;
    line-height: 45px !important;
  }
}

.mf-padding-bt-65 {
  padding-bottom: 64px;
}
</style>

<style lang="less">
@import "~@/styles/variables.less";

.mf-project-tool{
  height: 64px;
  padding: 16px 24px;
  background: #fff;
  position: absolute;
  bottom: -64px;
  left: 0;
  right: 0;
  border-top: 1px solid #DCDEDF;
  text-align: right;
}
.connection{
  display: flex;
  flex-wrap: wrap;
}
.mf-spin{
  height: calc(100vh - 222px);

  .ant-spin-container{
    height: 100%;
  }
}
.mf-spin-lab.mf-spin-lab-op {
  height: calc(100vh - 265px - 61px + 45px);
}

.main-has-customer{
  .mf-spin{
    height: calc(100vh - 260px);
  }
  .mf-spin-lab {
    height: calc(100vh - 260px - 61px);
  }
}
.description-form-item .ant-form-item-label, .description-form-item .ant-form-item-control-wrapper{
  width: 100%;
}
.mf-project-form-item{
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-bottom: 24px;

  .mf-project-form-label{
    color: rgba(0, 0, 0, 0.55);
  }
}

.mf-form-item-16span{
  display: flex;

  .ant-form-item-label{
    width: 20.44444445%;
  }

  .ant-form-item-control-wrapper{
    flex: 1;
  }
}

@media (min-width: 966px){
  .mf-form-item-24span{
    .ant-form-item-label{
      width: 41.66666667%;
    }
  }
  .mf-form-item-16span{
    .ant-form-item-label{
      width: 41.66666667%;
    }
  }
}
@media (min-width: 1200px){
  .mf-form-item-24span,.mf-form-item-16span{
    .ant-form-item-label{
      width: 20.44444445%;
    }
  }
}
@media (min-width: 1600px){
  .mf-form-item-24span{
    .ant-form-item-label{
      width: 13.44444445%;
    }
  }
}

.mf-project-detail-panel{
  height: 100%;
  overflow: auto;
  padding: 0 24px;
}
</style>
