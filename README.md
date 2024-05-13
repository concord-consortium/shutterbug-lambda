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

## Run local web server

- `npm run server`: Starts a simple web server at `localhost:4000`. Chrome will operate in headless mode. You can configure the Shutterbug JavaScript library to use this server.
- `npm run server-non-headless`: Starts a simple web server at `localhost:4000`. Chrome will operate in non-headless mode with a 500ms slowdown. You can configure the Shutterbug JavaScript library to use this server.

Please note that the local server does not currently support Apple Silicon as of May 2024. In such cases, the recommended approach is to use GitHub Codespaces
and run the local server there. Port forwarding can be easily configured in VS Code with a single click.

For local testing, refer to the Shutterbug JavaScript library and its demo pages at [Shutterbug.js on GitHub](https://github.com/concord-consortium/shutterbug.js).

Note that running Shutterbug.js locally is often unnecessary, as its demo pages are already deployed to GitHub Pages at:
http://concord-consortium.github.io/shutterbug.js/demo/

These pages are very useful for testing the Shutterbug server. You can override the server URL by using the `?shutterbugUrl` URL parameter on any of the demo pages, for example:
- https://concord-consortium.github.io/shutterbug.js/demo/hurricane-example.html?shutterbugUrl=http://localhost:4000
- https://concord-consortium.github.io/shutterbug.js/demo/hurricane-example.html?shutterbugUrl=https://api.concord.org/shutterbug-staging

Note that more complex examples, such as Seismic Explorer or Hurricane Explorer, serve as the best tests for real-world scenarios,
which often prove to be the most challenging for the Shutterbug server.

### Configuring the Activity Player or Image Question / Labbook to use a Custom Server URL

You can use the `?shutterbugUrl=` parameter when working with snapshots in the Activity Player. 
Note that in the context of the Activity Player, snapshots can be initiated by different pages:
- Activity Player initiates snapshots when one interactive requests a snapshot of another interactive (e.g., Image Question takes a snapshot of Seismic Explorer). In this case, you need to add the `?shutterbugUrl=` parameter to the Activity Player URL in your browser window.
- Image Interactive or Labbook can initiate a snapshot of its own canvas. In this situation, you'll need to modify the Library Interactive to include the `?shutterbugUrl=` parameter.

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

## Troubleshooting

If there are reports of snapshots not working in the classroom environment, you can follow these steps:
- Open the AWS Lambda page, find the `shutterbug-production` lambda, and go to the Monitor tab to check the "Error count
  and success rate (%)." This is often a great indicator of the scale of the issues.
- Open AWS CloudWatch, then navigate to Log Groups, and look for the `shutterbug-production` group. Shutterbug provides
  extensive logging that should help identify the issue.
- It has already happened a few times that the Shutterbug lambda suddenly started failing for most of the requests
  without any changes on our side. Often, these errors appear in the logs as issues related to the `puppeteer` library
  and its communication with the web browser. In both cases, the solution was to update Chromium and the `puppeteer`
  library (see the section below). I don't have the exact reason why this happens, but I suspect there are some minor
  changes in the AWS Lambda environment that might eventually break the relatively complex dependencies of Chromium
  and Puppeteer.

## Update Chromium and Puppeteer

Chrome is provided by `@sparticuz/chromium`, a special build for the AWS Lambda environment. Each version bundles
a different version of Chrome. Updating this package along with `puppeteer-core` and `puppeteer` should be enough to use
a new version of Chrome. Note that the versions of `@sparticuz/chromium` and the `puppeteer-*` packages are strictly
related. Please see notes about this here: https://www.npmjs.com/package/@sparticuz/chromium#install

After updating both dependencies, it's useful to run the Shutterbug lambda locally and use the page at
http://concord-consortium.github.io/shutterbug.js/demo/ with an overwritten server URL (via `?shutterbugUrl`) to check
if things are working correctly.

Then, you can first deploy to `shutterbug-staging` and repeat the testing procedure with `?shutterbugUrl` pointing
to the staging server.

If everything works fine, you can finally deploy to `shutterbug-production`.

## License

MIT
