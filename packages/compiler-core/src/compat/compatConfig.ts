import { SourceLocation } from '../ast'
import { CompilerError } from '../errors'
import { ParserContext } from '../parse'
import { TransformContext } from '../transform'
import { isFunction } from '@vue/shared'

export type CompilerCompatConfig = Partial<
  Record<CompilerDeprecationTypes, boolean | 'suppress-warning'>
> & {
  MODE?: 2 | 3
}

export interface CompilerCompatOptions {
  compatConfig?: CompilerCompatConfig
}

export const enum CompilerDeprecationTypes {
  COMPILER_IS_ON_ELEMENT = 'COMPILER_IS_ON_ELEMENT',
  COMPILER_V_BIND_SYNC = 'COMPILER_V_BIND_SYNC',
  COMPILER_V_BIND_PROP = 'COMPILER_V_BIND_PROP',
  COMPILER_V_BIND_OBJECT_ORDER = 'COMPILER_V_BIND_OBJECT_ORDER',
  COMPILER_V_ON_NATIVE = 'COMPILER_V_ON_NATIVE',
  COMPILER_V_IF_V_FOR_PRECEDENCE = 'COMPILER_V_IF_V_FOR_PRECEDENCE',
  COMPILER_V_FOR_REF = 'COMPILER_V_FOR_REF',
  COMPILER_NATIVE_TEMPLATE = 'COMPILER_NATIVE_TEMPLATE',
  COMPILER_INLINE_TEMPLATE = 'COMPILER_INLINE_TEMPLATE',
  COMPILER_FILTERS = 'COMPILER_FILTER'
}

type DeprecationData = {
  message: string | ((...args: any[]) => string)
  link?: string
}

const deprecationData: Record<CompilerDeprecationTypes, DeprecationData> = {
  [CompilerDeprecationTypes.COMPILER_IS_ON_ELEMENT]: {
    message:
      `Platform-native elements with "is" prop will no longer be ` +
      `treated as components in Vue 3 unless the "is" value is explicitly ` +
      `prefixed with "vue:".`,
    link: `https://v3.vuejs.org/guide/migration/custom-elements-interop.html`
  },

  [CompilerDeprecationTypes.COMPILER_V_BIND_SYNC]: {
    message: key =>
      `.sync modifier for v-bind has been removed. Use v-model with ` +
      `argument instead. \`v-bind:${key}.sync\` should be changed to ` +
      `\`v-model:${key}\`.`,
    link: `https://v3.vuejs.org/guide/migration/v-model.html`
  },

  [CompilerDeprecationTypes.COMPILER_V_BIND_PROP]: {
    message:
      `.prop modifier for v-bind has been removed and no longer necessary. ` +
      `Vue 3 will automatically set a binding as DOM property when appropriate.`
  },

  [CompilerDeprecationTypes.COMPILER_V_BIND_OBJECT_ORDER]: {
    message:
      `v-bind="obj" usage is now order sensitive and behaves like JavaScript ` +
      `object spread: it will now overwrite an existing non-mergeable attribute ` +
      `that appears before v-bind in the case of conflict. ` +
      `To retain 2.x behavior, move v-bind to make it the first attribute. ` +
      `You can also suppress this warning if the usage is intended.`,
    link: `https://v3.vuejs.org/guide/migration/v-bind.html`
  },

  [CompilerDeprecationTypes.COMPILER_V_ON_NATIVE]: {
    message: `.native modifier for v-on has been removed as is no longer necessary.`,
    link: `https://v3.vuejs.org/guide/migration/v-on-native-modifier-removed.html`
  },

  [CompilerDeprecationTypes.COMPILER_V_IF_V_FOR_PRECEDENCE]: {
    message:
      `v-if / v-for precedence when used on the same element has changed ` +
      `in Vue 3: v-if now takes higher precedence and will no longer have ` +
      `access to v-for scope variables. It is best to avoid the ambiguity ` +
      `with <template> tags or use a computed property that filters v-for ` +
      `data source.`,
    link: `https://v3.vuejs.org/guide/migration/v-if-v-for.html`
  },

  [CompilerDeprecationTypes.COMPILER_V_FOR_REF]: {
    message:
      `Ref usage on v-for no longer creates array ref values in Vue 3. ` +
      `Consider using function refs or refactor to avoid ref usage altogether.`,
    link: `https://v3.vuejs.org/guide/migration/array-refs.html`
  },

  [CompilerDeprecationTypes.COMPILER_NATIVE_TEMPLATE]: {
    message:
      `<template> with no special directives will render as a native template ` +
      `element instead of its inner content in Vue 3.`
  },

  [CompilerDeprecationTypes.COMPILER_INLINE_TEMPLATE]: {
    message: `"inline-template" has been removed in Vue 3.`,
    link: `https://v3.vuejs.org/guide/migration/inline-template-attribute.html`
  },

  [CompilerDeprecationTypes.COMPILER_FILTERS]: {
    message:
      `filters have been removed in Vue 3. ` +
      `The "|" symbol will be treated as native JavaScript bitwise OR operator. ` +
      `Use method calls or computed properties instead.`,
    link: `https://v3.vuejs.org/guide/migration/filters.html`
  }
}

function getCompatValue(
  key: CompilerDeprecationTypes | 'MODE',
  context: ParserContext | TransformContext
) {
  const config = (context as ParserContext).options
    ? (context as ParserContext).options.compatConfig
    : (context as TransformContext).compatConfig
  const value = config && config[key]
  if (key === 'MODE') {
    return value || 3 // compiler defaults to v3 behavior
  } else {
    return value
  }
}

export function isCompatEnabled(
  key: CompilerDeprecationTypes,
  context: ParserContext | TransformContext
) {
  const mode = getCompatValue('MODE', context)
  const value = getCompatValue(key, context)
  // in v3 mode, only enable if explicitly set to true
  // otherwise enable for any non-false value
  return mode === 3 ? value === true : value !== false
}

export function checkCompatEnabled(
  key: CompilerDeprecationTypes,
  context: ParserContext | TransformContext,
  loc: SourceLocation | null,
  ...args: any[]
): boolean {
  const enabled = isCompatEnabled(key, context)
  if (__DEV__ && enabled) {
    warnDeprecation(key, context, loc, ...args)
  }
  return enabled
}

export function warnDeprecation(
  key: CompilerDeprecationTypes,
  context: ParserContext | TransformContext,
  loc: SourceLocation | null,
  ...args: any[]
) {
  const val = getCompatValue(key, context)
  if (val === 'suppress-warning') {
    return
  }
  const { message, link } = deprecationData[key]
  const msg = `(deprecation ${key}) ${
    isFunction(message) ? message(...args) : message
  }${link ? `\n  Details: ${link}` : ``}`

  const err = new SyntaxError(msg) as CompilerError
  err.code = key
  if (loc) err.loc = loc
  context.onWarn(err)
}
