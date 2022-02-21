<template>
  <div class="user-filter-panel">

    <a-form-model
      id="users-management_filterfrom"
      ref="filterFrom"
      layout="inline"
      label-align="left"
      :class="['users-management_filterfrom', {filterfrom_dis: isShowFilter }]"
      :model="filterForm"
    >
      <a-row :gutter="24" class="filter-row">
        <a-col :sm="12" :lg="12" :xl="8">
          <a-form-model-item :label="$t('userManagement.UserName')" prop="name">
            <a-input
              id="users-management_filterfrom_name"
              v-model="filterForm.name"
            />
          </a-form-model-item>
        </a-col>
        <a-col :sm="12" :lg="12" :xl="8">
          <a-form-model-item
            :label="$t('userManagement.FullName')"
            prop="fullName"
          >
            <a-input
              id="users-management_filterfrom_fullname"
              v-model="filterForm.fullName"
            />
          </a-form-model-item>
        </a-col>
        <a-col :sm="12" :lg="12" :xl="8">
          <a-form-model-item
            :label="$t('project.users.email')"
            prop="email"
          >
            <a-input
              id="users-management_filterfrom_email"
              v-model="filterForm.email"
            />
          </a-form-model-item>
        </a-col>
        <!--        <a-col :sm="12" :lg="12" :xl="8">-->
        <!--          <a-form-model-item-->
        <!--            :label="$t('project.users.group')"-->
        <!--            prop="groups"-->
        <!--          >-->
        <!--            <mf-select-->
        <!--              id="project_user_group"-->
        <!--              v-model="filterForm.groups"-->
        <!--              allow-clear-->
        <!--              style="width: 100%"-->
        <!--            >-->
        <!--              <a-select-option v-for="item in groups" id="select_active_id" :key="item['group-id']" :value="item['group-name']">-->
        <!--                <a-tooltip-->
        <!--                  :title=" item['group-name'] "-->
        <!--                >-->
        <!--                  {{ item['group-name'] }}-->
        <!--                </a-tooltip>-->

        <!--              </a-select-option>-->
        <!--            </mf-select>-->

        <!--          </a-form-model-item>-->
        <!--        </a-col>-->
      </a-row>
      <a-form-model-item class="users-management_filter_rowbtn">
        <a-button
          id="users-management_filterfrom_clearbtn"
          class="mf-btn-dashed"
          style="margin-right:8px"
          @click="onResetFilterFrom"
        >
          {{ $t("clear") }}
        </a-button>
        <a-button id="users-management_filterfrom_fbtn" type="primary" @click="onSearch">
          {{ $t("filter") }}
        </a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>

export default {
  name: 'FilterSearch',
  props: {
    groups: {
      type: Array,
      default: () => []
    },
    hasSearch: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isShowFilter: true,
      filterForm: {
        name: '',
        fullName: '',
        email: '',
        groups: undefined
      }
    }
  },

  computed: {
    isHasSearch() {
      if (this.filterForm.name || this.filterForm.fullName || this.filterForm.email) {
        return true
      } else {
        return false
      }
    }
  },

  watch: {
    isHasSearch(val) {
      this.$emit('update:hasSearch', val)
    }
  },

  methods: {
    onResetFilterFrom() {
      this.$refs.filterFrom.resetFields()
      this.$emit('onSearch', null)
    },

    onSearch() {
      const filterData = {}
      const query = []

      // this.filterForm.name.trim() ? filterData.name = '*' + this.filterForm.name + '*' : delete filterData.name
      // this.filterForm.fullName.trim() ? filterData['full-name'] = '*' + this.filterForm.fullName + '*' : delete filterData['full-name']
      // this.filterForm.email.trim() ? filterData.email = '*' + this.filterForm.email + '*' : delete filterData.email

      this.filterForm.name.trim() ? query.push(`name[*${this.filterForm.name}*]`) : delete filterData.name
      this.filterForm.fullName.trim() ? query.push(`full-name[*${this.filterForm.fullName}*]`) : delete filterData['full-name']
      this.filterForm.email.trim() ? query.push(`email[*${this.filterForm.email}*]`) : delete filterData.email
      // this.filterForm.groups.trim() ? query.push(`group.group-name[*${this.filterForm.groups}*]`) : delete filterData.groups
      //
      // const obj = filterData
      // for (const key in obj) {
      //   if (key === 'role') {
      //     query.push(`${key}.${Object.keys(obj[key])}[${Object.values(obj[key])}]`)
      //   } else {
      //     query.push(`${key}[${obj[key]}]`)
      //   }
      // }
      this.$emit('onSearch', `{${query.join(';')}}`)
    },

    onFilterClick() {
      this.isShowFilter = !this.isShowFilter
      this.$emit('onShowFilter', !this.isShowFilter)
    }
  }
}
</script>

<style lang="less" scoped>

.filterfrom_dis {
  display: none;
}

.users-management_filterfrom {
  background: #fff;
  width: 100%;
  padding: 0 24px 24px 24px;
  transition: all 2s;

  .ant-form-item {
    width: 100%;
    margin-right: 0;
  }
  /deep/ .ant-form-item-label-left{
    max-width: 150px;
  }

}
</style>
<style lang="less">
.users-management_filterfrom {

  .users-management_filter_rowbtn {
    text-align: right;
    .ant-col-16 {
      width: 100%;
    }
  }

  .ant-form-item-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 16px;
    //max-width: 150px;
  }

  .ant-form-item-label > label::after{
    margin: 0;
  }

  .filter-row .ant-form-item-control-wrapper{
    width: calc(100% - 155px);
    //  min-width: 150px;

    .ant-input-affix-wrapper .ant-input:not(:last-child){
      padding-right: 11px;
    }
  }
}
</style>
