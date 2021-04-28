import * as m from 'monaco-editor'
import { compile, CompilerError, CompilerOptions } from '@vue/compiler-dom'
import { compile as ssrCompile } from '@vue/compiler-ssr'
import { compilerOptions, initOptions, ssrMode } from './options'
import { toRaw, watchEffect } from '@vue/runtime-dom'
import { SourceMapConsumer } from 'source-map'
import theme from './theme'

declare global {
  interface Window {
    monaco: typeof m
    _deps: any
    init: () => void
  }
}

interface PersistedState {
  src: string
  ssr: boolean
  options: CompilerOptions
}

const sharedEditorOptions: m.editor.IStandaloneEditorConstructionOptions = {
  fontSize: 14,
  scrollBeyondLastLine: false,
  renderWhitespace: 'selection',
  minimap: {
    enabled: false
  }
}

window.init = () => {
  const monaco = window.monaco

  monaco.editor.defineTheme('my-theme', theme)
  monaco.editor.setTheme('my-theme')

  const persistedState: PersistedState = JSON.parse(
    decodeURIComponent(window.location.hash.slice(1)) ||
      localStorage.getItem('state') ||
      `{}`
  )

  ssrMode.value = persistedState.ssr
  Object.assign(compilerOptions, persistedState.options)

  let lastSuccessfulCode: string
  let lastSuccessfulMap: SourceMapConsumer | undefined = undefined
  function compileCode(source: string): string {
    console.clear()
    try {
      const errors: CompilerError[] = []
      const compileFn = ssrMode.value ? ssrCompile : compile
      const start = performance.now()
      const { code, ast, map } = compileFn(source, {
        filename: 'ExampleTemplate.vue',
        ...compilerOptions,
        sourceMap: true,
        onError: err => {
          errors.push(err)
        }
      })
      console.log(`Compiled in ${(performance.now() - start).toFixed(2)}ms.`)
      monaco.editor.setModelMarkers(
        editor.getModel()!,
        `@vue/compiler-dom`,
        errors.filter(e => e.loc).map(formatError)
      )
      console.log(`AST: `, ast)
      console.log(`Options: `, toRaw(compilerOptions))
      lastSuccessfulCode = code + `\n\n// Check the console for the AST`
      lastSuccessfulMap = new SourceMapConsumer(map!)
      lastSuccessfulMap!.computeColumnSpans()
    } catch (e) {
      lastSuccessfulCode = `/* ERROR: ${
        e.message
      } (see console for more info) */`
      console.error(e)
    }
    return lastSuccessfulCode
  }

  function formatError(err: CompilerError) {
    const loc = err.loc!
    return {
      severity: monaco.MarkerSeverity.Error,
      startLineNumber: loc.start.line,
      startColumn: loc.start.column,
      endLineNumber: loc.end.line,
      endColumn: loc.end.column,
      message: `Vue template compilation error: ${err.message}`,
      code: String(err.code)
    }
  }

  function reCompile() {
    const src = editor.getValue()
    // every time we re-compile, persist current state
    const state = JSON.stringify({
      src,
      ssr: ssrMode.value,
      options: compilerOptions
    } as PersistedState)
    localStorage.setItem('state', state)
    window.location.hash = encodeURIComponent(state)
    const res = compileCode(src)
    if (res) {
      output.setValue(res)
    }
  }

  const editor = monaco.editor.create(document.getElementById('source')!, {
    value: persistedState.src || `<div>Hello World!</div>`,
    language: 'html',
    ...sharedEditorOptions,
    wordWrap: 'bounded'
  })

  editor.getModel()!.updateOptions({
    tabSize: 2
  })

  const output = monaco.editor.create(document.getElementById('output')!, {
    value: '',
    language: compilerOptions.isTS ? 'typescript' : 'javascript',
    readOnly: true,
    ...sharedEditorOptions
  })
  output.getModel()!.updateOptions({
    tabSize: 2
  })

  // handle resize
  window.addEventListener('resize', () => {
    editor.layout()
    output.layout()
  })

  // update compile output when input changes
  editor.onDidChangeModelContent(debounce(reCompile))

  // highlight output code
  let prevOutputDecos: string[] = []
  function clearOutputDecos() {
    prevOutputDecos = output.deltaDecorations(prevOutputDecos, [])
  }

  editor.onDidChangeCursorPosition(
    debounce(e => {
      clearEditorDecos()
      if (lastSuccessfulMap) {
        const pos = lastSuccessfulMap.generatedPositionFor({
          source: 'ExampleTemplate.vue',
          line: e.position.lineNumber,
          column: e.position.column - 1
        })
        if (pos.line != null && pos.column != null) {
          prevOutputDecos = output.deltaDecorations(prevOutputDecos, [
            {
              range: new monaco.Range(
                pos.line,
                pos.column + 1,
                pos.line,
                pos.lastColumn ? pos.lastColumn + 2 : pos.column + 2
              ),
              options: {
                inlineClassName: `highlight`
              }
            }
          ])
          output.revealPositionInCenter({
            lineNumber: pos.line,
            column: pos.column + 1
          })
        } else {
          clearOutputDecos()
        }
      }
    }, 100)
  )

  let previousEditorDecos: string[] = []
  function clearEditorDecos() {
    previousEditorDecos = editor.deltaDecorations(previousEditorDecos, [])
  }

  output.onDidChangeCursorPosition(
    debounce(e => {
      clearOutputDecos()
      if (lastSuccessfulMap) {
        const pos = lastSuccessfulMap.originalPositionFor({
          line: e.position.lineNumber,
          column: e.position.column - 1
        })
        if (
          pos.line != null &&
          pos.column != null &&
          !// ignore mock location
          (pos.line === 1 && pos.column === 0)
        ) {
          const translatedPos = {
            column: pos.column + 1,
            lineNumber: pos.line
          }
          previousEditorDecos = editor.deltaDecorations(previousEditorDecos, [
            {
              range: new monaco.Range(
                pos.line,
                pos.column + 1,
                pos.line,
                pos.column + 1
              ),
              options: {
                isWholeLine: true,
                className: `highlight`
              }
            }
          ])
          editor.revealPositionInCenter(translatedPos)
        } else {
          clearEditorDecos()
        }
      }
    }, 100)
  )

  initOptions()
  watchEffect(() => {
    monaco.editor.setModelLanguage(
      output.getModel()!,
      compilerOptions.isTS ? 'typescript' : 'javascript'
    )
    reCompile()
  })
}

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): T {
  let prevTimer: number | null = null
  return ((...args: any[]) => {
    if (prevTimer) {
      clearTimeout(prevTimer)
    }
    prevTimer = window.setTimeout(() => {
      fn(...args)
      prevTimer = null
    }, delay)
  }) as any
}
