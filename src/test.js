const index = require('./index')
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
      slowMo: 500,
      headless: false
    })
  }
  await index.run('/make-snapshot', testEvent, getBrowser)
    .then((result) => console.log(result))
    .catch((err) => console.error(err))
})()
