<template>
  <div>
    <mf-alert v-if="hasLinked" class="alert" type="info" :message="$t('NoteShowLinkChecked')" />

    <mf-form
      ref="emptyProjectDetails"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :model="form"
      :rules="rules"
      class="mf-step-content step-form"
      :style="{ height: hasLinked ? '330px' : '350px' }"
    >

      <a-form-model-item :label="props.type==='template'?$t('templateName'):$t('projectName')" prop="name">
        <a-input id="ep_name" v-model.trim="form.name" :max-length="30" class="name-input" />
      </a-form-model-item>

      <a-form-model-item :label="$t('project.inDomain')" prop="domain" style="height: 40px">
        <mf-select
          id="in_domain"
          v-model="form.domain"
          :allow-clear="false"
        >
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

      <a-row>
        <a-checkbox
          v-if="'showActive' in props && props.showActive"
          id="active-project"
          :checked="form['is-active']"
          @change="e => form['is-active'] = e.target.checked"
        >
          {{ props.type === 'project' ? $t('project.activate_project') : $t('project.activate_template') }}
        </a-checkbox>
      </a-row>

      <a-row>
        <a-checkbox
          v-if="'showVersion' in props && props.showVersion && isNotDeniedFeature(['VERSIONING'])"
          id="enable-versiong"
          :checked="form['has-vcs-db']"
          @change="e => form['has-vcs-db'] = e.target.checked"
        >
          {{ $t('project.enable_versioning') }}
        </a-checkbox>
      </a-row>

      <a-checkbox v-if="hasLinked" id="template-link" @change="onLinkedChange">
        {{ formData.hasLinked }}
      </a-checkbox>
    </mf-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { validateName } from '@/utils/validate'
import { getProjectsInDomains } from '@/api/project'
import MfAlert from '@/components/MFAlert/index'

export default {
  components: { MfAlert },
  props: {
    props: {
      type: Object,
      default: () => {}
    },

    createType: {
      type: Number,
      default: 1
    },

    formData: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      form: {
        domain: this.selectDomain ? this.selectDomain.name : '',
        name: '',
        'is-active': true,
        'has-vcs-db': false,
        ...this.formData
      },

      rules: {
        name: [{ required: true, message: this.props.type === 'project' ? this.$t('project.projectName_required') : this.$t('project.templateName_required') },
          { validator: validateName }
        ],
        domain: [{ required: true, message: this.$t('project.domain_name_required') }]
      },

      labelCol: { span: 10 },
      wrapperCol: { span: 14 }
    }
  },

  computed: {
    ...mapGetters({
      domains: 'domainList',
      selectDomain: 'selectDomain',
      selectTreeNode: 'selectTreeNode'
    }),

    hasLinked() {
      return !!(Object.prototype.hasOwnProperty.call(this.formData || {}, 'hasLinked') && this.formData.hasLinked)
    }
  },

  watch: {
    formData(val) {
      if (val) {
        this.form = {
          ...this.form,
          ...val
        }
      } else {
        this.form = {
          domain: this.selectDomain ? this.selectDomain.name : '',
          name: '',
          'is-active': true,
          'has-vcs-db': false
        }
      }
    }
  },

  created() {
    this.form.domain = this.selectTreeNode.level === 1 ? this.selectDomain.name : this.selectTreeNode.data['domain-name']

    if ('showActive' in this.props && this.props.showActive) {
      this.$set(this.form, 'is-active', true)
    }

    if ('showVersion' in this.props && this.props.showVersion) {
      this.$set(this.form, 'has-vcs-db', false)
    }
  },

  methods: {
    async validate() {
      try {
        let isValid = false
        const valid = await this.$refs.emptyProjectDetails.$children[0].validate()

        if (valid) {
        // Check whether the current domain has a project with the same name
          const res = await getProjectsInDomains(this.form.domain)
          const allProject = res.projects.project
          let isSame = false

          if (Array.isArray(allProject)) {
            isSame = Boolean(allProject.filter(it => String(it.name) === String(this.form.name)).length)
          } else {
            isSame = allProject ? String(allProject.name) === this.form.name : false
          }

          if (isSame && !(this.formData && this.formData['file-name'])) {
            this.$mfConfirm({
              title: this.$t('project.warning'),
              iconType: 'Warning',
              message: this.$t('project.name_already_exist', { type: 'project', name: this.form.name }),
              isShowCancel: false,
              confirmText: this.$t('OK')
            })
          } else {
            isValid = true
          }

          // create demo project
          if (this.createType === 5) {
            // eslint-disable-next-line no-template-curly-in-string
            this.form['create-from-domain'] = '${demo.domain}'
            // eslint-disable-next-line no-template-curly-in-string
            this.form['create-from-project'] = '${demo.project}'
            this.form['is-template'] = false
          }

          return { continue: isValid, data: { ...this.form, 'is-template': this.props.type === 'template' }}
        }
      } catch (e) {
        return { continue: false }
      }
    },

    async next() {
      return this.validate()
    },

    onLinkedChange(e) {
      this.form['copy-options'] = { ...this.formData['copy-options'], 'link-to-template': e.target.checked }
      this.form.copyLinkChecked = true
    }
  }
}
</script>

<style>

</style>
