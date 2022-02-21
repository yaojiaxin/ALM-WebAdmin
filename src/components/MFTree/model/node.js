import { NODE_KEY } from './util'
let nodeIdSeed = 0

const objectAssign = function(target) {
  for (let i = 1, j = arguments.length; i < j; i++) {
    const source = arguments[i] || {}
    for (const prop in source) {
      if (Object.prototype.hasOwnProperty.call(source, prop)) {
        const value = source[prop]
        if (value !== undefined) {
          target[prop] = value
        }
      }
    }
  }

  return target
}

const getPropertyFromData = function(node, prop) {
  const props = node.store.props
  const data = node.data || {}
  const config = props[prop]

  if (typeof config === 'function') {
    return config(data, node)
  } else if (typeof config === 'string') {
    return data[config]
  } else if (typeof config === 'undefined') {
    const dataProp = data[prop]
    return dataProp === undefined ? '' : dataProp
  }
}

export default class Node {
  constructor(options) {
    this.id = nodeIdSeed++
    this.text = null
    this.data = null
    this.expanded = false
    this.parent = null
    this.visible = true
    this.isCurrent = false
    this.icon = ''
    this.props = options.store.props
    this.isShowRemove = options.store.canShowRemove
    this.isDisabled = options.store.canShowDisabled
    this.className = options.store.className

    for (const option in options) {
      if (Object.prototype.hasOwnProperty.call(options, option)) {
        this[option] = options[option]
      }
    }

    this.level = 0
    this.loaded = false
    this.childNodes = []
    this.loading = false

    if (this.parent) {
      this.level = this.parent.level + 1
    }

    const store = this.store
    const key = store.key

    if (!store) {
      throw new Error('store is required')
    }

    store.registerNode(this)

    const props = store.props
    if (props && typeof props.isLeaf !== 'undefined') {
      const isLeaf = getPropertyFromData(this, 'isLeaf')
      if (typeof isLeaf === 'boolean') {
        this.isLeafByUser = isLeaf
      }
    }

    if (store.lazy !== true && this.data) {
      this.setData(this.data)

      if (store.expandAll) {
        this.expanded = true
      }
    }

    if (!this.data) return

    if (key && store.currentNodeKey !== undefined && this.key === store.currentNodeKey) {
      store.currentNode = this
      store.currentNode.isCurrent = true
    }

    if (typeof (this.isShowRemove) === 'function') {
      this.isShowRemove = this.isShowRemove(this)
    }
    if (typeof (this.isDisabled) === 'function') {
      this.isDisabled = this.isDisabled(this)
    }

    this.updateLeafState()
  }

  get label() {
    return getPropertyFromData(this, 'label')
  }

  get key() {
    const nodeKey = this.store.key
    if (this.data) return this.data[nodeKey]
    return null
  }

  setData(data) {
    const _this = this
    const markNodeData = function(node, data) {
      if (!data || data[_this.key]) return
      Object.defineProperty(data, _this.key, {
        value: node.id,
        enumerable: false,
        configurable: false,
        writable: false
      })
    }

    if (!Array.isArray(data)) {
      markNodeData(this, data)
    }
    this.data = data
    this.childNodes = []

    let children
    if (this.level === 0 && this.data instanceof Array) {
      children = this.data
    } else {
      children = getPropertyFromData(this, 'children') || []
    }

    for (let i = 0, j = children.length; i < j; i++) {
      this.insertChild({ data: children[i] })
    }
  }

  createChildren(array, defaultProps = {}) {
    array.forEach(item => {
      this.insertChild(objectAssign({ data: item }, defaultProps), undefined, true)
    })
  }

  getChildren(forceInit = false) { // this is data
    if (this.level === 0) return this.data
    const data = this.data
    if (!data) return null

    const props = this.store.props
    let children = 'children'
    if (props) {
      children = props.children || 'children'
    }

    if (data[children] === undefined) {
      data[children] = null
    }

    if (forceInit && !data[children]) {
      data[children] = []
    }

    return data[children]
  }

  remove() {
    const parent = this.parent
    if (parent) {
      parent.removeChild(this)
    }
  }

  updateNode(data) {
    this.data = data
  }

  removeChild(child) {
    const children = this.getChildren() || []
    const dataIndex = children.indexOf(child.data)

    if (dataIndex > -1) {
      children.splice(dataIndex, 1)
    }

    const index = this.childNodes.indexOf(child)

    if (index > -1) {
      this.store && this.store.deregisterNode()
      child.parent = null
      this.childNodes.splice(index, 1)
    }

    this.updateLeafState()
  }

  insertChild(child, index, batch) {
    if (!child) throw new Error('child is required')

    if (!(child instanceof Node)) {
      if (!batch) {
        // const children = this.getChildren(true)

        // if(){

        // }
      }
      objectAssign(child, {
        parent: this,
        store: this.store
      })
      child = new Node(child)
    }

    child.level = this.level + 1

    if (typeof index === 'undefined' || index < 0) {
      this.childNodes.push(child)
    } else {
      this.childNodes.splice(index, 0, child)
    }

    this.updateLeafState()
  }

  shouldLoadData() {
    return this.store.lazy === true && this.store.load && !this.loaded
  }

  // update leaf status
  updateLeafState() {
    if (this.store.lazy === true && this.loaded !== true && typeof this.isLeafByUser !== 'undefined') {
      this.isLeaf = this.isLeafByUser
      return
    }
    const childNodes = this.childNodes
    if (!this.store.lazy || (this.store.lazy === true && this.loaded === true)) {
      this.isLeaf = !childNodes || childNodes.length === 0
      return
    }
    this.isLeaf = false
  }

  updateChildren() {
    const newData = this.getChildren() || []
    const oldData = this.childNodes.map((node) => node.data)

    const newDataMap = {}
    const newNodes = []

    newData.forEach((item, index) => {
      const key = item[NODE_KEY]
      const isNodeExists = !!key && oldData.findIndex(data => data[NODE_KEY] === key) >= 0

      if (isNodeExists) {
        newDataMap[key] = { index, data: item }
      } else {
        newNodes.push({ index, data: item })
      }
    })

    if (!this.store.lazy) {
      oldData.forEach((item) => {
        if (!newDataMap[item[this.props.key]]) {
          this.removeChildByData(item)
        }
      })
    }

    newNodes.forEach(({ index, data }) => {
      this.insertChild({ data }, index)
    })

    this.updateLeafState()
  }

  removeChildByData(data) {
    let targetNode = null

    for (let i = 0; i < this.childNodes.length; i++) {
      if (this.childNodes[i].data === data) {
        targetNode = this.childNodes[i]
        break
      }
    }

    if (targetNode) {
      this.removeChild(targetNode)
    }
  }

  async loadData(callback, defaultProps = {}, isReload) {
    if ((this.shouldLoadData() && (!this.loading || Object.keys(defaultProps).length)) || isReload) {
      this.loading = true
      const resolve = (children, props) => {
        this.loaded = true
        this.loading = false
        this.childNodes = []

        this.createChildren(children, { ...defaultProps, ...props })
        this.updateLeafState()
        if (callback) {
          callback.call(this, children)
        }
      }

      try {
        await this.store.load(this, resolve)
      } catch (e) { this.loading = false }
    } else {
      if (callback) {
        callback.call(this)
      }
    }
  }

  expand(callback, expandParent, isReload = false) {
    const done = () => {
      if (expandParent) {
        let parent = this.parent

        while (parent.level > 0) {
          parent.expanded = true
          parent = parent.parent
        }
      }
      this.expanded = true
      if (callback) callback()
    }

    if (this.shouldLoadData() || isReload) {
      this.loadData(data => {
        if (data instanceof Array) {
          done()
        }
      }, undefined, isReload)
    } else {
      done()
    }
  }

  collapse() {
    this.expanded = false
  }

  // Exclude nodes that cannot be placed
  _excludeNode(node) {
    this.store._excludeNode(node)
    // this.newDataMap
  }
}
