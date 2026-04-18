const path = require('path')

const alias = {
  '@components': path.resolve(__dirname, 'src/components'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@lib': path.resolve(__dirname, 'src/lib'),
}

module.exports = {
  style: {
    postcss: {
      mode: 'file',
    },
  },
  webpack: {
    alias: {
      ...alias,
      'react-native-sqlite-storage': false,
    },
    configure: {
      resolve: {
        fallback: {
          crypto: false,
        },
      },
    },
  },
}

// Export aliases for use in the sync-paths.js script
module.exports.aliases = alias
