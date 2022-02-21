<template>
  <mf-modal
    :id="currentConflictType === 'same-user' ? 'handle_conflict_same_user_modal' : 'handle_conflict_same_user_name_modal'"
    class="conflict_modal"
    :visible="visible"
    :ok-text="conflictType.length === 2 && currentConflictType === 'same-user' ? $t('Next') : $t('import')"
    :cancel-text="$t('Cancel')"
    :has-spin="false"
    :confirm-loading="allLoading || isImport"
    @cancel="close"
    @ok="onOkConflict"
  >
    <!-- title -->
    <span slot="title">
      {{ $t('userManagement.handle_conflict') + ' - ' + (currentConflictType === 'same-user' ? $t('userManagement.same_user') : $t('userManagement.same_user_name')) }}
      <mf-help-btn :help="IMPORT_LDAP_USER_TREE" />
    </span>

    <!-- solution button -->
    <a-button
      id="handle_conflict_skip"
      class="mf-btn-dashed"
      :disabled="(currentConflictType === 'same-user' && sameUserSelection.length === 0) || (currentConflictType === 'same-user-name' && sameUserNameSelection.length === 0)"
      @click="setSolution('skip')"
    >
      {{ $t('userManagement.skip') }}
    </a-button>
    <a-button
      id="handle_conflict_update"
      class="mf-btn-dashed"
      style="margin-left: 8px;"
      :disabled="(currentConflictType === 'same-user' && sameUserSelection.length === 0) || (currentConflictType === 'same-user-name' && sameUserNameSelection.length === 0)"
      @click="setSolution('update')"
    >
      {{ $t('userManagement.update') }}
    </a-button>
    <a-button
      v-if="currentConflictType === 'same-user-name'"
      id="handle_conflict_auto_rename"
      class="mf-btn-dashed"
      style="margin-left: 8px;"
      :disabled="sameUserNameSelection.length === 0"
      @click="setSolution('rename')"
    >
      {{ $t('userManagement.auto_rename') }}
    </a-button>

    <!-- table -->
    <div v-show="currentConflictType === 'same-user'" class="conflict-table">
      <mf-ag-grid
        id="handle_conflict_same_user_list"
        ref="sameUserGrid"
        size="small"
        :columns="sameUserColumns"
        :data-source="sameUserList"
        :height="415"
        :loading="allLoading || isImport"
        :row-selection.sync="sameUserSelection"
      />
    </div>
    <div v-show="currentConflictType === 'same-user-name'" class="conflict-table">
      <mf-ag-grid
        id="handle_conflict_same_user_name_list"
        ref="sameUserNameGrid"
        size="small"
        :options="sameUserNameOptions"
        :columns="sameUserNameColumns"
        :data-source="sameUserNameList"
        :height="415"
        :loading="allLoading || isImport"
        :row-selection.sync="sameUserNameSelection"
      />
    </div>

    <!-- prompt -->
    <ul class="conflict_tooltip">
      <li>
        <span>{{ currentConflictType === 'same-user' ? $t('userManagement.Same_user') : $t('userManagement.Same_user_name') }} : </span>
        <span>{{ currentConflictType === 'same-user' ? $t('userManagement.Same_user_content') : $t('userManagement.Same_user_name_content') }}</span>
      </li>
      <li>
        <span>{{ $t('userManagement.Possible_solutions') }} : </span>
        <span>{{ currentConflictType === 'same-user' ? $t('userManagement.Same_user_possible_solutions') : $t('userManagement.Same_user_name_possible_solutions') }}</span>
      </li>
    </ul>

    <!-- footer button -->
    <a-button v-if="conflictType.length === 2 && currentConflictType === 'same-user-name'" id="handle_conflict_back" slot="footer" class="mf-btn-dashed" style="margin-left: 8px;" :disabled="allLoading || isImport" @click="onBackConflict">{{ $t('back') }}</a-button>

  </mf-modal>
</template>

<script>
import MfAgGrid from '@/components/MFTable/AgGrid/grid'
import SolutionSelect from '@/views/user/components/importLdap/SolutionSelect'
import Rename from '@/views/user/components/importLdap/Rename'
import { mixinImport } from './mixins/mixinImport'

import { IMPORT_LDAP_USER_TREE } from 'config/help'

import { fetchUsersList, importLDAP, updateLDAP } from '@/api/user'

export default {
  name: 'HandleConflict',
  components: {
    MfAgGrid,
    // eslint-disable-next-line vue/no-unused-components
    SolutionSelect,
    // eslint-disable-next-line vue/no-unused-components
    Rename
  },
  mixins: [mixinImport],
  props: {
    importList: {
      type: Array,
      default: () => []
    },
    updateList: {
      type: Array,
      default: () => []
    },
    conflictList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      IMPORT_LDAP_USER_TREE,

      visible: false,
      allLoading: false, // load all users when have same user name conflict, rename need all users' name
      isImport: false,

      conflictType: ['same-user'],
      currentConflictType: 'same-user',

      sameUserColumns: Object.freeze([
        {
          title: '',
          type: 'checkbox',
          pinned: 'left',
          lockPinned: true,
          width: 52,
          maxWidth: 52,
          minWidth: 52
        },
        {
          title: this.$t('login.userName'),
          dataIndex: 'name',
          width: 400,
          tooltipField: 'name',
          lockPinned: true
        },
        {
          title: this.$t('userManagement.SOLUTION'),
          dataIndex: 'solution',
          width: 280,
          minWidth: 200,
          cellRenderer: 'SolutionSelect',
          cellRendererParams: {
            mode: 'same-user'
          },
          lockPinned: true
        }
      ]),
      sameUserNameColumns: Object.freeze([
        {
          title: '',
          type: 'checkbox',
          pinned: 'left',
          lockPinned: true,
          width: 52,
          maxWidth: 52,
          minWidth: 52
        },
        {
          title: this.$t('login.userName'),
          dataIndex: 'name',
          width: 250,
          tooltipField: 'name',
          lockPinned: true
        },
        {
          title: this.$t('userManagement.SOLUTION'),
          dataIndex: 'solution',
          width: 280,
          minWidth: 200,
          cellRenderer: 'SolutionSelect',
          cellRendererParams: {
            mode: 'same-user-name'
          },
          lockPinned: true
        },
        {
          title: this.$t('userManagement.NEW_USER_NAME'),
          dataIndex: 'rename',
          width: 150,
          minWidth: 150,
          cellRenderer: 'Rename',
          lockPinned: true
        }
      ]),
      sameUserNameOptions: {
        context: {
          rename: (row) => {
            this.rename(row)
          },
          checkName: (row) => {
            this.checkName(row)
          }
        }
      },

      oriUserList: [], // all users
      sameUserList: [], // same user conflict's users
      sameUserNameList: [], // same user name conflict's users
      sameUserSelection: [],
      sameUserNameSelection: []
    }
  },
  methods: {
    async show() {
      this.visible = true

      this.sameUserList = this.conflictList.filter(item => item.type === 'same-user').map(item => {
        return {
          ...item,
          solution: 'skip'
        }
      })
      this.sameUserNameList = this.conflictList.filter(item => item.type === 'same-user-name').map(item => {
        return {
          ...item,
          solution: 'skip',
          autoRename: '',
          rename: ''
        }
      })

      if (this.sameUserNameList.length > 0) {
        this.conflictType = this.sameUserList.length > 0 ? ['same-user', 'same-user-name'] : ['same-user-name']
      } else {
        this.conflictType = ['same-user']
      }
      this.currentConflictType = this.conflictType[0]

      if (this.sameUserNameList.length > 0) {
        const data = []
        await this.getAllUsers(data, 1)
        this.oriUserList = data
      }
    },

    close() {
      this.visible = false
      this.conflictType = ['same-user']
      this.currentConflictType = 'same-user'
      this.oriUserList = []
      this.sameUserList = []
      this.sameUserNameList = []
      this.sameUserSelection = []
      this.sameUserNameSelection = []
    },

    // back
    onBackConflict() {
      this.$refs.sameUserNameGrid.deselectAll()
      this.currentConflictType = 'same-user'
    },

    // next / import
    // consider:
    // have user to add or not ? add request succeed or not ? have same user / same user name conflict or not ?
    // have user to update or not ? update request succeed or not ?
    // possible results:
    // 1 summary: add
    // 2 summary: add,            update
    // 3 summary: add,            update, update error
    // 4 summary: add, add error
    // 5 summary: add, add error, update
    // 6 summary: add, add error, update, update error
    // 7 summary:                 update
    // 8 summary:                 update, update error
    // 9 summary: none
    // 10 retry import
    onOkConflict() {
      if (this.conflictType.length === 2 && this.currentConflictType === 'same-user') {
        this.$refs.sameUserGrid.deselectAll()
        this.currentConflictType = 'same-user-name'
        this.$nextTick(() => {
          this.$refs.sameUserNameGrid.sizeColumnsToFit()
        })
      } else {
        const handleList = [...this.sameUserList, ...this.sameUserNameList]
        const oriImportList = this.importList
        oriImportList.forEach(item => {
          if (handleList.find(it => it['user-auth-data']['user-dn'] === item['user-auth-data']['user-dn'])) {
            const row = handleList.find(it => it['user-auth-data']['user-dn'] === item['user-auth-data']['user-dn'])
            if (row.solution === 'skip') {
              item.solution = 'skip'
            } else if (row.solution === 'update') {
              item.solution = 'update'
            } else if (row.solution === 'rename') {
              item.name = row.rename
            }
          }
        })
        const addList = oriImportList.filter(item => !item.solution)
        const updateList = [...this.updateList, ...oriImportList.filter(item => item.solution === 'update')]
        this.isImport = true
        if (addList.length > 0) {
          this.onImport(addList, updateList)
        } else {
          this.onUpdate(updateList, [])
        }
      }
    },

    onImport(addList, updateList) {
      importLDAP({ users: { user: addList }}).then(res => {
        const addResult = Array.isArray(res.users.user) ? res.users.user : [res.users.user]
        this.onUpdate(updateList, addResult)
      }).catch(e => {
        this.onImportFailed(e, addList, updateList)
      })
    },

    onUpdate(updateList, addResult, importFailed) {
      if (updateList.length > 0) {
        updateList.forEach(item => delete item.role)
        updateLDAP({ users: { user: updateList }}).then(res => {
          const updateResult = Array.isArray(res.users.user) ? res.users.user : [res.users.user]
          importFailed
            ? this.onImportSucceed([...this.handleRequestFailedList(addResult), ...this.handleRequestSucceedList(updateResult)]) // 5
            : this.onImportSucceed(this.handleRequestSucceedList([...addResult, ...updateResult])) // 2, 7
        }).catch(e => {
          let updateResult = e.response.data.QCRestException.ExceptionProperties.ExceptionProperty.SaValue.BulkOperationResponse.BulkEntries.BulkEntry
          updateResult = Array.isArray(updateResult) ? updateResult : [updateResult]
          importFailed
            ? this.onImportSucceed(this.handleRequestFailedList([...addResult, ...updateResult])) // 6
            : this.onImportSucceed([...this.handleRequestSucceedList(addResult), ...this.handleRequestFailedList(updateResult)]) // 3, 8
        })
      } else {
        importFailed
          ? this.onImportSucceed(this.handleRequestFailedList(addResult)) // 4
          : this.onImportSucceed(this.handleRequestSucceedList(addResult)) // 1, 9
      }
    },

    onImportSucceed(result) {
      this.isImport = false
      this.close()
      this.$emit('ok', true, result)
    },

    onImportFailed(e, addList, updateList) {
      let resultList = e.response.data.QCRestException.ExceptionProperties.ExceptionProperty.SaValue.BulkOperationResponse.BulkEntries.BulkEntry
      resultList = Array.isArray(resultList) ? resultList : [resultList]
      if (resultList.find(item => item.Exception && (item.Exception.Id === 'qccore.entity-already-exists' || item.Exception.Id === 'qccore.request-conflict'))) { // validate failed
        this.isImport = false
        this.close()
        const conflictList = this.handleRequestConflictList(this.importList, resultList)
        this.$emit('ok', false, addList, updateList, conflictList) // 10
      } else {
        this.onUpdate(updateList, resultList, true)
      }
    },

    setSolution(solution) {
      if (this.currentConflictType === 'same-user') {
        this.sameUserSelection.forEach(item => { item.solution = solution })
        this.$refs.sameUserGrid.deselectAll()
      } else {
        this.sameUserNameSelection.forEach(item => {
          if (solution === 'rename') {
            this.rename(item)
          } else {
            item.autoRename = ''
            item.rename = ''
          }
          item.solution = solution
        })
        this.$refs.sameUserNameGrid.deselectAll()
      }
    },

    rename(row) {
      row.autoRename = ''
      row.rename = ''
      row.autoRename = this.autoRename(row.name)
      row.rename = row.autoRename
    },

    checkName(row) {
      if ([...this.oriUserList, ...this.sameUserNameList].filter(it => it.name.toString().toUpperCase() === row.rename.toString().toUpperCase() || (it.rename && it.rename.toString().toUpperCase() === row.rename.toString().toUpperCase())).length > 1) {
        row.rename = row.autoRename
        this.$message.error(this.$t('userManagement.Duplicate_user_name'))
      } else {
        row.autoRename = row.rename
      }
    },

    autoRename(userName) {
      let newName = ''
      let i = 1
      const checkName = (userName) => {
        if ([...this.oriUserList, ...this.sameUserNameList].find(it => it.name.toString().toUpperCase() === (userName + i).toString().toUpperCase() || (it.rename && it.rename.toString().toUpperCase() === (userName + i).toString().toUpperCase()))) {
          i++
          checkName(userName)
        } else {
          newName = `${userName + i}`
        }
      }
      checkName(userName)
      return newName
    },

    getAllUsers(arr, startIndex) {
      const startPage = (startIndex - 1) * 100 + 1
      this.allLoading = true

      return fetchUsersList.apply(this, [startPage, 100]).then(data => {
        if (data && data.users && data.users['@total-results'] > 0) {
          let users = data.users.user
          this.total = parseInt(data.users['@total-results'])

          users = Array.isArray(users) ? users : [users]
          arr.push(...users)
          this.getAllUsers(arr, ++startIndex)
        } else {
          this.allLoading = false
        }
      }).catch(() => {
        this.allLoading = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .conflict_modal {
    /deep/ .ant-modal {
      width: 800px !important;
    }
    /deep/ .ant-modal-body {
      padding-top: 8px;
    }
  }
  .conflict-table {
    margin-top: 16px;
  }
  .conflict_tooltip {
    margin: 22px 0 0;
    padding-left: 22px;
    list-style-type: none;
    font-size: 14px;
    li:before {
      content: '';
      display: block;
      width: 4px;
      height: 4px;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.2);
      position: absolute;
      left: -22px;
      top: 8.5px;
    }
    li {
      position: relative;
      span:first-child {
        color: #323435;
      }
      span:last-child {
        color: #747577;
      }
    }
  }
</style>
