const http = require('http')
const puppeteer = require('puppeteer')
const index = require('./index')

const port = 3000

async function runLambdaFunc (path, postBody) {
  const getBrowser = async () => {
    return puppeteer.launch({
      // Optional, might be useful for debugging.
      // slowMo: 250,
      headless: false
    })
  }
  return index.run(path, postBody, getBrowser)
}

const requestHandler = (request, response) => {
  console.log(request.method, request.url)
  if (request.method === 'POST') {
    let body = ''
    request.on('data', function (data) {
      body += data
    })
    request.on('end', function () {
      const postBody = JSON.parse(body)
      runLambdaFunc(request.url, postBody)
        .then(responseJson => {
          console.log('RESPONSE:', responseJson)
          // Set CORS headers
          response.setHeader('Access-Control-Allow-Origin', '*')
          response.setHeader('Content-Type', 'application/json')
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
