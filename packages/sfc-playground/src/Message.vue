<template>
  <Transition name="fade">
    <pre v-if="err || warn"
      class="msg"
      :class="err ? 'err' : 'warn'">{{ formatMessage(err || warn) }}</pre>
  </Transition>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { CompilerError } from '@vue/compiler-sfc'

defineProps(['err', 'warn'])

function formatMessage(err: string | Error): string {
  if (typeof err === 'string') {
    return err
  } else {
    let msg = err.message
    const loc = (err as CompilerError).loc
    if (loc && loc.start) {
      msg = `(${loc.start.line}:${loc.start.column}) ` + msg
    }
    return msg
  }
}
</script>

<style scoped>
.msg {
  position: absolute;
  bottom: 0;
  left: 8px;
  right: 8px;
  z-index: 10;
  padding: 14px 20px;
  border: 2px solid transparent;
  border-radius: 6px;
  font-family: var(--font-code);
  white-space: pre-wrap;
  max-height: calc(100% - 50px);
  overflow-y: scroll;
}

.msg.err {
  color: red;
  border-color: red;
  background-color: #ffd7d7;
}

.msg.warn {
  --color: rgb(105, 95, 27);
  color: var(--color);
  border-color: var(--color);
  background-color: rgb(247, 240, 205);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.15s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(0, 10px);
}
</style>
