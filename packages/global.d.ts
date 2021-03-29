// Global compile-time constants
declare var __DEV__: boolean
declare var __TEST__: boolean
declare var __BROWSER__: boolean
declare var __GLOBAL__: boolean
declare var __ESM_BUNDLER__: boolean
declare var __ESM_BROWSER__: boolean
declare var __NODE_JS__: boolean
declare var __COMMIT__: string
declare var __VERSION__: string

// Feature flags
declare var __FEATURE_OPTIONS_API__: boolean
declare var __FEATURE_PROD_DEVTOOLS__: boolean
declare var __FEATURE_SUSPENSE__: boolean

// for tests
declare namespace jest {
  interface Matchers<R, T> {
    toHaveBeenWarned(): R
    toHaveBeenWarnedLast(): R
    toHaveBeenWarnedTimes(n: number): R
  }
}

declare module '*.vue' {

}
declare module '*?raw' {
  const content: string
  export default content
}

declare module 'file-saver' {
  export function saveAs(blob: any, name: any): void
}
