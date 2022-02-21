<template>
  <div class="mf-display-inherit">
    <icon-btn
      id="a-icon-AddTemplate"
      :is-disabled="false"
      :icon-title="$t('project.createTemplate')"
      icon-style="icon-Project-CreateTemplate"
      class="mf-icon-margin-right-0"
      @onClick="showCreateModal"
    >
      <span slot="btnName" class="btn-name">{{ $t('project.createTemplate') }}</span>
    </icon-btn>
    <create-template-site v-if="isSiteAdmin()" ref="createTemplateSite" />
    <create-template-saas v-else ref="createTemplateSite" />
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
// import createTemplateSite from '../../components/createTemplate/site'
import createTemplateSite from '../../components/createProject/opTemplate'
// import createTemplateSaas from '../../components/createTemplate/saas'
import createTemplateSaas from '../../components/createProject/saasTemplate'
import { isSiteAdmin } from '@/utils/permission'
export default {
  name: 'CreateTemplate',
  components: { IconBtn, createTemplateSite, createTemplateSaas },
  methods: {
    showCreateModal() {
      this.$parent.createProjectLimit(() => {
        this.$refs.createTemplateSite.show()
      })
    },
    isSiteAdmin
  }
}
</script>

<style scoped>

</style>
