const { Ignitor } = require('@adonisjs/core/build/standalone')

let adonisApp

module.exports = async (req, res) => {
  if (!adonisApp) {
    adonisApp = new Ignitor(process.cwd()).nodeServer()
    await adonisApp.prepare()
  }

  const handle = adonisApp.handle.bind(adonisApp)
  await handle(req, res)
}
