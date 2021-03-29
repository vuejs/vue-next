<template>
  <iframe
    id="preview"
    ref="iframe"
    sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
    :srcdoc="srcdoc"
  ></iframe>
  <Message :err="runtimeError" />
  <Message v-if="!runtimeError" :warn="runtimeWarning" />
</template>

<script setup lang="ts">
import Message from '../Message.vue'
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'
import srcdoc from './srcdoc.html?raw'
import { PreviewProxy } from './PreviewProxy'
import { MAIN_FILE, SANDBOX_VUE_URL } from '../store'
import { compileModulesForPreview } from './moduleCompiler'

const iframe = ref()
const runtimeError = ref()
const runtimeWarning = ref()

let proxy: PreviewProxy

async function updatePreview() {
  runtimeError.value = null
  runtimeWarning.value = null
  try {
    const modules = compileModulesForPreview()
    console.log(`successfully compiled ${modules.length} modules.`)
    // reset modules
    await proxy.eval([
      `window.__modules__ = {};window.__css__ = ''`,
      ...modules,
      `
import { createApp as _createApp } from "${SANDBOX_VUE_URL}"

if (window.__app__) {
  window.__app__.unmount()
  document.getElementById('app').innerHTML = ''
}

document.getElementById('__sfc-styles').innerHTML = window.__css__
const app = window.__app__ = _createApp(__modules__["${MAIN_FILE}"].default)
app.config.errorHandler = e => console.error(e)
app.mount('#app')`.trim()
    ])
  } catch (e) {
    runtimeError.value = e.stack
  }
}

onMounted(() => {
  proxy = new PreviewProxy(iframe.value, {
    on_fetch_progress: (progress: any) => {
      // pending_imports = progress;
    },
    on_error: (event: any) => {
      runtimeError.value = event.value
    },
    on_unhandled_rejection: (event: any) => {
      let error = event.value
      if (typeof error === 'string') error = { message: error }
      runtimeError.value = 'Uncaught (in promise): ' + error.message
    },
    on_console: (log: any) => {
      if (log.level === 'error') {
        if (log.args[0] instanceof Error) {
          runtimeError.value = log.args[0].stack
        } else {
          runtimeError.value = log.args
        }
      } else if (log.level === 'warn') {
        if (log.args[0].toString().includes('[Vue warn]')) {
          runtimeWarning.value = log.args
            .join('')
            .replace(/\[Vue warn\]:/, '')
            .trim()
        }
      }
    },
    on_console_group: (action: any) => {
      // group_logs(action.label, false);
    },
    on_console_group_end: () => {
      // ungroup_logs();
    },
    on_console_group_collapsed: (action: any) => {
      // group_logs(action.label, true);
    }
  })

  iframe.value.addEventListener('load', () => {
    proxy.handle_links()
    watchEffect(updatePreview)
  })
})

onUnmounted(() => {
  proxy.destroy()
})
</script>

<style>
iframe {
  width: 100%;
  height: 100%;
  border: none;
  background-color: #fff;
}
</style>
