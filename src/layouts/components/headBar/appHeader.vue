<template>
  <header class="mf-header">
    <div class="mf-header-logo">
      <svg-icon icon-class="logo" style="width: 56px;height: 56px" />
    </div>

    <div class="mf-header-breadcrumb">
      <span class="title">
        {{ $t('helpLinks.APP_LIFE_MANAGE') }}
      </span>
      <span class="mf-version">{{ $t('version') }} {{ siteVersion?siteVersion.split(" ")[0]:'16.0.1' }}</span>
    </div>

    <div class="mf-header-tools">
      <i class="iconfont icon-time" />
      <span style="padding-left: 8px"> {{ nowTime }}</span>
      <!-- <a-divider type="vertical" /> -->
      <!-- <span class="icon iconfont icon-tools" />-->

      <a-divider v-if="showTaskStatus" type="vertical" />

      <a-tooltip
        :title="$t('taskStatus.TASKStatus')"
        class="task-status-tooltip"
      >
        <i
          v-if="showTaskStatus"
          id="task-status"
          style="cursor:pointer"
          class="icon iconfont icon-TaskStatus"
          @click="openTaskModal"
        />

        <!-- task status reminder -->
        <a-tooltip
          :visible="isTaskReminderVisible"
          overlay-class-name="task-reminder"
          :overlay-style="{
            zIndex: 11,
            width: 452 + 'px',
            maxWidth: 452 + 'px'
          }"
        >
          <span
            slot="title"
            class="task-reminder-content"
          >
            <svg-icon class="task-reminder-icon" icon-class="information" />
            <span class="task-reminder-text">{{ $t('operationInProcessWarning') }}</span>
            <a-icon type="close" class="task-reminder-close" @click="onTaskReminderClose" />
          </span>

          <span class="blank-placeholder" />
        </a-tooltip>
      </a-tooltip>

      <a-divider v-if="isSA" type="vertical" />
      <ToolLinksDropdown v-if="isSA" />

      <a-divider type="vertical" />
      <a-dropdown
        :trigger="['click']"
        placement="bottomRight"
        class="mf-header-userSetting"
        @visibleChange="changeHelpDropdown()"
      >
        <a id="a-help" @click="e => e.preventDefault()">
          <a-tooltip :title="$t('Help')">
            <i class="iconfont icon-help" />
          </a-tooltip>
          <a-icon type="down" :style="{'padding-left': '8px'}" />
        </a>
        <a-menu slot="overlay">
          <a-menu-item
            v-for="(item,index) in helpLinks"
            :key="index"
            :class="!item.isShow&&'is-show'"
          >
            <a v-if="item.name !== 'br'" :id="`a-link-${index}`" :href="item['link']" target="_blank">{{ item['name'] }}</a>
            <hr v-if="item.name === 'br'" style="margin: 0">
          </a-menu-item>
          <a-menu-item v-if="isSA" :id="`a-link-${helpLinks.length}`" :key="helpLinks.length" @click="()=>openHelpModal()">{{ $t('helpLinks.ABOUT_MICRO') }}</a-menu-item>
        </a-menu>
      </a-dropdown>

      <a-divider type="vertical" />

      <template v-if="isSaas">
        <a-dropdown
          :trigger="['click']"
          placement="bottomRight"
          class="mf-header-userSetting"
        >
          <a id="a-link-dropdown" class="ant-dropdown-link" @click="e => e.preventDefault()">
            <a-tooltip :title="$t('Links')">
              <i class="iconfont icon-link" />
            </a-tooltip>
            <a-icon type="down" style="padding-left: 8px" />
          </a>
          <a-menu slot="overlay">
            <!--            <a-menu-item v-if="showSaLink" id="a-link-1" @click="() => linkto('/qcbin/SiteAdmin.jsp')">{{ $t('siteAdministration') }}</a-menu-item>-->
            <a-menu-item id="a-link-2" @click="() => linkToSaas()">{{ $t('saasInformation') }}</a-menu-item>
            <a-menu-item @click="()=> openLinkModal()">{{ $t('helpLinks.TERMS_LINK') }}</a-menu-item>
          <!-- <a-menu-item id="a-link-3" key="1" @click="submitLogOut">{{ isSSO ? $t('Exit'):$t('LogOut') }}</a-menu-item> -->
          </a-menu>
        </a-dropdown>
        <!-- <span class="icon iconfont icon-tools" />
      <a-divider type="vertical" />
      <a-icon class="question-circle-icon" type="question-circle" :style="{ width: '18px', height: '18px' }" /> -->

        <a-divider type="vertical" />
      </template>
      <div>
        <a-dropdown
          :trigger="['click']"
          placement="bottomRight"
          class="mf-header-userSetting"
        >
          <a id="a-user-name" class="ant-dropdown-link" @click="e => e.preventDefault()">
            <i class="iconfont icon-UserSetting" />
            <span class="show-username"> {{ userName }}</span>
            <a-icon type="down" style="padding-left: 8px" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item :disabled="true" class="administrator-style">{{ $t('user') }}:{{ userName }}</a-menu-item>
            <a-menu-item id="a-user-name-1" key="0" @click="() => $router.push('/mySettings')">{{ $t('MySetting') }}</a-menu-item>
            <a-menu-item id="a-user-name-2" key="1" @click="submitLogOut">{{ isSSO ? $t('Exit'):$t('LogOut') }}</a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </div>
    <licenses-overdue-modal ref="licensesOverdue" />
    <helpModal :help-visible.sync="visible" :site-version="siteVersion" />
    <linkModal :link-visible.sync="linkVisible" />
    <taskModal id="task-status-modal" :task-visible.sync="taskVisible" />
  </header>
</template>

<script>
import { getLocalStorage } from '@/utils/auth'
import { AUTH_TYPE, SERVER_TYPE, SASS_INFO_RES } from '@/store/const'
import { getServerTime } from '@/api/common'
import { getSiteVersion } from '@/api/application'
import { mapGetters } from 'vuex'
import { parseTime, showTaskReminder } from '@/utils'
import moment from 'moment'
import axios from 'axios'
import { isCustomerAdmin, isSiteAdmin } from '@/utils/permission'
import helpModal from './components/helpModal.vue'
import linkModal from './components/linkModal.vue'
import taskModal from './components/taskStatus/taskModal.vue'
import {
  ADD_INS_PAGE, ALM_COMMUNITY_FORUM,
  ALM_HELP, ALM_TOOLS, ALM_WEBSITE,
  CUSTOMER_SUPPORT_WEB_SITE,
  KNOWLEDGE_BASE,
  MICRO_FOCUS_HOME_PAGE, README, WHAT_IS_NEW
} from 'config/help'
import licensesOverdueModal from '@/layouts/components/headBar/components/licensesOverdueModal'
import ToolLinksDropdown from '@/layouts/components/headBar/components/toolLinksDropdown'

export default {
  name: 'HeadMenu',
  components: {
    helpModal,
    linkModal,
    taskModal,
    licensesOverdueModal,
    ToolLinksDropdown
  },
  data() {
    return {
      SERVER_TYPE,
      visible: false,
      linkVisible: false,
      taskVisible: false,
      userName: getLocalStorage('ALM_UserName'),
      nowTime: '',
      interval: null,
      nowMills: 0,
      activeCustomer: '',
      toolModals: {},
      helpLinks: [],
      siteVersion: ''
    }
  },
  computed: {
    ...mapGetters(['authType', 'serverType', 'selectTreeNode', 'helpLink', 'isTaskReminderVisible']),

    isSSO() {
      return this.authType === AUTH_TYPE.SSO
    },

    isSaas() {
      return this.serverType === SERVER_TYPE.Saas
    },
    isSA() {
      return isSiteAdmin()
    },
    isCA() {
      return isCustomerAdmin()
    },

    showSaLink() {
      return isSiteAdmin() && this.serverType === SERVER_TYPE.Saas
    },

    showTaskStatus() {
      return this.checkPermission(['MY_CUSTOMER_CONTEXT_PROJECTS_MODULE_ACCESS'], ['SWITCHED_CUSTOMER_CONTEXT_PROJECTS_MODULE_ACCESS']) &&
      this.checkPermission(
        ['MY_CUSTOMER_CONTEXT_PROJECT_CREATE', 'MY_CUSTOMER_CONTEXT_PROJECT_PC_EXTENSION_DETAILS_VIEW', 'MY_CUSTOMER_CONTEXT_PROJECT_PC_EXTENSION_DETAILS_UPDATE'],
        ['SWITCHED_CUSTOMER_CONTEXT_PROJECT_CREATE', 'SWITCHED_CUSTOMER_CONTEXT_PROJECT_PC_EXTENSION_DETAILS_VIEW', 'SWITCHED_CUSTOMER_CONTEXT_PROJECT_PC_EXTENSION_DETAILS_UPDATE']
      )
    }
  },
  created() {
    this.helpLinks = [
      { name: this.$t('helpLinks.HELP_ON_THIS_PAGE'), link: '', isShow: true },
      { name: this.$t('helpLinks.ALM_HELP'), link: ALM_HELP, isShow: true },
      { name: 'br', isShow: true },
      { name: this.$t('helpLinks.KNOWLEDGE_BASE'), link: KNOWLEDGE_BASE, isShow: this.isSA },
      { name: this.$t('helpLinks.CUSTOMER_SUPPORT_WEB_SITE'), link: CUSTOMER_SUPPORT_WEB_SITE, isShow: this.isSA || this.isCA },
      { name: this.$t('helpLinks.MICRO_FOCUS_HOME_PAGE'), link: MICRO_FOCUS_HOME_PAGE, isShow: true },
      { name: 'br', isShow: true },
      { name: this.$t('helpLinks.WHAT_IS_NEW'), link: WHAT_IS_NEW, isShow: true },
      { name: this.$t('helpLinks.ADD_INS_PAGE'), link: ADD_INS_PAGE, isShow: this.isSA },
      { name: this.$t('helpLinks.ALM_TOOLS'), link: ALM_TOOLS, isShow: this.isSA },
      { name: this.$t('helpLinks.ALM_COMMUNITY_FORUM'), link: ALM_COMMUNITY_FORUM, isShow: this.isSA },
      { name: this.$t('helpLinks.ALM_WEBSITE'), link: ALM_WEBSITE, isShow: true },
      { name: 'br', isShow: true },
      { name: this.$t('helpLinks.README'), link: README, isShow: true }
    ]
  },

  mounted() {
    // (isCustomerAdmin() || isSiteAdmin()) && this.$refs.licensesOverdue.showModal()
    isSiteAdmin() && this.$refs.licensesOverdue.getLicenses()
    this.getNowTime()

    // Gets the Server Time, every second
    this.interval = setInterval(() => {
      // this.getNowTime()
      this.nowMills += 1000
      this.nowTime = moment(parseInt(this.nowMills)).format('YYYY/MM/DD HH:mm')
    }, 1000)

    this.getVersion()
  },

  beforeDestroy() {
    this.interval = window.clearInterval(this.interval)
  },
  methods: {
    changeHelpDropdown() {
      this.helpLinks[0].link = this.helpLink
    },
    openHelpModal() {
      this.visible = true
    },
    openLinkModal() {
      this.linkVisible = true
    },
    openTaskModal() {
      this.taskVisible = true
    },

    linkto(url) {
      window.open(url, '_blank')
    },

    linkToSaas() {
      axios({
        url: '/qcbin/qcaddon/msm/api/SaaSInformation.jsp',
        method: 'post'
      }).then(res => {
        const { data } = res

        if (data) {
          if (data.status === SASS_INFO_RES.ok) {
            this.linkto(data.messages)
          } else {
            this.$message.error(data.messages)
          }
        }
      })
    },

    getVersion() {
      getSiteVersion().then(res => {
        const siteVersion = res['site-version']['full-version']
        this.siteVersion = siteVersion
      })
    },
    showHr(name) {
      return name === this.$t('helpLinks.ALM_HELP') || name === this.$t('helpLinks.MICRO_FOCUS_HOME_PAGE') || name === this.$t('helpLinks.ALM_WEBSITE')
    },

    submitLogOut() {
      // If it is SSO certification, then skip to qcbin
      if (this.$store.getters.isPageChanged) {
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('changePageConfirm'),
          cancelText: this.$t('Cancel'),
          confirmText: this.$t('OK'),
          onConfirm: async() => {
            // await store.dispatch('pageChange/runSave')
            this.$store.dispatch('pageChange/resetPageChanged')
            this.logOut()
          }
        })
      } else {
        this.logOut()
      }
    },
    logOut() {
      if (this.authType === AUTH_TYPE.SSO) {
        // deleteSiteSession().then(_ => {
        window.location.href = window.location.protocol + '//' + window.location.host + '/qcbin/'
        // })
      } else {
        this.$store.dispatch('user/logout').then(() => {
          this.$router.push({ path: 'login' })
        })
      }
    },
    getNowTime() {
      getServerTime().then(data => {
        this.nowTime = parseTime(data.ServerTime.DateTime, 'YYYY/MM/DD HH:mm')
        this.nowMills = data.ServerTime.TimeInMillis
      }).catch(() => {
        window.clearInterval(this.interval)
      })
    },

    onTaskReminderClose() {
      showTaskReminder(this.$store, false)
    }
  }
}

</script>

<style lang="less" scoped>
@import '~@/styles/variables.less';

// header
.mf-header{
  display: flex;
  background-color: @w3C-compliant;
  height: 56px;
}
.iconfont{
  font-size: 20px!important;
}
.mf-header-logo{
  width: 56px;
  background-color: #29CEFF;
}
.mf-header-userSetting{
  display: flex;
  align-items: center;
  color: @white;
  font-size: 16px;
}

.mf-header-breadcrumb{
  display: flex;
  margin-left: 24px;
  align-items: center;
}

.mf-header-breadcrumb .title{
  font-size: 18px;
  color: #fff;
}

.mf-header-tools{
  position: absolute;
  display: flex;
  align-items: center;
  right: 24px;
  height: 100%;
  color: #fff;

  .anticon, .icon-tools{
    font-size: 18px;
    color: @white;
  }
}
.ant-divider, .ant-divider-vertical{
  margin: 0 15px;
  height: 18px;
  top: 0;
}
@media screen and (max-width: 1024px) {
  .administrator-style{
    display: inline !important;
    color: fade(#000000,35%);
  }
  .show-username{
    display: none;
  }
}

.administrator-style{
  display: none;
  color: fade(#000000,35%);
}
.administrator-style:hover{
  color: fade(#000000,35%);
  cursor:text !important;
}

.modal-table-title{
  margin-bottom: 20px;
}

.mf-version{
  margin-left: 8px;
  color: #fff;
  font-size: 12px;
  padding:0 8px;
  border: 1px solid rgba(255,255,255, .6);
  border-radius: 3px;
}
.icon-link{
  font-size: 18px;
}
.is-show{
  display: none;
}

/** task status reminder */
.task-status-tooltip {
  position: relative;

  .blank-placeholder {
    position: absolute;
    left: 50%;
    bottom: 0;
  }
}

.task-reminder-content {
  width: 452px;
  display: flex;
  align-items: flex-start;

  .task-reminder-icon{
    width: 20px !important;
    font-size: 20px !important;
    margin: 5px 16px;
    color: @w3C-compliant;
  }

  .task-reminder-text {
    flex: 1;
    font-size: 16px;
    font-weight: 400;
    color: #323435;
    line-height: 19px;
    height: 60px;
  }

  .task-reminder-close {
    width: 12px;
    height: 12px;
    font-size: 16px;
    margin: 3px 20px 6px 12px;
    padding-bottom: 2px;
    color: #333333;
  }
}
/** task status reminder */
</style>

<style lang="less">
.task-reminder {
  .ant-tooltip-inner {
    padding: 8px 0;
  }
}
</style>
