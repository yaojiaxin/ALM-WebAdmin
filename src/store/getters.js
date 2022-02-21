const getters = {
  permission_routes: state => state.permission.routes,
  addRoutes: state => state.permission.addRoutes,
  resetSession: state => state.user.resetSession,
  userName: state => state.user.userName,
  roleId: state => state.user.roleId,
  isLogin: state => state.user.isLogin,
  serverType: state => state.user.serverType,
  authType: state => state.user.authType,
  canChangePassword: state => state.user.canChangePassword,
  permission: state => state.user.permission,
  deniedFeature: state => state.user.deniedFeature,
  allDomain: state => state.tree.allDomain,
  domainList: state => state.project.domainList,
  customerId: state => state.user.customerId,
  activeCustomerId: state => state.user.activeCustomerId,
  initWeb: state => state.user.initWeb,

  // the tree selected tree node
  selectTreeNode: state => state.project.selectTreeNode,

  prefix: state => state.forge.prefix,
  publicKeyPem: state => state.forge.publicKeyPem,
  isSsprEnabled: state => state.user.isSsprEnabled,
  selectDomain: state => state.project.selectDomain,
  isChangeRouterKey: state => state.customer.isChangeRouterKey,

  customerList: state => state.customer.customerList,
  selectCustomerTreeNode: state => state.customer.selectCustomerTreeNode,

  domainHasSqlProjects: state => state.project.domainHasSqlProjects,
  domainHasProjects: state => state.project.domainHasProjects,
  siteVersion: state => state.project.siteVersion,
  labVersion: state => state.project.labVersion,

  isPageChanged: state => state.pageChange.isPageChanged,
  // helpLink
  helpLink: state => state.helpPath.helpUrl,

  // quality insight
  isSiteQualityInsightEnabled: state => state.qualityInsight.isSiteQualityInsightEnabled,

  // dbserver
  dbServerForm: state => state.dbServer.dbServerForm,

  // task status
  isTaskReminderVisible: state => state.taskStatus.isTaskReminderVisible,

  // collapsed
  collapsed: state => state.changeCollapsed.isCollapsed

}
export default getters
