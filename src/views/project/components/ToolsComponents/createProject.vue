<template>
  <div class="mf-display-inherit">
    <icon-btn
      id="a-icon-addProject"
      :is-disabled="false"
      :icon-title="$t('project.CreateProject')"
      icon-style="icon-Project-CreateProject"
      class="mf-icon-margin-right-0"
      @onClick="showCreateModal"
    >
      <span slot="btnName" class="btn-name">{{ $t('project.CreateProject') }}</span>
    </icon-btn>
    <create-project-site v-if="isSiteAdmin()" ref="createProjectSite" @refresh="$emit('refresh')" />
    <!-- <create-project v-if="isSiteAdmin()" ref="create" /> -->
    <create-project-sass v-else ref="createProjectSite" />
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import createProjectSite from '../../components/createProject/opProject'
// import CreateProject from '../../components/createProject/op'
// import createProjectSass from '../../components/addEmptyProject/sass'
import createProjectSass from '../../components/createProject/saasProject'
import { isSiteAdmin } from '@/utils/permission'
export default {
  name: 'CreateProject',
  components: { IconBtn, createProjectSite, createProjectSass },
  methods: {
    showCreateModal() {
      this.$parent.createProjectLimit(() => {
        this.$refs.createProjectSite.show()
      })
    },
    isSiteAdmin
  }
}
</script>

<style scoped>

</style>
