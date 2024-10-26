/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove or comment out the output: 'export' line if it exists
  // output: 'export',

  // Add any other necessary configuration
  images: {
    domains: ["localhost"],
  },

  webpack: (config) => {
    // Enable WebAssembly
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
      topLevelAwait: true,
    }

    // Handle WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
      generator: {
        filename: "static/wasm/[hash][ext][query]",
      },
    })

    // Handle worker files
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: {
        loader: "worker-loader",
        options: {
          filename: "static/[hash].worker.js",
          publicPath: "/_next/",
        },
      },
    })

    config.resolve.fallback = {
      fs: false,
      path: false,
      crypto: false,
      worker_threads: false,
    }

    return config
  },

  // Required headers for WebAssembly
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
