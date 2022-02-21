<template>
  <div class="add-project-summary">
    <div class="mf-subtitle">{{ $t('project.summary_title', { database: form['db-type'] === 3 ? 'Oracle' : 'MS-SQL', type: props.type}) }}</div>
    <mf-form
      ref="emptyProjectsUMMARYs"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :model="form"
    >
      <div
        class="summery mf-box-shadow"
      >
        <a-form-model-item :label="props.type === 'project' ? $t('projectName') : $t('templateName')" prop="name">
          {{ form.name }}
        </a-form-model-item>

        <a-form-model-item :label="$t('project.on_domain')" prop="domain">
          {{ form.domain }}
        </a-form-model-item>

        <a-form-model-item :label="$t('project.on_server')" prop="dbServerName">
          {{ form['db-server-name'] }}
        </a-form-model-item>

        <a-form-model-item v-if="formData['db-type'] === 3 " :label="$t('project.on_tableSpace')" prop="tablespace">
          {{ form.tablespaceName }}
        </a-form-model-item>

        <a-form-model-item v-if="formData['db-type'] === 3 " :label="$t('project.temp_tableSpace')" prop="temp-tablespace">
          {{ form.tempTablespaceName }}
        </a-form-model-item>

        <!-- <a-form-model-item v-if="summaryInfo.isShowExtension&&summaryInfo.extensionsInfo&&summaryInfo.extensionsInfo.length" :label="$t('Extensions')" prop="extensions" class="extension">
          <span v-for="(item, index) in form.extensionsInfo" :key="index" style="margin-right: 10px">{{ item }}{{ index !== (form.extensionsInfo.length-1) ? ',' : '' }}</span>
        </a-form-model-item> -->

        <template v-if="props.type === 'project'">
          <a-form-model-item v-if="createType === 2" :label="$t('project.copy_customization_from_template')" prop="customizationFromTemplate">
            {{ form['create-from-domain'] }} \ {{ form['create-from-project'] }}
          </a-form-model-item>

          <a-form-model-item v-if="formData.copyLinkChecked" :label="$t('project.linked_to_template')" prop="linked_to_template">
            {{ form.copyFromDomain || form['create-from-domain'] }} \ {{ form.copyFromProject || form['create-from-project'] }}
          </a-form-model-item>

          <template v-if="createType === 3">
            <a-form-model-item :label="$t('project.from_project')" prop="copy_from">
              {{ form['create-from-domain'] }} \ {{ form['create-from-project'] }}
            </a-form-model-item>
            <a-form-model-item v-if="formData.copySelected" :label="$t('Copy')" prop="import_form">
              <span v-for="(value, key) in copyCustomization" :key="key">
                {{ `${key}(${value.map(i => i.name).join(',')})` }} <br>
              </span>
              <!-- {{ $t('project.Customization') }}() -->
              <!-- {{ $t('Extensions') }}({{ formData.copy.extension.join(', ') }}) -->
            </a-form-model-item>
          </template>

        </template>

        <template v-else>
          <a-form-model-item v-if="createType === 2" :label="$t('project.copy_customization_from_template')" prop="customizationFromTemplate">
            {{ form['create-from-domain'] }} \ {{ form['create-from-project'] }}
          </a-form-model-item>
          <a-form-model-item v-if="createType === 3" :label="$t('project.copy_customization_from')" prop="customizationFrom">
            {{ form['create-from-domain'] }} \ {{ form['create-from-project'] }}
          </a-form-model-item>
        </template>
        <a-form-model-item v-if="form['file-name']" :label="$t('project.import_form')" prop="import_form">
          {{ form['file-name'].name }}
        </a-form-model-item>

      </div>

      <a-form-model-item prop="is-active">
        <!-- <a-checkbox-group class="checkbox-group" :value="activateProject" @change="onActiveChange"> -->
        <a-row>
          <a-checkbox id="active-project" :checked="form['is-active']" @change="e => form['is-active'] = e.target.checked">
            {{ props.type === 'project' ? $t('project.activate_project') : $t('project.activate_template') }}
          </a-checkbox>
        </a-row>
        <a-row v-if="props.showVersion && isNotDeniedFeature(['VERSIONING'])">
          <a-checkbox id="enable-versiong" :checked="form['has-vcs-db']" @change="e => form['has-vcs-db'] = e.target.checked">
            {{ $t('project.enable_versioning') }}
          </a-checkbox>
        </a-row>
        <!-- </a-checkbox-group> -->
      </a-form-model-item>
    </mf-form>

  </div>
</template>

<script>
export default {
  props: {
    props: {
      type: Object,
      default: () => []
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
      labelCol: { span: 7 },
      wrapperCol: { span: 14 },

      form: {
        ...this.formData,
        'is-active': true,
        'has-vcs-db': false
      }
    }
  },

  computed: {
    copyCustomization() {
      if (this.form.copySelected) {
        return this.groupBy(this.form.copySelected, 'category')
      }
      return null
    }
  },

  watch: {
    formData(val) {
      this.form = { ...this.form, ...this.formData }
    }
  },

  methods: {
    onActiveChange(checkedValues) {
      this.activateProject = checkedValues
    },

    groupBy(arr, key) {
      const groups = {}

      arr.forEach(item => {
        const row = item.data
        const group = row[key]

        if (group in groups) {
          groups[group].push(row)
        } else {
          if (group) {
            groups[group] = []
            groups[group].push(row)
          } else if (!group && arr.filter(i => i.data[key] === row.name).length === 0) {
            groups[row.name] = []
            groups[row.name].push([])
          }
        }
      })

      return groups
    },

    async next() {
      // try {
      //   if (this.createType === 2 || this.createType === 3) { //  Create a project from a template

      //   } else {
      return { continue: true, data: { ...this.form, 'is-template': this.props.type === 'template' }}
      //   }
      // } catch (e) {
      //   console.log(e)
      // }
    }
  }
}
</script>

<style lang="less" scoped>
.add-project-summary{
  padding: 0 24px;

  .summery{
    margin-top: 10px;
    padding: 0 24px;
    border: 1px solid rgba(101, 102, 104, 0.16);
    overflow-y: auto;
    max-height: 260px;
  }

  .ant-form-item{
    margin-bottom: 0;
  }

  .checkbox-group{
    margin-top: 24px;
    line-height: 1.1;
    .ant-row{
      margin-bottom: 22px;
    }
  }
}
</style>
