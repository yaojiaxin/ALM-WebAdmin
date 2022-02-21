<template>
  <mf-ag-grid
    :columns="columns"
    :data-source="projectList"
    :height="350"
    :row-selection.sync="rowSelection"
    :is-row-selectable="isRowSelectable"
    size="small"
  />
</template>

<script>
import { mapGetters } from 'vuex'
import MfAgGrid from '@/components/MFTable/AgGrid/grid'
import { getProjectsInDomains } from '@/api/project'

export default {
  components: { MfAgGrid },

  props: {
    sql: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {

      projectList: [],

      rowSelection: [],

      columns: Object.freeze([{
        dataIndex: 'name',
        title: this.$t('userManagement.PROJECTNAME'),
        type: 'checkbox',
        checkboxSelection: (params) => {
          return params.data.status !== 'Maintenance'
        }
      }, {
        dataIndex: 'status',
        title: this.$t('userManagement.userToolBar.STATUS')
      }, {
        dataIndex: 'version',
        title: this.$t('project.VERSION')
      }])
    }
  },

  computed: {
    ...mapGetters(['selectTreeNode'])
  },

  watch: {
    rowSelection(val) {
      this.$emit('update:rowSelection', val)
    }
  },
  methods: {
    isRowSelectable(node) {
      return node.data.status !== 'Maintenance'
    },

    getProjects() {
      const data = this.selectTreeNode.data

      getProjectsInDomains(data.name).then(res => {
        if (res.projects && res.projects.project) {
          let list = res.projects.project
          list = Array.isArray(list) ? list : [list]
          list = list.filter(i => i['project-type'] !== 'LabManagement')

          if (this.sql) {
            this.projectList = list.filter(i => i['db-type'] === 2 && !i['is-unicode'])
          } else {
            this.projectList = list
          }
        }
      })
    }
  }
}
</script>

<style>

</style>
