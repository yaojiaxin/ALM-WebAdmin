<template>
  <mf-modal
    id="projects_add_modal"
    :visible="visible"
    :confirm-loading="loading"
    width="802px"
    :ok-text="$t('userManagement.userToolBar.successSubmit')"
    @cancel="onCancel"
    @ok="onExport"
  >
    <span slot="title" class="projects-title">
      {{ $t('userManagement.OPERATIONCOMPLETE') }}
    </span>

    <div class="operation-cont">
      <a-table
        id="user_projects_table"
        ref="userprojectstable"
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :scroll="{ y: 100}"
        :pagination="false"
      >
        <template id="user_projects_table_template" slot="status" slot-scope="status">
          <span v-if="status">
            <a-icon type="check-circle" theme="filled" style="color: #1AAC60" />
          </span>
          <span v-else>
            <a-icon type="close-circle" theme="filled" style="color: #E5004C" />
          </span>
        </template>
      </a-table>
    </div>
  </mf-modal>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      dataSource: [
        {
          key: '1',
          domainName: 'John Brown',
          name: 'asdasasd',
          message: 'sdfjwjfksjfksjldkdfjsdfj'
        },
        {
          key: '2',
          domainName: 'Ray Zhang',
          name: 'sfddfs',
          message: 'sdfjwjfksjfksjldkdfjsdfj'
        }
      ]
    }
  },
  computed: {
    columns() {
      return [{
        title: this.$t('domainName'),
        dataIndex: 'domainName',
        ellipsis: true
      }, {
        title: this.$t('projectName'),
        dataIndex: 'name',
        ellipsis: true
      }, {
        title: this.$t('status'),
        scopedSlots: { customRender: 'status' }
      }, {
        title: this.$t('message'),
        dataIndex: 'message',
        ellipsis: true
      }]
    }
  },
  methods: {
    show() {
      this.visible = true
    },
    onExport() {
      this.visible = false
    },
    onCancel() {
      this.visible = false
    }
  }
}
</script>

<style scoped lang="less">

</style>
