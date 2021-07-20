import { createApp, App } from './index'

describe('plugin params inference', () => {
  const app = createApp({})
  const pluginFunction = (
    app: App,
    param1: { foo: string[] },
    param2?: boolean
  ) => {}
  const pluginObject = {
    install: (app: App, param1: { foo: string[] }, param2?: boolean) => {}
  }
  class PluginClass {
    static install(app: App, param1: { foo: string[] }, param2?: boolean) {}
  }

  // @ts-expect-error
  app.use(pluginFunction, { foo: [123] })
  // no error
  app.use(pluginFunction, { foo: ['asdf'] })

  // @ts-expect-error
  app.use(pluginObject, { foo: [123] })
  // no error
  app.use(pluginObject, { foo: ['asdf'] })

  // @ts-expect-error
  app.use(PluginClass, { foo: [123] })
  // no error
  app.use(PluginClass, { foo: ['asdf'] })
})
