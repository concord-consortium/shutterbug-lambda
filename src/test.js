const index = require('./index')
const config = require('./starter-kit/config')
const puppeteer = require('puppeteer');

(async () => {
  const testEvent = {
    'content': '<p>Hello world!</p>',
    'css': '<style>p { color: red; margin: 70px; }</style>',
    'width': '400',
    'height': '200',
    'base_url': 'http://concord.org'
  }
  const browser = await puppeteer.launch({
    headless: false,
    dumpio: !!config.DEBUG
    // use chrome installed by puppeteer
  })
  await index.run(testEvent, browser)
    .then((result) => console.log(result))
    .catch((err) => console.error(err))
  await browser.close()
})()
