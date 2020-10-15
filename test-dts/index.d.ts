// This directory contains a number of d.ts assertions using tsd:
// https://github.com/SamVerschueren/tsd
// The tests checks type errors and will probably show up red in VSCode, and
// it's intended. We cannot use directives like @ts-ignore or @ts-nocheck since
// that would suppress the errors that should be caught.

import '@vue/jsx-typings'
export * from '@vue/runtime-dom'

export function describe(_name: string, _fn: () => void): void

export function expectType<T>(value: T): void
export function expectError<T>(value: T): void
export function expectAssignable<T, T2 extends T = T>(value: T2): void
