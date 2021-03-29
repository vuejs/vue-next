<template>
  <div class="tab-buttons">
    <button v-for="m of modes" :class="{ active: mode === m }" @click="mode = m">{{ m }}</button>
  </div>

  <div class="output-container">
    <Preview v-if="mode === 'preview'" />
    <CodeMirror
      v-else
      readonly
      :mode="mode === 'css' ? 'css' : 'javascript'"
      :value="store.activeFile.compiled[mode]"
    />
  </div>
</template>

<script setup lang="ts">
import Preview from './Preview.vue'
import CodeMirror from '../codemirror/CodeMirror.vue'
import { store } from '../store'
import { ref } from 'vue'

type Modes = 'preview' | 'js' | 'css'

const modes: Modes[] = ['preview', 'js', 'css']
const mode = ref<Modes>('preview')
</script>

<style scoped>
.output-container {
  height: calc(100% - 35px);
  overflow: hidden;
  position: relative;
}
.tab-buttons {
  box-sizing: border-box;
  border-bottom: 1px solid #ddd;
  background-color: white;
}
.tab-buttons button {
  font-size: 13px;
  font-family: var(--font-code);
  padding: 8px 16px 6px;
  text-transform: uppercase;
  color: #999;
  box-sizing: border-box;
}

button.active {
  color: var(--color-branding-dark);
  border-bottom: 3px solid var(--color-branding-dark);
}
</style>
