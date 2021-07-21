import { extend, hasOwn, isArray, isFunction } from '@vue/shared'
import {
  Component,
  ComponentInternalInstance,
  ComponentOptions,
  formatComponentName,
  getComponentName,
  getCurrentInstance,
  isRuntimeOnly
} from '../component'
import { warn } from '../warning'

export const enum DeprecationTypes {
  GLOBAL_MOUNT = 'GLOBAL_MOUNT',
  GLOBAL_MOUNT_CONTAINER = 'GLOBAL_MOUNT_CONTAINER',
  GLOBAL_EXTEND = 'GLOBAL_EXTEND',
  GLOBAL_PROTOTYPE = 'GLOBAL_PROTOTYPE',
  GLOBAL_SET = 'GLOBAL_SET',
  GLOBAL_DELETE = 'GLOBAL_DELETE',
  GLOBAL_OBSERVABLE = 'GLOBAL_OBSERVABLE',
  GLOBAL_PRIVATE_UTIL = 'GLOBAL_PRIVATE_UTIL',

  CONFIG_SILENT = 'CONFIG_SILENT',
  CONFIG_DEVTOOLS = 'CONFIG_DEVTOOLS',
  CONFIG_KEY_CODES = 'CONFIG_KEY_CODES',
  CONFIG_PRODUCTION_TIP = 'CONFIG_PRODUCTION_TIP',
  CONFIG_IGNORED_ELEMENTS = 'CONFIG_IGNORED_ELEMENTS',
  CONFIG_WHITESPACE = 'CONFIG_WHITESPACE',
  CONFIG_OPTION_MERGE_STRATS = 'CONFIG_OPTION_MERGE_STRATS',

  INSTANCE_SET = 'INSTANCE_SET',
  INSTANCE_DELETE = 'INSTANCE_DELETE',
  INSTANCE_DESTROY = 'INSTANCE_DESTROY',
  INSTANCE_EVENT_EMITTER = 'INSTANCE_EVENT_EMITTER',
  INSTANCE_EVENT_HOOKS = 'INSTANCE_EVENT_HOOKS',
  INSTANCE_CHILDREN = 'INSTANCE_CHILDREN',
  INSTANCE_LISTENERS = 'INSTANCE_LISTENERS',
  INSTANCE_SCOPED_SLOTS = 'INSTANCE_SCOPED_SLOTS',
  INSTANCE_ATTRS_CLASS_STYLE = 'INSTANCE_ATTRS_CLASS_STYLE',

  OPTIONS_DATA_FN = 'OPTIONS_DATA_FN',
  OPTIONS_DATA_MERGE = 'OPTIONS_DATA_MERGE',
  OPTIONS_BEFORE_DESTROY = 'OPTIONS_BEFORE_DESTROY',
  OPTIONS_DESTROYED = 'OPTIONS_DESTROYED',

  WATCH_ARRAY = 'WATCH_ARRAY',
  PROPS_DEFAULT_THIS = 'PROPS_DEFAULT_THIS',

  V_FOR_REF = 'V_FOR_REF',
  V_ON_KEYCODE_MODIFIER = 'V_ON_KEYCODE_MODIFIER',
  CUSTOM_DIR = 'CUSTOM_DIR',

  ATTR_FALSE_VALUE = 'ATTR_FALSE_VALUE',
  ATTR_ENUMERATED_COERCION = 'ATTR_ENUMERATED_COERCION',

  TRANSITION_CLASSES = 'TRANSITION_CLASSES',
  TRANSITION_GROUP_ROOT = 'TRANSITION_GROUP_ROOT',

  COMPONENT_ASYNC = 'COMPONENT_ASYNC',
  COMPONENT_FUNCTIONAL = 'COMPONENT_FUNCTIONAL',
  COMPONENT_V_MODEL = 'COMPONENT_V_MODEL',

  RENDER_FUNCTION = 'RENDER_FUNCTION',

  FILTERS = 'FILTERS',

  PRIVATE_APIS = 'PRIVATE_APIS'
}

type DeprecationData = {
  message: string | ((...args: any[]) => string)
  link?: string
}

export const deprecationData: Record<DeprecationTypes, DeprecationData> = {
  [DeprecationTypes.GLOBAL_MOUNT]: {
    message:
      `The global app bootstrapping API has changed: vm.$mount() and the "el" ` +
      `option have been removed. Use createApp(RootComponent).mount() instead.`,
    link: `https://v3.vuejs.org/guide/migration/global-api.html#mounting-app-instance`
  },

  [DeprecationTypes.GLOBAL_MOUNT_CONTAINER]: {
    message:
      `Vue detected directives on the mount container. ` +
      `In Vue 3, the container is no longer considered part of the template ` +
      `and will not be processed/replaced.`,
    link: `https://v3.vuejs.org/guide/migration/mount-changes.html`
  },

  [DeprecationTypes.GLOBAL_EXTEND]: {
    message:
      `Vue.extend() has been removed in Vue 3. ` +
      `Use defineComponent() instead.`,
    link: `https://v3.vuejs.org/api/global-api.html#definecomponent`
  },

  [DeprecationTypes.GLOBAL_PROTOTYPE]: {
    message:
      `Vue.prototype is no longer available in Vue 3. ` +
      `Use app.config.globalProperties instead.`,
    link: `https://v3.vuejs.org/guide/migration/global-api.html#vue-prototype-replaced-by-config-globalproperties`
  },

  [DeprecationTypes.GLOBAL_SET]: {
    message:
      `Vue.set() has been removed as it is no longer needed in Vue 3. ` +
      `Simply use native JavaScript mutations.`
  },

  [DeprecationTypes.GLOBAL_DELETE]: {
    message:
      `Vue.delete() has been removed as it is no longer needed in Vue 3. ` +
      `Simply use native JavaScript mutations.`
  },

  [DeprecationTypes.GLOBAL_OBSERVABLE]: {
    message:
      `Vue.observable() has been removed. ` +
      `Use \`import { reactive } from "vue"\` from Composition API instead.`,
    link: `https://v3.vuejs.org/api/basic-reactivity.html`
  },

  [DeprecationTypes.GLOBAL_PRIVATE_UTIL]: {
    message:
      `Vue.util has been removed. Please refactor to avoid its usage ` +
      `since it was an internal API even in Vue 2.`
  },

  [DeprecationTypes.CONFIG_SILENT]: {
    message:
      `config.silent has been removed because it is not good practice to ` +
      `intentionally suppress warnings. You can use your browser console's ` +
      `filter features to focus on relevant messages.`
  },

  [DeprecationTypes.CONFIG_DEVTOOLS]: {
    message:
      `config.devtools has been removed. To enable devtools for ` +
      `production, configure the __VUE_PROD_DEVTOOLS__ compile-time flag.`,
    link: `https://github.com/vuejs/vue-next/tree/master/packages/vue#bundler-build-feature-flags`
  },

  [DeprecationTypes.CONFIG_KEY_CODES]: {
    message:
      `config.keyCodes has been removed. ` +
      `In Vue 3, you can directly use the kebab-case key names as v-on modifiers.`,
    link: `https://v3.vuejs.org/guide/migration/keycode-modifiers.html`
  },

  [DeprecationTypes.CONFIG_PRODUCTION_TIP]: {
    message: `config.productionTip has been removed.`,
    link: `https://v3.vuejs.org/guide/migration/global-api.html#config-productiontip-removed`
  },

  [DeprecationTypes.CONFIG_IGNORED_ELEMENTS]: {
    message: () => {
      let msg = `config.ignoredElements has been removed.`
      if (isRuntimeOnly()) {
        msg += ` Pass the "isCustomElement" option to @vue/compiler-dom instead.`
      } else {
        msg += ` Use config.isCustomElement instead.`
      }
      return msg
    },
    link: `https://v3.vuejs.org/guide/migration/global-api.html#config-ignoredelements-is-now-config-iscustomelement`
  },

  [DeprecationTypes.CONFIG_WHITESPACE]: {
    // this warning is only relevant in the full build when using runtime
    // compilation, so it's put in the runtime compatConfig list.
    message:
      `Vue 3 compiler's whitespace option will default to "condense" instead of ` +
      `"preserve". To suppress this warning, provide an explicit value for ` +
      `\`config.compilerOptions.whitespace\`.`
  },

  [DeprecationTypes.CONFIG_OPTION_MERGE_STRATS]: {
    message:
      `config.optionMergeStrategies no longer exposes internal strategies. ` +
      `Use custom merge functions instead.`
  },

  [DeprecationTypes.INSTANCE_SET]: {
    message:
      `vm.$set() has been removed as it is no longer needed in Vue 3. ` +
      `Simply use native JavaScript mutations.`
  },

  [DeprecationTypes.INSTANCE_DELETE]: {
    message:
      `vm.$delete() has been removed as it is no longer needed in Vue 3. ` +
      `Simply use native JavaScript mutations.`
  },

  [DeprecationTypes.INSTANCE_DESTROY]: {
    message: `vm.$destroy() has been removed. Use app.unmount() instead.`,
    link: `https://v3.vuejs.org/api/application-api.html#unmount`
  },

  [DeprecationTypes.INSTANCE_EVENT_EMITTER]: {
    message:
      `vm.$on/$once/$off() have been removed. ` +
      `Use an external event emitter library instead.`,
    link: `https://v3.vuejs.org/guide/migration/events-api.html`
  },

  [DeprecationTypes.INSTANCE_EVENT_HOOKS]: {
    message: event =>
      `"${event}" lifecycle events are no longer supported. From templates, ` +
      `use the "vnode" prefix instead of "hook:". For example, @${event} ` +
      `should be changed to @vnode-${event.slice(5)}. ` +
      `From JavaScript, use Composition API to dynamically register lifecycle ` +
      `hooks.`,
    link: `https://v3.vuejs.org/guide/migration/vnode-lifecycle-events.html`
  },

  [DeprecationTypes.INSTANCE_CHILDREN]: {
    message:
      `vm.$children has been removed. Consider refactoring your logic ` +
      `to avoid relying on direct access to child components.`,
    link: `https://v3.vuejs.org/guide/migration/children.html`
  },

  [DeprecationTypes.INSTANCE_LISTENERS]: {
    message:
      `vm.$listeners has been removed. In Vue 3, parent v-on listeners are ` +
      `included in vm.$attrs and it is no longer necessary to separately use ` +
      `v-on="$listeners" if you are already using v-bind="$attrs". ` +
      `(Note: the Vue 3 behavior only applies if this compat config is disabled)`,
    link: `https://v3.vuejs.org/guide/migration/listeners-removed.html`
  },

  [DeprecationTypes.INSTANCE_SCOPED_SLOTS]: {
    message: `vm.$scopedSlots has been removed. Use vm.$slots instead.`,
    link: `https://v3.vuejs.org/guide/migration/slots-unification.html`
  },

  [DeprecationTypes.INSTANCE_ATTRS_CLASS_STYLE]: {
    message: componentName =>
      `Component <${
        componentName || 'Anonymous'
      }> has \`inheritAttrs: false\` but is ` +
      `relying on class/style fallthrough from parent. In Vue 3, class/style ` +
      `are now included in $attrs and will no longer fallthrough when ` +
      `inheritAttrs is false. If you are already using v-bind="$attrs" on ` +
      `component root it should render the same end result. ` +
      `If you are binding $attrs to a non-root element and expecting ` +
      `class/style to fallthrough on root, you will need to now manually bind ` +
      `them on root via :class="$attrs.class".`,
    link: `https://v3.vuejs.org/guide/migration/attrs-includes-class-style.html`
  },

  [DeprecationTypes.OPTIONS_DATA_FN]: {
    message:
      `The "data" option can no longer be a plain object. ` +
      `Always use a function.`,
    link: `https://v3.vuejs.org/guide/migration/data-option.html`
  },

  [DeprecationTypes.OPTIONS_DATA_MERGE]: {
    message: (key: string) =>
      `Detected conflicting key "${key}" when merging data option values. ` +
      `In Vue 3, data keys are merged shallowly and will override one another.`,
    link: `https://v3.vuejs.org/guide/migration/data-option.html#mixin-merge-behavior-change`
  },

  [DeprecationTypes.OPTIONS_BEFORE_DESTROY]: {
    message: `\`beforeDestroy\` has been renamed to \`beforeUnmount\`.`
  },

  [DeprecationTypes.OPTIONS_DESTROYED]: {
    message: `\`destroyed\` has been renamed to \`unmounted\`.`
  },

  [DeprecationTypes.WATCH_ARRAY]: {
    message:
      `"watch" option or vm.$watch on an array value will no longer ` +
      `trigger on array mutation unless the "deep" option is specified. ` +
      `If current usage is intended, you can disable the compat behavior and ` +
      `suppress this warning with:` +
      `\n\n  configureCompat({ ${DeprecationTypes.WATCH_ARRAY}: false })\n`,
    link: `https://v3.vuejs.org/guide/migration/watch.html`
  },

  [DeprecationTypes.PROPS_DEFAULT_THIS]: {
    message: (key: string) =>
      `props default value function no longer has access to "this". The compat ` +
      `build only offers access to this.$options.` +
      `(found in prop "${key}")`,
    link: `https://v3.vuejs.org/guide/migration/props-default-this.html`
  },

  [DeprecationTypes.CUSTOM_DIR]: {
    message: (legacyHook: string, newHook: string) =>
      `Custom directive hook "${legacyHook}" has been removed. ` +
      `Use "${newHook}" instead.`,
    link: `https://v3.vuejs.org/guide/migration/custom-directives.html`
  },

  [DeprecationTypes.V_FOR_REF]: {
    message:
      `Ref usage on v-for no longer creates array ref values in Vue 3. ` +
      `Consider using function refs or refactor to avoid ref usage altogether.`,
    link: `https://v3.vuejs.org/guide/migration/array-refs.html`
  },

  [DeprecationTypes.V_ON_KEYCODE_MODIFIER]: {
    message:
      `Using keyCode as v-on modifier is no longer supported. ` +
      `Use kebab-case key name modifiers instead.`,
    link: `https://v3.vuejs.org/guide/migration/keycode-modifiers.html`
  },

  [DeprecationTypes.ATTR_FALSE_VALUE]: {
    message: (name: string) =>
      `Attribute "${name}" with v-bind value \`false\` will render ` +
      `${name}="false" instead of removing it in Vue 3. To remove the attribute, ` +
      `use \`null\` or \`undefined\` instead. If the usage is intended, ` +
      `you can disable the compat behavior and suppress this warning with:` +
      `\n\n  configureCompat({ ${DeprecationTypes.ATTR_FALSE_VALUE}: false })\n`,
    link: `https://v3.vuejs.org/guide/migration/attribute-coercion.html`
  },

  [DeprecationTypes.ATTR_ENUMERATED_COERCION]: {
    message: (name: string, value: any, coerced: string) =>
      `Enumerated attribute "${name}" with v-bind value \`${value}\` will ` +
      `${
        value === null ? `be removed` : `render the value as-is`
      } instead of coercing the value to "${coerced}" in Vue 3. ` +
      `Always use explicit "true" or "false" values for enumerated attributes. ` +
      `If the usage is intended, ` +
      `you can disable the compat behavior and suppress this warning with:` +
      `\n\n  configureCompat({ ${DeprecationTypes.ATTR_ENUMERATED_COERCION}: false })\n`,
    link: `https://v3.vuejs.org/guide/migration/attribute-coercion.html`
  },

  [DeprecationTypes.TRANSITION_CLASSES]: {
    message: `` // this feature cannot be runtime-detected
  },

  [DeprecationTypes.TRANSITION_GROUP_ROOT]: {
    message:
      `<TransitionGroup> no longer renders a root <span> element by ` +
      `default if no "tag" prop is specified. If you do not rely on the span ` +
      `for styling, you can disable the compat behavior and suppress this ` +
      `warning with:` +
      `\n\n  configureCompat({ ${DeprecationTypes.TRANSITION_GROUP_ROOT}: false })\n`,
    link: `https://v3.vuejs.org/guide/migration/transition-group.html`
  },

  [DeprecationTypes.COMPONENT_ASYNC]: {
    message: (comp: any) => {
      const name = getComponentName(comp)
      return (
        `Async component${
          name ? ` <${name}>` : `s`
        } should be explicitly created via \`defineAsyncComponent()\` ` +
        `in Vue 3. Plain functions will be treated as functional components in ` +
        `non-compat build. If you have already migrated all async component ` +
        `usage and intend to use plain functions for functional components, ` +
        `you can disable the compat behavior and suppress this ` +
        `warning with:` +
        `\n\n  configureCompat({ ${DeprecationTypes.COMPONENT_ASYNC}: false })\n`
      )
    },
    link: `https://v3.vuejs.org/guide/migration/async-components.html`
  },

  [DeprecationTypes.COMPONENT_FUNCTIONAL]: {
    message: (comp: any) => {
      const name = getComponentName(comp)
      return (
        `Functional component${
          name ? ` <${name}>` : `s`
        } should be defined as a plain function in Vue 3. The "functional" ` +
        `option has been removed. NOTE: Before migrating to use plain ` +
        `functions for functional components, first make sure that all async ` +
        `components usage have been migrated and its compat behavior has ` +
        `been disabled.`
      )
    },
    link: `https://v3.vuejs.org/guide/migration/functional-components.html`
  },

  [DeprecationTypes.COMPONENT_V_MODEL]: {
    message: (comp: ComponentOptions) => {
      const configMsg =
        `opt-in to ` +
        `Vue 3 behavior on a per-component basis with \`compatConfig: { ${DeprecationTypes.COMPONENT_V_MODEL}: false }\`.`
      if (
        comp.props &&
        (isArray(comp.props)
          ? comp.props.includes('modelValue')
          : hasOwn(comp.props, 'modelValue'))
      ) {
        return (
          `Component delcares "modelValue" prop, which is Vue 3 usage, but ` +
          `is running under Vue 2 compat v-model behavior. You can ${configMsg}`
        )
      }
      return (
        `v-model usage on component has changed in Vue 3. Component that expects ` +
        `to work with v-model should now use the "modelValue" prop and emit the ` +
        `"update:modelValue" event. You can update the usage and then ${configMsg}`
      )
    },
    link: `https://v3.vuejs.org/guide/migration/v-model.html`
  },

  [DeprecationTypes.RENDER_FUNCTION]: {
    message:
      `Vue 3's render function API has changed. ` +
      `You can opt-in to the new API with:` +
      `\n\n  configureCompat({ ${DeprecationTypes.RENDER_FUNCTION}: false })\n` +
      `\n  (This can also be done per-component via the "compatConfig" option.)`,
    link: `https://v3.vuejs.org/guide/migration/render-function-api.html`
  },

  [DeprecationTypes.FILTERS]: {
    message:
      `filters have been removed in Vue 3. ` +
      `The "|" symbol will be treated as native JavaScript bitwise OR operator. ` +
      `Use method calls or computed properties instead.`,
    link: `https://v3.vuejs.org/guide/migration/filters.html`
  },

  [DeprecationTypes.PRIVATE_APIS]: {
    message: name =>
      `"${name}" is a Vue 2 private API that no longer exists in Vue 3. ` +
      `If you are seeing this warning only due to a dependency, you can ` +
      `suppress this warning via { PRIVATE_APIS: 'supress-warning' }.`
  }
}

const instanceWarned: Record<string, true> = Object.create(null)
const warnCount: Record<string, number> = Object.create(null)

// test only
let warningEnabled = true

export function toggleDeprecationWarning(flag: boolean) {
  warningEnabled = flag
}

export function warnDeprecation(
  key: DeprecationTypes,
  instance: ComponentInternalInstance | null,
  ...args: any[]
) {
  if (!__DEV__) {
    return
  }
  if (__TEST__ && !warningEnabled) {
    return
  }

  instance = instance || getCurrentInstance()

  // check user config
  const config = getCompatConfigForKey(key, instance)
  if (config === 'suppress-warning') {
    return
  }

  const dupKey = key + args.join('')
  let compId: string | number | null =
    instance && formatComponentName(instance, instance.type)
  if (compId === 'Anonymous' && instance) {
    compId = instance.uid
  }

  // skip if the same warning is emitted for the same component type
  const componentDupKey = dupKey + compId
  if (!__TEST__ && componentDupKey in instanceWarned) {
    return
  }
  instanceWarned[componentDupKey] = true

  // same warning, but different component. skip the long message and just
  // log the key and count.
  if (!__TEST__ && dupKey in warnCount) {
    warn(`(deprecation ${key}) (${++warnCount[dupKey] + 1})`)
    return
  }

  warnCount[dupKey] = 0

  const { message, link } = deprecationData[key]
  warn(
    `(deprecation ${key}) ${isFunction(message) ? message(...args) : message}${
      link ? `\n  Details: ${link}` : ``
    }`
  )
  if (!isCompatEnabled(key, instance, true)) {
    console.error(
      `^ The above deprecation's compat behavior is disabled and will likely ` +
        `lead to runtime errors.`
    )
  }
}

export type CompatConfig = Partial<
  Record<DeprecationTypes, boolean | 'suppress-warning'>
> & {
  MODE?: 2 | 3 | ((comp: Component | null) => 2 | 3)
}

export const globalCompatConfig: CompatConfig = {
  MODE: 2
}

export function configureCompat(config: CompatConfig) {
  if (__DEV__) {
    validateCompatConfig(config)
  }
  extend(globalCompatConfig, config)
}

const seenConfigObjects = /*#__PURE__*/ new WeakSet<CompatConfig>()
const warnedInvalidKeys: Record<string, boolean> = {}

// dev only
export function validateCompatConfig(
  config: CompatConfig,
  instance?: ComponentInternalInstance
) {
  if (seenConfigObjects.has(config)) {
    return
  }
  seenConfigObjects.add(config)

  for (const key of Object.keys(config)) {
    if (
      key !== 'MODE' &&
      !(key in deprecationData) &&
      !(key in warnedInvalidKeys)
    ) {
      if (key.startsWith('COMPILER_')) {
        if (isRuntimeOnly()) {
          warn(
            `Deprecation config "${key}" is compiler-specific and you are ` +
              `running a runtime-only build of Vue. This deprecation should be ` +
              `configured via compiler options in your build setup instead.\n` +
              `Details: https://v3.vuejs.org/guide/migration/migration-build.html`
          )
        }
      } else {
        warn(`Invalid deprecation config "${key}".`)
      }
      warnedInvalidKeys[key] = true
    }
  }

  if (instance && config[DeprecationTypes.OPTIONS_DATA_MERGE] != null) {
    warn(
      `Deprecation config "${DeprecationTypes.OPTIONS_DATA_MERGE}" can only be configured globally.`
    )
  }
}

export function getCompatConfigForKey(
  key: DeprecationTypes | 'MODE',
  instance: ComponentInternalInstance | null
) {
  const instanceConfig =
    instance && (instance.type as ComponentOptions).compatConfig
  if (instanceConfig && key in instanceConfig) {
    return instanceConfig[key]
  }
  return globalCompatConfig[key]
}

export function isCompatEnabled(
  key: DeprecationTypes,
  instance: ComponentInternalInstance | null,
  enableForBuiltIn = false
): boolean {
  // skip compat for built-in components
  if (!enableForBuiltIn && instance && instance.type.__isBuiltIn) {
    return false
  }

  const rawMode = getCompatConfigForKey('MODE', instance) || 2
  const val = getCompatConfigForKey(key, instance)

  const mode = isFunction(rawMode)
    ? rawMode(instance && instance.type)
    : rawMode

  if (mode === 2) {
    return val !== false
  } else {
    return val === true || val === 'suppress-warning'
  }
}

/**
 * Use this for features that are completely removed in non-compat build.
 */
export function assertCompatEnabled(
  key: DeprecationTypes,
  instance: ComponentInternalInstance | null,
  ...args: any[]
) {
  if (!isCompatEnabled(key, instance)) {
    throw new Error(`${key} compat has been disabled.`)
  } else if (__DEV__) {
    warnDeprecation(key, instance, ...args)
  }
}

/**
 * Use this for features where legacy usage is still possible, but will likely
 * lead to runtime error if compat is disabled. (warn in all cases)
 */
export function softAssertCompatEnabled(
  key: DeprecationTypes,
  instance: ComponentInternalInstance | null,
  ...args: any[]
) {
  if (__DEV__) {
    warnDeprecation(key, instance, ...args)
  }
  return isCompatEnabled(key, instance)
}

/**
 * Use this for features with the same syntax but with mutually exclusive
 * behavior in 2 vs 3. Only warn if compat is enabled.
 * e.g. render function
 */
export function checkCompatEnabled(
  key: DeprecationTypes,
  instance: ComponentInternalInstance | null,
  ...args: any[]
) {
  const enabled = isCompatEnabled(key, instance)
  if (__DEV__ && enabled) {
    warnDeprecation(key, instance, ...args)
  }
  return enabled
}

// run tests in v3 mode by default
if (__TEST__) {
  configureCompat({
    MODE: 3
  })
}
