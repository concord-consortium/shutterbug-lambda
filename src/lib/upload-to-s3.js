'use strict';
const { Upload } = require('@aws-sdk/lib-storage')
const { S3 } = require('@aws-sdk/client-s3')
const fs = require('fs')

const bucket = 'ccshutterbug'
const s3 = new S3()

// This might seem overcomplicated, but  S3 upload seems to randomly get stuck once in a while.
// See: https://www.pivotaltracker.com/story/show/183543485
const MAX_ATTEMPTS = 5
const BASE_TIMEOUT = 3500 // usually S3 upload takes around ~100ms, so that's plenty of time

module.exports = async function uploadToS3 (key, buffer, contentType) {
  // Uncomment this and comment out the rest of the code below to save files
  // locally without setting up S3 credentials
  // fs.writeFileSync(key, buffer);
  // return key;
  console.log('uploading', key, 'to S3 bucket...')
  console.time('upload to s3')

  let attempt = 0
  let objectLocation = null
  let error

  while (!objectLocation && attempt < MAX_ATTEMPTS) {
    try {
      attempt += 1
      console.log(`s3 upload attempt: ${attempt}`)
      const managedUpload = new Upload({
        client: s3,
        params: {
          Bucket: bucket,
          Key: key,
          ContentType: contentType,
          Body: buffer
        }
      })

      const timeoutId = setTimeout(function () {
        managedUpload.abort()
      }, BASE_TIMEOUT * Math.sqrt(attempt))

      const uploadResult = await managedUpload.done()
      objectLocation = uploadResult.Location

      clearTimeout(timeoutId)
    } catch (err) {
      error = err
    }
  }

  console.timeEnd('upload to s3')

  if (objectLocation) {
    return objectLocation
  } else {
    throw error
  }
}
