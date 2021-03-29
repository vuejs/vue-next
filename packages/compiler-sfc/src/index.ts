// API
export { parse } from './parse'
export { compileTemplate } from './compileTemplate'
export { compileStyle, compileStyleAsync } from './compileStyle'
export { compileScript } from './compileScript'
export { rewriteDefault } from './rewriteDefault'
export { generateCodeFrame } from '@vue/compiler-core'

// Utilities
export { parse as babelParse } from '@babel/parser'
export { walkIdentifiers } from './compileScript'
import MagicString from 'magic-string'
export { MagicString }
export { walk } from 'estree-walker'

// Types
export {
  SFCParseOptions,
  SFCDescriptor,
  SFCBlock,
  SFCTemplateBlock,
  SFCScriptBlock,
  SFCStyleBlock
} from './parse'
export {
  TemplateCompiler,
  SFCTemplateCompileOptions,
  SFCTemplateCompileResults
} from './compileTemplate'
export {
  SFCStyleCompileOptions,
  SFCAsyncStyleCompileOptions,
  SFCStyleCompileResults
} from './compileStyle'
export { SFCScriptCompileOptions } from './compileScript'
export {
  CompilerOptions,
  CompilerError,
  BindingMetadata
} from '@vue/compiler-core'
