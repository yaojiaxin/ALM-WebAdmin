<template>
  <div class="mf-display-inherit">
    <icon-btn
      id="a-Icon-Project-Remove"
      icon-style="icon-Project-Remove"
      :icon-title="$t('project.RemoveProject')"
      :is-disabled="isDisabled"
      @onClick="onRemove"
    />
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import { removetProject } from '@/api/project'
import { eventEmitter } from '../event'
import { mapGetters } from 'vuex'

export default {
  components: { IconBtn },
  props: {
    isDisabled: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters(['selectTreeNode']),

    selectNode() {
      return this.selectTreeNode.data
    }
  },

  methods: {
    onRemove() {
      const selectProject = this.$store.state.project.selectTreeNode.data
      this.$mfConfirm({
        message: this.$t(selectProject['project-type'] === 'LabManagement' ? 'project.removeLabConfirm' : 'project.removeConfirm', { name: selectProject.name }),
        onConfirm: this.onDeActive
      })
    },

    // Determine whether the project has been deactivated. If not, deactivate the project first
    onDeActive() {
      const selectProject = this.$store.state.project.selectTreeNode.data

      if (selectProject['is-active']) {
        this.$mfConfirm({
          message: this.$t(selectProject['project-type'] === 'LabManagement' ? 'project.deactivateProjectLabBeforeRemove' : 'project.deactivateProject', { name: selectProject.name }),
          title: this.$t('warning'),
          iconType: 'Warning',
          onConfirm: () => {
            return this.$store.dispatch('project/deactiveProject', this.selectNode)
          },
          callback: () => {
            return this.removeProjectFile({
              domain: selectProject['domain-name'],
              project: selectProject.name
            })
          }
        })
      } else {
        return this.removeProjectFile({
          domain: selectProject['domain-name'],
          project: selectProject.name
        })
      }
    },

    // remove project
    removeProjectFile() {
      const selectProject = this.$store.state.project.selectTreeNode.data
      return removetProject({
        domain: selectProject['domain-name'],
        project: selectProject.name
      }).then(() => {
        this.$message.success(this.$t('project.removeSuccess'))
        this.$emit('refresh')
        eventEmitter.emit('removeProjectNode', { 'domain-name': selectProject['domain-name'], name: selectProject.name })
      }).catch(() => {
      })
    }
  }
}
</script>

<style>

</style>
