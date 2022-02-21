<template>
  <mf-drawer
    placement="right"
    :visible="visible"
    width="760"

    :drawer-style="{ position: 'relative' }"
    @close="onClose"
  >
    <span slot="title">
      {{ $t('userManagement.userToolBar.ILUBK') }}
      <a-tooltip :title="$t('userManagement.userToolBar.LDAP Tooltip')" class="tree-user-hi">
        <a-icon type="question-circle" />
      </a-tooltip>
    </span>

    <import-public-top />

    <mf-form id="sever" layout="inline">
      <a-form-model-item :label="$t('sever')" style="width:50%" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <div id="sever_select" class="sever-select">
          <a-select :placeholder="$t('userManagement.input_placeholder')" />
        </div>
      </a-form-model-item>
      <a-form-model-item>
        <a-button id="primary_button" @click="onShowUserDetails">
          <i class="iconfont icon-spread" />
          {{ $t('userManagement.set_filter') }}
        </a-button>
      </a-form-model-item>
      <!-- <a-form-model-item>
        <a-input-search />
      </a-form-model-item> -->
    </mf-form>

    <mf-table id="table" :data="getUserList" :columns="columns" :scroll="{y:400}" :show-pagionation="showPagination" class="user-tree-table" />

    <div v-show="visible" id="user_drawer_tool" class="user-drawer-tool">
      <a-button id="user_edit_cancel" class="mf-btn-dashed" :loading="isSaving" @click="onClose">{{ $t("Cancel") }}</a-button>
      <a-button
        id="user_edit_save"
        type="primary"
        style="margin-left: 8px"
        :loading="isSaving"
        @click="onSaveUser"
      >
        {{ $t("import") }}
      </a-button>
    </div>

    <mf-modal id="filter_modal" :visible="modelVisible" :ok-text="$t('OK')" @ok="onOk" @cancel="onCancel">
      <span slot="title">
        {{ $t('filter') }}
      </span>
      <div>
        <p>{{ $t('userManagement.base_filter') }}:(ObjectClass=*)</p>
        <a-input />
      </div>
    </mf-modal>

  </mf-drawer>
</template>

<script>
import ImportPublicTop from '@/views/user/components/ImportPublicTop'
import { sorting } from '@/utils'
export default {
  name: 'ImportUserKeyword',
  components: { ImportPublicTop },
  data() {
    return {
      visible: false,
      modelVisible: false,
      showSetting: false,
      isSaving: false,
      showPagination: false,
      type: 1,
      form: {},
      columns: Object.freeze([
        {
          title: this.$t('login.userName'),
          dataIndex: 'userName',
          scopedSlots: {
            customRender: 'userName'
          },
          sorter: (a, b) => sorting(a.userName, b.userName)
        },
        {
          title: this.$t('userManagement.FULL_NAME'),
          dataIndex: 'fullName',
          width: 100,
          defaultSortOrder: 'ascend',
          sorter: (a, b) => sorting(a.fullName, b.fullName)
        },
        {
          title: this.$t('userManagement.DESCRIPTION'),
          dataIndex: 'description',
          defaultSortOrder: 'ascend',
          sorter: (a, b) => sorting(a.description, b.description)
        },
        {
          title: this.$t('userManagement.EMAIL'),
          dataIndex: 'email',
          width: 120,
          defaultSortOrder: 'ascend',
          sorter: (a, b) => sorting(a.email, b.email)
        },
        {
          title: this.$t('userManagement.PHONE'),
          dataIndex: 'phone',
          width: 120,
          defaultSortOrder: 'ascend',
          sorter: (a, b) => sorting(a.phone, b.phone)
        }
      ]),
      tableTest: [
        {
          key: 1,
          userName: 'John Brown sr.',
          fullName: '60',
          description: 'New York No. 1 Lake Park',
          email: '12312',
          phone: '123123412'
        },
        {
          key: 2,
          userName: 'John Brown sr.',
          fullName: '60',
          description: 'New York No. 1 Lake Park',
          email: '12312',
          phone: '123123412'
        },
        {
          key: 3,
          userName: 'John Brown sr.',
          fullName: '60',
          description: 'New York No. 1 Lake Park',
          email: '12312',
          phone: '123123412'
        }
      ]
    }
  },

  methods: {
    onChangeCheck(data) {
      // console.log(data)
    },
    getUserList() {
      // getApi 更换成实际接口
      return this.getApi().then((res) => res)
    },
    getApi() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.tableTest)
        }, 100)
      })
    },
    onShowUserDetails() {
      this.modelVisible = true
    },
    onChange(e) {
      if (e.target.value === 3) {
        this.showSetting = false
      }
    },
    onClose() {
      this.visible = false
    },
    onOk() { this.modelVisible = false },
    onCancel() { this.modelVisible = false },
    onSaveUser() {},
    show() {
      this.visible = true
    }
  }
}
</script>

<style lang="less" scoped>

.tree-user-hi{
  margin-left: 10px;
  color: #656668;
}

.user-tree-table{
  margin-top: 24px;
}

#primary_button {
  color: #0079ef;
}

#primary_button:hover{
  background: rgba(0, 121, 239, 0.1);
  }
</style>
