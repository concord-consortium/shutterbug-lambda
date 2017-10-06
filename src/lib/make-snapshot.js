const path = require('path')
const uploadToS3 = require('./upload-to-s3')

// Small margin added to the browser window, so we avoid unnecessary scrollbars.
const MARGIN = 10 // px

function getHtml (html = '', css = '', baseUrl = '') {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <base href="${baseUrl}">
        <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
        <title>content from ${baseUrl} #{date}</title>
        ${css}
      </head>
      <body>
        ${html}
      </body>
    </html>
  `
}

module.exports = async function makesSnapshot (options, browser) {
  const page = await browser.newPage()
  await page.setViewport({width: options.width + MARGIN, height: options.height + MARGIN})
  if (options.html) {
    await page.setContent(getHtml(options.html, options.css, options.baseUrl))
  } else {
    await page.goto(options.url, {waitUntil: 'networkidle', networkIdleTimeout: 1000})
  }
  const screenshotPath = path.join('/tmp', `${new Date().getTime()}-${Math.round(Math.random() * 1e6)}.png`)
  await page.screenshot({path: screenshotPath})
  await page.close()
  return uploadToS3(screenshotPath)
}
