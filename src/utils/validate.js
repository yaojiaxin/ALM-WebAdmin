import i18n from '@/locales'

// Contains alphanumeric underscores
export const validSpecialCharact = (rule, value, callback) => {
  if (value) {
    if (/^[#0-9a-zA-Z_-]{1,}$/.test(value) && value !== 'null') {
      callback()
    } else {
      callback(new Error(i18n.tc('valid.specialCharacter')))
    }
  } else {
    callback()
  }
}
// move '#'
export const validSpecialCharact1 = (rule, value, callback) => {
  const reg = new RegExp("^[^-=~`!@#$%^&\\*\\(\\)\\+\\|{}\\[\\]:';\"<>\\?,.\\/\\\\]*$")
  if (value) {
    if (reg.test(value) && value !== 'null') {
      callback()
    } else {
      callback(new Error(i18n.t('valid.Name')))
    }
  } else {
    callback()
  }
}

export const validSpecialCharactHasChinese = (rule, value, callback) => {
  if (value) {
    if (/^[\u4E00-\u9FA5A-Za-z0-9_]{1,}$/.test(value) && value !== 'null') {
      callback()
    } else {
      callback(new Error(i18n.tc('valid.specialCharacter')))
    }
  } else {
    callback()
  }
}

// Begin with a letter, and contain only letters, numbers, and underscores
export const validLetterBegin = (rule, value, callback) => {
  if (value) {
    if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
      callback()
    } else {
      callback(new Error(i18n.tc('valid.letterBegin')))
    }
  } else {
    callback()
  }
}
export function replaceDateLine(value, oldstr, newstr) {
  return value.replace(oldstr, newstr)
}

export function validatePolicy(name) {
  const pattern = /[-=~`!@#$%^&*()+|{}[\]:';\"<>\?,\.\/\\]/
  if (pattern.test(name)) {
    return true
  } else {
    return false
  }
}

export const validateName = (rule, value, callback) => {
  const reg = new RegExp("^[^\\s-=~`!@#$%^&\\*\\(\\)\\+\\|{}\\[\\]:';\"<>\\?,.\\/\\\\]*$")
  if (value) {
    if (reg.test(value) && value !== 'null') {
      callback()
    } else {
      callback(new Error(i18n.t('valid.NameContainSpace')))
    }
  } else {
    callback()
  }
}

export const validateUserName = (rule, value, callback) => { // ?$%^&*()'\"/|=<>][;
  const reg = new RegExp("^[^\\?$%^&\\*\\(\\)'\\\\\"\\/\\|=<>\\]\\[;]*$")
  if (value) {
    if (reg.test(value) && value !== 'null') {
      if (value === '.' || value === '..') {
        callback(new Error(i18n.t('valid.InvalidName')))
      } else {
        callback()
      }
    } else {
      callback(new Error(i18n.t('valid.userName')))
    }
  } else {
    callback()
  }
}

export const limitNumberNot0 = value => {
  if (typeof value === 'string') {
    return !isNaN(Number(value)) ? value.replace(/^(0+)|[^\d]/g, '') : ''
  } else if (typeof value === 'number') {
    return !isNaN(value) ? String(value).replace(/^(0+)|[^\d]/g, '') : ''
  } else {
    return ''
  }
}

export const limitNumber = value => {
  if (typeof value === 'string') {
    return !isNaN(Number(value)) ? value.replace(/^()|[^\d]/g, '') : ''
  } else if (typeof value === 'number') {
    return !isNaN(value) ? String(value).replace(/^()|[^\d]/g, '') : ''
  } else {
    return ''
  }
}

