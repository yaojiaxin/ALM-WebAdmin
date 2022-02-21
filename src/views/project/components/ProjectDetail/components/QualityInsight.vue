<template>
  <a-button
    id="project-quality-insight-btn"
    class="mf-btn-dashed"
    :disabled="!qisCanBeEnabled || isCreateProcess || !isSameVersion"
    @click="onChangeQualityInsight"
  >
    {{
      qisIsEnabled
        ? $t('project.disableQualityInsight')
        : $t('project.enableQualityInsight')
    }}
  </a-button>
</template>

<script>
import { enableQualityInsight, disableQualityInsight } from '@/api/project'
import { mapGetters } from 'vuex'

export default {
  props: {
    qisCanBeEnabled: {
      type: Boolean,
      default: false
    },
    qisIsEnabled: {
      type: Boolean,
      default: false
    },
    isCreateProcess: {
      type: Boolean,
      default: false
    },
    isSameVersion: {
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
    onChangeQualityInsight() {
      const toggleStatus = this.qisIsEnabled
        ? disableQualityInsight
        : enableQualityInsight

      this.$mfConfirm({
        message: this.qisIsEnabled
          ? this.$t('project.disabledQualityInsightConfirm')
          : this.$t('project.enableQualityInsightConfirm'),
        onConfirm: () =>
          toggleStatus(this.selectNode['domain-name'], this.selectNode.name)
            .then(res => {
              this.$emit(
                'update:qualityInsight',
                res.project['qis-can-be-enabled'],
                res.project['qis-is-enabled']
              )

              if (res.project['qis-can-be-enabled']) {
                this.$message.success(this.$t(
                  res.project['qis-is-enabled']
                    ? 'project.enableQualityInsightSuccessfully'
                    : 'project.disableQualityInsightSuccessfully'
                ))
              }
            })
            .catch(console.log)
      })
    }
  }
}
</script>

<style></style>
