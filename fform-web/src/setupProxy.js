const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000',
      // target: 'http://47.102.205.15',
      changeOrigin: false,
    }),
  )
}
