<template>

  <div class="mf-permission-panel">
    <div class="mf-permission-title">
      <a-checkbox
        id="role_checkall"
        :indeterminate="indeterminate"
        :checked="checkAll"
        :disabled="!isAdmin"
        @change="onCheckAllChange"
      >{{ permissionCategory['category-name'] }}</a-checkbox>
    </div>

    <div class="mf-permission-list">
      <a-checkbox-group
        v-model="checkedList"
        :options="catePermission"
        :disabled="!isAdmin"
        @change="onChange"
      />
    </div>
  </div>

</template>

<script>
export default {
  props: {
    permissionCategory: {
      type: Object,
      default: () => {
        return {
          'category-name': '',
          permission: []
        }
      }
    },

    checkedPermission: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      checkedList: [],

      indeterminate: false,

      checkAll: false
    }
  },

  computed: {
    isAdmin() {
      return this.checkPermission(['ADMIN_ACCESS'], ['ADMIN_ACCESS'])
    },

    // permission list
    catePermission: {
      get() {
        let permission = []
        if (!Array.isArray(this.permissionCategory.permission)) {
          permission = [this.permissionCategory.permission]
        } else {
          permission = this.permissionCategory.permission
        }
        permission = permission.map(item => {
          if (item) {
            return {
              label: item['display-name'] || '',
              value: item['permission-name']
            }
          } else {
            return {
              label: '',
              value: ''
            }
          }
        })
        return permission
      }
    }
  },
  watch: {
    checkedPermission(val) {
      this.onChangePermission(val)
    }
  },

  created() {
    this.onChangePermission(this.checkedPermission)
  },

  methods: {
    onChange(checkedList) {
      const permissionLength = this.catePermission.length
      this.indeterminate = !!checkedList.length && checkedList.length < permissionLength
      this.checkAll = checkedList.length === permissionLength

      this.$emit('checked', this.checkedList)
    },

    // Add suboptions to the checklist after checkAll
    onCheckAllChange(e) {
      Object.assign(this, {
        checkedList: e.target.checked ? this.catePermission.map(i => i.value) : [],
        indeterminate: false,
        checkAll: e.target.checked
      })

      this.$emit('checked', this.checkedList)
    },

    onChangePermission(val) {
      // Determines whether the selected value is included
      const contain = this.catePermission.filter(i => val.includes(i.value))

      this.checkedList = contain.map(i => i.value)
      this.checkAll = contain.length === this.catePermission.length
      this.indeterminate = contain.length > 0 && contain.length !== this.catePermission.length
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.mf-permission-panel{
  width: 50%;
}

.mf-permission-title{
  height: 40px;
}

.mf-permission-list{
  padding-top: 16px;
}

.mf-permission-list /deep/ .ant-checkbox-group-item{
  display: block;
}

.mf-permission-list /deep/ .ant-checkbox-group-item:not(:first-child){
  padding-top: 8px;
}
</style>
