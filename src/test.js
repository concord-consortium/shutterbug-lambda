const index = require('./index')
const config = require('./starter-kit/config')
const puppeteer = require('puppeteer');

(async () => {
  const testEvent = {
    "content": "<p>Hello world!</p>",
    "css": "<style>p { color: red; margin: 70px; }</style>",
    "width": "400",
    "height": "200",
    "base_url": "http://concord.org"
  }
  const getBrowser = async () => {
    return puppeteer.launch({
      headless: false,
      dumpio: !!config.DEBUG
      // use chrome installed by puppeteer
    })
  }
  await index.run('/make-snapshot', testEvent, getBrowser)
    .then((result) => console.log(result))
    .catch((err) => console.error(err))
})()
