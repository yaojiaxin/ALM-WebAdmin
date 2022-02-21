<template>
  <div class="mf-transfer">
    <div class="mf-transfer-panel">
      <div class="mf-subtitle">
        {{ localeOption.itemsUnit }}
      </div>

      <div class="mf-transfer-list-panel">
        <a-input-search
          v-model="searchVal"
          :placeholder="$t('inputSearchPlaceholder')"
          class="search-input"
          @search="onSearchTable"
        />
        <a-spin :spinning="loading">
          <div class="mf-transfer-left-table">
            <check-list
              v-model="leftSelectedRows"
              :disabled-all="disabledAll"
              :data="userList"
              name="source"
              @load="onScroll"
              @checked="checkedUsers"
              @unchecked="uncheckedUsers"
            />
          </div>
        </a-spin>
      </div>
    </div>

    <div class="mf-transfer-operation">
      <a-button
        type="primary"
        icon="right"
        size="small"
        :disabled="disabledToRight"
        @click="onTransToRight"
      />
      <a-button
        type="primary"
        icon="left"
        size="small"
        :disabled="disabledToLeft"
        @click="onTransToLeft"
      />
    </div>
    <div class="mf-transfer-list">
      <div class="mf-subtitle">
        {{ localeOption.itemUnit }}
      </div>

      <div class="mf-transfer-list-panel" style="height: 285px">
        <check-list v-model="rightSelectedRows" :data="selectedUsers" name="select" />
      </div>

    </div>

  </div>
</template>

<script>
import { fetchUsersList } from '@/api/user'
// import { PAGE_SIZE } from '@/store/const'
import i18n from '@/locales'
import CheckList from './CheckList'
import { sorting } from '@/utils'

const PAGE_SIZE = 100

export default {
  components: { CheckList },
  props: {
    // You need to exclude items when loading the domain tree
    exclude: {
      type: Array,
      default: () => []
    },

    value: {
      type: Array,
      default: () => []
    },

    localeOption: {
      type: Object,
      default: () => {
        return {
          itemsUnit: i18n.tc('project.users.all_users'),
          itemUnit: i18n.tc('project.users.selected_users')
        }
      }
    }
  },

  data() {
    return {
      loading: false,

      columns: Object.freeze([
        {
          dataIndex: 'name',
          ellipsis: true,
          title: this.$t('login.userName'),
          sorter: (a, b) => sorting(a.name, b.name)
        },
        {
          dataIndex: 'full-name',
          ellipsis: true,
          title: this.$t('userManagement.FULL_NAME'),
          sorter: (a, b) => sorting(a['full-name'], b['full-name'])
        }
      ]),

      userList: [],

      startIndex: 1,

      total: 0,

      leftSelectedRows: [],

      rightSelectedRows: [],

      selectedUsers: [],

      searchVal: '',

      allChecked: []
    }
  },

  computed: {
    disabledToRight() {
      let difference = []
      const disabled = this.userList.filter(i => i.disabled)

      if (disabled) {
        difference = this.leftSelectedRows.filter(i => disabled.findIndex(j => j.name === i.name) === -1)
      }

      return this.leftSelectedRows.length === 0 || difference.length === 0
    },

    disabledToLeft() {
      return this.rightSelectedRows.length === 0
    },

    disabledAll() {
      // let searchedStatus = false
      let diffrent = []
      diffrent = this.userList.filter(i => this.selectedUsers.findIndex(u => u.name === i.name) === -1)
      return diffrent.length === 0
    }
  },

  watch: {
    value: function(val) {
      this.selectedUsers = val
    },
    selectedUsers: function(val) {
      this.$emit('input', val)
    }
  },

  created() {
    this.getUserList(this.exclude)
  },

  methods: {
    checkedUsers(checkList) {
      this.allChecked = this.allChecked.concat(checkList)
    },

    uncheckedUsers(unchecked) {
      const union = this.userList.filter(i => !i.disabled && unchecked.findIndex(j => j.name === i.name))

      union.forEach(item => {
        const index = this.allChecked.findIndex(i => i.name === item.name)
        // const uIndex = this.userList.findIndex(j => j.name === item.name)

        // this.$set(this.userList, uIndex, { ...item, disabled: false })
        this.allChecked.splice(index, 1)
      })
    },

    onRestTransfer() {
      this.rightSelectedRows = []
      this.selectedUsers = []
      this.startIndex = 1
    },

    // left table to right table
    onTransToRight() {
      this.leftSelectedRows.forEach(item => {
        const index = this.selectedUsers.findIndex(i => i.name === item.name)

        if (index === -1) {
          this.selectedUsers.push({ ...item, disabled: false })
        }
      })
      if (this.leftSelectedRows.length > 0) {
        this.userList = this.userList.map(i => {
          if (this.leftSelectedRows.find(j => j.name === i.name)) {
            i.disabled = true
          }
          return i
        })
      }
    },

    // right table to left table
    onTransToLeft() {
      const transferData = JSON.parse(JSON.stringify(this.rightSelectedRows))
      transferData.forEach((item, rightIndex) => {
        const index = this.selectedUsers.findIndex(x => x.name === item.name)
        // is exsit in userList
        const isExistIndex = this.userList.findIndex(i => i.name === item.name)

        if (isExistIndex === -1) {
          this.userList.push(item)
        } else {
          this.userList = this.userList.map((i, index) => {
            if (index === isExistIndex) {
              i.disabled = false
              i.checked = false
            }
            return i
          })
        }

        if (index > -1) {
          this.selectedUsers.splice(index, 1)
        }

        const leftIndex = this.leftSelectedRows.findIndex(i => i.name === item.name)

        if (leftIndex > -1) {
          this.leftSelectedRows.splice(leftIndex, 1)
        }
      })
      this.rightSelectedRows = []
    },

    // search user list
    onSearchTable(value) {
      this.userList = []

      if (value) {
        this.getUserList(this.exclude, 1, value.trim())
      } else {
        this.getUserList(this.exclude, 1)
      }
    },

    onScroll() {
      if (Math.ceil(this.total / PAGE_SIZE) > this.startIndex) {
        this.getUserList(this.exclude, this.startIndex + 1, this.searchVal.trim())
      }
    },

    // get users
    getUserList(exclude, startIndex = 1, query) {
      this.loading = true
      let excludeCopy = []

      if (exclude) {
        excludeCopy = JSON.parse(JSON.stringify(exclude))
      }
      this.startIndex = startIndex

      const startPage = (startIndex - 1) * PAGE_SIZE + 1
      const pageSize = PAGE_SIZE

      fetchUsersList(startPage, pageSize, query, true).then(data => {
        this.total = data.users['@total-results']
        const users = data.users.user ? (Array.isArray(data.users.user) ? data.users.user : [data.users.user]) : []

        if (excludeCopy && excludeCopy.length > 0 && (this.userList.length < startIndex * PAGE_SIZE)) {
          const intersect = [...users].filter(x => excludeCopy.findIndex(i => i.name === x.name) > -1)

          // Removes data that has been excluded from the array
          if (intersect && intersect.length > 0) {
            this.userList.push(...this.formatDataForCheckbox([...users].filter(x => excludeCopy.findIndex(i => i.name === x.name) === -1)))
            const excludeNext = excludeCopy.filter(x => intersect.findIndex(i => i.name === x.name) === -1)

            if (Math.ceil(this.total / PAGE_SIZE) > startIndex) {
              this.getUserList(excludeNext, ++startIndex, query)
            }
          } else {
            this.userList.push(...this.formatDataForCheckbox(users))
          }
        } else {
          this.userList.push(...this.formatDataForCheckbox(users))
        }

        this.leftSelectedRows = []
        this.selectedUsers.forEach(ditems => {
          const findIndex = this.userList.findIndex(i => i.name === ditems.name)

          if (findIndex >= 0) {
            this.$set(this.userList, findIndex, { ...ditems, disabled: true, checked: true })
            this.leftSelectedRows.push(ditems)
          }
        })
        this.loading = false
      }).catch(_ => {
        this.loading = false
      })
    },

    formatDataForCheckbox(arr) {
      arr = arr.map(item => {
        return Object.assign(item, { value: JSON.stringify(item) })
      })
      return arr
    }
  }
}
</script>

<style lang="less" scoped>
.mf-transfer{
  display: flex;
  flex-direction: row;
  align-items: center;
}

.mf-transfer-panel{
}

.mf-transfer-list-panel{
  width: 348px;
  height: 100%;
  margin-top: 8px;
  // box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(101, 102, 104, 0.16);

  /deep/ .ant-table{
    border-top: none;
    box-shadow: none;
    border-left: none;
  }

  .search-input{
    width: 280px;
    margin-left: 35px;
    margin-top: 8px;
  }
}

.mf-transfer-operation{
  display: flex;
  flex-direction: column;
  margin: 0 16px;
  align-items: center;
}
.mf-transfer-operation .ant-btn-icon-only{
  width: 24px;
  height: 24px;
  min-width: 24px;

  &:first-child{
    margin-bottom: 8px;
  }
}

.mf-transfer-left-table{
  height: 235px;
}
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  /deep/ .ant-table-header{
    overflow-y:hidden !important;
  }
  /deep/ .ant-table-body {
    overflow-y:auto !important;
  }
}

.list-total{
  font-family: RegularWeb;
  color: #0075F3;
  font-size: 13px;
}

</style>
