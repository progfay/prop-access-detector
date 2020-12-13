const CDP = require('chrome-remote-interface')
const { v4: generateUuid } = require('uuid')

// TARGET_NAME is global object in website
const TARGET_NAME = 'navigator'
// TARGET_NAME is property name of TARGET_NAME and must not include single-quote
const PROPERTY_NAME = 'userAgent'

const main = async () => {
  const url = 'http://localhost:8000'
  const uuid = generateUuid()
  const client = await CDP({
    port: 9222,
    host: process.env.CHROME_HOST ?? 'localhost',
  })
  await client.Runtime.enable()
  const unsubscribe = await client.Runtime.consoleAPICalled(message => {
    if (message?.args?.[0]?.value !== uuid) return
    console.log(
      `detect accessing property: ${TARGET_NAME}['${PROPERTY_NAME}']`,
      {
        arguments: message?.args?.[1]?.preview?.properties,
        stackTrace: message?.stackTrace?.callFrames,
      },
    )
  })

  await client.Page.enable()
  const detectingScript = await client.Page.addScriptToEvaluateOnNewDocument({
    source: `
      (function (target, prop) {
        let value = target[prop]
        const {
          get = () => value,
          set = v => {
            value = v
          },
        } = Object.getOwnPropertyDescriptor(target, prop) ?? {}
        Object.defineProperty(target, prop, {
          get: () => {
            console.trace('${uuid}', { mode: 'get', target, prop, value })
            return get()
          },
          set: v => {
            console.trace('${uuid}', { mode: 'set', target, prop, value })
            return set(v)
          },
        })
      })(${TARGET_NAME}, '${PROPERTY_NAME}')
    `,
  })
  await client.Page.navigate({ url })
  await client.Page.loadEventFired()

  unsubscribe()
  await client.Page.removeScriptToEvaluateOnNewDocument(detectingScript)
  await client.Runtime.disable()
  await client.Page.disable()
  await client.close()
}

main().catch(console.error)
