# Shutterbug AWS Lambda

## Production:
https://api.concord.org/shutterbug-production

## Staging:
https://api.concord.org/shutterbug-staging

## Test:

- `curl --data '{"content":"<p>Hello world!</p>","css":"<style>p { color: red; margin: 70px; }</style>","width":"400","height":"200","base_url":"http://concord.org"}' https://api.concord.org/shutterbug-production`
- `curl --data '{"url":"http://concord.org","width":1000,"height":800}' https://api.concord.org/shutterbug-production`

## Basic test

`npm run test` will run a simple test using Chrome in a regular, headless mode.

## Run local webserver

- `npm run server` starts a simple web server at `localhost:4000`. Chrome will be in headless mode. You can point Shutterbug JavaScript library to use it.
- `npm run server-non-headless` starts a simple web server at `localhost:4000`. Chrome will be in non-headless mode with 500ms slowdown. You can point Shutterbug JavaScript library to use it.

Check https://github.com/concord-consortium/shutterbug.js library and its demo pages for local testing.

## Packaging & Deploy

Shutterbug is deployed using CloudFormation template. All the changes in configuration should be done there.
You can find Shutterbug template in the dedicated repository: https://github.com/concord-consortium/cloud-formation

### Deploy new Lambda code

- Run `npm run package` to create a `package.zip` archive
- Rename it to `package-v<VERSION>.zip` and upload to [concord-devops/shutterbug-lambda](https://s3.console.aws.amazon.com/s3/buckets/concord-devops?region=us-east-1&prefix=shutterbug-lambda/) S3 bucket
- Open [Shutterbug AWS CloudFormation](https://us-east-1.console.aws.amazon.com/cloudformation)
  and look for "shutterbug" or "shutterbug-staging" stack
- Open production or staging stack, click "Update" button, and provide name of the newly uploaded Zip archive in the stack parameters
- Start the stack update and wait for it to finish (it shouldn't take long)

## Update Headless-Chrome

Chrome is provided by `@sparticuz/chromium`, a special build for the AWS Lambda environment. Each version bundles
a different version of Chrome. Updating this package along with `puppeteer-core` and `puppeteer` should be enough to use
a new version of Chrome. Note that the versions of `@sparticuz/chromium` and the `puppeteer-*` packages are strictly
related. Please see notes about this here: https://www.npmjs.com/package/@sparticuz/chromium#install

## License

MIT
