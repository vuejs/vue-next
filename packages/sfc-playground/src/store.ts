import { reactive, watchEffect } from 'vue'
import {
  parse,
  compileTemplate,
  compileStyleAsync,
  compileScript,
  rewriteDefault
} from '@vue/compiler-sfc'

const welcomeCode = `
<template>
  <h1>{{ msg }}</h1>
</template>

<script setup>
const msg = 'Hello World!'
</script>
`.trim()

export const MAIN_FILE = 'App.vue'
export const COMP_IDENTIFIER = `__sfc__`

// @ts-ignore
export const SANDBOX_VUE_URL = import.meta.env.PROD
  ? '/vue.runtime.esm-browser.js' // to be copied on build
  : '/src/vue-dev-proxy'

export class File {
  filename: string
  code: string
  compiled = {
    js: '',
    css: ''
  }

  constructor(filename: string, code = '') {
    this.filename = filename
    this.code = code
  }
}

interface Store {
  files: Record<string, File>
  activeFilename: string
  readonly activeFile: File
  errors: (string | Error)[]
}

let files: Store['files'] = {}

const savedFiles = location.hash.slice(1)
if (savedFiles) {
  const saved = JSON.parse(atob(savedFiles))
  for (const filename in saved) {
    files[filename] = new File(filename, saved[filename])
  }
} else {
  files = {
    'App.vue': new File(MAIN_FILE, welcomeCode)
  }
}

export const store: Store = reactive({
  files,
  activeFilename: MAIN_FILE,
  get activeFile() {
    return store.files[store.activeFilename]
  },
  errors: []
})

watchEffect(() => compileFile(store.activeFile))

for (const file in store.files) {
  if (file !== MAIN_FILE) {
    compileFile(store.files[file])
  }
}

watchEffect(() => {
  history.replaceState({}, '', '#' + btoa(JSON.stringify(exportFiles())))
})

export function exportFiles() {
  const exported: Record<string, string> = {}
  for (const filename in store.files) {
    exported[filename] = store.files[filename].code
  }
  return exported
}

export function setActive(filename: string) {
  store.activeFilename = filename
}

export function addFile(filename: string) {
  store.files[filename] = new File(filename)
  setActive(filename)
}

export function deleteFile(filename: string) {
  if (confirm(`Are you sure you want to delete ${filename}?`)) {
    if (store.activeFilename === filename) {
      store.activeFilename = MAIN_FILE
    }
    delete store.files[filename]
  }
}

async function compileFile({ filename, code, compiled }: File) {
  if (!code.trim()) {
    return
  }

  if (filename.endsWith('.js')) {
    compiled.js = code
    return
  }

  const id = await hashId(filename)
  const { errors, descriptor } = parse(code, { filename, sourceMap: true })
  if (errors.length) {
    store.errors = errors
    return
  }

  const hasScoped = descriptor.styles.some(s => s.scoped)
  let finalCode = ''

  if (
    (descriptor.script && descriptor.script.lang) ||
    (descriptor.scriptSetup && descriptor.scriptSetup.lang) ||
    descriptor.styles.some(s => s.lang) ||
    (descriptor.template && descriptor.template.lang)
  ) {
    store.errors = [
      'lang="x" pre-processors are not supported in the in-browser playground.'
    ]
    return
  }

  // script
  if (descriptor.script || descriptor.scriptSetup) {
    try {
      const compiledScript = compileScript(descriptor, {
        id,
        refSugar: true,
        inlineTemplate: true
      })
      finalCode +=
        `\n` + rewriteDefault(compiledScript.content, COMP_IDENTIFIER)
    } catch (e) {
      store.errors = [e]
      return
    }
  } else {
    finalCode += `\nconst ${COMP_IDENTIFIER} = {}`
  }

  // template
  if (descriptor.template && !descriptor.scriptSetup) {
    const templateResult = compileTemplate({
      source: descriptor.template.content,
      filename,
      id,
      scoped: hasScoped,
      slotted: descriptor.slotted,
      isProd: false
    })
    if (templateResult.errors.length) {
      store.errors = templateResult.errors
      return
    }

    finalCode +=
      `\n` +
      templateResult.code.replace(
        /\nexport (function|const) render/,
        '$1 render'
      )
    finalCode += `\n${COMP_IDENTIFIER}.render = render`
  }
  if (hasScoped) {
    finalCode += `\n${COMP_IDENTIFIER}.__scopeId = ${JSON.stringify(
      `data-v-${id}`
    )}`
  }

  if (finalCode) {
    finalCode += `\n${COMP_IDENTIFIER}.__file = ${JSON.stringify(filename)}`
    finalCode += `\nexport default ${COMP_IDENTIFIER}`
    compiled.js = finalCode.trimStart()
  }

  // styles
  let css = ''
  for (const style of descriptor.styles) {
    if (style.module) {
      // TODO error
      continue
    }

    const styleResult = await compileStyleAsync({
      source: style.content,
      filename,
      id,
      scoped: style.scoped,
      modules: !!style.module
    })
    if (styleResult.errors.length) {
      // postcss uses pathToFileURL which isn't polyfilled in the browser
      // ignore these errors for now
      if (!styleResult.errors[0].message.includes('pathToFileURL')) {
        store.errors = styleResult.errors
      }
      // proceed even if css compile errors
    } else {
      css += styleResult.code + '\n'
    }
  }
  if (css) {
    compiled.css = css.trim()
  } else {
    compiled.css = '/* No <style> tags present */'
  }

  // clear errors
  store.errors = []
}

async function hashId(filename: string) {
  const msgUint8 = new TextEncoder().encode(filename) // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex.slice(0, 8)
}
