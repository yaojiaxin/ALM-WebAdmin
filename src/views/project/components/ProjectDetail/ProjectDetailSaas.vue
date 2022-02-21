<template>
  <a-spin :spinning="loading" class="mf-spin" :class="{'mf-padding-bt-65': updateAble}">

    <div class="mf-project-detail-panel">
      <!-- project database -->
      <div class="mf-subtitle mf-margin-b-24">{{ $t('customers.general') }}</div>
      <mf-form
        ref="projectForm"
        layout="horizontal"
        :model="form"
        class="mf-margin-l-14"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        :rules="rules"
      >
        <a-row :gutter="16">
          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-model-item :label="$t('Domain')">
              <mf-select id="domain-list" v-model="form['domain-name']" :allow-clear="false" :disabled="isCreateProcess||!updateAble">
                <a-select-option v-for="item in domainList" :key="item.id" :value="item.name" :title="item.name">
                  {{ item.name }}
                </a-select-option>
              </mf-select>
            </a-form-model-item>
          </a-col>

          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
            <a-form-model-item :label="$t('projectName')" prop="name">
              <a-tooltip
                v-if="isCreateProcess||!updateAble"
                placement="topLeft"
                :title="form.name"
              >
                <span>
                  <a-input id="project-name-with-tooltip" v-model.trim="form.name" :max-length="30" :disabled="isCreateProcess||!updateAble" />
                </span>
              </a-tooltip>
              <a-input v-else id="project-name" v-model.trim="form.name" :max-length="30" :disabled="isCreateProcess||!updateAble" />
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
        </a-row>

        <!-- project database -->
        <div class="mf-subtitle mf-margin-b-24" style="margin-left: -14px">
          {{ selectNodeType === 'project' ? $t('project.ProjectDatabase') : $t('project.TemplateDatabase') }}
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

          <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
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
        </a-row>

        <a-collapse v-model="activeCollapse" class="mf-collapse" style="margin: 0 -24px 0 -38px;">

          <!--          <a-collapse-panel key="1">-->
          <!--            <template slot="header">-->
          <!--              <span id="global-search" class="mf-subtitle">{{ $t('project.globalSearch') }}</span>-->
          <!--            </template>-->
          <!--            <a-form-model-item>-->
          <!--              <global-search :global-status.sync="globalSearchStatus" />-->
          <!--            </a-form-model-item>-->
          <!--          </a-collapse-panel>-->

          <!-- Quality Insight -->
          <a-collapse-panel key="1">
            <template slot="header">
              <span id="project-quality-insight-title" class="mf-subtitle">{{ $t('project.qualityInsight') }}</span>
            </template>

            <quality-insight
              :qis-can-be-enabled="form['qis-can-be-enabled']"
              :qis-is-enabled="form['qis-is-enabled']"
              :is-same-version="isSameVersion"
              @update:qualityInsight="updateQualityInsight"
            />
          </a-collapse-panel>

          <a-collapse-panel key="2">
            <template slot="header">
              <span class="mf-subtitle">{{ $t('project.miscellaneous') }}</span>
            </template>

            <a-form-model-item class="mf-flex-formitem">
              <a-checkbox id="send-email-automatically" v-model="form['is-auto-mail-enabled']" :disabled="isCreateProcess||!updateAble"> {{ $t('project.sendEmailAutomatically') }} </a-checkbox>
            </a-form-model-item>

            <a-form-model-item v-if="selectNodeType === 'project'" :label="$t('project.linkedToTemplate')" class="mf-flex-formitem fix-width">
              {{ linkedTemplate }}
            </a-form-model-item>
            <a-form-model-item v-if="selectNodeType === 'template'" :label="$t('project.linkProject')" class="mf-flex-formitem fix-width">
              {{ linkedNumber }}
            </a-form-model-item>

            <a-form-model-item :label="$t('userManagement.Description')" class="description-form-item">
              <a-textarea id="description-textarea" v-model="form.description" :auto-size="{ minRows: 2}" :disabled="isCreateProcess||!updateAble" />
            </a-form-model-item>
            <!--            <div class="mf-project-form-item">-->
            <!--              <label class="mf-project-form-label ant-form-item-label">{{ $t('userManagement.Description') }}</label>-->
            <!--              <div class="mf-project-form-content">-->
            <!--                <a-textarea id="description-textarea" v-model="form.description" :auto-size="{ minRows: 2}" :disabled="isCreateProcess||!updateAble" />-->
            <!--              </div>-->
            <!--            </div>-->
          </a-collapse-panel>

        </a-collapse>
      </mf-form>
    </div>

    <div v-if="updateAble" class="mf-project-tool">
      <a-button id="project-restore" :disabled="isDisabled || submitting" style="margin-right: 8px;" class="mf-btn-dashed" @click="restoreProject"> {{ $t('Restore') }} </a-button>
      <a-button id="project-save" :disabled="isDisabled" type="primary" :loading="submitting" @click="onSaveProject"> {{ $t('Save') }} </a-button>
    </div>
  </a-spin>
</template>

<script>
import { getProjectDetail } from '@/api/project'
import { eventListener, eventEmitter } from '../../event'
import { DATABASE_TYPE, PROJECT_STATUS } from '@/store/const'
import QualityInsight from './components/QualityInsight'
import projectMixin from './model/projectDetail'
import { isChangeObjorArr } from '@/utils'
import { getIsLogin } from '@/utils/auth'
import { validateName } from '@/utils/validate'

export default {
  inject: {
    projectTree: {
      default: ''
    }
  },
  name: 'ProjectDetailSaas',
  components: { QualityInsight },
  mixins: [projectMixin],
  props: {
    isCreateProcess: {
      type: Boolean,
      default: false
    },
    isSameVersion: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      PROJECT_STATUS,
      form: {
        name: '',
        'domain-name': '',
        'db-type': '',
        'db-name': '',
        'db-server-name': '',
        'create-from-project': '',
        'create-from-domain': '',
        'has-vcs-db': undefined,
        description: '',
        status: '',
        'is-auto-mail-enabled': false,
        'qis-can-be-enabled': false,
        'qis-is-enabled': false
      },
      // isActive: false,
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      loading: false,
      oldName: '',
      isDeactive: false,
      initForm: {},
      activeCollapse: [1, 2],
      rules: {
        name: [{ required: true, message: this.$t('project.projectName_required') }, { validator: validateName }]
      },
      init: true
    }
  },

  watch: {
    form: {
      handler: function(form) {
        this.isDisabled = isChangeObjorArr(form, this.initForm)
        if (!this.isDisabled) {
          this.$store.dispatch('pageChange/pageChanged', { func: null, params: [] })
        } else {
          this.$store.dispatch('pageChange/resetPageChanged')
        }
      },
      deep: true
    }
  },

  created() {
    const _this = this
    // The listening subscription event is emitted
    this.getProjectDetail()
    eventListener.on('projectSelected', function(active) {
      if (active === 'details') {
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
      if (!this.isDisabled && this.$route.path === '/projects' && isLogin) {
        this.$message.warning(this.$t('warningNoSave'))
      }
    }
  },

  methods: {
    // get project details
    getProjectDetail() {
      this.loading = true
      const selectTreeNode = this.selectTreeNode.data
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

        // get linked
        this.getLinked(data.project['is-template'], data.project['domain-name'], data.project.name)
        this.initForm = JSON.parse(JSON.stringify(this.form))

        eventEmitter.emit('updateProjectNode', data.project) // if the details are updated, update the tree
      }).catch(e => {
        this.loading = false
      }).finally(() => {
        this.isDisabled = true
      })
    },
    restoreProject() {
      this.$refs.projectForm.$children[0].resetFields()
      this.getProjectDetail()
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

<style scoped lang="less">
@media (min-width: 1600px) {
  .mf-margin-l-14 [class~='ant-col'] > div {
    min-height: 45px;
    line-height: 45px !important;
  }
}
</style>
