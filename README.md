# vue-next [![beta](https://img.shields.io/npm/v/vue/next.svg)](https://www.npmjs.com/package/vue/v/next) [![CircleCI](https://circleci.com/gh/vuejs/vue-next.svg?style=svg&circle-token=fb883a2d0a73df46e80b2e79fd430959d8f2b488)](https://circleci.com/gh/vuejs/vue-next)

This is the repository for Vue 3.0.

## Quickstart

- Via CDN: `<script src="https://unpkg.com/vue@next"></script>`
- In-browser playground on [Codepen](https://codepen.io/yyx990803/pen/OJNoaZL)
- Scaffold via [Vite](https://github.com/vitejs/vite):

  ```bash
  # npm
  npm init @vitejs/app
  # yarn
  yarn create @vitejs/app
  # select vue template
  ```

- Scaffold via [vue-cli](https://cli.vuejs.org/):

  ```bash
  npm install -g @vue/cli # OR yarn global add @vue/cli
  vue create hello-vue3
  # select vue 3 preset
  ```

## Changes from Vue 2

Please consult the [Migration Guide](https://v3.vuejs.org/guide/migration/introduction.html).

- Note: IE11 support is still pending.

## Supporting Libraries

All of our official libraries and tools now support Vue 3, but most of them are still in beta status and distributed under the `next` dist tag on NPM. **We are planning to stabilize and switch all projects to use the `latest` dist tag in early 2021.**

### Vue CLI

As of v4.5.0, `vue-cli` now provides built-in option to choose Vue 3 preset when creating a new project. You can upgrade `vue-cli` and run `vue create` to create a Vue 3 project today.

### Vue Router

Vue Router 4.0 provides Vue 3 support and has a number of breaking changes of its own. Check out its [Migration Guide](https://next.router.vuejs.org/guide/migration/) for full details.

- [![beta](https://img.shields.io/npm/v/vue-router/next.svg)](https://www.npmjs.com/package/vue-router/v/next)
- [GitHub](https://github.com/vuejs/vue-router-next)
- [RFCs](https://github.com/vuejs/rfcs/pulls?q=is%3Apr+is%3Amerged+label%3Arouter)

### Vuex

Vuex 4.0 provides Vue 3 support with largely the same API as 3.x. The only breaking change is [how the plugin is installed](https://github.com/vuejs/vuex/tree/4.0#breaking-changes).

- [![beta](https://img.shields.io/npm/v/vuex/next.svg)](https://www.npmjs.com/package/vuex/v/next)
- [GitHub](https://github.com/vuejs/vuex/tree/4.0)

### Devtools Extension

We are working on a new version of the Devtools with a new UI and refactored internals to support multiple Vue versions. The new version is currently in beta and only supports Vue 3 (for now). Vuex and Router integration is also work in progress.

- For Chrome: [Install from Chrome web store](https://chrome.google.com/webstore/detail/vuejs-devtools/ljjemllljcmogpfapbkkighbhhppjdbg?hl=en)

  - Note: the beta channel may conflict with the stable version of devtools so you may need to temporarily disable the stable version for the beta channel to work properly.

- For Firefox: [Download the signed extension](https://github.com/vuejs/vue-devtools/releases/tag/v6.0.0-beta.2) (`.xpi` file under Assets)

### IDE Support

It is recommended to use [VSCode](https://code.visualstudio.com/). There are currently two viable extensions for Single-File Components (SFCs) support:

- [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur) (recommended if you are used to Vetur features)
- [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (recommended if using TypeScript with SFCs, or `<script setup>` syntax)

### TypeScript Support

- All Vue 3 packages ship with types.
- [vue-tsc](https://github.com/johnsoncodehk/vue-tsc) perform TypeScript type checks / diagnostics on Vue SFCs via the command line.
- [vue-dts-gen](https://github.com/egoist/vue-dts-gen): generate TypeScript definitions from Vue SFCs.

### Other Projects

| Project               | NPM                             | Repo                 |
| --------------------- | ------------------------------- | -------------------- |
| @vue/babel-plugin-jsx | [![rc][jsx-badge]][jsx-npm]     | [[GitHub][jsx-code]] |
| eslint-plugin-vue     | [![stable][epv-badge]][epv-npm] | [[GitHub][epv-code]] |
| @vue/test-utils       | [![beta][vtu-badge]][vtu-npm]   | [[GitHub][vtu-code]] |
| vue-class-component   | [![beta][vcc-badge]][vcc-npm]   | [[GitHub][vcc-code]] |
| vue-loader            | [![beta][vl-badge]][vl-npm]     | [[GitHub][vl-code]]  |
| rollup-plugin-vue     | [![beta][rpv-badge]][rpv-npm]   | [[GitHub][rpv-code]] |

[jsx-badge]: https://img.shields.io/npm/v/@vue/babel-plugin-jsx.svg
[jsx-npm]: https://www.npmjs.com/package/@vue/babel-plugin-jsx
[jsx-code]: https://github.com/vuejs/jsx-next
[vd-badge]: https://img.shields.io/npm/v/@vue/devtools/beta.svg
[vd-npm]: https://www.npmjs.com/package/@vue/devtools/v/beta
[vd-code]: https://github.com/vuejs/vue-devtools/tree/next
[epv-badge]: https://img.shields.io/npm/v/eslint-plugin-vue.svg
[epv-npm]: https://www.npmjs.com/package/eslint-plugin-vue
[epv-code]: https://github.com/vuejs/eslint-plugin-vue
[vtu-badge]: https://img.shields.io/npm/v/@vue/test-utils/next.svg
[vtu-npm]: https://www.npmjs.com/package/@vue/test-utils/v/next
[vtu-code]: https://github.com/vuejs/vue-test-utils-next
[jsx-badge]: https://img.shields.io/npm/v/@ant-design-vue/babel-plugin-jsx.svg
[jsx-npm]: https://www.npmjs.com/package/@ant-design-vue/babel-plugin-jsx
[jsx-code]: https://github.com/vueComponent/jsx
[vcc-badge]: https://img.shields.io/npm/v/vue-class-component/next.svg
[vcc-npm]: https://www.npmjs.com/package/vue-class-component/v/next
[vcc-code]: https://github.com/vuejs/vue-class-component/tree/next
[vl-badge]: https://img.shields.io/npm/v/vue-loader/next.svg
[vl-npm]: https://www.npmjs.com/package/vue-loader/v/next
[vl-code]: https://github.com/vuejs/vue-loader/tree/next
[rpv-badge]: https://img.shields.io/npm/v/rollup-plugin-vue/next.svg
[rpv-npm]: https://www.npmjs.com/package/rollup-plugin-vue/v/next
[rpv-code]: https://github.com/vuejs/rollup-plugin-vue/tree/next
