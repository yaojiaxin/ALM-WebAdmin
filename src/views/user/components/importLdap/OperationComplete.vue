<template>
  <mf-modal id="import_ldap_complete_modal" class="complete_modal" :visible="visible" :has-spin="false" :one-btn="true" :ok-text="$t('OK')" @ok="onOkComplete" @cancel="onOkComplete">
    <span slot="title">
      {{ $t('userManagement.operation_complete') }}
    </span>
    <mf-ag-grid
      id="import_ldap_complete_list"
      size="small"
      :columns="completeColumns"
      :data-source="completeList"
      :height="415"
    />
  </mf-modal>
</template>

<script>
import MfAgGrid from '@/components/MFTable/AgGrid/grid'
import CompleteStatus from '@/views/user/components/importLdap/CompleteStatus'

export default {
  components: {
    MfAgGrid,
    // eslint-disable-next-line vue/no-unused-components
    CompleteStatus
  },
  props: {
    completeList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      completeColumns: Object.freeze([
        {
          title: this.$t('login.userName'),
          dataIndex: 'name',
          width: 130,
          suppressMenu: true,
          tooltipField: 'name'
        },
        {
          title: this.$t('userManagement.FULL_NAME'),
          dataIndex: 'full-name',
          width: 200,
          suppressMenu: true,
          tooltipField: 'full-name'
        },
        {
          title: this.$t('userManagement.userToolBar.STATUS'),
          dataIndex: 'status',
          cellRenderer: 'CompleteStatus',
          width: 130,
          suppressMenu: true
        },
        {
          title: this.$t('userManagement.userToolBar.successTableMessage'),
          dataIndex: 'message',
          width: 260,
          suppressMenu: true,
          tooltipField: 'message'
        }
      ])
    }
  },
  methods: {
    show() {
      this.visible = true
    },
    onOkComplete() {
      this.visible = false
      this.$emit('ok')
    }
  }
}
</script>

<style scoped>

</style>
