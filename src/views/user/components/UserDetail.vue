<template>
  <mf-drawer
    id="user_detail_drawer"
    placement="right"
    :visible="visible"
    width="760"
    wrap-class-name="user-drawer"
    :drawer-style="{ position: 'relative' }"
    @close="onClose"
  >
    <a-tabs id="user_detail_tabs" :active-key="key" class="user-tabs-detail" @change="onChangetab">

      <a-tab-pane id="user_edit_tab" key="1" :tab="$t('userManagement.User Details')" class="mf-tabpanel-autoheight">
        <keep-alive>
          <user-edit
            ref="userEdit"
            :user-edit-loading.sync="userEditLoading"
            :ldap="ldap"
            :role="role"
            :policy="policy"
            :server="server"
            class="user-edit-form"
            :is-saving.sync="isSaving"
            :is-change.sync="isChange"
            @saved="onSavedUser"
          />
        </keep-alive>
        <div v-show="key==='1' " :class="[visible ? 'user-drawer-tool' : 'user_edit_btn_none']">
          <a-button id="user_edit_cancel" class="mf-btn-dashed" :disabled="isSaving" @click="onClose">{{ $t("Cancel") }}</a-button>
          <a-button
            v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_PERSONAL_DETAILS_UPDATE'],['SWITCHED_CUSTOMER_CONTEXT_USER_PERSONAL_DETAILS_UPDATE'])"
            id="user_edit_save"
            type="primary"
            style="margin-left: 8px"
            :loading="isSaving"
            :disabled="userEditLoading||isChange"
            @click="onSaveUser"
          >
            {{ $t("Save") }}
          </a-button>
        </div>
      </a-tab-pane>

      <a-tab-pane v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_PROJECTS_MEMBERSHIPS_VIEW'],['SWITCHED_CUSTOMER_CONTEXT_USER_PROJECTS_MEMBERSHIPS_VIEW'])" id="user_project_tab" key="2" :tab="$t('userManagement.User Projects')" force-render>
        <keep-alive>
          <user-project ref="userProjectref" @getProjectFinsh="userProjectTotal=$event" />
        </keep-alive>
      </a-tab-pane>

      <a-tab-pane key="3" :tab="$t('userManagement.UserProjectTotal',{total:userProjectTotal})" disabled />
    </a-tabs>

  </mf-drawer>
</template>

<script>
import UserEdit from './UserEdit'
import UserProject from './UserProject'
import { getAllLDAPOp, getCustomerLDAPs } from '@/api/customers'
import { SERVER_TYPE } from '@/store/const'
import { mapGetters } from 'vuex'

export default {
  components: { UserEdit, UserProject },
  props: {
    ldap: {
      type: Boolean,
      default: false
    },
    role: {
      type: Array,
      default: () => []
    },
    policy: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      isSaving: false,
      isChange: true,
      server: [],
      userId: null,
      SERVER_TYPE,
      userEditLoading: false,
      userName: '',
      key: '1',
      userProjectTotal: 0
    }
  },
  computed: {
    ...mapGetters(['serverType', 'activeCustomerId'])
  },
  methods: {
    show(userName, userId) {
      this.key = '1'
      this.visible = true
      if (userName) {
        this.userName = userName
        this.userId = userId
        this.$nextTick(function() {
          this.$refs.userEdit.getUserDetail(userName)
          this.$refs.userProjectref.getUserProjects(this.userName)
        })
      }
      if (this.ldap) {
        this.getAllLDAP = this.serverType === SERVER_TYPE.Saas ? getCustomerLDAPs : getAllLDAPOp
        this.getLdapServerList()
      }
    },
    getLdapServerList() {
      this.getAllLDAP(this.activeCustomerId).then(res => {
        this.server = []
        const ldaps = this.serverType === this.SERVER_TYPE.OnPremise ? res['ldap-servers']['ldap-server'] || [] : res.ldaps.ldap || []
        Array.isArray(ldaps) ? this.server = ldaps : this.server.push(ldaps)
      }).catch(() => {})
    },

    isChangeMsg() {
      if (!this.isChange) {
        this.$message.warning(this.$t('warningNoSave'))
      }
    },

    onChangetab(key) {
      this.key = key
      if (key === '2') {
        this.$nextTick(function() {
          this.$refs.userProjectref.getUserProjects(this.userName)
        })
        this.isChangeMsg()
      }
    },

    onClose() {
      this.$refs.userEdit.onResetForm()
      if (this.$refs.userProjectref) {
        this.$refs.userProjectref.checked(false)
      }
      this.visible = false
      // this.isChangeMsg()
    },

    onSaveUser() {
      this.$refs.userEdit.onSaveForm(this.userId)
    },

    onSavedUser() {
      this.isChange = true
      this.onClose()
      this.$emit('reloadTable')
    }
  }
}
</script>

<style lang="less">
.user-edit-btn{
  width: 70px;
  height: 32px;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease-in;
}
.user-edit-btn:hover{
  background: rgba(0, 121, 239, 0.05);
  border-radius: 1px;
}

.user-tabs-detail {
  position: absolute;
  top: 16px;
  left: 24px;
  right: 24px;
  bottom: 40px;
  display: flex;
  flex-direction: column;

  .ant-tabs-bar{
    float: left;
    border-bottom: none;

    .ant-tabs-nav-container .ant-tabs-nav-wrap .ant-tabs-nav-scroll .ant-tabs-nav {
      height: 36px !important;
    }
  }

  .ant-tabs-nav .ant-tabs-tab{
    margin: 0 16px 0 0;
    padding: 0 !important;
    font-size: 18px;
  }
  .ant-tabs-tab-active{
    border-bottom: 3px solid #1890ff ;
  }

  .ant-tabs-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    // overflow-y: auto;
    // overflow-x: hidden;

    .user-edit-form{
      flex: 1;
      transition: all ease-in .3s;
      padding-bottom: 65px;
    }
  }
}

.user-drawer{
  .ant-drawer-header{
    top: 28px;
    float: right;
    z-index: 9;
  }

  .ant-drawer-close{
    font-size: 18px;
    color: rgba(0, 0, 0, 0.45);
    top: 0px;
  }
  .ant-drawer-title{
    font-size: 14px;
    margin-right: 36px;
    float: right;

    a{
      display: flex;
    }
    i{
      font-size: 12px;
      margin-right: 4px;
    }
  }
}

.user-drawer-tool{
  display: flex;
  justify-content: flex-end;
  position: fixed;
  bottom: 0;
  right: 0;
  width: 760px;
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #DCDEDF;
}

.user_edit_btn_none{
  display: none;
}

.user-tabs-detail .ant-tabs-nav .ant-tabs-tab-disabled,.user-tabs-detail .ant-tabs-nav .ant-tabs-tab-disabled:hover{
  cursor: default !important;
  font-size: 14px;
  font-family: SemiboldWeb;
  font-weight: 400;
  color: #0075F3;
  line-height: 14px;
}
</style>
