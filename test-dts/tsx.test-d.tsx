// TSX w/ defineComponent is tested in defineComponent.test-d.tsx
import {
  KeepAlive,
  Suspense,
  Fragment,
  Teleport,
  expectError,
  expectType
} from './index'

expectType<JSX.Element>(<div />)
expectType<JSX.Element>(<div id="foo" />)
expectType<JSX.Element>(<input value="foo" />)

// @ts-expect-error style css property validation
expectError(<div style={{ unknown: 123 }} />)

// allow array styles and nested array styles
expectType<JSX.Element>(<div style={[{ color: 'red' }]} />)
expectType<JSX.Element>(
  <div style={[{ color: 'red' }, [{ fontSize: '1em' }]]} />
)

// @ts-expect-error unknown prop
expectError(<div foo="bar" />)

// allow key/ref on arbitrary element
expectType<JSX.Element>(<div key="foo" />)
expectType<JSX.Element>(<div ref="bar" />)

expectType<JSX.Element>(
  <input
    onInput={e => {
      // infer correct event type
      expectType<EventTarget | null>(e.target)
    }}
  />
)

// built-in types
expectType<JSX.Element>(<Fragment />)
expectType<JSX.Element>(<Fragment key="1" />)

expectType<JSX.Element>(<Teleport to="#foo" />)
expectType<JSX.Element>(<Teleport to="#foo" key="1" />)

// @ts-expect-error
expectError(<Teleport />)
// @ts-expect-error
expectError(<Teleport to={1} />)

// KeepAlive
expectType<JSX.Element>(<KeepAlive include="foo" exclude={['a']} />)
expectType<JSX.Element>(<KeepAlive key="1" />)
// @ts-expect-error
expectError(<KeepAlive include={123} />)

// Suspense
expectType<JSX.Element>(<Suspense />)
expectType<JSX.Element>(<Suspense key="1" />)
expectType<JSX.Element>(
  <Suspense onResolve={() => {}} onFallback={() => {}} onPending={() => {}} />
)
// @ts-expect-error
expectError(<Suspense onResolve={123} />)
