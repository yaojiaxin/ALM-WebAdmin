export function addProjectInDomain(trees, nodes, domain) {
  if (!Array.isArray(trees)) return
  const arr = []
  let obj = {}
  trees.forEach(tree => {
    const tmp = { ...tree, edit: false, showEditIcon: false }
    if (tree.name === domain) {
      tmp.nodes[0].nodes = nodes[0].map(it => {
        return {
          ...it,
          domainId: tmp.domainId,
          parentId: tmp.customId,
          customId: `project-${it.id}`
        }
      })
      tmp.nodes[1].nodes = nodes[1].map(it => {
        return {
          ...it,
          domainId: tmp.domainId,
          parentId: tmp.customId,
          customId: `project-${it.id}`
        }
      })

      obj = {
        ...tmp,
        isRequest: true,
        showEditIcon: true
      }
    } else {
      obj = { ...tmp }
    }

    arr.push(obj)
  })
  return arr
}

// add treeNode
export function addTreeItem(trees, id, newChild, showChild) {
  if (!Array.isArray(trees)) return
  const arr = []
  let obj = {}
  trees.forEach(tree => {
    const tmp = { ...tree, edit: false, showEditIcon: false }
    if (tree.nodes) { tmp.nodes = addTreeItem(tree.nodes, id, newChild, showChild) }
    // is project
    if (tree.customId === id[0]) {
      obj = {
        ...tmp,
        isRequest: true,
        showChildren: !showChild,
        showEditIcon: true,
        nodes: newChild[0].map(it => {
          return {
            ...it,
            domainId: tmp.domainId,
            parentId: tmp.customId
          }
        })
      }
    } else if (tree.customId === id[1]) { // is template
      obj = {
        ...tmp,
        isRequest: true,
        showChildren: showChild,
        showEditIcon: true,
        nodes: newChild[1].map(it => {
          return {
            ...it,
            domainId: tmp.domainId,
            parentId: tmp.customId
          }
        })
      }
    } else {
      obj = { ...tmp }
    }

    arr.push(obj)
  })
  return arr
}

// selected target
export function setSelectedMenuItem(trees, id) {
  if (!Array.isArray(trees)) return
  const arr = []
  let obj = {}
  trees.forEach(tree => {
    const tmp = { ...tree }

    if (tmp.nodes) {
      tmp.nodes = setSelectedMenuItem(tmp.nodes, id)
    }
    if (tmp.customId === id) {
      obj = {
        ...tmp,
        selected: true,
        showEditIcon: true
      }
    } else {
      obj = {
        ...tmp,
        selected: false,
        showEditIcon: false
      }
    }
    arr.push(obj)
  })
  return arr
}

// show children
export function setShowMenuChild(trees, id) {
  if (!Array.isArray(trees)) return
  const arr = []
  let obj = {}
  trees.forEach(tree => {
    const tmp = { ...tree }

    if (tmp.nodes) {
      tmp.nodes = setShowMenuChild(tmp.nodes, id)
    }
    if (tmp.customId === id) {
      obj = {
        ...tmp,
        showChildren: !tmp.showChildren
      }
    } else {
      obj = {
        ...tmp,
        showEditIcon: false
      }
    }
    arr.push(obj)
  })
  return arr
}

// edit treeNode
export function setEditMenuItem(trees, id, status) {
  if (!Array.isArray(trees)) return
  const arr = []
  let obj = {}
  trees.forEach(tree => {
    const tmp = { ...tree }

    if (tmp.nodes) {
      tmp.nodes = setEditMenuItem(tmp.nodes, id, status)
    }
    if (tmp.customId === id) {
      obj = {
        ...tmp,
        showEditIcon: true,
        edit: status
      }
    } else {
      obj = {
        ...tmp,
        showEditIcon: false,
        edit: false
      }
    }
    arr.push(obj)
  })
  return arr
}

// set treeNode active
export function setTreeNodeVal(trees, id, status, key = 'is-active') {
  if (!Array.isArray(trees)) return
  const arr = []
  let obj = {}
  trees.forEach(tree => {
    const tmp = { ...tree }

    if (tmp.nodes) {
      tmp.nodes = setTreeNodeVal(tmp.nodes, id, status)
    }
    if (tmp.customId === id) {
      if (key) {
        obj = { ...tmp }
        obj[key] = status
      } else {
        obj = {
          ...tmp,
          'is-active': status
        }
      }
    } else {
      obj = { ...tmp }
    }
    arr.push(obj)
  })
  return arr
}

// delete treeNode
export function deleteTreeNode(trees, id) {
  if (!Array.isArray(trees)) return
  const arr = []
  let obj = {}
  trees.forEach(tree => {
    const tmp = { ...tree }

    if (tmp.nodes) {
      tmp.nodes = deleteTreeNode(tmp.nodes, id)
    }
    if (tmp.customId !== id) {
      obj = { ...tmp }
      arr.push(obj)
    }
  })
  return arr
}

export function searchTreeNode(trees, id) {
  if (!Array.isArray(trees)) return
  const arr = []
  let obj = {}
  trees.forEach(tree => {
    const tmp = { ...tree }

    if (tmp.nodes) {
      tmp.nodes = searchTreeNode(tmp.nodes, id)
    }
    if (tmp.customId === id) {
      obj = { ...tmp, showChild: true }
    } else {
      obj = { ...tmp, showChild: false }
    }

    arr.push(obj)
  })
  return arr
}

// show children
export function searchShowMenuChild(trees, ids) {
  if (!Array.isArray(trees)) return
  const arr = []
  let obj = {}
  trees.forEach(tree => {
    const tmp = { ...tree }

    if (tmp.nodes) {
      tmp.nodes = searchShowMenuChild(tmp.nodes, ids)
    }
    if (ids.indexOf(tmp.customId) > -1) {
      obj = {
        ...tmp,
        showChildren: true
      }
    } else {
      obj = {
        ...tmp
      }
    }
    arr.push(obj)
  })
  return arr
}

// get treeNode parentId
export function searchTreeNodeParents(trees, name) {
  if (!Array.isArray(trees)) return
  const arr = []
  getParentId(trees, name, arr)
  return arr
}

const getParentId = (trees, name, arr) => {
  trees.forEach(tree => {
    const tmp = { ...tree }

    if (tmp.nodes) {
      getParentId(tmp.nodes, name, arr)
    }

    if (name && String(tmp.name).toLocaleUpperCase().indexOf(name.toLocaleUpperCase()) > -1) {
      if (!tmp.parentId) {
        arr.push(tmp.customId)
      } else {
        arr.push(tmp.domainId)
        arr.push(tmp.parentId)
      }
    }
  })
}

// update project name
export function updateTreeNodeName(trees, id, newName) {
  if (!Array.isArray(trees)) return
  const arr = []
  let obj = {}
  trees.forEach(tree => {
    const tmp = { ...tree }

    if (tmp.nodes) {
      tmp.nodes = updateTreeNodeName(tmp.nodes, id, newName)
    }
    if (tmp.customId === id) {
      obj = {
        ...tmp,
        name: newName
      }
    } else {
      obj = {
        ...tmp
      }
    }
    arr.push(obj)
  })
  return arr
}
