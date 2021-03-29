<template>
  <div class="file-selector">
    <div
      v-for="(file, i) in Object.keys(store.files)"
      class="file"
      :class="{ active: store.activeFilename === file }"
      @click="setActive(file)">
      <span class="label">{{ file }}</span>
      <span v-if="i > 0" class="remove" @click.stop="deleteFile(file)">
        <svg width="12" height="12" viewBox="0 0 24 24" class="svelte-cghqrp"><line stroke="#999" x1="18" y1="6" x2="6" y2="18"></line><line stroke="#999" x1="6" y1="6" x2="18" y2="18"></line></svg>
      </span>
    </div>
    <div v-if="pending" class="file" >
      <input
        v-model="pendingFilename"
        spellcheck="false"
        @keyup.enter="doneAddFile"
        @keyup.esc="cancelAddFile"
        @vnodeMounted="focus">
    </div>
    <button class="add" @click="startAddFile">+</button>
  </div>
</template>

<script setup lang="ts">
import { store, addFile, deleteFile, setActive } from '../store'
import { ref } from 'vue'
import type { VNode } from 'vue'

const pending = ref(false)
const pendingFilename = ref('Comp.vue')

function startAddFile() {
  pending.value = true
}

function cancelAddFile() {
  pending.value = false
}

function focus({ el }: VNode) {
  (el as HTMLInputElement).focus()
}

function doneAddFile() {
  const filename = pendingFilename.value

  if (!filename.endsWith('.vue') && !filename.endsWith('.js')) {
    store.errors = [`Playground only supports .vue or .js files.`]
    return
  }

  if (filename in store.files) {
    store.errors = [`File "${filename}" already exists.`]
    return
  }

  store.errors = []
  pending.value = false
  addFile(filename)
  pendingFilename.value = 'Comp.vue'
}
</script>

<style scoped>
.file-selector {
  box-sizing: border-box;
  border-bottom: 1px solid #ddd;
  background-color: white;
}
.file {
  display: inline-block;
  font-size: 13px;
  font-family: var(--font-code);
  cursor: pointer;
  color: #999;
  box-sizing: border-box;
}
.file.active {
  color: var(--color-branding);
  border-bottom: 3px solid var(--color-branding);
  cursor: text;
}
.file span {
  display: inline-block;
  padding: 8px 10px 6px;
}
.file input {
  width: 80px;
  outline: none;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 4px 6px;
  margin-left: 6px;
}
.file .remove {
  display: inline-block;
  vertical-align: middle;
  line-height: 12px;
  cursor: pointer;
  padding-left: 0;
}
.add {
  font-size: 20px;
  font-family: var(--font-code);
  color: #999;
  vertical-align: middle;
  margin-left: 6px;
}
.add:hover {
  color: var(--color-branding);
}
</style>
