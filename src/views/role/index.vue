<template>
  <div class="mf-flex flex-columns mf-box-shadow mf-role-panel">
    <div class="mf-title-panel">

      <span class="policy-tit-txt">{{ $t('role.ROLEMANAGEMENT') }} </span>
      <!--      <span class="policy-tit-txt-max">{{ $t('role.Maximum20') }}</span>-->
    </div>

    <div class="mf-flex-1 mf-flex role-wrapper">
      <div class="mf-role-list-pnael">
        <div class="mf-role-title main-sidebar-title">
          <span :title="$t('role.ALLROLES')">
            {{ $t('role.ALLROLES') }}
          </span>
          <a-tooltip placement="top" :title="$t('role.Maximum20')">
            <a-icon type="question-circle" style="font-size: 16px;" />
          </a-tooltip>
          <a-button
            v-if="isAdmin"
            id="role_add_0001"
            shape="circle"
            icon="plus"
            type="primary"
            class="mf-shape-btn"
            size="small"
            style="margin-left: auto;"
            :disabled="roleList.length>=20"
            @click="onAddRole"
          />
        </div>

        <div style="overflow: auto;height: calc(100vh - 260px );">
          <section class="mf-role-list mf-flex-1">
            <!--add input-->
            <edit-input
              v-if="isAddRole"
              v-model="role"
              class="mf-role-item editing"
              :max-length="30"
              @ok="onSaveRole"
              @cancel="onCancel"
            />

            <!--role item-->
            <editable-item
              v-for="(item, i) in roleList"
              :key="item['role-id']"
              :class="[selectedRole && selectedRole['role-id'] === item['role-id'] ? 'active': '']"
              :role.sync="item"
              :index="i"
              :is-can-edit="!isAddRole && editRoleId === item['role-id']"
              :role-list="roleList"
              @onCopy="onCopy"
              @select="onClickRole"
              @onRemoved="onRemoved"
              @updateRole="onUpdateRole"
              @onEdit="onEdit"
            />
          </section>
        </div>
      </div>
      <div class="mf-role-permissions mf-flex-1">
        <div class="mf-role-metadata">
          <a-collapse
            v-show="hasRole"
            v-model="activeKeys"
            class="mf-collapse"
          >
            <a-collapse-panel
              v-for="item in permissions"
              :key="item['category-name']"
            >
              <template slot="header">
                <span class="mf-subtitle">{{ item['category-name'] }}</span>
              </template>

              <section class="mf-permission-wrapper">
                <div class="line" />
                <permission-checkbox-group
                  v-for="(permission, i) in item['permission-sub-category']"
                  :key="item['category-name'] + i"
                  :permission-category="permission"
                  :checked-permission.sync="rolePermission[permission.permission_index].value"
                  @checked="(checkList) => { onCheckedPermission(checkList, permission) }"
                />
              </section>
            </a-collapse-panel>
          </a-collapse>
        </div>

        <div v-show="hasRole" v-if="isAdmin" class="mf-role-tool">
          <a-button id="role_restore_0002" :disabled="saveBtnDisabled || loading" style="margin-right: 8px;" class="mf-btn-dashed" @click="restoreRoleDetail"> {{ $t('Restore') }} </a-button>
          <a-button id="role_save_0002" type="primary" :loading="loading" :disabled="saveBtnDisabled" @click="onSaveRolePermission">{{ $t('Save') }} </a-button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import PermissionCheckboxGroup from './components/PermissionCheckboxGroup'
import EditInput from './components/EditInput'
import EditableItem from './components/EditableItem'
import { getPermissionMeta, addRole, getRoles, getRoleDetail, updateRole, copyRole } from '@/api/role'
// import Tree from '@/components/MFTree/tree'
import { isChangeObjorArr } from '@/utils'
import { HELP_ON_THIS_PAGE } from 'config/help'

export default {
  components: { PermissionCheckboxGroup, EditInput, EditableItem },
  data() {
    return {
      isAddRole: false,
      isCopy: false,

      selectedRole: undefined,

      roleList: [],

      permissions: [],

      rolePermission: [],
      initPermission: [],

      activeKeys: [],

      editRoleId: '',

      copyRoleId: '',

      role: '',

      loading: false,
      saveBtnDisabled: true
    }
  },

  computed: {
    hasRole() {
      return this.roleList.length > 0
    },
    isAdmin() {
      return this.checkPermission(['ADMIN_ACCESS'], ['ADMIN_ACCESS'])
    }
  },

  watch: {
    rolePermission: {
      handler: function(permission) {
        this.saveBtnDisabled = isChangeObjorArr(permission, this.initPermission)
        if (!this.saveBtnDisabled) {
          this.$store.dispatch('pageChange/pageChanged', { func: null, params: [] })
        } else {
          this.$store.dispatch('pageChange/resetPageChanged')
        }
      },
      deep: true
    }
  },

  async created() {
    this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.role)
    await this.getRolePermission()
    this.getRoleList()
  },

  methods: {
    // Toggles the new and edit states
    onEdit(role) {
      this.editRoleId = role['role-id']
      this.isAddRole = false
    },

    onAddRole() {
      this.isAddRole = true
    },

    onSaveRole() {
      const saveRole = this.isCopy ? copyRole : addRole
      const param = this.isCopy ? { copyId: this.copyRoleId, role: { 'role-name': this.role }} : { 'role-name': this.role }

      if (this.isCopy && !param.role['role-name']) {
        this.$message.error(this.$t('role.notEmpty'))
        return
      } else if (!this.isCopy && !param['role-name']) {
        this.$message.error(this.$t('role.notEmpty'))
        return
      }
      saveRole(param).then(data => {
        this.selectedRole = data.role
        this.isAddRole = false
        this.isCopy = false
        this.getRoleList()
        this.getRoleDetail()
        this.$message.success(this.$t('role.addSuccess'))
      }).catch(() => {

      })
    },

    onRemoved() {
      this.selectedRole = undefined
      this.getRoleList()
    },

    onUpdateRole(role, index) {
      this.roleList.splice(index, 1, role)
    },

    onCancel() {
      this.isAddRole = false
      this.isCopy = false
      this.role = ''
    },

    onCopy(role) {
      this.isAddRole = true
      this.$nextTick(function() {
        this.role = this.$t('authentication.Clone_') + role['role-name']
        if (this.role.length > 30) {
          this.role = this.role.slice(0, 30)
        }
        this.copyRoleId = role['role-id']
        this.isCopy = true
      })
    },

    onClickRole(role) {
      if (this.$store.getters.isPageChanged && role['role-id'] !== this.selectedRole['role-id']) {
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('changePageConfirm'),
          cancelText: this.$t('Cancel'),
          confirmText: this.$t('OK'),
          onConfirm: () => {
            this.$store.dispatch('pageChange/resetPageChanged')
            this.selectedRole = role
            this.getRoleDetail()
            // this.saveBtnDisabled = true
          }
        })
      } else {
        this.selectedRole = role
        this.getRoleDetail()
        // this.saveBtnDisabled = true
      }
    },

    onCheckedPermission(checkList, permission) {
      this.rolePermission[permission.permission_index].value = checkList
    },

    // save role permission
    onSaveRolePermission() {
      let permission = []
      this.rolePermission.forEach(item => {
        permission.push(...item.value.map(i => { return { 'permission-name': i } }))
      })
      if (permission.length === 0) {
        permission = {}
      }
      this.loading = true
      updateRole({
        'role-id': this.selectedRole['role-id'],
        'role-name': this.selectedRole['role-name'],
        permission: permission
      }).then(data => {
        this.loading = false
        this.$message.success(this.$t('role.updateSuccess'))
        this.initRolePermission(data)
      }).catch(() => {
        this.loading = false
      }).finally(() => {
        this.saveBtnDisabled = true
      })
    },

    initRolePermission(data) {
      if (data.role && data.role.permission) {
        const rolePermission = Array.isArray(data.role.permission) ? data.role.permission : [data.role.permission]

        if (rolePermission) {
          this.permissions.forEach(item => {
            item['permission-sub-category'].forEach(cate => {
              const currentPermission = Array.isArray(cate.permission) ? cate.permission : [cate.permission]
              const intersect = rolePermission.filter(x => currentPermission.findIndex(i => i['permission-name'] === x['permission-name']) > -1)

              // Take the intersection and assign it as the selected data
              if (intersect.length > 0) {
                this.rolePermission[cate.permission_index].value = intersect.map(j => j['permission-name'])
                if (item.permission) {
                  this.rolePermission[cate.permission_index].value.push(item.permission['permission-name'])
                }
              } else {
                this.rolePermission[cate.permission_index].value = []
              }
            })
          })
        }
      } else {
        this.rolePermission = this.rolePermission.map((item) => {
          return { value: [], key: item.key }
        })
      }
      this.initPermission = JSON.parse(JSON.stringify(this.rolePermission))
    },

    // get role permission setting
    getRoleDetail() {
      getRoleDetail(this.selectedRole['role-id']).then(data => {
        this.initRolePermission(data)
      })
    },
    restoreRoleDetail() {
      this.getRoleDetail()
    },

    // get role list
    async getRoleList() {
      const data = await getRoles({ query: '{is-system[N]}' })

      this.roleList = data.roles.role || []
      this.roleList = Array.isArray(this.roleList) ? this.roleList : [this.roleList]

      // set default select role
      if (!this.selectedRole && this.roleList.length > 0) {
        this.selectedRole = this.roleList[0]
        this.getRoleDetail()
      }
    },

    // get permission metadata
    async getRolePermission() {
      const data = await getPermissionMeta()
      const categories = data['permission-categories']

      if (categories) {
        this.permissions = Array.isArray(categories['permission-category']) ? categories['permission-category'] : [categories['permission-category']]
        let permissionLength = 0
        // Format the data and add a unique identifier to the sub category
        this.permissions = this.permissions.map((item, index) => {
          const subCategory = Array.isArray(item['permission-sub-category']) ? item['permission-sub-category'] : [item['permission-sub-category']]
          const permissionItem = subCategory.map((i, _index) => {
            // Objects that implement two-way binding
            this.rolePermission.push({
              key: permissionLength + _index,
              value: []
            })
            return {
              ...i,
              permission_index: permissionLength + _index
            }
          })
          permissionLength = permissionLength + subCategory.length

          return { ...item, 'permission-sub-category': permissionItem }
        })
        this.permissions.forEach(item => {
          this.activeKeys.push(item['category-name'])
        })
      }
      this.initPermission = JSON.parse(JSON.stringify(this.rolePermission))
    }
  }
}
</script>

<style scoped lang="less">
@import "~@/styles/variables.less";

.mf-role-panel{
  width: 100%;
  min-height: calc(100vh - 147px);
  background-color: @white;
  border: 1px solid fade(@dim-gray, 16)
}

.mf-title-panel{
  height: 56px;
  border-bottom: 1px solid fade(@dim-gray, 16);
  display: flex;
  align-items: center;
  padding-left: 24px;
  font-family: MediumWeb;
}

.mf-role-list-pnael{
  display: flex;
  flex-direction: column;
  width: 285px;
  border-right: 1px solid fade(@dim-gray, 16);

  .mf-role-title{
    font-family: BoldWeb;
    font-size: 14px;
    padding: 16px 12px 16px 24px;

    > span {
      margin-right: 5px;
    }
  }
}

.mf-role-permissions{
  position: relative;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
}

.mf-permission-wrapper{
  position: relative;
  display: flex;

  .line{
    position: absolute;
    height: 1px;
    left: -38px;
    top: 40px;
    right: 0;
    background-color: fade(@ant-tooltip-border, 50);
  }
}
/deep/ .mf-permission-title{
  .ant-checkbox-wrapper{
    line-height: 1.3;
  }
}

.role-wrapper{
  height: calc(100vh - 205px);
}

.mf-role-tool{
  height: 64px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  border-top: 1px solid #DCDEDF;
  text-align: right;
  background-color: #fff;
}

.mf-role-metadata{
  height: calc(100vh - 205px);
  overflow: auto;
  padding-bottom: 65px;
}

// .mf-role-item{
//   margin-bottom: 8px;
// }
.mf-role-title /deep/ .ant-btn[disabled]{
  background-color: #656668;
  color: #ffffff
}
.policy-tit-txt{
  font-size: 16px;
  font-family: MediumWeb, serif;
  font-weight: 500;
  color: #000000;
}
.policy-tit-txt-max{
  font-size: 14px;
  font-family: RegularWeb, serif;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.55);
  margin-left: 7px;
}
.mf-shape-btn {
  /deep/ i.anticon-plus {
    position: absolute;
    top: 1px;
    left: 0;
    width: 16px;
  }
}
</style>
