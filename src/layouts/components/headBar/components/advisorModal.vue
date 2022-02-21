<template>
  <mf-modal
    id="advisor-modal"
    :visible="visible"
    :confirm-loading="loading"
    width="802px"
    height="638px"
    :cancel-text="$t('Close')"
    @cancel="onCancel"
    @ok="onCancel"
  >
    <span slot="title" class="modal-title">
      {{ $t('helpLinks.ALM_Advisor') }}
      <!--      <mf-help-btn :help="PROJECT_UPDATE_PRIORITIZATION_HELP" />-->
    </span>
    <p class="modal-clues">{{ $t('tools.advisorHead') }}</p>
    <p>{{ $t('tools.advisorHeadTitle') }}</p>
    <div class="process-body">
      <div class="item">
        <span class="Odiv">1</span>
        <p class="num-title">{{ $t('tools.advisorBodyTitle1') }}</p>
      </div>
      <a-button
        id="advisor-collect"
        type="primary"
        class="collect-btn"
        :loading="collectLoading"
        :disabled="collectDisabled"
        @click="onCollect"
      >{{ $t('tools.advisorCollect') }}</a-button>

      <div :class="['item','item1-bottom']" style="margin-left: 40px; margin-bottom: 10px">
        <a-checkbox id="advisor-data-protection" @change="onDataProtectionChange">
          <span>{{ $t('tools.advisorDataProtection') }}</span>
        </a-checkbox>
        <div style="margin-left: 25px; color: #747577">
          {{ $t('tools.advisorSelecting') }}
          <a-tooltip
            :title="$t('tools.almAdvisor.DataProtectionTooltip')"
            placement="bottom"
            :overlay-style="{'white-space': 'pre-line'}"
            overlay-class-name="bgc_tooltip"
          >
            <a-icon style="margin-left: 8px" type="question-circle" />
          </a-tooltip>
        </div>
      </div>

      <div class="item">
        <span class="Odiv">2</span>

        <p class="num-title">{{ $t('tools.advisorBodyTitle2',{path}) }}</p>
      </div>
      <div class="item">
        <span class="Odiv">3</span>

        <p class="num-title">{{ $t('tools.advisorBodyTitle3') }}</p>
      </div>
      <div class="item">
        <span class="Odiv">4</span>
        <p class="num-title">{{ $t('tools.advisorClickThe') }} <a target="_blank" :href="ALM_ADVISOR_GO_TO_SITE" style="text-decoration:underline;">{{ $t('tools.advisorGoToSite') }}</a>{{ $t('tools.advisorBodyTitle4') }}</p>
      </div>
    </div>
  </mf-modal>
</template>

<script>
import { BASE_REPOSITORY_PATH, ALM_ADVISOR_GO_TO_SITE } from 'config/help'

import { almCollect, getConfigurationParameter } from '@/api/configuration'

export default {
  name: 'AdvisorModal',
  data() {
    return {
      visible: false,
      loading: false,
      collectLoading: false,
      protection: false,
      BASE_REPOSITORY_PATH,
      path: '',
      collectDisabled: false,
      ALM_ADVISOR_GO_TO_SITE
    }
  },
  methods: {
    onCancel() {
      this.visible = false
    },
    onShow() {
      this.collectDisabled = false
      getConfigurationParameter().then(response => {
        const parameters = response['site-parameters']['site-parameter']
        if (Array.isArray(parameters)) {
          const hasItem = parameters.find((item) => {
            return item.name === this.BASE_REPOSITORY_PATH
          })
          if (hasItem.value.includes('\\')) {
            this.path = hasItem.value + '\\productData\\assessment\\results\\AssessmentInfo_' + '<' + 'current date>.zip'
          } else {
            this.path = hasItem.value + '\/productData\/assessment\/results\/AssessmentInfo_' + '<' + 'current date>.zip'
          }
        }
      })
      this.visible = true
    },
    onDataProtectionChange() {
      this.protection = !this.protection
    },
    onCollect() {
      this.collectLoading = true
      almCollect(this.protection).then(res => {
        this.collectDisabled = true
        this.$message.success(this.$t('tools.Start_to_Collect'))
      }).finally(() => {
        this.collectLoading = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
.modal-clues{
  font-weight: 600;
  line-height: 19px;
  font-family: MediumWeb;
  margin-bottom: 16px;
}
.item1-bottom{
  display: inline !important;
}
.process-body{
  width: 754px;
  overflow:auto;
  background-color: #F5F7F8;
  padding-left: 18px;
  padding-top: 24px;
}
.Odiv{
  display: block;
  min-width: 26px;
  min-height: 26px;
  width:26px;
  height:26px;
  border-radius:50%;
  background-color:#0079EF;
  color: white;
  text-align: center;
  font-size: 18px;
}
.item{
  display: flex;
  float:left;
  //width: 730px;
  margin-bottom: 4px;
}
.num-title{
  margin-left: 16px;
  margin-top: 4px;
  word-wrap:break-word
}
/deep/ .mf-btn-Save{
  display: none;
}
.collect-btn{
  float: right;
  margin-right: 24px;
}
</style>
<style lang="less">
/deep/ .bgc_tooltip{
    /deep/ .ant-tooltip-inner{
      min-width: 430px !important;
    }
}

</style>

