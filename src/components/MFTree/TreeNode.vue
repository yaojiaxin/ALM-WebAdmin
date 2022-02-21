<template>
  <div
    class="mf-tree-node"
    :class="{
      'is-current': node.isCurrent?node.isCurrent:false,
      'is-expanded': expanded,
    }"
    @click.stop="onClickNode"
  >
    <div
      class="mf-tree-node_content"
      :class="node.className ? node.className(node): ''"
      :draggable="tree.draggable"
      :style="{ 'padding-left': (node.level - 1) * 16 + 24 + 'px' }"
      @dragstart.stop="onDragStart"
      @dragover.stop="onDragOver"
      @dragend.stop="onDragEnd"
    >
      <span
        v-if="!node.isLeaf"
        :class="{
          'ant-tree-switcher': true,
          'ant-tree-switcher_open': expanded,
          'ant-tree-switcher_close': !expanded
        }"
        @click.stop="onExpandClick"
      >
        <a-icon v-if="!node.loading" :style="{fontSize: '12px'}" type="down" class="ant-tree-switcher-icon" />
        <a-icon v-if="node.loading" type="loading" />
      </span>

      <span v-else class="is-leaf" />

      <slot v-if="node.data.slots && node.data.slots.icon" :name="node.data.slots.icon" />

      <span class="mf-tree-node_label mf-flex-1" :title="node.label">
        {{ node.label }}
      </span>
      <icon-btn
        v-if="node.isShowRemove"
        :disabled="node.isDisabled"
        class="mf-tree-node_remove"
        icon-style="icon-delete"
        style="margin-right: 20px"
        :icon-title="$t('Delete')"
        @onClick="onRemove"
      />
    </div>

    <div
      v-show="expanded"
      class="mf-tree-node_children"
    >
      <mf-tree-node
        v-for="child in node.childNodes"
        :key="child.key"
        :node="child"
        @node-expand="onChildNodeExpand"
      >
        <span v-for="(value, key) in $slots" :key="key" :slot="key" class="mf-tree-node-icon">
          <slot :name="key" />
        </span>
      </mf-tree-node>
    </div>
  </div>
</template>

<script>
import emitter from './model/emitter'
import IconBtn from '@/components/BtnIcon'
import { getNodeKey } from './model/util'

export default {
  name: 'MfTreeNode',

  components: { IconBtn },

  mixins: [emitter],
  props: {
    node: {
      type: Object,
      default: () => {
        return {
          label: ''
        }
      }
    },

    renderAfterExpand: {
      type: Boolean,
      default: true
    },

    props: {
      type: Object,
      default() {
        return {
          children: 'children',
          label: 'label',
          disabled: 'disabled',
          key: 'key',
          isLeaf: 'isLeaf'
        }
      }
    }
  },

  data() {
    return {
      tree: null,
      // loading: false,

      expanded: false,
      childNodeRendered: false

      // nodeProps: this.props
    }
  },

  watch: {
    'node.expanded'(val) {
      this.$nextTick(function() {
        this.expanded = val
      })

      if (val) {
        this.childNodeRendered = true
      }
    }
  },

  created() {
    const parent = this.$parent

    if (parent.isTree) {
      this.tree = parent
    } else {
      this.tree = parent.tree
    }
    const tree = this.tree
    if (!tree) {
      console.warn('cannot find nodes')
    }
    // const props = tree.props || {}
    // const childrnKey = props.children || 'children'

    // this.$watch(`node.data.${childrnKey}`, () => {
    //   this.node.updateChildren()
    // })

    if (this.node.expanded) {
      this.expanded = true
    }
  },

  methods: {
    getNodeKey(node) {
      return getNodeKey(this.tree.nodeKey, node.data)
    },

    onDragStart(event) {
      if (!this.tree.draggable) return
      this.tree.$emit('tree-node-drag-start', event, this)
      // this.node._excludeNode(this.node)
    },

    onDragOver(ev) {
      if (!this.tree.draggable) return
      this.tree.$emit('tree-node-drag-over', event, this)
      event.preventDefault()
    },

    onDragEnd(event) {
      if (!this.tree.draggable) return
      this.tree.$emit('tree-node-drag-end', event, this)
    },

    onRemove() {
      this.tree.$emit('node-remove', this.node.data, this.node, this)
    },

    onExpandClick() {
      if (this.expanded) {
        this.tree.$emit('node-collapse', this.node.data, this.node, this)
        this.node.collapse()
      } else {
        this.node.expand(() => {
          this.$emit('node-expand', this.node.data, this.node, this)
        })
      }
    },

    // click tree node
    onClickNode() {
      const store = this.tree.store
      store.setCurrentNode(this.node)

      const currentNode = store.currentNode
      this.tree.$emit('current-change', currentNode ? currentNode.data : null, currentNode)

      this.tree.currentNode = this
      this.tree.$emit('node-click', this.node.data, this.node, this)
    },

    onChildNodeExpand(nodeData, node, instance) {
      this.broadcast('MfTreeNode', 'tree-node-expand', node)
      this.tree.$emit('node-expand', nodeData, node, instance)
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";
.ant-tree-switcher{
  padding-right: 8px;
}
.ant-tree-switcher:hover{
  cursor: pointer;

  i{
    font-size: 12px;
  }
}

.mf-tree-node-icon{
  display: inline-block;
  width: 14px;
  height: 14px;
  margin: 0;
  line-height: 14px;
  text-align: center;
  vertical-align: top;
  border: 0;
  outline: none;
  cursor: pointer;
  margin-right: 8px;

  i{
    font-size: 18px;
  }
}
.ant-tree-switcher_close .ant-tree-switcher-icon{
  transform: rotate(-90deg);
}

.mf-tree-node_content{
  height: 32px;
  display: flex;
  align-items: center;

  &:hover{
    cursor: pointer;
  }
}

.mf-tree-node.is-current > .mf-tree-node_content{
  font-family: MediumWeb;
  background-color: fade(@brand-blue, 10);
}

.mf-tree-node.is-expanded >.mf-tree-node_children{
  display: block;
}

.is-leaf{
  display: inline-block;
  width: 20px;
}

.mf-tree-node_label{
  color: #323435;
  white-space:nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mf-tree-node_content:hover{
  background-color: fade(@brand-blue, 5);
}

.mf-tree-node_remove{
  display: none;
}

.mf-tree-node_content:hover{
  .mf-tree-node_remove{
    display: inline-block;
  }
}

.mf-tree-node.is-drop-inner > .mf-tree-node_content{
  background-color: fade(@brand-blue, 5);
}
</style>
