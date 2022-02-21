<template>
  <div class="usage-filter">
    <div v-if="serverType === SERVER_TYPE.OnPremise" class="filter-left">
      <span class="filter-tit">{{ $t('licenses.FilterBy') }}</span>
      <mf-select
        v-model="filterKind"
        style="width: 160px;margin-left: 24px"
        :allow-clear="false"
        @change="onProjectChange"
      >
        <a-select-option value="Project">Project</a-select-option>
        <a-select-option value="User">User</a-select-option>
      </mf-select>
      <span class="filter-tit">—</span>
      <div v-show="filterKind==='Project'" class="tree-select">
        <a-tree-select
          v-model="project"
          class="selectStyle tree-select-multiple"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto'}"
          :tree-data="treeData"
          multiple
          :max-tag-count="MAX_TAG_COUNT"
          :placeholder="$t('userManagement.Select_a_project')"
          :load-data="onLoadData"
          :show-checked-strategy="SHOW_PARENT"
          tree-checkable
          @select="selectProject"
        />
      </div>

      <div v-show="filterKind==='User'" class="select">
        <mf-select
          v-model="username"
          class="selectStyle"
          dropdown-class-name="user-list-dropdown"
          :allow-clear="false"
          @popupScroll="handlePopupScroll"
        >
          <a-select-option v-for="item in userList" :key="item.id" :value="item.name">{{ item.name }}</a-select-option>
        </mf-select>

      </div>
    </div>

    <div v-if="serverType === SERVER_TYPE.Saas" class="filter-left">
      <span class="filter-tit">{{ $t('licenses.FilterBy') }}</span>
      <a-input
        class="selectStyle"
        disabled
        :placeholder="$t('userManagement.Customer')"
      />
      <span class="filter-tit">—</span>
      <mf-select
        v-model="customer"
        default-value="''"
        :allow-clear="false"
        class="selectStyle"
      >
        <a-select-option v-for="item in customersSelectList" :key="item['customer-id']" :value="item['customer-id']">{{ item['customer-name'] }}</a-select-option>
      </mf-select>
    </div>

    <div class="filter-right">
      <a-button
        id="users-management_filterfrom_clearbtn"
        class="mf-btn-dashed"
        style="margin-right:8px"
        @click="onResetFilterFrom"
      >
        {{ $t("Reset") }}
      </a-button>
      <a-button id="audit-log-filter-fbtn" type="primary" @click="onFilterFunc">
        {{ $t('licenses.Generate') }}
      </a-button>
    </div>
  </div>
</template>

<script>
import MfSelect from '@/components/MFSelect'
import { mapGetters, mapActions } from 'vuex'
import { getProjectsInDomains } from '@/api/project'
import { fetchUsersList } from '@/api/user'
import { TreeSelect } from 'ant-design-vue'
import { MAX_TAG_COUNT, SERVER_TYPE } from '@/store/const'
import { debounce } from '@/utils/index'

const SHOW_PARENT = TreeSelect.SHOW_PARENT

export default {
  components: {
    MfSelect
  },
  props: {
    isShow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      debounce,
      SERVER_TYPE,
      MAX_TAG_COUNT,
      filterKind: 'Project',
      value: '',
      username: 'All',
      treeData: [],
      project: [],
      projectList: [],
      userList: [],
      customer: null,
      SHOW_PARENT,
      total: 0,
      customerList: [],
      time1: new Date(),
      init: true
    }
  },
  computed: {
    ...mapGetters({
      domainTree: 'allDomain'
    }),
    ...mapGetters(['serverType', 'activeCustomerId']),
    customersSelectList() {
      const customersSelectList = JSON.parse(JSON.stringify(this.customerList))
      customersSelectList.unshift({ 'customer-id': 'all', 'customer-name': this.$t('All') })
      return customersSelectList
    }
  },
  watch: {
    domainTree: function(val) {
      if (this.init) {
        this.init = false
        this.getDomain()
      }
    },
    project: function(val, oldVal) {
      this.projectList = this.projectList.filter(item => {
        return this.project.includes(String(item.value))
      })
      const ul = document.getElementsByClassName('tree-select-multiple')[0].getElementsByClassName('ant-select-selection__rendered')[0]
      const oriOl = ul.getElementsByClassName('tree-select-multiple-more')[0]
      if (oriOl) {
        ul.removeChild(oriOl)
      }
      if (this.project.length > 3) {
        this.$nextTick(() => {
          const ol = document.createElement('ol')
          ol.classList.add('tree-select-multiple-more')
          ol.classList.add('ant-select-selection__choice')
          const span = document.createElement('span')
          span.classList.add('ant-select-selection__choice__content')
          span.innerHTML = '+' + (this.project.length - 3) + ' ' + ((this.project.length - 3) !== 1 ? this.$t('licenses.MoreProjects') : this.$t('licenses.MoreProject'))
          ol.appendChild(span)
          let title = ''
          this.projectList.forEach((item, index) => {
            if (!(index in [0, 1, 2])) {
              title = title + (index === 3 ? '' : '\n') + item.name
            }
          })
          ol.title = title
          ul.insertBefore(ol, ul.childNodes[ul.childNodes.length - 1])
        })
      }
    }
  },
  created() {
    if (this.serverType === SERVER_TYPE.Saas) {
      this.$store.dispatch('customer/getCustomers').then(data => {
        this.customer = this.activeCustomerId
      })
      this.$store.dispatch('customer/getCustomers').then(data => {
        this.$store.dispatch('customer/getCustomerTree', this.customerId).then(data => {
          data && this.getCustomerList(data)
        })
      })
    } else {
      this.getAllDomainsData()
      this.getUsersList()
    }
  },
  updated() {
    this.onShowBadge()
  },
  mounted() {
  },
  methods: {
    getDomain() {
      this.domainTree.forEach(item => {
        this.treeData.push({
          title: item.name,
          key: item.id ? item.id.toString() : item.id,
          value: item.name,
          customId: item.customId,
          selectable: false,
          children: [],
          checkable: false
        })
      })
    },
    // Get data about all users
    getUsersList() {
      fetchUsersList(1, 10).then(res => {
        const users = res.users.user
        this.total = res.users['@total-results']
        Array.isArray(users) ? this.userList = users : this.userList.push(users)
        this.userList.splice(0, 0, { name: 'All', id: 0 })
      })
    },
    getCustomerList(dataList) {
      if (dataList) {
        dataList.forEach(item => {
          this.customerList.unshift(item)
          item['sub-customers'] && this.getCustomerList(item['sub-customers'])
        })
      }
    },
    onResetFilterFrom() {
      this.$emit('result')
    },
    filterResult() {
      this.filterKind = 'Project'
      this.project = []
      this.username = 'All'
      this.customer = this.activeCustomerId
    },
    //
    // // The rolling load
    handlePopupScroll: debounce(function() {
      this.$nextTick(() => {
        if (this.userList.length >= this.total) {
          return
        }
        // Rolling container
        const el = document.querySelector('.user-list-dropdown .ant-select-dropdown-menu-vertical')
        const offsetHeight = el.offsetHeight
        const scrollTop = el.scrollTop
        const scrollHeight = el.scrollHeight
        if (offsetHeight + scrollTop + 20 >= scrollHeight) {
          fetchUsersList(1, this.userList.length + 10).then(res => {
            const users = res.users.user
            Array.isArray(users) ? this.userList = users : this.userList.push(users)
          })
        }
      })
    }, 500),
    onShowBadge() {
      if (this.serverType === SERVER_TYPE.Saas) {
        if (this.customer === '') {
          this.$emit('iconChange', false)
        } else {
          this.$emit('iconChange', true)
        }
      } else {
        if (this.project.length === 0 && this.username === 'All' && this.filterKind === 'Project') {
          this.$emit('iconChange', false)
        } else {
          this.$emit('iconChange', true)
        }
      }
    },

    // The method to trigger generate button
    onFilterFunc() {
      if (this.serverType === SERVER_TYPE.Saas) {
        this.$emit('onFilterChange', this.customer)
      } else {
        let toArray = []
        if (this.project.length > 0) {
          this.project.forEach(item => {
            this.projectList.filter(i => {
              if (i.value === item) {
                toArray.push(i)
              }
            })
          })
          toArray = toArray.map(ele => {
            if (ele.isProject) {
              return '[' + ele.domain + '/' + ele.name + ']'
            } else {
              return '[' + ele.name + '/' + '*' + ']'
            }
          })
        }
        this.$emit('onFilterChange', toArray, this.username)
      }
    },

    // The method to trigger project-user tree-select
    onProjectChange() {
      this.project = []
      this.username = 'All'
    },
    ...mapActions(['getAllDomainsData']),

    // Get the child nodes of the domain asynchronously
    onLoadData(treeNode) {
      return new Promise((resolve) => {
        const name = treeNode.dataRef.title
        setTimeout(() => {
          getProjectsInDomains(name).then((res) => {
            let projects = res.projects.project
            projects = Array.isArray(projects) ? projects : [projects]
            const project = projects.filter(i => i['project-type'] !== 'LabManagement')
            if (!project) {
              return
            }
            const arr = []
            if (Array.isArray(project)) {
              project.forEach(item => {
                arr.push({
                  title: item.name,
                  key: treeNode.eventKey + '-' + item.id + item.name,
                  value: String(item.id),
                  isLeaf: true,
                  parentName: name
                })
              })
            } else {
              arr.push({
                title: project.name,
                key: treeNode.eventKey + '-' + project.id + project.name,
                value: String(project.id),
                isLeaf: true,
                parentName: name
              })
            }
            treeNode.dataRef.children = arr
          })
          resolve()
        }, 500)
      })
    },

    // The method of selecting Project data
    selectProject(value, node) {
      // Determine whether it is a project node
      if (this.projectList.findIndex(item => {
        return item.value === value
      }) === -1) {
        if (node.dataRef.isLeaf) {
          this.projectList.push({ isProject: true, value: value, domain: node.dataRef.parentName, name: node.dataRef.title })
        } else {
          this.projectList.push({ isProject: false, value: value, name: node.dataRef.title })
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>

.usage-filter{
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 57px;
  min-height: 57px;
  background: #FFFFFF;
  box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(101, 102, 104, 0.16);
  border-bottom: 0;
}

/deep/ .ant-select-selection__choice{
  //max-width: 165px;
  max-width: 100vw*0.08;
  //max-width: 35%;
}

.filter-left{
  display: flex;
  align-items: center;
}

.filter-tit{
  font-size: 16px;
  font-family: RegularWeb, serif;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
  line-height: 19px;
  margin-left: 24px;
}

.tree-select{
  margin-left: 24px;
}

.filter-right{
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200px !important;
  margin-right: 24px;
  //margin-left: 24px;
  //text-align: right;
  //.ant-col-16 {
  //  width: 100%;
  //}
}
.users-management_filter_rowbtn {
  text-align: right;
  .ant-col-16 {
    width: 100%;
  }
}
.selectStyle{
  min-width: 240px;
  max-width: 400px;
  width: calc( 100vw - 1100px );
  margin-left: 24px;
}

.usage-filter /deep/ .ant-select-tree-checkbox-inner{
  display: none !important;
}
.tree-select-multiple {
  /deep/ li.ant-select-selection__choice:nth-child(4), /deep/ li.ant-select-selection__choice:nth-child(5) {
    display: none;
  }
  /deep/ ol {
    height: 24px;
    margin-top: 3px;
    line-height: 22px;
  }
}
</style>
