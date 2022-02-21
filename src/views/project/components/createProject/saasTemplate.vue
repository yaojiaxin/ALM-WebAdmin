<template>
  <creation
    ref="creation"
    :creation-step="creationStep"
    creation-type="template"
    :help-link="CREATE_TEMPLATE"
    :title="$t('project.create_template_title')"
    :modal-title="$t('project.createTemplate')"
  />
</template>

<script>
import Creation from './components/Create'
import { CreateEmptyProject } from '@/api/project'
import { CREATE_TEMPLATE } from 'config/help.js'

export default {
  components: { Creation },

  data() {
    return {
      CREATE_TEMPLATE,
      creationStep: [{
        title: this.$t('project.createAnEmptyTemplate'),
        value: 1,
        runFuc: CreateEmptyProject,
        steps: [{
          name: this.$t('project.chooseType')
        }, {
          name: this.$t('project.addDetails'),
          component: 'ProjectForm',
          props: {
            type: 'template',
            showVersion: true,
            showActive: true,
            showExtention: true
          }
        }]
      }, {
        title: this.$t('project.create_template_choose_existing_template'),
        value: 2,
        runFuc: CreateEmptyProject,
        steps: [{
          name: this.$t('project.chooseType')
        }, {
          name: this.$t('project.Customization'),
          component: 'Customization',
          props: {
            type: 'project'
          }
        }, {
          name: this.$t('project.addDetails'),
          component: 'ProjectForm',
          props: {
            type: 'template',
            showVersion: true,
            showActive: true
          }
        }]
      }, {
        title: this.$t('project.create_template_choose_existing_project'),
        value: 3,
        runFuc: CreateEmptyProject,
        steps: [{
          name: this.$t('project.chooseType')
        }, {
          name: this.$t('project.SelectProject'),
          component: 'Customization',
          props: {
            type: 'template'
          }
        }, {
          name: this.$t('project.addDetails'),
          component: 'ProjectForm',
          props: {
            type: 'template',
            showVersion: true,
            showActive: true
          }
        }]
      }]
    }
  },

  methods: {
    show() {
      this.$refs.creation.show()
    }
  }
}
</script>

<style>

</style>
