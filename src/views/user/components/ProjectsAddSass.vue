<template>
  <div>
    <mf-modal
      id="projects_add_modal"
      :visible="visible"
      :confirm-loading="loading"
      width="802px"
      :ok-text="$t('Add')"
      :next-disabled="nextDisabled"
      @ok="onAddProjects"
      @cancel="onCancel"
    >
      <span slot="title" class="projects-title">
        {{ $t('userManagement.AddProjects') }}
      </span>

      <!-- <div id="projects_add_cont" class="projects-add-cont">
      <div class="mf-subtitle">
        <span>{{ $t('userManagement.ALLPROJECTS') }}</span>
      </div>
      <div id="project_add_cell" class="mf-subtitle">
        <span>{{ $t('userManagement.SELECTEDPROJECTS') }}</span>
      </div>
    </div> -->

      <mf-transfer
        v-if="visible&&treeData.length"
        type="tree"
        :datas="treeData"
        :table-columns="transferColumns"
        :exclude="exclude"
        :locale-option="localeOption"
        @selected="selected"
      />

      <!-- <mf-transfer /> -->
    </mf-modal>

    <!--    <modal-result-->
    <!--      :message-obj="MessageObj"-->
    <!--      :visible="resultVisible"-->
    <!--      :submit-show="true"-->
    <!--      :result-list="resultUserList"-->
    <!--      :columns="resultColumns"-->
    <!--      :cancel-text="$t('Close')"-->
    <!--      @resultSubmitFunc="resultSubmitFunc"-->
    <!--      @resultReturnFunc="resultReturnFunc"-->
    <!--    />-->
    <modal-result
      :visible="resultVisible"
      :is-show-cancel="false"
      :submit-show="true"
      :result-list="resultUserList"
      :columns="resultColumns"
      :ok-text="$t('Close')"
      @ok="resultReturnFunc"
      @cancel="resultReturnFunc"
    >
      <a-button id="export_after_add_project" slot="footer" class="mf-btn-dashed" @click="resultSubmitFunc">{{ $t('userManagement.userToolBar.successSubmit') }}</a-button>
    </modal-result>
  </div>

</template>

<script>
// import MfTransfer from '@/components/MFTransfer/site.vue'
import { mapGetters } from 'vuex'
import { addUserProjectNoMsg } from '@/api/user'
import { downloadCsv } from '@/utils/downloadCsv'
import ModalResult from '@/components/ModalResult/index'

export default {
  components: { ModalResult },
  props: {
    user: {
      default: '',
      type: String
    },

    exclude: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {

      visible: false,
      nextDisabled: true,

      loading: false,

      treeData: [],

      transferColumns: [
        {
          dataIndex: 'domain',
          title: this.$t('DOMAIN'),
          ellipsis: true
        },
        {
          dataIndex: 'title',
          title: this.$t('PROJECT'),
          ellipsis: true
        }
      ],
      // transferData3: [],

      selectedList: [],

      resultVisible: false,
      resultUserList: [],
      resultColumns: [
        {
          title: this.$t('userManagement.DOMAINNAME'),
          dataIndex: 'domain',
          key: 'domain',
          slots: { title: 'domain' }
        }, {
          title: this.$t('userManagement.PROJECTNAME'),
          dataIndex: 'project',
          key: 'project',
          slots: { title: 'project' }
        },
        {
          title: this.$t('userManagement.userToolBar.successTableStatus'),
          dataIndex: 'status',
          key: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: this.$t('userManagement.userToolBar.successTableMessage'),
          dataIndex: 'message',
          key: 'message'
        }
      ],
      resultReturnFunc: this.successReturn,
      resultSubmitFunc: this.successSubmit

    }
  },

  computed: {
    localeOption() {
      return {
        itemUnit: this.$t('userManagement.SELECTEDPROJECTS'),
        itemsUnit: this.$t('userManagement.ALLPROJECTS')
        // total: `(${this.$t('Total')} 10)`
      }
    },

    ...mapGetters([
      'domainList'
    ]),

    MessageObj: function() {
      return {
        title: this.$t('userManagement.OPERATIONCOMPLETE'),
        onSuccessSubmit: this.$t('userManagement.userToolBar.successSubmit'),
        successMessage: this.$t('userManagement.link_add_success')

      }
    }
  },

  watch: {
    selectedList: {
      handler() {
        this.selectedList.length > 0 ? (this.nextDisabled = false) : (this.nextDisabled = true)
      },
      immediate: true,
      deep: true
    }
    // domainList: {
    //   handler(val) {
    //     if (!val) return
    //     console.log(val)
    //     this.treeData = val.map(item => {
    //       return {
    //         ...item,
    //         key: item.name,
    //         scopedSlots: { title: 'noCheckbox' },
    //         slots: { icon: 'desktop' }
    //       }
    //     })
    //   },
    //   immediate: true
    // }
  },

  created() {
    // if (!this.domainList.length) {
    this.$store.dispatch('project/getDomainList', true).then((res) => {
      let list = res.domains.domain
      list = Array.isArray(list) ? list : [list]
      this.treeData = list.map(item => {
        return {
          ...item,
          key: item.name,
          scopedSlots: { title: 'noCheckbox' },
          slots: { icon: 'desktop' }
        }
      })
    })
    // } else {
    //   this.treeData = this.domainList.map(item => {
    //     return {
    //       ...item,
    //       key: item.name,
    //       scopedSlots: { title: 'noCheckbox' },
    //       slots: { icon: 'desktop' }
    //     }
    //   })
    // }
  },

  methods: {
    onAddProjects() {
      const arr = {
        users: {
          user: {
            name: this.user
          }
        }
      }
      this.loading = true
      const promises = this.selectedList.map((item, index) => {
        return new Promise((resolve, reject) => {
          addUserProjectNoMsg(item, arr).then(res => {
            resolve({
              key: index,
              domain: item.domain,
              project: item.project,
              status: true,
              message: this.MessageObj.successMessage
            })
          }).catch(err => {
            resolve({
              key: index,
              domain: item.domain,
              project: item.project,
              status: false,
              message: err.response.data.QCRestException.Title
            })
          })
        })
      })

      Promise.all(promises).then(res => {
        this.loading = false
        this.visible = false
        if (res.length === 1) {
          const responseData = res[0]
          if (responseData.status) {
            this.$message.success(responseData.message)
            this.$emit('refreshUser')
          } else {
            this.$message.error(responseData.message)
          }
        } else {
          this.resultUserList = res
          this.resultVisible = true
        }
        this.selectedList = []
        this.$emit('addProjectSucced')
      })
    },

    // ...mapActions(['getAllDomainsData']),

    onCancel() {
      this.visible = false
      this.selectedList = []
    },

    show() {
      this.visible = true
    },

    selected(value) {
      this.selectedList = value.map((item, index) => {
        return {
          key: index + 1,
          domain: item.domain,
          project: item.title
        }
      })
    },

    successReturn() {
      this.resultVisible = false
    },
    successSubmit() {
      downloadCsv(this.resultUserList)
      this.resultVisible = false
    }
    // getChildrenData(val) {
    //   console.log(val)
    //   this.transferData3.forEach(item => {
    //     item.children.forEach(c => {
    //       if (c.children.length > 0) {
    //         return
    //       }
    //       setTimeout(() => {
    //         getProjectsInDomains(c.parentTitle).then((res) => {
    //           const project = res.projects.project
    //           if (!project) {
    //             return
    //           }
    //           console.log(project)
    //           const arr = []
    //           if (Array.isArray(project)) {
    //             project.forEach(p => {
    //               arr.push({
    //                 title: p.name,
    //                 key: c.key + '-' + p.id,
    //                 domainName: c.parentTitle,
    //                 project: p.name,
    //                 slots: {
    //                   icon: 'user'
    //                 },
    //                 scopedSlots: { title: 'checkbox' },
    //                 checked: false,
    //                 disable: false
    //               })
    //             })
    //           } else {
    //             arr.push({
    //               title: project.name,
    //               key: c.key + '-' + project.id,
    //               domainName: c.parentTitle,
    //               project: project.name,
    //               slots: {
    //                 icon: 'user'
    //               },
    //               scopedSlots: { title: 'checkbox' },
    //               checked: false,
    //               disable: false
    //             })
    //           }
    //           c.children = arr
    //         })
    //       }, 500)
    //     })
    //   })
    //   console.log(this.transferData3)
    // }
  }
}
</script>

<style lang="less" scoped>
  .projects-title{
    font-size: 18px;
    font-weight: bold;
    color: #323435;
    line-height: 21px;
  }

  .projects-add-cont{
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: bold;
    color: #333333;
    padding-right:145px;
    margin-bottom: 18px;
  }
</style>
