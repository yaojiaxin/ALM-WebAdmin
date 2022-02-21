<template>
  <mf-modal
    :visible="visible"
    :confirm-loading="false"
    width="802px"
    :destroy-on-close="true"
    :next-disabled="showSave || isCanSave"
    @cancel="show"
    @ok="onAddUserSubmit"
  >
    <span slot="title">
      {{ $t('licenses.AddUser') }}
    </span>
    <!--    <transfer ref="transfer" v-model="selectedUsers" />-->
    <user-table ref="transfer" v-model="selectedUsers" :show-save.sync="showSave" type="user" :exclude="existingUsers" />
    <!---->
    <!--    <transfer ref="transfer" v-model="selectedUsers" :exclude="existingUsers" />-->

  </mf-modal>

</template>

<script>
// import Transfer from '@/components/MFTransfer/UserTableTransfer'
import { updateLicensesQuotas } from '@/api/license'
import UserTable from '@/views/project/components/ProjectsUsers/components/UserTable'
export default {
  name: 'AddUserModal',
  // components: { Transfer },
  components: { UserTable },
  props: {
    param: {
      type: Object,
      default: () => {}
    },
    existingUsers: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      selectedUsers: [],
      showSave: false,
      users: []
    }
  },
  computed: {
    // The button is not clickable when no data is selected
    isCanSave() {
      return this.selectedUsers.length === 0
    }
  },
  methods: {
    show() {
      this.visible = !this.visible
    },
    onAddUserSubmit() {
      this.users = this.selectedUsers.map(item => {
        return {
          '@name': item.name
        }
      })
      this.visible = false
      this.users = this.users.concat(this.existingUsers)
      // Call to add user
      updateLicensesQuotas(this.param, {
        users: {
          user: this.users
        }
      }).then((res) => {
        this.$emit('getLicenseQuotas')
      })

      this.users = []
      this.selectedUsers = []
      this.$refs.transfer.onRestTransfer()
    }
  }
}
</script>

<style scoped lang="less">
  /deep/ .ant-table-selection-column{
    padding: 0 8px !important;
  }
</style>
