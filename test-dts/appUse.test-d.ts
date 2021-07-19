import { createApp } from './index'

type App = ReturnType<typeof createApp>

type PluginAOptionType = {
  option1?: string
  option2: number
  option3: boolean
}

const PluginA = {
  install(app: App, ...options: PluginAOptionType[]) {
    options[0].option1
    options[0].option2
    options[0].option3
  }
}

const PluginB = {
  install(app: App) {}
}

const PluginC = (app: App, ...options: string[]) => {}

createApp({})
  .use(PluginA)
  // @ts-expect-error option2 and option3 (required) missing
  .use(PluginA, {})
  // @ts-expect-error type mismatch
  .use(PluginA, true)
  // @ts-expect-error type mismatch
  .use(PluginA, undefined)
  // @ts-expect-error type mismatch
  .use(PluginA, null)
  // @ts-expect-error type mismatch
  .use(PluginA, 'foo')
  // @ts-expect-error type mismatch
  .use(PluginA, 1)
  .use(PluginA, { option2: 1, option3: true })
  .use(PluginA, { option1: 'foo', option2: 1, option3: true })

  // @ts-expect-error option2 (required) missing
  .use(PluginA, { option3: true })

  .use(PluginB)
  // @ts-expect-error unexpected plugin option
  .use(PluginB, {})
  // @ts-expect-error unexpected plugin option
  .use(PluginB, true)
  // @ts-expect-error unexpected plugin option
  .use(PluginB, undefined)
  // @ts-expect-error unexpected plugin option
  .use(PluginB, null)
  // @ts-expect-error type mismatch
  .use(PluginB, 'foo')
  // @ts-expect-error type mismatch
  .use(PluginB, 1)

  .use(PluginC)
  // @ts-expect-error unexpected plugin option
  .use(PluginC, {})
  // @ts-expect-error unexpected plugin option
  .use(PluginC, true)
  // @ts-expect-error unexpected plugin option
  .use(PluginC, undefined)
  // @ts-expect-error unexpected plugin option
  .use(PluginC, null)
  .use(PluginC, 'foo')
  // @ts-expect-error type mismatch
  .use(PluginC, 1)
