<template>
  <div class="mf-display-inherit">
    <icon-btn
      id="a-Icon-Project-Export"
      icon-style="icon-Project-Go"
      :icon-title="$t('project.ExportProjectToProject')"
      :is-disabled="isDisabled"
      @onClick="onExport"
    />
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import { exportProject } from '@/api/project'
import { mapGetters } from 'vuex'
import { showTaskReminder } from '@/utils'
import { eventEmitter } from '@/views/project/event'

export default {
  components: { IconBtn },
  props: {
    isDisabled: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters(['selectTreeNode'])
  },

  methods: {
    onExport() {
      const selectProject = this.selectTreeNode.data
      const isActive = selectProject['is-active']

      if (isActive) {
        this.$mfConfirm({
          message: this.$t('project.exportActivateProjectWarning'),
          iconType: 'Warning',
          onConfirm: () => {
            return this.$store.dispatch('project/deactiveProject', selectProject)
          },
          callback: () => this.exportProjectFile(true, isActive)
        })
      } else {
        this.exportProjectFile()
      }
    },

    // Export project file
    exportProjectFile(needActive = false, isOriginActive = false) {
      const selectProject = this.selectTreeNode.data

      // const hide = this.$message.success(this.$t('project.exportLoading', { name: selectProject.name }))
      exportProject({
        domain: selectProject['domain-name'],
        project: selectProject.name,
        isOriginActive: isOriginActive
      }).then(data => {
        // if (needActive) this.$store.dispatch('project/activeProject', selectProject)

        // hide.close()

        // this.$mfConfirm({
        //   id: 'project_sync_infomation',
        //   title: this.$t('Information'),
        //   iconType: 'Information',
        //   message: this.$t('operationInProcessWarning'),
        //   isShowCancel: false,
        //   confirmText: this.$t('OK')
        // })

        // show task reminder
        showTaskReminder(this.$store, true)

        eventEmitter.emit('projectSelected', 'details')
      }).catch(() => {
        // hide.close()
      })
    }
  }
}
</script>

<style>

</style>
