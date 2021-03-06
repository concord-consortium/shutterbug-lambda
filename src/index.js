const execSync = require('child_process').execSync
const chromium = require('chrome-aws-lambda')
const makeSnapshot = require('./lib/make-snapshot')

const MAX_ATTEMPTS = 5

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

async function getBrowser () {
  console.log('setting up the browser...')
  return chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: false
  })
}

exports.handler = async (event, context, callback) => {
  try {
    // For keeping the browser launch
    context.callbackWaitsForEmptyEventLoop = false

    console.log('processing request:')
    // Do not log body for now, as it can be huge (e.g. encoded canvas content).
    console.log(Object.assign({}, event, { body: '[displayed in the next log message]' }))
    console.log('request body length:', event.body.length)
    console.log('request body (first 250kB):')
    console.log(event.body.substring(0, 250000))

    console.log('cleanup /tmp dir')
    execSync('rm -rf /tmp/*', { stdio: [0, 1, 2] })
    console.log('tmp size: ')
    execSync('du -sh /tmp/.', { stdio: [0, 1, 2] })

    // Input format is described here:
    // http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-input-format
    const result = await exports.run(event.path, JSON.parse(event.body), getBrowser)
    console.log('screenshot ready:', result)

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

exports.run = async (path, inputJson, getBrowser) => {
  if (path === '/make-snapshot') {
    let attempt = 0
    let snapshotUrl = null
    let error = null
    while (!snapshotUrl && attempt < MAX_ATTEMPTS) {
      attempt += 1
      const browser = await getBrowser()
      try {
        console.log('makeSnapshot, attempt:', attempt)
        snapshotUrl = await makeSnapshot(getOptions(inputJson), browser)
      } catch (err) {
        console.log('error during makeSnapshot call')
        console.log(err)
        error = err
      } finally {
        // Close the browser. It might seem not necessary, but otherwise there are protocol errors happening after
        // a few requests. Browser launch doesn't increase processing time significantly.
        await browser.close()
      }
    }

    if (snapshotUrl) {
      return getResponse(snapshotUrl)
    } else {
      throw error
    }
  }
  throw new Error(`unknown path: ${path}`)
}
