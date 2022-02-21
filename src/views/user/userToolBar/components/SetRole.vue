<template>
  <div class="mf-display-inherit">
    <icon-btn
      id="a-icon-setRole"
      :is-disabled="isDisabled"
      :icon-title="$t('userManagement.SetRole')"
      icon-style="icon-setRole"
      @onClick="onClick"
    />

    <mf-modal
      id="set_role_modal"
      :visible="visible"
      :confirm-loading="loading"
      :ok-text="$t('OK')"
      width="500px"
      :next-disabled="nextDisabled"
      @cancel="onCancel"
      @ok="onOk('role')"
    >
      <span slot="title">
        {{ $t('userManagement.SetRole') }}
      </span>

      <h5 class="set-policy-h5">
        {{ $t('userManagement.Allroles') }}
        <span href="#" class="set-policy-a">({{ $t('Total') }} {{ role.length }})</span>
      </h5>

      <a-radio-group id="set_role_radio_group" v-model="value" class="set-policy-content">
        <a-radio v-for="item in role" :id="item['role-id'].toString()" :key="item['role-id']" :value="item['role-name']" class="role-radio-Style">
          {{ item['role-name'] }}
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
    role: {
      type: Array,
      default: () => {}
    }
  },
  data() {
    return {
    }
  },

  computed: {
    isDisabled: function() {
      return this.selectedUserList.length === 0
    },
    nextDisabled() {
      return !this.role.some(item => {
        return this.value === item['role-name']
      })
    }
  },

  watch: {
    selectedUserList: {
      handler(val) {
        if (val.length === 1 || (val.length > 1 && [...new Set(val.map(item => { return item.role['role-name'] }))].length === 1)) {
          this.value = val[0].role['role-name']
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
        return item.role['role-name'] !== this.value
      }), (item, index) => {
        return editUserNoMessage({
          user: {
            ...item,
            email: item.email ? item.email : undefined,
            role: this.role.find(item => item['role-name'] === this.value)
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
    box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
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
