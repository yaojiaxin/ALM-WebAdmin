<template>
  <div class="mf-display-inherit">
    <icon-btn
      id="a-icon-setPolicy"
      :is-disabled="isDisabled"
      :icon-title="$t('userManagement.SetPolicy')"
      icon-style="icon-setPolicy"
      @onClick="onClick"
    />

    <mf-modal
      id="set_policy_modal"
      :visible="visible"
      :confirm-loading="loading"
      :ok-text="$t('OK')"
      width="560px"
      @cancel="onCancel"
      @ok="onOk('policy')"
    >
      <span slot="title">
        {{ $t('userManagement.SetPolicy') }}
      </span>

      <h5 class="set-policy-h5">
        {{ $t('userManagement.Allpolicies') }}
        <span href="#" class="set-policy-a">({{ $t('Total') }} {{ policy.length }})</span>
      </h5>

      <a-radio-group v-model="value" class="set-policy-content">
        <a-radio v-for="item in policy" :id="item['policy-id'].toString()" :key="item['policy-id']" :value="item['policy-name']" class="role-radio-Style">
          {{ item['policy-name'] }}
        </a-radio>
      </a-radio-group>
    </mf-modal>

    <modal-result
      :visible.sync="resultVisible"
      :result-list="resultUserList"
    />
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import ModalResult from '@/components/ModalResult/index'
import { editUserNoMessage } from '@/api/user'
import { batchRequest } from '@/utils/packageRequest'
import toolbarMixin from '@/views/user/userToolBar/components/toolbarMixin'

export default {
  components: { IconBtn, ModalResult },
  mixins: [toolbarMixin],
  props: {
    selectedUserList: {
      type: Array,
      default: function() {
        return []
      }
    },
    policy: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      total: 0
    }
  },

  computed: {
    isDisabled: function() {
      return this.selectedUserList.length === 0
    }
  },

  watch: {
    selectedUserList: {
      handler(val) {
        if (val.length === 1 || (val.length > 1 && [...new Set(val.map(item => { return item.policy['policy-name'] }))].length === 1)) {
          this.value = val[0].policy['policy-name']
        } else {
          this.value = ''
        }
      },
      immediate: true
    }
  },

  methods: {

    submit() {
      return batchRequest(this.selectedUserList.filter(item => {
        return item.policy['policy-name'] !== this.value
      }), (item, index) => {
        const policy = this.policy.find(item => item['policy-name'] === this.value)
        return editUserNoMessage({
          user: {
            ...item,
            policy: {
              'policy-id': policy['policy-id'],
              'policy-name': policy['policy-name']
            }
          }
        })
      }, this.$t('userManagement.user edit success')).then(res => {
        this.resultMessage(res)
      })
    }
  }
}
</script>

<style lang="less" scoped>
.set-policy-h5{
    position: relative;
    color: #333;
    font-weight: bold;
    font-size: 14px;
    line-height: 16px;
    height: 19px;
    padding-left: 16px;
    margin-bottom: 10px;
}

.set-policy-h5::before{
    content: ' ';
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: #0075F3;
    border-radius: 50%;
}

.set-policy-content{
    width: 100%;
    height: 320px;
    background: #FFFFFF;
    box-shadow: 2px 2px 0 0 rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(101, 102, 104, 0.16);
    overflow: auto;

  .role-radio-Style{
    display: block;
    width: 100%;
    height: 30px;
    padding-left: 24px;
    margin-top: 15px;
    line-height: 30px;
    margin-bottom: 5px;
  }

  /deep/ .ant-radio-wrapper-checked{
    background: rgba(0, 121, 239, 0.05);
  }
}

.set-policy-a{
  font-size: 12px;
  color: #0075F3;
  font-weight: 400;
  cursor: auto;
}

</style>
