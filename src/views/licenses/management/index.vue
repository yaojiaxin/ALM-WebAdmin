<template>
  <div class="license-management-wrapper">
    <a-tabs v-model="tab" class="licenses-management-tabs" default-active-key="Status" @change="tabsChangeCallback">
      <!--    <span slot="tabBarExtraContent" class="tab-title">{{ $t("licenses.LICENSES") }}</span>-->
      <a-tab-pane id="tab-license-status" key="Status" :tab="$t('status')">
        <keep-alive>
          <status-tab ref="tabLicenseStatus" :is-up-licenses.sync="isUpLicenses" />
        </keep-alive>
      </a-tab-pane>
      <a-tab-pane id="tab-license-assignments" key="Assignments" :tab="$t('licenses.LicenseAssignments')">
        <keep-alive>
          <license-assignment-tab key="Assignments" ref="tabLicenseAssignments" />
        </keep-alive>
      </a-tab-pane>
      <a-tab-pane id="tab-license-named" key="Named" :tab="$t('licenses.NamedLicenses')">
        <keep-alive>
          <named-licenses-tab ref="tabLicenseNamed" />
        </keep-alive>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>

import StatusTab from '@/views/licenses/management/components/StatusTab'
import NamedLicensesTab from '@/views/licenses/management/components/NamedLicensesTab'
import LicenseAssignmentTab from '@/views/licenses/management/components/LicenseAssignmentTab'
import { HELP_ON_THIS_PAGE } from 'config/help'

export default {
  name: 'Index',
  components: { StatusTab, NamedLicensesTab, LicenseAssignmentTab },
  data() {
    return {
      tab: 'Status',
      isUpLicenses: false
    }
  },
  created() {
    this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.licenses['License Management'])
  },
  methods: {
    tabsChangeCallback(key) {
      // if (key !== 'Assignments' && this.$refs.tabLicenseAssignments && this.$refs.tabLicenseAssignments.isChange) {
      //   this.$message.warning(this.$t('licenses.changeLicenseAssignmentsMessage'))
      // }
      if (key === 'Status' && this.$refs.tabLicenseStatus) {
        this.$refs.tabLicenseStatus.getTableData()
      } else if (key === 'Assignments' && this.$refs.tabLicenseAssignments) {
        if (this.isUpLicenses) {
          this.isUpLicenses = false
          this.$refs.tabLicenseAssignments.getLicensesAssignmentsTable()
        }
      } else if (this.$refs.tabLicenseNamed) {
        this.$refs.tabLicenseNamed.getTableData()
      }
      if (key !== 'Assignments' && this.$refs.tabLicenseAssignments) {
        this.$refs.tabLicenseAssignments.isChange && this.$message.warning(this.$t('licenses.changeLicenseAssignmentsMessage'))
      }
    }
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/variables.less';

.licenses-management-tabs /deep/ .ant-tabs-ink-bar{
  z-index: 0!important;
}

/deep/ .ant-tabs-nav-container{
  padding-left: 25px;
  font-family: MediumWeb,serif;
}

/deep/ .ant-tabs .ant-tabs-top-content > .ant-tabs-tabpane{
  overflow: auto !important;
}
.licenses-management-tabs /deep/ .ant-tabs-bar{
  margin-bottom: 0;
}

.licenses-management-tabs /deep/ .ant-tabs-extra-content{
  float: left !important;
  padding-left: 24px;
}

.tab-title{
  font-family: MediumWeb, serif;
}

</style>

<style lang="less">
@import '~@/styles/variables.less';
.licenses-management-tab-tool {
  height: 51px;
  line-height: 48px;
  //border-bottom: 1px solid @silver;
  border-left:1px solid @ant-tooltip-border;
  box-shadow: 2px 0 0 rgba(0, 0, 0, 0.15);
  border-top: 1px solid @silver;
}
.status-header-item {
  margin-left: 16px;
  font-size: 16px;
}

.refresh-btn {
  margin-left: 16px;
}

.license-management-wrapper{
  width: 100%;
  background-color: white;
  box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
  border: solid 1px rgba(101, 102, 104, 0.16);
  border-bottom: none;

  .licenses-management-tabs {
    height: 100%;
  }
  .ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content {
    height: calc(100% - 40px);
  }
}

.licenses-question-icon{
  margin-right: 24px;
  float: right;
}
.paste-license-btn{
  color: #0079EF;
  background-color: fade(#0079EF,10%);
  margin-bottom: 16px;
}
.hide-checkbox{
  margin-right: 16px;
}
</style>
