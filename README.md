# Shutterbug AWS Lambda 

This project is based on https://github.com/sambaiz/puppeteer-lambda-starter-kit (Starter Kit for running Headless-Chrome by Puppeteer on AWS Lambda).

## Beta deployment

https://fh1fzvhx93.execute-api.us-east-1.amazonaws.com/beta/make-snapshot

Test:

- `curl --data '{"content":"<p>Hello world!</p>","css":"<style>p { color: red; margin: 70px; }</style>","width":"400","height":"200","base_url":"http://concord.org"}' https://fh1fzvhx93.execute-api.us-east-1.amazonaws.com/beta/make-snapshot`
- `curl --data '{"url":"http://concord.org","width":1000,"height":800}' https://fh1fzvhx93.execute-api.us-east-1.amazonaws.com/beta/make-snapshot`

## Run on local - basic test

By executing `npm run test`, you can check the operation while actually viewing the chrome (non-headless).

## Run local webserver

`npm run server` starts a simple web server at `localhost:3000`. You can point Shutterbug JavaScript library to use it.

## Packaging & Deploy

Lambda's memory needs to be set to at least 384 MB, but the more memory, the better the performance of any operations.

```
512MB -> goto(youtube): 6.481s
1536MB(Max) -> goto(youtube): 2.154s
```

### chrome in package (recommended)

Run `npm run package`, and deploy the package.zip.

### chrome NOT in package

Due to the large size of Chrome, it may exceed the [Lambda package size limit](http://docs.aws.amazon.com/lambda/latest/dg/limits.html) (50MB) depending on the other module to include. 
In that case, put Chrome in S3 and download it at container startup so startup time will be longer.

Run `npm run package-nochrome`, deploy the package.zip, and set following env variables on Lambda.

- `CHROME_BUCKET`(required): S3 bucket where Chrome is put
- `CHROME_KEY`(optional): S3 key. default: `headless_shell.tar.gz`

### Upload package.zip to AWS Lambda using AWS CLI

Requires AWS CLI tools installed and configured.

`npm run deploy` or `npm run deploy-nochrome`

## Build Headless-Chrome (optional)

This kit includes Chrome provided by `puppeteer-lambda-starter-kit` because official build Chrome installed by Puppeteer has problems about running on Lambda (missing shared library etc.).

If you want to use latest chrome, run chrome/buildChrome.sh on EC2 having at least 16GB memory and 30GB volume. 
See also [serverless-chrome](https://github.com/adieuadieu/serverless-chrome/blob/master/chrome/README.md).
Once you build it, link to `headless_shell.tar.gz` in `chrome` dir.

## License

MIT