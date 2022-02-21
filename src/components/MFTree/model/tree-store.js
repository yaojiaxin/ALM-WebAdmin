import Node from './node'
import { getNodeKey } from './util'
export default class TreeStore {
  constructor(options) {
    this.currentNode = null
    this.currentNodeKey = null

    this.nodesMap = {}

    for (const option in options) {
      // eslint-disable-next-line no-prototype-builtins
      if (options.hasOwnProperty(option)) {
        this[option] = options[option]
      }
    }
    this.root = new Node({
      data: this.data,
      store: this
    })

    if (this.lazy && this.load) {
      const loadFn = this.load

      loadFn(this.root, (data) => {
        this.root.createChildren(data)

        if (this.loaded) this.loaded(this.root)
      })
    }
  }

  loadDataByNode(node) {
    const loadFn = this.load

    loadFn(node, (data) => {
      node.createChildren(data)
    })
  }

  registerNode(node) {
    const key = this.key

    if (!key || !node || !node.data) return

    const nodeKey = node.key
    if (nodeKey !== undefined) this.nodesMap[node.key] = node
  }

  updateCurrentNode(data) {
    // if (this.currentNode) {
    //   const node = this.nodesMap[this.currentNode.key]
    //   if (node) {
    //     this.currentNode.data = { ...this.currentNode.data, ...data }
    //   }
    //   if (data[this.key] === this.currentNode.data[this.key]) {
    //     this.currentNode.data = { ...data }
    //   }
    // }
    const node = this.nodesMap[data.key]
    if (node) {
      node.data = { ...node.data, ...data }
    }
  }

  updateNodeByKey(key, data) {
    const node = this.nodesMap[key]

    if (node) {
      node.updateNode(data)
    }
  }

  updateChildren(key, data) {
    const node = this.nodesMap[key]
    if (node) {
      const childNodes = node.childNodes

      for (let i = childNodes.length - 1; i >= 0; i--) {
        const child = childNodes[i]
        this.remove(child.data)
      }
      for (let i = 0, j = data.length; i < j; i++) {
        const child = data[i]
        this.append(child, node.data)
      }
    }
  }

  remove(data) {
    const node = this.getNode(data)

    if (node && node.parent) {
      if (node === this.currentNode) {
        this.currentNode = null
      }
      node.parent.removeChild(node)
    }
  }

  append(data, parentData) {
    const parentNode = parentData ? this.getNode(parentData) : this.root

    if (parentNode) {
      parentNode.insertChild({ data })
    }
  }

  setCurrentNode(currentNode) {
    const prevCurrentNode = this.currentNode

    if (prevCurrentNode) {
      prevCurrentNode.isCurrent = false
    }
    this.currentNode = currentNode
    if (currentNode) {
      this.currentNode.isCurrent = true
    }
  }

  setUserCurrentNode(node) {
    const key = node[this.key]
    const currNode = this.nodesMap[key]
    this.setCurrentNode(currNode)
  }

  setData(newVal) {
    const instanceChanged = newVal !== this.root.data

    if (instanceChanged) {
      this.root.setData(newVal)
      // this._initDefaultCheckedNodes()
    } else {
      this.root.updateChildren()
    }
  }

  deregisterNode(node) {
    const key = this.key

    if (!key || !node || !node.data) return

    node.childNodes.forEach(child => {
      this.deregisterNode(child)
    })

    delete this.nodesMap[node.key]
  }

  // getNodeKey(key, data) {

  // }

  getNode(data) {
    if (data instanceof Node) return data
    const key = typeof data !== 'object' ? data : getNodeKey(this.key, data)
    return this.nodesMap[key] || null
  }

  getCurrentNode() {
    return this.currentNode
  }

  expandBySearchStr(searchStr, num) {
    const _this = this
    let totalNum = 0
    const toggleExpand = function(node, isExpand) {
      let parent = node.parent
      while (parent.level > 0) {
        parent.expanded = isExpand
        parent = parent.parent
      }
    }
    searchStr = searchStr.toString().toLowerCase()
    let isHasSearchProject = []
    const traverseNode = function(node) {
      const childNodes = node.root ? node.root.childNodes : node.childNodes
      let isExpandParent = 0
      for (let i = 0, j = childNodes.length; i < j; i++) {
        const child = childNodes[i]
        if (child.data[_this.props.label].toString().toLowerCase().indexOf(searchStr) > -1 && child.level === 3) {
          toggleExpand(child, true)
          if (num === 0) {
            _this.setCurrentNode(child)
            isHasSearchProject = [...isHasSearchProject, true]
          }
          num -= 1
          totalNum += 1
          isExpandParent += 1
        } else {
          isHasSearchProject = [...isHasSearchProject, false]
          traverseNode(child)
        }
        if (isExpandParent === 0 && (i === (j - 1)) && child.level === 3) {
          child.parent.expanded = false
        }
      }
    }
    traverseNode(this)
    return { isHasSearchProject: isHasSearchProject.indexOf(true) > -1, total: totalNum }
  }

  setExpandedByKeys(keys, callback, isReload) {
    keys = keys || []
    keys.forEach(key => {
      const node = this.getNode(key)
      if (node) node.expand(callback, true, isReload)
    })
  }

  setCollapseKeys(keys) {
    keys = keys || []

    keys.forEach(key => {
      const node = this.getNode(key)
      if (node) node.collapse()
    })
  }

  _excludeNode(node) {
    // const key = node.data[this.key]
    const domainKey = node.data['domain-name']
    const isProject = !node.data['is-template']

    const domainNode = this.nodesMap[domainKey]

    const setCanDrop = function(node, isCanDrop) {
      let parent = node.parent
      while (parent.level > 0) {
        parent.isCanDrop = isCanDrop
        parent = parent.parent
      }
    }

    const level1Nodes = this.nodesMap.filter(i => i.level === 1)

    level1Nodes.forEach(item => {
      if (item.data[this.key] === domainKey) {
        setCanDrop(domainNode, false)
      } else {
        item.childNodes.forEach(child => {
          if (isProject) {
            child.isCanDrop = !(child.data.type === 'Projects')
            child.childNodes.forEach(i => {
              i.isCanDrop = false
            })
          } else {
            child.isCanDrop = !(child.data.type === 'Templates')
            child.childNodes.forEach(i => {
              i.isCanDrop = false
            })
          }
        })
      }
    })
  }
}
