<template>
  <FileSelector/>
  <div class="editor-container">
    <CodeMirror @change="onChange" :value="activeCode" :mode="activeMode" />
    <Message :err="store.errors[0]" />
  </div>
</template>

<script setup lang="ts">
import FileSelector from './FileSelector.vue'
import CodeMirror from '../codemirror/CodeMirror.vue'
import Message from '../Message.vue'
import { store } from '../store'
import { debounce } from '../utils'
import { ref, watch, computed } from 'vue'

const onChange = debounce((code: string) => {
  store.activeFile.code = code
}, 250)

const activeCode = ref(store.activeFile.code)
const activeMode = computed(
  () => (store.activeFilename.endsWith('.js') ? 'javascript' : 'htmlmixed')
)

watch(
  () => store.activeFilename,
  () => {
    activeCode.value = store.activeFile.code
  }
)
</script>

<style scoped>
.editor-container {
  height: calc(100% - 35px);
  overflow: hidden;
  position: relative;
}
</style>
