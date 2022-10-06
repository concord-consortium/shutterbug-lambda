const AWS = require('aws-sdk')

const bucket = 'ccshutterbug'
const s3 = new AWS.S3()

module.exports = function uploadToS3 (key, buffer, contentType) {
  return new Promise((resolve, reject) => {
    console.log('uploading', key, 'to S3 bucket...')
    console.time("upload to s3")
    s3.upload({ Bucket: bucket, Key: key,
      ContentType: contentType, Body: buffer }, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data.Location)
      }
      console.timeEnd("upload to s3")
    })
  })
}
