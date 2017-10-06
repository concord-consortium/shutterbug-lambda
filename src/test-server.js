const http = require('http')
const qs = require('querystring')
const puppeteer = require('puppeteer')
const index = require('./index')

const port = 3000

async function runLambdaFunc (postBody) {
  const browser = await puppeteer.launch({
    // Optional, might be useful for debugging.
    // slowMo: 250,
    headless: false
  })
  const response = await index.run(postBody, browser)
  await browser.close()
  return response
}

const requestHandler = (request, response) => {
  console.log(request.url)
  if (request.method === 'POST') {
    let body = ''
    request.on('data', function (data) {
      body += data
    })
    request.on('end', function () {
      const postBody = qs.parse(body)
      runLambdaFunc(postBody)
        .then(responseJson => {
          console.log(responseJson)
          // Set CORS headers
          response.setHeader('Access-Control-Allow-Origin', '*')
          response.setHeader('Access-Control-Request-Method', '*')
          response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
          response.setHeader('Access-Control-Allow-Headers', '*')
          response.end(JSON.stringify(responseJson))
        })
        .catch(err => {
          console.error('Request failed')
          console.error(err)
          response.end(JSON.stringify({
            error: err
          }))
        })
    })
  }
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
})
