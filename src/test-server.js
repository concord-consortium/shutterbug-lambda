const http = require('http')
const index = require('./index')

const port = 4000

async function runLambdaFunc (path, postBody) {
  return index.run(path, postBody)
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
          response.setHeader('Access-Control-Allow-Origin', '*')
          response.setHeader('Content-Type', 'application/json')
          response.statusCode = 500
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
