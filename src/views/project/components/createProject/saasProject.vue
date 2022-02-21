<template>
  <creation
    ref="creation"
    :creation-step="isNotDeniedFeature(['IMPORT_TEMPLATE_PROJECT']) ? creationStep : creationStep.filter(item => item.value !== 2)"
    creation-type="project"
    :help-link="ADD_PROJECT"
    :title="$t('project.SelectToCreateANewProject')"
    :modal-title="$t('project.CreateProject')"
  />
</template>

<script>
import { ADD_PROJECT } from 'config/help.js'
import Creation from './components/Create'
import { CreateEmptyProject } from '@/api/project'

export default {
  components: { Creation },

  data() {
    return {
      ADD_PROJECT,
      creationStep: [{
        title: this.$t('project.create_project_saas_radio_first'),
        value: 5,
        runFuc: CreateEmptyProject,
        steps: [{
          name: this.$t('project.chooseType')
        }, {
          name: this.$t('project.addDetails'),
          component: 'ProjectForm',
          props: {
            type: 'project',
            showVersion: true,
            showActive: true
          }
        }]
      }, {
        title: this.$t('project.createAnEmptyProject'),
        value: 1,
        runFuc: CreateEmptyProject,
        steps: [{
          name: this.$t('project.chooseType')
        }, {
          name: this.$t('project.addDetails'),
          component: 'ProjectForm',
          props: {
            type: 'project',
            showVersion: true,
            showActive: true
          }
        }]
      }, {
        title: this.$t('project.createAProjectFromATemplate'),
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
            type: 'project',
            showVersion: true,
            showActive: true
          }
        }]
      }, {
        title: this.$t('project.createAProjectByCopyingDataFromAnExistingProject'),
        value: 3,
        runFuc: CreateEmptyProject,
        steps: [{
          name: this.$t('project.chooseType')
        }, {
          name: this.$t('project.SelectProject'),
          component: 'MultiStep',
          children: [{
            name: 'SelectProject'
          }, {
            name: 'CopyCustomization'
          }]
        }, {
          name: this.$t('project.addDetails'),
          component: 'ProjectForm',
          props: {
            type: 'project',
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
