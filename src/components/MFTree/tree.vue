<template>
  <div class="mf-tree">
    <tree-node
      v-for="child in root.childNodes"
      :key="getNodeKey(child)"
      :slot="$scopedSlots"
      :node="child"
      :props="props"
      @node-expand="onNodeExpand"
    >
      <span v-for="(value, key) in $slots" :key="key" :slot="key" class="mf-tree-node-icon">
        <slot :name="key" />
      </span>
    </tree-node>
  </div>
</template>

<script>
import TreeNode from './TreeNode'
import TreeStore from './model/tree-store'
import emitter from './model/emitter'
import { getNodeKey } from './model/util'

const findNearestComponent = (element, componentName) => {
  let target = element
  while (target && target.tagName !== 'BODY') {
    if (target.__vue__ && target.__vue__.$options.name === componentName) {
      return target.__vue__
    }
    target = target.parentNode
  }
  return null
}

const removeClass = (el, cls) => {
  if (!el || !cls) return
  var classes = cls.split(' ')
  var curClass = ' ' + el.className + ' '

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.remove(clsName)
    } else if (el.classList.contains(cls)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ')
    }
  }
  if (!el.classList) {
    el.className = curClass.trim()
  }
}

const addClass = (el, cls) => {
  if (!el) return
  var curClass = el.className
  var classes = (cls || '').split(' ')

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.add(clsName)
    } else if (!el.classList.contains(cls)) {
      curClass += ' ' + clsName
    }
  }
  if (!el.classList) {
    el.className = curClass
  }
}

export default {
  name: 'Tree',
  components: { TreeNode },

  mixins: [emitter],

  props: {
    data: {
      type: Array,
      default: function() { return [] }
    },

    nodeKey: {
      type: String,
      default: ''
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
    },

    // is lazy load data
    lazy: {
      type: Boolean,
      default: false
    },

    // load data function
    load: {
      type: Function,
      default: () => {}
    },

    // loaded callback
    loaded: {
      type: Function,
      default: () => {}
    },

    currentNodeKey: {
      type: [String, Number],
      default: ''
    },

    // search string
    searchStr: {
      type: String,
      default: ''
    },

    // can draggable
    draggable: {
      type: Boolean,
      default: false
    },

    canShowRemove: {
      type: [Boolean, Function],
      default: false
    },
    canShowDisabled: {
      type: [Boolean, Function],
      default: false
    },
    expandedKey: {
      type: Array,
      default: () => []
    },
    className: {
      type: Function,
      default: () => {}
    },
    allowDrag: {
      type: Function,
      default: () => {}
    },
    allowDrop: {
      type: Function,
      default: () => {}
    },
    expandAll: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      store: null,
      root: null,
      dragState: {
        draggingNode: null,
        dropNode: null,
        allowDrop: true
      }
    }
  },

  computed: {
    children: {
      set(value) {
        this.data = value
      },
      get() {
        return this.data
      }
    }
  },

  watch: {
    data(val) {
      this.store.setData(val)
    }
  },

  created() {
    this.initTree()
  },
  methods: {
    getNodeKey(node) {
      return getNodeKey(this.nodeKey, node.data)
    },
    // expand node
    onNodeExpand(nodeData, node, instance) {
      this.broadcast('MfTreeNode', 'tree-node-expand', node)
      this.$emit('node-expand', nodeData, node, instance)
    },

    setExpandedKey(key, callback, isReload) {
      this.store.setExpandedByKeys(key, callback, isReload)
    },

    setCollapseKeys(key) {
      this.store.setCollapseKeys(key)
    },

    // init tree
    initTree() {
      this.isTree = true
      this.store = new TreeStore({
        key: this.nodeKey,
        data: this.data,
        lazy: this.lazy,
        load: this.load,
        loaded: this.loaded,
        props: this.props,
        currentNodeKey: this.currentNodeKey,
        draggable: this.draggable,
        canShowRemove: this.canShowRemove,
        canShowDisabled: this.canShowDisabled,
        className: this.className,
        expandAll: this.expandAll
      })

      this.root = this.store.root

      const dragState = this.dragState

      // Capture node drag start events
      this.$on('tree-node-drag-start', (event, treeNode) => {
        // Determine whether a node can be dragged
        if (typeof this.allowDrag === 'function' && !this.allowDrag(treeNode.node)) {
          event.preventDefault()
          return false
        }
        // Specifies an effect that is allowed by drag and drop operations
        event.dataTransfer.effectAllowed = 'move'

        try {
          event.dataTransfer.setData('text/plain', '')
        } catch (e) { console.log(e) }
        dragState.draggingNode = treeNode
        this.$emit('node-drag-start', treeNode.node, event)
      })

      // Capture node drag over events
      this.$on('tree-node-drag-over', (event, treeNode) => {
        const dropNode = findNearestComponent(event.target, 'MfTreeNode')
        const oldDropNode = dragState.dropNode

        // Delete the Class if the current node is not a place node
        if (oldDropNode && oldDropNode !== dropNode) {
          removeClass(oldDropNode.$el, 'is-drop-inner')
        }

        const draggingNode = dragState.draggingNode
        if (!draggingNode || !dropNode) return

        let dropInner = true
        let userAllowDropInner = true

        // Determines whether the current node can be placed
        if (typeof this.allowDrop === 'function') {
          userAllowDropInner = dropInner = this.allowDrop(draggingNode.node, dropNode.node, 'inner')
        }

        event.dataTransfer.dropEffect = dropInner ? 'move' : 'none'
        if (dropInner && oldDropNode !== dropNode) {
          if (oldDropNode) {
            this.$emit('node-drag-leave', draggingNode.node, oldDropNode.node, event)
          }
          this.$emit('node-drag-enter', draggingNode.node, dropNode.node, event)
        }

        dragState.dropNode = dropNode

        // Add or remove classes based on whether the current node is placed
        if (dropInner) {
          addClass(dropNode.$el, 'is-drop-inner')
        } else {
          removeClass(dropNode.$el, 'is-drop-inner')
        }

        dragState.allowDrop = userAllowDropInner
        this.$emit('node-drag-over', draggingNode.node, dropNode.node, event)
      })

      // Capture node drag over events
      this.$on('tree-node-drag-end', event => {
        const { draggingNode, dropType, dropNode } = dragState
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'

        if (draggingNode && dropNode) {
          // const draggingNodeCopy = { data: draggingNode.node.data }

          // if (dropType !== 'none') {
          //   draggingNode.node.remove()
          // }

          // dropNode.node.insertChild(draggingNodeCopy)
          // if (dropType !== 'none') {
          //   this.store.registerNode(draggingNodeCopy)
          // }

          removeClass(dropNode.$el, 'is-drop-inner')

          this.$emit('node-drag-end', draggingNode.node, dropNode.node, dropType, event)
          if (dropType !== 'none') {
            this.$emit('node-drop', draggingNode.node, dropNode.node, dropType, event)
          }
        }

        if (draggingNode && !dropNode) {
          this.$emit('node-drag-end', draggingNode.node, null, dropType, event)
        }

        dragState.draggingNode = null
        dragState.dropNode = null
        dragState.allowDrop = true
      })
    },

    reload() {
      this.initTree()
    },

    setCurrentNode(node) {
      if (this.nodeKey) {
        this.store.setUserCurrentNode(node)
      }
    },

    updateKeyChildren(key, data) {
      if (this.nodeKey) {
        this.store.updateChildren(key, data)
      }
    },

    updateByKey(key, node) {
      this.store.updateNodeByKey(key, node)
    },

    getNode(data) {
      return this.store.getNode(data)
    },

    getCurrentNode() {
      const currentNode = this.store.getCurrentNode()
      return currentNode
    },

    updateCurrentNode(data) {
      if (this.nodeKey) {
        this.store.updateCurrentNode(data)
      }
    },

    remove(data) {
      this.store.remove(data)
    },

    onSearch(val, num) {
      return this.store.expandBySearchStr(val, num)
    },

    loadDataByNode(node) {
      this.store.loadDataByNode(node)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
