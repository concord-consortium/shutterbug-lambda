const execSync = require('child_process').execSync
const puppeteer = require('puppeteer-core')
const chromium = require('@sparticuz/chromium')
const makeSnapshot = require('./lib/make-snapshot')
const path = require('path')
const fs = require('fs').promises

const fontsDirectory = path.join(__dirname, 'fonts');

const MAX_ATTEMPTS = 5

// Sometimes Chromebooks are not sending the width and height of the screen so we need
// to use default values if they are not specified.
const DEFAULT_WIDTH = 1920/2 // half of the default width of the browser
const DEFAULT_HEIGHT = 1080/2 // half of the default height of the browser

const nonHeadless = process.env.HEADLESS === "false"
chromium.setHeadlessMode = !nonHeadless;

function getOptions (input) {
  return {
    url: input.url,
    html: input.content,
    css: input.css,
    width: Math.ceil(Number(input.width || DEFAULT_WIDTH)),
    height: Math.ceil(Number(input.height || DEFAULT_HEIGHT)),
    baseUrl: input.base_url
  }
}

function getResponse (url) {
  return {
    url: url
  }
}

async function listFontFiles(dir) {
  let fontPaths = [];
  try {
      const files = await fs.readdir(dir, { withFileTypes: true });
      for (const file of files) {
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
              fontPaths = fontPaths.concat(await listFontFiles(fullPath));  // Recurse into subdirectories
          } else if (file.name.endsWith('.ttf')) {
              fontPaths.push(fullPath);
          }
      }
  } catch (error) {
      console.error('Error reading directory:', error);
  }
  return fontPaths;
}

async function loadFonts() {
  console.time("fonts loading")
  const absoluteFontPaths = await listFontFiles(fontsDirectory)

  for (let fontPath of absoluteFontPaths) {
    try {
      await chromium.font(fontPath);
      console.log(`Font loaded: ${fontPath}`)
    } catch (error) {
      console.error(`Error loading font ${fontPath}: ${error}`)
    }
  }
  console.timeEnd("fonts loading")
}

async function getNewBrowser () {
  await loadFonts()

  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    slowMo: nonHeadless ? 500 : undefined
  })
}

let browserWSEndpoint

async function getBrowser() {
  let browser

  if (browserWSEndpoint) {
    console.log("connecting to existing browser")
    browser = await puppeteer.connect({ browserWSEndpoint })
  }
  if (!browser || !browser.isConnected()) {
    console.log("creating a new browser instance")
    browser = await getNewBrowser()

    // Keep one blank page open to keep the browser alive
    await browser.newPage()

    browserWSEndpoint = browser.wsEndpoint()
  }
  return browser
}

async function closeBrowser(browser) {
  browserWSEndpoint = null
  try {
    if (browser && browser.isConnected()) {
      await browser.close()
    }
  } catch (e) {
    // nothing to do
  }
}

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

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


    // See: https://www.pivotaltracker.com/story/show/183569475
    try {
      console.log('cleanup /tmp dir')
      execSync('rm -rf /tmp/*', { stdio: [0, 1, 2] })
      console.log('tmp size: ')
      execSync('du -sh /tmp/.', { stdio: [0, 1, 2] })
    } catch (err) {
      // Nothing to do, /tmp cleanup isn't critical.
    }

    // Input format is described here:
    // http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-input-format
    const result = await exports.run(event.path, JSON.parse(event.body))
    console.log('screenshot ready:', result)

    // Output format:
    // http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-output-format
    callback(null, {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    })
  } catch (err) {
    console.error('snapshot request failed:', err)
    callback(err)
  }
}

exports.run = async (path, inputJson) => {
  console.time("complete request processing")
  let attempt = 0
  let snapshotUrl = null
  let error = null
  let browser = null
  while (!snapshotUrl && attempt < MAX_ATTEMPTS) {
    attempt += 1
    console.log('makeSnapshot, attempt:', attempt)
    try {
      console.time("browser setup")
      browser = await getBrowser()
      console.timeEnd("browser setup")
      snapshotUrl = await makeSnapshot(getOptions(inputJson), browser)
    } catch (err) {
      console.log('error during makeSnapshot call')
      console.log(err)
      // Closing and reopening browser should make next attempt more likely to succeed
      await closeBrowser(browser)
      browser = null
      error = err
    } finally {
      if (browser) {
        browser.disconnect()
      }
    }
  }

  console.timeEnd("complete request processing")
  if (snapshotUrl) {
    return getResponse(snapshotUrl)
  } else {
    throw error
  }
}
