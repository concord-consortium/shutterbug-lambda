# Shutterbug AWS Lambda

## Production:
https://fh1fzvhx93.execute-api.us-east-1.amazonaws.com/production/make-snapshot

## Staging:
https://dgjr6g3z30.execute-api.us-east-1.amazonaws.com/staging/make-snapshot

## Test:

- `curl --data '{"content":"<p>Hello world!</p>","css":"<style>p { color: red; margin: 70px; }</style>","width":"400","height":"200","base_url":"http://concord.org"}' https://fh1fzvhx93.execute-api.us-east-1.amazonaws.com/production/make-snapshot`
- `curl --data '{"url":"http://concord.org","width":1000,"height":800}' https://fh1fzvhx93.execute-api.us-east-1.amazonaws.com/production/make-snapshot`

## Basic test

`npm run test` will run a simple test using Chrome in a regular, headless mode.

## Run local webserver

- `npm run server` starts a simple web server at `localhost:4000`. Chrome will be in headless mode. You can point Shutterbug JavaScript library to use it.
- `npm run server-non-headless` starts a simple web server at `localhost:4000`. Chrome will be in non-headless mode with 500ms slowdown. You can point Shutterbug JavaScript library to use it.

Check https://github.com/concord-consortium/shutterbug.js library and its demo pages for local testing.

## Packaging & Deploy

### Build Lambda package.zip

Note that the archived Shutterbug Lambda code is slightly bigger than 50MB, so it's impossible to upload the code using
AWS CLI tools or directly in the AWS Lambda console. The archive needs to be uploaded to S3 first.

- Run `npm run package` to create a `package.zip` archive
- Rename it to `package-v<VERSION>.zip` and upload to [concord-devops/shutterbug-lambda](https://s3.console.aws.amazon.com/s3/buckets/concord-devops?region=us-east-1&prefix=shutterbug-lambda/) S3 bucket
- Open [Shutterbug AWS Lambda console](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions/shutterbug?tab=code)
  and click "Upload from" -> "Amazon S3 location". Then, provide an URL to the ZIP archive uploaded in a previous step and click "Save".

### AWS Lambda configuration

AWS Lambda's memory needs to be set to at least 384 MB, but the more memory, the better the performance of any operations.

```
512MB -> goto(youtube): 6.481s
1536MB(Max) -> goto(youtube): 2.154s
```

## Update Headless-Chrome

Chrome is provided by `chrome-aws-lambda` (special build for AWS Lambda env).
Each version bundles different Chrome version. It should enough to update these packages (+ `puppeteer-core`) to
use a new Chrome version.

## License

MIT
