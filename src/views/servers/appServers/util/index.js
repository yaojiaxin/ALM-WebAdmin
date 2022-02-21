import { fieldMap } from '../config/appServers.config.js'

// strategy categories to split data from api -> getAppServer
const strategyMap = {
  basic: 'basic',
  client: 'client',
  SA: 'SA',
  PPaT: 'PPaT'
}

// regexp: data field prefix
const splitRegExp = {
  [strategyMap.client]: /^client/,
  [strategyMap.SA]: /^SA/,
  [strategyMap.PPaT]: /^PPaT/
}

// strategies methods that how to split data
const splitStrategies = {
  [strategyMap.basic]: splitBasic,
  [strategyMap.client]: splitFn(strategyMap.client),
  [strategyMap.SA]: splitFn(strategyMap.SA),
  [strategyMap.PPaT]: splitFn(strategyMap.PPaT)
}

function loopData(data, validateFn) {
  const ret = {}

  for (const key in fieldMap) {
    if (validateFn(key, data[key])) {
      ret[key] = data[fieldMap[key]]
    }
  }

  return ret
}

function splitBasic(data) {
  return loopData(data, key => {
    for (const re in splitRegExp) {
      if (splitRegExp[re].test(key)) {
        return false
      }
    }

    return true
  })
}

function slicePrefix(prefix, obj) {
  const ret = {}

  for (const key in obj) {
    ret[key.substring(prefix.length)] = obj[key]
  }

  return ret
}

// common method to split data excluding basic data
function splitFn(strategy) {
  return data => ({
    [strategy]: slicePrefix(
      strategy,
      loopData(data, key => splitRegExp[strategy].test(key))
    )
  })
}

// transform all data from api to custom definition
function getCustomEntireForm(data) {
  let ret = {}

  for (const strategy in splitStrategies) {
    ret = { ...ret, ...getCustomSubForm(strategy, data) }
  }

  return ret
}

// transform data(client, sa, ppat) to custom definition
function getCustomSubForm(strategy, data) {
  if (strategy in splitStrategies) {
    return splitStrategies[strategy](data)
  } else {
    throw Error('invalid strategy')
  }
}

/**
 * flatten custom sub form(client, sa, ppat)
 * @param strategy
 * @param form eg. { client: { LogLevel: "NONE", ... }}
 */
function getOriginSubForm(strategy, form) {
  const ret = {}

  let field = ''
  for (const key in form) {
    field = strategy + key
    if (field in fieldMap) {
      ret[fieldMap[field]] = form[key]
    }
  }

  return ret
}

// flatten entire form
function getOriginEntireForm(form) {
  let ret = {}

  for (const field in form) {
    if (field in strategyMap) {
      ret = { ...ret, ...getOriginSubForm(field, form[field]) }
    } else {
      ret[fieldMap[field]] = form[field]
    }
  }

  return ret
}

export const DealServerData = {
  getCustomEntireForm,
  getCustomSubForm,
  getOriginEntireForm,
  getOriginSubForm
}

export { strategyMap }
