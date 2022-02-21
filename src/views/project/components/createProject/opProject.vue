<template>
  <creation
    ref="creation"
    :creation-step="creationStep"
    creation-type="project"
    :help-link="ADD_PROJECT"
    :title="$t('project.SelectToCreateANewProject')"
    :modal-title="$t('project.CreateProject')"
    @refresh="$emit('refresh')"
  />
</template>

<script>
import { ADD_PROJECT } from 'config/help.js'
import Creation from './components/Create'
import { CreateEmptyProject, createImportQCPProject } from '@/api/project'
import { SERVER_TYPE } from '@/store/const'
import { mapGetters } from 'vuex'

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
          component: 'MultiStep',
          props: {
            type: 'project'
          },
          children: [{
            name: 'ProjectForm'
          }, {
            name: 'ProjectDatabase'
          }]
        }, {
          name: this.$t('project.Summary'),
          component: 'Summary',
          props: {
            type: 'project',
            showVersion: true
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
          component: 'MultiStep',
          props: {
            type: 'project'
          },
          children: [{
            name: 'ProjectForm'
          }, {
            name: 'ProjectDatabase'
          }]
        }, {
          name: this.$t('project.Summary'),
          component: 'Summary',
          props: {
            type: 'project',
            showVersion: true
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
          component: 'MultiStep1',
          props: {
            type: 'project'
          },
          children: [{
            name: 'ProjectForm'
          }, {
            name: 'ProjectDatabase'
          }]
        }, {
          name: this.$t('project.Summary'),
          component: 'Summary',
          props: {
            type: 'project',
            showVersion: false
          }
        }]
      }, {
        title: this.$t('project.createAProjectByImportingDataFromAnExistingProjectFile'),
        value: 4,
        runFuc: createImportQCPProject,
        steps: [{
          name: this.$t('project.chooseType')
        }, {
          name: this.$t('selectFile'),
          component: 'SelectFile',
          props: {
            type: 'project'
          }
        }, {
          name: this.$t('project.addDetails'),
          component: 'MultiStep',
          props: {
            type: 'project'
          },
          children: [{
            name: 'ProjectForm'
          }, {
            name: 'ProjectDatabase'
          }]
        }, {
          name: this.$t('project.Summary'),
          component: 'Summary',
          props: {
            type: 'project',
            showVersion: false
          }
        }]
      }]
    }
  },

  computed: {
    ...mapGetters(['serverType'])
  },

  created() {
    if (!this.isNotDeniedFeature(['IMPORT_TEMPLATE_PROJECT'])) {
      this.creationStep = this.creationStep.filter(item => item.value !== 2)
    }
    if (!this.isNotDeniedFeature(['IMPORT_PROJECT'])) {
      this.creationStep = this.creationStep.filter(item => item.value !== 4)
    }
    if (SERVER_TYPE.Saas !== this.serverType) {
      this.creationStep = this.creationStep.filter(item => item.value !== 5)
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
