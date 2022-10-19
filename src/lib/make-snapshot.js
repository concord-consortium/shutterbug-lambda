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
  const baseKey = `${new Date().getTime()}-${Math.round(Math.random() * 1e6)}`
  const screenshotKey = baseKey + '.png'
  const htmlKey = baseKey + '.html'
  const content = getHtml(options.html, options.css, options.baseUrl)

  // this helps with debugging issues with snapshots.
  await uploadToS3(htmlKey, content, 'text/html')

  console.time('page setup and loading')

  const page = await browser.newPage()
  await page.setViewport({ width: options.width, height: options.height })

  if (options.url) {
    console.log('calling page.goto...')
    await page.goto(options.url, {
      timeout: 30000, // 30 seconds
      waitUntil: 'networkidle0'
    })
    console.log('page.goto done')
  } else {
    console.log('calling page.setContent')
    await page.setContent(content, {
      timeout: 30000, // 30 seconds
      waitUntil: 'networkidle0'
    })
    console.log('page.setContent done')
  }

  const buffer = await page.screenshot({ type: 'png' })
  console.log('snapshot taken')
  await page.close()
  console.log('page closed')

  console.timeEnd('page setup and loading')

  return uploadToS3(screenshotKey, buffer, 'image/png')
}
