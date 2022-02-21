<template>
  <mf-form
    ref="selectProject"
    :model="form"
    :rules="rules"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
    class="mf-step-content step-form"
  >

    <a-form-model-item class="mf-subtitle">
      {{ $t('project.select_project_title') }}
    </a-form-model-item>

    <a-form-model-item :label="$t('Domain')" prop="create-from-domain" :label-col="{span:8}" :wrapper-col="{span:16}">
      <mf-select id="copy_domain" v-model="form['create-from-domain']" :allow-clear="false" @select="onDomainChange">
        <a-select-option v-for="item in domainList" :key="item.id" :value="item.name">
          {{ item.name }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <a-form-model-item :label="$t('Project')" prop="create-from-project" :label-col="{span:8}" :wrapper-col="{span:16}">
      <mf-select id="copy_project" v-model="form['create-from-project']" :allow-clear="false" @select="onProjectChange">
        <a-select-option v-for="item in projectList" :key="item.id" :value="item.name">
          {{ item.name }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>
  </mf-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { getProjectListByDomain } from './utils'
import { getLinkedProject } from '@/api/project'

export default {
  props: {
    formData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },

      form: {
        'create-from-domain': '',
        'create-from-project': '',
        hasLinked: ''
      },

      rules: {
        'create-from-domain': [{ required: true, message: this.$t('project.domain_name_required') }],
        'create-from-project': [{ required: true, message: this.$t('project.projectName_required') }]
      },

      projectList: []
    }
  },

  computed: {
    ...mapGetters(['domainList', 'selectDomain'])
  },

  watch: {
    formData(val) {
      this.form = {
        ...this.form,
        ...this.formData
      }
    }
  },

  created() {
    const domain = this.selectDomain.name
    this.form['create-from-domain'] = domain

    this.getProjectList(domain)
  },

  methods: {
    onDomainChange(domain) {
      this.getProjectList(domain)
    },

    onProjectChange(val) {
      this.form['create-from-project'] = val
      this.form.copyIsActive = this.projectList.find(i => i.name === val)['is-active']
      this.getLinkedTemplate(this.form['create-from-domain'], this.form['create-from-project'])
    },

    getProjectList(domain) {
      getProjectListByDomain(domain).then(data => {
        this.projectList = data.filter(it => (it['project-type'] === 'Standard') && !it['is-template'])

        if (this.projectList.length > 0) {
          this.form['create-from-project'] = this.projectList[0].name
          this.form.copyIsActive = this.projectList[0]['is-active']
          this.getLinkedTemplate(domain, this.form['create-from-project'])
        } else {
          this.form['create-from-project'] = ''
        }
      })
    },

    getLinkedTemplate(domain, project) {
      getLinkedProject({ 'target-domain': domain, 'target-project': project, 'link-type': 'Template' }).then(res => {
        if (res['project-links']) {
          this.form.hasLinked = this.$t('project.Link_the_selected_project_copy_to_the_new_template',
            {
              domain: res['project-links']['project-link']['source-domain'],
              project: res['project-links']['project-link']['source-project']
            })
          this.form.copyFromDomain = res['project-links']['project-link']['source-domain']
          this.form.copyFromProject = res['project-links']['project-link']['source-project']
        } else {
          this.form.hasLinked = ''
          this.form.copyFromDomain = ''
          this.form.copyFromProject = ''
        }
      })
    },

    async validate() {
      try {
        const valid = await this.$refs.selectProject.$children[0].validate()

        if (valid) {
          return { continue: true, data: this.form }
        }
        return { continue: false }
      } catch (e) {
        return { continue: false }
      }
    }
  }
}
</script>

<style>

</style>
