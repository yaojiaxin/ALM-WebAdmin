<template>
  <creation
    ref="creation"
    :creation-step="creationStep"
    creation-type="project"
    :show-choose-type="false"
    :help-link="IMPORT_PROJECT"
    :modal-title="$t('ImportProject')"
    @refresh="$emit('refresh')"
  />
</template>

<script>
import Creation from '../createProject/components/Create'

import { IMPORT_PROJECT } from 'config/help.js'
import { createImportQCPProject } from '@/api/project'

export default {
  components: { Creation },

  data() {
    return {
      IMPORT_PROJECT,

      creationStep: [{
        value: 1,
        runFuc: createImportQCPProject,
        steps: [{
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

  methods: {
    show() {
      this.$refs.creation.show()
    }
  }
}
</script>
