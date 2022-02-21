<template>
  <div style="width: 100%">
    <mf-alert class="alert" type="info" :message="$t('Note_Extensions_enabled')" />

    <div class="mf-project-content">
      <mf-form
        ref="emptyProjectDetails"
        class="project-form"
        layout="inline"
      >
        <a-form-model-item :label="$t('project.from_project')" prop="'create-from-project'">
          <a-input id="cp_adproject_projectName" v-model.trim="form['create-from-project']" disabled />
        </a-form-model-item>

        <a-form-model-item :label="$t('project.inDomain')" prop="'create-from-domain'">
          <a-input id="cp_adproject_inDomain" v-model.trim="form['create-from-domain']" disabled />
        </a-form-model-item>

      </mf-form>

      <a-table
        id="selectProjectTable"
        :loading="loading"
        :default-expand-all-rows="true"
        :expanded-row-keys.sync="expandedRowKeys"
        :columns="columns"
        :data-source="options"
        :pagination="false"
        :row-selection="rowSelection()"
        :scroll="{y: 245}"
        size="small"
      />
    </div>
  </div>
</template>

<script>
import MfAlert from '@/components/MFAlert'
// import { mapGetters } from 'vuex'
import { getCopyOptions } from '@/api/project.js'

export default {
  components: { MfAlert },

  props: {
    props: {
      type: Object,
      default: () => {}
    },

    createType: {
      type: Number,
      default: 1
    },

    formData: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      options: [],

      loading: false,

      form: {
        'create-from-project': '',
        'create-from-domain': '',
        'copy-options': {},
        copySelected: [],
        ...this.formData
      },

      columns: Object.freeze([
        {
          title: this.$t('project.select_all'),
          dataIndex: 'name',
          key: 'mapping-relation'
        }
      ]),

      selectedRowKeys: [],
      selectedRows: [],

      extensions: [],
      expandedRowKeys: [],

      defaultChecked: [],

      isSelectAll: false
    }
  },

  watch: {
    formData(val) {
      this.form = {
        ...this.form,
        ...this.formData
      }
    }
  },

  activated() {
    this.getCopyOptionsByProject()
  },

  methods: {
    async validate() {
      try {
        const different = this.selectedRowKeys.filter(x => !this.defaultChecked.includes(x))
        if (this.selectedRowKeys.length === 0 || different.length === 0) {
          this.$message.warning(this.$t('project.please_select_one_item'))
          return { continue: false }
        } else {
          if (this.isSelectAll) {
            this.form['copy-options'] = { 'copy-all': '' }
          } else {
            this.selectedRowKeys.forEach(item => {
              this.form['copy-options'][item] = ''
            })
          }
          this.form.copySelected = this.selectedRows
          return { continue: true, data: this.form }
        }
      } catch (e) {
        return { continue: false }
      }
    },

    getCopyOptionsByProject() {
      this.loading = true
      getCopyOptions({ domain: this.form['create-from-domain'], project: this.form['create-from-project'] })
        .then(res => {
          this.loading = false
          const options = res['copy-options']['copy-option']
          const copyOptions = Array.isArray(options) ? options : [options]
          this.$nextTick(function() {
            this.options = this.initOptionsTree(copyOptions)
          })
        }).catch(() => {
          this.options = []
          this.loading = false
        })
    },

    onSelectionChange(selectedRowKeys, selectedRows) {
      this.selectedRows = selectedRows
      this.selectedRowKeys = selectedRowKeys
    },

    onSelect(record, isSelected) {
      const checked = []

      this.getDependencyOptions(this.options, record.name, checked, isSelected)
      this.checkEnableDenpendency(this.options)

      if (isSelected) {
        const set = new Set([...this.selectedRowKeys, ...checked, record.key])
        this.selectedRowKeys = [...set]
      }
    },

    rowSelection() {
      return {
        getCheckboxProps: record => ({
          props: {
            disabled: record.disabled // Column configuration not to be checked
          }
        }),
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectionChange,
        onSelect: this.onSelect,
        onSelectAll: (isSelected) => {
          this.isSelectAll = isSelected
          this.$nextTick(function() {
            this.checkEnableDenpendency(this.options, isSelected)
          })
        }
      }
    },

    getDependencyOptions(data, name, checkedKeys, isSelected) {
      data.forEach(item => {
        if (item.checkList && name) {
          const dependency = item.checkList.includes(name)

          if (dependency && isSelected) {
            checkedKeys.push(item.key)
            this.selectedRows.push(item)
          }
        }

        if (item.children) {
          this.getDependencyOptions(item.children, name, checkedKeys, isSelected)
        }
      })

      if (data[0].key === 'copy-all') {
        this.options = [...data]
      }
    },

    checkEnableDenpendency(data, isSelected) {
      data.forEach(item => {
        if (item.enabledList) {
          if (this.selectedRows.find(i => item.enabledList.includes(i.name))) {
            item.disabled = false

            if (isSelected) {
              this.selectedRowKeys.push(item.key)
            }
          } else {
            const index = this.selectedRowKeys.findIndex(i => i === item.key)
            if (index > -1) {
              this.selectedRowKeys.splice(index, 1)
            }
            item.disabled = true
          }
        }
        if (item.children) {
          this.checkEnableDenpendency(item.children, isSelected)
        }
      })
      if (data[0].key === 'copy-all') {
        this.options = [...data]
      }
    },

    initOptions() {
      const arr = []
      this.options = this.initOptionsTrees(this.options, arr)
      this.selectedRowKeys = this.selectedRowKeys.filter(it => !arr.includes(it))
    },

    initOptionsTree(tree) {
      if (!tree.length) return
      return tree.map(item => {
        if (item['checked-status']) {
          this.selectedRowKeys.push(item['mapping-relation'] || item.name)
          this.defaultChecked.push(item['mapping-relation'] || item.name)
        }
        const node = {
          name: item.name,
          key: item['mapping-relation'] || item.name,
          disabled: !item['enable-status'],
          originalDisabled: !item['enable-status'],
          data: item
        }
        if (item['dependency-check-list']) {
          node.checkList = this.returnArray(item['dependency-check-list'])
        }
        if (item['dependency-enable-list']) {
          node.enabledList = this.returnArray(item['dependency-enable-list'])
        }
        if (item['children-list']) {
          node.children = this.initOptionsTree(this.returnArray(item['children-list']))
          this.expandedRowKeys.push(item['mapping-relation'])
        } else {
          !item['parent-name'] && this.extensions.push(item.name)
        }
        return node
      })
    },

    initOptionsTrees(tree, deleteArr) {
      return tree.map(item => {
        if (item.enabledList) {
          deleteArr.push(item.key)
        }
        const node = { ...item, disabled: item.originalDisabled }
        node.children = node.children && this.initOptionsTrees(node.children, deleteArr)
        return node
      })
    },

    returnArray(arr) {
      return Array.isArray(arr) ? arr : [arr]
    }
  }
}
</script>

<style lang="less" scoped>
.mf-project-content{
  padding: 0 24px 0 24px;
  .project-form{
    margin: 8px 0;
  }
}
</style>
