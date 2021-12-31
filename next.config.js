/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  target: "serverless",
  webpack: (config, options) => {
    const webpack = require('webpack')

    config.plugins.push(
      new webpack.ContextReplacementPlugin(/highlight.js\/lib\/languages$/, new RegExp(`^./(json)$`))
    )

    return config;
  }
}
