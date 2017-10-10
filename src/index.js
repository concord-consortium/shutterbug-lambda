const setup = require('./starter-kit/setup')
const makeSnapshot = require('./lib/make-snapshot')

function getOptions (input) {
  return {
    url: input.url,
    html: input.content,
    css: input.css,
    width: Math.ceil(Number(input.width)),
    height: Math.ceil(Number(input.height)),
    baseUrl: input.base_url
  }
}

function getResponse (url) {
  return {
    url: url
  }
}

exports.handler = async (event, context, callback) => {
  try {
    console.log('processing request:')
    // Do not log body for now, as it can be huge (e.g. encoded canvas content).
    console.log(Object.assign({}, event, { body: '[displayed in the next log message]' }))
    console.log('request body length:', event.body.length)
    console.log('request body (first 250kB):')
    console.log(event.body.substring(0, 250000))
    // Input format is described here:
    // http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-input-format
    const path = event.path
    const inputJson = JSON.parse(event.body)
    // For keeping the browser launch
    context.callbackWaitsForEmptyEventLoop = false
    const browser = await setup.getBrowser()
    const result = await exports.run(path, inputJson, browser)
    console.log('screenshot ready:')
    console.log(result)
    // Output format:
    // http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-output-format
    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    })
  } catch (err) {
    callback(new Error(err))
  }
}

exports.run = async (path, inputJson, browser) => {
  if (path === '/make-snapshot') {
    const snapshotUrl = await makeSnapshot(getOptions(inputJson), browser)
    return getResponse(snapshotUrl)
  }
  throw new Error(`unknown path: ${path}`)
}
