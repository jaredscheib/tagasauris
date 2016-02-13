if (process.env.ENV === 'prod') {
  module.exports = {
    port: process.env.PORT || '80'
  }
} else {
  module.exports = {
    port: process.env.PORT || '65000'
  }
}