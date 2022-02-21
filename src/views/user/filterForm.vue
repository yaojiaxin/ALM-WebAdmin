<template>
  <a-form-model
    id="users-management_filterfrom"
    ref="filterFrom"
    layout="inline"
    label-align="left"
    :class="['users-management_filterfrom', {filterfrom_dis: isShowFilter }]"
    :model="newFilterInfoFrom"
  >
    <a-row :gutter="24" class="filter-row">
      <a-col :sm="12" :lg="12" :xl="12" :xxl="6">
        <a-form-model-item :label="$t('userManagement.UserName')" prop="name">
          <a-input
            id="users-management_filterfrom_name"
            v-model="newFilterInfoFrom.name"
          />
        </a-form-model-item>
      </a-col>
      <a-col :sm="12" :lg="12" :xl="12" :xxl="6">
        <a-form-model-item
          :label="$t('userManagement.FullName')"
          prop="fullName"
        >
          <a-input
            id="users-management_filterfrom_fullname"
            v-model="newFilterInfoFrom.fullName"
          />
        </a-form-model-item>
      </a-col>
      <a-col :sm="12" :lg="12" :xl="12" :xxl="6">
        <a-form-model-item
          :label="$t('userManagement.Email')"
          prop="email"
        >
          <a-input
            id="users-management_filterfrom_email"
            v-model="newFilterInfoFrom.email"
          />
        </a-form-model-item>
      </a-col>
      <a-col :sm="12" :lg="12" :xl="12" :xxl="6">
        <a-form-model-item
          :label="$t('userManagement.activationStatus')"
          prop="isActive"
        >
          <mf-select
            id="users-management_filterfrom_active"
            v-model="newFilterInfoFrom.isActive"
          >
            <a-select-option id="select_active_id" value="1">
              {{ $t('userManagement.Active') }}
            </a-select-option>
            <a-select-option id="select_notactive_id" value="0">
              {{ $t('userManagement.Not_Active') }}
            </a-select-option>
          </mf-select>
        </a-form-model-item>
      </a-col>
    </a-row>

    <a-row :gutter="24" class="filter-row">
      <a-col :sm="12" :lg="12" :xl="12" :xxl="6">
        <a-form-model-item :label="$t('userManagement.locked')" prop="locked">
          <mf-select
            id="users-management_filterfrom_locked"
            v-model="newFilterInfoFrom.locked"
          >
            <a-select-option id="users-management_active_3" value="1"> {{ $t('userManagement.Locked') }} </a-select-option>
            <a-select-option id="users-management_active_4" value="0"> {{ $t('userManagement.Unlock') }} </a-select-option>
          </mf-select>
        </a-form-model-item>
      </a-col>
      <a-col :sm="12" :lg="12" :xl="12" :xxl="6">
        <a-form-model-item
          :label="$t('userManagement.autoDeactivationDate')"
          prop="expireDate"
        >
          <mf-date-picker
            id="users-management_filterfrom_date"
            v-model="newFilterInfoFrom.expireDate"
          />
        </a-form-model-item>
      </a-col>
      <a-col :sm="12" :lg="12" :xl="12" :xxl="6">
        <a-form-model-item
          :label="$t('userManagement.role')"
          prop="role"
        >
          <mf-select
            id="users-management_filterfrom_role"
            v-model="newFilterInfoFrom.role"
          >
            <a-select-option v-for="item in role" :id="item['role-id']" :key="item['role-id']" :value="item['role-id']">
              {{ item['role-name'] }}
            </a-select-option>
          </mf-select>
        </a-form-model-item>
      </a-col>
      <a-col :sm="12" :lg="12" :xl="12" :xxl="6">
        <a-form-model-item
          :label="$t('userManagement.authenticationPolicy')"
          prop="policy"
        >
          <mf-select
            id="users-management_filterfrom_Policy"
            v-model="newFilterInfoFrom.policy"
          >
            <a-select-option v-for="item in policy" :id="item['policy-id']" :key="item['policy-id']" :value="item['policy-id']"> {{ item['policy-name'] }} </a-select-option>

          </mf-select>
        </a-form-model-item>
      </a-col>
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
      <a-button id="users-management_filterfrom_fbtn" type="primary" @click="filterUser">
        {{ $t("filter") }}
      </a-button>
    </a-form-model-item>
  </a-form-model>
</template>

<script>
import moment from 'moment'
import { getRoles } from '@/api/role'

export default {

  props: {
    isShowFilter: {
      type: Boolean,
      default: true
    },
    // role: {
    //   type: Array,
    //   default: () => []
    // },
    policy: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      role: [],
      isSearch: false,

      filterInfoFrom: {
        name: '',
        fullName: '',
        email: '',
        isActive: undefined,
        locked: undefined,
        expireDate: null,
        role: undefined,
        policy: undefined
      },
      newFilterInfoFrom: {
        name: '',
        fullName: '',
        email: '',
        isActive: undefined,
        locked: undefined,
        expireDate: null,
        role: undefined,
        policy: undefined
      }
    }
  },
  updated() {
    this.onShowBadge()
  },

  created() {
    this.getRoleList()
  },

  methods: {
    onResetFilterFrom() {
      this.isSearch = false
      this.$refs.filterFrom.resetFields()
      this.filterInfoFrom = JSON.parse(JSON.stringify(this.newFilterInfoFrom))
      this.$emit('filterUser')
    },
    filterUser() {
      this.isSearch = false
      this.filterInfoFrom = JSON.parse(JSON.stringify(this.newFilterInfoFrom))
      this.onFilterUser()
    },
    setSearch(value) {
      this.filterInfoFrom = {
        name: '',
        fullName: '',
        email: '',
        isActive: undefined,
        locked: undefined,
        expireDate: null,
        role: undefined,
        policy: undefined
      }
    },
    onFilterUser() {
      if (this.isSearch) {
        this.$emit('getUsersList', false)
      } else {
        this.onFilterUsers()
      }
    },

    onFilterUsers() {
      const filterData = {}
      const today = moment(new Date()).format('YYYY-MM-DD')
      this.filterInfoFrom.name.trim() ? filterData.name = '*' + this.filterInfoFrom.name + '*' : delete filterData.name
      this.filterInfoFrom.fullName.trim() ? filterData['full-name'] = '*' + this.filterInfoFrom.fullName + '*' : delete filterData['full-name']
      this.filterInfoFrom.email.trim() ? filterData.email = '*' + this.filterInfoFrom.email + '*' : delete filterData.email
      if (this.filterInfoFrom.isActive !== undefined) {
        this.filterInfoFrom.isActive === '1' ? filterData['is-active'] = 'Y' : filterData['is-active'] = 'N'
      }
      if (this.filterInfoFrom.locked !== undefined) {
        this.filterInfoFrom.locked === '1' ? filterData['is-locked'] = `>='${today}'` : filterData['is-locked'] = `<'${today}' OR ''`
      }

      this.filterInfoFrom.expireDate ? filterData['expire-date'] = moment(this.filterInfoFrom.expireDate).format('YYYY-MM-DD') : delete filterData['expire-date']
      this.filterInfoFrom.role ? filterData.role = { 'role-id': this.filterInfoFrom.role } : delete filterData.role
      this.filterInfoFrom.policy ? filterData.policy = { 'policy-id': this.filterInfoFrom.policy } : delete filterData.policy

      this.$emit('filterUser', filterData)
      this.newFilterInfoFrom = JSON.parse(JSON.stringify(this.filterInfoFrom))
    },
    onShowBadge() {
      if (!this.newFilterInfoFrom.name.trim() && !this.newFilterInfoFrom.fullName.trim() && !this.newFilterInfoFrom.email.trim() &&
      !this.newFilterInfoFrom.isActive && !this.newFilterInfoFrom.locked && !this.newFilterInfoFrom.expireDate &&
      !this.newFilterInfoFrom.role && !this.newFilterInfoFrom.policy) {
        this.$parent.changeBadgeStatus(false)
      } else {
        this.$parent.changeBadgeStatus(true)
      }
    },

    getRoleList() {
      getRoles().then(data => {
        const roles = data.roles && data.roles.role

        this.role = Array.isArray(roles) ? roles : [roles]
      })
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
    // border-radius: 3px;
    margin-top: 24px;
    padding: 24px;
    padding-bottom: 0px;
    transition: all 2s;
    border: 1px solid rgba(101, 102, 104, 0.15);
    box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);

    .ant-form-item {
      width: 100%;
      margin-right: 0;

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
    max-width: 125px;
  }

  .ant-form-item-label > label::after{
    margin: 0;
  }

  .filter-row .ant-form-item-control-wrapper{
      width: calc(100% - 125px);
    //  min-width: 150px;

      .ant-input-affix-wrapper .ant-input:not(:last-child){
        padding-right: 11px;
      }
    }
}
</style>
