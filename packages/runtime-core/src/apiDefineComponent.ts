import {
  ComputedOptions,
  MethodOptions,
  LegacyComponent,
  ComponentOptionsWithoutProps,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithObjectProps
} from './apiOptions'
import { SetupContext, RenderFunction } from './component'
import {
  ComponentPublicInstance,
  ComponentPublicInstanceConstructor
} from './componentProxy'
import { ExtractPropTypes, ComponentPropsOptions } from './componentProps'
import { isFunction } from '@vue/shared'
import { VNodeProps } from './vnode'

// defineComponent is a utility that is primarily used for type inference
// when declaring components. Type inference is provided in the component
// options (provided as the argument). The returned value has artifical types
// for TSX / manual render function / IDE support.

// overload 1: direct setup function
// (uses user defined props interface)
export function defineComponent<Props, RawBindings = object>(
  setup: (
    props: Readonly<Props>,
    ctx: SetupContext
  ) => RawBindings | RenderFunction
): ComponentPublicInstanceConstructor<
  ComponentPublicInstance<
    Props,
    RawBindings,
    {},
    {},
    {},
    LegacyComponent,
    // public props
    VNodeProps & Props
  >
>

export function defineComponent<
  Props,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends LegacyComponent = LegacyComponent
>(
  options: ComponentOptionsWithoutProps<Props, RawBindings, D, C, M, Mixin>
): typeof options &
  ComponentPublicInstanceConstructor<
    ComponentPublicInstance<
      Props,
      RawBindings,
      D,
      C,
      M,
      Mixin,
      VNodeProps & Props
    >
  >

// overload 3: object format with array props declaration
// props inferred as { [key in PropNames]?: any }
// return type is for Vetur and TSX support
export function defineComponent<
  PropNames extends string,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends LegacyComponent = LegacyComponent
>(
  options: ComponentOptionsWithArrayProps<
    PropNames,
    RawBindings,
    D,
    C,
    M,
    Mixin
  >
): typeof options &
  ComponentPublicInstanceConstructor<
    // array props technically doesn't place any contraints on props in TSX
    ComponentPublicInstance<VNodeProps, RawBindings, D, C, M, Mixin>
  >

// overload 4: object format with object props declaration
// see `ExtractPropTypes` in ./componentProps.ts
export function defineComponent<
  // the Readonly constraint allows TS to treat the type of { required: true }
  // as constant instead of boolean.
  PropsOptions extends Readonly<ComponentPropsOptions>,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends LegacyComponent = LegacyComponent
>(
  options: ComponentOptionsWithObjectProps<
    PropsOptions,
    RawBindings,
    D,
    C,
    M,
    Mixin
  >
): typeof options &
  ComponentPublicInstanceConstructor<
    ComponentPublicInstance<
      ExtractPropTypes<PropsOptions>,
      RawBindings,
      D,
      C,
      M,
      Mixin,
      VNodeProps & ExtractPropTypes<PropsOptions, false>
    >
  >

// implementation, close to no-op
export function defineComponent(options: unknown) {
  return isFunction(options) ? { setup: options } : options
}
