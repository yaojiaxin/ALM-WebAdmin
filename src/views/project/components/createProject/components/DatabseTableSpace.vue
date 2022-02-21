<template>
  <mf-form
    ref="tableSpaceForm"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
    :model="form"
    :rules="rules"
    class="mf-step-content step-form"
  >
    <a-form-model-item :label="$t('project.create_in_tableSpace')" prop="tablespace" style="height: 40px">

      <mf-select id="ep_tableSpace" v-model="form.tablespace" :allow-clear="false" :loading="tableLoading" @select="onTableSpaceChange">
        <a-select-option v-for="item in tableData" :key="item.key" :value="item.key">
          {{ item.name }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <a-form-model-item :label="$t('project.temporary_tableSpace')" prop="temp-tablespace" style="height: 40px">

      <mf-select id="ep_tTSpace" v-model="form['temp-tablespace']" :allow-clear="false" :loading="tableLoading" @select="onTempChange">
        <a-select-option v-for="item in tempTableData" :key="item.key" :value="item.key">
          {{ item.name }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>
  </mf-form>
</template>

<script>
import { getTableSpaces } from '@/api/project'

export default {
  props: {
    props: {
      type: Object,
      default: () => {}
    },

    formData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      tableLoading: false,

      form: {
        tablespace: '',
        'temp-tablespace': ''
      },

      rules: {
        tablespace: [{ required: true, message: this.$t('project.create_in_ableSpace_required') }],
        'temp-tablespace': [{ required: true, message: this.$t('project.temporary_tableSpace_required') }]
      },

      labelCol: { span: 10 },
      wrapperCol: { span: 14 },

      tempTableData: [],
      tableData: []
    }
  },

  activated() {
    this.getTableSpaceByDB()
  },

  methods: {
    async getTableSpaceByDB() {
      try {
        this.tableLoading = true
        let tableSpaces = await getTableSpaces(this.formData.dbServerId, this.formData['db-admin-pass'] ? {
          'admin-user': this.formData['db-admin-user'],
          'admin-password': this.formData['db-admin-pass']
        } : undefined).then(res => res.tablespaces.tablespace)
        this.tableLoading = false

        tableSpaces = Array.isArray(tableSpaces) ? tableSpaces : [tableSpaces]

        const temp = tableSpaces.filter(it => it['is-temp'])
        const pro = tableSpaces.filter(it => !it['is-temp'])

        this.tempTableData = temp.map(it => {
          return {
            ...it,
            key: it.name,
            name: it['free-space'] ? `${it.name} (${it['free-space']} Mb ${this.$t('project.free')})` : it.name
          }
        })
        this.tableData = pro.map(it => {
          return {
            ...it,
            key: it.name,
            name: it['free-space'] ? `${it.name} (${it['free-space']} Mb ${this.$t('project.free')})` : it.name
          }
        })

        this.form.tablespace = this.tableData.length && this.tableData[0].key
        this.form.tablespaceName = this.tableData.length && this.tableData[0].name
        this.form['temp-tablespace'] = this.tempTableData.length && this.tempTableData[0].key
        this.form.tempTablespaceName = this.tempTableData.length && this.tempTableData[0].name
      } catch (e) {
        this.tempTableData = []
        this.tableData = []
        this.tableLoading = false
      }
    },

    onTableSpaceChange(val, option) {
      this.form.tablespaceName = this.tableData.find(i => i.key === val).name
    },

    onTempChange(val) {
      this.form.tempTablespaceName = this.tableData.find(i => i.key === val).name
    },

    async validate() {
      try {
        const valid = await this.$refs.tableSpaceForm.$children[0].validate()

        return { continue: valid, data: this.form }
      } catch (e) {
        return { continue: false }
      }
    }
  }
}
</script>

<style>

</style>
