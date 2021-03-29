import fs from 'fs'
import path from 'path'
import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import execa from 'execa'

const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)

export default defineConfig({
  plugins: [vue(), copyVuePlugin()],
  define: {
    __COMMIT__: JSON.stringify(commit)
  },
  optimizeDeps: {
    exclude: ['consolidate']
  }
})

function copyVuePlugin(): Plugin {
  return {
    name: 'copy-vue',
    generateBundle() {
      const filePath = path.resolve(
        __dirname,
        '../vue/dist/vue.runtime.esm-browser.js'
      )
      if (!fs.existsSync(filePath)) {
        throw new Error(
          `vue.runtime.esm-browser.js not built. ` +
            `Run "yarn build vue -f esm-browser" first.`
        )
      }
      this.emitFile({
        type: 'asset',
        fileName: 'vue.runtime.esm-browser.js',
        source: fs.readFileSync(filePath, 'utf-8')
      })
    }
  }
}
