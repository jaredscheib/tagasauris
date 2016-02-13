if (process.env.ENV === 'prod') {
  module.exports = {
    port: '80'
  }
} else {
  module.exports = {
    port: '65000'
  }
}