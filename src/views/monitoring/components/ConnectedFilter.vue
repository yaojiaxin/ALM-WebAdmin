<template>
  <!-- filter form -->
  <a-form-model
    ref="filterForm"
    class="mf-filter-form mf-margin-b-24"
    layout="inline"
    label-align="left"
    :model="filterInfoForm"
  >

    <!-- domain name -->
    <a-row :gutter="24" class="filter-row">
      <a-col :sm="12" :lg="12" :xl="6">
        <a-form-model-item :label="$t('domainName')" prop="domainName">
          <a-input
            id="filter-domainname"
            v-model="filterInfoForm.domainName"
          />
        </a-form-model-item>
      </a-col>

      <!-- project name -->
      <a-col :sm="12" :lg="12" :xl="6">
        <a-form-model-item :label="$t('projectName')" prop="projectName">
          <a-input
            id="filter-projectname"
            v-model="filterInfoForm.projectName"
          />
        </a-form-model-item>
      </a-col>

      <!-- user name -->
      <a-col :sm="12" :lg="12" :xl="6">
        <a-form-model-item :label="$t('monitoring.User_Name')" prop="userName">
          <a-input
            id="filter-username"
            v-model="filterInfoForm.userName"
          />
        </a-form-model-item>
      </a-col>

      <!-- host -->
      <a-col :sm="12" :lg="12" :xl="6">
        <a-form-model-item :label="$t('monitoring.Host')" prop="host">
          <a-input
            id="filter-host"
            v-model="filterInfoForm.host"
          />
        </a-form-model-item>
      </a-col>

      <!-- client type -->
      <a-col :sm="12" :lg="12" :xl="6">
        <a-form-model-item :label="$t('monitoring.Client_Type')" prop="clientType">
          <a-input
            id="filter-cleinttype"
            v-model="filterInfoForm.clientType"
          />
        </a-form-model-item>
      </a-col>
    </a-row>

    <div class="mf-filter-form-btns">
      <a-button
        id="filter-clear"
        class="mf-btn-dashed"
        @click="onClearFilter"
      >
        {{ $t("clear") }}
      </a-button>
      <a-button id="filter-filter" :disabled="filterDisable" type="primary" @click="onFilterFunc">
        {{ $t("filter") }}
      </a-button>
    </div>

  </a-form-model>
</template>

<script>

export default {
  props: {
    isShow: {
      type: Boolean,
      default: true
    },
    filterDisable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      filterInfoForm: {
        domainName: '',
        projectName: '',
        userName: '',
        host: '',
        clientType: ''
      }
    }
  },

  updated() {
    this.onShowBadge()
  },
  methods: {
    onClearFilter() {
      this.resetFilter()
      this.$emit('filterConnect')
    },

    resetFilter() {
      this.$refs.filterForm.resetFields()
    },

    // if user set filters but not click Filter btn
    // restore filter form to the form that lask click generated
    restoreFilter(filterForm) {
      const restoreForm = {}

      restoreForm.domainName = filterForm.domain ? filterForm.domain.slice(1, -1) : ''
      restoreForm.projectName = filterForm.project ? filterForm.project.slice(1, -1) : ''
      restoreForm.userName = filterForm.username ? filterForm.username.slice(1, -1) : ''
      restoreForm.host = filterForm.host ? filterForm.host.slice(1, -1) : ''
      restoreForm.clientType = filterForm['client-type'] ? filterForm['client-type'].slice(1, -1) : ''

      this.filterInfoForm = restoreForm
    },

    onFilterFunc() {
      const filterData = {}
      this.filterInfoForm.domainName ? filterData.domain = '*' + this.filterInfoForm.domainName + '*' : delete filterData.domain
      this.filterInfoForm.projectName ? filterData.project = '*' + this.filterInfoForm.projectName + '*' : delete filterData.project
      this.filterInfoForm.userName ? filterData.username = '*' + this.filterInfoForm.userName + '*' : delete filterData.username
      this.filterInfoForm.host ? filterData.host = '*' + this.filterInfoForm.host + '*' : delete filterData.host
      this.filterInfoForm.clientType ? filterData['client-type'] = '*' + this.filterInfoForm.clientType + '*' : delete filterData['client-type']
      this.$emit('filterConnect', filterData)
    },
    onShowBadge() {
      if (!this.filterInfoForm.domainName && !this.filterInfoForm.projectName && !this.filterInfoForm.userName &&
      !this.filterInfoForm.host && !this.filterInfoForm.clientType) {
        this.$parent.changeBadgeStatus(false)
      } else {
        this.$parent.changeBadgeStatus(true)
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
