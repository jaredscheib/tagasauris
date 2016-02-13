if (process.env.ENV === 'prod') {
  module.exports = {
    url: 'http://127.0.0.1',
    port: process.env.MQ_PORT || 3000
  }
} else {
  module.exports = {
    url: 'http://127.0.0.1',
    port: process.env.MQ_PORT || 3000
  }
}
