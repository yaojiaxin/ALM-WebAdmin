<template>
  <div class="mf-role-item" :class="{'editing': editable && isCanEdit}">
    <template v-if="editable && isCanEdit">
      <edit-input v-model.trim="input" @cancel="onCancel" @ok="onSave" />
    </template>

    <template v-else>
      <span class="mf-role-name mf-flex-1" :title="role['role-name']" @click.stop="onClick">{{ role['role-name'] }}</span>

      <span v-if="isAdmin" class="role-tools">
        <icon-btn
          id="role_clone"
          class="icon-btn"
          icon-style="icon-clone"
          :icon-title="$t('role.CopyRoles')"
          :disabled="roleList.length >= 20"
          @onClick="onCopy"
        />
        <icon-btn
          id="role_edit"
          class="icon-btn"
          icon-style="icon-edit"
          :icon-title="$t('role.EditRoles')"
          @onClick="onHandlerEdit"
        />
        <icon-btn
          id="role_delete"
          class="icon-btn"
          :icon-title="$t('role.DeleteRoles')"
          icon-style="icon-delete"
          @onClick="onDeleteRole"
        />
      </span>
    </template>
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import EditInput from './EditInput'
import { updateRole, deleteRole } from '@/api/role'

export default {
  components: { IconBtn, EditInput },
  props: {
    role: {
      type: Object,
      default: () => {
        return {
          'role-name': '',
          'role-id': ''
        }
      }
    },

    roleList: {
      type: Array,
      default: () => []
    },

    isCanEdit: {
      type: Boolean,
      default: true
    },

    // The subscript
    index: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      editable: false,
      input: ''
    }
  },

  computed: {
    isAdmin() {
      return this.checkPermission(['ADMIN_ACCESS'], ['ADMIN_ACCESS'])
    }
  },

  watch: {
    isCanEdit: function(val) {
      if (!val) {
        this.editable = false
      }
    }
  },

  methods: {
    onHandlerEdit() {
      this.editable = true
      this.$nextTick(function() {
        this.input = this.role['role-name']
      })
      this.$emit('onEdit', this.role)
    },

    // update role name
    onSave() {
      if (!this.input) {
        this.$message.error(this.$t('role.notEmpty'))
        return
      }
      updateRole({
        'role-id': this.role['role-id'],
        'role-name': this.input
      }).then(data => {
        this.editable = false
        this.$message.success(this.$t('role.updateSuccess'))
        this.$emit('updateRole', data.role, this.index)
      })
    },

    // delete role
    onDeleteRole() {
      this.$mfConfirm({
        message: this.$t('role.confirmDelete'),
        onConfirm: () => {
          deleteRole(this.role['role-id']).then(() => {
            this.$emit('onRemoved')
            this.$message.success(this.$t('role.deleteSuccess'))
          })
        }
      })
    },

    onCancel() {
      this.editable = false
    },

    onCopy() {
      this.$emit('onCopy', this.role)
    },

    onClick() {
      this.$emit('select', this.role)
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";

.role-tools{
  display: none;
  width: 85px;

  .icon-btn{
    margin-right: 8px !important;

    .tool-icon-btn{
      margin-right: auto !important;
    }
    .tool-icon-btn-i{
      font-size: 20px !important;
    }
  }
}

.mf-role-name{
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.mf-role-item{
  display: flex;
  align-items: center;
  height: 32px;
  font-family: RegularWeb;
  padding-left: 24px;

  &:hover{
    background-color: fade(@brand-blue, 5);
    cursor: pointer;

    .role-tools{
      display: block;
    }
  }

  &.active{
    background-color: fade(@brand-blue, 10);
  }
}

.mf-role-item.editing{
  background-color: @white;
}
</style>
