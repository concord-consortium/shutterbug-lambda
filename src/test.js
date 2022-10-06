const index = require('./index');

(async () => {
  const testEvent = {
    "content": "<p>Hello world!</p>",
    "css": "<style>p { color: red; margin: 70px; }</style>",
    "width": "400",
    "height": "200",
    "base_url": "http://concord.org"
  }
  await index.run('/make-snapshot', testEvent)
    .then((result) => console.log(result))
    .catch((err) => console.error(err))
})()
