<template>
  <div class="mf-display-inherit">
    <icon-btn
      v-if="isActive"
      id="project-inactive"
      icon-style="icon-deactive"
      :icon-title="$t('project.Deactivate Project')"
      :is-disabled="isDisabled"
      @onClick="onToggleStatus"
    />
    <icon-btn
      v-else
      id="project-active"
      icon-style="icon-Project-ActivateProject"
      :icon-title="$t('project.Activate Project')"
      :is-disabled="isDisabled"
      @onClick="onToggleStatus"
    />
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import { mapGetters } from 'vuex'

export default {
  components: {
    IconBtn
  },
  props: {
    isDisabled: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters(['selectTreeNode']),
    isActive: function() {
      return this.selectNode['is-active']
    },

    selectNode() {
      return this.selectTreeNode ? this.selectTreeNode.data : {}
    }
  },

  methods: {
    deactive() {
      this.$store.dispatch('project/deactiveProject', this.selectNode)
    },

    active() {
      this.$store.dispatch('project/activeProject', this.selectNode)
    },

    onToggleStatus() {
      if (this.isActive) {
        this.$mfConfirm({
          title: this.$t('warning'),
          iconType: 'Warning',
          message: this.$t(this.selectNode['project-type'] === 'LabManagement' ? 'project.deactivateProjectLab' : 'project.deactivateProject', { name: this.selectNode.name }),
          onConfirm: () => { return this.$store.dispatch('project/deactiveProject', this.selectNode) }
        })
      } else {
        this.active()
      }
    }
  }
}
</script>

<style>

</style>
