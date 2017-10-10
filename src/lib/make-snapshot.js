const path = require('path')
const uploadToS3 = require('./upload-to-s3')

function getHtml (html = '', css = '', baseUrl = '') {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <base href="${baseUrl}">
        <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
        <title>content from ${baseUrl} #{date}</title>
        ${css}
        <style>
            body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `
}

module.exports = async function makesSnapshot (options, browser) {
  const page = await browser.newPage()
  await page.setViewport({width: options.width, height: options.height})
  try {
    // .setContent could be more appropriate method, but it doesn't support waitUntil option.
    // See: https://github.com/GoogleChrome/puppeteer/issues/728
    await page.goto(options.url ? options.url : `data:text/html,${getHtml(options.html, options.css, options.baseUrl)}`,
      {waitUntil: 'networkidle', networkIdleTimeout: 5000})
  } catch (e) {
    // Sometimes .goto might fail when some resources can't be loaded (e.g. iframe with wrong url).
    // This kind of error can be ignored.
    console.warn('page.goto error (probably navigation error):')
    console.warn(e)
  }
  const screenshotPath = path.join('/tmp', `${new Date().getTime()}-${Math.round(Math.random() * 1e6)}.png`)
  await page.screenshot({path: screenshotPath})
  await page.close()
  return uploadToS3(screenshotPath)
}
