<template>
  <div class="license-assignments-tabs">
    <div class="license-assignments-tabs-top" :class="{'noCustomerWrapper': !hasCustomerWrapper}">
      <div class="licenses-management-tab-tool">
        <a-button id="license-ExpandAllbtn" type="link" style="margin-left:8px " class="mf-btn-link-primary" @click="expandAll">
          {{ $t("licenses.Expand_All") }}
          <a-icon type="down" />
        </a-button>
        <span class="vertical-divider" />

        <a-button id="license-CollapesAllbtn" type="link" class="mf-btn-link-primary" @click="collapseAll">
          {{ $t("licenses.Collapse_All") }}
          <a-icon type="up" />
        </a-button>
        <span class="vertical-divider" />

        <a-checkbox id="license-ShowAssignedProjectsbtn" class="hide-checkbox status-header-item" :checked="showAssigned" @change="handleChange">
          <span style="padding-left: 8px">{{ $t("licenses.Show_Only_Assigned_Projects") }}</span>
        </a-checkbox>
        <span class="vertical-divider" />

        <!-- refresh -->
        <icon-btn
          id="license-refresh2"
          class="refresh-btn"
          :icon-title="$t('refresh')"
          icon-style="icon-refresh"
          @onClick="getLicensesAssignmentsTable1"
        />

        <mf-help-btn class="licenses-question-icon" :help="LICENSE_ASSIGNMENTS" />
      </div>

      <a-table
        id="license-assignments-table"
        class="license-assignments-table"
        :default-expand-all-rows="false"
        :columns="columns"
        :data-source="domainDatas"
        row-key="uid"
        children-column-name="project"
        :loading="loading"
        :pagination="false"
        :scroll="{ y: 'calc(100vh - 484px)' }"
        :expanded-row-keys="expandedRowKeys"
        @expand="onExpand"
      >
        <!-- column title slots -->
        <template v-for="item in columns">
          <a-tooltip
            :slot="item.dataIndex"
            :key="item.dataIndex"
            :title="item.titleText"
          >
            <span class="table-column-title-text">{{ item.titleText }}</span>
          </a-tooltip>
        </template>

        <template
          slot="name"
          slot-scope="text, record"
        >
          <i :class="['iconfont',record.isProject?'icon-Icon-Domain':'icon-project']" style="font-size: 15px; padding-right: 5px" />
          {{ text }}
        </template>

        <template
          v-for="col in titleList"
          :slot="col"
          slot-scope="text, record"
        >
          <editable-cell
            v-if="domainDatas.length"
            ref="editableRef"
            :key="col"
            :null-is0="false"
            :has-show-only="true"
            :keys="col"
            :text="text"
            :tag="String('tag-'+record.uid)"
            :exceed="record[`${col}-isExceed`]"
            @saveChange="saveChange"
            @change="onCellChange(record.uid,col, $event)"
          />
        </template>
      </a-table>

      <a-table
        id="available-table"
        class="available-table"
        height="115px"
        :show-header="false"
        :columns="columns"
        row-key="uid"
        :data-source="siteLicenses"
        :pagination="false"
      >
        <!-- column title slots -->
        <!--        <template v-for="item in columns">-->
        <!--          <a-tooltip-->
        <!--            :slot="item.dataIndex"-->
        <!--            :key="item.dataIndex"-->
        <!--            :title="item.titleText"-->
        <!--          >-->
        <!--            <span class="table-column-title-text">{{ item.titleText }}</span>-->
        <!--          </a-tooltip>-->
        <!--        </template>-->

        <template
          v-for="col in titleList"
          :slot="col"
          slot-scope="text"
        >
          <span id="parameter_table_item" :key="col" :class="text < 0 ? 'red-class' : ''">
            {{ text }}
          </span>
        </template>
      </a-table>
    </div>

    <div class="footer-save">
      <!--      <a-button id="restore-attributes" :disabled="isDisabled || !isChange" style="margin-right: 8px;" type="link" class="mf-btn-dashed" @click="getLicensesAssignmentsTable"> {{ $t('Restore') }} </a-button>-->
      <a-button
        id="license-Savebtn1"
        key="submit"
        :disabled="!isChange"
        type="primary"
        @click="editSave"
      >
        {{ $t('Save') }}
      </a-button>
    </div>
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import EditableCell from '@/views/licenses/management/components/EditableCell'
import { getLicensesAssignments, putLicensesAssignments } from '@/api/license'
import { LICENSE_ASSIGNMENTS } from 'config/help'

export default {
  name: 'LicenseAssignmentTab',
  components: { IconBtn, EditableCell },
  data() {
    return {
      LICENSE_ASSIGNMENTS,
      expandedRowKeys: [],
      columns: [],
      loading: false,
      domainDatas: [],
      oldDomainDatas: [],
      oldDomainDatas1: [],
      showAssigned: false,
      showAssignedDates: [],
      notShowAssignedDates: [],
      isDisabled: false,
      isChange: false,
      siteLicenses: [
        { uid: 0, name: this.$t('licenses.Available') },
        { uid: 1, name: this.$t('licenses.capacity') }
      ],
      titleList: [],
      licenseIsBeyond: false,
      assignmentsData: {
        'license-assignments': {
          'license-types-assignments': {
            'license-type-assignments': []
          }
        }
      }
    }
  },
  computed: {
    hasCustomerWrapper() {
      return this.checkPermission(['CUSTOMER_CONTEXT_SWITCH'])
    }
  },
  watch: {
    domainDatas: {
      handler: function(val) {
        this.isDisabled = this.licensesIsChange(val)
        if (this.isDisabled) {
          this.$store.dispatch('pageChange/pageChanged', { func: null, params: [] })
        } else {
          this.$store.dispatch('pageChange/resetPageChanged')
        }
      },
      deep: true
    }
  },
  mounted() {
    this.getLicensesAssignmentsTable()
  },
  // deactivated() {
  //   if (this.isChange) {
  //     this.$message.warning(this.$t('licenses.changeLicenseAssignmentsMessage'))
  //   }
  // },
  methods: {
    licensesIsChange(newLicenses) {
      if (Array.isArray(newLicenses) && newLicenses.length > 0) {
        return newLicenses.some(item => {
          return item.isChanged
        })
      } else {
        return newLicenses.isChanged
      }
    },
    saveChange() {
      this.isChange = false
      if (Array.isArray(this.$refs.editableRef)) {
        this.$refs.editableRef.forEach(item => {
          this.isChange = item.isSame ? item.isSame : this.isChange
        })
      }
    },

    getLicensesAssignmentsTable1() {
      this.isDisabled = this.licensesIsChange(this.domainDatas)
      if (this.isDisabled) {
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('changePageConfirm'),
          cancelText: this.$t('Cancel'),
          confirmText: this.$t('OK'),
          onConfirm: () => {
            this.$store.dispatch('pageChange/resetPageChanged')
            this.getLicensesAssignmentsTable()
          }
        })
      } else {
        this.getLicensesAssignmentsTable()
      }
    },
    getLicensesAssignmentsTable() {
      this.loading = true
      this.isChange = false
      this.domainDatas = []
      this.siteLicenses = [
        { uid: 0, name: this.$t('licenses.Available') },
        { uid: 1, name: this.$t('licenses.capacity') }
      ]
      this.columns = [
        {
          titleText: this.$t('licenses.DOMAIN_PROJECT_NAME'),
          slots: { title: 'name' },
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' },
          width: '30%'
        }
      ]
      return getLicensesAssignments().then((response) => {
        // Domain/project data
        this.domainDatas = response['license-assignments'].domains.domain
        if (this.domainDatas && !Array.isArray(this.domainDatas)) {
          this.domainDatas = [this.domainDatas]
        }
        if (Array.isArray(this.domainDatas) && this.domainDatas.length > 0) {
          // Table name column information
          this.domainDatas.map((item, index) => {
            if (item.project && !Array.isArray(item.project)) {
              item.project = [item.project]
            }
            item.isProject = true
            item.name = item['@name']
            item.uid = index + 1
            return item
          })
        }

        // Process site pool related data
        let licenses = response['license-assignments']['site-licenses'].license
        if (licenses && !Array.isArray(licenses)) {
          licenses = [licenses]
        }
        if (Array.isArray(licenses) && licenses.length > 0) {
          this.columns = [
            {
              titleText: this.$t('licenses.DOMAIN_PROJECT_NAME'),
              slots: { title: 'name' },
              dataIndex: 'name',
              scopedSlots: { customRender: 'name' },
              width: Math.round(1 / (licenses.length + 1) * 10000 / 100) + '%'
            }
          ]
          licenses.forEach(item => {
            // Process header information
            this.columns.push({
              titleText: item.name.toUpperCase(),
              slots: { title: String(item.id) },
              dataIndex: String(item.id),
              scopedSlots: { customRender: String(item.id) },
              width: Math.round(1 / (licenses.length + 1) * 10000 / 100) + '%'
            })
            // Process the information in the table
            this.siteLicenses[1][item.id] = item.capacity === -1 ? this.$t('licenses.unlimited') : item.capacity
          })
        }

        // Used site data
        let licensesTypeAssignments = response['license-assignments']['license-types-assignments']['license-type-assignments']
        if (licensesTypeAssignments && !Array.isArray(licensesTypeAssignments)) {
          licensesTypeAssignments = [licensesTypeAssignments]
        }
        if (Array.isArray(licensesTypeAssignments) && licensesTypeAssignments.length > 0) {
          // Traverse through the used licenses
          licensesTypeAssignments.forEach(licensesTypeAssignment => {
            // Traverse the assignment in Licenses
            let assignment = licensesTypeAssignment.assignment
            if (assignment && !Array.isArray(assignment)) {
              assignment = [assignment]
            }
            if (Array.isArray(assignment) && assignment.length > 0) {
              // Replicate the number of used sites
              assignment.forEach(assignmentItem => {
                // Through the assignment
                this.domainDatas.forEach(domain => {
                  // Traverse domain
                  if (assignmentItem.type === 'DOMAIN') {
                    if (domain.name === assignmentItem.subscriber) { domain[licensesTypeAssignment['@type-id']] = assignmentItem.quota }
                  } else {
                    let project = domain.project
                    if (project && !Array.isArray(project)) { project = [project] }
                    if (Array.isArray(project) && project.length > 0) {
                      // Through the project
                      project.forEach(projectItem => {
                        if (projectItem.uid === assignmentItem.subscriber) {
                          projectItem[licensesTypeAssignment['@type-id']] = assignmentItem.quota
                        }
                      })
                    }
                  }
                })
              })
            }
          })
        }
        // Count the number of remaining available sites
        this.getRemaining()
        // To deal with titleList
        this.titleList = []
        this.columns.forEach(item => {
          if (item.dataIndex !== 'name') { this.titleList.push(item.dataIndex) }
        })

        this.loading = false
        this.oldDomainDatas = JSON.parse(JSON.stringify(this.domainDatas))
        this.showAssigned && this.LicensesAssignmentsTableFilter()
      }).catch(() => {
        this.loading = false
      }).finally(() => {
        this.saveChange()
      })
    },

    getRemaining() {
      for (const key in this.siteLicenses[1]) {
        // Count the number of remaining available sites
        if (key !== 'name' && key !== 'uid') {
          let licenseUsed = 0
          this.domainDatas.forEach(domain => {
            if (domain[key]) {
              licenseUsed += Number(domain[key])
            } else {
              if (Array.isArray(domain.project) && domain.project.length > 0) {
                domain.project.forEach(project => {
                  if (project[key]) { licenseUsed += Number(project[key]) }
                })
              }
            }
          })
          this.siteLicenses[0][key] = this.siteLicenses[1][key] === this.$t('licenses.unlimited') ? this.siteLicenses[1][key] : this.siteLicenses[1][key] - licenseUsed
        }
      }
    },
    // Click on
    expandAll() {
      const self = this
      function forEachTableChildren(items) {
        if (items.project) {
          items.project.forEach(item => {
            self.expandedRowKeys.push(item.uid)
            forEachTableChildren(item)
          })
        }
      }
      this.domainDatas.forEach(item => {
        this.expandedRowKeys.push(item.uid)
        forEachTableChildren(item)
      })
    },
    // Click on the closed
    collapseAll() {
      this.expandedRowKeys = []
    },
    onExpand(expanded, record) {
      if (expanded) {
        // Set the Key of the expansion window to represent the expansion operation
        this.expandedRowKeys.push(record.uid)
      } else {
        // Represents the folding operation
        if (this.expandedRowKeys.length) {
          this.expandedRowKeys = this.expandedRowKeys.filter(v => {
            return v !== record.uid
          })
        }
      }
    },
    getIntersection(arr1, arr2) {
      const arr2Set = new Set(arr2)
      return arr1.filter(item => arr2Set.has(item))
    },
    handleChange() {
      this.showAssigned = !this.showAssigned
      this.LicensesAssignmentsTableFilter()
    },
    LicensesAssignmentsTableFilter() {
      // Filters out unallocated objects
      if (this.showAssigned) {
        // titleList
        this.notShowAssignedDates = JSON.parse(JSON.stringify(this.domainDatas))
        this.showAssignedDates = []

        // Iterate through all the data to extract the allocated objects
        this.domainDatas.forEach(AssignedItem => {
          // Traverse the domain level
          let projects = AssignedItem.project
          if (projects && !Array.isArray(projects)) { projects = [projects] }
          if (Array.isArray(projects)) {
            AssignedItem.project = projects.filter(project => {
              // Traverse the Project level
              return this.getIntersection(Object.keys(project), this.titleList).length > 0
            })
          }

          if (projects === undefined || AssignedItem.project.length < 1) {
            // Extract Domain level allocated
            const AssignedItemKey = this.getIntersection(Object.keys(AssignedItem), this.titleList)
            if (AssignedItemKey.length > 0) {
              AssignedItemKey.some(titleItem => {
                return AssignedItem[titleItem] !== null || AssignedItem.isChanged
                // return AssignedItem[titleItem] !== null
              }) && this.showAssignedDates.push(AssignedItem)
            }
            delete AssignedItem.project
          } else {
            // Extract the Project level allocated
            this.showAssignedDates.push(AssignedItem)
          }
        })
        this.domainDatas = this.showAssignedDates
        this.oldDomainDatas = JSON.parse(JSON.stringify(this.domainDatas))
        this.expandAll()
      } else {
        // The purpose of restoring all data is to restore the data modified while in the filtered state to all data
        this.showAssignedDates.forEach(showDate => {
          // Data when traversing the filter state
          if (showDate.project && !Array.isArray(showDate.project)) {
            showDate.project = [showDate.project]
          }
          this.notShowAssignedDates.forEach((notShowDate, index) => {
            // Traverse the domain level
            if (notShowDate.uid === showDate.uid) {
              const showDateProject = showDate.project
              showDate.project = notShowDate.project
              notShowDate = showDate

              if (Array.isArray(showDateProject)) {
                showDateProject.forEach(domainProject => {
                  // Traverse the Project level
                  if (notShowDate.project && !Array.isArray(notShowDate.project)) { notShowDate.project = [notShowDate.project] }
                  if (Array.isArray(notShowDate.project) && notShowDate.project.length > 0) {
                    notShowDate.project.forEach((assignedProject, assIndex) => {
                      if (assignedProject.uid === domainProject.uid) {
                        notShowDate.project[assIndex] = domainProject
                      }
                    })
                  }
                })
              }
              this.notShowAssignedDates[index] = notShowDate
            }
          })
        })
        this.domainDatas = this.notShowAssignedDates
        this.oldDomainDatas = JSON.parse(JSON.stringify(this.domainDatas))
        this.collapseAll()
      }
    },
    editSave() {
      const idList = this.titleList
      let licenseTypes = []
      let isReturn = false
      idList.forEach(idItem => {
        const column = this.columns.find(columnsItem => {
          return columnsItem.dataIndex === idItem
        })
        if (this.siteLicenses[0][idItem] < 0) {
          this.$mfConfirm({
            isShowCancel: false,
            title: this.$t('licenses.LicenseManagement'),
            iconType: 'Warning',
            message: this.$t('licenses.noLicenseAvailable', { licenseName: column.titleText }),
            confirmText: this.$t('OK')
          })
          isReturn = true
          return
        }
        const licenseType = {
          '@type-id': idItem + ''
        }
        this.domainDatas.forEach(domainData => {
          if (domainData[`${idItem + ''}-isExceed`]) {
            this.$mfConfirm({
              isShowCancel: false,
              iconType: 'Warning',
              title: this.$t('licenses.SiteManagement'),
              message: this.$t('licenses.domainMoreThanPrompt', { licenseName: column.titleText, domainName: domainData.name }),
              confirmText: this.$t('OK')
            })
            isReturn = true
            return
          }
          if (domainData[String(idItem)] !== undefined && domainData[String(idItem)] !== null) {
            if (!licenseType.assignment) {
              licenseType.assignment = []
            }
            licenseType.assignment.push({
              type: 'DOMAIN',
              subscriber: domainData['@name'],
              quota: domainData[String(idItem)]
            })
          }
          if (Array.isArray(domainData.project)) {
            domainData.project.forEach(projectData => {
              if (projectData[String(idItem)] || projectData[String(idItem)] === 0) {
                if (!licenseType.assignment) {
                  licenseType.assignment = []
                }
                licenseType.assignment.push({
                  type: 'PROJECT',
                  subscriber: projectData.uid,
                  quota: projectData[String(idItem)]
                })
              }
            })
          }
        })
        if (licenseType.assignment) {
          licenseTypes.unshift(licenseType)
        }
      })
      if (isReturn) return
      if (Array.isArray(licenseTypes) && licenseTypes.length === 1) {
        licenseTypes = licenseTypes[0]
      }
      if (this.isChange) { this.assignmentsData['license-assignments']['license-types-assignments']['license-type-assignments'] = licenseTypes }
      this.isChange = false
      putLicensesAssignments(this.assignmentsData).then(res => {
        this.getLicensesAssignmentsTable()
      }).finally(() => {
        this.saveChange()
      })
    },
    onCellChange(key, dataIndex, data) {
      // editable change
      // console.log(value)
      const { value, isChanged } = data
      const dataSource = [...this.domainDatas]

      dataSource.some(item => {
        let total = 0
        if (item.uid === key) {
          // if (!value) {
          //   delete item[String(dataIndex)]
          //   item[`${dataIndex}-isExceed`] = false
          // } else {
          //   item[String(dataIndex)] = value
          //   // item
          // }
          item[String(dataIndex)] = value
          item.isChanged = isChanged
          if (Array.isArray(item.project) && item.project.length > 0) {
            item.project.forEach(itemProject => { total += itemProject[dataIndex] ? itemProject[dataIndex] * 1 : 0 })
            item[`${dataIndex}-isExceed`] = (item[dataIndex] || item[dataIndex] === 0) ? item[dataIndex] < total : false
          }
          return true
        } else {
          if (Array.isArray(item.project) && item.project.length > 0) {
            item.project.some(itemProject => {
              if (itemProject.uid === key) {
                // if (!value) {
                //   delete itemProject[String(dataIndex)]
                // } else {
                //   itemProject[String(dataIndex)] = value
                // }
                itemProject[String(dataIndex)] = value
                item.isChanged = isChanged
                item.project.forEach(itemProject => { total += itemProject[dataIndex] ? itemProject[dataIndex] * 1 : 0 })
                item[`${dataIndex}-isExceed`] = (item[dataIndex] || item[dataIndex] === 0) ? item[dataIndex] < total : false
                return true
              }
            })
          }
        }
      })

      this.domainDatas = dataSource
      this.getRemaining()
    }
  }
}
</script>
<style scoped lang="less">
@import '~@/styles/variables.less';
.tab-tool{
  height: 56px;
  border-bottom: 1px solid fade(#656668,16%);
  padding-top:12px;
}
///deep/ .ant-table-wrapper{
//  margin-top: -2px;
//}
.license-assignments-table /deep/ .ant-table-body{
  min-height: 42px;
  background-color: @white;
  overflow-y:auto !important;
}

.license-assignments-tabs{
  // box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.15) !important;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /deep/ .ant-table{
    border-top: 1px solid fade(#656668,16%);
  }
  /deep/ .ant-table-header{
    padding-bottom:1px !important;
  }
}

.license-assignments-tabs-top{
  height: calc(100vh - 252px);
  min-height: 280px;
  padding: 24px;
  flex-grow: 1;
}
.license-assignments-tabs-top.noCustomerWrapper {
  height: calc(100vh - 212px);
}

.license-assignments-tabs /deep/ .ant-table-hide-scrollbar{
  //overflow: hidden;
  overflow-y:hidden !important;
  overflow-x:hidden !important;
  margin-bottom: 0 !important;
  //margin-right: 17px;
  //height: 58px;
}
.license-assignments-tabs /deep/ .ant-table-body{
  -ms-overflow-x: hidden;
}
.license-assignments-tabs /deep/ .ant-table-row{
  word-break: break-all;
  word-wrap: break-word;
}

.footer-save{
  height: 64px;
  width: 100%;
  background-color: @white;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 24px;
  border-top: 2px solid fade(#656668,16%);
}
.available-table /deep/ .ant-table{
  box-shadow: 2px 1px 0 fade(@black, 15%);
  .ant-table-tbody>tr>td{
    padding-left: 40px;
  }
}
.expand-icon{
  color: black;
  margin-right: 8px;
}
/deep/ .ant-table-placeholder{
  display: none;
}
.modal-table /deep/ .ant-table-placeholder{
  display: block;
}
.red-class{
  color: red;
}
.vertical-divider {
  height: 16px;
  padding-left: 8px;
  margin-right: 8px;
  border-right: 1px solid @silver;
}

/deep/ .ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content {
  height: 100%;
}
</style>
