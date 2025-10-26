/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: true, // Changed from 'loose' to true
  },
  transpilePackages: [
    "viem",
    "wagmi",
    "@wagmi/core",
    "@wagmi/connectors",
  ],
  webpack: (config, { isServer }) => {
    // Add fallbacks for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Fix for import.meta in CJS context
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
    };

    // Externalize problematic packages that have import.meta
    if (!isServer) {
      config.externals.push(
        'pino',
        'pino-pretty', 
        'encoding', 
        'lokijs',
        '@safe-global/safe-apps-sdk',
        '@safe-global/safe-apps-provider',
        '@walletconnect/logger'
      );
    }

    return config;
  },
};

export default nextConfig;
