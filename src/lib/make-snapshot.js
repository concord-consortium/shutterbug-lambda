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
    console.log('calling page.goto...')
    // .setContent could be more appropriate method, but it doesn't support waitUntil option.
    // See: https://github.com/GoogleChrome/puppeteer/issues/728
    await page.goto(options.url ? options.url : `data:text/html,${getHtml(options.html, options.css, options.baseUrl)}`,
      {
        timeout: 300000, // 5 minutes. It's more likely AWS Lambda will kill the request after its own timeout.
        waitUntil: 'networkidle',
        networkIdleTimeout: 2500
      })
  } catch (e) {
    // Sometimes .goto might fail when some resources can't be loaded (e.g. iframe with wrong url).
    // This kind of error can be ignored.
    console.warn('page.goto error (probably navigation error):')
    console.warn(e)
  }
  console.log('page.goto done')
  const screenshotKey = `${new Date().getTime()}-${Math.round(Math.random() * 1e6)}.png`
  const buffer = await page.screenshot({ type: 'png' })
  console.log('snapshot taken')
  await page.close()
  console.log('page closed')
  return uploadToS3(screenshotKey, buffer)
}
