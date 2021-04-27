import { makeMap } from './makeMap'

const GLOBALS_WHITE_LISTED =
  'Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,' +
  'decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,' +
  'Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt'

export const isBuildInGloballyWhitelisted = /*#__PURE__*/ makeMap(
  GLOBALS_WHITE_LISTED
)

const registeredGlobalsWhiteList = new Set<string>()
function isCustomGloballyWhitelisted(key: string) {
  return registeredGlobalsWhiteList.has(key)
}

export function registerGlobalsWhiteList(globals: string[]) {
  globals.forEach(s => registeredGlobalsWhiteList.add(s))
}

export function isGloballyWhitelisted(key: string) {
  return isBuildInGloballyWhitelisted(key) || isCustomGloballyWhitelisted(key)
}
