<template>
  <Header />
  <div class="wrapper">
    <SplitPane>
      <template #left>
        <Editor />
      </template>
      <template #right>
        <Output />
      </template>
    </SplitPane>
  </div>
</template>

<script setup lang="ts">
import Header from './Header.vue'
import SplitPane from './SplitPane.vue'
import Editor from './editor/Editor.vue'
import Output from './output/Output.vue'
</script>

<style>
body {
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: #444;
  margin: 0;
  background-color: #f8f8f8;
  --nav-height: 50px;
  --font-code: 'Source Code Pro', monospace;
  --color-branding: #3ca877;
  --color-branding-dark: #416f9c;
}

.wrapper {
  height: calc(100vh - var(--nav-height));
}

button {
  border: none;
  outline: none;
  cursor: pointer;
  margin: 0;
  background-color: transparent;
}
</style>
