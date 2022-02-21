<template>
  <mf-modal
    id="orphan-users-project-modal"
    ref="orphanUsersProjectRef"
    :visible="visible"
    :confirm-loading="loading"
    width="800px"
    :ok-text="$t('OK')"
    @cancel="onCancel"
    @ok="onCancel"
  >

    <span slot="title">{{ $t('userManagement.UserProjectsForUser') }}</span>

    <a-table :columns="columns" row-key="index" :data-source="tableList" :pagination="false" :loading="tableLoading">

      <template slot="active" slot-scope="data">
        <icon-btn
          :icon-title="$t('project.deleteProject')"
          icon-style="icon-delete"
          class="project-delete"
          @onClick="onRemoveProject(data)"
        />
      </template>
    </a-table>

    <!-- <modal-result
      :visible.sync="resultVisible"
      :result-list="resultUserList"
      :is-show-cancel="false"
      :columns="resultColumns"
      @ok="resultSubmitFunc"
    /> -->
  </mf-modal>
</template>

<script>
// import ModalResult from '@/components/ModalResult/index'
import IconBtn from '@/components/BtnIcon/index'
import { getOrphanProjects, deleteUserProject } from '@/api/user'
import { errorMessage } from '@/utils'
export default {
  components: { IconBtn },
  props: {
    users: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      tableLoading: false,

      // resultVisible: false,
      // resultUserList: [],

      tableList: [],
      deletelist: []
    }
  },

  computed: {
    columns() {
      const columns = [
        {
          title: this.$t('userManagement.USERNAME'),
          dataIndex: 'user',
          key: 'user'
        },
        {
          title: this.$t('userManagement.CUSTOMER'),
          dataIndex: 'customer-name',
          key: 'customer-name'
        },
        {
          title: this.$t('DOMAIN'),
          dataIndex: 'domain-name',
          key: 'domain-name'
        },
        {
          title: this.$t('PROJECT'),
          dataIndex: 'name',
          key: 'name'
        },
        {
          title: this.$t('ACTION'),
          scopedSlots: { customRender: 'active' },
          align: 'left'
        }

      ]
      return columns
    }
  },

  methods: {
    show() {
      this.visible = true
    },

    onCancel() {
      this.tableList = []
      this.visible = false
      this.$emit('show')
    },

    onOk() {
      this.tableList = []
      this.visible = false
    },

    async getTableList(users) {
      // get list
      this.tableList = []
      if (users) {
        this.tableLoading = true
        for (const i of users) {
          await getOrphanProjects(i).then(res => {
            if (res.projects.project) {
              let list = []
              let arr = []
              Array.isArray(res.projects.project) ? list = res.projects.project : list.push(res.projects.project)
              arr = list.map(item => {
                return {
                  'customer-name': item['customer-name'],
                  'customer-id': item['customer-id'],
                  'domain-name': item['domain-name'],
                  name: item['project-name'],
                  user: i,
                  index: item['domain-name'] + item['project-name'] + i
                }
              })
              this.tableList.push(
                ...arr
              )
            }
          })
        }
        this.tableLoading = false
      }
    },

    onRemoveProject(data) {
      // this.visible = false
      this.deletelist = data
      this.$mfConfirm({
        title: this.$t('project.RemoveProjects'),
        message: `${this.$t('userManagement.TheProjectRemoved', { name: data.name, user: data.user })}`,
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('OK'),
        onConfirm: this.submit
      })
    },

    submit() {
      // Remove Project api
      this.loading = true
      deleteUserProject(this.deletelist).then(res => {
        this.deletelist = undefined
        this.$message.success(this.$t('project.deleteProjectSuccess'))
        this.getTableList(this.users)
        this.loading = false
      }).catch((e) => {
        this.loading = false
        return e.response.data.Title ? errorMessage(e.response.data.Title, e.response.data.StackTrace) : null
      })
    },

    resultSubmitFunc() {
      this.resultVisible = false
    }

  }
}
</script>

<style lang="less" scoped>

</style>
