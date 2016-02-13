if (process.env.ENV === 'prod') {
  module.exports = {
    url: 'http://localhost',
    port: process.env.MQ_PORT || 3000
  }
} else {
  module.exports = {
    url: 'http://localhost',
    port: process.env.MQ_PORT || 3000
  }
}
