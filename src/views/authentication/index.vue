<template>
  <div class="authentication mf-box-shadow">
    <div class="authentication-header">
      <div class="policy-tit-group">
        <span class="policy-tit-txt">{{ $t('authentication.AUTHENTICATION') }} </span>
        <!--        <span class="policy-tit-txt-max">{{ $t('authentication.Maximum20') }}</span>-->
      </div>

      <div class="policy-btn-group">
        <icon-btn
          v-if="checkPermission(['MY_CUSTOMER_CONTEXT_POLICIES_MANAGE'],['SWITCHED_CUSTOMER_CONTEXT_POLICIES_MANAGE'])"
          id="a-icon-SetDefault"
          :is-disabled="!selectedId"
          :icon-title="$t('authentication.SetasDefaultPolicy')"
          icon-style="icon-SetDefault"
          @onClick="setDefault"
        />

        <icon-btn
          v-if="serverType === SERVER_TYPE.OnPremise &&checkPermission(['ADMIN_ACCESS'])"
          id="a-icon-AssignPolicy"
          :is-disabled="!selectedId"
          :icon-title="$t('authentication.AssignPolicytoAllUsers')"
          icon-style="icon-AssignPolicy"
          @onClick="assignPolicy"
        />

        <icon-btn
          v-else-if="serverType === SERVER_TYPE.Saas &&checkPermission(['ADMIN_ACCESS'])"
          id="a-icon-AssignPolicy"
          :is-disabled="!selectedId"
          :icon-title="$t('authentication.AssignPolicytoAllCustomerUsers')"
          icon-style="icon-AssignPolicy"
          @onClick="assignPolicy"
        />

      </div>
    </div>

    <div class="authentication-content">
      <policies-all ref="policy" :icon="showAddIcon" :list="policyList" @refreshPolicy="refreshPolicy" @showSelected="showSelected" />

      <restrictions ref="restrict" :policy-id="selectedId" />

    </div>
  </div>
</template>

<script>
import PoliciesAll from './components/PoliciesAll'
import Restrictions from './components/Restrictions'
import IconBtn from '@/components/BtnIcon/index'
import { getAllPolicies } from '@/api/authentication'
import { SERVER_TYPE } from '@/store/const.js'
import { mapGetters } from 'vuex'
import { HELP_ON_THIS_PAGE } from 'config/help'

export default {
  components: {
    PoliciesAll,
    Restrictions,

    IconBtn
  },
  data() {
    return {
      SERVER_TYPE,
      policyList: [],
      selectedId: 0,
      selectedName: '',
      showAddIcon: false,
      state: '',
      reqPolicy: {},
      messageCont: ''
    }
  },
  computed: {
    ...mapGetters(['serverType'])
  },
  created() {
    this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.authentication)
  },
  methods: {
    // get all policy
    getPolicies() {
      getAllPolicies().then((request) => {
        if (!request.policies.policy) {
          this.showAddIcon = true
          return
        }

        const arr = []
        let policy = []

        Array.isArray(request.policies.policy) ? (policy = request.policies.policy) : policy.push(request.policies.policy)

        policy.forEach(item => {
          if (item['is-default']) {
            arr.push({
              policyId: item['policy-id'],
              policyName: item['policy-name'],
              isDefault: item['is-default']
            })
            if (!this.state) {
              this.selectedId = item['policy-id']
              this.selectedName = item['policy-name']
              this.showSelected(item['policy-id'], item['policy-name'], item['is-default'])
              this.$refs.policy.changeChoose(item['policy-id'], item['policy-name'])
            }
          } else {
            arr.push({
              policyId: item['policy-id'],
              policyName: item['policy-name'],
              isDefault: item['is-default']
            })
          }
        })
        this.policyList = arr

        // after create new policy, select this policy
        if (this.state === 'create') {
          this.selectedId = this.reqPolicy['policy-id']
          this.selectedName = this.reqPolicy['policy-name']
          this.showSelected(this.reqPolicy['policy-id'], this.reqPolicy['policy-name'], this.reqPolicy['is-default'])
          this.$refs.policy.changeChoose(this.reqPolicy['policy-id'], this.reqPolicy['policy-name'])
        }

        // show create policy icon or not
        this.policyList.length < 20 ? this.showAddIcon = true : this.showAddIcon = false
      })
    },
    // trigger set default policy
    setDefault() {
      this.$mfConfirm({
        title: this.$t('authentication.SetasDefaultPolicy'),
        message: this.$t('authentication.setDefaultContent'),
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('OK'),
        onConfirm: this.ChooseDefault
      })
    },

    // trigger assign policy
    assignPolicy() {
      if (this.serverType === SERVER_TYPE.OnPremise) {
        this.messageCont = this.$t('authentication.assignPolicyOpContent')
      } else {
        this.messageCont = this.$t('authentication.assignPolicySaasContent')
      }
      const confirmCont = {
        title: this.$t('authentication.AssignPolicytoAllUsers'),
        message: this.messageCont,
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('OK'),
        onConfirm: this.AssignSuccess
      }
      this.$mfConfirm(confirmCont)
    },

    // choose default policy
    ChooseDefault() {
      this.$refs.policy.chooseDefault()
    },
    // assign policy
    AssignSuccess() {
      this.$refs.policy.assignPolicy()
    },
    // refresh policyList
    refreshPolicy(val, obj) {
      this.policyList = []
      this.state = val
      this.reqPolicy = obj
      this.getPolicies()
    },

    // show restrictions of selected policy
    showSelected(id, name, isDefault) {
      this.selectedId = id
      this.$refs.restrict.getOnePolicy(id, name, isDefault)
    }
  }
}
</script>

<style lang="less" scoped>
  .authentication{
    display: flex;
    -webkit-display:flex;
    -webkit-flex-direction: column;
    flex-direction: column;
    width: 100%;
  }

  .authentication-header{
    height: 57px;
    border: 1px solid rgba(101, 102, 104, 0.16);
    box-shadow: 2px 0 0 #dcdedf;
    display: flex;
    align-items: center;
    background: #ffffff;
  }

  .policy-tit-group{
    margin-left: 24px;
    display: flex;
    align-items: center;
  }

  .policy-tit-txt{
    font-size: 16px;
    font-family: MediumWeb, serif;
    font-weight: 500;
    color: #000000;
  }

  .policy-btn-group{
    margin-left: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .policy-tit-txt-max{
    font-size: 14px;
    font-family: RegularWeb, serif;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.55);
    margin-left: 7px;
  }

  .policy-btn-left{
    height: 32px;
    border-radius: 1px;
    border: 2px solid #000000;
    padding-right: 20px;
  }

  .policy-btn-right{
    height: 32px;
    border-radius: 1px;
    border: 2px solid #000000;
    margin-left: 5%;
    padding-right: 20px;
  }

  .authentication-content{
    display: flex;
  }

  .authentication-content-left{
    width: 285px;
    flex-shrink: 0;
    height: auto;
    background: #ffffff;
    border: 1px solid rgba(101, 102, 104, 0.16);
    border-top: 0;
  }

  .list-cont-input{
    width: 40%;
    margin-left: 20px;
  }

  .content-header-list{
    display: flex;
    flex-direction: column;
    -webkit-display: flex;
    -webkit-flex-direction: column;
  }

  .list-cont{
    width: 100%;
    height: 50px;
    border: 1px solid red;
    display: flex;
    align-items: center;
  }

  .set-default{
    width: 32px;
    height: 22px;
    background: #0079EF;
    border-radius: 0px 2px 2px 0px;
    font-size: 14px;
    font-family: RegularWeb, serif;
    font-weight: 400;
    color: #FFFFFF;
    line-height: 22px;
  }

  .list-cont-icon{
    margin-left: 62%;
    font-size: 28px;
  }

  .list-cont:hover{
    background-color: #e7f0fd;
  }

  .more-btn{
    width: 98px;
    height: 32px;
  }

  .more-btn:hover{
    width: 98px;
    height: 32px;
    background-color: #e7f0fd;
  }

  .icon-copy{
    margin-right: 20px;
  }

  /deep/.ant-popover-inner-content{
    padding: 0 !important;
  }

</style>
