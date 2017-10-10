const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')

const bucket = 'ccshutterbug'
const s3 = new AWS.S3()

module.exports = function uploadToS3 (file) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(file)
    const key = path.basename(file)
    const params = {Bucket: bucket, Key: key, Body: stream}
    console.log('uploading', file, 'to S3 bucket...')
    s3.upload(params, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data.Location)
      }
    })
  })
}
