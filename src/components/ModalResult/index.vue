<template>
  <!--  Operation success dialog box  -->
  <a-modal
    id="tool-success-modal"
    class="mf-success-modal"
    v-bind="$attrs"
    :width="width"
    :title="$t('userManagement.operation_complete')"
    :mask-closable="$attrs.maskClosable || false"
    v-on="$listeners"
    @cancel="onCancel"
  >
    <template slot="footer">
      <a-button
        v-if="isShowCancel"
        id="icon-success-modal-submit"
        key="back"
        type="link"
        class="mf-btn-dashed"
        @click="onCancel"
      >
        {{ $attrs['cancel-text'] || $t('Cancel') }}
      </a-button>
      <slot name="footer" />
      <a-button
        id="icon-success-modal-return"
        ref="success-modal-submit"
        key="submit"
        type="primary"
        @click="onOk"
      >
        {{ $attrs['ok-text'] || $t('OK') }}
      </a-button>
    </template>

    <a-table
      id="tool-success-table"
      :columns="columns"
      size="small"
      :scroll="{ y: calcModalTableHeight(57) }"
      :data-source="resultList"
      :pagination="false"
    >
      <template slot="status" slot-scope="status">
        <span v-if="status">
          <a-icon type="check-circle" theme="filled" style="color: #1AAC60" />
        </span>
        <span v-else>
          <a-icon type="close-circle" theme="filled" style="color: #E5004C" />
        </span>
      </template>
    </a-table>
  </a-modal>
</template>

<script>
import { calcModalTableHeight } from '@/utils'

export default {

  props: {
    isShowCancel: {
      type: Boolean,
      default: false
    },
    resultList: {
      type: Array,
      default: () => {
        return []
      }
    },
    columns: {
      type: Array,
      default() {
        return [{
          title: this.$t('userManagement.userToolBar.successTableTitle'),
          dataIndex: 'name',
          key: 'name',
          slots: { title: 'customTitle' }
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
        }]
      }
    },
    width: {
      type: String,
      default() {
        return '581px'
      }
    }
  },
  data() {
    return {
    }
  },

  watch: {
    resultList: {
      handler: function(val) {
        this.resultList = val
      },
      deep: true
    },
    '$attrs.visible'(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs['success-modal-submit'].$el.focus()
        })
      }
    }
  },

  methods: {
    calcModalTableHeight,

    onCancel() {
      if (this.$listeners.cancel) {
        this.$listeners.cancel()
      } else {
        this.$emit('update:visible', false)
      }
    },

    onOk() {
      if (this.$listeners.ok) {
        this.$listeners.ok()
      } else {
        this.$emit('update:visible', false)
      }
    }
  }
}
</script>

<style scoped lang="less">
.mf-success-modal /deep/ .ant-modal-close{
  /*margin-top: 15px;*/
}
.mf-success-modal /deep/ .ant-table-tbody > tr > td {
  max-width: 110px;
  //white-space: nowrap;
  //overflow: hidden;
  //text-overflow: ellipsis;
}

</style>
