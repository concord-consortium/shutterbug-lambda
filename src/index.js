const setup = require('./starter-kit/setup')
const makeSnapshot = require('./lib/make-snapshot')

function getOptions (event) {
  return {
    url: event.url,
    html: event.content,
    css: event.css,
    width: Number(event.width),
    height: Number(event.height),
    baseUrl: event.base_url
  }
}

function getResponse (url) {
  return {
    url: url
  }
}

exports.handler = async (event, context, callback) => {
  // For keeping the browser launch
  context.callbackWaitsForEmptyEventLoop = false
  const browser = await setup.getBrowser()
  exports.run(event, browser).then(
    result => callback(null, result)
  ).catch(
    err => callback(err)
  )
}

exports.run = async (event, browser) => {
  const snapshotUrl = await makeSnapshot(getOptions(event), browser)
  return getResponse(snapshotUrl)
}
