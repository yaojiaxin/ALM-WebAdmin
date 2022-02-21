<template>
  <div class="authentication-content-left">
    <div class="content-header main-sidebar-title">
      <span class="content-header-txt" :title="$t('authentication.ALLPOLICIES')">
        {{ $t('authentication.ALLPOLICIES') }}
      </span>
      <!-- <a-icon v-show="icon" id="add-policy-icon" class="content-header-icon" type="plus-circle" theme="filled" @click="addNewPolicy" /> -->
      <a-tooltip placement="top" :title="$t('authentication.Maximum20')">
        <a-icon type="question-circle" />
      </a-tooltip>
      <a-button
        v-if="checkPermission(['MY_CUSTOMER_CONTEXT_POLICIES_MANAGE'],['SWITCHED_CUSTOMER_CONTEXT_POLICIES_MANAGE'])"
        shape="circle"
        :disabled="!icon"
        icon="plus"
        type="primary"
        class="mf-shape-btn"
        size="small"
        @click="addNewPolicy(icon)"
      />
      <!-- <a-icon v-show="icon" id="add-policy-icon" :disabled="true" class="content-header-icon-disable" type="plus-circle" theme="filled" /> -->
    </div>

    <div class="content-header-list">
      <div v-show="showNewName" class="policy-new editing">
        <div class="list-cont-tit">
          <div class="list-cont-input-group">
            <div class="block" />
            <a-input v-model="newName" :max-length="30" :placeholder="$t('authentication.PolicyName')" class="list-cont-input" />
          </div>
        </div>
        <div class="choose-name-icon">
          <div class="more-btn-check" @click.stop="createNewPolicy">
            <a-icon class="icon-check green" type="check" />
          </div>
          <div class="more-btn-check" @click.stop="cancelPolicy">
            <a-icon class="icon-check close" type="close" />
          </div>
        </div>
      </div>

      <div id="auth-all-policies" class="content-header-item">
        <div v-for="(item, index) in list" :id="policyIndex(index)" :key="item.policyId" :class="[item.policyId === selectedId?'list-cont-selected':'list-cont', item.policyId === editId?'editing':'']" @click.stop="showIcon(item)" @mouseenter.stop="enterIcon(item)" @mouseleave.stop="hideIcon(item)">
          <div v-if="item.isDefault" class="set-default">DEF</div>
          <div class="list-cont-tit">
            <span v-if="editId!==item.policyId" :class="[item.policyId === hoverId?'list-cont-span-hover':'list-cont-span']" :title="item.policyName">{{ item.policyName }}</span>
            <div v-if="editId===item.policyId" class="list-cont-input-group" @click.stop="stop">
              <div class="block" @click.stop="stop" />
              <a-input v-model="editName" :max-length="30" class="list-cont-input" @click.stop.native="stop" />
            </div>

          </div>

          <div v-if="checkPermission(['MY_CUSTOMER_CONTEXT_POLICIES_MANAGE'],['SWITCHED_CUSTOMER_CONTEXT_POLICIES_MANAGE'])" :class="[item.policyId === hoverId && editId!==item.policyId?'list-cont-icon':'list-cont-icon-disappear']">
            <div class="more-btn" @click="cloneInput(item)">
              <icon-btn
                id="a-icon-clone"
                :icon-title="$t('authentication.CopyPolicies')"
                :disabled="!icon"
                icon-style="icon-clone"
                class="a-icon-clone"
                @onClick="cloneInput(item)"
              />
            </div>
            <div class="more-btn">
              <icon-btn
                id="a-icon-edit"
                :icon-title="$t('authentication.EditPolicies')"
                icon-style="icon-edit"
                class="a-icon-edit"
                @onClick="showInput(item)"
              />
            </div>

            <div class="more-btn">
              <icon-btn
                id="a-icon-delete"
                :icon-title="$t('authentication.DeletePolicies')"
                class="a-icon-delete"
                icon-style="icon-delete"
                @onClick="deletePolicy(item)"
              />
            </div>
          </div>

          <div :class="[editId===item.policyId?'choose-name-icon':'choose-name-icon-disappear']">
            <div class="more-btn-check" @click.stop="updatePolicy(item)">
              <a-icon class="icon-check green" type="check" />
            </div>
            <div class="more-btn-check" @click.stop="showSpan(item)">
              <a-icon class="icon-check close" type="close" />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import { createNewPolicy, getOnePolicy, deletePolicy, updateAPolicy, assignPolicy } from '@/api/authentication'
// import { validatePolicy } from '@/utils/validate'

export default {
  components: {
    IconBtn
  },
  props: {
    choose: {
      default: false,
      type: Boolean
    },
    list: {
      default: () => [],
      type: Array
    },
    icon: {
      default: true,
      type: Boolean
    }
  },
  data() {
    return {
      newName: '',
      showNewName: false,
      selectedId: 0,
      selectedName: '',
      deleteId: 0,
      hoverId: 0,
      editId: 0,
      isDefault: false,
      editName: '',
      addBtn: false,
      cloneId: 0
    }
  },
  watch: {
    value: function(val) {
      this.icon = val
    },

    icon: function(val) {
      this.$emit('input', val)
    }
  },
  mounted() {
    this.$nextTick(function() {
      if (this.$refs.policyScroll) {
        this.$refs.policyScroll.calculateSize()
      }
    })
  },
  methods: {
    policyIndex(index) {
      return 'policy_' + index
    },
    // create new policy
    createNewPolicy() {
      this.newName = this.newName.trim()
      if (this.newName) {
        // if (validatePolicy(this.newName)) {
        //   this.$message.error(this.$t('authentication.policy_illegal_error'))
        //   return
        // }
        let arr = []
        if (this.addBtn) {
          arr = {
            policy: {
              'policy-name': this.newName,
              'is-default': false,
              validators: []
            }
          }
          createNewPolicy(arr).then((request) => {
            this.showNewName = false
            this.newName = ''
            this.$emit('refreshPolicy', 'create', request.policy)
            this.$message.success(this.$t('authentication.policy_create_success'))
            this.addBtn = false
          }).catch(e => {
            this.addBtn = true
          })
        } else {
          getOnePolicy(this.cloneId).then((request) => {
            const validators = request.policy.validators || {}
            arr = {
              policy: {
                'policy-name': this.newName,
                'is-default': false,
                validators: validators
              }
            }

            createNewPolicy(arr).then((request) => {
              this.showNewName = false
              this.newName = ''
              this.$emit('refreshPolicy')
              this.$message.success(this.$t('authentication.policy_create_success'))
              this.addBtn = false
            })
          })
        }
      } else {
        this.$message.error(this.$t('authentication.policy_name_error'))
      }
    },
    updatePolicy(item) {
      this.editName = this.editName.trim()
      if (this.editName) {
        // if (validatePolicy(this.editName)) {
        //   this.$message.error(this.$t('authentication.policy_illegal_error'))
        //   return
        // }
        const arr = {
          policy: {
            'policy-id': item.policyId,
            'policy-name': this.editName,
            'is-default': item.isDefault
          }
        }
        updateAPolicy(arr).then((res) => {
        // this.$emit('refreshPolicy')
          const index = this.list.findIndex(value => value.policyId === item.policyId)
          this.list[index].policyName = this.editName
          this.editId = 0
          this.showNewName = false
          this.$message.success(this.$t('authentication.policy_update_success'))
        })
      } else {
        this.$message.error(this.$t('authentication.policy_name_error'))
      }
    },
    // select one policy
    showIcon(item) {
      if (this.$store.getters.isPageChanged) {
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('changePageConfirm'),
          cancelText: this.$t('Cancel'),
          confirmText: this.$t('OK'),
          onConfirm: () => {
            this.$store.dispatch('pageChange/resetPageChanged')
            this.selectedId = item.policyId
            this.selectedName = item.policyName
            this.isDefault = item.isDefault
            this.$emit('showSelected', this.selectedId, this.selectedName, this.isDefault)
          }
        })
      } else {
        this.$store.dispatch('pageChange/resetPageChanged')
        this.selectedId = item.policyId
        this.selectedName = item.policyName
        this.isDefault = item.isDefault
        this.$emit('showSelected', this.selectedId, this.selectedName, this.isDefault)
      }
    },
    // show hover icon
    enterIcon(item) {
      this.hoverId = item.policyId
    },
    // hide hover icon
    hideIcon() {
      this.hoverId = 0
    },
    // show edit input
    showInput(item) {
      this.editId = item.policyId
      this.showNewName = false
      this.editName = String(item.policyName)
    },
    addNewPolicy(icon) {
      if (icon) {
        this.showNewName = true
        this.editId = 0
        this.addBtn = true
      }
    },
    changeChoose(id, name) {
      this.selectedId = id
      this.selectedName = name
    },
    // finish edit and show span
    showSpan() {
      this.editId = 0
    },
    stop() {
      event.stopPropagation()
    },
    // show delete confirm
    deletePolicy(item) {
      this.deleteId = item.policyId
      this.$mfConfirm({
        title: this.$t('authentication.DeletePolicy'),
        message: this.$t('authentication.deletePolicyContent'),
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('OK'),
        onConfirm: this.DeleteClick
      })
    },
    // delete selected policy
    DeleteClick() {
      deletePolicy(this.deleteId).then((res) => {
        this.$emit('refreshPolicy')
        this.$message.success(this.$t('authentication.policy_delete_success'))
      })
    },
    cancelPolicy() {
      this.showNewName = false
      this.newName = ''
      this.addBtn = false
    },
    cloneInput(item) {
      this.cloneId = item.policyId
      this.showNewName = true
      this.newName = `${this.$t('authentication.Clone_')}${item.policyName}`
      if (this.newName.length > 30) {
        this.newName = this.newName.slice(0, 30)
      }
      this.editId = 0
    },
    chooseDefault() {
      const index = this.list.findIndex(value => value.policyId === this.selectedId)

      const arr = {
        policy: {
          'policy-id': this.selectedId,
          'policy-name': this.list[index].policyName,
          'is-default': true
        }
      }

      updateAPolicy(arr).then((res) => {
        this.$emit('refreshPolicy')
        this.$message.success(this.$t('authentication.policy_update_success'))
      })
    },
    // assign selected policy
    assignPolicy() {
      const arr = {
        policy: {
          'policy-id': this.selectedId
        }
      }
      assignPolicy(arr).then((res) => {
        this.$emit('refreshPolicy')
        this.$message.success(this.$t('authentication.assign_policy_success'))
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

  .policy-new{
    display: flex;
    align-items: center;
    margin-bottom: 11px;
  }

  /deep/ .tool-icon-btn-i{
    font-size: 20px !important;
  }
  .content-header{
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    padding-left: 24px;
    justify-content: flex-start;

    .mf-shape-btn {
      margin-left: auto;
      margin-right: 12px;
      /deep/ i.anticon-plus {
        position: absolute;
        top: 1px;
        left: 0;
        width: 16px;
      }
    }
  }

  .content-header-txt{
    font-size: 14px;
    font-family: BoldWeb, serif;
    font-weight: bold;
    color: #000000;
    line-height: 16px;
    margin-right: 5px;
  }

  .content-header-icon{
    margin-left: 10px;
    color: #0073E7;
  }

  .content-header-icon-disable{
    margin-left: 10px;
    color: #656668;
    cursor: not-allowed;
  }

  .list-cont-input{
    width: 195px;
  }

  .content-header-list{
    display: flex;
    flex-direction: column;
    height: calc(100vh - 222px);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .main-has-customer .content-header-list{
    height: calc(100vh - 265px);
  }

  .content-header-item{
    display: flex;
    flex-direction: column;
  }

  .list-cont,
  .list-cont-selected {
    width: 100%;
    height: 32px;
    min-height: 32px;
    display: flex;
    align-items: center;
    position: relative;
    cursor: pointer;
  }

  .list-cont{
    overflow-x: hidden;
    &:hover{
      background-color: fade(@brand-blue, 5);

      //background-color: #e5f1fd;
    }
  }

  .list-cont-selected{
    background-color: fade(@brand-blue, 10);

    //background-color: #e5f1fd;
  }

  .list-cont-tit{
    margin-left: 30px;
    height: 32px;
    min-height: 32px;
    width: calc(100% - 130px);
  }

  .editing .list-cont-tit {
    width: calc(100% - 90px);
  }

  .set-default{
    position: absolute;
    left: 0;
    top: 6px;
    width: 24px;
    height: 20px;
    background: #1AAC60;
    border-radius: 0px 2px 2px 0px;
    font-size: 12px;
    font-family: RegularWeb, serif;
    font-weight: 400;
    color: #FFFFFF;
    line-height: 14px;
    display: flex;
    justify-content: center;
    align-items: center;

  }

  @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {

     /* IE10+ CSS styles go here */
    .list-cont-tit{
      width: calc(100% - 156px);
    }

}

  .list-cont-icon{
    width: 100px;
    flex-shrink: 0;
    font-size: 16px;
    display: flex;
    align-items: center;
    &-disappear{
      display: none;
    }
  }

  .more-btn{
    cursor: pointer;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
  }

  .close{
    width:32px;
    padding-right: 31px;
  }

  .a-icon-delete,.a-icon-edit{
    margin-left: 32px;
  }

  .a-icon-clone{
    margin-left: 32px;
  }

  .choose-name-icon{
    display: flex;
    align-items: center;
    margin-left: -10px;
    background-color: #ffffff;
    &-disappear{
      display: none;
    }
  }

  .icon-check{
    width: 10px;
    height: 8px;
    font-size: 12px;
  }

  .green{
    color: #1AAC60;
  }

  /deep/ .ant-modal-content{
    width: 434px !important;
  }

  /deep/ .ant-modal-body{
    margin-bottom: 27px;
  }

  .new-close{
    padding-right: 8px;
  }

  .list-cont-span{
    display: inline-block;
    width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-top: 6px;
    font-size: 16px;
    font-family: RegularWeb, serif;
    font-weight: 400;
    color: #000000;
    line-height: 19px;

  }

.list-cont-span-hover{
  display: inline-block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-top: 6px;
  font-size: 16px;
  font-family: RegularWeb, serif;
  font-weight: 400;
  color: #000000;
  line-height: 19px;
}

  .more-btn-check{
    cursor: pointer;
    width: 35px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 10px;
  }

  .more-btn-close{
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 6px;
    padding-left: -10px;
  }

  .list-cont-input-group{
    display: flex;
    align-items: center;
    margin-left: -33px;
  }

  .block{
    background-color: #ffffff;
    width: 32px;
    height: 32px;
    pointer-events: none;
  }

  .content-header /deep/ .ant-btn[disabled]{
    background-color: #656668;
    color: #ffffff
  }

</style>
