<template>
  <div class="mf-display-inherit">
    <icon-btn
      id="a-icon-delete"
      icon-style="icon-delete"
      :icon-title="$t('Delete')"
      :is-disabled="isDisabled"
      style="width: 20px !important; "
      @onClick="onDelete"
    />
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import { getProjectsInDomains, deleteProjectDomain, deleteProject } from '@/api/project'
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
    ...mapGetters(['selectTreeNode'])
  },

  methods: {
    onDelete() {
      if (this.selectTreeNode.level === 1) { // delete domain
        getProjectsInDomains(this.selectTreeNode.data.name).then(res => {
          if (res.projects && res.projects.project) {
            this.$message.error(this.$t('project.DeleteDomainHasProject', { domain: this.selectTreeNode.data.name }))
          } else {
            this.$mfConfirm({
              message: this.$t('project.delete_domain_message', { name: this.selectTreeNode.data.name }),
              onConfirm: () => { return this.removeDomain(this.selectTreeNode.data) }
            })
          }
        })
      } else if (this.selectTreeNode.level === 3) { // delete project
        this.$mfConfirm({
          message: this.$t(this.selectTreeNode.data['is-template'] ? 'project.delete_template_message' : 'project.delete_project_message', { name: this.selectTreeNode.data.name }),
          onConfirm: () => { return this.removeProject(this.selectTreeNode.data) }
        })
      }
    },

    removeDomain(data) {
      return deleteProjectDomain(data.name).then(() => {
        this.$store.commit('project/SET_SELECTTREENODE', null)
        this.$emit('refresh')
        this.$message.success(this.$t('project.deleteDomainSuccess'))
      })
    },

    removeProject(data) {
      return deleteProject({ domain: data['domain-name'], project: data.name }).then(() => {
        this.$emit('refresh')
        this.$message.success(this.$t('project.deleteProjectSuccess'))
      })
    }
  }
}
</script>

<style scoped>

</style>
