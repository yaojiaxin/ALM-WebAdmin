<template>
  <mf-modal
    :visible="visible"
    :width="800"
    :title="$t('userManagement.AddProjects')"
    :confirm-loading="loading"
    :next-disabled="isCanSave"
    @cancel="onClose"
    @ok="onOk"
  >
    <template v-if="visible">
      <mf-transfer
        ref="transfer"
        type="tree"
        :datas="domainList"
        :table-columns="transferColumns"
        :exclude="excludeProject"
        :is-show-template="false"
        :locale-option="{
          itemUnit: $t('userManagement.SELECTEDPROJECTS'),
          itemsUnit: $t('userManagement.ALLPROJECTS')
        }"
        @selected="onSelected"
      />
    </template>
  </mf-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { addLinkedProject } from '@/api/project'
import { getLinkedByType } from '../ProjectDetail/model/utils'

export default {
  props: {
    excludeProject: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      visible: false,
      loading: false,

      selectedProjects: [],

      transferColumns: Object.freeze([
        {
          title: `${this.$t('DOMAIN')}`,
          dataIndex: 'domain'
        },
        {
          title: `${this.$t('PROJECT')}`,
          dataIndex: 'title'
        }
      ])
    }
  },

  computed: {
    ...mapGetters(['domainList', 'selectTreeNode']),

    // The button is not clickable when no data is selected
    isCanSave: function() {
      return this.selectedProjects.length === 0
    }
  },

  methods: {
    onShow() {
      this.visible = true
    },

    addLink(params) {
      return addLinkedProject({
        'project-links': {
          'project-link': params
        }
      }).then(data => {
        this.loading = false
        this.visible = false
        this.selectedProjects = []
        this.$refs.transfer.onRestTransfer()
        this.$message.success(this.$t('project.linkedProjectSuccess'))
        this.$emit('onAdded')
      }).catch(() => {
        this.loading = false
      })
    },

    async onOk() {
      if (this.selectedProjects.length > 0) {
        const selectTemplate = this.selectTreeNode.data
        const hasLinkedProject = []
        const params = []

        this.loading = true

        try {
          for (let i = 0; i < this.selectedProjects.length; i++) {
            const currProject = this.selectedProjects[i]
            const res = await getLinkedByType(false, currProject.domain, currProject.title)

            // Check whether the currently selected project is linked to another template
            if (res !== 'N/A') {
              hasLinkedProject.push(`${currProject.domain}/${currProject.title}`)
            }

            params.push({
              'link-type': 'Template',
              'target-domain': currProject.domain,
              'target-project': currProject.title,
              'source-domain': selectTemplate['domain-name'],
              'source-project': selectTemplate.name
            })
          }

          if (hasLinkedProject.length > 0) {
            this.$mfConfirm({
              title: this.$t('confirm'),
              message: this.$t('project.unlink_from_template_confirm', { linked: hasLinkedProject.join(',') }),
              onConfirm: () => {
                return this.addLink(params)
              },
              onCancelChange: () => {
                this.loading = false
              },
              onCloseChange: () => {
                this.loading = false
              }
            })
          } else {
            this.addLink(params)
          }
        } catch (e) {
          this.loading = false
        }
      }
    },

    onClose() {
      this.$refs.transfer.onRestTransfer()
      this.selectedProjects = []
      this.visible = false
    },

    onSelected(value) {
      this.selectedProjects = value
    }
  }
}
</script>

<style>

</style>
