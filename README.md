# Shutterbug AWS Lambda 

## Production:
https://fh1fzvhx93.execute-api.us-east-1.amazonaws.com/production/make-snapshot

## Staging:
https://dgjr6g3z30.execute-api.us-east-1.amazonaws.com/staging/make-snapshot

## Test:

- `curl --data '{"content":"<p>Hello world!</p>","css":"<style>p { color: red; margin: 70px; }</style>","width":"400","height":"200","base_url":"http://concord.org"}' https://fh1fzvhx93.execute-api.us-east-1.amazonaws.com/production/make-snapshot`
- `curl --data '{"url":"http://concord.org","width":1000,"height":800}' https://fh1fzvhx93.execute-api.us-east-1.amazonaws.com/production/make-snapshot`

## Basic test

`npm run test` will run a simple test using Chrome in a regular, non-headless mode.

## Run local webserver

- `npm run server` starts a simple web server at `localhost:4000`. Chrome will be in regular mode, with 500ms slowdown. You can point Shutterbug JavaScript library to use it.
- `npm run server-headless` starts a simple web server at `localhost:4000`. Chrome will be in headless mode. You can point Shutterbug JavaScript library to use it.

Check https://github.com/concord-consortium/shutterbug.js library and its demo pages for local testing.

## Packaging & Deploy

### Build Lambda package.zip 

Run `npm run package`, and deploy the package.zip using AWS Lambda CLI or website.

### Upload package.zip to AWS Lambda using AWS CLI

Requires AWS CLI tools installed and configured.

`npm run deploy-staging` or `npm run deploy-production`

These scripts perform a full build process, packaging and finally upload archive to AWS.

AWS Lambda's memory needs to be set to at least 384 MB, but the more memory, the better the performance of any operations.

```
512MB -> goto(youtube): 6.481s
1536MB(Max) -> goto(youtube): 2.154s
```

## Update Headless-Chrome

Chrome is provided by `chrome-aws-lambda` (special build for AWS Lambda env) and `puppeteer` packages (local testing).
Each version bundles different Chrome version. It should enough to update these packages (+ `puppeteer-core`) to 
use a new Chrome version.

## License

MIT
