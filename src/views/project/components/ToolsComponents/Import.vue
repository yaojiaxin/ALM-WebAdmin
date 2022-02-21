<template>
  <div class="mf-display-inherit">
    <icon-btn
      id="a-icon-import"
      :icon-title="$t('project.ImportProjectFromProjectFile')"
      :is-disabled="false"
      icon-style="icon-Project-Back"
      @onClick="onImportProject"
    />

    <project-import ref="projectImport" @result="onGetResultList" @refresh="$emit('refresh')" />
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import ProjectImport from '../ProjectImport/index'
export default {
  name: 'Import',
  components: { IconBtn, ProjectImport },
  data() {
    return {
      visible: false
    }
  },

  methods: {
    onImportProject() {
      this.$refs.projectImport.show()
    },
    onGetResultList(list) {
      this.$emit('result', list)
    }
  }
}
</script>

<style scoped>
</style>
