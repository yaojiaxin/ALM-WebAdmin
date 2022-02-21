<template>
  <div class="mf-step-content step-form">
    <mf-form
      ref="customization"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :model="form"
      :rules="rules"
      style="width: 100%"
    >

      <a-form-model-item class="mf-subtitle">
        {{ isProject ? $t('project.select_template_title') : ( props.type === 'template' ? $t('project.select_project_title') : $t('project.select_template_title')) }}
      </a-form-model-item>

      <a-form-model-item :label="$t('Domain')" prop="create-from-domain" :label-col="{span:8}" :wrapper-col="{span:16}">
        <mf-select id="copy_domain" v-model="form['create-from-domain']" :allow-clear="false" @select="onDomainSelected">
          <a-select-option v-for="item in domainList" :key="item.id" :value="item.name">
            {{ item.name }}
          </a-select-option>
        </mf-select>
      </a-form-model-item>

      <a-form-model-item v-if="props.type === 'project'" :label="$t('Template')" prop="create-from-project" :label-col="{span:8}" :wrapper-col="{span:16}">
        <mf-select id="copy_template" v-model="form['create-from-project']" :allow-clear="false" @change="onTemplateSelected">
          <a-select-option v-for="item in templateList" :key="item.id" :value="item.name">
            {{ item.name }}
          </a-select-option>
        </mf-select>
      </a-form-model-item>

      <a-form-model-item v-else :label="$t('Project')" prop="create-from-project" :label-col="{span:8}" :wrapper-col="{span:16}">
        <mf-select id="copy_project" v-model="form['create-from-project']" :allow-clear="false" @change="onProjectSelected">
          <a-select-option v-for="item in projectList" :key="item.id" :value="item.name">
            {{ item.name }}
          </a-select-option>
        </mf-select>
      </a-form-model-item>

      <a-form-model-item v-if="creationType === 'project' || (creationType === 'template' && createType === 3)" class="link-to-selected-tem">
        <a-checkbox id="template-link" v-model="form.copyLinkChecked" @change="onChange">
          {{ props.type === 'project' ? $t('project.link_new_project_to_template'): $t('project.link_to_selected_tem') }}
        </a-checkbox>
      </a-form-model-item>
    </mf-form>
  </div>
</template>

<script>
// import { validSpecialCharact } from '@/utils/validate'
import { getProjectsInDomains } from '@/api/project'
import { mapGetters } from 'vuex'

export default {
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
    },

    // The creation type of the entire process
    creationType: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },

      templateList: [],
      projectList: [],
      // isLinked: true,

      form: {
        'create-from-domain': '',
        'create-from-project': '',
        copyLinkChecked: this.creationType === 'project' || (this.creationType === 'template' && this.createType === 3)
        // project: ''
      },

      rules: {
        'create-from-domain': [{ required: true, message: this.$t('project.create_project_customization_domain_required') }
          // { validator: validSpecialCharact }
        ],
        'create-from-project': [{
          required: true,
          message: this.isProject ? this.$t('project.projectName_required') : this.$t('project.create_template_customization_template_required')
        }]
      }

    }
  },

  computed: {
    ...mapGetters(['domainList', 'selectDomain']),

    isProject() {
      return this.props.type === 'project' && this.creationType === 'project'
    }
  },

  created() {
    const domain = this.selectDomain.name
    this.form['create-from-domain'] = domain
    this.getProjectList(domain)
  },

  methods: {
    onDomainSelected(domain) {
      this.form['create-from-project'] = ''
      this.getProjectList(domain)
    },

    onTemplateSelected(val) {
      this.form['create-from-project'] = val
      const findTemplate = this.templateList.find(i => i.name === val)
      this.form.copyIsActive = findTemplate ? findTemplate['is-active'] : false
      // this.getLinkedTemplate(this.form['create-from-domain'], this.form['create-from-project'])
    },

    onProjectSelected(val) {
      this.form['create-from-project'] = val
      this.form.copyIsActive = this.projectList.find(i => i.name === val)['is-active']
      // this.getLinkedTemplate(this.form['create-from-domain'], this.form['create-from-project'])
    },

    onChange(e) {
      this.form.copyLinkChecked = e.target.checked
    },

    getProjectList(domain) {
      getProjectsInDomains(domain).then(res => {
        let project = res.projects && res.projects.project

        if (project) {
          project = Array.isArray(project) ? project : [project]

          this.templateList = project.filter(it => it['is-template'] && it['project-type'] === 'Standard')
          this.projectList = project.filter(it => !it['is-template'] && it['project-type'] === 'Standard')

          if (this.props.type === 'project') {
            if (this.templateList.length > 0) {
              this.form['create-from-project'] = this.templateList[0].name
              this.form.copyIsActive = this.templateList[0]['is-active']
            } else {
              this.form['create-from-project'] = ''
            }
          } else {
            if (this.projectList.length > 0) {
              this.form['create-from-project'] = this.projectList[0].name
              this.form.copyIsActive = this.projectList[0]['is-active']
            } else {
              this.form['create-from-project'] = ''
            }
          }
        }
      }).catch(() => {
        this.templateList = []
        this.projectList = []
        this.form['create-from-project'] = ''
      })
    },

    async next() {
      try {
        const valid = await this.$refs.customization.$children[0].validate()

        // If link to template, set the parameter to be passed
        if (this.form.copyLinkChecked) {
          this.form['copy-options'] = { 'copy-customization': '1', 'link-to-template': true }
        } else {
          this.form['copy-options'] = { 'copy-customization': '1' }
        }

        if (valid) {
          return { continue: true, data: this.form }
        }
      } catch (e) {
        return { continue: false }
      }
    },

    async validate() {
      return this.next()
    }
  }
}
</script>

<style lang="less" scoped>
.step-form{
  /deep/ .link-to-selected-tem{
     .ant-form-item-control-wrapper{
      max-width: 420px;
      width: 100%;
    }
  }
}

</style>
