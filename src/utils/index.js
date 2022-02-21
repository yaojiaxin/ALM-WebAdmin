import axios from 'axios'
// import langConfig from '../../lang/config.json'
import message from '@/components/MFMessage'
import i18n from '@/locales/index.js'
import confirm from '@/components/MFConfirm'

/**
 * Parse the time to string
 * @param {(Object|string|number)} date
 * @param {string} format
 * @returns {string}
 */
export function parseTime(date, format) {
  if (date) {
    date = typeof date === 'string' ? date.replace(/T/g, ' ').replace(/-/g, '\/') : date
    date = new Date(date)

    let formatStr = format || 'yyyy-MM-dd hh:mm'

    const o = {
      'M+': date.getMonth() + 1, // month
      'd+': date.getDate(), // day
      'h+': date.getHours(), // hours
      'H+': date.getHours(), // hours
      'm+': date.getMinutes(), // minutes
      's+': date.getSeconds(), // seconds
      'q+': Math.floor((date.getMonth() + 3) / 3), // quarter
      S: date.getMilliseconds() // ms
    }
    if (/(y+)/.test(formatStr)) {
      formatStr = formatStr.replace(
        RegExp.$1,
        (date.getFullYear() + '').substr(4 - RegExp.$1.length)
      )
    }
    for (const k in o) {
      if (new RegExp('(' + k + ')').test(formatStr)) {
        formatStr = formatStr.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? o[k]
            : ('00' + o[k]).substr(('' + o[k]).length)
        )
      }
    }
    return formatStr
  } else {
    return '-'
  }
}
/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace(/\+/g, ' ') +
    '"}'
  )
}

/**
 * @param {string} type
 * @returns {Date}
 */
export function getTime(type) {
  if (type === 'start') {
    return new Date().getTime() - 3600 * 1000 * 24 * 90
  } else {
    return new Date(new Date().toDateString())
  }
}

/**
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone')
  }
  if (source) {
    const targetObj = source.constructor === Array ? [] : {}
    Object.keys(source).forEach(keys => {
      if (source[keys] && typeof source[keys] === 'object') {
        targetObj[keys] = deepClone(source[keys])
      } else {
        targetObj[keys] = source[keys]
      }
    })
    return targetObj
  }
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

/**
 * @returns {string}
 */
export function createUniqueString() {
  const timestamp = +new Date() + ''
  const randomNum = parseInt((1 + Math.random()) * 65536) + ''
  return (+(randomNum + timestamp)).toString(32)
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    ele.className = ele.className.replace(reg, ' ')
  }
}

/**
 * urlEncode
 * @param str
 * @returns {string}
 */
export function urlEncode(str) {
  return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29').replace(/\*/g, '%2A')
}

/**
 * xml to object
 * @param {*} xmlString
 */
export function xml2Obj(xmlString) {
  let xmlDoc = null
  if (!window.DOMParser && window.ActiveXObject) { // window.DOMParser Determine whether it is a non-IE browser
    const xmlDomVersions = ['MSXML.2.DOMDocument.6.0', 'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM']
    for (var i = 0; i < xmlDomVersions.length; i++) {
      try {
        xmlDoc = new window.ActiveXObject(xmlDomVersions[i])
        xmlDoc.async = false
        xmlDoc.loadXML(xmlString) // The loadXML method loads the XML string
        break
      } catch (e) {
        console.log(e)
      }
    }
  } else if (window.DOMParser && document.implementation && document.implementation.createDocument) {
    try {
      /* The DOMParser object parses the XML text and returns an XML Document object.
      * To use DOMParser, instantiate it with a constructor that takes no arguments, and then call its parseFromString() method
      * ParseFromString (text, contentType) parameter text: The contentType of the XML tag parameter contentType text to parse
      * It could be one of "text/ XML ", "application/ XML ", or "application/ XHTML + XML ". Note that "text/ HTML "is not supported.
      */
      const domParser = new DOMParser()
      xmlDoc = domParser.parseFromString(xmlString, 'text/xml')
    } catch (e) {
      console.log(e)
    }
  } else {
    return null
  }

  const xmldata = {}

  if (xmlDoc != null) {
    const con = xmlDoc.childNodes[0].childNodes.length
    for (let i = 0; i < con; i++) {
      if (xmlDoc.childNodes[0].childNodes[i].nodeType === 1) {
        xmldata[xmlDoc.childNodes[0].childNodes[i].nodeName] = xmlDoc.childNodes[0].childNodes[i].textContent
      }
    }
  }

  return xmldata
}

export function loadXML(xmlFile) {
  let xmlDoc = null
  if (window.ActiveXObject) {
    // eslint-disable-next-line no-undef
    xmlDoc = new ActiveXObject('Microsoft.XMLDOM')
    xmlDoc.async = false
    const URL = window.URL || window.webkitURL

    console.log(URL.createObjectURL(xmlFile))
    // xmlDoc.load(xmlFile)
  } else if (document.implementation && document.implementation.createDocument) {
    xmlDoc = document.implementation.createDocument('', '', null)
    xmlDoc.async = false
    const URL = window.URL || window.webkitURL

    console.log(URL.createObjectURL(xmlFile))
    // xmlDoc.load(xmlFile)
  } else {
    alert(this.$t('Your_browser_not_support'))
  }
  return xmlDoc
}

export function csv2Object(data) {
  const snsArr = data.split(/[(\r\n)\r\n]+/)

  snsArr.forEach((item, index) => {
    if (!item) {
      snsArr.splice(index, 1)
    }
  })
  const fileData = snsArr[0].replace(/\"|\"/g, '').split(',')
  return fileData
}

export function file2Url(param) {
  const file = param.file
  var URL = window.URL || window.webkitURL
  // Generate the target URL through file
  var fileURL = URL.createObjectURL(file)
  return axios.get(fileURL)
}

export function timeStampToString(timestamp, isAddZero = true) {
  var d = new Date(timestamp) // A time object generated according to the timestamp
  const mark = '/'
  const addZero = (string) => {
    if (!isAddZero) return string
    const result = string < 10 ? '0' + string : string
    return result
  }
  return addZero(d.getFullYear()) + mark +
  addZero(d.getMonth() + 1) + mark +
  addZero(d.getDate()) + ' ' +
  addZero(d.getHours()) + ':' +
  addZero(d.getMinutes()) + ':' +
    (d.getSeconds() === 0 ? '00' : addZero(d.getSeconds()))
}
export function timeStampToString1(timestamp, isAddZero) {
  // mm/dd/yyyy
  var d = new Date(timestamp) // A time object generated according to the timestamp
  const mark = isAddZero ? '.' : '/'
  const addZero = (string) => {
    // if (!isAddZero) return string
    const result = string < 10 ? '0' + string : string
    return result
  }
  return addZero(d.getMonth() + 1) + mark +
    addZero(d.getDate()) + mark +
    addZero(d.getFullYear()) + ' ' +
    addZero(d.getHours()) + ':' +
    addZero(d.getMinutes()) + ':' +
    (d.getSeconds() === 0 ? '00' : addZero(d.getSeconds()))
}

export function throttle(fn, delay) {
  var timer = null
  return function() {
    var context = this
    var args = arguments
    if (!timer) {
      timer = setTimeout(function() {
        fn.apply(context, args)
        timer = null
      }, delay)
    }
  }
}

export function debounce(fn, delay) {
  var timer = null
  return function() {
    var context = this
    var args = arguments
    clearTimeout(timer)
    timer = setTimeout(function() {
      fn.apply(context, args)
    }, delay)
  }
}

export function sorting(a, b, lang) {
  // return String(a).localeCompare(String(b), lang || langConfig)
  return String(a).localeCompare(String(b), undefined, { caseFirst: 'upper' })
  // return String(a) > String(b) ? 1 : -1
}

/**
 * @param {Array} array
 * @param {attr} string
 * @returns {Boolean}
 */
export function isAllEqual(array, attr) {
  if (array.length > 0) {
    return !array.some(function(value) {
      return value[attr] !== array[0][attr]
    })
  } else {
    return true
  }
}

/**
 * @param {target} object
 * @param {initTarget} object
 * @returns {Boolean}
 */
export function isChangeObjorArr(target, initTarget) {
  let isDiffArr = []
  if (Array.isArray(target) && Array.isArray(initTarget)) {
    if (target.length !== initTarget.length) return false
    target.map((item, index) => {
      if (typeof item === 'object') {
        isDiffArr = [...isDiffArr, !isChangeObjorArr(item, initTarget[index])]
      } else {
        if (item + '' !== initTarget[index] + '') {
          isDiffArr = [...isDiffArr, true]
        } else {
          isDiffArr = [...isDiffArr, false]
        }
      }
      return target
    })
  } else if (typeof target === 'object' && typeof initTarget === 'object') {
    for (const key in target) {
      // console.log(key)
      // object include array or object
      if (Array.isArray(target[key]) || typeof target[key] === 'object') {
        isDiffArr = [...isDiffArr, !isChangeObjorArr(target[key], initTarget[key])]
      } else {
        if (target[key] + '' !== initTarget[key] + '') {
          isDiffArr = [...isDiffArr, true]
        } else {
          isDiffArr = [...isDiffArr, false]
        }
      }
    }
  }
  return !(isDiffArr.indexOf(true) > -1)
}

/**
 * @param {arr1} Array
 * @param {arr2} Array
 */
export const equalIdArray = (arr1, arr2) => {
  const arr1Ids = arr1.map(item => item.id)
  const result = arr2.filter(item => arr1Ids.includes(item.id))
  return result
}

/**
 * autofocus when mf-modal is visibled and the first child element in form is HTMLInputElement
 * @param { VueComponent } vm
 */
export const autoFocusInput = (vm) => {
  vm.$slots.default &&
  vm.$slots.default.length > 0 &&
  vm.$slots.default[0].elm &&
  vm.$slots.default[0].elm.length > 0 &&
  vm.$slots.default[0].elm[0] instanceof HTMLInputElement &&
  vm.$slots.default[0].elm[0].focus()
}

/**
 * @param { ref } object this.$refs.table
 * @param { bottomHeight } number height of table's bottom(include pagination) to bottom
 * @param { paginationHeight } number height of pagination
 */
export const autoTableHeight = (ref, bottomHeight, paginationHeight, isHeaderHidden = false) => {
  bottomHeight = bottomHeight !== undefined ? bottomHeight : 25
  paginationHeight = paginationHeight !== undefined ? paginationHeight : 55
  const clientHeight = document.body.clientHeight
  const thead = ref.$el.getElementsByClassName('ant-table-thead')[0]
  const body = ref.$el.getElementsByClassName('ant-table-body')[0]
  const placeholder = ref.$el.getElementsByClassName('ant-table-placeholder')[0]
  if (placeholder) {
    placeholder.style.height = `${clientHeight - (isHeaderHidden ? thead.getBoundingClientRect().top : thead.getBoundingClientRect().bottom) - bottomHeight}px`
    placeholder.style.minHeight = '100px'
    placeholder.style.display = 'flex'
    placeholder.style.alignItems = 'center'
    placeholder.style.justifyContent = 'center'
    body.style.height = '0px'
    body.style.minHeight = '0px'
  } else {
    body.style.height = `${clientHeight - thead.getBoundingClientRect().bottom - bottomHeight - paginationHeight}px`
    body.style.minHeight = '100px'
  }
  return clientHeight - thead.getBoundingClientRect().bottom - bottomHeight - paginationHeight
}

/**
 * add single quotes when query includes white space
 * @param { string } param
 * @param { (query: string) => string | null } checkQuery custom callback to check target query
 */
export const addSingleQuotesForParam = (param, checkQuery = null) => {
  if (param != null && typeof param === 'string') {
    const defaultPattern = /[ ]/

    const queries = param.split(';')

    return queries
      .map((query) => {
        let result = query

        if (
          checkQuery &&
          typeof checkQuery === 'function' &&
          checkQuery(query) != null
        ) return checkQuery(query)

        if (defaultPattern.test(query)) {
          const leftBracketIndex = query.indexOf('[')
          const rightBracketIndex = query.indexOf(']')

          if (leftBracketIndex !== -1 && leftBracketIndex < rightBracketIndex) {
            result =
              query.substring(0, leftBracketIndex + 1) +
              "'" +
              query.substring(leftBracketIndex + 1, rightBracketIndex) +
              "'" +
              query.substring(rightBracketIndex)
          }
        }

        return result
      })
      .join(';')
  }

  return param
}

/**
 * change task reminder is or not visible
 * @param {*} storeInstance $store
 * @param { boolean } isVisible
 * @returns
 */
export const showTaskReminder = (storeInstance, isVisible) =>
  storeInstance &&
  storeInstance?.commit('taskStatus/SET_IS_TASK_REMINDER_VISIBLE', isVisible)

/**
 * calc a-table content height in modal
 * @param {*} otherContentHeight sum of other elements' height + table herder height + padding-bottom
 * @returns
 */
export const calcModalTableHeight = (otherContentHeight = 0) => {
  const modalHeight = 640
  const headerHeight = 55
  const footerHeight = 53

  return modalHeight - headerHeight - footerHeight - otherContentHeight
}

/**
 * get error message type (message or confirm)
 */
export const errorMessage = (title, stackTrace) => {
  if (stackTrace) {
    confirm({
      iconType: 'Error',
      title: i18n.t('Error'),
      message: title + '\n\nStack Trace:\n' + stackTrace,
      isShowCancel: false,
      confirmText: i18n.t('OK')
    })
  } else {
    message.error(title)
  }
}
