<template>
  <!-- toolbar -->
  <div id="tool-bar" style="padding-left: 24px" class="mf-tool-bar">
    <icon-btn
      v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_PROJECTS_MEMBERSHIPS_UPDATE'],['SWITCHED_CUSTOMER_CONTEXT_USER_PROJECTS_MEMBERSHIPS_UPDATE'])"
      id="a-icon-assignproject"
      :is-disabled="isDisabled"
      :icon-title="$t('userManagement.assignProjectToUsers.assignProject')"
      icon-style="icon-user-AssignProjectToUsers"
      @onClick="onAssignProject"
    />

    <!-- delete -->
    <delete-users
      v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_DELETE'],['SWITCHED_CUSTOMER_CONTEXT_USER_DELETE'])"
      :selected-user-list="selectedUserList"
      @refreshUser="$emit('refresh')"
    />

    <!-- active -->
    <set-active
      v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_ACTIVATION_STATUS_UPDATE'],['SWITCHED_CUSTOMER_CONTEXT_USER_ACTIVATION_STATUS_UPDATE'])"
      :selected-user-list="selectedUserList"
      @refreshUser="$emit('refresh')"
    />

    <!-- deActive -->
    <set-deactive
      v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_ACTIVATION_STATUS_UPDATE'],['SWITCHED_CUSTOMER_CONTEXT_USER_ACTIVATION_STATUS_UPDATE'])"
      :selected-user-list="selectedUserList"
      @refreshUser="$emit('refresh')"
    />

    <!-- setDeactivationDate -->
    <set-deactivation
      v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_DEACTIVATION_DATE_SET'],['SWITCHED_CUSTOMER_CONTEXT_USER_DEACTIVATION_DATE_SET'])"
      :selected-user-list="selectedUserList"
      @refreshUser="$emit('refresh')"
    />

    <!-- unlock -->
    <set-unlock
      v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_UNLOCK'],['SWITCHED_CUSTOMER_CONTEXT_USER_UNLOCK'])"
      :selected-user-list="selectedUserList"
      @refreshUser="$emit('refresh')"
    />

    <!-- lock -->
    <!-- <set-lock
      :selected-user-list="selectedUserList"
      @refreshUser="$emit('refresh')"
    /> -->

    <!-- resetPassword -->
    <!-- <reset-password
      v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_PASSWORD_RESET'])"
      :selected-user-list="selectedUserList"
      :ldap="ldap"
      @refreshUser="$emit('refresh')"
    /> -->

    <!-- refresh -->
    <icon-btn
      id="a-icon-refresh"
      :is-disabled="false"
      :icon-title="$t('refresh')"
      icon-style="icon-refresh"
      @onClick="$emit('refresh')"
    />

    <!-- setting -->
    <a-dropdown
      v-if="isSiteAdmin()&&!isAuth"
      v-model="visible"
      :get-popup-container="triggerNode => triggerNode.parentNode"
      :trigger="['click']"
    >
      <a-tooltip
        :title="$t('userManagement.userToolBar.UserSettings')"
      >
        <a-button
          id="span-icon-setting"
          :disabled="isAuth"
          class="tool-dropdown-btn"
          type="link"
        >
          <i class="iconfont icon-setting tool-dropdown-btn-i" />
          <i class="iconfont icon-CaretDown tool-dropdown-btn-i tool-CaretDown-btn-i" />
        </a-button>
      </a-tooltip>

      <a-menu slot="overlay">
        <a-menu-item id="span_icon_setting_authsetting" key="1" @click="onSettingChange">
          {{ $t('userManagement.userToolBar.authentication') }}
        </a-menu-item>
        <a-menu-item id="span_icon_setting_LDAPsetting" key="2" @click="onSettingLdapChange">
          {{ $t('userManagement.userToolBar.multi') }}
        </a-menu-item>
      </a-menu>
    </a-dropdown>

    <!-- set role -->
    <set-role
      v-if="checkPermission(['ADMIN_ACCESS'])"
      :selected-user-list="selectedUserList"
      :role="role"
      @refreshUser="$emit('refresh')"
    />

    <!-- set policy -->
    <set-policy
      v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_POLICY_SET'],['SWITCHED_CUSTOMER_CONTEXT_USER_POLICY_SET']) "
      :selected-user-list="selectedUserList"
      :policy="policy"
      @refreshUser="$emit('refresh')"
    />

    <a-divider v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_CREATE'],['SWITCHED_CUSTOMER_CONTEXT_USER_CREATE']) || isSiteAdmin()" class="mf-vertical" type="vertical" />

    <!-- more -->
    <div class="mf-tool-more">
      <a-dropdown v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_CREATE'],['SWITCHED_CUSTOMER_CONTEXT_USER_CREATE']) || isSiteAdmin()" id="dropdown-more-list" placement="bottomLeft" :trigger="['click']">
        <a-button id="dropdown-more-btn" class="mf-btn-dropdown mf-btn-dashed">
          <span class="btn-text">{{ $t('userManagement.userToolBar.more') }}</span>
          <!--          <a-divider class="mf-divider" type="vertical" />-->
          <!--          <a-icon type="down" class="a-icon-down" />-->
          <i class="iconfont icon-CaretDown tool-dropdown-btn-i tool-CaretDown-btn-i" />
        </a-button>

        <a-menu id="dropdown-menu_more" slot="overlay">
          <a-sub-menu key="import" :title="$t('import')" class="mf-tool-more-dropdown">
            <a-menu-item v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_CREATE'],['SWITCHED_CUSTOMER_CONTEXT_USER_CREATE'])">
              <a id="import_from_csv" target="_self" rel="noopener noreferrer" href="#" @click="onSelectMenu('IUFCF')">{{ $t('userManagement.userToolBar.IUFCF') }}</a>
            </a-menu-item>
            <a-menu-item v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_CREATE'],['SWITCHED_CUSTOMER_CONTEXT_USER_CREATE'])">
              <a id="import_from_template" target="_self" rel="noopener noreferrer" href="#" @click="ondownloadTemplate">{{ $t('userManagement.userToolBar.DUIT') }}</a>
            </a-menu-item>
            <a-menu-item v-if="isSiteAdmin() && activeCustomerIsRootCustomer() && authType !== AUTH_TYPE.SSO">
              <a id="import_from_ldaptree" target="_self" rel="noopener noreferrer" href="#" @click="onSelectMenu('IUFLDT')">{{ $t('userManagement.userToolBar.IUFLDT') }}</a>
            </a-menu-item>
          </a-sub-menu>

          <a-menu-item v-if="checkPermission(['SA_ONLY_ACCESS'])" id="dropdown-more-list-exportmenu">
            <a id="dropdown-more-list-export" target="_self" rel="noopener noreferrer" href="#" @click="exportUsers">{{ $t('export') }}</a>
          </a-menu-item>
          <a-menu-item v-if="checkPermission(['ADMIN_ACCESS'])" id="dropdown-more-list-sendmail-menu">
            <a id="dropdown-more-list-sendmail" rel="noopener noreferrer" @click="onSendEmail">{{ $t('project.sendEmail') }}</a>
          </a-menu-item>

          <!-- sass move user -->
          <a-menu-item v-if="checkPermission(['MOVE_USER_BETWEEN_CUSTOMER'])&&serverType===SERVER_TYPE.Saas&&isSiteAdmin()" id="dropdown-more-list-moveuser-menu" :disabled="!selectedUserList.length">
            <a id="dropdown-more-list-moveuser" :class="selectedUserList.length?'':'move-user'" rel="moveUser" :disabled="!selectedUserList.length" @click="onMoveUser">{{ $t('userManagement.Moveusers') }}</a>
          </a-menu-item>

          <!-- sass Orphan Users -->
          <a-menu-item v-if="checkPermission(['ORPHAN_USER_MANAGEMENT'])&&serverType===SERVER_TYPE.Saas&&isSiteAdmin()" id="dropdown-more-list-OrphanUsers-menu">
            <a id="dropdown-more-list-OrphanUsers" rel="orphanUsers" @click="onOrphanUsers">{{ $t('userManagement.OrphanUsers') }}</a>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>

    <assign-project
      v-if="checkPermission(['MY_CUSTOMER_CONTEXT_USER_PROJECTS_MEMBERSHIPS_UPDATE'],['SWITCHED_CUSTOMER_CONTEXT_USER_PROJECTS_MEMBERSHIPS_UPDATE'])"
      :visible.sync="assignProjectVisible"
      :select-users="selectedUserList"
    />

    <!-- move users -->
    <move-user v-if="checkPermission(['MOVE_USER_BETWEEN_CUSTOMER'])&&serverType===SERVER_TYPE.Saas&&isSiteAdmin()" ref="moveUsersRef" :users="selectedUserList" @refreshUser="$emit('refresh')" />

    <!-- Orphan Users -->
    <orphan-users v-if="checkPermission(['ORPHAN_USER_MANAGEMENT'])&&serverType===SERVER_TYPE.Saas&&isSiteAdmin()" ref="OrphanUsers" @refreshUser="$emit('refresh')" />

    <authentication-setting ref="authenticationSetting" @refresh="$emit('refresh')" />

    <multi-ldap-settings
      ref="LdapSetting"
    />

    <import-ldap ref="importLdap" @refresh="$emit('refresh')" />

    <import-csv ref="importUserCsv" @refresh="$emit('refresh')" />

    <!--send email-->
    <send-email
      ref="SendEmail"
      :selected-user-list="selectedUserList"
      @refresh="$emit('refresh')"
    />

  </div>

</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import SetDeactivation from '@/views/user/userToolBar/components/SetDeactivation'
import AssignProject from '@/views/user/components/AssignProject'
import SetUnlock from '@/views/user/userToolBar/components/SetUnlock'
// import SetLock from './components/SetLock'
// import ResetPassword from '@/views/user/userToolBar/components/ResetPassword'
import SetDeactive from '@/views/user/userToolBar/components/SetDeactive'
import SetActive from '@/views/user/userToolBar/components/SetActive'
import DeleteUsers from '@/views/user/userToolBar/components/DeleteUsers'
import { mapGetters } from 'vuex'
import { AUTH_TYPE, SERVER_TYPE } from '@/store/const'
import { downloadTemplate, exportAlltUsers } from '@/api/user.js'
import downloadFiles from '@/utils/download'
import SetRole from './components/SetRole'
import SetPolicy from './components/SetPolicy'
import MoveUser from '../components/MoveUsers'
import OrphanUsers from '../components/OrphanUsers/index'
import { isSiteAdmin, activeCustomerIsRootCustomer } from '@/utils/permission'
import AuthenticationSetting from '../components/AuthenticationSetting'
import MultiLdapSettings from '../components/MultiLdapSettings/index.vue'
import ImportLdap from '../components/importLdap/ImportLdap'
import ImportCsv from '../components/importUserCsv/index'
import SendEmail from '../components/SendEmail/index.vue'
import { errorMessage } from '@/utils'

export default {
  name: 'UserToolBar',
  components: {
    IconBtn,
    AssignProject,
    SetDeactivation,
    SetUnlock,
    // ResetPassword,
    SetDeactive,
    SetActive,
    DeleteUsers,
    SetRole,
    SetPolicy,
    MoveUser,
    OrphanUsers,
    // SetLock
    AuthenticationSetting,
    MultiLdapSettings,
    ImportLdap,
    ImportCsv,
    SendEmail
  },
  props: {
    selectedUserList: {
      type: Array,
      default: function() {
        return []
      }
    },
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
      SERVER_TYPE,
      AUTH_TYPE,
      visible: false,
      assignProjectVisible: false
    }
  },
  computed: {
    isDisabled: function() {
      return this.selectedUserList.length === 0
    },
    ...mapGetters(['authType', 'serverType']),
    isAuth() {
      return this.authType === AUTH_TYPE.SSO
    }
  },
  mounted() {

  },
  methods: {
    isSiteAdmin,
    activeCustomerIsRootCustomer,

    onSettingChange({ item, key, keyPath }) {
      this.visible = !this.visible
      if (key === '1') {
        this.$refs.authenticationSetting.show()
      }
    },

    onSettingLdapChange({ item, key, keyPath }) {
      this.visible = !this.visible
      this.$refs.LdapSetting.onShow()
    },

    onSelectMenu(type) {
      if (type === 'IUFLDT') {
        this.$refs.importLdap.show()
      } else if (type === 'IUFCF') {
        this.$refs.importUserCsv.show()
      }
    },

    onAssignProject() {
      this.assignProjectVisible = true
    },

    ondownloadTemplate() {
      downloadTemplate().then(res => {
        // this.$message.success(this.$t('userManagement.userToolBar.downloadImportUserTemplate'))
        downloadFiles(res, 'users')
      }).catch(err => {
        errorMessage(err.response.data.QCRestException.Title, err.response.data.QCRestException.StackTrace)
      })
    },

    exportUsers() {
      exportAlltUsers().then(res => {
        // this.$message.success(this.$t('userManagement.userToolBar.exportAllUsersMessage'))
        downloadFiles(res, 'users')
      }).catch(err => {
        errorMessage(err.response.data.QCRestException.Title, err.response.data.QCRestException.StackTrace)
      })
    },

    onMoveUser() {
      this.$refs.moveUsersRef.show()
    },

    onOrphanUsers() {
      this.$refs.OrphanUsers.show()
    },

    onSendEmail() {
      this.$refs.SendEmail.sendEmailVisible = true
    }

  }
}
</script>

<style scoped lang="less">
@import '~@/styles/variables.less';

.ant-modal-header{
  border-bottom: 1px solid red;
}

.mf-tool-bar{
  margin-top: 24px;
  display: flex;
  align-items: center;
  height: 56px;
  background-color: @white;
  border-left:1px solid fade(#656668,16%);
  border-top:1px solid fade(#656668,16%);
  box-shadow: 2px 0 0 @gray;
}

.mf-vertical{
  position: relative;
  margin-left: 0;
  margin-right: 24px;
  background: #979797;
  width: 1px;
  height: 20px;
  top: 1px;
}

.mf-vertical::after{
  content: " ";
  position: absolute;
  width: 1px;
  height: 20px;
  background-color: #979797;
}

.mf-tool-more{
  height: 32px;
  margin-right: 24px;
  overflow: hidden;

  .btn-text {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}

.mf-divider{
  background: @black;
  height: 9px;
  top: 0;
  margin: 0 9px;
}

.mf-btn-dropdown{
  width: 100%;
  min-width: unset;
  display:flex;
  background-color: transparent !important;
  border-radius: @border-radius;
  color: @black;
  padding: 0;
  align-items: center;
  border: none;
  min-width: unset;
  transition: none;

  .icon-CaretDown {
    margin: -8px 0 0 8px;
  }
}

.mf-btn-dropdown:hover {
  color: #2795F5;
  .icon-CaretDown {
    color: #2795F5;
  }
}

//mf-btn-dropdown 展开后的class
.a-icon-down{
  align-self:center;
}

.dropdown-menu-import {
  position: relative;
  .menu-import-content {
    display: none;
    width: 260px;
    position: absolute;
    top: 0;
    left: -260px;
    box-shadow: 1px 1px 2px 0 rgba(101, 102, 104, 0.3);
    background-color: #fff;
    .menu-import-item {
      margin: 0;
      padding: 5px 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
.dropdown-menu-import:hover .menu-import-content {
  display: block;
}

.dropdown-menu-import:hover .menu-import-content .menu-import-item:hover {
  background-color: #e6f7ff;
}

.move-user{
  color: #989898;
}
.mf-tool-more-dropdown /deep/ .ant-dropdown-menu-submenu-arrow {
  /*display: none;*/
  right: 3px;
}
</style>
