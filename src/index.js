const CDP = require('chrome-remote-interface')

const main = async () => {
  const url = 'http://localhost:8000'
  const client = await CDP({
    port: 9222,
    host: process.env.CHROME_HOST ?? 'localhost',
  })
  await client.Log.entryAdded(console.log)
  await client.Log.enable()
  await client.Page.enable()

  await client.Page.navigate({ url })
  await client.Page.loadEventFired()

  await client.Log.disable()
  await client.Page.disable()
  await client.close()
}

main().catch(console.error)
